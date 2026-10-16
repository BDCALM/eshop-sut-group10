# Hướng dẫn setup Jenkins

Tài liệu gồm ba phần: (A) dựng Jenkins controller và cài plugin, (B) dựng agent có Git, Node/npm và npm cache, (C) tạo Multibranch Pipeline, lấy source và chạy build. Cách xem stage và báo cáo pipeline được trình bày trong [hướng dẫn báo cáo](reports.md).

## Thành phần

[Docker Compose](../../infra/jenkins/compose.yaml) dùng image chính thức Jenkins LTS 2.580.1 với JDK 21, cố định digest. Jenkins chạy tại http://localhost:8080 và chỉ bind localhost. Volume jenkins-home giữ tài khoản, cấu hình và plugin đã cài.

Agent là container thực thi lệnh của job. Controller hiện có quản lý job và giao diện Jenkins. Git, Java 21, Node 24.14.0 và npm 11.9.0 nằm trong image agent, không phụ thuộc Node/npm trên Windows. Dockerfile cũng cài Python, make và g++ để có thể build dependency native SQLite khi cần. Volume `agent-work` giữ workspace của job; volume `npm-cache` giữ cache tải package của npm (`/home/jenkins/.npm`) qua các lần build và khi tạo lại container.

Cấu hình bổ sung nằm trong `infra/jenkins/compose.agent.yaml`; giữ file Compose controller hiện có. Agent kết nối tới `http://controller:8080/` qua mạng Docker bằng WebSocket. Trình duyệt Windows vẫn mở `http://localhost:8080`. Không cần mở cổng 50000, SSH hoặc cài NodeJS/Docker Pipeline plugin cho cách chạy này.

## Phần A — Jenkins controller

### 1. Khởi động Jenkins

Mở Docker Desktop, chờ Linux engine hoạt động. Mở PowerShell (hoặc terminal) tại thư mục gốc của repo vừa clone; mọi lệnh trong tài liệu này đều chạy từ thư mục gốc đó:

```powershell
cd <đường-dẫn-tới-repo>/eshop-sut-group10
docker compose -f infra/jenkins/compose.yaml up -d
docker compose -f infra/jenkins/compose.yaml ps
```

Mở http://localhost:8080. Nếu cần đổi cổng, copy infra/jenkins/.env.example thành infra/jenkins/.env và sửa JENKINS_PORT; không ghi đè .env đang có.

### 2. Hoàn tất khởi tạo

Nếu Jenkins hiện Unlock Jenkins, tự lấy mật khẩu khởi tạo bằng:

```powershell
docker compose -f infra/jenkins/compose.yaml exec controller cat /var/jenkins_home/secrets/initialAdminPassword
```

Nhập mật khẩu, hoàn tất wizard, cài suggested plugins nếu Jenkins yêu cầu, tạo tài khoản quản trị và đặt Jenkins URL theo cổng đang dùng. Không đưa mật khẩu vào log chia sẻ.

Nếu trang hiện Sign in và đã có tài khoản, đăng nhập bằng tài khoản đó. Không tạo lại hoặc xóa volume chỉ để chạy lại wizard. Plugin đã có từ lần khởi tạo trước tiếp tục nằm trong volume; file Compose hiện tại không tự cài thêm plugin.

### 3. Cài plugin cho pipeline EShop

Pipeline của repo cần 5 plugin dưới đây. Nếu đã chọn **Install suggested plugins** ở wizard thì 4 plugin đầu thường đã có; **Coverage** không nằm trong bộ suggested nên luôn phải cài thêm.

| Plugin (ID) | Dùng cho repo này |
| --- | --- |
| Pipeline (`workflow-aggregator`) | Chạy `Jenkinsfile` ở thư mục gốc repo. |
| Git (`git`) | Checkout mã nguồn từ GitHub về workspace của agent. |
| GitHub Branch Source (`github-branch-source`) | Tạo Multibranch Pipeline, quét nhánh/PR của repo và nhận webhook GitHub. |
| JUnit (`junit`) | Hiển thị Test Results từ JUnit XML của bộ test backend (`backend/test-results/junit.xml`). |
| Coverage (`coverage`) | Hiển thị coverage từ Cobertura XML do Jest sinh (`backend/coverage/cobertura-coverage.xml`). |

Cách kiểm tra và cài:

