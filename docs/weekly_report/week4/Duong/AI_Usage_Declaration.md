# BÁO CÁO TUYÊN BỐ SỬ DỤNG AI (AI USAGE DECLARATION)

- **Môn học:** Kiểm thử phần mềm (Software Testing)
- **Tuần báo cáo:** Tuần thực hành 4 (Week 4)
- **Họ và tên sinh viên:** Nguyễn Văn Bình Dương
- **Mã số sinh viên (MSSV):** 23120242
- **Nhóm / Đề tài:** Nhóm 10 — T07: CI/CD & Test-Harness Engineering
- **Phạm vi công việc:** Task A-01 đến A-05 và Task C-01 đến C-02
- **Thời gian báo cáo:** 16/10/2026

## 1. Trạng thái sử dụng AI trong tuần

- [ ] **Tôi không sử dụng AI trong tuần này**
- [x] **Tôi có sử dụng công cụ AI trong tuần này**

## 2. Công cụ AI đã sử dụng

| STT | Tên công cụ | Phiên bản / Model | Mục đích sử dụng | Mức độ đóng góp ước tính |
|:---:|:---|:---|:---|:---:|
| 1 | ChatGPT | GPT-5.6 Luna | Lập kế hoạch và quản lý task; phân tích checklist; tạo hướng dẫn và cấu hình GitHub Actions; phân tích log CI và hỗ trợ hoàn thiện Task C-02 | 85% |

> Tỷ lệ trên là ước tính tham khảo cho phần nội dung do AI đề xuất. Sinh viên chịu trách nhiệm kiểm tra, quyết định, chỉnh sửa và xác nhận kết quả trước khi sử dụng.

## 3. Tóm tắt quá trình sử dụng AI

Các trao đổi được ghi lại trong [chatlog.md](./chatlog.md), gồm 8 entry được đánh số lại từ 1 đến 8. Nội dung chính:

1. Lập bảng phân công, nhật ký đóng góp, quy tắc PR/review và nơi lưu minh chứng.
2. Phân loại các task có thể chuyển thành GitHub Issue và các task nên giữ dưới dạng checklist nghiệm thu.
3. Tạo script GitHub CLI để khởi tạo issue theo sprint.
4. Xác định các đầu ra cần chuẩn bị cho Task C.
5. Thiết kế và triển khai workflow GitHub Actions cho Task C.
6. Viết tài liệu mô tả phần code của workflow `ci.yml`.
7. Phân tích lỗi thiếu script `lint` và tình trạng chưa đạt của C-02.
8. Phân tích kết quả sau khi đồng bộ test harness: API test thất bại, smoke test bị bỏ qua và coverage report thất bại.

## 4. Vai trò và trách nhiệm của sinh viên

Sinh viên đã sử dụng AI như công cụ hỗ trợ, không xem phản hồi của AI là kết quả tự động được chấp nhận. Trước khi áp dụng, sinh viên:

- đối chiếu đề xuất với `checklist.md`, mã nguồn và cấu hình thực tế;
- tự thực hiện các thao tác trên Google Sheets, GitHub Issues, GitHub Actions và repository khi cần;
- kiểm tra log, trạng thái workflow và kết quả test;
- giữ nguyên các lỗi nghiệp vụ được phát hiện thay vì che lỗi để tạo pipeline xanh giả;
- chịu trách nhiệm về nội dung, tính chính xác và quyết định cuối cùng trong sản phẩm nộp.

## 5. Toàn văn nhật ký trò chuyện và tài liệu liên quan

Toàn văn các prompt và result được lưu tại [chatlog.md](./chatlog.md). File này được tạo trực tiếp từ `T07-23120242-AI-LOG.md`; chỉ số thứ tự của entry được chuyển từ `0.1, 0.2, 0.3, 1, ...` thành `1, 2, 3, ...`. Nội dung bên trong từng trường `Prompt` và `Result` không được biên tập hoặc diễn giải lại.

## 6. Cam kết tính trung thực học thuật

Tôi xin cam đoan:

1. Thông tin khai báo về việc sử dụng AI trên đây là trung thực, đầy đủ và minh bạch.
2. Tôi hiểu rõ nội dung, mã nguồn và kết quả kiểm thử được nộp; không phó mặc hoàn toàn cho AI.
3. Tôi chịu trách nhiệm về việc kiểm tra, chỉnh sửa, xác nhận và sử dụng các đề xuất do AI cung cấp.

**Chữ ký sinh viên:** Nguyễn Văn Bình Dương  
**Ngày:** 16/10/2026
