CREATE TABLE "model" (
	"id" text PRIMARY KEY NOT NULL,
	"ten_model" text NOT NULL,
	"ten_model_normalized" text NOT NULL,
	"nha_san_xuat_id" text NOT NULL,
	"san_pham_id" text NOT NULL,
	"ghi_chu" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ngan_hang" (
	"id" text PRIMARY KEY NOT NULL,
	"ma_ngan_hang" text NOT NULL,
	"ten_ngan_hang" text NOT NULL,
	"dia_chi" text,
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
CREATE TABLE "san_pham" (
	"id" text PRIMARY KEY NOT NULL,
	"ma_sp" text,
	"ten_sp" text NOT NULL,
	"nhom_san_pham_id" text,
	"tien_khoan" integer,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "phuong_xa" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"type" text NOT NULL,
	"province_code" text NOT NULL,
	"effective_from" date NOT NULL,
	"snapshot_version" text NOT NULL,
	"source_document" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tinh_thanh" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"normalized_name" text NOT NULL,
	"type" text NOT NULL,
	"effective_from" date NOT NULL,
	"snapshot_version" text NOT NULL,
	"source_document" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "khach_hang" ADD COLUMN "ten_duong" text;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD COLUMN "tinh_thanh_code" text;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD COLUMN "phuong_xa_code" text;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD COLUMN "ma_so_thue" text;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD COLUMN "ngan_hang_id" text;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD COLUMN "so_tai_khoan" text;--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "model_nha_san_xuat_id_nha_san_xuat_id_fk" FOREIGN KEY ("nha_san_xuat_id") REFERENCES "public"."nha_san_xuat"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "model" ADD CONSTRAINT "model_san_pham_id_san_pham_id_fk" FOREIGN KEY ("san_pham_id") REFERENCES "public"."san_pham"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phuong_xa" ADD CONSTRAINT "phuong_xa_province_code_tinh_thanh_code_fk" FOREIGN KEY ("province_code") REFERENCES "public"."tinh_thanh"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "model_nha_san_xuat_id_idx" ON "model" USING btree ("nha_san_xuat_id");--> statement-breakpoint
CREATE INDEX "model_san_pham_id_idx" ON "model" USING btree ("san_pham_id");--> statement-breakpoint
CREATE UNIQUE INDEX "model_parent_name_unique" ON "model" USING btree ("nha_san_xuat_id","san_pham_id","ten_model_normalized");--> statement-breakpoint
CREATE UNIQUE INDEX "ngan_hang_ma_unique" ON "ngan_hang" USING btree ("ma_ngan_hang");--> statement-breakpoint
CREATE UNIQUE INDEX "ngan_hang_ten_normalized_unique" ON "ngan_hang" USING btree (lower(trim("ten_ngan_hang")));--> statement-breakpoint
CREATE UNIQUE INDEX "nha_san_xuat_ten_normalized_unique" ON "nha_san_xuat" USING btree (lower(trim("ten_nsx")));--> statement-breakpoint
CREATE UNIQUE INDEX "san_pham_ten_normalized_unique" ON "san_pham" USING btree (lower(trim("ten_sp")));--> statement-breakpoint
CREATE INDEX "phuong_xa_province_code_idx" ON "phuong_xa" USING btree ("province_code");--> statement-breakpoint
CREATE INDEX "phuong_xa_normalized_name_idx" ON "phuong_xa" USING btree ("normalized_name");--> statement-breakpoint
CREATE UNIQUE INDEX "phuong_xa_province_code_code_unique" ON "phuong_xa" USING btree ("province_code","code");--> statement-breakpoint
ALTER TABLE "khach_hang" ADD CONSTRAINT "khach_hang_tinh_thanh_code_tinh_thanh_code_fk" FOREIGN KEY ("tinh_thanh_code") REFERENCES "public"."tinh_thanh"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD CONSTRAINT "khach_hang_phuong_xa_code_phuong_xa_code_fk" FOREIGN KEY ("phuong_xa_code") REFERENCES "public"."phuong_xa"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD CONSTRAINT "khach_hang_ngan_hang_id_ngan_hang_id_fk" FOREIGN KEY ("ngan_hang_id") REFERENCES "public"."ngan_hang"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "khach_hang" ADD CONSTRAINT "khach_hang_tinh_thanh_phuong_xa_fk" FOREIGN KEY ("tinh_thanh_code","phuong_xa_code") REFERENCES "public"."phuong_xa"("province_code","code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "khach_hang_tinh_thanh_code_idx" ON "khach_hang" USING btree ("tinh_thanh_code");--> statement-breakpoint
CREATE INDEX "khach_hang_phuong_xa_code_idx" ON "khach_hang" USING btree ("phuong_xa_code");--> statement-breakpoint
CREATE INDEX "khach_hang_ngan_hang_id_idx" ON "khach_hang" USING btree ("ngan_hang_id");--> statement-breakpoint
ALTER TABLE "khach_hang" ADD CONSTRAINT "khach_hang_location_pair_check" CHECK (("khach_hang"."tinh_thanh_code" IS NULL AND "khach_hang"."phuong_xa_code" IS NULL) OR ("khach_hang"."tinh_thanh_code" IS NOT NULL AND "khach_hang"."phuong_xa_code" IS NOT NULL));--> statement-breakpoint
ALTER TABLE "khach_hang" ADD CONSTRAINT "khach_hang_ma_so_thue_check" CHECK ("khach_hang"."ma_so_thue" IS NULL OR "khach_hang"."ma_so_thue" = '' OR "khach_hang"."ma_so_thue" ~ '^[0-9]{10}(-[0-9]{3})?$');
