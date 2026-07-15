import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createNhomSanPhamSchema, updateNhomSanPhamSchema } from './nhom-san-pham.dto'
import { nhomSanPhamResourceConfig } from './nhom-san-pham.resource-config'

export const NHOM_SAN_PHAM_SERVICE = Symbol('NHOM_SAN_PHAM_SERVICE')

const NhomSanPhamController = createCrudController({
  path: 'api/v1/nhom-san-pham',
  serviceToken: NHOM_SAN_PHAM_SERVICE,
  createSchema: createNhomSanPhamSchema,
  updateSchema: updateNhomSanPhamSchema,
})

@Module({
  controllers: [NhomSanPhamController],
  providers: [
    {
      provide: NHOM_SAN_PHAM_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, nhomSanPhamResourceConfig),
    },
  ],
})
export class NhomSanPhamModule {}
