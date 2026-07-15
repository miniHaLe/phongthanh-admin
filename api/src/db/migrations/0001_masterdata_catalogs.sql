CREATE TYPE "public"."thoi_han_loai" AS ENUM('Tháng', 'Năm');--> statement-breakpoint
CREATE TABLE "don_vi_tinh" (
	"id" text PRIMARY KEY NOT NULL,
	"ten_dvt" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "nhom_san_pham" (
	"id" text PRIMARY KEY NOT NULL,
	"ten_nhom_sp" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "nhom_hang_hoa" (
	"id" text PRIMARY KEY NOT NULL,
	"ma_nhom" text,
	"ten_nhom" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "nha_san_xuat" (
	"id" text PRIMARY KEY NOT NULL,
	"ma_nsx" text,
	"ten_nsx" text NOT NULL,
	"ghi_chu" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "thoi_han" (
	"id" text PRIMARY KEY NOT NULL,
	"ten" text NOT NULL,
	"loai" "thoi_han_loai" NOT NULL,
	"thoi_gian" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "nha_kho" (
	"id" text PRIMARY KEY NOT NULL,
	"ma_nha_kho" text NOT NULL,
	"ten_nha_kho" text NOT NULL,
	"chi_nhanh_id" text NOT NULL,
	"dia_chi" text,
	"kho_xac" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "phuong_xa" (
	"id" text PRIMARY KEY NOT NULL,
	"ten_phuong_xa" text NOT NULL,
	"tinh_id" text NOT NULL,
	"quan_id" text NOT NULL,
	"khoang_cach" integer NOT NULL,
	"tien_cong" integer NOT NULL,
	"tuyen_id" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "khu_vuc" (
	"id" text PRIMARY KEY NOT NULL,
	"ten_khu_vuc" text NOT NULL,
	"tinh_id" text NOT NULL,
	"quan_id" text NOT NULL,
	"xa_id" text NOT NULL,
	"cay_so" integer NOT NULL,
	"tien_cong" integer NOT NULL,
	"tien_cong_2" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "loi_sua_chua" (
	"id" text PRIMARY KEY NOT NULL,
	"branch_id" text NOT NULL,
	"nhom_san_pham_id" text NOT NULL,
	"ten_loi" text NOT NULL,
	"tien_cong" integer NOT NULL,
	"tien_cong_dv" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ngan_chua" (
	"id" text PRIMARY KEY NOT NULL,
	"ten_ngan" text NOT NULL,
	"nha_kho_id" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "san_pham" (
	"id" text PRIMARY KEY NOT NULL,
	"ma_sp" text,
	"ten_sp" text NOT NULL,
	"nhom_san_pham_id" text NOT NULL,
	"tien_khoan" bigint,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "model" (
	"id" text PRIMARY KEY NOT NULL,
	"ten_model" text NOT NULL,
	"ma_model" text,
	"nha_san_xuat_id" text NOT NULL,
	"san_pham_id" text NOT NULL,
	"nguoi_tao" text NOT NULL,
	"ghi_chu" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hang_hoa" (
	"id" text PRIMARY KEY NOT NULL,
	"ma_hh" text NOT NULL,
	"ma_hh_phu" text,
	"ten_hh" text NOT NULL,
	"ten_tieng_anh" text,
	"nhom_hang_hoa_id" text NOT NULL,
	"nha_san_xuat_id" text,
	"model_id" text,
	"model_dung_chung" boolean DEFAULT false NOT NULL,
	"model_dung_chung_text" text,
	"don_vi_tinh_id" text NOT NULL,
	"co_serial" boolean DEFAULT false NOT NULL,
	"phat_sinh_tu_dong" boolean DEFAULT false NOT NULL,
	"vi_tri_linh_kien" text,
	"hinh" text,
	"gia_mua" bigint,
	"gia_ban_si" bigint,
	"gia_ban_le" bigint,
	"nguoi_tao" text NOT NULL,
	"gia_nhap" bigint,
	"gia_ban" bigint,
	"ton_kho" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "phi_giao" (
	"id" text PRIMARY KEY NOT NULL,
	"san_pham_id" text,
	"ten_phi" text NOT NULL,
	"so_tien" integer NOT NULL,
	"loai_phi" integer NOT NULL,
	"ghi_chu" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "nha_kho" ADD CONSTRAINT "nha_kho_chi_nhanh_id_chi_nhanh_id_fk" FOREIGN KEY ("chi_nhanh_id") REFERENCES "public"."chi_nhanh"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phuong_xa" ADD CONSTRAINT "phuong_xa_tinh_id_tinh_id_fk" FOREIGN KEY ("tinh_id") REFERENCES "public"."tinh"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phuong_xa" ADD CONSTRAINT "phuong_xa_quan_id_quan_id_fk" FOREIGN KEY ("quan_id") REFERENCES "public"."quan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khu_vuc" ADD CONSTRAINT "khu_vuc_tinh_id_tinh_id_fk" FOREIGN KEY ("tinh_id") REFERENCES "public"."tinh"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khu_vuc" ADD CONSTRAINT "khu_vuc_quan_id_quan_id_fk" FOREIGN KEY ("quan_id") REFERENCES "public"."quan"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khu_vuc" ADD CONSTRAINT "khu_vuc_xa_id_xa_id_fk" FOREIGN KEY ("xa_id") REFERENCES "public"."xa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "loi_sua_chua" ADD CONSTRAINT "loi_sua_chua_branch_id_chi_nhanh_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."chi_nhanh"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ngan_chua" ADD CONSTRAINT "ngan_chua_nha_kho_id_nha_kho_id_fk" FOREIGN KEY ("nha_kho_id") REFERENCES "public"."nha_kho"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "san_pham" ADD CONSTRAINT "san_pham_nhom_san_pham_id_nhom_san_pham_id_fk" FOREIGN KEY ("nhom_san_pham_id") REFERENCES "public"."nhom_san_pham"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "model_nha_san_xuat_id_nha_san_xuat_id_fk" FOREIGN KEY ("nha_san_xuat_id") REFERENCES "public"."nha_san_xuat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "model_san_pham_id_san_pham_id_fk" FOREIGN KEY ("san_pham_id") REFERENCES "public"."san_pham"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hang_hoa" ADD CONSTRAINT "hang_hoa_nhom_hang_hoa_id_nhom_hang_hoa_id_fk" FOREIGN KEY ("nhom_hang_hoa_id") REFERENCES "public"."nhom_hang_hoa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hang_hoa" ADD CONSTRAINT "hang_hoa_nha_san_xuat_id_nha_san_xuat_id_fk" FOREIGN KEY ("nha_san_xuat_id") REFERENCES "public"."nha_san_xuat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hang_hoa" ADD CONSTRAINT "hang_hoa_model_id_model_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."model"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hang_hoa" ADD CONSTRAINT "hang_hoa_don_vi_tinh_id_don_vi_tinh_id_fk" FOREIGN KEY ("don_vi_tinh_id") REFERENCES "public"."don_vi_tinh"("id") ON DELETE no action ON UPDATE no action;