# Setup môi trường Jenkins

Phạm vi hiện tại chỉ gồm khởi động Jenkins LTS, hoàn tất màn hình khởi tạo và giữ dữ liệu sau khi restart. Chưa cấu hình agent, job, pipeline, webhook hoặc report cho EShop.

## Thành phần

[Docker Compose](../../infra/jenkins/compose.yaml) dùng image chính thức Jenkins LTS 2.580.1 với JDK 21, cố định digest. Jenkins chạy tại http://localhost:8080 và chỉ bind localhost. Volume jenkins-home giữ tài khoản, cấu hình và plugin đã cài.

## 1. Khởi động Jenkins

Mở Docker Desktop, chờ Linux engine hoạt động. Mở PowerShell (hoặc terminal) tại thư mục gốc của repo vừa clone; mọi lệnh trong tài liệu này đều chạy từ thư mục gốc đó:

```powershell
cd <đường-dẫn-tới-repo>/eshop-sut-group10
docker compose -f infra/jenkins/compose.yaml up -d
docker compose -f infra/jenkins/compose.yaml ps
```

Mở http://localhost:8080. Nếu cần đổi cổng, copy infra/jenkins/.env.example thành infra/jenkins/.env và sửa JENKINS_PORT; không ghi đè .env đang có.

## 2. Hoàn tất khởi tạo

Nếu Jenkins hiện Unlock Jenkins, tự lấy mật khẩu khởi tạo bằng:

```powershell
docker compose -f infra/jenkins/compose.yaml exec controller cat /var/jenkins_home/secrets/initialAdminPassword
```

Nhập mật khẩu, hoàn tất wizard, cài suggested plugins nếu Jenkins yêu cầu, tạo tài khoản quản trị và đặt Jenkins URL theo cổng đang dùng. Không đưa mật khẩu vào log chia sẻ.

Nếu trang hiện Sign in và đã có tài khoản, đăng nhập bằng tài khoản đó. Không tạo lại hoặc xóa volume chỉ để chạy lại wizard. Plugin đã có từ lần khởi tạo trước tiếp tục nằm trong volume; file Compose hiện tại không tự cài thêm plugin.

## 3. Dừng và mở lại

```powershell
docker compose -f infra/jenkins/compose.yaml stop
docker compose -f infra/jenkins/compose.yaml up -d
```

Không dùng down -v nếu muốn giữ dữ liệu Jenkins. Không cần chạy backend, frontend hoặc bộ test EShop ở bước setup này.

## Tiêu chí hoàn tất bước setup

- Docker container Jenkins chạy và có trạng thái healthy.
- Mở được giao diện Jenkins.
- Hoàn tất khởi tạo và đăng nhập được.
- Stop/start vẫn giữ tài khoản và cấu hình.

Phần agent, Jenkinsfile, test report và pipeline sẽ thực hiện ở bước sau khi sinh viên yêu cầu.

## Tham khảo

- [Cài Jenkins bằng Docker](https://www.jenkins.io/doc/book/installing/docker/).
