#!/usr/bin/env bash
# Deploy the MacBook-hosted Postgres + NestJS API without touching GitHub Pages.
set -Eeuo pipefail
IFS=$'\n\t'
umask 077

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SCRIPT_PATH="$SCRIPT_DIR/$(basename "${BASH_SOURCE[0]}")"
API_DIR="$ROOT_DIR/api"
API_ENV_FILE="$API_DIR/.env"
FRONTEND_ORIGIN="${PT_FRONTEND_ORIGIN:-https://minihale.github.io}"

DEPLOY_MODE="${PT_DEPLOY_MODE:-auto}"
DEPLOY_BRANCH="${PT_DEPLOY_BRANCH:-main}"
SKIP_PULL="${PT_DEPLOY_SKIP_PULL:-0}"
SKIP_PUBLIC_CHECK="${PT_DEPLOY_SKIP_PUBLIC_CHECK:-0}"
CHECK_ONLY=0

DB_CONTAINER="phongthanh-db"
DB_USER="phongthanh"
DB_NAME="phongthanh"
BACKUP_DIR="$HOME/phongthanh-backups"
BACKUP_FILE="${PT_DEPLOY_BACKUP_FILE:-}"
BACKUP_TMP=""
BACKUP_VERIFIED="${PT_DEPLOY_BACKUP_VERIFIED:-0}"

LAUNCH_LABEL="com.phongthanh.admin-api"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
LAUNCH_PLIST="$LAUNCH_AGENTS_DIR/$LAUNCH_LABEL.plist"
LOG_DIR="$HOME/Library/Logs/phongthanh-admin"

LOCK_DIR="${PT_DEPLOY_LOCK_DIR:-${TMPDIR:-/tmp}/phongthanh-admin-api-deploy.lock}"
REEXEC_MARKER="$LOCK_DIR/reexec-state"
LOCK_OWNER=0
RESOLVED_MODE=""
API_PORT="3210"
API_STOPPED=0
DEPENDENCIES_INSTALLED=0

usage() {
  cat <<'EOF'
Usage: ./scripts/macbook-api-deploy.sh [options]

Deploy Docker Postgres and the host-run NestJS API on macOS. The script never
builds, triggers, or deploys the GitHub Pages frontend.

Modes:
  --auto             Detect first run vs update from existing DB state (default)
  --first-run        Bootstrap a new MacBook installation
  --update           Require an existing database and run the update flow

Options:
  --branch NAME      Release branch to fetch/pull (default: main)
  --skip-pull        Deploy the current checked-out commit without Git updates
  --skip-public-check
                     Verify local API only; skip stable ngrok URL checks
  --check            Run non-mutating prerequisite/configuration checks only
  -h, --help         Show this help

First-run secrets:
  If api/.env is missing, JWT secrets are generated automatically. Set
  INITIAL_ADMIN_PASSWORD in the environment or run interactively to enter it
  without echo. The generated api/.env is chmod 600 and remains gitignored.

Optional public verification:
  Set PUBLIC_API_URL (or API_URL), or authenticate gh with the repository
  variable API_URL configured. The script only verifies the existing stable
  ngrok URL; it does not rotate the URL or deploy the frontend.
EOF
}

log() {
  printf '==> %s\n' "$*"
}

warn() {
  printf 'WARNING: %s\n' "$*" >&2
}

die() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

parse_args() {
  while (($# > 0)); do
    case "$1" in
      --auto)
        DEPLOY_MODE="auto"
        ;;
      --first-run)
        DEPLOY_MODE="first-run"
        ;;
      --update)
        DEPLOY_MODE="update"
        ;;
      --branch)
        (($# >= 2)) || die "--branch requires a branch name"
        DEPLOY_BRANCH="$2"
        shift
        ;;
      --skip-pull)
        SKIP_PULL=1
        ;;
      --skip-public-check)
        SKIP_PUBLIC_CHECK=1
        ;;
      --check)
        CHECK_ONLY=1
        ;;
      -h | --help)
        usage
        exit 0
        ;;
      *)
        die "Unknown option: $1"
        ;;
    esac
    shift
  done

  case "$DEPLOY_MODE" in
    auto | first-run | update) ;;
    *) die "Invalid deploy mode: $DEPLOY_MODE" ;;
  esac

  [[ "$SKIP_PULL" == "0" || "$SKIP_PULL" == "1" ]] ||
    die "PT_DEPLOY_SKIP_PULL must be 0 or 1"
  [[ "$SKIP_PUBLIC_CHECK" == "0" || "$SKIP_PUBLIC_CHECK" == "1" ]] ||
    die "PT_DEPLOY_SKIP_PUBLIC_CHECK must be 0 or 1"
  [[ "$BACKUP_VERIFIED" == "0" || "$BACKUP_VERIFIED" == "1" ]] ||
    die "PT_DEPLOY_BACKUP_VERIFIED must be 0 or 1"
  [[ "$LOCK_DIR" == "${TMPDIR:-/tmp}/phongthanh-admin-api-deploy.lock" ]] ||
    die "Deploy lock path must stay inside the task-specific temporary directory"
  [[ "${PT_DEPLOY_REEXEC:-0}" == "0" || "${PT_DEPLOY_REEXEC:-0}" == "1" ]] ||
    die "PT_DEPLOY_REEXEC must be 0 or 1"
  if [[ "${PT_DEPLOY_REEXEC:-0}" == "1" ]]; then
    [[ "${PT_DEPLOY_LOCK_HELD:-0}" == "1" ]] ||
      die "Re-execution requires the inherited deploy lock"
  else
    [[ "${PT_DEPLOY_LOCK_HELD:-0}" != "1" ]] ||
      die "Inherited deploy lock is valid only during internal re-execution"
    [[ -z "$BACKUP_FILE" && "$BACKUP_VERIFIED" == "0" ]] ||
      die "Internal backup state cannot be supplied on an initial invocation"
  fi
}

