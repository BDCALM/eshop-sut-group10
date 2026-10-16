# Kế hoạch triển khai Jenkins theo phase

Ngày lập: 15/10/2026, Asia/Bangkok. Người thực hiện: Vượng. Phạm vi chính: D-01–D-06 trong [checklist nhóm](checklist.md). Vỹ review bộ test và pipeline; Dương review số liệu đối chiếu với GitHub Actions.

Mục tiêu là dùng lại bộ test EShop để chạy CI trên Jenkins, lưu kết quả có thể kiểm chứng và so sánh với GitHub Actions. Tài liệu này là kế hoạch; các mục chưa được đánh dấu hoàn thành và chưa có cấu hình Jenkins được triển khai bởi việc lập kế hoạch.

## Phạm vi và nền đã có

- Một repository chứa cả `.github/workflows/` và `Jenkinsfile`; hai pipeline dùng chung mã nguồn, bộ test và npm scripts trong `backend/`.
- Dùng Jenkins LTS qua Docker Compose, với controller và Linux agent riêng. Agent có Java tương thích Jenkins, Git, Node/npm được cố định phiên bản. Pipeline gọi npm trực tiếp trên agent.
- Dùng JUnit plugin để hiển thị kết quả từng test; dùng Coverage plugin để đọc Cobertura XML. Không mang cấu hình JaCoCo/Maven của YAS sang EShop.
- Kế thừa cách làm Docker, Multibranch Pipeline, webhook và `post always` từ quy trình YAS. Phần security scan, SonarQube, ngưỡng coverage 70% và chọn service bằng `pom.xml` không nằm trong pipeline cơ bản này.
- Dùng lại 5 unit, 30 API, 1 smoke và 3 harness test; không viết lại bộ test chỉ để đưa lên CI. Các con số phải được xác nhận lại nếu code thay đổi.

Lần khảo sát ngày 14/10/2026 trên commit `083b393`: lint/build pass; 39 test gồm 29 pass và 10 fail; line coverage 61,48%. Đây là baseline lịch sử, không phải kết quả Jenkins hoặc cam kết cho commit mới.

## Tổng quan các phase

| Phase | Việc chính | Task liên quan | Điều kiện chuyển phase |
| --- | --- | --- | --- |
| 0 | Chốt đầu vào và baseline | Chuẩn bị D-02, D-05 | Có SHA, kết quả local, runtime và quyết định quality gate được ghi lại |
| 1 | Dựng Jenkins và agent | D-01 | Jenkins truy cập được, agent online, dựng lại được theo guide |
| 2 | Chạy pipeline bằng tay | D-02 | Install/lint/build/test thực thi thật, log và verdict đúng |
| 3 | Publish report và cấu hình cache | D-03 | Xem được từng test/coverage, tải artefact sau fail, cache kiểm chứng được |
| 4 | Tự động chạy khi push/PR | Hỗ trợ D-02, D-04 | Nhánh demo được phát hiện, webhook kích hoạt đúng commit |
| 5 | Demo lỗi do thay đổi code | D-04 | Có baseline, commit lỗi, report lỗi và run sau revert |
| 6 | Đo và so sánh hai nền tảng | D-05, D-06 | Có dữ liệu gốc, điều kiện đo, bảng so sánh và kết luận |
| 7 | Hoàn thiện guide và bàn giao | D-01–D-06; hỗ trợ G | Người khác làm theo được, evidence/index đủ, peer review được ghi nhận |

Luồng thực hiện: **0 → 1 → 2 → 3 → 4 → 5 → 6 → 7**. Phase 1 có thể tiến hành trong lúc nhóm thống nhất quality gate. Phase 6 cần workflow GitHub Actions từ Dương; các phase trước không cần chờ workflow đó hoàn tất.

## Phase 0 — Chốt đầu vào và baseline

### Công việc

