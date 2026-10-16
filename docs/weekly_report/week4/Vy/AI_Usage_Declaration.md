# BÁO CÁO TUYÊN BỐ SỬ DỤNG AI (AI USAGE DECLARATION)

- **Môn học:** Kiểm thử phần mềm (Software Testing)
- **Tuần báo cáo:** Tuần 4 (Week 4)
- **Họ và tên sinh viên:** Trần Quốc Vỹ
- **Mã số sinh viên (MSSV):** 23120410
- **Nhóm / Đề tài:** Nhóm 10 — T07: CI/CD & Test-Harness Engineering
- **Thời gian báo cáo:** 13/10/2026
- **Phạm vi:** B-01–B-05 và kiểm chứng liên quan trên EShop.

## 1. Trạng thái sử dụng AI trong tuần

### [ ] Mục A: TÔI KHÔNG SỬ DỤNG AI TRONG TUẦN NÀY

Không áp dụng cho phạm vi báo cáo này.

### [x] Mục B: TÔI CÓ SỬ DỤNG CÔNG CỤ AI TRONG TUẦN NÀY

Tôi dùng AI để hỗ trợ làm B-01 đến B-05, từ kiểm tra cách chạy dự án đến viết test và tài liệu. Tôi giao từng task, đọc kết quả và yêu cầu sửa những phần chưa phù hợp. AI thực hiện phần viết code, chỉnh file và chạy lệnh theo các yêu cầu đó.

## 2. Danh sách công cụ AI đã sử dụng trong tuần

| STT | Tên công cụ AI | Phiên bản / Model | Mục đích sử dụng | Mức độ đóng góp ước tính (%) |
| --- | --- | --- | --- | --- |
| 1 | ChatGPT / Codex | GPT-6.1 Sol (high / medium / light) | Kiểm kê EShop, thiết kế/viết test, fixture, quality commands, coverage, sơ đồ và tài liệu | 80% |


## 3. Chi tiết quá trình sử dụng AI (AI Usage Process)

### 3.1. Nhiệm vụ B-01 — Kiểm kê và hướng dẫn cài/chạy

