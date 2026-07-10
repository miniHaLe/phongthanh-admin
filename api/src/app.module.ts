import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { loadEnv } from './config/env'
import { DbModule } from './db/db.module'
import { HealthModule } from './health/health.module'
import { KhachHangModule } from './khach-hang/khach-hang.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: loadEnv,
    }),
    DbModule,
    AuthModule,
    HealthModule,
    KhachHangModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
