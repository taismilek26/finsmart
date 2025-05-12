# FinSmart - Ứng dụng Quản lý Tài chính

FinSmart là ứng dụng quản lý tài chính đa nền tảng với trọng tâm vào việc giải quyết các thách thức kết nối và cấu hình cơ sở dữ liệu một cách thông minh và dễ dàng.

## Tính năng chính

- **Quản lý thu chi**: Theo dõi và phân loại các khoản thu chi của bạn
- **Phân tích tài chính**: Biểu đồ phân tích trực quan về tình hình tài chính
- **Dự báo thu chi**: Dự báo thu chi trong tương lai dựa trên AI
- **Gợi ý tài chính**: Nhận các gợi ý cá nhân hóa để cải thiện tài chính
- **Giao diện đa ngôn ngữ**: Hỗ trợ tiếng Việt

## Công nghệ sử dụng

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Cơ sở dữ liệu**: PostgreSQL
- **ORM**: Drizzle ORM
- **AI**: OpenAI API
- **Xác thực**: Passport.js

## Chạy ứng dụng trên Replit

1. Mở dự án trên Replit
2. Sử dụng nút "Run" để khởi động ứng dụng

## Chạy ứng dụng trên máy tính cá nhân

### Yêu cầu hệ thống

- Node.js >= 18
- PostgreSQL >= 14
- npm hoặc yarn

### Bước 1: Cài đặt PostgreSQL

1. Tải và cài đặt PostgreSQL từ trang chủ: https://www.postgresql.org/download/
2. Ghi nhớ mật khẩu user 'postgres' trong quá trình cài đặt
3. Đảm bảo dịch vụ PostgreSQL đang chạy (kiểm tra trong Services hoặc Task Manager)

### Bước 2: Tạo cơ sở dữ liệu

1. Mở pgAdmin hoặc công cụ quản lý PostgreSQL
2. Kết nối đến máy chủ PostgreSQL cục bộ
3. Tạo cơ sở dữ liệu mới với tên 'finsmart'
   - Nhấp chuột phải vào "Databases" -> "Create" -> "Database"
   - Đặt tên là 'finsmart' và lưu

### Bước 3: Cài đặt và chạy ứng dụng

#### Windows (PowerShell)

```powershell
# Clone dự án
git clone [URL_dự_án]
cd finsmart

# Cài đặt các gói phụ thuộc
npm install

# Thiết lập biến môi trường
$env:DATABASE_URL="postgresql://postgres:mật_khẩu@localhost:5432/finsmart"
$env:SESSION_SECRET="dev_secret_key"

# Tạo cấu trúc cơ sở dữ liệu
npx drizzle-kit push --force --config=./drizzle.config.ts

# Tạo dữ liệu mẫu
npx tsx db/seed-local.ts

# Khởi động ứng dụng
npx tsx server/index.ts
```

#### Linux/macOS

```bash
# Clone dự án
git clone [URL_dự_án]
cd finsmart

# Cài đặt các gói phụ thuộc
npm install

# Thiết lập biến môi trường
export DATABASE_URL="postgresql://postgres:mật_khẩu@localhost:5432/finsmart"
export SESSION_SECRET="dev_secret_key"

# Tạo cấu trúc cơ sở dữ liệu
npx drizzle-kit push --force --config=./drizzle.config.ts

# Tạo dữ liệu mẫu
npx tsx db/seed-local.ts

# Khởi động ứng dụng
npx tsx server/index.ts
```

#### Sử dụng script tự động

Dự án cung cấp các script tự động để dễ dàng chạy ứng dụng:

- **Windows**: Chạy `run-local.bat` hoặc `node run-local.js`
- **Linux/macOS**: Chạy `bash run-local.sh` hoặc `node run-local.js`

Sau khi chạy, truy cập ứng dụng tại: http://localhost:5000

### Thông tin đăng nhập

- **Admin**: username `admin`, password `admin123`
- **User**: username `nguyenthanh`, password `user123`

## License

[MIT](LICENSE)