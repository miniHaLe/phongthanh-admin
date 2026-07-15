import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createSanPhamSchema, updateSanPhamSchema } from './san-pham.dto'
import { sanPhamResourceConfig } from './san-pham.resource-config'

export const SAN_PHAM_SERVICE = Symbol('SAN_PHAM_SERVICE')

const SanPhamController = createCrudController({
  path: 'api/v1/san-pham',
  serviceToken: SAN_PHAM_SERVICE,
  createSchema: createSanPhamSchema,
  updateSchema: updateSanPhamSchema,
})

@Module({
  controllers: [SanPhamController],
  providers: [
    {
      provide: SAN_PHAM_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, sanPhamResourceConfig),
    },
  ],
})
export class SanPhamModule {}
