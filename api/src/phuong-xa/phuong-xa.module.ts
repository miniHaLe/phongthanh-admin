import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createPhuongXaSchema, updatePhuongXaSchema } from './phuong-xa.dto'
import { phuongXaResourceConfig } from './phuong-xa.resource-config'

export const PHUONG_XA_SERVICE = Symbol('PHUONG_XA_SERVICE')

const PhuongXaController = createCrudController({
  path: 'api/v1/phuong-xa',
  serviceToken: PHUONG_XA_SERVICE,
  createSchema: createPhuongXaSchema,
  updateSchema: updatePhuongXaSchema,
})

@Module({
  controllers: [PhuongXaController],
  providers: [
    {
      provide: PHUONG_XA_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, phuongXaResourceConfig),
    },
  ],
})
export class PhuongXaModule {}