- [ ] Ghi commit SHA dùng để bắt đầu, hệ điều hành, Node/npm và tình trạng working tree.
- [ ] Trong `backend/`, chạy riêng `npm ci`, `npm run lint`, `npm run build`, `npm run test:ci`; lưu log và kết quả từng lệnh.
- [ ] Đối chiếu số test pass/fail và từng ID lỗi với baseline đã ghi; không mặc định mọi fail là lỗi cũ.
- [ ] Thống nhất với Dương dùng cùng phiên bản Node/npm, cùng command và phạm vi test trên C/D. Nếu chưa chốt runtime, lấy Node 24 đã khảo sát làm ứng viên rồi kiểm chứng trên agent Linux.
- [ ] Thống nhất cách đáp ứng tiêu chí build xanh D-02 với Dương/Vỹ; lưu quyết định và phạm vi của mọi build xanh.

### Quyết định về build xanh

Trước mắt tích hợp full suite và giữ đúng kết quả fail. Jenkins chạy đúng không đồng nghĩa SUT không còn bug. D-02 chỉ hoàn thành đầy đủ khi có bằng chứng build xanh hợp lệ theo phạm vi nhóm chốt.

Các lựa chọn cần nhóm xác nhận:

1. Dùng commit demo đã sửa lỗi SUT nếu phạm vi môn học cho phép; giữ assertion và dùng cùng commit trên hai nền tảng.
2. Nếu cần giữ lỗi SUT, thống nhất trước một bộ core đại diện unit/API/smoke dùng chung C/D, có ánh xạ yêu cầu và lý do chọn. Full suite vẫn có job riêng, report và verdict fail. Cần xác nhận cách tổ chức này đáp ứng tiêu chí nộp; không tự loại mười fail để có màu xanh.
3. Giữ full suite làm gate và chưa sửa lỗi: pipeline tiếp tục báo fail; ghi D-02 chưa đạt tiêu chí build xanh, vẫn làm phần dựng môi trường, artefact, chẩn đoán và phép đo phù hợp.

Không đổi expected theo implementation sai, skip test, dùng `test.failing`, nuốt exit code hay thay `test:ci` bằng `test:isolation` để có build xanh. `test:isolation` xác nhận tính ổn định/cô lập theo baseline, không xác nhận nghiệp vụ pass.

### Đầu ra và tiêu chí xong

`baseline.md` và raw log trong `docs/evidence/D-02/`, cùng quyết định chất lượng được nhóm ghi lại. Baseline nêu rõ SHA, số test, ID fail, runtime và nguồn report. Có thể chuyển sang dựng môi trường khi phần build xanh còn chờ nhóm, nhưng phải giữ việc đó trong danh sách chưa hoàn tất.

## Phase 1 — Dựng Jenkins LTS và agent

### Công việc

- [ ] Mở Docker Desktop và kiểm tra Docker Linux engine bằng `docker version`. Khảo sát trước có Docker CLI nhưng chưa kết nối được engine; cần kiểm tra lại thực tế.
- [ ] Viết Compose cho controller và agent; dùng volume lưu `JENKINS_HOME`, workspace nếu cần và npm cache của agent.
- [ ] Cố định phiên bản/tag hoặc digest của image đã kiểm chứng; ghi phiên bản Jenkins, Java, Node/npm và plugin thực tế.
- [ ] Khởi tạo Jenkins, tạo user, kết nối agent và chọn label để pipeline dùng đúng agent.
- [ ] Cài plugin: Pipeline, Git, GitHub Branch Source, JUnit và Coverage, cùng dependency tương thích do Jenkins resolve.
- [ ] Chuẩn bị agent có Git, Java tương thích controller và Node/npm đã chốt; kiểm tra quyền đọc/ghi workspace/cache.
- [ ] Ghi hướng dẫn khởi động, dừng, restart và dựng từ volume mới. Không commit credential hoặc agent secret.
- [ ] Kiểm chứng restart vẫn giữ job/cấu hình; kiểm chứng guide dựng được một môi trường mới trước khi đóng D-01.

