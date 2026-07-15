import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createNhomHangHoaSchema, updateNhomHangHoaSchema } from './nhom-hang-hoa.dto'
import { nhomHangHoaResourceConfig } from './nhom-hang-hoa.resource-config'

export const NHOM_HANG_HOA_SERVICE = Symbol('NHOM_HANG_HOA_SERVICE')

const NhomHangHoaController = createCrudController({
  path: 'api/v1/nhom-hang-hoa',
  serviceToken: NHOM_HANG_HOA_SERVICE,
  createSchema: createNhomHangHoaSchema,
  updateSchema: updateNhomHangHoaSchema,
})

@Module({
  controllers: [NhomHangHoaController],
  providers: [
    {
      provide: NHOM_HANG_HOA_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, nhomHangHoaResourceConfig),
    },
  ],
})
export class NhomHangHoaModule {}
