import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createKhachHangSchema, updateKhachHangSchema } from './khach-hang.dto'
import { khachHangResourceConfig } from './khach-hang.resource-config'

export const KHACH_HANG_SERVICE = Symbol('KHACH_HANG_SERVICE')

const KhachHangController = createCrudController({
  path: 'api/v1/khach-hang',
  serviceToken: KHACH_HANG_SERVICE,
  createSchema: createKhachHangSchema,
  updateSchema: updateKhachHangSchema,
})

@Module({
  controllers: [KhachHangController],
  providers: [
    {
      provide: KHACH_HANG_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, khachHangResourceConfig),
    },
  ],
})
export class KhachHangModule {}
