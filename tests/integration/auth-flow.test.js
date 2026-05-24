/**
 * Automated Integration Test Script - Member 1 Auth Flow
 * ======================================================
 * This script automates testing all Member 1 APIs via the API Gateway (Port 3000).
 * It will:
 * 1. Healthcheck gateway and user-service
 * 2. Log in as the default seeded Admin user to fetch Admin JWT
 * 3. Register a new Customer account dynamically
 * 4. Log in as the newly created Customer to fetch Customer JWT
 * 5. Call Authenticated Profile API using Customer JWT
 * 6. Call Authenticated Update Profile API using Customer JWT
 * 7. Call Admin-Only All Users list API using Admin JWT
 */

const axios = require('axios');

const GATEWAY_URL = 'http://localhost:3000';
let adminToken = '';
let customerToken = '';
let createdUserId = '';

const testEmail = `test.user.${Date.now()}@gmail.com`;
const testPassword = 'password123';

const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS] ✅ ${msg}\x1b[0m`),
  error: (msg) => console.error(`\x1b[31m[ERROR] ❌ ${msg}\x1b[0m`),
  header: (msg) => console.log(`\n\x1b[35m=== ${msg} ===\x1b[0m`)
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  log.header('KHỞI ĐỘNG KIỂM THỬ TỰ ĐỘNG - THÀNH VIÊN 1');
  log.info(`API Gateway Target URL: ${GATEWAY_URL}`);
  
  // ── 1. HEALTHCHECK GATEWAY & SERVICES ──────────────────────────────────────
  log.header('BƯỚC 1: KIỂM TRA TRẠNG THÁI HỆ THỐNG (HEALTHCHECK)');
  try {
    const res = await axios.get(`${GATEWAY_URL}/health`);
    log.success('API Gateway Health check phản hồi thành công!');
    log.info(`Gateway Status: ${res.data.status}`);
    log.info(`User Service URL đăng ký: ${res.data.services.USER}`);
  } catch (err) {
    log.error(`Không thể kết nối tới API Gateway tại ${GATEWAY_URL}. Đảm bảo bạn đã chạy 'npm start' ở cả api-gateway và user-service!`);
    log.error(err.message);
    process.exit(1);
  }

  // ── 2. LOGIN DEFAULT ADMIN ──────────────────────────────────────────────────
  log.header('BƯỚC 2: ĐĂNG NHẬP ADMIN MẶC ĐỊNH (SEED DATA)');
  try {
    const res = await axios.post(`${GATEWAY_URL}/api/auth/login`, {
      email: 'admin@foodapp.com',
      password: 'admin123'
    });
    adminToken = res.data.data.token;
    log.success('Đăng nhập tài khoản Admin mặc định thành công!');
    log.info(`Tên Admin: ${res.data.data.user.name}`);
    log.info(`Token nhận được (rút gọn): ${adminToken.substring(0, 30)}...`);
  } catch (err) {
    log.error('Lỗi khi đăng nhập tài khoản Admin mặc định!');
    log.error(err.response ? JSON.stringify(err.response.data) : err.message);
    process.exit(1);
  }

  // ── 3. REGISTER NEW CUSTOMER ────────────────────────────────────────────────
  log.header('BƯỚC 3: ĐĂNG KÝ TÀI KHOẢN KHÁCH HÀNG MỚI (DỰNG ĐỘNG)');
  try {
    const res = await axios.post(`${GATEWAY_URL}/api/auth/register`, {
      name: 'Nguyen Van Test',
      email: testEmail,
      password: testPassword,
      phone: '0987654321',
      address: 'Hanoi, Vietnam'
    });
    createdUserId = res.data.data.user._id;
    log.success('Đăng ký tài khoản Khách hàng mới thành công!');
    log.info(`Email đăng ký: ${testEmail}`);
    log.info(`ID tài khoản mới tạo: ${createdUserId}`);
  } catch (err) {
    log.error('Lỗi khi đăng ký tài khoản mới!');
    log.error(err.response ? JSON.stringify(err.response.data) : err.message);
    process.exit(1);
  }

  // ── 4. LOGIN CUSTOMER ───────────────────────────────────────────────────────
  log.header('BƯỚC 4: ĐĂNG NHẬP BẰNG TÀI KHOẢN KHÁCH HÀNG MỚI TẠO');
  try {
    const res = await axios.post(`${GATEWAY_URL}/api/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    customerToken = res.data.data.token;
    log.success('Đăng nhập tài khoản Khách hàng mới tạo thành công!');
    log.info(`Token Khách hàng nhận được (rút gọn): ${customerToken.substring(0, 30)}...`);
  } catch (err) {
    log.error('Lỗi khi đăng nhập tài khoản Khách hàng mới!');
    log.error(err.response ? JSON.stringify(err.response.data) : err.message);
    process.exit(1);
  }

  // ── 5. GET CUSTOMER PROFILE (AUTH) ──────────────────────────────────────────
  log.header('BƯỚC 5: XEM PROFILE CỦA CHÍNH MÌNH (YÊU CẦU XÁC THỰC JWT)');
  try {
    const res = await axios.get(`${GATEWAY_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${customerToken}`
      }
    });
    log.success('Xem profile cá nhân thành công!');
    log.info(`Tên hiển thị: ${res.data.data.name}`);
    log.info(`Email: ${res.data.data.email}`);
    log.info(`Quyền hạn (role): ${res.data.data.role}`);
    log.info(`Mã Trace lỗi (Correlation ID nhận từ Gateway): ${res.headers['x-correlation-id']}`);
  } catch (err) {
    log.error('Lỗi khi xem profile cá nhân!');
    log.error(err.response ? JSON.stringify(err.response.data) : err.message);
    process.exit(1);
  }

  // ── 6. UPDATE PROFILE (AUTH) ────────────────────────────────────────────────
  log.header('BƯỚC 6: SỬA PROFILE CỦA CHÍNH MÌNH (CẬP NHẬT THÔNG TIN)');
  try {
    const res = await axios.put(`${GATEWAY_URL}/api/users/profile`, {
      name: 'Nguyen Van Test Cập Nhật',
      phone: '0111222333',
      address: 'Ho Chi Minh, Vietnam'
    }, {
      headers: {
        Authorization: `Bearer ${customerToken}`
      }
    });
    log.success('Cập nhật profile cá nhân thành công!');
    log.info(`Tên sau cập nhật: ${res.data.data.name}`);
    log.info(`Số điện thoại sau cập nhật: ${res.data.data.phone}`);
    log.info(`Địa chỉ sau cập nhật: ${res.data.data.address}`);
  } catch (err) {
    log.error('Lỗi khi cập nhật profile cá nhân!');
    log.error(err.response ? JSON.stringify(err.response.data) : err.message);
    process.exit(1);
  }

  // ── 7. ADMIN ONLY - GET ALL USERS (ADMIN-AUTH) ──────────────────────────────
  log.header('BƯỚC 7: XEM DANH SÁCH TẤT CẢ NGƯỜI DÙNG (YÊU CẦU QUYỀN ADMIN)');
  try {
    const res = await axios.get(`${GATEWAY_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    log.success('Admin lấy danh sách tất cả người dùng thành công!');
    log.info(`Tổng số người dùng tìm thấy: ${res.data.data.pagination.total}`);
    res.data.data.users.forEach((user, index) => {
      log.info(`[User ${index + 1}] Name: ${user.name} | Email: ${user.email} | Role: ${user.role}`);
    });
  } catch (err) {
    log.error('Lỗi khi lấy danh sách người dùng!');
    log.error(err.response ? JSON.stringify(err.response.data) : err.message);
    process.exit(1);
  }

  // ── 8. SECURITY TEST: BLOCKED ACCESS FOR CUSTOMERS TO ADMIN API ──────────────
  log.header('BƯỚC 8: BẢO MẬT - THỬ TRUY CẬP API ADMIN BẰNG TOKEN KHÁCH HÀNG');
  try {
    await axios.get(`${GATEWAY_URL}/api/users`, {
      headers: {
        Authorization: `Bearer ${customerToken}`
      }
    });
    log.error('LỖI BẢO MẬT: Khách hàng thông thường lại có thể gọi được API của Admin!');
    process.exit(1);
  } catch (err) {
    if (err.response && err.response.status === 403) {
      log.success('BẢO MẬT HOẠT ĐỘNG TỐT! Khách hàng bị chặn truy cập API Admin (Lỗi 403 Forbidden).');
      log.info(`Thông báo chặn từ Server: ${err.response.data.message}`);
    } else {
      log.error('Lỗi kiểm thử bảo mật!');
      log.error(err.message);
      process.exit(1);
    }
  }

  log.header('TẤT CẢ CÁC BƯỚC TEST ĐÃ ĐẠT KẾT QUẢ XUẤT SẮC! HỆ THỐNG AN TOÀN & HOẠT ĐỘNG HOÀN HẢO! 🏁');
}

runTests();
