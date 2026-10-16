# Hướng dẫn cài đặt, khởi chạy và kiểm kê kỹ thuật EShop

Tài liệu đáp ứng task B-01: kiểm kê cách cài đặt, build, chạy hệ thống, cơ sở dữ liệu, test hiện có và kết quả chạy local từ bản sao sạch. Yêu cầu nghiệp vụ nằm trong [README.md](README.md); giao diện API nằm trong [api_specification.md](api_specification.md).

## 1. Thành phần và môi trường

| Thành phần | Công nghệ | Thư mục | Địa chỉ mặc định |
| --- | --- | --- | --- |
| Backend API | Express, CommonJS, SQLite, JWT | `backend` | `http://localhost:3000` |
| Web khách hàng | React, Vite, Tailwind CSS | `frontend-web` | `http://localhost:5173` |
| Web quản trị | React, Vite, Tailwind CSS | `frontend-admin` | `http://localhost:5174` |
| Mobile | React Native, Expo | `frontend-mobile` | Metro và thiết bị/emulator |

Mỗi thư mục có `package.json` và `package-lock.json` riêng. Chạy `npm ci` trong từng thư mục để cài dependency theo lockfile.

Môi trường đã kiểm chứng: **Windows, PowerShell, Node.js 24.14.0, npm 11.21.0**. Các phiên bản Node.js và hệ điều hành khác chưa được kiểm chứng trong B-01.

Yêu cầu Node.js ≥18 trong hướng dẫn ban đầu không còn đủ cho dependency hiện tại:

| Dependency đã cài theo lockfile | Yêu cầu Node.js trong package |
| --- | --- |
| Vite 8.0.12 | `^20.19.0 || >=22.12.0` |
| ESLint 10.3.0 | `^20.19.0 || ^22.13.0 || >=24` |
| React Native 0.81.5 | `>=20.19.4` |

Kiểm tra môi trường trước khi cài:

```powershell
node --version
npm --version
```

Các lệnh dưới đây giả định mỗi terminal mới bắt đầu tại thư mục gốc của repository. Chạy các phân hệ ở terminal riêng; dùng `Ctrl+C` để dừng tiến trình trong terminal tương ứng.

## 2. Cài đặt và chạy Backend API

```powershell
cd backend
npm ci
node -e "require('sqlite3')"
node server.js
```

Lệnh kiểm tra `sqlite3` xác nhận native binding có thể nạp được. Nếu không có binary phù hợp, quá trình cài đặt có thể cần công cụ build native.

Server chạy tại `http://localhost:3000`. Port 3000 đang được khai báo trực tiếp trong `server.js`, chưa có cấu hình port qua biến môi trường.

### 2.1. Khởi tạo và vòng đời dữ liệu

`server.js` nạp `database.js`; module này gọi `initDatabase()` ngay khi được nạp. **Mỗi lần khởi động backend đều xóa, tạo lại sáu bảng và nạp dữ liệu mẫu.** Dữ liệu thay đổi trong phiên chạy trước sẽ không được giữ nguyên qua lần khởi động tiếp theo.

- File dữ liệu: `backend/database.sqlite`, xác định theo vị trí của `database.js`.
- Sáu bảng: `users`, `products`, `categories`, `orders`, `coupons`, `coupon_usage`.
- Dữ liệu mẫu: 2 người dùng, 5 sản phẩm, 3 danh mục, 4 coupon; chưa có đơn hàng hoặc lượt sử dụng coupon.
- Coupon mẫu: `SAVE10`, `BIGBUY`, `VIP100`, `EXPIRED`.
- Giỏ hàng nằm trong biến `userCarts` ở bộ nhớ server; khởi động lại sẽ mất giỏ hàng.
- Bộ test dùng SQLite trong bộ nhớ và seed thật qua helper Jest, tách biệt file dữ liệu của ứng dụng. B-03 bổ sung fixture dùng chung, setup/cleanup và kiểm chứng tính độc lập; xem hướng dẫn trong `backend/tests/README.md`.

Không cần chạy `node database.js` trước `node server.js`. Lệnh này cũng reset dữ liệu, trong khi server đã thực hiện cùng việc khi khởi động. Module không đóng kết nối SQLite, nên lệnh seed riêng có thể tiếp tục chạy thay vì tự kết thúc.

Khi kiểm chứng cài đặt, dùng bản sao tách biệt để tránh reset database trong thư mục làm việc chính.

### 2.2. Tài khoản mẫu

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Admin | `admin@eshop.com` | `Admin123!` |
| User | `test@eshop.com` | `Test1234!` |