1. Vào **Manage Jenkins → Plugins → Installed plugins**, tìm lần lượt 5 plugin trên.
2. Plugin nào chưa có: vào **Available plugins**, gõ tên plugin, tích chọn đúng plugin (đối chiếu ID trong bảng), chọn **Install**. Jenkins tự cài các plugin phụ thuộc.
3. Nếu trang cài đặt báo cần restart, tích **Restart Jenkins when installation is complete and no jobs are running** và chờ Jenkins khởi động lại.
4. Kiểm tra lại cả 5 plugin nằm trong **Installed plugins** và đang bật.

Không cần NodeJS, Docker Pipeline, Maven, JaCoCo hoặc SonarQube plugin: Node/npm đã có sẵn trong agent và pipeline chỉ chạy lệnh npm.

Phiên bản plugin phụ thuộc thời điểm cài nên cần ghi lại phiên bản thực tế. Vào **Manage Jenkins → Script Console**, chạy:

```groovy
Jenkins.instance.pluginManager.plugins
    .sort { it.shortName }
    .each { println "${it.shortName}:${it.version}" }
```

Copy kết quả (danh sách `id:phiên-bản`, không chứa secret) vào `docs/evidence/D-01/plugins.txt`.

### 4. Dừng và mở lại controller

```powershell
docker compose -f infra/jenkins/compose.yaml stop
docker compose -f infra/jenkins/compose.yaml up -d
```

Không dùng down -v nếu muốn giữ dữ liệu Jenkins. Không cần chạy backend, frontend hoặc bộ test EShop ở bước setup này.

#### Tiêu chí hoàn tất phần A

- Docker container Jenkins chạy và có trạng thái healthy.
- Mở được giao diện Jenkins.
- Hoàn tất khởi tạo và đăng nhập được.
- Đủ 5 plugin ở bước 3 và đã ghi danh sách phiên bản plugin.
- Stop/start vẫn giữ tài khoản và cấu hình.

## Phần B — Agent cho EShop

Thực hiện sau khi đã đăng nhập Jenkins thành công ở phần A.

### 5. Tạo node trên giao diện Jenkins

Mở Jenkins, chọn **Manage Jenkins → Nodes → New Node**:

- Node name: `eshop-agent`.
- Type: **Permanent Agent**; chọn Create.

Điền cấu hình:

| Trường | Giá trị |
| --- | --- |
| Number of executors | `1` |
| Remote root directory | `/home/jenkins/agent` |
| Labels | `eshop-node` |
| Usage | Only build jobs with label expressions matching this node |
| Launch method | Launch agent by connecting it to the controller |

Chọn **Save**, mở trang node `eshop-agent`. Node sẽ Offline cho tới khi container kết nối. Trang này hiển thị lệnh chạy có `-secret` và mã kết nối. Nếu có tùy chọn WebSocket, chọn nó; container đã dùng cờ `-webSocket`.

### 6. Lưu secret trên máy

Chạy PowerShell từ thư mục gốc repo. Chỉ tạo `.env` nếu chưa có (nếu đã có sẵn với `JENKINS_AGENT_SECRET=` để trống, chỉ cần mở và điền):

```powershell
if (-not (Test-Path -LiteralPath infra/jenkins/.env)) {
    Copy-Item -LiteralPath infra/jenkins/.env.example -Destination infra/jenkins/.env
}
notepad infra/jenkins/.env
```

Điền mã lấy từ trang node vào `JENKINS_AGENT_SECRET` rồi lưu:

```dotenv
JENKINS_PORT=8080
JENKINS_AGENT_SECRET=<mã-secret-của-node-eshop-agent>
```

Thay toàn bộ phần `<...>` bằng mã thật. Nếu file đã có cấu hình khác, giữ các dòng đó và chỉ thêm/sửa biến cần thiết. Đây là secret kết nối agent, không phải mật khẩu đăng nhập Jenkins hay GitHub token. `.env` đã được gitignore và loại khỏi Docker build context; không đưa mã vào chat, ảnh hoặc commit. Không chia sẻ đầu ra `docker compose config` vì có thể chứa giá trị đã thay thế.

### 7. Build image và khởi động agent

```powershell
docker compose -f infra/jenkins/compose.yaml -f infra/jenkins/compose.agent.yaml up -d --build agent
docker compose -f infra/jenkins/compose.yaml -f infra/jenkins/compose.agent.yaml ps
docker compose -f infra/jenkins/compose.yaml -f infra/jenkins/compose.agent.yaml logs --tail 30 agent
```

Lượt đầu cần mạng để tải image và package. File cấu hình yêu cầu secret có giá trị trước khi tạo container. Hai file Compose cùng dùng project `eshop-ci`, cùng controller và volume Jenkins đã có.

