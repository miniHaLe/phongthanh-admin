import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { MustChangePasswordGuard } from './auth/must-change-password.guard'
import { loadEnv } from './config/env'
import { DbModule } from './db/db.module'
import { HealthModule } from './health/health.module'
import { KhachHangModule } from './khach-hang/khach-hang.module'
import { DiaLyModule } from './dia-ly/dia-ly.module'
import { ModelModule } from './model/model.module'
import { NganHangModule } from './ngan-hang/ngan-hang.module'
import { NhaSanXuatModule } from './nha-san-xuat/nha-san-xuat.module'
import { SanPhamModule } from './san-pham/san-pham.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: loadEnv,
    }),
    DbModule,
    AuthModule,
    HealthModule,
    DiaLyModule,
    KhachHangModule,
    NhaSanXuatModule,
    SanPhamModule,
    ModelModule,
    NganHangModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MustChangePasswordGuard,
    },
  ],
})
export class AppModule {}