Hai tài khoản này khớp mã seed và đã đăng nhập thành công trong B-01. Mật khẩu `admin123` trong hướng dẫn ban đầu là sai. Không đưa JWT hoặc nội dung hồ sơ chứa thông tin xác thực vào log chia sẻ.

## 3. Cài đặt và chạy Web

### 3.1. Web khách hàng

```powershell
cd frontend-web
npm ci
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Truy cập `http://localhost:5173`. Tham số `--strictPort` giúp lệnh báo lỗi nếu port đã bị chiếm, thay vì tự chuyển sang port khác.

### 3.2. Web quản trị

```powershell
cd frontend-admin
npm ci
npm run dev -- --host 127.0.0.1
```

Truy cập `http://localhost:5174`. Cấu hình Vite của admin đã đặt port 5174 và bật `strictPort`.

Cả hai ứng dụng đang dùng URL API `http://localhost:3000/api` khai báo trực tiếp trong mã nguồn. Backend phải chạy để các chức năng gọi API hoạt động.

### 3.3. Build, lint và xem bản build

Chạy trong thư mục web tương ứng:

```powershell
npm run build
npm run lint
npm run preview
```

- `build`: tạo bản production trong `dist/`.
- `lint`: kiểm tra mã nguồn theo cấu hình ESLint hiện có; hiện vẫn có lỗi, xem mục 6.
- `preview`: phục vụ bản build đã tạo; cần chạy build trước. Lệnh này không khởi động backend.

## 4. Cài đặt và chạy Mobile

```powershell
cd frontend-mobile
npm ci
npx expo config --type public
npm start
```

`App.js` đang khai báo `API_URL` là `http://192.168.10.13:3000/api`. Khi dùng điện thoại thật, đổi địa chỉ này thành IP LAN có thể truy cập của máy chạy backend. Điện thoại và máy chủ cần kết nối mạng phù hợp, port 3000 phải truy cập được. Không dùng `localhost` của điện thoại để gọi backend trên máy tính.

Dùng Expo Go phù hợp với SDK của dự án hoặc emulator đã cấu hình. Mở ứng dụng từ QR/link do Expo cung cấp. Các script khác gồm `npm run android`, `npm run ios`, `npm run web`; chưa kiểm chứng các mục tiêu này trong B-01. Chạy iOS Simulator cần môi trường macOS phù hợp; Windows không cung cấp iOS Simulator.

Package hiện chưa khai báo `react-dom`, `react-native-web` hoặc `@expo/metro-runtime` cho mục tiêu web của mobile; không coi `npm run web` là đã chạy được chỉ vì có script.

Lệnh đã dùng để kiểm tra riêng Metro trên máy local:

```powershell
$env:CI = '1'
npx expo start --localhost --port 8081
```

Metro đã khởi động và `/status` trả HTTP 200. Đây là kiểm tra server phát triển, chưa xác nhận bundle, giao diện hoặc chức năng trên thiết bị. Khi muốn chạy lại ở chế độ tương tác trong cùng terminal, xóa biến bằng `Remove-Item Env:CI` rồi chạy `npm start`.

Expo cảnh báo phiên bản cài đặt `expo@54.0.34`, phiên bản mong đợi `~54.0.37`. B-01 ghi nhận cảnh báo, chưa thay đổi dependency.

## 5. Kiểm kê lệnh và test hiện có

| Thành phần | Lint | Build | Test tự động |
| --- | --- | --- | --- |
| Backend | `npm run lint` | `npm run build`: kiểm tra cú pháp JavaScript | Jest: `npm test`, các lệnh theo tầng và coverage |
| Web khách hàng | `npm run lint` | `npm run build` | Chưa cấu hình script/framework test |
| Web quản trị | `npm run lint` | `npm run build` | Chưa cấu hình script/framework test |
| Mobile | Chưa có script | Chưa có script build | Chưa cấu hình script/framework test |

Backend có thể kiểm tra cú pháp bằng:

```powershell
node --check server.js
node --check database.js
```

Đây là kiểm tra cú pháp, không thay thế bộ test nghiệp vụ.

`backend/test_profile.js` là script gọi thử API: tạo JWT, in phản hồi, không có assertion và không được nối vào `npm test`. Trên bản cài sạch, script lỗi `Cannot find module 'axios'` vì backend chưa khai báo dependency này. Script không được tính là bộ test tự động; không công khai JWT mà nó in ra.