### 8. Xác nhận kết nối và công cụ

Trang **Manage Jenkins → Nodes → eshop-agent** phải hiện **Online**; log agent có thông báo kết nối thành công, không liên tục kết nối lại. Trạng thái Docker `Up` riêng lẻ chưa đủ xác nhận agent Online.

```powershell
docker compose -f infra/jenkins/compose.yaml -f infra/jenkins/compose.agent.yaml exec agent node --version
docker compose -f infra/jenkins/compose.yaml -f infra/jenkins/compose.agent.yaml exec agent npm --version
docker compose -f infra/jenkins/compose.yaml -f infra/jenkins/compose.agent.yaml exec agent git --version
docker compose -f infra/jenkins/compose.yaml -f infra/jenkins/compose.agent.yaml exec agent java -version
docker compose -f infra/jenkins/compose.yaml -f infra/jenkins/compose.agent.yaml exec agent npm config get cache
docker compose -f infra/jenkins/compose.yaml -f infra/jenkins/compose.agent.yaml exec agent sh -c "touch /home/jenkins/agent/.write-test /home/jenkins/.npm/.write-test && rm /home/jenkins/agent/.write-test /home/jenkins/.npm/.write-test && echo write-ok"
```

Node phải là `v24.14.0`, npm `11.9.0`, Java 21; npm cache là `/home/jenkins/.npm`; lệnh cuối in `write-ok` (user `jenkins` ghi được workspace và cache); ghi nhận Git thực tế vì package Git được cài từ apt khi build. Sau khi agent Online, vào cấu hình **Built-In Node**, đặt **Number of executors = 0** để các job chạy trên agent riêng. Pipeline tiếp theo sẽ chọn label `eshop-node`.

### 9. Dừng, mở lại và xử lý lỗi

Sau khi đã setup agent, dùng cả hai file để quản lý toàn bộ môi trường:

```powershell
docker compose -f infra/jenkins/compose.yaml -f infra/jenkins/compose.agent.yaml stop
docker compose -f infra/jenkins/compose.yaml -f infra/jenkins/compose.agent.yaml up -d
```

`stop`/`up` giữ nguyên các volume `jenkins-home`, `agent-work` và `npm-cache`. Không dùng `down -v` nếu muốn giữ cấu hình Jenkins, workspace và npm cache.

- Báo thiếu `JENKINS_AGENT_SECRET`: kiểm tra file `infra/jenkins/.env` và giá trị đã lưu (biến để trống cũng bị báo thiếu).
- Báo unknown client name/authorization: đối chiếu tên node `eshop-agent` và secret của chính node này.
- Connection refused: kiểm tra controller healthy, Docker engine đang chạy; URL bên trong agent phải dùng `controller`, không dùng `localhost`.
- Agent Online nhưng job chờ executor: kiểm tra label job trùng `eshop-node`, agent có một executor và không bị đánh dấu tạm Offline.

#### Tiêu chí hoàn tất phần B

Bước này hoàn tất khi agent Online, các lệnh kiểm tra phiên bản chạy được và kiểm tra ghi workspace/npm cache in `write-ok`. Chưa cần GitHub webhook, job pipeline hoặc chạy bộ test. Quyền checkout GitHub được cấu hình riêng khi tạo job.

Jenkinsfile và phần publish báo cáo được cấu hình trong repo. Xem [hướng dẫn mở Stages, Test Results và Coverage](reports.md) để theo dõi build trên giao diện thay vì đọc raw JSON/XML. Các build cũ không tự có báo cáo mới; cần chạy build từ commit chứa cấu hình publisher.

## Phần C — Tạo và chạy Multibranch Pipeline (D-02)

### 10. Chuẩn bị mã nguồn và quyền truy cập

- Controller chạy, agent `eshop-agent` Online với label `eshop-node`; các bước phần A/B đã hoàn tất.
- Repo dùng cho Jenkins hiện tại là `https://github.com/SUT-group10/eshop-sut-group10.git`. Repo trước đây được nhắc dưới tài khoản `BDCALM`; khi dựng lại dùng URL organization hiện tại.
- Nhánh `cicd/jenkins` đã push và có file tên chính xác **`Jenkinsfile`** ở thư mục gốc. `main` chưa có file này thì scan báo không đạt tiêu chí cho `main` là bình thường.
- Commit cả `backend/package.json` và `backend/package-lock.json` nếu thay đổi dependency/reporter. Job tải source trên GitHub, không tự đọc thay đổi chưa push trong thư mục Windows.

