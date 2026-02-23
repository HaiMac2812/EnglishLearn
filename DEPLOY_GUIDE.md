# Triển khai English Flashcard App (Miễn phí)

## Kiến trúc: Render (Server) + MongoDB Atlas (Database)

---

## Bước 1: Tạo MongoDB Atlas (Database miễn phí)

1. Truy cập https://www.mongodb.com/atlas → **Register** (đăng ký miễn phí)
2. **Create Cluster** → chọn **M0 FREE** (512MB miễn phí vĩnh viễn)
3. Chọn region gần nhất (Singapore hoặc Hong Kong)
4. **Database Access** → tạo user/password (ghi nhớ lại)
5. **Network Access** → thêm IP: `0.0.0.0/0` (cho phép mọi nơi kết nối)
6. **Connect** → chọn **"Connect your application"** → copy connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/flashcard_english?retryWrites=true&w=majority
   ```
   Thay `<username>` và `<password>` bằng user đã tạo ở bước 4.

---

## Bước 2: Push code lên GitHub

Bạn đã có repo: `https://github.com/HaiMac2812/Noel.git`

Thêm file `.gitignore` rồi commit + push:
```bash
git add .
git commit -m "flashcard app"
git push
```

---

## Bước 3: Deploy lên Render

1. Truy cập https://render.com → đăng nhập bằng GitHub
2. **New** → **Web Service**
3. Chọn repo **HaiMac2812/Noel**
4. Cấu hình:
   - **Name**: `english-flashcard`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: **Free**
5. **Environment Variables** → thêm:
   - `MONGO_URI` = `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/flashcard_english?retryWrites=true&w=majority`
6. Click **Create Web Service**

---

## Bước 4: Seed dữ liệu

Sau khi deploy xong, mở terminal trên máy, chạy:
```bash
set MONGO_URI=mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/flashcard_english?retryWrites=true&w=majority
node seed.js
```

---

## Kết quả
App sẽ chạy tại: `https://english-flashcard.onrender.com`

> **Lưu ý:** Free tier của Render sẽ tự sleep sau 15 phút không hoạt động. Lần truy cập đầu tiên có thể mất ~30s để khởi động lại.
