import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'

// ConfigModule is registered globally (isGlobal: true) in AppModule — no
// need to re-import it here; doing so would risk a second, option-less
// ConfigModule registration shadowing the global one.
@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