Không cần Docker Pipeline plugin hoặc Docker-in-Docker nếu agent container đã có công cụ và pipeline chỉ chạy npm trực tiếp. Có thể chọn phương án native khi Docker không dùng được, nhưng phải ghi lại khác biệt môi trường.

### Đầu ra và tiêu chí xong

File cấu hình: `infra/jenkins/compose.yaml` (controller), `infra/jenkins/compose.agent.yaml` và `infra/jenkins/agent.Dockerfile` (agent, workspace, npm cache), `infra/jenkins/.env.example`; plugin cài qua giao diện theo guide, danh sách phiên bản thực tế lưu tại `docs/evidence/D-01/plugins.txt`; guide tại [`docs/jenkins/SETUP_GUIDE.md`](SETUP_GUIDE.md); evidence tại `docs/evidence/D-01/`.

Jenkins truy cập được trên máy, agent online và chạy được `git --version`, `node --version`, `npm --version` trên chính agent. Guide cho phép dựng lại, không dựa vào các bước cài tay chưa ghi.

## Phase 2 — Pipeline cơ bản chạy bằng tay

### Công việc

- [ ] Viết `Jenkinsfile` tại root, chọn label agent và timeout phù hợp.
- [ ] Tạo Multibranch Pipeline với GitHub Branch Source, repository EShop và Script Path `Jenkinsfile`.
- [ ] Scan repository, xác nhận nhánh chứa Jenkinsfile được phát hiện; chạy `Build Now` trên nhánh đó.
- [ ] Ghi SHA checkout, tên nhánh, OS và runtime vào log/metadata.
- [ ] Tách các stage để nhận biết bước nào thất bại; đặt working directory đúng `backend/`.
- [ ] Dùng workspace/report sạch; kiểm tra không upload report từ build trước.

Luồng:

```text
Checkout → Environment → Install → Lint → Build → Tests
```

Command tương ứng trong backend:

```text
npm ci
npm run lint
npm run build
npm run test:ci
```

Không cần chạy `node server.js` hoặc reset database gốc trước Jest. Harness tự tạo Express instance, Supertest HTTP server tạm và SQLite trong bộ nhớ. Backend `build` là kiểm tra cú pháp, không sinh bundle/JAR hoặc thư mục `dist`.

### Đầu ra và tiêu chí xong

Có Jenkinsfile, URL/ảnh build và log stage chứng minh lệnh chạy thật trên đúng commit. Lint/build fail hoặc Jest fail phải giữ verdict tương ứng. Nếu full suite vẫn có lỗi đã biết, ghi nhận build fail đúng baseline; tiêu chí build xanh của D-02 vẫn theo quyết định phase 0.

Vỹ review cách gọi bộ test và việc giữ exit code. Không cần chờ webhook/ngrok để làm phase này.

## Phase 3 — Test report, coverage, log và cache

### Công việc

- [ ] Bổ sung package npm `jest-junit` và cấu hình reporter JUnit dùng chung cho C/D; cập nhật lockfile, giữ reporter console mặc định.
- [ ] Dùng JUnit plugin Jenkins để publish test-result XML. Đây là định dạng report, không yêu cầu viết lại test bằng Java.
- [ ] Giữ coverage reporters hiện có; dùng Coverage plugin đọc Cobertura. Không cài JaCoCo plugin cho EShop.
- [ ] Trong `post { always { ... } }`, thu report, log và metadata kể cả khi assertion fail; giữ build fail nếu lệnh kiểm tra fail.
- [ ] Sau một test failure thực tế, mở Jenkins Test Results để xem ID, expected/actual và lịch sử; tải artefact để xác nhận file đọc được.
- [ ] Phân biệt test-result XML và coverage XML; không đưa Cobertura vào bước `junit`.
- [ ] Kiểm tra file report thiếu/rỗng hoặc từ run cũ. Không mặc định `allowEmptyResults: true` cho bước đã yêu cầu chạy test; lỗi trước khi runner chạy cần được ghi rõ là chưa tạo report.
- [ ] Cấu hình npm download cache bằng volume riêng; vẫn chạy `npm ci` mỗi build, không dùng lại `node_modules` để bỏ qua install.
- [ ] Kiểm tra reuse cache qua các build/agent restart; chuẩn bị thư mục/key cache riêng cho phép đo cold/warm.
- [ ] Kiểm tra từng bước publish/archive để lỗi xử lý một report không làm mất các artefact khác có thể thu được.

