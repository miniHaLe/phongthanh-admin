import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createNhaSanXuatSchema, updateNhaSanXuatSchema } from './nha-san-xuat.dto'
import { nhaSanXuatResourceConfig } from './nha-san-xuat.resource-config'

export const NHA_SAN_XUAT_SERVICE = Symbol('NHA_SAN_XUAT_SERVICE')

const NhaSanXuatController = createCrudController({
  path: 'api/v1/nha-san-xuat',
  serviceToken: NHA_SAN_XUAT_SERVICE,
  createSchema: createNhaSanXuatSchema,
  updateSchema: updateNhaSanXuatSchema,
})

@Module({
  controllers: [NhaSanXuatController],
  providers: [
    {
      provide: NHA_SAN_XUAT_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, nhaSanXuatResourceConfig),
    },
  ],
})
export class NhaSanXuatModule {}
