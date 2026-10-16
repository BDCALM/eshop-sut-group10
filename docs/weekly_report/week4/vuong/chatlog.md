# NHẬT KÝ TRÒ CHUYỆN VỚI AI (AI CHAT LOG) - TUẦN 1

- **Môn học:** Kiểm thử phần mềm (Software Testing)
- **Sinh viên:** [Điền họ và tên]
- **MSSV:** [Điền MSSV]
- **Công cụ:** ChatGPT / Claude / Gemini / Copilot
- **Thời gian:** [DD/MM/YYYY]

---

> Hướng dẫn: Bạn chỉ cần copy nội dung câu hỏi và câu trả lời của AI dán vào các phần dưới đây. Có thể nhân bản mục "Phiên chat" nếu có nhiều lần trao đổi khác nhau.

---

## Phiên chat 1: [Ghi chủ đề, ví dụ: Gợi ý Test Cases cho chức năng Login]

- **Thời gian:** [Giờ, Ngày]
- **Công cụ sử dụng:** ChatGPT (GPT-4o)

### Prompt (Sinh viên):
```text
Viết cho tôi các test case kiểm thử chức năng Login (bao gồm ca kiểm thử thành công, thất bại và trường hợp biên) cho hệ thống e-commerce.
```

### Phản hồi từ AI (Assistant):
```text
Dưới đây là danh sách test cases gợi ý:

1. TC01 - Đăng nhập thành công:
   - Input: Email hợp lệ, mật khẩu đúng
   - Expected: Điều hướng đến trang chủ, lưu session/token.

2. TC02 - Đăng nhập sai mật khẩu:
   - Input: Email đúng, mật khẩu sai
   - Expected: Báo lỗi "Tài khoản hoặc mật khẩu không chính xác".

3. TC03 - Trường hợp biên (SQL Injection):
   - Input: ' OR '1'='1
   - Expected: Hệ thống từ chối đăng nhập và báo lỗi hợp lệ.
```

---

## Phiên chat 2: [Ghi chủ đề tiếp theo, ví dụ: Giải thích lỗi Unit Test]

- **Thời gian:** [Giờ, Ngày]
- **Công cụ sử dụng:** GitHub Copilot / Claude

### Prompt (Sinh viên):
```text
[Dán câu hỏi của bạn vào đây]
```

### Phản hồi từ AI (Assistant):
```text
[Dán câu trả lời của AI vào đây]
```

---

## Khung mẫu trống để sao chép thêm:

<!-- Sao chép đoạn bên dưới nếu bạn có thêm phiên chat khác -->
### Prompt (Sinh viên):
```text
...
```

### Phản hồi từ AI (Assistant):
```text
...
```
