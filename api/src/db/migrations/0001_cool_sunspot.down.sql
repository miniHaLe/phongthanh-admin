ALTER TABLE "khach_hang" DROP CONSTRAINT IF EXISTS "khach_hang_tinh_thanh_phuong_xa_fk";
ALTER TABLE "khach_hang" DROP CONSTRAINT IF EXISTS "khach_hang_location_pair_check";
ALTER TABLE "khach_hang" DROP CONSTRAINT IF EXISTS "khach_hang_ma_so_thue_check";
ALTER TABLE "khach_hang" DROP COLUMN IF EXISTS "ten_duong";
ALTER TABLE "khach_hang" DROP COLUMN IF EXISTS "tinh_thanh_code";
ALTER TABLE "khach_hang" DROP COLUMN IF EXISTS "phuong_xa_code";
ALTER TABLE "khach_hang" DROP COLUMN IF EXISTS "ma_so_thue";
ALTER TABLE "khach_hang" DROP COLUMN IF EXISTS "ngan_hang_id";
ALTER TABLE "khach_hang" DROP COLUMN IF EXISTS "so_tai_khoan";
DROP TABLE IF EXISTS "model";
DROP TABLE IF EXISTS "ngan_hang";
DROP TABLE IF EXISTS "san_pham";
DROP TABLE IF EXISTS "nha_san_xuat";
DROP TABLE IF EXISTS "phuong_xa";
DROP TABLE IF EXISTS "tinh_thanh";

-- This rollback is executed manually, outside Drizzle's migrator. Remove the
-- matching ledger row so a later `npm run db:migrate` can safely reapply 0001.
DELETE FROM drizzle.__drizzle_migrations
WHERE hash = 'b33584b9c4b0eed001111f524e1e1ff7761073295a6d1cc56a4c2b9676525f09';
