import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createModelSchema, updateModelSchema } from './model.dto'
import { modelResourceConfig } from './model.resource-config'

export const MODEL_SERVICE = Symbol('MODEL_SERVICE')

const ModelController = createCrudController({
  path: 'api/v1/model',
  serviceToken: MODEL_SERVICE,
  createSchema: createModelSchema,
  updateSchema: updateModelSchema,
})

@Module({
  controllers: [ModelController],
  providers: [
    {
      provide: MODEL_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, modelResourceConfig),
    },
  ],
})
export class ModelModule {}