release_lock() {
  if [[ "$LOCK_OWNER" == "1" && -d "$LOCK_DIR" ]]; then
    rm -f "$REEXEC_MARKER"
    rm -f "$LOCK_DIR/pid"
    rmdir "$LOCK_DIR" 2>/dev/null || true
  fi
  if [[ -n "$BACKUP_TMP" && -f "$BACKUP_TMP" ]]; then
    rm -f "$BACKUP_TMP"
  fi
}

on_error() {
  local status=$?
  local line="${BASH_LINENO[0]:-unknown}"
  printf 'ERROR: deployment failed near line %s (exit %s).\n' "$line" "$status" >&2
  if [[ "$BACKUP_VERIFIED" == "1" && -n "$BACKUP_FILE" ]]; then
    printf 'Verified backup: %s\n' "$BACKUP_FILE" >&2
  fi
  if [[ "$API_STOPPED" == "1" ]]; then
    printf 'The API was stopped; inspect logs and rerun after fixing the failure.\n' >&2
  fi
  exit "$status"
}

acquire_lock() {
  local lock_pid=""

  if [[ "${PT_DEPLOY_LOCK_HELD:-0}" == "1" ]]; then
    [[ -f "$LOCK_DIR/pid" ]] || die "Inherited deploy lock is missing"
    lock_pid="$(<"$LOCK_DIR/pid")"
    [[ "$lock_pid" == "$$" ]] || die "Inherited deploy lock belongs to PID $lock_pid"
    LOCK_OWNER=1
    return
  fi

  if mkdir "$LOCK_DIR" 2>/dev/null; then
    printf '%s\n' "$$" >"$LOCK_DIR/pid"
    LOCK_OWNER=1
    return
  fi

  if [[ -f "$LOCK_DIR/pid" ]]; then
    lock_pid="$(<"$LOCK_DIR/pid")"
  fi
  if [[ "$lock_pid" =~ ^[0-9]+$ ]] && kill -0 "$lock_pid" 2>/dev/null; then
    die "Another deployment is running with PID $lock_pid"
  fi

  warn "Removing stale deploy lock at $LOCK_DIR"
  rm -f "$REEXEC_MARKER"
  rm -f "$LOCK_DIR/pid"
  rmdir "$LOCK_DIR" 2>/dev/null || die "Cannot remove stale deploy lock"
  mkdir "$LOCK_DIR"
  printf '%s\n' "$$" >"$LOCK_DIR/pid"
  LOCK_OWNER=1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

check_prerequisites() {
  [[ "$(uname -s)" == "Darwin" ]] || die "This deployment script supports macOS only"
  [[ "$(id -u)" != "0" ]] || die "Run as the logged-in Mac user, not root"

  local command_name
  for command_name in git node npm docker curl openssl launchctl lsof plutil awk sed stat ps; do
    require_command "$command_name"
  done

  local node_major
  node_major="$(node --version | sed -E 's/^v([0-9]+).*/\1/')"
  [[ "$node_major" == "24" ]] || die "Node.js 24 is required; found $(node --version)"

  docker info >/dev/null 2>&1 ||
    die "Docker Desktop is not running; start it and retry"
  docker compose version >/dev/null 2>&1 || die "Docker Compose v2 is required"

  [[ -d "$ROOT_DIR/.git" ]] || die "Repository metadata not found at $ROOT_DIR"
  [[ "$(git -C "$ROOT_DIR" rev-parse --show-toplevel)" == "$ROOT_DIR" ]] ||
    die "Script must run from the phongthanh-admin repository"
  git check-ref-format --branch "$DEPLOY_BRANCH" >/dev/null 2>&1 ||
    die "Invalid branch name: $DEPLOY_BRANCH"

  launchctl print "gui/$(id -u)" >/dev/null 2>&1 ||
    die "No logged-in macOS GUI session is available for the LaunchAgent"
}

require_clean_worktree() {
  local changes
  changes="$(git -C "$ROOT_DIR" status --porcelain --untracked-files=all)"
  [[ -z "$changes" ]] || {
    printf '%s\n' "$changes" >&2
    die "Worktree must be clean; preserve or commit local changes before deploying"
  }
}

compose_db_volume_name() {
  docker compose -f "$ROOT_DIR/docker-compose.yml" config --format json |
    node -e '
      let input = ""
      process.stdin.on("data", (chunk) => (input += chunk))
      process.stdin.on("end", () => {
        const config = JSON.parse(input)
        const name = config.volumes?.pgdata?.name
        if (!name) process.exit(1)
        process.stdout.write(name)
      })
    '
}

compose_db_volume_exists() {
  local volume_name
  volume_name="$(compose_db_volume_name)"
  docker volume inspect "$volume_name" >/dev/null 2>&1
}

database_exists() {
  docker container inspect "$DB_CONTAINER" >/dev/null 2>&1 || compose_db_volume_exists
}

assert_no_conflicting_compose_services() {
  local container_name
  local running
  for container_name in phongthanh-api phongthanh-web; do
    running="$(docker inspect -f '{{.State.Running}}' "$container_name" 2>/dev/null || true)"
    [[ "$running" != "true" ]] ||
      die "$container_name is running; stop Compose api/web before host API deployment"
  done
}

resolve_mode() {
  local exists=0
  if database_exists; then
    exists=1
  fi

  case "$DEPLOY_MODE" in
    auto)
      if [[ "$exists" == "1" ]]; then
        RESOLVED_MODE="update"
      else
        RESOLVED_MODE="first-run"
      fi
      ;;
    first-run)
      RESOLVED_MODE="first-run"
      ;;
    update)
      [[ "$exists" == "1" ]] || die "Update mode requires an existing database"
      RESOLVED_MODE="update"
      ;;
  esac

  log "Deployment mode: $RESOLVED_MODE"
}

