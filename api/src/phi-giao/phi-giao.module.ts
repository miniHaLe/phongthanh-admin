import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createPhiGiaoSchema, updatePhiGiaoSchema } from './phi-giao.dto'
import { phiGiaoResourceConfig } from './phi-giao.resource-config'

export const PHI_GIAO_SERVICE = Symbol('PHI_GIAO_SERVICE')

const PhiGiaoController = createCrudController({
  path: 'api/v1/phi-giao',
  serviceToken: PHI_GIAO_SERVICE,
  createSchema: createPhiGiaoSchema,
  updateSchema: updatePhiGiaoSchema,
})

@Module({
  controllers: [PhiGiaoController],
  providers: [
    {
      provide: PHI_GIAO_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, phiGiaoResourceConfig),
    },
  ],
})
export class PhiGiaoModule {}
