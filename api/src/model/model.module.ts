import { Module } from '@nestjs/common'
import { createCrudController } from '../crud/crud-controller.factory'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createModelSchema, updateModelSchema } from './model.dto'
import { ModelService } from './model.service'

const MODEL_SERVICE = Symbol('MODEL_SERVICE')
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
      useFactory: (db: DbClient) => new ModelService(db),
    },
  ],
})
export class ModelModule {}
