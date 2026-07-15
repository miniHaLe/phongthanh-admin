import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createLoiSuaChuaSchema, updateLoiSuaChuaSchema } from './loi-sua-chua.dto'
import { loiSuaChuaResourceConfig } from './loi-sua-chua.resource-config'

export const LOI_SUA_CHUA_SERVICE = Symbol('LOI_SUA_CHUA_SERVICE')

const LoiSuaChuaController = createCrudController({
  path: 'api/v1/loi-sua-chua',
  serviceToken: LOI_SUA_CHUA_SERVICE,
  createSchema: createLoiSuaChuaSchema,
  updateSchema: updateLoiSuaChuaSchema,
})

@Module({
  controllers: [LoiSuaChuaController],
  providers: [
    {
      provide: LOI_SUA_CHUA_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, loiSuaChuaResourceConfig),
    },
  ],
})
export class LoiSuaChuaModule {}
