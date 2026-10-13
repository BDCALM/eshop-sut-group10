Dưới đây là checklist để hoàn thiện **toàn bộ T07**. Mình phân công theo ba thành viên trong proposal; đây là **phân công đề xuất**, nhóm có thể đổi owner, nhưng mỗi việc cần một người chịu trách nhiệm và một người khác review. Không gắn công việc với tuần: việc nào đủ đầu vào thì làm ngay. Phạm vi chính là **GitHub Actions + Jenkins + ChatGPT trên EShop**. :codex-file-citation{path="D:\Workspace\SoftwareTesting\MySeminar\Tool_Survey_Proposal.md" purpose="source"}

> 💡 **Quy ước Commit theo Task ID:**
> - Cấu trúc: `<type>(<Mã-Task>): <nội dung commit>`
> - Ví dụ: `ci(C-01): create PR and push workflow with npm ci`, `test(B-02): implement unit and api tests for eshop`, `docs(G-02): draft 6 sections of user guide`.

## A. Chốt phạm vi và quản lý nhóm

| Mã Task | Checklist | Người thực hiện | Bằng chứng hoàn thành |
|:---:|---|---|---|
| **A-01** | [ ] Xác nhận với GVTH bộ công cụ và phạm vi Jenkins đối chiếu; ghi lại góp ý và quyết định cuối | Dương; Vượng chuẩn bị phần Jenkins | Biên bản/ghi chú buổi trao đổi, bản phạm vi đã chốt |
| **A-02** | [ ] Rà lại rubric và mẫu nộp, đặc biệt ý nghĩa, định dạng của **AI-02, AI-03, AI-04** | Dương | Checklist nộp bài có link đến từng yêu cầu |
| **A-03** | [ ] Tạo board công việc, chia mỗi hạng mục thành issue có owner, reviewer, đầu ra và tiêu chí xong | Dương | Board và issue truy cập được |
| **A-04** | [ ] Lập bảng phân công, nhật ký đóng góp, quy tắc PR/review và nơi lưu minh chứng | Dương; cả nhóm cập nhật | WBS, commit/PR/review log |
| **A-05** | [ ] Chốt cấu trúc thư mục nộp và tên file thống nhất | Dương | Một thư mục/index dẫn đến toàn bộ sản phẩm |

## B. Test harness cho EShop

| Mã Task | Checklist | Người thực hiện | Bằng chứng hoàn thành |
|:---:|---|---|---|
| **B-01** | [x] Kiểm kê EShop: cách cài, build, chạy backend, database/mock, test hiện có và lệnh chạy được từ máy sạch | Vỹ | [Hướng dẫn kỹ thuật](../../setup_guide.md), [log chạy local](../evidence/B-01/local-verification.log). Đã kiểm chứng bản sao sạch ngày 2026-10-13. |
| **B-02** | [x] Viết hoặc hoàn thiện **unit test, API test, smoke test** cho vài luồng đại diện; nêu rõ lý do chọn luồng | Vỹ; Dương review | [Test code và bảng ánh xạ](../../backend/tests/README.md), [log chạy](../evidence/B-02/test-run.log): 36 test, 26 pass, 10 fail do SUT không thỏa đặc tả. |
| **B-03** | [x] Thiết lập fixture/seed/mock, setup và cleanup để test độc lập, có thể lặp lại | Vỹ | [Hướng dẫn fixture và lệnh chạy](../../backend/tests/README.md), [log kiểm chứng](../evidence/B-03/isolation.log): 3 seed, cùng kết quả từng test; database gốc không đổi, không có handle mở. |
| **B-04** | [x] Chuẩn hóa lệnh `lint`, `build`, `test` và tạo coverage XML; không dùng lệnh giả chỉ để pipeline xanh | Vỹ | [Hướng dẫn](../../backend/tests/README.md), [log clone sạch](../evidence/B-04/clean-clone.log), [coverage XML](../evidence/B-04/cobertura-coverage.xml). Đã kiểm chứng từ clone sạch: cài đặt/lint/build pass; test 29 pass/10 fail; coverage XML sinh thành công. |
| **B-05** | [x] Vẽ sơ đồ harness: nguồn test, fixture, runner, artefact, log và quality gate | Dương; Vỹ review | [Sơ đồ và luồng chi tiết](../architecture/test-harness.md), [SVG cho slide](../architecture/assets/test-harness-overview.svg), [PNG cho guide/slide](../architecture/assets/test-harness-overview.png). Có nhánh unit/API, setup/cleanup, kết quả fail, report và quality gate. |

