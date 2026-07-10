-- Vietnamese collation for ORDER BY on text columns (sort-column allowlist
-- enforces which columns may use this — see security gate 1) + unaccent for
-- future accent-insensitive search.
CREATE COLLATION IF NOT EXISTS "vi-VN-x-icu" (provider = icu, locale = 'vi-VN');
CREATE EXTENSION IF NOT EXISTS unaccent;
--> statement-breakpoint
CREATE TABLE "chi_nhanh" (
	"id" text PRIMARY KEY NOT NULL,
	"ten_chi_nhanh" text NOT NULL,
	"so_dien_thoai" text,
	"hotline" text,
	"nguoi_lien_he" text,
	"email" text,
	"dia_chi" text,
	"toa_do" text,
	"chinh" boolean,
	"chuyen_cn" boolean,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "quan" (
	"id" text PRIMARY KEY NOT NULL,
	"ten" text NOT NULL,
	"tinh_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tinh" (
	"id" text PRIMARY KEY NOT NULL,
	"ten" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xa" (
	"id" text PRIMARY KEY NOT NULL,
	"ten" text NOT NULL,
	"quan_id" text NOT NULL,
	"tinh_id" text NOT NULL,
	"khoang_cach" integer,
	"tien_cong" integer,
	"tuyen_id" text
);
--> statement-breakpoint
CREATE TABLE "loai_khach_hang" (
	"id" integer PRIMARY KEY NOT NULL,
	"ten" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nhom_quyen" (
	"id" text PRIMARY KEY NOT NULL,
	"ma_nhom" text NOT NULL,
	"ten_nhom" text NOT NULL,
	"mo_ta" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "nguoi_dung" (
	"id" text PRIMARY KEY NOT NULL,
	"ten_dang_nhap" text NOT NULL,
	"ho_ten" text NOT NULL,
	"dien_thoai" text,
	"email" text,
	"chi_nhanh_id" text NOT NULL,
	"chi_nhanh_phu_ids" text[] DEFAULT '{}' NOT NULL,
	"nhom_quyen_id" text NOT NULL,
	"super_scope" boolean DEFAULT false NOT NULL,
	"locked" boolean DEFAULT false NOT NULL,
	"last_login" timestamp with time zone,
	"password_hash" text NOT NULL,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "nguoi_dung_ten_dang_nhap_unique" UNIQUE("ten_dang_nhap")
);
--> statement-breakpoint
CREATE TABLE "khach_hang" (
	"id" text PRIMARY KEY NOT NULL,
	"ten_kh" text NOT NULL,
	"dien_thoai" text NOT NULL,
	"dien_thoai_2" text,
	"dia_chi" text,
	"phuong_xa_id" text,
	"quan_id" text,
	"tinh_id" text,
	"email" text,
	"loai_khach_hang_id" integer NOT NULL,
	"dai_ly_id" text,
	"nguoi_tao" text NOT NULL,
	"ghi_chu" text,
	"branch_id" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "refresh_token" (
	"id" text PRIMARY KEY NOT NULL,
	"family_id" text NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" text NOT NULL,
	"used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quan" ADD CONSTRAINT "quan_tinh_id_tinh_id_fk" FOREIGN KEY ("tinh_id") REFERENCES "public"."tinh"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xa" ADD CONSTRAINT "xa_quan_id_quan_id_fk" FOREIGN KEY ("quan_id") REFERENCES "public"."quan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xa" ADD CONSTRAINT "xa_tinh_id_tinh_id_fk" FOREIGN KEY ("tinh_id") REFERENCES "public"."tinh"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nguoi_dung" ADD CONSTRAINT "nguoi_dung_chi_nhanh_id_chi_nhanh_id_fk" FOREIGN KEY ("chi_nhanh_id") REFERENCES "public"."chi_nhanh"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nguoi_dung" ADD CONSTRAINT "nguoi_dung_nhom_quyen_id_nhom_quyen_id_fk" FOREIGN KEY ("nhom_quyen_id") REFERENCES "public"."nhom_quyen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD CONSTRAINT "khach_hang_phuong_xa_id_xa_id_fk" FOREIGN KEY ("phuong_xa_id") REFERENCES "public"."xa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD CONSTRAINT "khach_hang_quan_id_quan_id_fk" FOREIGN KEY ("quan_id") REFERENCES "public"."quan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD CONSTRAINT "khach_hang_tinh_id_tinh_id_fk" FOREIGN KEY ("tinh_id") REFERENCES "public"."tinh"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD CONSTRAINT "khach_hang_loai_khach_hang_id_loai_khach_hang_id_fk" FOREIGN KEY ("loai_khach_hang_id") REFERENCES "public"."loai_khach_hang"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD CONSTRAINT "khach_hang_dai_ly_id_khach_hang_id_fk" FOREIGN KEY ("dai_ly_id") REFERENCES "public"."khach_hang"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD CONSTRAINT "khach_hang_branch_id_chi_nhanh_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."chi_nhanh"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_token" ADD CONSTRAINT "refresh_token_user_id_nguoi_dung_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."nguoi_dung"("id") ON DELETE no action ON UPDATE no action;