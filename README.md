# An Nhiên - Tâm Sự Ẩn Danh

Ứng dụng web cho phép người dùng chia sẻ tâm sự ẩn danh, nghe nhạc, podcast và tương tác với AI thông qua giao diện chat.

## Tính năng

- **Tâm sự ẩn danh**: Chia sẻ câu chuyện cá nhân mà không lộ danh tính
- **Trình phát nhạc**: Nghe nhạc trực tiếp trong ứng dụng
- **Podcast**: Khám phá và nghe các podcast thú vị
- **Chat với AI**: Tương tác với AI sử dụng Google GenAI
- **Bảng điều khiển quản trị**: Quản lý nội dung và người dùng (cho admin)
- **Xác thực**: Đăng nhập/đăng ký để truy cập các tính năng nâng cao
- **Lưu trữ**: Lưu trữ dữ liệu cục bộ và đám mây

## Cài đặt

1. Clone repository:
   ```bash
   git clone <repository-url>
   cd an-nhiên---tâm-sự-ẩn-danh
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Tạo file cấu hình môi trường nếu cần (cho Google GenAI API key).

4. Chạy ứng dụng:
   ```bash
   npm run dev
   ```

## Sử dụng

- Mở trình duyệt và truy cập `http://localhost:5173` (hoặc cổng mà Vite chỉ định)
- Đăng ký tài khoản để bắt đầu chia sẻ
- Sử dụng các tab để chuyển đổi giữa tâm sự, nhạc, podcast và chat AI

## Xây dựng

Để build cho production:
```bash
npm run build
```

Để preview build:
```bash
npm run preview
```

## Công nghệ sử dụng

- **React 19**: Framework frontend
- **TypeScript**: Typing cho JavaScript
- **Vite**: Build tool và dev server
- **Google GenAI**: Tích hợp AI
- **CSS**: Styling (giả định, có thể cần kiểm tra)

## Cấu trúc dự án

- `components/`: Các component React
- `services/`: Dịch vụ cho AI và lưu trữ
- `types.ts`: Định nghĩa kiểu TypeScript
- `vite.config.ts`: Cấu hình Vite

## Đóng góp

Mời đóng góp! Vui lòng tạo issue hoặc pull request.

## Giấy phép

Private project - không công khai.
