import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createKhuVucSchema, updateKhuVucSchema } from './khu-vuc.dto'
import { khuVucResourceConfig } from './khu-vuc.resource-config'

export const KHU_VUC_SERVICE = Symbol('KHU_VUC_SERVICE')

const KhuVucController = createCrudController({
  path: 'api/v1/khu-vuc',
  serviceToken: KHU_VUC_SERVICE,
  createSchema: createKhuVucSchema,
  updateSchema: updateKhuVucSchema,
})

@Module({
  controllers: [KhuVucController],
  providers: [
    {
      provide: KHU_VUC_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, khuVucResourceConfig),
    },
  ],
})
export class KhuVucModule {}
