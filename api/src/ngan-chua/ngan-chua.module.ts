import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createNganChuaSchema, updateNganChuaSchema } from './ngan-chua.dto'
import { nganChuaResourceConfig } from './ngan-chua.resource-config'

export const NGAN_CHUA_SERVICE = Symbol('NGAN_CHUA_SERVICE')

const NganChuaController = createCrudController({
  path: 'api/v1/ngan-chua',
  serviceToken: NGAN_CHUA_SERVICE,
  createSchema: createNganChuaSchema,
  updateSchema: updateNganChuaSchema,
})

@Module({
  controllers: [NganChuaController],
  providers: [
    {
      provide: NGAN_CHUA_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, nganChuaResourceConfig),
    },
  ],
})
export class NganChuaModule {}
