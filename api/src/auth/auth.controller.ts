import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Request, Response } from 'express'
import type { Env } from '../config/env'
import { AuthService } from './auth.service'
import { CsrfHeaderGuard } from './csrf-header.guard'
import { loginDtoSchema } from './login.dto'
import { Public } from './public.decorator'
import {
  REFRESH_COOKIE_NAME,
  clearRefreshCookie,
  setRefreshCookie,
} from './refresh-cookie.util'
import { ZodValidationPipe } from '../common/zod-validation.pipe'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private refreshCookieSameSite() {
    return this.config.get('REFRESH_COOKIE_SAME_SITE')
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginDtoSchema))
    body: { tenDangNhap: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body.tenDangNhap, body.password)
    setRefreshCookie(res, result.refreshToken, this.refreshCookieSameSite())
    return {
      accessToken: result.accessToken,
      mustChangePassword: result.mustChangePassword,
    }
  }

  @Public()
  @UseGuards(CsrfHeaderGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined
    if (!rawToken) {
      throw new UnauthorizedException('Thiếu refresh token')
    }
    const result = await this.authService.refresh(rawToken)
    setRefreshCookie(res, result.refreshToken, this.refreshCookieSameSite())
    return { accessToken: result.accessToken }
  }

  @Public()
  @UseGuards(CsrfHeaderGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined
    await this.authService.logout(rawToken)
    clearRefreshCookie(res, this.refreshCookieSameSite())
  }
}
