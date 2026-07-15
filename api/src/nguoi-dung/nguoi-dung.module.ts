import { Module } from '@nestjs/common'
import { createCrudController } from '../crud/crud-controller.factory'
import { CrudService } from '../crud/crud.service'
import { DB_CLIENT, type DbClient } from '../db/db.module'
import { createNguoiDungSchema, updateNguoiDungSchema } from './nguoi-dung.dto'
import { nguoiDungResourceConfig } from './nguoi-dung.resource-config'

export const NGUOI_DUNG_SERVICE = Symbol('NGUOI_DUNG_SERVICE')

const NguoiDungController = createCrudController({
  path: 'api/v1/nguoi-dung',
  serviceToken: NGUOI_DUNG_SERVICE,
  createSchema: createNguoiDungSchema,
  updateSchema: updateNguoiDungSchema,
})

@Module({
  controllers: [NguoiDungController],
  providers: [
    {
      provide: NGUOI_DUNG_SERVICE,
      inject: [DB_CLIENT],
      useFactory: (db: DbClient) =>
        new CrudService(db, nguoiDungResourceConfig),
    },
  ],
})
export class NguoiDungModule {}
