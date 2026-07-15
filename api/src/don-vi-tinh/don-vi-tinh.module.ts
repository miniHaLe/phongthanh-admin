import { Module } from '@nestjs/common'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { createDonViTinhSchema, updateDonViTinhSchema } from './don-vi-tinh.dto'
import { donViTinhResourceConfig } from './don-vi-tinh.resource-config'

export const DON_VI_TINH_SERVICE = Symbol('DON_VI_TINH_SERVICE')

const DonViTinhController = createCrudController({
  path: 'api/v1/don-vi-tinh',
  serviceToken: DON_VI_TINH_SERVICE,
  createSchema: createDonViTinhSchema,
  updateSchema: updateDonViTinhSchema,
})

@Module({
  controllers: [DonViTinhController],
  providers: [
    {
      provide: DON_VI_TINH_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, donViTinhResourceConfig),
    },
  ],
})
export class DonViTinhModule {}
