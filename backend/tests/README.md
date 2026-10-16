# Bộ kiểm thử và hướng dẫn chạy EShop — B-02–B-05

## Phạm vi và lý do chọn

Bộ test gồm ba tầng, với expected result lấy từ [đặc tả nghiệp vụ](../../README.md):

- **Unit:** gọi trực tiếp middleware JWT của backend để kiểm tra chấp nhận/từ chối token và truyền danh tính. Không gọi HTTP hoặc database.
- **API:** kiểm tra route Express thật, JWT thật, SQLite thật và dữ liệu seed thật. Chọn sản phẩm/xác thực làm đầu vào; giỏ hàng, checkout và coupon để kiểm tra tiền, biên và điều kiện; đơn hàng và admin để kiểm tra quyền/trạng thái.
- **Smoke:** một luồng nhiều bước từ danh sách sản phẩm → đăng nhập → giỏ hàng → checkout → lịch sử đơn. Đây là smoke qua API, không phải kiểm thử giao diện trình duyệt/mobile.

Phạm vi này cung cấp test đại diện phục vụ seminar T07; chưa bao phủ toàn bộ FR, GUI, mobile hoặc yêu cầu bảo mật. Smoke dùng tổng tiền đúng để kiểm tra luồng cơ bản; các API test riêng kiểm tra client sửa tổng tiền và việc xóa giỏ sau checkout. Smoke pass không có nghĩa checkout đã đúng toàn bộ FR-08.

## Cài đặt và chạy

Từ thư mục gốc repo:

```powershell
cd backend
npm ci
npm test
```

Chạy riêng từng tầng:

```powershell
npm run test:unit
npm run test:api
npm run test:smoke
```

Jest chạy tuần tự bằng `--runInBand`. Không cần chạy backend hoặc reset `database.sqlite` trước khi test. Supertest tạo HTTP server tạm để gửi request qua route thật rồi đóng khi request kết thúc.

Helper `helpers/harness.js` thay constructor SQLite trong môi trường Jest để mở `:memory:`. Mỗi API/smoke test nạp một instance Express và database mới, chạy SQL tạo bảng/seed từ `database.js` thật, đợi dữ liệu sẵn sàng và đóng database sau test. Không mock phản hồi route hoặc công thức nghiệp vụ. Unit test mock module database vì middleware được kiểm tra không dùng database.

`server.js` chỉ mở port 3000 khi chạy trực tiếp; khi import, nó export `app` và `authenticateToken` cho test. Các handler nghiệp vụ không bị sửa trong B-02/B-03.

## Bảng ánh xạ test → chức năng → kết quả

Kết quả dưới đây thuộc lần kiểm chứng local ngày 13/10/2026. Test ID nằm trong tên test; xem assertion và log để tái hiện chi tiết.

| Test ID | Yêu cầu / chức năng | Expected result chính | Kết quả |
| --- | --- | --- | --- |
| U-AUTH-01 | FR-02, SEC-02: thiếu token | Từ chối, không gọi `next` | Pass |
| U-AUTH-02 | FR-02, SEC-02: token sai định dạng | Từ chối, không gọi `next` | Pass |
| U-AUTH-03 | FR-02, SEC-02: token ký bằng khóa khác | Từ chối | Pass |
| U-AUTH-04 | FR-02, SEC-02: token hết hạn | Từ chối | Pass |
| U-AUTH-05 | FR-02: token hợp lệ | Gán đúng danh tính và gọi `next` một lần | Pass |
| A-CATALOG-01 | FR-05: danh sách sản phẩm | Đủ 5 sản phẩm seed và các trường cơ bản | Pass |
| A-CATALOG-02 | FR-05: tìm theo tên | Tìm iPhone trả đúng sản phẩm | Pass |
| A-CATALOG-03 | FR-05: không có kết quả | Danh sách rỗng | Pass |
| A-AUTH-01 | FR-02/04: đăng nhập và hồ sơ | JWT dùng được, hồ sơ thuộc user hiện tại | Pass |
| A-AUTH-02 | FR-02: mật khẩu sai | Từ chối, không trả JWT | Pass |
| A-AUTH-03 | FR-02: bộ đếm đăng nhập sai | Tăng đúng 1 | Fail: tăng 2 |
| A-ACCESS-01-PROFILE | SEC-02: hồ sơ không có token | HTTP 401 | Pass |
| A-ACCESS-01-CART | SEC-02: giỏ hàng không có token | HTTP 401 | Pass |
| A-ACCESS-01-ADMIN | FR-12: admin API không có token | HTTP 401 | Pass |
| A-ACCESS-02 | FR-12: user đọc danh sách admin | Từ chối bằng lỗi 4xx | Fail: HTTP 200 |
| A-ACCESS-03 | FR-19: admin xem người dùng | Đủ người dùng, không có trường password | Pass |
| A-COUPON-01 | FR-09 C1: mã không tồn tại | Từ chối, có thông báo lỗi | Pass |
| A-COUPON-02 | FR-09 C1: mã không hoạt động | Từ chối | Pass |
| A-COUPON-03 | FR-09 C2: mã hết hạn | Từ chối | Pass |
| A-COUPON-04 | FR-09 C3: dưới ngưỡng 1 đồng | BIGBUY, tổng 499999: từ chối | Pass |
| A-COUPON-05 | FR-09 C3: đúng ngưỡng | Tổng 500000: giảm 50000, còn 450000 | Fail: HTTP 400 |
| A-COUPON-06 | FR-09: fixed trên ngưỡng | Tổng 500001: giảm 50000, còn 450001 | Pass |
| A-COUPON-07 | FR-09 C4: chưa đăng nhập | Từ chối dù body có user_id | Fail: HTTP 200 |
| A-COUPON-08 | FR-09 C5: hết lượt sử dụng | Từ chối khi đã dùng BIGBUY một lần | Pass |
| A-COUPON-09 | FR-09: công thức percent | SAVE10, tổng 500000: giảm 50000, còn 450000 | Fail: giảm -4500000, còn 5000000 |
| A-CART-01 | FR-07: giỏ ban đầu | Rỗng | Pass |
| A-CART-02 | FR-07: thêm sản phẩm | Một dòng, số lượng 2 | Pass |
| A-CART-03 | FR-07: thêm trùng sản phẩm | Một dòng, tổng số lượng 3 | Fail: hai dòng |
| A-CHECKOUT-01 | FR-08: checkout chưa đăng nhập | Từ chối, không tạo đơn | Pass |
| A-CHECKOUT-02 | FR-08: client sửa tổng tiền | Hai sản phẩm giá 30000000: tổng 60000000 | Fail: lưu tổng do client gửi là 1 |
| A-CHECKOUT-03 | FR-08: checkout thành công | Giỏ hàng rỗng sau checkout | Fail: vẫn giữ sản phẩm |
| A-ORDER-01 | FR-11: lịch sử đơn cá nhân | Chỉ trả đơn của user hiện tại | Pass |
| A-ORDER-02 | FR-10: hủy đơn pending | Chuyển sang canceled | Pass |
| A-ORDER-03 | FR-10: user hủy đơn shipping | Từ chối, giữ trạng thái shipping | Fail: HTTP 200 |
| A-ORDER-04 | FR-10: canceled là trạng thái cuối | Admin không chuyển sang delivered | Fail: HTTP 200 |
| S-PURCHASE-01 | FR-02/05/07/08/11: smoke mua hàng | Các bước HTTP thành công, đơn đúng user/tổng/trạng thái | Pass |

Các assertion HTTP 4xx cho trường hợp bị từ chối không ép một mã lỗi cụ thể khi đặc tả chưa quy định. Biên coupon là ngưỡng −1, ngưỡng và ngưỡng +1. Giá/số lượng lấy từ dữ liệu seed của lần test; không dùng đáp án do implementation tính để xác định expected tổng tiền hoặc giảm giá.

## Kết quả và cách đọc lỗi

Tổng: **36 test, 26 pass, 10 fail**. Unit: 5/5 pass; API: 20/30 pass; smoke: 1/1 pass. Không có test skip hoặc snapshot.

Mười fail là các assertion nghiệp vụ không thỏa trên SUT hiện tại. Không dùng `test.failing`, skip, đổi expected hoặc sửa nghiệp vụ để che kết quả. `npm test` và `test:api` trả exit code 1 khi còn các lỗi này; pipeline cần hiển thị trạng thái đỏ cùng report/log thay vì tuyên bố pass. Cách xử lý lỗi SUT đã biết ở quality gate cần được nhóm thống nhất khi triển khai CI.

Bằng chứng: [log chạy B-02](../../docs/evidence/B-02/test-run.log). Log có tên test, expected/actual và kết quả runner. Mã được kiểm chứng gồm thay đổi B-02 trên nền commit B-01 `77e1870`; thay đổi B-02 chưa commit tại thời điểm chạy.

Reviewer theo checklist: Dương. AI hỗ trợ thiết kế test, triển khai harness và đọc kết quả. Không ghi nhận peer review hoặc phân tích thủ công độc lập chưa diễn ra.

## B-03: fixture, setup, cleanup và tính độc lập

Mỗi test cần dữ liệu sử dụng `beforeEach` để tạo harness mới và `afterEach` để đóng nó. `createHarness()` đợi seed sẵn sàng và kiểm tra số lượng cả sáu bảng trước khi trả về; SQL/HTTP fixture chỉ được gọi sau bước này. `close()` gọi nhiều lần vẫn dùng cùng kết quả cleanup. Nếu lỗi trong setup, helper đóng kết nối đã mở và khôi phục mock constructor SQLite. Mock chỉ đổi nơi lưu SQLite sang bộ nhớ; SQL tạo bảng/seed, route, JWT và công thức SUT vẫn chạy thật.

Các fixture dùng chung nằm trong `tests/helpers/harness.js`:

| Helper | Cách sử dụng | Tác dụng |
| --- | --- | --- |
| `createHarness()` | `const h = await createHarness()` | App và database mới, seed sạch |
| `h.login(role)` | `await h.login('user')` hoặc `'admin'` | Đăng nhập bằng tài khoản seed, trả id/token |
| `h.product()` | `await h.product()` | Tìm sản phẩm fixture theo tên, không dựa vào ID hardcode |
| `h.order(userId, status)` | `await h.order(user.id, 'shipping')` | Tạo đơn có trạng thái phục vụ test |
| `h.exhaustCoupon(code, userId)` | `await h.exhaustCoupon('BIGBUY', user.id)` | Ghi đủ số lượt dùng theo giới hạn của coupon |
| `h.get(sql, params)` / `h.run(sql, params)` | Query có tham số | Chuẩn bị/kiểm tra trạng thái database của test |
| `h.close()` | `await h.close()` trong teardown | Đóng database; không xóa database gốc |

Không reset một instance đang dùng: test tiếp theo nhận instance mới, có giỏ hàng và database mới. Việc tạo fixture bằng SQL nhằm đưa SUT tới trạng thái đầu vào cần kiểm tra, không thay thế assertion cho chức năng đang được test. Không dùng `test.concurrent` với helper module isolation này.

Chạy từ thư mục `backend`:

```powershell
npm run test:harness
npm run test:isolation
```

`test:harness` chạy ba test H-ISOLATION-01/02/03: cô lập thay đổi database và coupon; cô lập giỏ hàng; cleanup nhiều lần. Các test này phải pass.

`test:isolation` chạy toàn bộ bộ test ba lần, xáo thứ tự test trong mỗi file bằng seed 101/202/303. Script so sánh trạng thái **từng tên test**, kiểm tra đúng mười lỗi SUT đã biết, không có test skip/handle mở và hash database gốc không đổi. Report JSON trung gian nằm trong thư mục tạm duy nhất và được dọn sau khi chạy. Để tái hiện một thứ tự cụ thể:

```powershell
npm test -- --randomize --seed=202 --showSeed --detectOpenHandles
```

Kết quả B-03: mỗi lần **39 test, 29 pass, 10 fail**, trong đó ba test harness mới pass. Các lỗi SUT giữ nguyên từ B-02. `test:isolation` exit 0 chỉ xác nhận tính ổn định và cô lập theo phép kiểm tra này; nó không làm `npm test` pass, không thay quality gate và không chứng minh độc lập với mọi thứ tự có thể có. Khi bổ sung test hoặc sửa bug SUT, cập nhật số lượng/danh sách lỗi baseline trong `scripts/verify-isolation.cjs` dựa trên kết quả được xác minh.

Bằng chứng: [log B-03](../../docs/evidence/B-03/isolation.log). Thay đổi được chạy trên nền commit B-02 `ec6d7bf`, chưa commit tại thời điểm kiểm chứng. Các bước trên cho phép thành viên tự chạy lại trên máy của mình mà không cần database hoặc server của người viết test.

## B-04: lint, build, test và coverage XML

Chạy trong `backend` sau khi clone và cài Node/npm phù hợp với [hướng dẫn môi trường](../../setup_guide.md):

```powershell
npm ci
npm run lint
npm run build
npm test
npm run test:coverage
```

Các lệnh có trách nhiệm riêng:

| Lệnh | Kiểm tra / đầu ra | Khi thất bại |
| --- | --- | --- |
| `lint` | ESLint recommended cho ứng dụng, scripts, cấu hình và tests; khai báo môi trường Node/Jest rõ ràng | Exit code khác 0 nếu có lỗi hoặc warning |
| `build` | `node --check` cho mọi file `.js`/`.cjs` ngoài thư mục dependency/report | Exit code 1 nếu có lỗi cú pháp |
| `test` | Toàn bộ unit/API/smoke/harness test | Exit code 1 khi assertion fail |
| `test:coverage` | Toàn bộ test và report coverage | Giữ exit code fail, vẫn sinh coverage |
| `test:ci` | Jest `--ci`, toàn bộ test và report coverage | Giữ exit code fail, không dùng forceExit/skip |

Backend là CommonJS chạy trực tiếp, không có bước transpile/bundle. Vì vậy, `build` là kiểm tra cú pháp thật bằng parser Node, không sinh `dist`, không cài dependency và không chạy ứng dụng/database. Nó không chứng minh chương trình đúng nghiệp vụ hoặc không có lỗi runtime. Web/admin vẫn có build Vite và lint riêng; B-04 này chuẩn hóa backend theo phạm vi seminar T07.

Coverage đo `server.js` và `database.js`, bao gồm cả code chưa được test gọi. Không tính helper/test vào tỷ lệ của SUT và không đặt ngưỡng tùy ý khi đề chưa quy định. Report gồm:

- `coverage/cobertura-coverage.xml`: Cobertura XML để hệ thống CI đọc/upload.
- `coverage/coverage-summary.json`: số liệu máy đọc được cho badge/tổng hợp.
- Bảng summary trong terminal/log.

`npm run test:ci` còn dùng reporter `jest-junit` để sinh `test-results/junit.xml`, bên cạnh reporter terminal và coverage. File này cho phép Jenkins hiển thị từng test, số pass/fail và lỗi assertion trên giao diện Test Results; nó không thay đổi phạm vi test hoặc exit code. Xem [hướng dẫn báo cáo Jenkins](../../docs/jenkins/reports.md).

Các file trong `coverage/` là output tự sinh, được Git ignore. Muốn tái lập trên clone sạch hoặc thu artefact CI, dùng:

```powershell
cd backend
npm ci
npm run lint
npm run build
npm run test:ci
```

Chạy từng lệnh hoặc dùng các bước CI riêng để lưu được kết quả từng bước. Test lỗi vẫn phải giữ exit code lỗi; bước upload report của CI cần chạy cả khi test fail. Không thay `test:ci` bằng `test:isolation`: isolation pass chỉ xác nhận tính ổn định, không xác nhận các yêu cầu nghiệp vụ pass.

Bằng chứng B-04: [log clone sạch](../../docs/evidence/B-04/clean-clone.log), [coverage XML của lần chạy](../../docs/evidence/B-04/cobertura-coverage.xml). B-04 đã hoàn thành việc chuẩn hóa lệnh, kiểm chứng trên clone sạch và tạo coverage XML. Bộ test ghi nhận mười lỗi SUT đã mô tả trong B-02.

Kiểm chứng trên clone local sạch của commit triển khai `a7f0923`, không có sẵn dependency/report. `npm ci`, lint và build exit 0; `npm test` và `test:ci` exit 1 với đúng 39 test, 29 pass, 10 fail. `test:isolation` exit 0, không có handle mở. Line coverage 61,48%; statement 57,98%; function 39,72%; branch 39,09%. Coverage là mức độ thực thi code, không phải tỷ lệ yêu cầu nghiệp vụ đã đúng.

Một file sai cú pháp được tạo riêng trong clone để xác nhận lint/build thực sự từ chối nguồn lỗi; cả hai trả exit 1, sau đó file được xóa. Clone giữ working tree sạch. Snapshot XML trong thư mục bằng chứng chỉ chuẩn hóa đường dẫn nguồn thành `backend`, giữ nguyên counters; report sinh trực tiếp của lần chạy nằm trong `coverage/` của clone. Chưa có lần chạy trên GitHub Actions/Jenkins trong phạm vi B-04.

## B-05: sơ đồ harness

![Sơ đồ test harness EShop](../../docs/architecture/assets/test-harness-overview.png)

[Luồng chi tiết, quality gate và trường hợp biên](../../docs/architecture/test-harness.md) · [SVG dùng cho slide](../../docs/architecture/assets/test-harness-overview.svg).

Sơ đồ phân biệt đường unit không dùng database với đường API/smoke/harness dùng fixture riêng; log và coverage với verdict test; diagnostic isolation với quality gate. Phần upload artefact/status check/branch protection được ghi rõ là CI tiếp theo, không phải thành phần đã cấu hình.
