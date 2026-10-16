# D-02 — Baseline Jenkins full suite

Ngày tổng hợp: **16/10/2026**, múi giờ Asia/Bangkok (UTC+07:00). Dữ liệu lấy từ **một lượt chạy đã hoàn tất: build #4**. Không ghép số liệu từ các build khác.

## 1. Nguồn và môi trường

| Trường | Giá trị được kiểm chứng |
| --- | --- |
| Repository | `https://github.com/SUT-group10/eshop-sut-group10.git` |
| Commit SHA | `a559c53acb9a3b03cc05fca8a855bcc59c8eaae8` |
| Nhánh | `cicd/jenkins` |
| Job | `eshop-ci`, job con `cicd/jenkins` |
| Build | **#4**, kết quả **FAILURE** |
| URL trên máy chạy Jenkins | [Build #4](http://localhost:8080/job/eshop-ci/job/cicd%252Fjenkins/4/) |
| Bắt đầu, UTC | `2026-10-16T13:04:38.633Z` |
| Bắt đầu, UTC+07:00 | `2026-10-16 20:04:38.633 +07:00` |
| Kết thúc tính từ timestamp + duration | `2026-10-16 20:04:56.233 +07:00` |
| Thời gian build theo Jenkins | **17,600 giây** (`duration = 17600 ms`), không phải thời gian Jest hay thời gian chờ queue |
| Thời gian Jest trong console | **1,960 giây** |
| Agent | `eshop-agent`, label `eshop-node` |
| OS thực thi test | Debian GNU/Linux 13 (trixie), container Linux |
| Kernel được ghi trong build | `Linux 6.6.87.2-microsoft-standard-WSL2 x86_64` |
| Node / npm / Git | `v24.14.0` / `11.9.0` / `2.47.3` |
| npm cache | `/home/jenkins/.npm`; có volume dùng lại, **chưa đo/xác nhận hit hoặc miss** trong bằng chứng này |

URL localhost chỉ truy cập được từ máy Jenkins. Có thể mở Jenkins bằng URL ngrok hiện tại rồi đi tới cùng job/build; URL ngrok không được dùng làm định danh bền vững của lần đo. Nhận diện build bằng job, số build, SHA và các file đã xuất.

## 2. Stage và verdict

| Stage | Lệnh / hành vi | Kết quả theo console |
| --- | --- | --- |
| Checkout | Workspace sạch, `checkout scm` | PASS; đúng SHA nêu trên |
| Environment | Ghi commit, nhánh, OS, runtime; kiểm tra Node | PASS |
| Install | Trong `backend`: `npm ci --no-audit --no-fund` | PASS |
| Lint | `npm run lint` | PASS |
| Build | `npm run build` — kiểm tra cú pháp Node, không tạo bundle | PASS |
| Tests | `npm run test:ci -- --json --outputFile="test-results/results.json"` | FAIL; chạy đủ 39 test, exit code 1 |
| Post của Tests / pipeline | Publish JUnit, đọc Cobertura, lưu artifact | Thành công; console có thông báo thêm Coverage action và archive artifact |

`test:ci` ở commit này là `jest --ci --runInBand --coverage --reporters=default --reporters=jest-junit`. Phạm vi: 5 unit, 30 API, 1 smoke và 3 harness test, tổng 39 test trong 6 file/suite. Kết quả: **29 pass, 10 fail, 0 skip**; **3 suite pass, 3 suite fail**. Đây là verdict test thật, không phải báo lỗi do pipeline không khởi chạy.

Console kết thúc bằng `ERROR: script returned exit code 1` và `Finished: FAILURE`. Các publisher không đổi kết quả này thành xanh. Console cũng ghi `GitHub has been notified of this commit’s build result`; không còn cảnh báo 403 gửi commit status trong lượt #4.

## 3. Danh sách test fail

Các ID dưới đây được lấy từ các assertion có `status = failed` trong [Jest JSON](build-4/results.json), không chỉ suy ra từ tổng số fail.

| ID | Assertion không được SUT đáp ứng |
| --- | --- |
| `A-AUTH-03` | Mỗi lần login sai chỉ tăng bộ đếm đúng một đơn vị |
| `A-ACCESS-02` | User thường không được đọc danh sách admin users |
| `A-CART-03` | Thêm lại cùng sản phẩm phải gộp thành một dòng giỏ hàng |
| `A-CHECKOUT-02` | Server tính tổng tiền, không tin tổng do client gửi |
| `A-CHECKOUT-03` | Checkout thành công phải xóa giỏ hàng |
| `A-ORDER-03` | User không được hủy đơn đang giao |
| `A-ORDER-04` | Đơn đã hủy là trạng thái cuối, kể cả với admin |
| `A-COUPON-05` | Chấp nhận đơn đúng bằng mức tối thiểu và tính giảm cố định |
| `A-COUPON-07` | Từ chối yêu cầu coupon anonymous dù gửi `user_id` |
| `A-COUPON-09` | Tính đúng giảm giá 10% trên tổng tiền |

## 4. Coverage và đối chiếu B-04

B-04 được lưu trong [clean-clone.log](../B-04/clean-clone.log), commit `a7f0923a168b5228920c27be04452c2dfcfe4de7`, ngày 13/10/2026. Đối chiếu Git giữa commit B-04 và commit build #4 xác nhận **`server.js`, `database.js`, các file test/fixture/helper và `jest.config.cjs` không đổi**; thay đổi backend liên quan là package/lockfile để thêm reporter.

| Nội dung | B-04 | Jenkins build #4 | Nhận xét |
| --- | --- | --- | --- |
| Môi trường | Windows / PowerShell | Debian Linux agent trong Docker | Khác OS và cách cấp phát workspace |
| Node | `v24.14.0` | `v24.14.0` | Giống |
| npm | `11.21.0` | `11.9.0` | Khác; chưa thể gọi hai môi trường hoàn toàn đồng nhất |
| Code SUT, test và fixture | Bộ backend đã chuẩn hóa | Không đổi các file mã nguồn nêu trên | Cùng assertion, không bỏ mười test fail |
| Kết quả | 39 test, 29 pass, 10 fail | 39 test, 29 pass, 10 fail | Tập ID fail trùng nhau; 0 skip |
| Lệnh CI dùng để thu kết quả | `test:ci` kèm `--detectOpenHandles --json --outputFile=...` | `test:ci` kèm JSON/outputFile, thêm JUnit reporter; không có `--detectOpenHandles` | Khác reporter và tùy chọn chẩn đoán |
| Thời gian Jest của lượt `test:ci` | `2.443 s` | `1.960 s` | Không suy ra nền tảng nào nhanh hơn từ hai lượt khác điều kiện |
| Line coverage theo Jest | 61,48% — 174/283 | 61,48% — 174/283 | Giống |
| Statement coverage theo Jest | 57,98% — 178/307 | 57,98% — 178/307 | Giống |
| Function coverage theo Jest | 39,72% — 29/73 | 39,72% — 29/73 | Giống |
| Branch coverage theo Jest | 39,09% — 52/133 | 39,09% — 52/133 | Giống khi dùng cùng nguồn số liệu |
| Báo cáo | Console và coverage XML | Console, JSON, JUnit XML, Cobertura và publisher Jenkins | Thêm giao diện báo cáo thuộc phần D-03 |

**Lưu ý nguồn coverage:** [coverage-summary.json](build-4/coverage-summary.json) của Jest ghi branch **39,09% (52/133)**; log Coverage plugin trong cùng build ghi branch **41,74% (48/115)** khi đọc Cobertura. Line coverage của cả hai đều là **61,48% (174/283)**. Ghi riêng hai nguồn; chưa kết luận nguyên nhân parser cho mẫu số khác nhau, không dùng lẫn hai số branch trong bảng so sánh D-05.

## 5. Các file minh chứng đã lưu

- [Console đầy đủ build #4](console-build-4.txt): trích xuất trực tiếp từ file console của build trong volume Jenkins bằng Docker; chỉ bỏ ConsoleNote nhị phân/ANSI để có bản text dễ đọc, không cắt stage hoặc sửa kết quả. Không phải log của một lần chạy local và không tuyên bố đã bấm Download trên trình duyệt.
- [Environment gốc](build-4/environment.log).
- [Jest JSON gốc](build-4/results.json), [JUnit XML gốc](build-4/junit.xml).
- [Coverage JSON gốc](build-4/coverage-summary.json), [Cobertura XML gốc](build-4/cobertura-coverage.xml).
- [Metadata chọn lọc](build-4/metadata.json), chỉ gồm định danh build, thời gian và số liệu kiểm chứng; không lưu credential hoặc toàn bộ cấu hình Jenkins.
- [SHA-256 các file đã xuất](sha256sums.txt).

Các artifact XML/JSON được copy nguyên file từ archive của cùng build #4; không chuẩn hóa lại đường dẫn nguồn. Đường dẫn Linux trong report là đường dẫn của agent tại thời điểm chạy.
