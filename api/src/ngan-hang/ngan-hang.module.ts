import { Module } from '@nestjs/common'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createNganHangSchema, updateNganHangSchema } from './ngan-hang.dto'
import { nganHangResourceConfig } from './ngan-hang.resource-config'

const NGAN_HANG_SERVICE = Symbol('NGAN_HANG_SERVICE')
const NganHangController = createCrudController({
  path: 'api/v1/ngan-hang',
  serviceToken: NGAN_HANG_SERVICE,
  createSchema: createNganHangSchema,
  updateSchema: updateNganHangSchema,
})

@Module({
  controllers: [NganHangController],
  providers: [
    {
      provide: NGAN_HANG_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) => new CrudService(db, nganHangResourceConfig),
    },
  ],
})
export class NganHangModule {}