Output quy ước đề xuất:

```text
backend/test-results/junit.xml
backend/test-results/results.json
backend/test-results/test.log
backend/test-results/run-metadata.json
backend/coverage/cobertura-coverage.xml
backend/coverage/coverage-summary.json
```

Đây là các đường dẫn cần cấu hình, không phải tất cả đều đã có sẵn trong repo. Report/coverage tự sinh tiếp tục được ignore; chỉ copy bằng chứng đã chọn và kiểm tra dữ liệu nhạy cảm vào thư mục evidence.

### Đầu ra và tiêu chí xong

Một build có Test Results, Coverage và artefact tải được, kể cả khi test fail. Có evidence `docs/evidence/D-03/` và hướng dẫn cache. Báo thiếu report rõ ràng khi install/runner lỗi; không dùng report cũ thay thế. Chưa tự thêm ngưỡng coverage 70% hoặc ngưỡng khác nếu nhóm chưa thống nhất.

## Phase 4 — Push hoặc PR tự kích hoạt pipeline

### Công việc

- [ ] Giữ mô hình Multibranch đã chạy được ở phase 2; cấu hình discovery cho branch và PR theo phạm vi demo.
- [ ] Nếu Jenkins ở máy local, chuẩn bị đường dẫn GitHub truy cập được, ví dụ ngrok như YAS; cập nhật Jenkins URL và webhook URL khi địa chỉ thay đổi.
- [ ] Cấu hình webhook Push/PR, credential và secret phù hợp; không lưu token/secret vào repository hoặc ảnh minh chứng.
- [ ] Kiểm tra webhook delivery và build thực tế; đối chiếu SHA trong Jenkins với commit vừa push.
- [ ] Nếu quét định kỳ làm phương án dự phòng, ghi rõ cấu hình và tránh kích hoạt trùng gây nhiễu demo/phép đo.
- [ ] Phối hợp Dương về status checks. GitHub Actions là CI chính; chỉ yêu cầu Jenkins chặn merge khi nhóm chủ động thống nhất điều đó.

### Đầu ra và tiêu chí xong

Tạo nhánh demo, push một commit và xác nhận Jenkins tự build đúng nhánh/commit. Có ảnh webhook delivery, ảnh build và guide. Chọn status check thực sự được repo phát ra, không copy tên `jenkins/branch` hoặc `pr-head` từ ảnh YAS mà chưa kiểm chứng.

Ngrok/webhook phục vụ demo tự kích hoạt; phép đo E-03 vẫn có thể dùng Build Now khi protocol quy định. Phase này là bước mở rộng theo quy trình YAS, không phải điều kiện để bắt đầu chạy test trên Jenkins.

## Phase 5 — Demo một lỗi code có chủ đích

### Công việc

- [ ] Chọn một hành vi backend đã có test pass và lỗi code có thể tái hiện ổn định; ví dụ làm middleware từ chối token hợp lệ.
- [ ] Lưu build baseline và SHA trước khi sửa.
- [ ] Trên nhánh demo riêng, commit thay đổi code gây lỗi; push để Jenkins tự chạy.
- [ ] Xác nhận lint/build vẫn pass nếu mục tiêu là demo test phát hiện lỗi nghiệp vụ; mở report cho thấy test liên quan fail.
- [ ] Lưu diff, SHA, URL/ảnh, raw log, ID test và expected/actual.
- [ ] Revert commit lỗi, push lại và xác nhận lỗi mới biến mất, kết quả trở về baseline.

Không dùng test flaky cho demo này. Không cần viết thêm test nếu thay đổi đã được bộ test hiện tại phát hiện.