Phần test cần đủ để minh họa **kỹ nghệ harness và CI/CD**, không cần phủ toàn bộ tính năng EShop. Ghi chú nội bộ của nhóm cũng đặt trọng tâm ở CI/CD, DevOps và cách dùng AI để phân tích log. :codex-file-citation{path="D:\Workspace\SoftwareTesting\MySeminar\Personal notes - Seminar.docx" purpose="source"}

## C. GitHub Actions — hệ thống chính

| Mã Task | Checklist | Người thực hiện | Bằng chứng hoàn thành |
|:---:|---|---|---|
| **C-01** | [ ] Tạo workflow chạy trên PR và push phù hợp; cố định phiên bản Node, dùng `npm ci` | Dương | File workflow và URL các run |
| **C-02** | [ ] Thêm lint → build → unit/API/smoke, thể hiện rõ bước nào thất bại | Dương; Vỹ review | Một run xanh và các run lỗi có chủ đích |
| **C-03** | [ ] Thêm npm cache; đo một lần cache miss và một lần cache hit | Dương | Log và thời gian hai run |
| **C-04** | [ ] Xuất coverage XML và upload cùng test report/log dưới dạng artefact, kể cả khi test lỗi nếu khả thi | Dương | Tải được artefact từ run |
| **C-05** | [ ] Cấu hình status check/branch protection cho `main`; thử PR pass và PR fail | Dương | Ảnh/clip hoặc link chứng minh không thể merge khi check fail |
| **C-06** | [ ] Tạo badge coverage nếu phù hợp với hạ tầng thực tế; kiểm tra số hiển thị lấy từ report thật | Dương | Badge và nguồn dữ liệu của badge |
| **C-07** | [ ] Kiểm tra lại toàn bộ từ clone/PR sạch, không dựa vào file hay biến môi trường chỉ có trên máy cá nhân | Dương; Vỹ review | Checklist tái lập và URL run cuối |

## D. Jenkins — nền tảng đối chiếu

| Mã Task | Checklist | Người thực hiện | Bằng chứng hoàn thành |
|:---:|---|---|---|
| **D-01** | [ ] Dựng Jenkins có hướng dẫn khởi tạo lại được; ghi phiên bản, plugin, agent/container cần dùng | Vượng | File cấu hình và hướng dẫn cài |
| **D-02** | [ ] Viết `Jenkinsfile` chạy lint, build và cùng bộ test cốt lõi trên EShop | Vượng; Vỹ review | Jenkins build xanh từ commit xác định |
| **D-03** | [ ] Lưu test report, coverage/log và cấu hình cache hoặc giải thích giới hạn cache thực tế | Vượng | Artefact và cấu hình |
| **D-04** | [ ] Chạy một ca fail có chủ đích để chứng minh status/log đủ chẩn đoán | Vượng | Jenkins build đỏ và log |
| **D-05** | [ ] Đo ít nhất ba lần chạy trên mỗi nền tảng, ghi rõ điều kiện đo và so sánh thời gian, cache, cấu hình, vận hành | Vượng; Dương review | Bảng số liệu có URL/screenshot run gốc |
| **D-06** | [ ] Nêu trường hợp phù hợp, điểm yếu và lý do nhóm chọn GitHub Actions làm chính | Vượng | Phần so sánh trong báo cáo/slide |

## E. Thí nghiệm flaky test và AI triage