B-01 ghi nhận chưa có bộ test tự động. B-02 bổ sung Jest và unit/API/smoke test đại diện; B-03 bổ sung fixture, setup/cleanup và lệnh kiểm tra tính độc lập. B-04 bổ sung ESLint, kiểm tra cú pháp toàn bộ nguồn backend và coverage XML. Xem [hướng dẫn, bảng ánh xạ và quy trình B-04](backend/tests/README.md).

Chạy bộ test từ thư mục `backend`, không cần khởi động server:

```powershell
npm ci
npm run lint
npm run build
npm test
npm run test:unit
npm run test:api
npm run test:smoke
npm run test:coverage
```

Backend chạy JavaScript trực tiếp nên `build` không tạo bundle hoặc thư mục `dist`; nó dùng parser Node.js kiểm tra các file `.js`/`.cjs` trong backend, gồm nguồn ứng dụng, script, cấu hình và test. Lệnh này không mở server hoặc database.

`test:coverage` tạo `backend/coverage/cobertura-coverage.xml` và `coverage-summary.json`. `test:ci` chạy toàn bộ test với coverage ở chế độ Jest CI. Report được sinh cả khi assertion nghiệp vụ fail; exit code của test vẫn là 1 khi có lỗi.

Các lệnh test trả mã lỗi khi assertion không đạt. Những lỗi nghiệp vụ phát hiện trong B-02 được giữ nguyên trong kết quả kiểm thử.

Xem [sơ đồ harness và các nhánh lỗi](docs/architecture/test-harness.md) để hiểu cách nguồn test, fixture, runner, log/coverage và quality gate kết nối với nhau.

`run_servers.sh` dùng đường dẫn tuyệt đối trên máy macOS của tác giả và `killall node`. Script chưa dùng được nguyên bản trên Windows và có thể dừng tiến trình Node không thuộc dự án. Dùng các terminal và lệnh riêng trong hướng dẫn này.

## 6. Kết quả kiểm chứng B-01

Kiểm chứng ngày **13/10/2026, múi giờ Asia/Bangkok**, trên bản sao lấy từ commit `39742cc6acb1ec15a18ebb68e76d905b5fa3e727` bằng `git archive`, giải nén ngoài repository làm việc. Bản sao chưa có `node_modules`; runtime, npm cache và mạng của máy hiện tại vẫn được sử dụng. Đây không phải máy mới hoàn toàn hoặc lần chạy CI.

| Kiểm tra | Kết quả thực tế |
| --- | --- |
| `npm ci --no-audit --no-fund` tại cả 4 phân hệ | Exit code 0 ở từng phân hệ |
| Nạp native binding SQLite ở backend | Thành công, exit code 0 |
| Kiểm tra cú pháp hai file backend | Exit code 0 cho cả hai |
| Backend `npm test` | Exit code 1: `Error: no test specified` |
| `node test_profile.js` | Exit code 1: thiếu `axios` |
| Build web khách hàng | Exit code 0 |
| Lint web khách hàng | Exit code 1: 23 lỗi, 1 cảnh báo |
| Build web quản trị | Exit code 0 |
| Lint web quản trị | Exit code 1: 4 lỗi |
| GET sản phẩm và danh mục | HTTP 200; 5 sản phẩm, 3 danh mục |
| Đăng nhập admin và user | HTTP 200; có JWT, đúng vai trò |
| Đọc hồ sơ có xác thực của hai tài khoản | HTTP 200 |
| Server web khách hàng và admin | HTTP 200 tại `/` |
| Đọc cấu hình Expo | Exit code 0 |
| Metro | Khởi động được; `/status` HTTP 200 |

Lỗi lint gồm biến không sử dụng và vi phạm quy tắc React Hooks. Lỗi được giữ nguyên để ghi nhận hiện trạng. Quá trình cài có cảnh báo dependency; chưa chạy dependency audit.

Bằng chứng: [log kiểm chứng local B-01](docs/evidence/B-01/local-verification.log). Database và lockfile của repository gốc không bị thay đổi; các server do lần kiểm chứng khởi chạy đã được dừng.

Phạm vi B-01 gồm kiểm kê kỹ thuật và chạy local; thao tác giao diện trong trình duyệt, mobile trên thiết bị/emulator, độ phủ nghiệp vụ và CI nằm ngoài lần kiểm chứng này.

AI hỗ trợ kiểm kê, chuẩn bị lệnh kiểm chứng và biên soạn tài liệu. Kết quả trong bảng lấy từ lần chạy local thực tế; không ghi nhận review hoặc đóng góp thủ công độc lập chưa diễn ra.