### Đầu ra và tiêu chí xong

Ba điểm bằng chứng: baseline → lỗi → revert trong `docs/evidence/D-04/`. Nếu baseline còn mười lỗi SUT, chứng minh lỗi mới xuất hiện rồi biến mất; không gọi đó là xanh → đỏ → xanh. Chỉ dùng cách mô tả xanh → đỏ → xanh khi baseline xanh hợp lệ đã có.

## Phase 6 — Đo và so sánh Jenkins với GitHub Actions

### Đầu vào

Pipeline Jenkins/report/cache đã ổn định và Dương có workflow GitHub Actions chạy được cùng phạm vi. Chốt protocol trước khi đo, không thay code hoặc lựa chọn test giữa các lượt trong cùng nhóm so sánh.

### Công việc

- [ ] Dùng cùng commit SHA, Node/npm, command, test scope và reporter; ghi rõ mọi khác biệt không thể đồng nhất.
- [ ] Ghi OS, CPU/RAM, loại agent/runner, giới hạn song song, điều kiện mạng và cache.
- [ ] Chạy tối thiểu ba lần trên mỗi nền tảng theo D-05. Đề xuất sáu lần/nền tảng nếu muốn đối chiếu cache rõ hơn: ba cold và ba warm.
- [ ] Dùng cache thí nghiệm riêng: cold có thư mục/key mới, warm reuse cache đã tạo; workspace/report sạch và `npm ci` vẫn chạy ở mọi lượt.
- [ ] Định nghĩa mốc bắt đầu/kết thúc, tách queue/provisioning khỏi thời gian thực thi; ghi thời gian checkout, install, lint, build, test và publish nếu thu được.
- [ ] Lưu nguồn từng run: URL, screenshot, raw log, metadata và report. Với Jenkins local, bổ sung bằng chứng xem offline vì URL local không truy cập được từ máy GVTH.
- [ ] Tổng hợp từng run và median theo điều kiện cache, không chỉ lấy lượt nhanh nhất.
- [ ] Viết so sánh về công sức setup, cấu hình, cache, artefact, agent/plugin và vận hành; rút ra lý do chọn GitHub Actions làm chính dựa trên nhu cầu nhóm và kết quả thực tế.

Schema dữ liệu dự kiến trong `docs/jenkins/comparison.csv`:

```text
platform,run_id,commit_sha,os,node,npm,runner,cpu_ram,cache_condition,queue_s,setup_s,checkout_s,install_s,lint_s,build_s,test_s,publish_s,total_s,passed,failed,status,run_url,evidence_path
```

### Đầu ra và tiêu chí xong

`docs/jenkins/comparison.csv`, `comparison.md` và `docs/evidence/D-05/`, có Dương review. Các số liệu truy về run gốc; không điền số minh họa thành số thực nghiệm. Full-suite fail vẫn đo được nếu hai bên thực hiện đủ phạm vi cần so sánh và kết quả được ghi nhãn; nó không thay bằng chứng build xanh D-02.

Không kết luận chênh lệch thời gian hoàn toàn do nền tảng khi Jenkins local và GitHub-hosted runner khác phần cứng/mạng. Các lượt D-05 không tự thay thế 10 lượt flaky E-03.

## Phase 7 — Hoàn thiện guide, evidence và bàn giao

### Công việc

- [ ] Hoàn thiện guide: chuẩn bị môi trường, dựng controller/agent, cấu hình job, chạy tay, webhook, đọc report, cache, xử lý lỗi và restart.
- [ ] Liệt kê phiên bản đã kiểm chứng, nguồn tham khảo và giới hạn môi trường.
- [ ] Tạo index dẫn từ D-01–D-06 tới file, SHA, build URL và ảnh/log gốc.
- [ ] Nhờ người khác dựng/chạy theo guide; ghi người thực hiện và kết quả thật.
- [ ] Nhận review của Vỹ cho pipeline/test, Dương cho phép đo; ghi nhận sau khi review diễn ra.
- [ ] Chỉ cập nhật checkbox checklist nhóm khi đã có đủ bằng chứng, đặc biệt tiêu chí build xanh D-02.
- [ ] Chuẩn bị kịch bản demo: xem pipeline baseline → push commit lỗi → đọc test report → revert; chuẩn bị run/log đã ghi phòng mạng hoặc tunnel gián đoạn.
- [ ] Bàn giao nội dung Jenkins cho guide, báo cáo, slide và video của nhóm; cập nhật nhật ký sử dụng AI/đóng góp theo phần việc thực tế.

