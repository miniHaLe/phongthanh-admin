import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createHangHoaSchema, updateHangHoaSchema } from './hang-hoa.dto'
import { hangHoaResourceConfig } from './hang-hoa.resource-config'

export const HANG_HOA_SERVICE = Symbol('HANG_HOA_SERVICE')

const HangHoaController = createCrudController({
  path: 'api/v1/hang-hoa',
  serviceToken: HANG_HOA_SERVICE,
  createSchema: createHangHoaSchema,
  updateSchema: updateHangHoaSchema,
})

@Module({
  controllers: [HangHoaController],
  providers: [
    {
      provide: HANG_HOA_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, hangHoaResourceConfig),
    },
  ],
})
export class HangHoaModule {}