wait_for_database() {
  local status=""

  for _ in {1..60}; do
    status="$(
      docker inspect \
        -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
        "$DB_CONTAINER" 2>/dev/null || true
    )"
    if [[ "$status" == "healthy" ]]; then
      return
    fi
    if [[ "$status" == "exited" || "$status" == "dead" ]]; then
      docker compose -f "$ROOT_DIR/docker-compose.yml" logs --tail=80 db >&2 || true
      die "Postgres container stopped with status $status"
    fi
    sleep 1
  done

  docker compose -f "$ROOT_DIR/docker-compose.yml" logs --tail=80 db >&2 || true
  die "Postgres did not become healthy after 60 seconds (last status: ${status:-missing})"
}

ensure_database_running() {
  log "Starting the Docker Postgres service"
  docker compose -f "$ROOT_DIR/docker-compose.yml" up -d db
  wait_for_database

  local published_port
  published_port="$(docker port "$DB_CONTAINER" 5432/tcp 2>/dev/null || true)"
  [[ "$published_port" == "127.0.0.1:5434" ]] ||
    die "Postgres must bind only to 127.0.0.1:5434; found ${published_port:-no mapping}"
}

backup_database() {
  mkdir -p "$BACKUP_DIR"
  chmod 700 "$BACKUP_DIR"

  local timestamp
  timestamp="$(date +%Y%m%d-%H%M%S)"
  BACKUP_FILE="$BACKUP_DIR/phongthanh-$timestamp-$$.dump"
  BACKUP_TMP="$BACKUP_FILE.partial"
  BACKUP_VERIFIED=0

  log "Creating database backup at $BACKUP_FILE"
  docker exec "$DB_CONTAINER" \
    pg_dump -U "$DB_USER" -d "$DB_NAME" --format=custom >"$BACKUP_TMP"
  [[ -s "$BACKUP_TMP" ]] || die "Database backup is empty"
  docker exec -i "$DB_CONTAINER" pg_restore --list <"$BACKUP_TMP" >/dev/null
  chmod 600 "$BACKUP_TMP"
  mv "$BACKUP_TMP" "$BACKUP_FILE"
  BACKUP_TMP=""
  BACKUP_VERIFIED=1
  log "Database backup verified"
}