| Mã Task | Checklist | Người thực hiện | Bằng chứng hoàn thành |
|:---:|---|---|---|
| **E-01** | [ ] Tạo một flaky test do timing/sleep có nguyên nhân đã biết; đặt trên nhánh hoặc workflow thí nghiệm riêng | Vỹ | Commit tạo flake và mô tả root cause |
| **E-02** | [ ] Định nghĩa trước cách chạy, điều kiện thành công/thất bại và dữ liệu cần thu; tránh sửa test giữa các lần đo | Vỹ | Protocol thí nghiệm |
| **E-03** | [ ] Chạy **ít nhất 10 lần độc lập**, lưu commit SHA, thời gian, kết quả, run URL, raw log và retry history | Vỹ; Dương hỗ trợ CI | Bảng 10 run kèm nguồn gốc từng run |
| **E-04** | [ ] Phân tích thủ công **trước khi xem kết quả AI**; ghi thời gian, giả thuyết, dòng log hỗ trợ, bước kiểm tra | Vượng | Bản manual triage có dấu thời gian |
| **E-05** | [ ] Chuẩn hóa dữ liệu đưa cho ChatGPT: cùng log và lịch sử chạy; loại bí mật/thông tin cá nhân | Vỹ | Input và prompt được lưu nguyên bản |
| **E-06**| [ ] Tìm kiếm và đề xuất 1 prompt patterns / SKILLS phân tích log CI từ Github repo, diễn đàn DevOps hoặc bài báo học thuật để chọn ra kỹ thuật tối ưu nhất (ví dụ: Chain-of-Thought, Few-Shot Prompting) | Vỹ, Vượng, Dương / prompt/SKILLS| Báo cáo `AI_vs_Human_Triage` |.
| **E-07** | [ ] Thử và đánh giá 3 prompt patterns /SKILLS đã được tìm kiếm ở E-06a: tối đa 3 giả thuyết, dẫn chứng chính xác, 3 bước kiểm tra, nêu mức độ chưa chắc chắn | Vỹ | Prompt và output nguyên bản |
| **E-08** | [ ] So sánh người và AI theo cùng rubric: root cause, bằng chứng, bước tiếp theo, thời gian, suy diễn/hallucination | Vỹ; Vượng review | Báo cáo `AI_vs_Human_Triage` |
| **E-09** | [ ] Sửa flake và chạy lại để xác nhận nguyên nhân, không dừng ở phỏng đoán từ log | Vỹ | Commit sửa và run xác nhận |
| **E-10** | [ ] Rút ra ít nhất **3 failure modes thực tế** của AI và biện pháp kiểm chứng | Vỹ | Ví dụ gắn với output/log thật |

Brief T07 yêu cầu workflow, coverage XML, branch protection, thí nghiệm 10 lần và so sánh AI với người; demo trực tiếp phải dùng cả công cụ truyền thống lẫn AI. :codex-file-citation{path="D:\Workspace\SoftwareTesting\MySeminar\T07_CI-CD_and_Test-Harness_Engineering.docx.md" purpose="source"}

## F. Nội dung học thuật và hướng dẫn cho người xem

| Mã Task | Checklist | Người thực hiện | Bằng chứng hoàn thành |
|:---:|---|---|---|
| **F-01** | [ ] Viết phần lý thuyết ngắn, đúng trọng tâm: CI/CD, test harness, runner/agent, fixture, cache, coverage, quality gate, flaky test | Dương; Vượng/Vỹ review | Nội dung dùng chung cho guide, báo cáo, slide |
| **F-02** | [ ] Khảo sát GitHub Actions, Jenkins, GitLab CI và các hướng AI; giải thích chức năng, lúc nên dùng, giới hạn và lý do chọn/bỏ | Vượng; Vỹ viết phần AI | Bảng so sánh có nguồn tham khảo |
| **F-03** | [ ] Chuẩn bị **ba kịch bản demo** rõ ràng: cài đặt, chức năng cơ bản, luồng phức tạp (cache/branch protection/flaky triage) | Dương điều phối; mỗi owner phụ trách công cụ của mình | Script và kết quả chạy của từng kịch bản |
| **F-04** | [ ] Viết cách tái áp dụng cho một dự án khác: cần có lệnh test nào, fixture nào, cách đưa vào CI, cách đọc log và kiểm chứng AI | Vỹ; Dương review | Checklist “áp dụng cho dự án mới” |
| **F-05** | [ ] Ghi rõ hạn chế: cache có thể che lỗi môi trường, test flaky làm nhiễu quality gate, AI có thể kết luận quá mức | Cả nhóm, Vỹ tổng hợp | Ví dụ thực nghiệm đi kèm |

Yêu cầu chung nhấn mạnh lý thuyết, so sánh công cụ, demo có quá trình làm rõ, khả năng tái sử dụng và sản phẩm do nhóm tự trải nghiệm. :codex-file-citation{path="D:\Workspace\SoftwareTesting\MySeminar\SE Testing Group_s Drive\Seminar\General requirements.docx" purpose="source"}

## G. Bộ sản phẩm nộp

