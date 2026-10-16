# BÁO CÁO TUYÊN BỐ SỬ DỤNG AI (AI USAGE DECLARATION)

- **Môn học:** Kiểm thử phần mềm (Software Testing)
- **Tuần báo cáo:** Tuần 4 (Week 4)
- **Họ và tên sinh viên:** Nguyễn Khắc Vượng
- **Mã số sinh viên (MSSV):** 23120409
- **Nhóm / Đề tài:** Nhóm 10 — T07: CI/CD & Test-Harness Engineering
- **Thời gian báo cáo:** 14–16/10/2026, Asia/Bangkok; ngày lập bản khai: 15/10/2026; bổ sung setup và ba mục Jenkinsfile, report/artifact, tổng hợp minh chứng ngày 16/10/2026.

## 1. Trạng thái sử dụng AI trong tuần

### [ ] Mục A: TÔI KHÔNG SỬ DỤNG AI TRONG TUẦN NÀY

Không áp dụng cho phạm vi báo cáo này.

### [x] Mục B: TÔI CÓ SỬ DỤNG CÔNG CỤ AI TRONG TUẦN NÀY

Tôi dùng ChatGPT / Codex để khảo sát repo và bộ test do nhóm đã xây dựng, giải thích quy trình CI, đối chiếu tài liệu Jenkins YAS tôi cung cấp và soạn phase plan cho phần Jenkins của tôi. Tôi đặt câu hỏi, yêu cầu giải thích lại các điểm chưa hiểu và cung cấp tài liệu cũ để AI đối chiếu. AI đọc file, chạy lệnh khảo sát local, tra tài liệu chính thức và soạn nội dung kế hoạch. Ngày 16/10/2026, AI hỗ trợ dựng và kiểm tra môi trường Jenkins controller. Tôi từng yêu cầu dừng ở setup, gỡ phần pipeline/agent làm thêm và giữ nguyên code/test EShop; các mục 3.1–3.7 phản ánh giai đoạn đó. Sau khi tôi yêu cầu tiếp tục D-02, tôi tạo/push Jenkinsfile và cấu hình Jenkins/GitHub theo hướng dẫn; AI review file, hỗ trợ xử lý build, bổ sung publisher/report và tổng hợp minh chứng đã chạy thật. Ba nội dung bổ sung được khai báo ở mục 3.8–3.10. Chưa triển khai thí nghiệm flaky hoặc manual triage E-04 trong phạm vi này.

## 2. Danh sách công cụ AI đã sử dụng trong tuần

| STT | Tên công cụ AI | Phiên bản / Model | Mục đích sử dụng | Mức độ đóng góp ước tính (%) |
| --- | --- | --- | --- | --- |
| 1 | ChatGPT / Codex | GPT-6.1 Sol (high / medium / light), theo thông tin đã điền; chưa xác minh cấu hình phiên | Khảo sát repo/test, giải thích CI/flaky, đọc quy trình YAS, lập phase plan/setup; hỗ trợ Jenkinsfile, report/artifact và tổng hợp evidence từ Jenkins | 60% |

Chưa có cơ sở quy đổi đóng góp thành một tỷ lệ phần trăm. AI thực hiện việc đọc/khảo sát kỹ thuật, soạn nội dung và thao tác setup; tôi cung cấp yêu cầu, tài liệu tham chiếu, đặt câu hỏi và yêu cầu giới hạn lại phạm vi. Không suy model, mức reasoning hoặc tỷ lệ đóng góp từ mẫu của thành viên khác.

## 3. Chi tiết quá trình sử dụng AI (AI Usage Process)

### 3.1. Khảo sát repository và bộ test làm đầu vào cho phần D

