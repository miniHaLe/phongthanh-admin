import { Module } from '@nestjs/common'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createNhomQuyenSchema, updateNhomQuyenSchema } from './nhom-quyen.dto'
import { nhomQuyenResourceConfig } from './nhom-quyen.resource-config'

export const NHOM_QUYEN_SERVICE = Symbol('NHOM_QUYEN_SERVICE')

const NhomQuyenController = createCrudController({
  path: 'api/v1/nhom-quyen',
  serviceToken: NHOM_QUYEN_SERVICE,
  createSchema: createNhomQuyenSchema,
  updateSchema: updateNhomQuyenSchema,
})

@Module({
  controllers: [NhomQuyenController],
  providers: [
    {
      provide: NHOM_QUYEN_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, nhomQuyenResourceConfig),
    },
  ],
})
export class NhomQuyenModule {}
