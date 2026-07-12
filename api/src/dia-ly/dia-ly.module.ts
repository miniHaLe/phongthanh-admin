import { Module } from '@nestjs/common'
import { DiaLyController } from './dia-ly.controller'

@Module({
  controllers: [DiaLyController],
})
export class DiaLyModule {}