### Đầu ra và tiêu chí xong

Guide có thể làm theo, evidence/index truy cập được và D-01–D-06 được đối chiếu từng tiêu chí. Không ghi nhận trước peer review, số liệu, deployment hoặc lần dựng lại chưa thực hiện.

## Phối hợp mục E sau khi pipeline hoạt động

Mục này phân biệt thí nghiệm flaky với demo lỗi code của phase 5. E-01/E-02 do Vỹ phụ trách; nền tảng chạy E-03 do nhóm chọn, không mặc định phải chạy cả hai nền tảng mười lần.

- Vỹ chuẩn bị flaky test có nguyên nhân timing/sleep đã biết, nhánh/job thí nghiệm và protocol cố định.
- Nếu chọn Jenkins, Vượng hỗ trợ job riêng, giữ nguyên commit, thu ít nhất mười build độc lập với fixture sạch; ghi kết quả riêng của test flaky, runtime, raw log và từng attempt.
- Retry trong một build không được tính thành các build độc lập. Nếu không bật retry, ghi rõ một attempt và không retry; không tạo retry history giả.
- Khi full suite đã đỏ do lỗi khác, theo dõi ID test flaky và số fail thay đổi, không chỉ nhìn màu build.
- Nếu mười lượt không có cả pass và fail, ghi đúng rằng chưa quan sát được tính chập chờn trong đợt đo đó.
- Theo E-04, Vượng tự phân tích log thủ công, ghi thời gian, giả thuyết, bằng chứng và bước kiểm tra **trước khi xem AI triage**. Lưu bản manual trước khi dùng AI phân tích chính bộ log thực nghiệm.
- Sau phân tích và sửa nguyên nhân, nhóm chạy lại để xác nhận. Không để test flaky thí nghiệm làm nhiễu pipeline chính.

## Cách ghi chú trong từng buổi làm

Mỗi buổi ghi: phase/task, SHA, môi trường/phiên bản, thao tác/lệnh, kết quả/exit code, lỗi và cách xử lý, đường dẫn evidence, việc còn lại. Ảnh cấu hình phải che credential; không đưa JWT hoặc secret vào artefact chia sẻ.

Commit theo quy ước nhóm, ví dụ:

```text
docs(D-01): record Jenkins setup phases
ci(D-01): add reproducible Jenkins environment
ci(D-02): run backend checks in Jenkins
ci(D-03): publish test reports and retain npm cache
docs(D-04): record intentional failure demo
docs(D-05): record pipeline comparison measurements
docs(D-06): explain platform selection
```

## Tài liệu dùng khi triển khai

- [Checklist nhóm](checklist.md).
- [Lệnh và test harness của backend](../../backend/tests/README.md).
- [Kiến trúc harness](../architecture/test-harness.md).
- [Hướng dẫn môi trường EShop](../../setup_guide.md).
- [Jenkins Docker](https://www.jenkins.io/doc/book/installing/docker/).
- [GitHub Branch Source plugin](https://plugins.jenkins.io/github-branch-source/).
- [JUnit plugin](https://plugins.jenkins.io/junit/).
- [Coverage plugin](https://plugins.jenkins.io/coverage/).
- [jest-junit reporter](https://github.com/jest-community/jest-junit).
- [JaCoCo plugin đã end-of-life và hướng dẫn chuyển Coverage plugin](https://plugins.jenkins.io/jacoco/).
