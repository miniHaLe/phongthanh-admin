import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createChiNhanhSchema, updateChiNhanhSchema } from './chi-nhanh.dto'
import { chiNhanhResourceConfig } from './chi-nhanh.resource-config'

export const CHI_NHANH_SERVICE = Symbol('CHI_NHANH_SERVICE')

const ChiNhanhController = createCrudController({
  path: 'api/v1/chi-nhanh',
  serviceToken: CHI_NHANH_SERVICE,
  createSchema: createChiNhanhSchema,
  updateSchema: updateChiNhanhSchema,
})

@Module({
  controllers: [ChiNhanhController],
  providers: [
    {
      provide: CHI_NHANH_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, chiNhanhResourceConfig),
    },
  ],
})
export class ChiNhanhModule {}