Nên cấu hình credential cho GitHub API để tránh quota anonymous thấp. Chỉ có quyền Settings của repo hoặc đang đăng nhập GitHub trên Windows không tự cấp credential cho Jenkins trong container.

### 11. Lưu GitHub credential vào Jenkins

Trên GitHub, tạo PAT có quyền đọc đúng repo. Nếu dùng fine-grained token, chọn resource owner `SUT-group10`, repo `eshop-sut-group10`, Contents/Metadata/Pull requests read; thêm Commit statuses read/write nếu Jenkins gửi trạng thái build về GitHub. Organization có thể yêu cầu duyệt token/quyền. Token chỉ có “Access on” tài khoản cá nhân và Public repositories read-only không ghi được status cho repo organization.

Nếu dùng PAT classic cho repo public như cấu hình hiện tại, `repo:status` cho phép gửi commit status; việc quản lý webhook bằng tay không đòi hỏi cấp quyền admin webhook cho token này. Repo private cần quyền đọc tương ứng. Chính sách organization có thể giới hạn loại token hoặc yêu cầu ủy quyền bổ sung. Không cấp quyền rộng chỉ để thử hết các ô.

Trong Jenkins, vào **Manage Jenkins → Credentials → System → Global credentials → Add Credentials**:

| Trường | Giá trị |
| --- | --- |
| Kind | Username with password |
| Scope | Global |
| Username | Username GitHub sở hữu token |
| Password | PAT, không phải mật khẩu GitHub |
| ID | `github-eshop-pat` (ID đang được job dùng) |
| Description | GitHub access for EShop CI |

Nếu credential này đã có, chọn Update để thay token khi cần, không tạo nhiều credential trùng mục đích. Token được nhập trực tiếp vào Jenkins; không lưu vào repo, Jenkinsfile, ảnh hay tài liệu. Token GitHub, webhook secret và agent secret có ba mục đích khác nhau.

### 12. Tạo job và cấu hình source

Nếu job `eshop-ci` đã tồn tại thì chọn **Configure**, không tạo job trùng. Khi dựng mới:

1. Từ dashboard chọn **New Item**, đặt tên `eshop-ci`, chọn **Multibranch Pipeline**, OK.
2. **Branch Sources → Add source → GitHub**.
3. Chọn credential `github-eshop-pat` ngay tại Branch Source; chỉ tạo credential ở trang quản trị mà không chọn vào job thì scan vẫn có thể anonymous.
4. Repository HTTPS URL: `https://github.com/SUT-group10/eshop-sut-group10.git`. Nếu giao diện tách trường, owner là `SUT-group10`, repository là `eshop-sut-group10`.
5. Trong Behaviours giữ **Discover branches**; chọn **All branches** cho cấu hình D-02 đơn giản. Không đặt bộ lọc tên nhánh loại `cicd/jenkins`. Discover PRs là phần mở rộng, không bắt buộc để chạy tay nhánh D-02.
6. Build Configuration: **by Jenkinsfile**; Script Path: **`Jenkinsfile`**, không phải `backend/Jenkinsfile`.
7. Save.

Đây là hướng dẫn cấu hình tối thiểu để dựng lại. Job hiện hữu có thể còn các behaviour discovery PR mặc định; phải ghi rõ nếu dùng chúng trong thí nghiệm đối chiếu.

### 13. Scan và chạy Build Now

