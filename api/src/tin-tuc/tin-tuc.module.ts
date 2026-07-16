import { Module } from '@nestjs/common'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createTinTucSchema, updateTinTucSchema } from './tin-tuc.dto'
import { tinTucResourceConfig } from './tin-tuc.resource-config'

const TIN_TUC_SERVICE = Symbol('TIN_TUC_SERVICE')
const TinTucController = createCrudController({
  path: 'api/v1/tin-tuc',
  serviceToken: TIN_TUC_SERVICE,
  createSchema: createTinTucSchema,
  updateSchema: updateTinTucSchema,
})

@Module({
  controllers: [TinTucController],
  providers: [
    {
      provide: TIN_TUC_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) => new CrudService(db, tinTucResourceConfig),
    },
  ],
})
export class TinTucModule {}
