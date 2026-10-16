# Xem stage, kết quả test và coverage trên Jenkins

## Mở đúng trang

Từ Jenkins, chọn `eshop-ci` rồi chọn nhánh `cicd/jenkins`.

- **Stages** ở menu trang nhánh: xem tổng quan các stage bằng plugin Pipeline Graph View đã cài.
- Chọn một build, ví dụ **#2**, rồi mở **Pipeline Overview**: xem sơ đồ và log của từng stage. Tên mục có thể khác giữa các phiên bản plugin.
- Nếu muốn bảng có cột Checkout/Environment/Install/Lint/Build/Tests và mỗi hàng là một build, cài thêm **Pipeline: Stage View** (`pipeline-stage-view`) trong Manage Jenkins → Plugins. Plugin này không thay đổi kết quả pipeline.

Trang Status của nhánh và Console Output không tự hiển thị toàn bộ bảng/sơ đồ. Trong ảnh trang nhánh có menu Stages, bấm vào mục đó trước.

## Báo cáo dễ đọc cho các build mới

`npm run test:ci` chạy nguyên bộ test Jest, giữ reporter terminal và thêm Jest-JUnit. Reporter sinh `backend/test-results/junit.xml`; Jest tiếp tục sinh JSON kết quả và coverage như trước. Chạy `npm ci` sau khi cập nhật dependency.

Trong Jenkinsfile, `post { always }` của stage Tests gọi:

- `junit`: gắn báo cáo vào build để có **Test Results**, số pass/fail/skip, tên từng test và chi tiết assertion thất bại.
- `recordCoverage`: đọc Cobertura để có **Coverage**, tỷ lệ line/branch và phần mã nguồn được hoặc chưa được chạy.

Coverage được bật cho cả build FAILURE (`enabledForFailure: true`). Bộ test SUT có lỗi vẫn trả exit code 1 và làm Tests/build FAILURE; publish báo cáo không biến build thành xanh. Không đặt quality gate coverage mới. Các publisher chỉ gắn kết quả vào Jenkins, không gửi JUnit/coverage checks lên GitHub.

Các build chạy Jenkinsfile cũ chỉ có file artifact. **Sau khi commit/push thay đổi reporter, lockfile và Jenkinsfile rồi chạy build mới**, mở build mới đó để xem Test Results/Coverage. Việc cài plugin đơn thuần không tạo báo cáo cho các build đã chạy.

## Khi thiếu báo cáo

- Lỗi ở Install/Lint/Build: Tests chưa chạy nên không có báo cáo test/coverage của lượt này; xem stage lỗi.
- Tests đã bắt đầu nhưng không sinh XML: publisher báo lỗi thay vì im lặng coi là không có test.
- JUnit publish lỗi: khối `finally` vẫn thử publish coverage. `post always` toàn pipeline vẫn lưu raw artifact để chẩn đoán.
- Vẫn có kết quả JSON/XML nhưng không có menu báo cáo: xem log Post Actions để tìm lỗi publisher hoặc plugin chưa được nạp.
- Cảnh báo GitHub commit status 403 là quyền token gửi trạng thái commit; không phải lỗi đọc JUnit/Cobertura trên Jenkins.

## Tham khảo

- [Pipeline Graph View](https://plugins.jenkins.io/pipeline-graph-view/).
- [Pipeline Stage View](https://plugins.jenkins.io/pipeline-stage-view/).
- [JUnit publisher](https://www.jenkins.io/doc/pipeline/steps/junit/).
- [Coverage publisher](https://www.jenkins.io/doc/pipeline/steps/coverage/).
- [Jest-JUnit reporter](https://github.com/jest-community/jest-junit).