| Mã Task | Checklist | Người thực hiện | Điều kiện hoàn thành |
|:---:|---|---|---|
| **G-01** | [ ] Cập nhật **Tool Survey Proposal** theo phạm vi GVTH đã duyệt và kết quả triển khai thực tế | Dương | Markdown và PDF khớp nhau |
| **G-02** | [ ] Viết **User Guide** ít nhất 6 mục: chuẩn bị/cài đặt, kiến trúc, chạy cơ bản, PR và quality gate, cache/artefact, Jenkins, AI triage, failure modes, xử lý lỗi | Dương chủ biên; Vượng/Vỹ viết phần mình | Người khác làm theo từ đầu được |
| **G-03** | [ ] Viết **báo cáo chi tiết**: mục tiêu, phương pháp, môi trường, kết quả thực nghiệm, so sánh, giới hạn, bài học và nguồn | Dương tổng hợp; Vượng/Vỹ cung cấp số liệu | Mọi biểu đồ/số liệu truy về run gốc |
| **G-04** | [ ] Làm **Activity Worksheet – Pipeline Postmortem** với YAML, log, câu hỏi, gợi ý, đáp án và hướng dẫn tổ chức 25 phút | Vỹ; Vượng review | Một người ngoài nhóm thử làm được trong ≤25 phút |
| **G-05** | [ ] Làm **Seminar Slides** tối đa 15 slide theo brief T07; có kiến trúc, demo, dữ liệu 10 run, người-vs-AI, công cụ không chọn và bài học | Dương; cả nhóm review | Slide dễ đọc trong phòng sáng, link minh chứng hoạt động |
| **G-06** | [ ] Quay **Demo Screencast 5–8 phút**, giao diện sáng, thuyết minh rõ; cho thấy CI truyền thống và ChatGPT triage | Vượng quay kỹ thuật; Dương dựng; Vỹ thuyết minh AI | Video xem được, có tóm tắt và link trong slide |
| **G-07** | [ ] Chuẩn bị live demo: PR pass/fail, artefact, Jenkins, prompt AI; có dữ liệu/run đã ghi để dùng nếu mạng chậm | Cả nhóm; Dương điều phối | Diễn tập trọn luồng không phải sửa tay |
| **G-08** | [ ] Hoàn thiện **AI-02/AI-03/AI-04** theo đúng biểu mẫu/rubric sau khi xác nhận yêu cầu | Dương điều phối; mỗi người ghi phần sử dụng AI của mình | Ba mục hiện diện và khớp nhật ký/prompt |
| **G-09** | [ ] Xuất bản Markdown/PDF cần nộp; kiểm tra link, hình, code block, bảng, trang bị cắt và file mở được | Dương; Vượng review PDF | Bản nộp được mở và đọc đầy đủ |
| **G-10** | [ ] Tạo `Submission_Index` liệt kê từng yêu cầu → file/link → bằng chứng → người phụ trách | Dương | GVTH tìm được mọi sản phẩm trong một trang |

## H. Cổng kiểm tra cuối

Cả nhóm cùng làm, Dương ghi kết quả:

- [ ] **[H-01]** Một người **không viết pipeline** làm theo User Guide và chạy được từ clone sạch.
- [ ] **[H-02]** Mọi khẳng định trên slide/báo cáo về tốc độ, coverage, flake, AI đều có run hoặc log gốc.
- [ ] **[H-03]** Test flaky không còn làm đỏ pipeline chính sau khi kết thúc thí nghiệm.
- [ ] **[H-04]** Worksheet đã được thử với người ngoài nhóm trong ≤25 phút.
- [ ] **[H-05]** Video dài 5–8 phút; slide ≤15 trang; User Guide ≥6 mục và có ≥3 failure modes.
- [ ] **[H-06]** Live demo thể hiện ít nhất một tính năng CI truyền thống và một tính năng AI.
- [ ] **[H-07]** Mỗi thành viên có commit/PR/review và phần trình bày giải thích được.
- [ ] **[H-08]** GVTH có thể mở một index duy nhất để xem source, guide, báo cáo, slide, video, worksheet và bằng chứng.

**Thứ tự phụ thuộc nên giữ:** chốt phạm vi → test harness → hai pipeline → 10-run experiment → manual/AI triage → guide/báo cáo → worksheet/slide/video → kiểm tra cuối. Các phần khảo sát, lý thuyết và thiết kế slide có thể làm song song ngay từ đầu.