- **Mục tiêu yêu cầu AI hỗ trợ:** Xác định task Jenkins của tôi trong checklist, cấu trúc repo, các test hiện có và lệnh dùng được cho CI.
- **Prompt chính đưa vào:** Xem [khảo sát repo](chatlog.md#survey).
- **Kết quả AI phản hồi (Output tóm tắt):** Xác định D-01–D-06; khảo sát backend/web/admin/mobile; cài dependency và chạy backend lint, build và test:ci trên nền commit 083b393. AI ghi nhận lint/build pass, 39 test gồm 29 pass/10 fail, line coverage 61,48% và hash database gốc không đổi. Lần chạy test thực tế cần ra ngoài sandbox vì cache tạm bị chặn. Đây là kết quả local, không phải Jenkins run.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* Tôi dùng kết quả khảo sát để hiểu đầu vào cho phần Jenkins. Việc chạy lệnh và kiểm chứng kỹ thuật do AI thực hiện trong phiên, chưa ghi nhận tôi tự chạy lại độc lập.
  - *Chỉnh sửa thực tế:* Tôi tiếp tục hỏi về việc đặt hai pipeline cùng repo và tái sử dụng test. Tôi chưa yêu cầu viết lại test hoặc sửa lỗi nghiệp vụ; không nhận B-01–B-05 là phần triển khai của mình.

### 3.2. Tổ chức hai pipeline và tái sử dụng bộ test

- **Mục tiêu yêu cầu AI hỗ trợ:** Xác định có nên đặt GitHub Actions/Jenkins cùng repo và có cần thêm test trước khi làm CI.
- **Prompt chính đưa vào:** [Dùng chung repo](chatlog.md#same-repo), [tái sử dụng test](chatlog.md#reuse-tests).
- **Kết quả AI phản hồi (Output tóm tắt):** Đề xuất một repo, hai pipeline chạy độc lập và dùng chung npm scripts, lockfile, phạm vi test/runtime để đối chiếu. Dùng lại 5 unit, 30 API, 1 smoke và 3 harness test. Cần bổ sung reporter JUnit, không cần viết lại bộ test cho mục D.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* Tôi chủ động hỏi lại hai quyết định tổ chức repo và test để tránh làm trùng phần của nhóm. Build xanh D-02 chưa được giải quyết khi full suite còn lỗi.

### 3.3. Phân biệt demo lỗi code với flaky test

- **Mục tiêu yêu cầu AI hỗ trợ:** Hiểu demo D-04 bằng nhánh sửa code và yêu cầu sleep-based flake/mười lượt độc lập của mục E.
- **Prompt chính đưa vào:** [Demo nhánh lỗi](chatlog.md#failure-demo), [protocol flaky](chatlog.md#flaky-protocol), [tác động lên Jenkins](chatlog.md#flaky-impact), [yêu cầu giải thích lại](chatlog.md#flaky-example).
- **Kết quả AI phản hồi (Output tóm tắt):** D-04 có thể sửa code gây lỗi xác định rồi revert; test hiện có phát hiện thay đổi. Flaky test có thể đổi pass/fail trên cùng commit do timing; mười build độc lập khác với mười retry. Ví dụ sleep 100 ms và tác vụ 80/150 ms chỉ là minh họa. Nếu baseline còn mười lỗi SUT, cần xem ID test flaky thay vì chỉ nhìn màu build.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* Tôi chưa hiểu tác động của flaky lên Jenkins nên hỏi lại nhiều lượt và yêu cầu ví dụ cụ thể. Các lượt hỏi này là quá trình làm rõ, không phải bằng chứng tôi đã chạy thực nghiệm hoặc đã kiểm chứng nguyên nhân.
  - *Chỉnh sửa thực tế:* Tôi đề xuất dùng nhánh sửa code rồi push cho demo fail. Chưa có commit gây lỗi, run demo hoặc flaky test nào được tạo. E-01/E-02 do Vỹ phụ trách; E-04 cần tôi phân tích log thật thủ công trước khi xem kết quả AI, chưa diễn ra trong phiên.

### 3.4. Chuẩn bị môi trường Jenkins và tái sử dụng quy trình YAS

- **Mục tiêu yêu cầu AI hỗ trợ:** Xác định bước bắt đầu, lựa chọn LTS/custom và đánh giá quy trình CI Jenkins từ bài YAS trước đây.
- **Prompt chính đưa vào:** [Việc cần làm tiếp](chatlog.md#setup-next), [LTS/custom](chatlog.md#lts-custom), [review YAS](chatlog.md#yas-review).
- **Kết quả AI phản hồi (Output tóm tắt):** Đề xuất Jenkins LTS qua Docker Compose với agent riêng; LTS vẫn tùy chỉnh plugin được. Đọc DOCX và ảnh code YAS, giữ ý tưởng Docker/Multibranch/webhook/post always; chuyển Maven/JaCoCo sang npm/Jest/Cobertura. Cảnh báo logic chọn service bằng pom.xml có thể bỏ qua test EShop, catchError report-only không được dùng để biến test fail thành success, ngưỡng 70% không tự chuyển sang EShop và allowEmptyResults có thể che report thiếu.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* Tôi cung cấp tài liệu YAS làm đầu vào và hỏi cách áp dụng. AI đánh giá thiết kế qua tài liệu/ảnh, chưa chạy Jenkinsfile cũ trên EShop. Hướng dẫn dựng môi trường cũ không tự chứng minh D-01 đã xong.
  - *Chỉnh sửa thực tế:* Trong giai đoạn tư vấn 14–15/10, chưa triển khai Jenkins. Phần setup controller sau đó được bổ sung ở mục 3.7; agent/pipeline làm thêm lúc đó được yêu cầu gỡ. Việc tiếp tục tạo/chạy job sau khi tôi cho phép được ghi riêng ở mục 3.8–3.10.

### 3.5. Chọn plugin report và coverage

- **Mục tiêu yêu cầu AI hỗ trợ:** Tìm phương án hiển thị report của bộ test khi không dùng JaCoCo plugin.
- **Prompt chính đưa vào:** Xem [plugin report](chatlog.md#report-plugins).
- **Kết quả AI phản hồi (Output tóm tắt):** AI tra trang plugin Jenkins và tài liệu jest-junit. JaCoCo plugin đã end-of-life và hướng dẫn chuyển Coverage plugin. Đề xuất JUnit plugin cho pass/fail/thời gian/lịch sử, Coverage plugin cho Cobertura XML; package jest-junit ở backend sinh test-result XML. Plugin Jenkins đọc report, không thay runner tạo report.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* Tôi nêu lo ngại về JaCoCo và yêu cầu phương án khác. AI phân biệt kết quả test với coverage và dẫn nguồn chính thức; chưa ghi nhận tôi tự cài/kiểm thử các plugin này.
  - *Chỉnh sửa thực tế:* Ở giai đoạn tư vấn, phương án được đưa vào kế hoạch. Phần tích hợp jest-junit/publish làm thêm lúc đầu đã được hoàn tác khi thu gọn về setup. Sau đó, khi tôi yêu cầu báo cáo dễ đọc trên Jenkins, AI bổ sung lại reporter và publisher trong phạm vi D-03; xem mục 3.9.

### 3.6. Lập kế hoạch theo phase và ghi nhận sử dụng AI

- **Mục tiêu yêu cầu AI hỗ trợ:** Chuyển các trao đổi thành kế hoạch dễ thực hiện, rồi ghi chatlog/AI Usage theo cấu trúc của folder vy.
- **Prompt chính đưa vào:** [Lập phase plan](chatlog.md#phase-plan); yêu cầu tiếp theo: “Dựa vào mẫu bên folder vy ấy. Bạn ghi lại chatlog với Ai usage cho tôi đoạn vừa rồi đi”.
- **Kết quả AI phản hồi (Output tóm tắt):** Soạn tám phase 0–7: baseline, setup, pipeline chạy tay, report/cache, webhook, demo lỗi, đo đối chiếu và bàn giao. Mỗi phase có checklist, đầu ra và tiêu chí xong; tách mục E khỏi demo lỗi. Ở lần ghi setup trước đó, file kế hoạch không còn đính kèm; tại lần bổ sung này có [jenkins-phase-plan.md](../../../jenkins/jenkins-phase-plan.md) trong repo. AI cập nhật hai file khai báo dựa trên các trao đổi thật và mẫu Vỹ.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* Tôi yêu cầu lập phase plan thay vì chỉ giải thích từng công cụ và yêu cầu ghi lại nội dung AI đã hỗ trợ. Tôi chưa xác nhận đã hoàn thành các phase; các checkbox triển khai vẫn chưa đánh dấu.
  - *Chỉnh sửa thực tế:* AI thay phần ví dụ/placeholder trong bản ghi bằng nội dung Jenkins của phiên này, giữ thông tin sinh viên.
### 3.7. Setup môi trường Jenkins và điều chỉnh phần AI làm thêm

- **Mục tiêu yêu cầu AI hỗ trợ:** Dựng môi trường Jenkins local để cài đặt, khởi tạo và truy cập giao diện trước khi làm agent/pipeline.
- **Prompt chính đưa vào:** [Giới hạn bước setup](chatlog.md#jenkins-setup-scope), [yêu cầu gỡ phần làm thêm](chatlog.md#jenkins-setup-cleanup), [ghi bổ sung tài liệu sử dụng AI](chatlog.md#jenkins-setup-disclosure).
- **Kết quả AI phản hồi (Output tóm tắt):** AI rút gọn cấu hình còn Docker Compose chạy image chính thức Jenkins LTS 2.580.1/JDK 21, bind 127.0.0.1:8080 và dùng volume Jenkins home. Cập nhật guide setup; gỡ Jenkinsfile, cấu hình agent, bộ cài plugin tùy chỉnh và hoàn tác phần JUnit/report trong backend. Kiểm tra Docker Engine 29.2.1, Compose v5.1.0, controller healthy, HTTP /login trả 200, header Jenkins 2.580.1 và trang Sign in. Không ghi mật khẩu vào bản khai.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* AI triển khai nhanh hơn nhịp tôi muốn làm và đã thêm phần pipeline khi tôi chỉ muốn hoàn tất môi trường trước. Tôi trực tiếp yêu cầu dừng ở setup, sau đó yêu cầu xóa các file làm thêm. Khi tôi yêu cầu ghi log, AI còn hiểu nhầm thành file log kỹ thuật riêng; tôi làm rõ rằng cần ghi vào tài liệu sử dụng AI và yêu cầu xóa file đó.
  - *Chỉnh sửa thực tế:* AI thực hiện các yêu cầu thu gọn: giữ Compose và guide setup, hoàn tác phần tích hợp CI trong backend và xóa log kỹ thuật vừa tạo. Nội dung setup được bổ sung vào bản khai này và chatlog theo yêu cầu của tôi; không nhận pipeline đã gỡ là sản phẩm hoàn thành.

### 3.8. Hỗ trợ viết, review và chạy Jenkinsfile (D-02)

- **Mục tiêu yêu cầu AI hỗ trợ:** Kiểm tra Jenkinsfile chạy đúng sáu stage trên repo hiện tại, giữ exit code test fail và xử lý việc job chưa chạy được sau khi thêm credential.
- **Prompt chính đưa vào:** [Jenkinsfile và kiểm chứng pipeline](chatlog.md#jenkinsfile-d02) — tôi đề xuất sáu stage, sau đó yêu cầu “verify xem jenkins file mình vừa tạo và nhận xét” và “Bạn hãy sửa thử xem sao”.
- **Kết quả AI phản hồi (Output tóm tắt):** AI đọc Jenkinsfile do tôi vừa tạo, đối chiếu npm scripts/Jest/agent, kiểm tra cú pháp năm đoạn Bash và thử cơ chế `pipefail` qua `tee`. AI phát hiện trường hợp lệnh npm trong `echo "$(...)"` lỗi nhưng Environment vẫn có thể pass, giải thích cách tách lệnh lấy phiên bản; đây là nhận xét review, không tự ghi rằng file đã sửa điểm đó. Khi build cũ dùng anonymous bị giãn API, AI kiểm tra log và cấu hình credential; do không có phiên quản trị trình duyệt truy cập được, AI dùng quyền container để restart controller và một hook Groovy tạm chỉ yêu cầu chạy lại đúng job. Build #2 checkout commit `bb185c22662af74c9bb43b70943a7350e154ed49`, chạy đủ stage, 39 test/29 pass/10 fail và lưu artifact. Hook tạm được xóa.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* Tôi đề xuất cấu trúc sáu stage, tạo Jenkinsfile ban đầu và push lên repo; AI review và hỗ trợ vận hành, không phải tự viết toàn bộ file ban đầu thay tôi. Tôi hỏi lại về lỗi Environment, phạm vi test và CI đỏ do SUT có bug. Việc kiểm tra kỹ thuật qua lệnh/container do AI thực hiện, không khai báo là lần tôi tự chạy độc lập.
  - *Chỉnh sửa thực tế:* Tôi cấu hình job/credential trên giao diện theo hướng dẫn và yêu cầu AI xử lý lượt build kẹt. Giữ nguyên assertion và full suite; không dùng skip/nuốt exit code để làm xanh. Build #2 lúc đó còn cảnh báo 403 gửi commit status; build #4 được lưu ở mục 3.10 ghi GitHub đã nhận kết quả. Chưa có quyết định nhóm xác nhận tiêu chí build xanh hoặc review của Vỹ.

### 3.9. Lưu artifact và hiển thị báo cáo test/coverage (D-03)

- **Mục tiêu yêu cầu AI hỗ trợ:** Có giao diện dễ theo dõi stage/test/coverage và giữ được báo cáo, log sau khi test fail, thay vì chỉ đọc file JSON/XML tải xuống.
- **Prompt chính đưa vào:** [Artifact và báo cáo Jenkins](chatlog.md#jenkins-artifacts-d03) — “chưa thấy gì ngoài ra các báo cáo chưa hiển thị giao diện cho dễ theo dõi vào đọc dữ liệu khó theo dõi.”;
- **Kết quả AI phản hồi (Output tóm tắt):** AI thêm `jest-junit` 17.0.0 vào devDependencies/lockfile, cấu hình `test:ci` giữ reporter mặc định và xuất JUnit XML. Bổ sung `post always` của stage Tests gọi `junit` và `recordCoverage`; bật đọc coverage cho build FAILURE, giữ `archiveArtifacts` toàn pipeline lưu log, JSON/XML và coverage. AI cài thêm Pipeline Stage View cùng dependency còn thiếu, kiểm tra plugin active và Declarative validator trên Jenkins. Kiểm chứng bản sao Linux sạch: npm ci/lint/build pass, JUnit có đúng 39 test/10 failure/0 skip, tên test khớp JSON, Cobertura hợp lệ và Jest vẫn exit 1. Cập nhật hướng dẫn báo cáo; không sửa SUT hoặc assertion. Commit được tôi push: `a559c53acb9a3b03cc05fca8a855bcc59c8eaae8`.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* Tôi gửi ảnh giao diện còn khó theo dõi và yêu cầu giải thích các file AI thêm trước khi commit/push. Tôi phân biệt cài plugin hiển thị với cấu hình publisher trong Jenkinsfile; build cũ không tự được gắn report mới. Thao tác sửa package/Jenkinsfile và kiểm chứng bằng công cụ là phần AI hỗ trợ.
  - *Chỉnh sửa thực tế:* Tôi commit/push cấu hình report. Build #4 từ commit đó có bước publish JUnit/Coverage và archive thành công, full suite vẫn 29 pass/10 fail. Không khai báo build xanh. Các publisher báo cáo chỉ gắn vào Jenkins; gửi commit status qua GitHub Branch Source là luồng riêng. Chưa có phép đo cache cold/warm hoặc kết luận tốc độ cho D-05 từ lượt này.

### 3.10. Tổng hợp log hệ thống và minh chứng D-02

- **Mục tiêu yêu cầu AI hỗ trợ:** Thu thập các dữ liệu Jenkins đã có, viết baseline và hướng dẫn tái lập; chỉ rõ những bằng chứng/xác nhận cần tôi và nhóm tự bổ sung.
- **Prompt chính đưa vào:** [Tổng hợp minh chứng từ Jenkins](chatlog.md#jenkins-evidence-d02) — sau khi liệt kê các phần còn thiếu D-02, tôi yêu cầu “bạn hãy làm những gì bạn làm được còn các phần cần tôi copy bỏ vào hãy nói tôi”.
- **Kết quả AI phản hồi (Output tóm tắt):** AI chọn build #4 đã hoàn tất, commit `a559c53acb9a3b03cc05fca8a855bcc59c8eaae8`; xuất toàn bộ console từ Jenkins volume, chỉ bỏ ConsoleNote nhị phân/ANSI để có bản text. Copy nguyên artifact environment, Jest JSON, JUnit XML, coverage JSON/Cobertura; tổng hợp metadata chọn lọc và checksum. Viết baseline: Node v24.14.0/npm 11.9.0, 39 test/29 pass/10 fail, build 17,600 giây và Jest 1,960 giây. Đối chiếu từng ID fail với B-04, xác nhận code SUT/test/fixture/Jest config không đổi; npm và OS khác, reporter/lệnh CI có bổ sung nên không suy ra Jenkins nhanh hơn. Ghi riêng branch coverage Jest 39,09% (52/133) và Jenkins đọc Cobertura 41,74% (48/115), chưa kết luận nguyên nhân mẫu số khác. AI thêm Phần C tạo/chạy Multibranch vào guide, link evidence trong checklist và mẫu quyết định nhóm/review.
- **Quá trình đánh giá, thẩm định & chỉnh sửa của sinh viên (Human Oversight):**
  - *Độ chính xác & Vấn đề:* Tôi yêu cầu AI làm phần thu thập/tổng hợp có thể kiểm chứng và hỏi lại các file được thêm, ảnh nào cần bổ sung. AI lấy log trực tiếp từ volume, không bấm Download qua trình duyệt; không khai báo là thao tác tải thủ công của tôi. Kết quả chọn lọc/checksum/link do AI kiểm tra; chưa có xác nhận tôi kiểm lại toàn bộ độc lập.
  - *Chỉnh sửa thực tế:* Khi soạn evidence, AI để rõ phần ảnh Stage View, quyết định nhóm và review cần tôi/nhóm bổ sung. Tại lần cập nhật bản khai này, repo đã có `stage-build-view.png`; AI xem ảnh xác nhận có hàng #4, Checkout đến Build xanh và Tests đỏ. AI không tạo hoặc sửa ảnh đó. Quyết định build xanh và review vẫn chưa có xác nhận được ghi nhận; không điền quyết định, ký review thay nhóm hoặc tick D-02 hoàn thành. Đây là tổng hợp evidence D-02, **không phải manual triage E-04**, thí nghiệm mười run hoặc dữ liệu so sánh D-05.

## 4. Toàn văn Chat Log với AI & Tài liệu đính kèm (Chat Log & Attachments)

### 4.1. Danh mục tài liệu đính kèm trong thư mục này

- [x] **Chat log Markdown:** [chatlog.md](chatlog.md) — prompt giữ nguyên và trích đoạn phản hồi, không phải full-session export.
- **Kế hoạch theo phase:** [jenkins-phase-plan.md](../../../jenkins/jenkins-phase-plan.md); là kế hoạch, không thay bằng chứng hoàn tất các task.
- **Tài liệu tham chiếu của repo:** [checklist](../../../tasks/checklist.md), [hướng dẫn test](../../../../backend/tests/README.md), [kiến trúc harness](../../../architecture/test-harness.md). Đây là đầu vào của nhóm, không khai báo là sản phẩm tôi tạo trong phiên.
- **Log/report local khảo sát:** [survey.log](../../../../backend/test-results/survey.log), [survey.json](../../../../backend/test-results/survey.json). Output Git ignore, không có bảo đảm trên clone sạch; chưa thay thế evidence Jenkins hoặc dữ liệu D-05.
- [x] **Hướng dẫn setup Jenkins:** [docs/jenkins/SETUP_GUIDE.md](../../../jenkins/SETUP_GUIDE.md).
- [x] **Cấu hình môi trường:** [Compose controller](../../../../infra/jenkins/compose.yaml), [Compose agent](../../../../infra/jenkins/compose.agent.yaml).
- [x] **Jenkinsfile và reporter:** [Jenkinsfile](../../../../Jenkinsfile), [package.json](../../../../backend/package.json), [hướng dẫn report](../../../jenkins/reports.md).
- [x] **Minh chứng hệ thống D-02:** [baseline build #4](../../../evidence/D-02/baseline.md), [console](../../../evidence/D-02/console-build-4.txt), [metadata](../../../evidence/D-02/build-4/metadata.json). Build #4 chạy từ commit `a559c53`, kết quả FAILURE với 29 pass/10 fail.
- [x] **Ảnh Stage View đã có trong repo:** [stage-build-view.png](../../../evidence/D-02/stage-build-view.png); có hàng #4 và các stage, không phải ảnh AI tạo.
- **Log kỹ thuật riêng:** Đã xóa theo yêu cầu; phần sử dụng AI cho setup được ghi ở mục 3.7 và phiên chat 2.

### 4.2. Nội dung Chat Log

Xem [chatlog.md](chatlog.md). Không suy các ví dụ pass/fail, timing hoặc thao tác được đề xuất trong chat thành kết quả đã thực hiện.

### 4.3. Nguồn được AI tra cứu để hỗ trợ tư vấn

- [Jenkins Docker](https://www.jenkins.io/doc/book/installing/docker/).
- [Jenkins LTS/Weekly](https://www.jenkins.io/download/).
- [GitHub Branch Source plugin](https://plugins.jenkins.io/github-branch-source/).
- [JUnit plugin](https://plugins.jenkins.io/junit/) và [allowEmptyResults](https://www.jenkins.io/doc/pipeline/steps/junit/).
- [Coverage plugin](https://plugins.jenkins.io/coverage/).
- [JaCoCo plugin end-of-life](https://plugins.jenkins.io/jacoco/).
- [jest-junit](https://github.com/jest-community/jest-junit).
- [catchError và trạng thái build/stage](https://www.jenkins.io/doc/pipeline/steps/workflow-basic-steps/).

Việc tra cứu các nguồn trên do AI thực hiện trong phiên; không khai báo đây là nghiên cứu hoặc kiểm chứng thủ công độc lập đã hoàn thành bởi tôi.

## 5. Cam kết tính trung thực học thuật (Academic Integrity Pledge)

> Tôi cam kết:
> 1. Khai báo trung thực nội dung AI đã hỗ trợ và phân biệt kế hoạch, ví dụ minh họa với kết quả chạy thật.
> 2. Tự đọc, kiểm tra và làm rõ nội dung trước khi áp dụng; không nhận sản phẩm của thành viên khác hoặc thao tác do AI thực hiện là phần tự triển khai của mình.
> 3. Chịu trách nhiệm đối với phần bài làm sử dụng và nộp theo quy định liêm chính học thuật của môn học.

**Người khai báo:** Nguyễn Khắc Vượng

*Ngày lập:* 15/10/2026; bổ sung ngày 16/10/2026. Bản ghi họ tên này không thay thế chữ ký xác nhận của sinh viên nếu mẫu nộp yêu cầu.