write_reexec_marker() {
  {
    printf 'mode=%s\n' "$RESOLVED_MODE"
    printf 'backup=%s\n' "$BACKUP_FILE"
    printf 'verified=%s\n' "$BACKUP_VERIFIED"
  } >"$REEXEC_MARKER"
  chmod 600 "$REEXEC_MARKER"
}

validate_reexec_state() {
  [[ -f "$REEXEC_MARKER" ]] || die "Re-execution marker is missing"

  local marker_mode
  local marker_backup
  local marker_verified
  marker_mode="$(sed -n 's/^mode=//p' "$REEXEC_MARKER")"
  marker_backup="$(sed -n 's/^backup=//p' "$REEXEC_MARKER")"
  marker_verified="$(sed -n 's/^verified=//p' "$REEXEC_MARKER")"

  [[ "$marker_mode" == "$RESOLVED_MODE" ]] || die "Re-execution mode does not match its lock marker"
  [[ "$marker_backup" == "$BACKUP_FILE" ]] || die "Re-execution backup does not match its lock marker"
  [[ "$marker_verified" == "$BACKUP_VERIFIED" ]] ||
    die "Re-execution backup status does not match its lock marker"

  if [[ "$RESOLVED_MODE" == "update" ]]; then
    [[ "$BACKUP_VERIFIED" == "1" && -s "$BACKUP_FILE" ]] ||
      die "Re-executed update is missing its verified database backup"
    [[ "$BACKUP_FILE" == "$BACKUP_DIR"/phongthanh-*.dump ]] ||
      die "Re-execution backup must be inside $BACKUP_DIR"
  fi
}

pull_and_reexec() {
  log "Fetching and fast-forwarding origin/$DEPLOY_BRANCH"
  git -C "$ROOT_DIR" fetch origin "$DEPLOY_BRANCH"
  git -C "$ROOT_DIR" switch "$DEPLOY_BRANCH"
  git -C "$ROOT_DIR" pull --ff-only origin "$DEPLOY_BRANCH"
  require_clean_worktree

  write_reexec_marker
  log "Re-executing the pulled deployment script"
  exec env \
    PT_DEPLOY_REEXEC=1 \
    PT_DEPLOY_LOCK_HELD=1 \
    PT_DEPLOY_MODE="$RESOLVED_MODE" \
    PT_DEPLOY_BRANCH="$DEPLOY_BRANCH" \
    PT_DEPLOY_SKIP_PULL=1 \
    PT_DEPLOY_SKIP_PUBLIC_CHECK="$SKIP_PUBLIC_CHECK" \
    PT_DEPLOY_BACKUP_FILE="$BACKUP_FILE" \
    PT_DEPLOY_BACKUP_VERIFIED="$BACKUP_VERIFIED" \
    PT_DEPLOY_LOCK_DIR="$LOCK_DIR" \
    /bin/bash "$SCRIPT_PATH"
}

dotenv_quote() {
  printf '\140%s\140' "$1"
}

api_validation_runtime_ready() {
  [[ -x "$API_DIR/node_modules/.bin/tsx" ]] &&
    [[ -f "$API_DIR/node_modules/dotenv/package.json" ]] &&
    [[ -f "$API_DIR/node_modules/zod/package.json" ]]
}

api_runtime_active() {
  local service_target
  service_target="gui/$(id -u)/$LAUNCH_LABEL"
  launchctl print "$service_target" >/dev/null 2>&1 || [[ -n "$(listener_pids)" ]]
}

prepare_api_validation_runtime() {
  api_validation_runtime_ready && return
  [[ "$CHECK_ONLY" == "0" ]] ||
    die "API dependencies are required for exact environment validation"
  api_runtime_active &&
    die "API dependencies are incomplete while the managed API is active; repair them before deploying"

  log "Installing locked API dependencies for environment validation"
  npm --prefix "$API_DIR" ci --include=dev
  DEPENDENCIES_INSTALLED=1
}

