import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createThoiHanSchema, updateThoiHanSchema } from './thoi-han.dto'
import { thoiHanResourceConfig } from './thoi-han.resource-config'

export const THOI_HAN_SERVICE = Symbol('THOI_HAN_SERVICE')

const ThoiHanController = createCrudController({
  path: 'api/v1/thoi-han',
  serviceToken: THOI_HAN_SERVICE,
  createSchema: createThoiHanSchema,
  updateSchema: updateThoiHanSchema,
})

@Module({
  controllers: [ThoiHanController],
  providers: [
    {
      provide: THOI_HAN_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, thoiHanResourceConfig),
    },
  ],
})
export class ThoiHanModule {}