1. Trong job Multibranch `eshop-ci`, chọn **Scan Multibranch Pipeline Now**.
2. Mở Scan Log, xác nhận đang dùng credential, đọc đúng owner/repo; nhánh `cicd/jenkins` có `Jenkinsfile` và đạt criteria.
3. Sau khi phát hiện, Jenkins tạo job con `cicd/jenkins`. Scan đầu có thể tự tạo build.
4. Mở **job con** `cicd/jenkins`, chọn **Build Now** khi cần chạy tay. Scan lại commit không đổi không đảm bảo tạo một build mới.
5. Mở build mới → Console Output; đối chiếu SHA ở Environment với commit cần chạy. Xem [baseline build #4](../evidence/D-02/baseline.md) làm ví dụ đã kiểm chứng.

Pipeline lấy mã nguồn từ SCM của chính job bằng `checkout scm`, sau khi dọn workspace. Các bước npm chạy trong `backend/` trên Linux agent; không cần mở backend/frontend hoặc database riêng trước Jest. Harness tự quản lý Express/SQLite trong bộ nhớ.

Luồng gồm sáu stage:

```text
Checkout → Environment → Install → Lint → Build → Tests
```

Install dùng `npm ci`; Lint dùng `npm run lint`; Build dùng `npm run build` để kiểm tra cú pháp; Tests dùng `npm run test:ci` cho toàn bộ unit/API/smoke/harness. Lệnh lỗi giữ exit code, làm stage/build fail. Với baseline hiện có, 10 assertion SUT fail là kết quả được giữ nguyên, không phải lý do thay expected hoặc bỏ test.

### 14. Xem giao diện và lưu minh chứng

- Bảng ô màu ngay trang job nhánh cần **Pipeline: Stage View** (`pipeline-stage-view`). Plugin này đã được cài trong môi trường đang dùng; khi dựng volume mới cần cài lại nếu muốn cùng giao diện.
- Menu **Stages** / **Pipeline Overview** dùng Pipeline Graph View; mở đúng trang nhánh hoặc trang build theo [hướng dẫn báo cáo](reports.md).
- Build từ commit chứa reporter/publisher có Test Results và Coverage. Các build cũ không tự có report mới.
- Lưu console đầy đủ từ Console Output → View as plain text/Download nếu giao diện có. Có thể lấy trực tiếp file console của build từ Jenkins volume; phải ghi phương pháp xuất, không giả là một lần tải qua trình duyệt.
- Khi chụp Stage View, giữ tên job/nhánh, số build và đủ sáu stage. Dùng cùng build với baseline, JSON và log.

Minh chứng D-02 hiện tại: [baseline](../evidence/D-02/baseline.md), [console build #4](../evidence/D-02/console-build-4.txt), [mục nhóm/sinh viên cần điền](../evidence/D-02/group-decision.md).

### 15. Chẩn đoán bước scan/build cơ bản

| Hiện tượng | Kiểm tra / xử lý |
| --- | --- |
| `main: Jenkinsfile not found` | Nếu file chỉ có trên `cicd/jenkins`, tiếp tục xem kết quả nhánh đó; không cần chuyển file sang main để chạy D-02. |
| Không xuất hiện job nhánh | Xem scan đã hoàn tất chưa; kiểm tra repo/nhánh, discovery/filter, quyền đọc và Script Path. |
| `anonymous access`, API limiter ngủ nhiều phút | Kiểm tra đã chọn credential trong Branch Sources. Trong Manage Jenkins → System → GitHub API usage, có thể chọn `Throttle at/near rate limit` thay vì chia đều request; không tắt bảo vệ quota. |
| Vừa thêm token nhưng build cũ còn anonymous | Lượt cũ có thể đã tạo client trước khi đổi credential. Dừng lượt đang kẹt rồi Build Now trên job nhánh để kiểm chứng lượt mới; không cần xóa job/volume. |
| `Still waiting to schedule task` | Kiểm tra agent Online và label `eshop-node`; timeout top-level của pipeline không bao gồm thời gian chờ cấp agent. |
| GitHub commit status trả 403 | Kiểm tra token đúng owner/repo, quyền Commit statuses write và trạng thái duyệt/ủy quyền của organization; đọc repo được không đồng nghĩa gửi status được. |
| Tests đỏ, 39 test / 10 fail | Đối chiếu từng ID với baseline; chưa được mặc định mọi fail mới là bug cũ. |

Webhook/ngrok dùng khi muốn push tự kích hoạt. **Không phải điều kiện để Scan và Build Now chạy được** trong D-02. Trạng thái commit trên GitHub là chiều Jenkins gửi kết quả qua API/token, độc lập với chiều GitHub gửi webhook tới Jenkins.

## Tham khảo

- [Cài Jenkins bằng Docker](https://www.jenkins.io/doc/book/installing/docker/).
- [Jenkins: sử dụng agent, label và executor](https://www.jenkins.io/doc/book/using/using-agents/).
- [Image inbound agent chính thức: tạo node và kết nối](https://github.com/jenkinsci/docker-agents/blob/master/README_inbound-agent.md).
- [Quản lý plugin Jenkins](https://www.jenkins.io/doc/book/managing/plugins/).
- [JUnit step](https://www.jenkins.io/doc/pipeline/steps/junit/)
- [Coverage plugin](https://plugins.jenkins.io/coverage/).
- [Jenkins Pipeline as Code và credential cho GitHub](https://www.jenkins.io/doc/book/pipeline/pipeline-as-code/).
- [GitHub PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).
- [GitHub commit status](https://docs.github.com/en/rest/commits/statuses).
