import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createNhaKhoSchema, updateNhaKhoSchema } from './nha-kho.dto'
import { nhaKhoResourceConfig } from './nha-kho.resource-config'

export const NHA_KHO_SERVICE = Symbol('NHA_KHO_SERVICE')

const NhaKhoController = createCrudController({
  path: 'api/v1/nha-kho',
  serviceToken: NHA_KHO_SERVICE,
  createSchema: createNhaKhoSchema,
  updateSchema: updateNhaKhoSchema,
})

@Module({
  controllers: [NhaKhoController],
  providers: [
    {
      provide: NHA_KHO_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, nhaKhoResourceConfig),
    },
  ],
})
export class NhaKhoModule {}
