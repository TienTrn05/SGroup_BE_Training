# Buổi 9 — CRUD users và authentication với PostgreSQL

Luồng xử lý: route → controller → service → repository → PostgreSQL.
`src/repository/users.repository.js` truy vấn bảng `public.users` theo
`../SQL/sgroup_lastest.sql`. Đã bỏ file dữ liệu JSON và toàn bộ phần đọc/ghi file cũ.
Giữ nguyên cấu trúc SQL và database hiện có.

## Chạy ứng dụng

Trong thư mục `Buoi7`:

```powershell
npm install
npm start
```

Cấu hình kết nối lấy từ `Buoi7/.env`: `DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD`, `DB_NAME`; cổng HTTP lấy từ `PORT` (mặc định 3000).
Database cần có bảng `public.users` và kiểu `public.user_role` như database hiện tại.
Ứng dụng không tự tạo hoặc sửa bảng.

## API

| Method | URL | Chức năng |
| --- | --- | --- |
| GET | `/users` | Danh sách user theo id |
| GET | `/users/:id` | Chi tiết user |
| POST | `/users` | Tạo user |
| PATCH | `/users/:id` | Cập nhật một hoặc nhiều trường |
| DELETE | `/users/:id` | Xóa user |

Ví dụ body JSON cho `POST http://localhost:3000/users`:

```json
{
  "name": "Nguyen Van An",
  "email": "an@example.com",
  "password": "ExamplePass123!",
  "role": "MEMBER"
}
```

`name` dài 2–100 ký tự, `email` tối đa 255 ký tự, `password` dài 8–128 ký tự.
`role` nhận `ADMIN` hoặc `MEMBER`, mặc định `MEMBER` khi tạo.
`PATCH` nhận ít nhất một trong các trường này.
`age`, `id`, `password_hash`, `created_at`, `updated_at` và các trường khác không được nhận trong body.
PostgreSQL tự sinh `id`; service băm `password` bằng scrypt với salt ngẫu nhiên
rồi lưu vào `password_hash`. API trả `id`, `name`, `email`, `role`, `created_at`, `updated_at`.

Database tự đặt `created_at`, `updated_at` khi tạo user. Repository đặt lại
`updated_at = CURRENT_TIMESTAMP` khi sửa; `created_at` giữ nguyên.
Hai cột trong SQL là `timestamp without time zone`; API tuần tự hóa giá trị Date
do `pg` đọc thành chuỗi ISO. Nên giữ múi giờ PostgreSQL và Node.js thống nhất.

Email được trim và chuyển chữ thường khi lưu. Service kiểm tra email trùng
không phân biệt hoa/thường, đồng thời xử lý ràng buộc `users_email_key` sẵn có.
Ràng buộc SQL gốc phân biệt hoa/thường; thao tác ghi trực tiếp ngoài API vẫn
tuân theo SQL gốc.

Lỗi dữ liệu đầu vào trả 400; user không tồn tại trả 404; email trùng hoặc
xóa user đang được bảng khác tham chiếu với `ON DELETE RESTRICT` trả 409.
Nếu user chỉ được tham chiếu qua `classes.mentor_id` hoặc `submissions.reviewed_by`,
database cho phép xóa và tự đặt các tham chiếu đó thành `NULL`, đúng SQL mới.
## Authentication

| Method | URL | Dữ liệu | Kết quả |
| --- | --- | --- | --- |
| POST | `/auth/register` | Body JSON: `name`, `email`, `password` | Tạo tài khoản `MEMBER` |
| POST | `/auth/login` | Body JSON: `email`, `password` | Trả `user`, `accessToken`, `refreshToken` |
| POST | `/auth/refresh` | Body JSON: `refreshToken` | Trả access token mới |
| GET | `/auth/me` | Header `Authorization: Bearer <accessToken>` | Trả tài khoản đang đăng nhập |

Đăng ký không nhận `role`; mật khẩu được băm bằng scrypt với salt ngẫu nhiên trước khi lưu vào `password_hash`. Access token sống 15 phút; refresh token sống 7 ngày. `/auth/me` chỉ nhận access token hợp lệ và kiểm tra tài khoản còn tồn tại. Refresh token chưa có cơ chế thu hồi trước hạn.

Thêm `JWT_REFRESH_SECRET` vào `.env` (chuỗi ngẫu nhiên ít nhất 32 byte, khác `JWT_SECRET`). Có thể tạo secret bằng `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"`. Ứng dụng kiểm tra cả hai secret khi khởi động. Các route CRUD `/users` vẫn công khai như bài trước.

## Kiểm thử

```powershell
npm test
```

Test mặc định kiểm tra băm mật khẩu, JWT, validation và middleware mà không cần database. Để kiểm tra trọn luồng với PostgreSQL, chạy `$env:RUN_DB_TEST='1'; node --test test/auth.test.js test/auth.integration.test.js` trong PowerShell. Test tạo một user với email ngẫu nhiên và xóa user đó sau khi chạy.