- **Mục tiêu yêu cầu AI hỗ trợ:** Kiểm kê lệnh cài đặt, build/chạy, database, test hiện có và xác minh hoạt động trên bản sao sạch.
- **Prompt chính đưa vào:** Xem [B-01](chatlog.md#b01): kiểm kê EShop và tạo hướng dẫn cài/chạy.
- **Kết quả AI phản hồi (Output tóm tắt):** Cập nhật `setup_guide.md`; ghi đúng tài khoản seed, dependency/runtime, việc backend reset database mỗi lần khởi động, script test còn thiếu dependency và kết quả chạy local. Lưu `docs/evidence/B-01/local-verification.log`.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* AI kiểm tra được những điểm quan trọng trong setup guide như tài khoản admin, phiên bản Node và việc database reset khi khởi động. Lúc đầu tôi chưa rõ B-01 cần bổ sung gì khi dự án đã có README. Sau khi xem phần giải thích, tôi hiểu task này cần kiểm tra lại hướng dẫn bằng kết quả chạy thực tế.
  - *Chỉnh sửa thực tế:* Tôi yêu cầu giữ setup guide bằng tiếng Việt và nêu rõ các điểm sai hoặc thiếu của bản cũ. Tôi cũng yêu cầu bỏ các câu chờ kiểm chứng khi đã có log chạy, rồi mới cho commit B-01.

### 3.2. Nhiệm vụ B-02 — Unit/API/smoke test

- **Mục tiêu yêu cầu AI hỗ trợ:** Viết test đại diện, giải thích lý do chọn luồng và ánh xạ test với yêu cầu EShop.
- **Prompt chính đưa vào:** Xem [B-02](chatlog.md#b02): viết unit/API/smoke test đại diện.
- **Kết quả AI phản hồi (Output tóm tắt):** Thêm Jest/Supertest; 5 unit, 30 API và 1 smoke API test. Tạo helper SQLite trong bộ nhớ, điểm import app/middleware, hướng dẫn và bảng test ID → yêu cầu → expected/actual. Lần B-02 có 36 test, 26 pass và 10 fail; commit `ec6d7bf`.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* AI viết được các test đại diện và bảng ánh xạ với yêu cầu. Tuy nhiên, phần báo cáo ban đầu chưa nói rõ B-02 yêu cầu gì và đã làm những gì nên tôi phải hỏi lại. Tôi hiểu 10 test fail là các lỗi tìm thấy trong SUT; smoke test ở đây chạy qua API.
  - *Chỉnh sửa thực tế:* Tôi yêu cầu giải thích phạm vi B-02, các tầng test và bảng ánh xạ. Trước khi chuyển sang B-03, tôi nhắc phải ghi cách chạy để tôi hoặc thành viên khác có thể tự chạy lại.

### 3.3. Nhiệm vụ B-03 — Fixture, setup/cleanup và tính độc lập

- **Mục tiêu yêu cầu AI hỗ trợ:** Chuẩn bị trạng thái đầu vào cho test, cô lập dữ liệu và kiểm chứng kết quả khi chạy lặp lại/đổi thứ tự.
- **Prompt chính đưa vào:** Xem [B-03](chatlog.md#b03): thiết lập fixture và kiểm chứng tính độc lập.
- **Kết quả AI phản hồi (Output tóm tắt):** Bổ sung fixture sản phẩm/đơn hàng/lượt dùng coupon; cleanup idempotent, kiểm tra seed sáu bảng, ba test cô lập. Thêm `test:harness` và `test:isolation`; ba seed 101/202/303 đều có 39 test, 29 pass/10 fail, không có handle mở và database gốc không đổi. Commit `3336f93`.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* AI bổ sung fixture và kiểm tra cô lập dữ liệu. Theo log, ba lần chạy với seed khác nhau đều cho cùng kết quả và không thay đổi database gốc. Ban đầu tôi còn nhầm fixture với môi trường test, nên cần hỏi thêm về fixture, seed và mock.
  - *Chỉnh sửa thực tế:* Tôi yêu cầu giải thích các khái niệm này để hiểu phần setup và cleanup. Tôi giữ yêu cầu có hướng dẫn chạy lại trong README của bộ test; phần triển khai và chạy kiểm chứng do AI thực hiện.

### 3.4. Nhiệm vụ B-04 — Lint/build/test và coverage XML

- **Mục tiêu yêu cầu AI hỗ trợ:** Chuẩn hóa cách chạy backend, kiểm tra thật và tạo coverage XML có thể dùng trong CI.
- **Prompt chính đưa vào:** Xem [B-04](chatlog.md#b04): chuẩn hóa lệnh, tạo coverage XML và chỉnh tài liệu/commit.
- **Kết quả AI phản hồi (Output tóm tắt):** Thêm ESLint, script kiểm tra cú pháp Node, `test:coverage`/`test:ci`; tạo Cobertura XML và JSON summary. Clone sạch cài/lint/build pass, full test 29 pass/10 fail; line coverage 61,48%. Kiểm tra âm tính với file sai cú pháp xác nhận lint/build trả lỗi. Commit code `a7f0923`, commit docs cuối `075bb50`.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* Các lệnh lint, build và test có log chạy thật, đồng thời sinh được coverage XML. AI ban đầu chưa đánh dấu B-04 hoàn thành vì test còn fail. Tôi thấy cách đánh giá này chưa phù hợp với bài thực hành vì source đã có sẵn bug.
  - *Chỉnh sửa thực tế:* Tôi nhắc lại mục đích của SUT và yêu cầu cập nhật trạng thái B-04. Sau đó tôi yêu cầu bỏ đoạn giải thích thừa và gộp hai commit docs thành một commit. Các assertion và kết quả fail vẫn được giữ nguyên.

### 3.5. Nhiệm vụ B-05 — Sơ đồ test harness

- **Mục tiêu yêu cầu AI hỗ trợ:** Vẽ kiến trúc nguồn test, fixture, runner, artefact, log và quality gate; xem xét các nhánh lỗi và tạo hình dùng cho guide/slide.
- **Prompt chính đưa vào:** Xem [B-05](chatlog.md#b05): vẽ sơ đồ harness dùng trong guide và slide.
- **Kết quả AI phản hồi (Output tóm tắt):** Thêm `docs/architecture/test-harness.md`, Mermaid luồng chi tiết, SVG/PNG 1920×1080 và liên kết trong guide. Phân biệt unit không mở DB với API/smoke/harness có fixture; phân biệt diagnostic isolation với full test; đánh dấu CI upload/status check là phần tiếp theo. Mermaid và SVG đã được render, ảnh đã được kiểm tra. Commit `c9ac902`.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* Sơ đồ mô tả được nguồn test, fixture, runner, artefact, log và quality gate. Tôi yêu cầu chú ý cả các trường hợp lỗi setup, cleanup, timeout và report thiếu. Phần CI chưa triển khai được ghi rõ trong tài liệu. Dương vẫn cần review sơ đồ.
  - *Chỉnh sửa thực tế:* Yêu cầu kiểm tra lại toàn bộ B-01 đến B-05, nhất là không sửa các bug có sẵn trong source. AI đối chiếu code và chạy lại 39 test trên handler gốc; kết quả vẫn là 29 pass, 10 fail.

## 4. Toàn văn Chat Log với AI & Tài liệu đính kèm (Chat Log & Attachments)

### 4.1. Danh mục tài liệu đính kèm trong thư mục này

- [x] **Chat log Markdown:** [chatlog.md](chatlog.md) — prompt được diễn đạt lại theo task và các trích đoạn phản hồi AI.
- [x] **Hướng dẫn kỹ thuật:** [setup_guide.md](../../../../setup_guide.md).
- [x] **Hướng dẫn chạy và ánh xạ test:** [backend/tests/README.md](../../../../backend/tests/README.md).
- [x] **Sơ đồ harness:** [test-harness.md](../../../architecture/test-harness.md).
- [x] **Bằng chứng chạy:** [B-01](../../../evidence/B-01/local-verification.log), [B-02](../../../evidence/B-02/test-run.log), [B-03](../../../evidence/B-03/isolation.log), [B-04](../../../evidence/B-04/clean-clone.log).
- [x] **PR tổng hợp:** [PR #9](https://github.com/BDCALM/eshop-sut-group10/pull/9), liên quan Issue #1/#2.
- **PDF/HTML/export toàn session:** Không đính kèm trong lần báo cáo này.

### 4.2. Toàn văn nội dung Chat Log (Dán trực tiếp nếu không tách file riêng)

Nội dung chat được lưu trong file [chatlog.md](chatlog.md).

## 5. Cam kết tính trung thực học thuật (Academic Integrity Pledge)

> Tôi xin cam đoan:
> 1. Thông tin khai báo về việc sử dụng AI trên đây là hoàn toàn trung thực, đầy đủ và minh bạch.
> 2. Tôi hiểu rõ toàn bộ nội dung, mã nguồn và kết quả kiểm thử được nộp; không phó mặc hoàn toàn cho AI.
> 3. Chịu mọi trách nhiệm theo quy định liêm chính học thuật của môn học.

**Chữ ký sinh viên:** Trần Quốc Vỹ

*Ngày:* 13/10/2026
