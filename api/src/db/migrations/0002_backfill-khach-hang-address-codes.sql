-- Backfill only frozen seed customers whose legacy administrative unit has a
-- single authoritative successor in the pinned Decision 19 conversion table.
-- Rows from xa-thang-loi, xa-nghia-xuan, and xa-dak-rmoan remain NULL because
-- the frozen source does not provide a safe mapping for those fixture units.
WITH expected_seed_rows (
  id,
  tinh_id,
  quan_id,
  phuong_xa_id,
  dia_chi,
  created_at,
  updated_at,
  tinh_thanh_code,
  phuong_xa_code
) AS (
  VALUES
  ('kh-50'::text, 'tinh-dak-nong'::text, 'quan-cu-jut'::text, 'xa-tam-thang'::text, '162 Trần Phú'::text, '2026-02-09T10:06:18.647Z'::timestamptz, '2026-06-26T10:19:34.727Z'::timestamptz, '68'::text, '24640'::text),
  ('kh-49'::text, 'tinh-dak-nong'::text, 'quan-dak-rlap'::text, 'xa-kien-duc'::text, '17 Bà Triệu'::text, '2026-02-11T23:18:46.925Z'::timestamptz, '2026-06-20T12:01:45.368Z'::timestamptz, '68'::text, '24733'::text),
  ('kh-48'::text, 'tinh-dak-lak'::text, 'quan-cu-mgar'::text, 'xa-quang-phu'::text, '210 Đinh Tiên Hoàng'::text, '2026-02-13T23:14:09.033Z'::timestamptz, NULL::timestamptz, '66'::text, '24259'::text),
  ('kh-47'::text, 'tinh-dak-lak'::text, 'quan-ea-hleo'::text, 'xa-ea-drang'::text, '214 Bà Triệu'::text, '2026-02-17T21:47:37.827Z'::timestamptz, NULL::timestamptz, '66'::text, '24181'::text),
  ('kh-46'::text, 'tinh-dak-nong'::text, 'quan-dak-rlap'::text, 'xa-kien-duc'::text, '19 Nguyễn Tất Thành'::text, '2026-02-22T07:49:24.928Z'::timestamptz, NULL::timestamptz, '68'::text, '24733'::text),
  ('kh-45'::text, 'tinh-dak-nong'::text, 'quan-gia-nghia'::text, 'xa-nghia-duc'::text, '21 Quang Trung'::text, '2026-02-24T14:42:49.877Z'::timestamptz, '2026-06-11T11:41:19.344Z'::timestamptz, '68'::text, '24611'::text),
  ('kh-44'::text, 'tinh-dak-lak'::text, 'quan-cu-mgar'::text, 'xa-ea-pok'::text, '16 Lý Thường Kiệt'::text, '2026-02-26T08:07:18.807Z'::timestamptz, NULL::timestamptz, '66'::text, '24259'::text),
  ('kh-41'::text, 'tinh-dak-lak'::text, 'quan-bmt'::text, 'xa-tu-an'::text, '175 Đinh Tiên Hoàng'::text, '2026-03-06T18:07:44.956Z'::timestamptz, NULL::timestamptz, '66'::text, '24133'::text),
  ('kh-40'::text, 'tinh-dak-lak'::text, 'quan-bmt'::text, 'xa-tan-loi'::text, '240 Ngô Quyền'::text, '2026-03-11T02:38:38.782Z'::timestamptz, NULL::timestamptz, '66'::text, '24133'::text),
  ('kh-39'::text, 'tinh-dak-nong'::text, 'quan-gia-nghia'::text, 'xa-nghia-duc'::text, '114 Lê Duẩn'::text, '2026-03-14T15:13:04.892Z'::timestamptz, NULL::timestamptz, '68'::text, '24611'::text),
  ('kh-38'::text, 'tinh-dak-lak'::text, 'quan-bmt'::text, 'xa-tan-loi'::text, '137 Quang Trung'::text, '2026-03-15T20:11:20.621Z'::timestamptz, NULL::timestamptz, '66'::text, '24133'::text),
  ('kh-37'::text, 'tinh-dak-nong'::text, 'quan-gia-nghia'::text, 'xa-nghia-duc'::text, '76 Phan Bội Châu'::text, '2026-03-20T11:55:08.848Z'::timestamptz, NULL::timestamptz, '68'::text, '24611'::text),
  ('kh-36'::text, 'tinh-dak-nong'::text, 'quan-dak-rlap'::text, 'xa-kien-duc'::text, '143 Ngô Quyền'::text, '2026-03-21T22:05:05.676Z'::timestamptz, '2026-06-21T17:59:44.157Z'::timestamptz, '68'::text, '24733'::text),
  ('kh-35'::text, 'tinh-dak-nong'::text, 'quan-gia-nghia'::text, 'xa-nghia-phu'::text, '21 Phan Bội Châu'::text, '2026-03-27T06:18:14.477Z'::timestamptz, '2026-06-22T05:35:51.045Z'::timestamptz, '68'::text, '24615'::text),
  ('kh-34'::text, 'tinh-dak-nong'::text, 'quan-cu-jut'::text, 'xa-tam-thang'::text, '43 Trần Phú'::text, '2026-03-27T17:04:39.771Z'::timestamptz, NULL::timestamptz, '68'::text, '24640'::text),
  ('kh-33'::text, 'tinh-dak-nong'::text, 'quan-gia-nghia'::text, 'xa-nghia-duc'::text, '58 Trần Phú'::text, '2026-03-31T09:06:36.099Z'::timestamptz, NULL::timestamptz, '68'::text, '24611'::text),
  ('kh-32'::text, 'tinh-dak-nong'::text, 'quan-gia-nghia'::text, 'xa-nghia-duc'::text, '130 Phan Bội Châu'::text, '2026-04-03T19:52:42.716Z'::timestamptz, NULL::timestamptz, '68'::text, '24611'::text),
  ('kh-31'::text, 'tinh-dak-lak'::text, 'quan-cu-mgar'::text, 'xa-ea-pok'::text, '194 Đinh Tiên Hoàng'::text, '2026-04-07T02:18:50.565Z'::timestamptz, NULL::timestamptz, '66'::text, '24259'::text),
  ('kh-29'::text, 'tinh-dak-nong'::text, 'quan-cu-jut'::text, 'xa-ea-tling'::text, '34 Lý Thường Kiệt'::text, '2026-04-14T08:00:55.610Z'::timestamptz, NULL::timestamptz, '68'::text, '24640'::text),
  ('kh-28'::text, 'tinh-dak-lak'::text, 'quan-cu-mgar'::text, 'xa-ea-pok'::text, '188 Đinh Tiên Hoàng'::text, '2026-04-14T17:27:43.402Z'::timestamptz, '2026-06-16T16:18:21.850Z'::timestamptz, '66'::text, '24259'::text),
  ('kh-27'::text, 'tinh-dak-nong'::text, 'quan-cu-jut'::text, 'xa-tam-thang'::text, '153 Lý Thường Kiệt'::text, '2026-04-20T11:27:54.528Z'::timestamptz, NULL::timestamptz, '68'::text, '24640'::text),
  ('kh-25'::text, 'tinh-dak-lak'::text, 'quan-bmt'::text, 'xa-tan-loi'::text, '66 Lê Duẩn'::text, '2026-04-25T08:21:29.888Z'::timestamptz, NULL::timestamptz, '66'::text, '24133'::text),
  ('kh-24'::text, 'tinh-dak-lak'::text, 'quan-ea-hleo'::text, 'xa-ea-hleo'::text, '12 Hùng Vương'::text, '2026-04-27T07:56:32.036Z'::timestamptz, '2026-06-19T09:18:37.840Z'::timestamptz, '66'::text, '24184'::text),
  ('kh-23'::text, 'tinh-dak-nong'::text, 'quan-cu-jut'::text, 'xa-tam-thang'::text, '5 Nguyễn Tất Thành'::text, '2026-05-02T12:22:50.248Z'::timestamptz, '2026-06-18T21:18:23.424Z'::timestamptz, '68'::text, '24640'::text),
  ('kh-22'::text, 'tinh-dak-lak'::text, 'quan-cu-mgar'::text, 'xa-quang-phu'::text, '35 Quang Trung'::text, '2026-05-03T10:55:05.074Z'::timestamptz, NULL::timestamptz, '66'::text, '24259'::text),
  ('kh-21'::text, 'tinh-dak-nong'::text, 'quan-gia-nghia'::text, 'xa-nghia-duc'::text, '209 Lê Duẩn'::text, '2026-05-07T21:04:47.723Z'::timestamptz, '2026-06-08T14:50:17.295Z'::timestamptz, '68'::text, '24611'::text),
  ('kh-19'::text, 'tinh-dak-lak'::text, 'quan-cu-mgar'::text, 'xa-quang-phu'::text, '177 Hùng Vương'::text, '2026-05-12T03:31:52.501Z'::timestamptz, '2026-06-18T06:13:53.601Z'::timestamptz, '66'::text, '24259'::text),
  ('kh-18'::text, 'tinh-dak-nong'::text, 'quan-gia-nghia'::text, 'xa-nghia-duc'::text, '65 Ngô Quyền'::text, '2026-05-15T16:27:23.623Z'::timestamptz, '2026-06-22T18:11:04.313Z'::timestamptz, '68'::text, '24611'::text),
  ('kh-17'::text, 'tinh-dak-lak'::text, 'quan-ea-hleo'::text, 'xa-ea-hleo'::text, '4 Quang Trung'::text, '2026-05-20T13:31:23.981Z'::timestamptz, NULL::timestamptz, '66'::text, '24184'::text),
  ('kh-16'::text, 'tinh-dak-lak'::text, 'quan-cu-mgar'::text, 'xa-quang-phu'::text, '209 Lý Thường Kiệt'::text, '2026-05-21T20:10:32.517Z'::timestamptz, NULL::timestamptz, '66'::text, '24259'::text),
  ('kh-15'::text, 'tinh-dak-lak'::text, 'quan-cu-mgar'::text, 'xa-ea-pok'::text, '41 Đinh Tiên Hoàng'::text, '2026-05-25T15:07:52.803Z'::timestamptz, NULL::timestamptz, '66'::text, '24259'::text),
  ('kh-14'::text, 'tinh-dak-nong'::text, 'quan-cu-jut'::text, 'xa-tam-thang'::text, '230 Trần Phú'::text, '2026-05-26T17:54:24.932Z'::timestamptz, NULL::timestamptz, '68'::text, '24640'::text),
  ('kh-13'::text, 'tinh-dak-lak'::text, 'quan-cu-mgar'::text, 'xa-quang-phu'::text, '190 Hùng Vương'::text, '2026-06-01T10:39:41.079Z'::timestamptz, '2026-06-28T14:38:47.344Z'::timestamptz, '66'::text, '24259'::text),
  ('kh-12'::text, 'tinh-dak-nong'::text, 'quan-gia-nghia'::text, 'xa-nghia-phu'::text, '225 Lý Thường Kiệt'::text, '2026-06-03T01:06:28.191Z'::timestamptz, '2026-06-27T16:52:16.588Z'::timestamptz, '68'::text, '24615'::text),
  ('kh-11'::text, 'tinh-dak-nong'::text, 'quan-gia-nghia'::text, 'xa-nghia-duc'::text, '168 Lý Thường Kiệt'::text, '2026-06-04T16:18:48.636Z'::timestamptz, '2026-06-28T03:57:20.097Z'::timestamptz, '68'::text, '24611'::text),
  ('kh-10'::text, 'tinh-dak-lak'::text, 'quan-cu-mgar'::text, 'xa-quang-phu'::text, '181 Lý Thường Kiệt'::text, '2026-06-08T07:36:13.091Z'::timestamptz, '2026-06-27T16:16:45.458Z'::timestamptz, '66'::text, '24259'::text),
  ('kh-9'::text, 'tinh-dak-nong'::text, 'quan-dak-rlap'::text, 'xa-kien-duc'::text, '144 Ngô Quyền'::text, '2026-06-12T04:19:10.426Z'::timestamptz, '2026-06-23T18:43:04.804Z'::timestamptz, '68'::text, '24733'::text),
  ('kh-8'::text, 'tinh-dak-lak'::text, 'quan-ea-hleo'::text, 'xa-ea-hleo'::text, '133 Đinh Tiên Hoàng'::text, '2026-06-13T19:15:25.572Z'::timestamptz, NULL::timestamptz, '66'::text, '24184'::text),
  ('kh-7'::text, 'tinh-dak-lak'::text, 'quan-ea-hleo'::text, 'xa-ea-hleo'::text, '47 Hùng Vương'::text, '2026-06-17T14:11:21.581Z'::timestamptz, '2026-06-16T08:41:19.171Z'::timestamptz, '66'::text, '24184'::text),
  ('kh-5'::text, 'tinh-dak-lak'::text, 'quan-ea-hleo'::text, 'xa-ea-drang'::text, '27 Trần Phú'::text, '2026-06-23T19:43:03.752Z'::timestamptz, NULL::timestamptz, '66'::text, '24181'::text),
  ('kh-4'::text, 'tinh-dak-nong'::text, 'quan-cu-jut'::text, 'xa-ea-tling'::text, '230 Trần Phú'::text, '2026-06-28T04:53:22.688Z'::timestamptz, NULL::timestamptz, '68'::text, '24640'::text),
  ('kh-3'::text, 'tinh-dak-lak'::text, 'quan-ea-hleo'::text, 'xa-ea-hleo'::text, '18 Lý Thường Kiệt'::text, '2026-06-28T14:51:01.094Z'::timestamptz, '2026-06-22T03:58:21.993Z'::timestamptz, '66'::text, '24184'::text),
  ('kh-2'::text, 'tinh-dak-lak'::text, 'quan-cu-mgar'::text, 'xa-ea-pok'::text, '196 Bà Triệu'::text, '2026-07-02T18:37:57.583Z'::timestamptz, NULL::timestamptz, '66'::text, '24259'::text),
  ('kh-1'::text, 'tinh-dak-nong'::text, 'quan-gia-nghia'::text, 'xa-nghia-duc'::text, '28 Hùng Vương'::text, '2026-07-05T17:32:00.531Z'::timestamptz, NULL::timestamptz, '68'::text, '24611'::text)
)
UPDATE khach_hang AS kh
SET
  tinh_thanh_code = expected.tinh_thanh_code,
  phuong_xa_code = expected.phuong_xa_code
FROM expected_seed_rows AS expected
WHERE kh.id = expected.id
  AND kh.tinh_thanh_code IS NULL
  AND kh.phuong_xa_code IS NULL
  AND kh.tinh_id IS NOT DISTINCT FROM expected.tinh_id
  AND kh.quan_id IS NOT DISTINCT FROM expected.quan_id
  AND kh.phuong_xa_id IS NOT DISTINCT FROM expected.phuong_xa_id
  AND kh.dia_chi IS NOT DISTINCT FROM expected.dia_chi
  AND kh.created_at IS NOT DISTINCT FROM expected.created_at
  AND kh.updated_at IS NOT DISTINCT FROM expected.updated_at;