validate_api_env_values() {
  (
    cd "$API_DIR"
    # TypeScript template literals must remain inside the quoted program.
    # shellcheck disable=SC2016
    ./node_modules/.bin/tsx -e '
      import { readFileSync } from "node:fs"
      import { parse } from "dotenv"
      import { loadEnv } from "./src/config/env"

      const [envFile, expectedOrigin] = process.argv.slice(1)
      const fail = (message) => {
        throw new Error(message)
      }

      try {
        const raw = parse(readFileSync(envFile, "utf8"))
        const requiredKeys = [
          "DATABASE_URL",
          "JWT_SECRET",
          "JWT_REFRESH_SECRET",
          "INITIAL_ADMIN_PASSWORD",
          "PORT",
          "CORS_ORIGIN",
          "TRUST_PROXY_HOPS",
          "AUTH_LOGIN_RATE_LIMIT_MAX",
          "AUTH_LOGIN_RATE_LIMIT_WINDOW_MS",
          "AUTH_REFRESH_RATE_LIMIT_MAX",
          "AUTH_REFRESH_RATE_LIMIT_WINDOW_MS",
          "API_RATE_LIMIT_MAX",
          "API_RATE_LIMIT_WINDOW_MS",
          "REFRESH_COOKIE_SAME_SITE",
        ]

        for (const key of requiredKeys) {
          if (!raw[key]) fail(`${key} is missing or empty in ${envFile}`)
        }
        for (const [key, value] of Object.entries(raw)) {
          if (/^<[^<>]+>$/.test(value.trim())) {
            fail(`${key} still contains a placeholder in ${envFile}`)
          }
        }

        const env = loadEnv(raw)
        if (env.JWT_SECRET === env.JWT_REFRESH_SECRET) {
          fail("JWT_SECRET and JWT_REFRESH_SECRET must be different")
        }
        if (!raw.INITIAL_ADMIN_PASSWORD || raw.INITIAL_ADMIN_PASSWORD.length < 12) {
          fail("INITIAL_ADMIN_PASSWORD must contain at least 12 characters")
        }
        if (/\r|\n/.test(raw.INITIAL_ADMIN_PASSWORD)) {
          fail("INITIAL_ADMIN_PASSWORD cannot contain newlines")
        }
        if (!/^postgres(?:ql)?:\/\/[^/\s]+@(?:localhost|127\.0\.0\.1):5434\/phongthanh(?:\?[^\s]*)?$/.test(env.DATABASE_URL)) {
          fail("DATABASE_URL must target the backed-up Docker DB at localhost:5434/phongthanh")
        }

        const origins = [env.CORS_ORIGIN, env.CORS_ADDITIONAL_ORIGINS]
          .flatMap((value) => value?.split(",") ?? [])
          .map((value) => value.trim())
          .filter(Boolean)
        if (!origins.includes(expectedOrigin)) {
          fail(`CORS origins must include the hosted frontend origin ${expectedOrigin}`)
        }
        if (env.REFRESH_COOKIE_SAME_SITE !== "none") {
          fail("REFRESH_COOKIE_SAME_SITE must be none for GitHub Pages and ngrok")
        }
        if (env.TRUST_PROXY_HOPS !== 1) {
          fail("TRUST_PROXY_HOPS must be 1 for the supported ngrok topology")
        }

        const numericKeys = [
          "AUTH_LOGIN_RATE_LIMIT_MAX",
          "AUTH_LOGIN_RATE_LIMIT_WINDOW_MS",
          "AUTH_REFRESH_RATE_LIMIT_MAX",
          "AUTH_REFRESH_RATE_LIMIT_WINDOW_MS",
          "API_RATE_LIMIT_MAX",
          "API_RATE_LIMIT_WINDOW_MS",
        ]
        for (const key of numericKeys) {
          if (!/^[0-9]*[1-9][0-9]*$/.test(raw[key] ?? "")) {
            fail(`${key} must be a positive integer`)
          }
        }
        if (env.PORT !== 3210) {
          fail("PORT must remain 3210 for the supported ngrok topology")
        }
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    ' "$API_ENV_FILE" "$FRONTEND_ORIGIN"
  )
}

create_api_env() {
  [[ "$RESOLVED_MODE" == "first-run" ]] ||
    die "$API_ENV_FILE is missing; restore the private production env before updating"

  local admin_password="${INITIAL_ADMIN_PASSWORD:-}"
  local confirm_password=""
  if [[ -z "$admin_password" ]]; then
    [[ -t 0 && -t 1 ]] ||
      die "Set INITIAL_ADMIN_PASSWORD when first run is non-interactive"
    read -r -s -p "Initial admin password (minimum 12 characters): " admin_password
    printf '\n'
    read -r -s -p "Confirm initial admin password: " confirm_password
    printf '\n'
    [[ "$admin_password" == "$confirm_password" ]] || die "Admin passwords do not match"
  fi

  [[ ${#admin_password} -ge 12 ]] || die "Initial admin password must be at least 12 characters"
  [[ "$admin_password" != *$'\n'* && "$admin_password" != *$'\r'* ]] ||
    die "Initial admin password cannot contain newlines"
  [[ "$admin_password" != *'`'* ]] ||
    die "Initial admin password cannot contain a backtick during automatic env creation"

  local jwt_secret
  local jwt_refresh_secret
  jwt_secret="$(openssl rand -hex 32)"
  jwt_refresh_secret="$(openssl rand -hex 32)"

  local env_tmp
  umask 077
  env_tmp="$(mktemp "$API_DIR/.env.tmp.XXXXXX")"
  {
    printf 'DATABASE_URL=postgres://phongthanh:phongthanh_dev@localhost:5434/phongthanh\n'
    printf 'JWT_SECRET=%s\n' "$jwt_secret"
    printf 'JWT_REFRESH_SECRET=%s\n' "$jwt_refresh_secret"
    printf 'INITIAL_ADMIN_PASSWORD=%s\n' "$(dotenv_quote "$admin_password")"
    printf 'PORT=3210\n'
    printf 'CORS_ORIGIN=%s\n' "${PT_CORS_ORIGIN:-$FRONTEND_ORIGIN}"
    printf 'CORS_ADDITIONAL_ORIGINS=%s\n' "${PT_CORS_ADDITIONAL_ORIGINS:-}"
    printf 'TRUST_PROXY_HOPS=1\n'
    printf 'AUTH_LOGIN_RATE_LIMIT_MAX=20\n'
    printf 'AUTH_LOGIN_RATE_LIMIT_WINDOW_MS=900000\n'
    printf 'AUTH_REFRESH_RATE_LIMIT_MAX=120\n'
    printf 'AUTH_REFRESH_RATE_LIMIT_WINDOW_MS=60000\n'
    printf 'API_RATE_LIMIT_MAX=600\n'
    printf 'API_RATE_LIMIT_WINDOW_MS=60000\n'
    printf 'REFRESH_COOKIE_SAME_SITE=none\n'
  } >"$env_tmp"
  chmod 600 "$env_tmp"
  mv "$env_tmp" "$API_ENV_FILE"
  unset admin_password confirm_password jwt_secret jwt_refresh_secret INITIAL_ADMIN_PASSWORD
  log "Created private API environment at $API_ENV_FILE"
}

validate_api_env() {
  [[ ! -L "$API_ENV_FILE" ]] || die "$API_ENV_FILE must be a regular file, not a symlink"
  [[ -f "$API_ENV_FILE" ]] || create_api_env
  if [[ "$CHECK_ONLY" == "0" ]]; then
    chmod 600 "$API_ENV_FILE"
  else
    local env_permissions
    env_permissions="$(stat -f '%Lp' "$API_ENV_FILE")"
    [[ "$env_permissions" == "600" ]] ||
      die "$API_ENV_FILE must have permission 600; found $env_permissions"
  fi

  clear_api_env_overrides
  prepare_api_validation_runtime
  validate_api_env_values || die "API environment validation failed"
  API_PORT="3210"
}

clear_api_env_overrides() {
  unset \
    DATABASE_URL JWT_SECRET JWT_REFRESH_SECRET INITIAL_ADMIN_PASSWORD PORT \
    CORS_ORIGIN CORS_ADDITIONAL_ORIGINS TRUST_PROXY_HOPS \
    AUTH_LOGIN_RATE_LIMIT_MAX AUTH_LOGIN_RATE_LIMIT_WINDOW_MS \
    AUTH_REFRESH_RATE_LIMIT_MAX AUTH_REFRESH_RATE_LIMIT_WINDOW_MS \
    API_RATE_LIMIT_MAX API_RATE_LIMIT_WINDOW_MS REFRESH_COOKIE_SAME_SITE
}

listener_pids() {
  lsof -nP -tiTCP:"$API_PORT" -sTCP:LISTEN 2>/dev/null | sort -u || true
}

stop_managed_api() {
  local service_target
  local stopped_any=0
  service_target="gui/$(id -u)/$LAUNCH_LABEL"
  if launchctl print "$service_target" >/dev/null 2>&1; then
    log "Stopping the API LaunchAgent"
    launchctl bootout "$service_target"
    stopped_any=1
  fi

  local pid
  local process_cwd
  local pids
  pids="$(listener_pids)"
  if [[ -n "$pids" ]]; then
    while IFS= read -r pid; do
      [[ -n "$pid" ]] || continue
      process_cwd="$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -n 1)"
      if [[ "$process_cwd" != "$API_DIR" ]]; then
        die "Port $API_PORT is owned by PID $pid outside $API_DIR; stop it manually"
      fi
      local process_arguments
      local process_command
      local process_executable
      process_command="$(ps -ww -p "$pid" -o command= 2>/dev/null || true)"
      [[ "$process_command" == *' '* ]] ||
        die "Port $API_PORT uses $API_DIR but PID $pid is not the production API"
      process_executable="${process_command%% *}"
      process_arguments="${process_command#* }"
      process_arguments="$(printf '%s' "$process_arguments" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
      [[ "${process_executable##*/}" == "node" ]] ||
        die "Port $API_PORT uses $API_DIR but PID $pid is not a Node API process"
      [[ "$process_arguments" == "dist/main.js" || "$process_arguments" == "$API_DIR/dist/main.js" ]] ||
        die "Port $API_PORT uses $API_DIR but PID $pid does not run the production entrypoint"
      log "Stopping legacy project API process PID $pid"
      kill -TERM "$pid"
      stopped_any=1
    done <<<"$pids"
  fi

  for _ in {1..20}; do
    [[ -z "$(listener_pids)" ]] && {
      API_STOPPED="$stopped_any"
      return
    }
    sleep 1
  done
  die "Project API did not release port $API_PORT after 20 seconds"
}

xml_escape() {
  printf '%s' "$1" |
    sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' \
      -e 's/"/\&quot;/g' -e "s/'/\&apos;/g"
}

write_api_launch_agent() {
  local node_bin
  node_bin="$(command -v node)"

  mkdir -p "$LAUNCH_AGENTS_DIR" "$LOG_DIR"
  chmod 700 "$LOG_DIR"

  local plist_tmp
  plist_tmp="$(mktemp "$LAUNCH_AGENTS_DIR/$LAUNCH_LABEL.plist.tmp.XXXXXX")"
  {
    printf '%s\n' '<?xml version="1.0" encoding="UTF-8"?>'
    printf '%s\n' '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">'
    printf '%s\n' '<plist version="1.0">'
    printf '%s\n' '<dict>'
    printf '%s\n' '  <key>Label</key>'
    printf '  <string>%s</string>\n' "$(xml_escape "$LAUNCH_LABEL")"
    printf '%s\n' '  <key>ProgramArguments</key>'
    printf '%s\n' '  <array>'
    printf '%s\n' '    <string>/usr/bin/caffeinate</string>'
    printf '%s\n' '    <string>-dimsu</string>'
    printf '    <string>%s</string>\n' "$(xml_escape "$node_bin")"
    printf '    <string>%s</string>\n' "$(xml_escape "$API_DIR/dist/main.js")"
    printf '%s\n' '  </array>'
    printf '%s\n' '  <key>WorkingDirectory</key>'
    printf '  <string>%s</string>\n' "$(xml_escape "$API_DIR")"
    printf '%s\n' '  <key>RunAtLoad</key>'
    printf '%s\n' '  <true/>'
    printf '%s\n' '  <key>KeepAlive</key>'
    printf '%s\n' '  <true/>'
    printf '%s\n' '  <key>ThrottleInterval</key>'
    printf '%s\n' '  <integer>10</integer>'
    printf '%s\n' '  <key>StandardOutPath</key>'
    printf '  <string>%s</string>\n' "$(xml_escape "$LOG_DIR/api.log")"
    printf '%s\n' '  <key>StandardErrorPath</key>'
    printf '  <string>%s</string>\n' "$(xml_escape "$LOG_DIR/api-error.log")"
    printf '%s\n' '</dict>'
    printf '%s\n' '</plist>'
  } >"$plist_tmp"

  plutil -lint "$plist_tmp" >/dev/null
  chmod 600 "$plist_tmp"
  mv "$plist_tmp" "$LAUNCH_PLIST"
}

start_api_launch_agent() {
  local domain_target
  local service_target
  domain_target="gui/$(id -u)"
  service_target="$domain_target/$LAUNCH_LABEL"

  write_api_launch_agent
  launchctl bootout "$service_target" >/dev/null 2>&1 || true
  launchctl enable "$service_target"
  launchctl bootstrap "$domain_target" "$LAUNCH_PLIST"
  launchctl kickstart -k "$service_target"
  API_STOPPED=0
}

wait_for_local_api() {
  local local_url="http://127.0.0.1:$API_PORT"

  log "Waiting for local API health and readiness"
  for _ in {1..90}; do
    if curl -fsS --max-time 5 "$local_url/health" >/dev/null 2>&1 &&
      curl -fsS --max-time 5 "$local_url/health/ready" >/dev/null 2>&1; then
      local status
      status="$(
        curl -sS -o /dev/null -w '%{http_code}' --max-time 5 \
          "$local_url/api/v1/tin-tuc?page=1&pageSize=1"
      )"
      if [[ "$status" == "401" ]]; then
        log "Local API readiness and release capability passed at $local_url"
        return
      fi
    fi
    sleep 1
  done

  tail -n 80 "$LOG_DIR/api-error.log" >&2 2>/dev/null || true
  tail -n 80 "$LOG_DIR/api.log" >&2 2>/dev/null || true
  die "Local API failed its health gates after 90 seconds"
}

resolve_public_api_url() {
  local public_url="${PUBLIC_API_URL:-${API_URL:-}}"
  local github_url=""
  if command -v gh >/dev/null 2>&1; then
    if gh auth status >/dev/null 2>&1; then
      github_url="$(
        gh variable get API_URL \
          --repo "${PT_GITHUB_REPOSITORY:-miniHaLe/phongthanh-admin}" 2>/dev/null || true
      )"
    fi
  fi

  public_url="${public_url%/}"
  github_url="${github_url%/}"
  if [[ -z "$public_url" ]]; then
    public_url="$github_url"
  elif [[ -n "$github_url" && "$public_url" != "$github_url" ]]; then
    die "Public API URL differs from the GitHub Pages API_URL variable; frontend redeploy would be required"
  fi
  if [[ -n "$public_url" ]]; then
    [[ "$public_url" =~ ^https://[[:alnum:].-]+(:[0-9]+)?$ ]] ||
      die "Public API URL must be an HTTPS origin without credentials, path, query, or fragment"
  fi
  printf '%s' "$public_url"
}

verify_public_api() {
  if [[ "$SKIP_PUBLIC_CHECK" == "1" ]]; then
    warn "Public API checks skipped by request"
    return
  fi

  local public_url
  public_url="$(resolve_public_api_url)"
  if [[ -z "$public_url" ]]; then
    warn "No stable public API URL configured; local deployment is complete"
    return
  fi

  log "Verifying stable public API at $public_url"
  curl -fsS --retry 5 --retry-delay 5 --max-time 15 \
    -H 'ngrok-skip-browser-warning: true' \
    "$public_url/health/ready" >/dev/null

  local status
  status="$(
    curl -sS -o /dev/null -w '%{http_code}' \
      --retry 5 --retry-delay 5 --max-time 15 \
      -H 'ngrok-skip-browser-warning: true' \
      "$public_url/api/v1/tin-tuc?page=1&pageSize=1"
  )"
  [[ "$status" == "401" ]] ||
    die "Public API capability check expected HTTP 401; received $status"
  log "Public API readiness and release capability passed"
}

run_configuration_check() {
  resolve_mode
  assert_no_conflicting_compose_services
  if [[ -f "$API_ENV_FILE" ]]; then
    validate_api_env
    log "API environment file is present and valid"
  elif [[ "$RESOLVED_MODE" == "update" ]]; then
    die "$API_ENV_FILE is required for update mode"
  else
    log "API environment will be created during first run"
  fi
  log "Configuration check passed; no deployment action was performed"
}

main() {
  parse_args "$@"
  trap release_lock EXIT
  trap on_error ERR
  acquire_lock
  cd "$ROOT_DIR"
  check_prerequisites
  require_clean_worktree

  if [[ "$CHECK_ONLY" == "1" ]]; then
    run_configuration_check
    return
  fi

  resolve_mode
  assert_no_conflicting_compose_services

  if [[ "${PT_DEPLOY_REEXEC:-0}" == "1" ]]; then
    validate_reexec_state
  fi

  if [[ "${PT_DEPLOY_REEXEC:-0}" != "1" ]]; then
    if database_exists; then
      ensure_database_running
      backup_database
    fi

    if [[ "$SKIP_PULL" == "0" ]]; then
      pull_and_reexec
    fi
  fi

  require_clean_worktree
  validate_api_env
  ensure_database_running
  assert_no_conflicting_compose_services

  stop_managed_api

  if [[ "$DEPENDENCIES_INSTALLED" == "0" ]]; then
    log "Installing locked API dependencies"
    npm --prefix "$API_DIR" ci --include=dev
  fi

  log "Revalidating the API environment against the installed runtime"
  validate_api_env_values || die "API environment validation failed after dependency installation"

  log "Building the NestJS API"
  npm --prefix "$API_DIR" run build

  log "Applying forward-only database migrations"
  npm --prefix "$API_DIR" run db:migrate

  log "Running the idempotent database seed"
  npm --prefix "$API_DIR" run seed

  log "Installing and starting the API LaunchAgent"
  start_api_launch_agent
  wait_for_local_api
  verify_public_api

  log "MacBook database and API deployment completed"
  if [[ "$BACKUP_VERIFIED" == "1" && -n "$BACKUP_FILE" ]]; then
    log "Backup: $BACKUP_FILE"
  fi
  log "API logs: $LOG_DIR"
  log "Frontend deployment was not run"
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi
