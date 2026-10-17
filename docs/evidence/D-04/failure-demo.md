# D-04 — Demo chẩn đoán lỗi checkout có sẵn trong SUT

Ngày lập: **18/10/2026**, Asia/Bangkok. Người phụ trách: Vượng.

## 1. Mục tiêu và phạm vi

Minh họa một ca fail được chọn có chủ đích: test **`A-CHECKOUT-02`** phát hiện server tin tổng tiền do client gửi. Dùng status, Test Results, console và mã nguồn để xác định hành vi sai và nguyên nhân. Đây là demo **phát hiện bug có sẵn**, dùng lại build full suite đã chạy ở D-02.

## 2. Build và nguồn minh chứng

| Trường | Giá trị |
| --- | --- |
| Repository | `SUT-group10/eshop-sut-group10` |
| Nhánh | `cicd/jenkins` |
| Commit được chạy | `a559c53` |
| Job / build | `eshop-ci` → `cicd/jenkins` → **#4** |
| Ngày chạy | 16/10/2026, bắt đầu `20:04:38.633 +07:00` |
| Build URL local | [Build #4](http://localhost:8080/job/eshop-ci/job/cicd%252Fjenkins/4/) |
| Verdict | **FAILURE**; Checkout, Environment, Install, Lint và Build pass; Tests fail |
| Full suite | **39 test: 29 pass, 10 fail, 0 skip** |

Build #4 có nhiều test fail; `A-CHECKOUT-02` là ca được chọn để trình bày, không phải lỗi duy nhất làm build đỏ. Đây là dữ liệu lịch sử của commit trên, không phải kết quả chạy mới trên HEAD ngày lập tài liệu.

## 3. Ca kiểm thử được chọn

**ID:** `A-CHECKOUT-02` — `computes the total instead of trusting the client (FR-08)`.

**Yêu cầu:** Khi checkout, server phải tính tổng tiền từ sản phẩm/giỏ hàng và dữ liệu giá hợp lệ phía server; không dùng trực tiếp tổng tiền client tự khai báo.

1. Tạo harness cô lập, đăng nhập user và thêm một sản phẩm với số lượng **2** vào giỏ hàng.
2. Gọi `POST /api/checkout` bằng token hợp lệ, cố ý gửi `total_amount: 1`.
3. Kiểm tra response HTTP 200, lấy `orderId`, đọc đơn hàng từ database test.
4. Kiểm tra `order.total_amount` bằng `product.price * 2`.

Trích đoạn test:

```javascript
const product = await addProduct(2);
const response = await call('post', '/api/checkout')
  .send({ total_amount: 1, shipping_address: 'B-02 test address' });
expect(response.status).toBe(200);
const order = await harness.get('SELECT * FROM orders WHERE id = ?', [response.body.orderId]);
expect(order.total_amount).toBe(product.price * 2);
```

## 4. Kết quả thật và cách đọc lỗi

Report build #4 ghi:

```text
A-CHECKOUT-02 computes the total instead of trusting the client (FR-08)
expect(received).toBe(expected)

Expected: 60000000
Received: 1
backend/tests/api/cart-orders.test.js:58:32
```

| Nội dung | Giá trị |
| --- | --- |
| Tổng tiền client cố ý gửi sai | `1` |
| Tổng tiền đúng theo fixture, `product.price * 2` | `60000000` |
| Tổng tiền thực tế lưu trong đơn hàng test | `1` |
| Assertion thất bại | `expect(order.total_amount).toBe(product.price * 2)` |
| Vị trí tại commit được chạy | `backend/tests/api/cart-orders.test.js:58:32` |

Lỗi ở assertion đọc số tiền trong database, sau bước kiểm tra HTTP 200. Vì vậy, đây không phải lỗi đăng nhập, cài dependency hay cú pháp: request checkout được xử lý nhưng dữ liệu đơn hàng không đúng yêu cầu.

## 5. Đối chiếu nguyên nhân trong SUT

Trong [backend/server.js tại cùng commit](https://github.com/SUT-group10/eshop-sut-group10/blob/a559c53acb9a3b03cc05fca8a855bcc59c8eaae8/backend/server.js), route `POST /api/checkout` lấy tổng tiền từ request rồi truyền thẳng vào lệnh insert:

```javascript
const { total_amount, shipping_address } = req.body;

db.run(
  "INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES (?, ?, ?, ?)",
  [userId, total_amount, "pending", shipping_address],
  // callback xử lý kết quả insert
);
```

Đoạn trên trích phần liên quan, lược callback. Route này không tính lại tổng giá sản phẩm × số lượng trước khi lưu đơn. Giá trị `1` từ request trở thành giá trị `1` trong database, khớp chính xác với actual của test.

**Nguyên nhân xác định từ code và report:** server tin `req.body.total_amount` thay vì tính tổng tiền phía server. Test giữ expected theo yêu cầu nên fail là đúng.

**Hướng khắc phục về nguyên tắc:** server đọc sản phẩm/giá và số lượng giỏ hàng hợp lệ, tự tính tổng rồi lưu đơn. Tài liệu này không sửa SUT hoặc tuyên bố bug đã được khắc phục; chưa có lượt chạy xác nhận sau sửa.

## 6. Thao tác demo trên Jenkins

1. Mở `eshop-ci` → `cicd/jenkins`, chỉ hàng **#4** trong Stage View: các stage trước Tests xanh, Tests đỏ.
2. Mở build **#4** → **Test Results**, tìm `A-CHECKOUT-02` và mở chi tiết test.
3. Chỉ rõ tên test, `Expected: 60000000`, `Received: 1` và dòng assertion.
4. Mở Console Output, tìm cùng ID để đối chiếu với report và xác nhận cuối build là FAILURE.
5. Mở route checkout tại **đúng commit** trong mục 5, giải thích đường đi `req.body.total_amount` → database.

Nếu cần chạy lại để demo, dùng Build Now và ghi số build/SHA thực tế của lượt mới. Không gọi lượt mới là build #4 hoặc mặc định mọi số liệu giữ nguyên nếu code đã thay đổi.

## 7. Ảnh cần bổ sung

- **Đã có:** [Stage View build #4](../D-02/stage-build-view.png), dùng lại ảnh thật của D-02.
- **Cần sinh viên bổ sung:** ảnh chi tiết **Test Results của `A-CHECKOUT-02` trong build #4**, đọc được expected/actual và vị trí assertion. Lưu tại:

  ```text
  docs/evidence/D-04/test-result-A-CHECKOUT-02-build-4.png
  ```

Chưa đính kèm ảnh Test Results khi lập tài liệu; không dùng ảnh minh họa thay ảnh kết quả thật. Nếu ảnh thuộc build khác, phải bổ sung đúng định danh và dữ liệu của build đó.

## 8. Kết luận và giới hạn

Build #4 chạy full suite và giữ trạng thái FAILURE. Với ca được chọn, report/log cung cấp ID test, expected/actual và vị trí assertion; đối chiếu code cùng SHA xác định server lưu trực tiếp tổng tiền do client gửi. Đây là minh chứng cho khả năng phát hiện và chẩn đoán một bug có sẵn qua Jenkins.

Tài liệu không chứng minh chuyển trạng thái xanh → đỏ → xanh, không phải thí nghiệm flaky và không thay bản manual triage E-04. Nếu nhóm chọn kịch bản regression sửa code/revert trong phase plan, cần bằng chứng riêng cho kịch bản đó; file này chỉ ghi phạm vi demo bug có sẵn đã mô tả ở trên.
