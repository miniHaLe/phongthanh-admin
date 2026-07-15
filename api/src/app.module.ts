import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { ChiNhanhModule } from './chi-nhanh/chi-nhanh.module'
import { JwtAuthGuard } from './auth/jwt-auth.guard'
import { loadEnv } from './config/env'
import { DbModule } from './db/db.module'
import { DonViTinhModule } from './don-vi-tinh/don-vi-tinh.module'
import { HangHoaModule } from './hang-hoa/hang-hoa.module'
import { HealthModule } from './health/health.module'
import { KhachHangModule } from './khach-hang/khach-hang.module'
import { KhuVucModule } from './khu-vuc/khu-vuc.module'
import { LoiSuaChuaModule } from './loi-sua-chua/loi-sua-chua.module'
import { ModelModule } from './model/model.module'
import { NganChuaModule } from './ngan-chua/ngan-chua.module'
import { NguoiDungModule } from './nguoi-dung/nguoi-dung.module'
import { NhaKhoModule } from './nha-kho/nha-kho.module'
import { NhaSanXuatModule } from './nha-san-xuat/nha-san-xuat.module'
import { NhomHangHoaModule } from './nhom-hang-hoa/nhom-hang-hoa.module'
import { NhomQuyenModule } from './nhom-quyen/nhom-quyen.module'
import { NhomSanPhamModule } from './nhom-san-pham/nhom-san-pham.module'
import { PhiGiaoModule } from './phi-giao/phi-giao.module'
import { PhuongXaModule } from './phuong-xa/phuong-xa.module'
import { SanPhamModule } from './san-pham/san-pham.module'
import { ThoiHanModule } from './thoi-han/thoi-han.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: loadEnv,
    }),
    DbModule,
    AuthModule,
    HealthModule,
    KhachHangModule,
    NguoiDungModule,
    NhomQuyenModule,
    ChiNhanhModule,
    DonViTinhModule,
    NhomSanPhamModule,
    NhomHangHoaModule,
    NhaSanXuatModule,
    ThoiHanModule,
    NhaKhoModule,
    PhuongXaModule,
    KhuVucModule,
    LoiSuaChuaModule,
    NganChuaModule,
    SanPhamModule,
    HangHoaModule,
    ModelModule,
    PhiGiaoModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
