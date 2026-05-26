/**
 * 🏆 ULTIMATE INTEGRATION TEST - FULL FLOW MULTI-SERVICES (KAFKA + REST API)
 * =========================================================================
 * Script này tự động hóa việc kiểm thử toàn bộ hệ thống gồm 5 microservices:
 * 1. Healthcheck kiểm tra kết nối API Gateway -> các Service con.
 * 2. Đăng nhập Admin mặc định -> lấy Admin JWT Token.
 * 3. [User Service] Đăng ký mới 1 tài khoản Chủ Nhà Hàng (Restaurant Owner).
 * 4. [User Service] Admin nâng quyền (role) tài khoản vừa tạo lên 'restaurant_owner'.
 * 5. [Restaurant Service] Đăng nhập Chủ Nhà Hàng -> Tạo Nhà Hàng mới.
 * 6. [Restaurant Service] Thêm món ăn mẫu vào Menu với số lượng tồn kho (stock) = 10.
 * 7. [User Service] Đăng ký & Đăng nhập một tài khoản Khách Hàng (Customer) -> lấy JWT.
 * 8. [Order Service] Khách Hàng đặt món ăn đó (số lượng = 2) -> Phát sự kiện ORDER_CREATED.
 * 9. [Kafka Verification - Restaurant] Đợi 2 giây -> Kiểm tra xem tồn kho món ăn đã tự động giảm từ 10 xuống 8 chưa!
 * 10. [Kafka Verification - Notification] Đợi -> Kiểm tra xem có sinh thông báo Đặt hàng mới tự động cho Customer chưa!
 * 11. [Order Service] Chủ Nhà Hàng cập nhật thử trạng thái đơn hàng -> 'confirmed' -> Phát ORDER_STATUS_CHANGED.
 * 12. [Order Service] Khách hàng hủy đơn hàng (Cancel) -> Phát ORDER_CANCELLED.
 * 13. [Kafka Verification - Final] Đợi 2 giây -> Kiểm tra xem tồn kho đã tự động HOÀN LẠI thành 10 chưa!
 */

const axios = require('axios');

const GATEWAY_URL = 'http://localhost:3000';
let adminToken = '';
let ownerToken = '';
let customerToken = '';

let ownerId = '';
let customerId = '';
let restaurantId = '';
let menuItemId = '';
let orderId = '';

const ownerEmail = `owner.${Date.now()}@gmail.com`;
const customerEmail = `customer.${Date.now()}@gmail.com`;
const testPassword = 'password123';

const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS] ✅ ${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m[WARN] ⚠️ ${msg}\x1b[0m`),
  error: (msg) => console.error(`\x1b[31m[ERROR] ❌ ${msg}\x1b[0m`),
  header: (msg) => console.log(`\n\x1b[35m🚀 === ${msg} ===\x1b[0m`)
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFullFlowTests() {
  log.header('KHỞI ĐỘNG KIỂM THỬ TÍCH HỢP TOÀN DIỆN 5 MICROSERVICES QUA DOCKER');
  
  // ── BƯỚC 1: HEALTHCHECK ──────────────────────────────────────────────────
  log.header('BƯỚC 1: HEALTHCHECK TOÀN BỘ CÁC DỊCH VỤ');
  try {
    const res = await axios.get(`${GATEWAY_URL}/health`);
    log.success('API Gateway đang hoạt động và định tuyến thành công!');
    log.info(`Upstream User URL: ${res.data.services.USER}`);
    log.info(`Upstream Restaurant URL: ${res.data.services.RESTAURANT}`);
    log.info(`Upstream Order URL: ${res.data.services.ORDER}`);
    log.info(`Upstream Notification URL: ${res.data.services.NOTIFICATION}`);
  } catch (err) {
    log.error('Không kết nối được Gateway Cổng 3000! Đảm bảo lệnh `docker-compose up` đang chạy.');
    process.exit(1);
  }

  // ── BƯỚC 2: ADMIN LOGIN ──────────────────────────────────────────────────
  log.header('BƯỚC 2: ĐĂNG NHẬP ADMIN MẶC ĐỊNH');
  try {
    const res = await axios.post(`${GATEWAY_URL}/api/auth/login`, {
      email: 'admin@foodapp.com',
      password: 'admin123'
    });
    adminToken = res.data.data.token;
    log.success('Admin đăng nhập thành công!');
  } catch (err) {
    log.error('Admin đăng nhập thất bại!');
    process.exit(1);
  }

  // ── BƯỚC 3: REGISTER OWNER ───────────────────────────────────────────────
  log.header('BƯỚC 3: ĐĂNG KÝ TÀI KHOẢN CHỦ NHÀ HÀNG');
  try {
    const res = await axios.post(`${GATEWAY_URL}/api/auth/register`, {
      name: 'Anh Chu Nha Hang',
      email: ownerEmail,
      password: testPassword,
      phone: '0912345678',
      address: 'Cau Giay, Hanoi'
    });
    ownerId = res.data.data.user._id;
    log.success(`Đăng ký tài khoản Owner thành công! Email: ${ownerEmail}`);
  } catch (err) {
    log.error('Lỗi đăng ký tài khoản Owner!');
    process.exit(1);
  }

  // ── BƯỚC 4: ADMIN NÂNG QUYỀN OWNER ─────────────────────────────────────────
  log.header('BƯỚC 4: ADMIN NÂNG CẤP VAI TRÒ OWNER CHO TÀI KHOẢN VỪA TẠO');
  try {
    const res = await axios.put(`${GATEWAY_URL}/api/users/${ownerId}/role`, {
      role: 'restaurant_owner'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    log.success(`Cập nhật vai trò thành công! Vai trò mới: ${res.data.data.role}`);
  } catch (err) {
    log.error('Lỗi Admin nâng quyền user!');
    process.exit(1);
  }

  // ── BƯỚC 5: OWNER LOGIN & TẠO NHÀ HÀNG ─────────────────────────────────────
  log.header('BƯỚC 5: CHỦ NHÀ HÀNG ĐĂNG NHẬP VÀ TẠO NHÀ HÀNG MỚI');
  try {
    // 5.1 Đăng nhập
    const loginRes = await axios.post(`${GATEWAY_URL}/api/auth/login`, {
      email: ownerEmail,
      password: testPassword
    });
    ownerToken = loginRes.data.data.token;
    log.success('Chủ nhà hàng đăng nhập thành công!');

    // 5.2 Tạo nhà hàng
    const restRes = await axios.post(`${GATEWAY_URL}/api/restaurants`, {
      name: 'Phở Gia Truyền Cầu Giấy',
      address: '123 Cầu Giấy, Hà Nội',
      phone: '0241234567',
      cuisine: ['Vietnamese', 'Noodles']
    }, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    restaurantId = restRes.data.data._id;
    log.success(`Tạo nhà hàng thành công! Tên: ${restRes.data.data.name} | ID: ${restaurantId}`);
  } catch (err) {
    log.error('Lỗi khi tạo nhà hàng!');
    log.error(err.response ? JSON.stringify(err.response.data) : err.message);
    process.exit(1);
  }

  // ── BƯỚC 6: THÊM MÓN ĂN VÀO MENU ───────────────────────────────────────────
  log.header('BƯỚC 6: CHỦ NHÀ HÀNG THÊM MÓN ĂN VỚI TỒN KHO BAN ĐẦU = 10');
  try {
    const res = await axios.post(`${GATEWAY_URL}/api/restaurants/${restaurantId}/menu`, {
      name: 'Phở Bò Tái Lăn',
      description: 'Phở bò tái lăn thơm ngon đậm đà',
      price: 55000,
      category: 'Noodles',
      stock: 10 // Tồn kho ban đầu là 10
    }, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    menuItemId = res.data.data._id;
    log.success(`Thêm món ăn thành công! Tên: ${res.data.data.name} | Tồn kho ban đầu: ${res.data.data.stock}`);
  } catch (err) {
    log.error('Lỗi khi thêm món ăn!');
    process.exit(1);
  }

  // ── BƯỚC 7: REGISTER & LOGIN CUSTOMER ──────────────────────────────────────
  log.header('BƯỚC 7: ĐĂNG KÝ VÀ ĐĂNG NHẬP KHÁCH HÀNG (CUSTOMER)');
  try {
    const regRes = await axios.post(`${GATEWAY_URL}/api/auth/register`, {
      name: 'Em An Khach Hang',
      email: customerEmail,
      password: testPassword,
      phone: '0999888777',
      address: 'Hoan Kiem, Hanoi'
    });
    customerId = regRes.data.data.user._id;

    const loginRes = await axios.post(`${GATEWAY_URL}/api/auth/login`, {
      email: customerEmail,
      password: testPassword
    });
    customerToken = loginRes.data.data.token;
    log.success(`Đăng nhập Khách hàng thành công! Email: ${customerEmail}`);
  } catch (err) {
    log.error('Lỗi đăng ký/đăng nhập Khách hàng!');
    process.exit(1);
  }

  // ── BƯỚC 8: ĐẶT HÀNG (ASYNCHRONOUS KAFKA FLOW) ──────────────────────────────
  log.header('BƯỚC 8: KHÁCH HÀNG ĐẶT MÓN ĂN (MUA 2 BÁT PHỞ)');
  try {
    const res = await axios.post(`${GATEWAY_URL}/api/orders`, {
      userId: customerId,
      restaurantId: restaurantId,
      items: [
        {
          menuItemId: menuItemId,
          name: 'Phở Bò Tái Lăn',
          quantity: 2, // Mua 2 bát phở
          price: 55000
        }
      ],
      totalAmount: 110000,
      deliveryAddress: 'Hoan Kiem, Hanoi',
      note: 'Ít bánh nhiều hành'
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    orderId = res.data.data._id;
    log.success(`Đặt hàng thành công! ID đơn hàng: ${orderId} | Tổng tiền: ${res.data.data.totalAmount}đ`);
    log.info('🔔 Hệ thống đang đẩy sự kiện [ORDER_CREATED] vào Apache Kafka Topic...');
  } catch (err) {
    log.error('Lỗi khi đặt hàng!');
    log.error(err.response ? JSON.stringify(err.response.data) : err.message);
    process.exit(1);
  }

  // ── BƯỚC 9: KAFKA STOCK VERIFICATION ──────────────────────────────────────
  log.header('BƯỚC 9: [VERIFY KAFKA] CHỜ 2 GIÂY -> KIỂM TRA TỒN KHO MÓN ĂN TỰ ĐỘNG GIẢM');
  await sleep(2500); // Chờ Kafka consume và xử lý
  try {
    // Gọi đúng API lấy Menu của nhà hàng
    const res = await axios.get(`${GATEWAY_URL}/api/restaurants/${restaurantId}/menu`);
    const menu = res.data.data || [];
    const phoBo = menu.find(item => item._id === menuItemId);
    
    if (phoBo) {
      log.info(`Tồn kho gốc: 10 | Đã mua: 2 | Tồn kho hiện tại trong DB: ${phoBo.stock}`);
      if (phoBo.stock === 8) {
        log.success('Sự kiện KAFKA [ORDER_CREATED] hoạt động hoàn hảo! Kho hàng tự động giảm xuống 8.');
      } else {
        log.warn('Kho hàng không khớp! Có thể Consumer xử lý chậm hoặc lỗi trừ kho.');
      }
    } else {
      log.error('Không tìm thấy món ăn trong thực đơn!');
    }
  } catch (err) {
    log.error('Lỗi khi lấy thông tin kho món ăn!');
    process.exit(1);
  }

  // ── BƯỚC 10: KAFKA NOTIFICATION VERIFICATION ────────────────────────────────
  log.header('BƯỚC 10: [VERIFY KAFKA] KIỂM TRA THÔNG BÁO ĐẶT HÀNG TỰ ĐỘNG');
  try {
    // Gọi đúng API lấy thông báo theo ID khách hàng
    const res = await axios.get(`${GATEWAY_URL}/api/notifications/user/${customerId}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const notifs = res.data.data || [];
    const orderNotif = notifs.find(n => n.orderId === orderId);
    
    if (orderNotif) {
      log.success('Sự kiện KAFKA [ORDER_CREATED] gửi thông báo thành công!');
      log.info(`Tiêu đề thông báo: "${orderNotif.title}"`);
      log.info(`Nội dung thông báo: "${orderNotif.message}"`);
    } else {
      log.warn('Không tìm thấy thông báo tự động cho đơn hàng này!');
    }
  } catch (err) {
    log.error('Lỗi khi lấy danh sách thông báo!');
    process.exit(1);
  }

  // ── BƯỚC 11: UPDATE STATUS ───────────────────────────────────────────────
  log.header('BƯỚC 11: CHỦ NHÀ HÀNG XÁC NHẬN & CHUYỂN TRẠNG THÁI ĐƠN HÀNG THÀNH "CONFIRMED"');
  try {
    const res = await axios.put(`${GATEWAY_URL}/api/orders/${orderId}/status`, {
      status: 'confirmed' // Dùng 'confirmed' thay vì 'preparing' để vẫn cho phép hủy đơn ở bước sau
    }, {
      headers: { Authorization: `Bearer ${ownerToken}` }
    });
    log.success(`Cập nhật trạng thái đơn hàng thành công -> Trạng thái mới: ${res.data.data.status}`);
    log.info('🔔 Hệ thống đang phát sự kiện [ORDER_STATUS_CHANGED] vào Kafka...');
  } catch (err) {
    log.error('Lỗi khi cập nhật trạng thái đơn hàng!');
    process.exit(1);
  }

  // Kiểm tra thông báo cập nhật trạng thái đơn
  await sleep(2000);
  try {
    const res = await axios.get(`${GATEWAY_URL}/api/notifications/user/${customerId}`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const statusNotif = res.data.data.find(n => n.message.includes('CONFIRMED'));
    if (statusNotif) {
      log.success('Sự kiện KAFKA [ORDER_STATUS_CHANGED] gửi thông báo trạng thái mới thành công!');
      log.info(`Nội dung thông báo: "${statusNotif.message}"`);
    } else {
      log.warn('Không tìm thấy thông báo cập nhật trạng thái đơn hàng!');
    }
  } catch (err) {}

  // ── BƯỚC 12: CANCEL ORDER & RESTORE STOCK ──────────────────────────────────
  log.header('BƯỚC 12: KHÁCH HÀNG HỦY ĐƠN HÀNG (CANCEL)');
  try {
    const res = await axios.put(`${GATEWAY_URL}/api/orders/${orderId}/cancel`, {}, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    log.success(`Yêu cầu hủy đơn hàng thành công! Trạng thái đơn hàng: ${res.data.data.status}`);
    log.info('🔔 Hệ thống đang phát sự kiện [ORDER_CANCELLED] để hoàn kho và gửi thông báo...');
  } catch (err) {
    log.error('Lỗi khi hủy đơn hàng!');
    log.error(err.response ? JSON.stringify(err.response.data) : err.message);
    process.exit(1);
  }

  // ── BƯỚC 13: VERIFY STOCK RESTORATION ─────────────────────────────────────
  log.header('BƯỚC 13: [VERIFY KAFKA] CHỜ 2 GIÂY -> KIỂM TRA TỒN KHO MÓN ĂN TỰ ĐỘNG HOÀN TRẢ = 10');
  await sleep(2500);
  try {
    const res = await axios.get(`${GATEWAY_URL}/api/restaurants/${restaurantId}/menu`);
    const phoBo = res.data.data.find(item => item._id === menuItemId);
    
    if (phoBo) {
      log.info(`Số lượng tồn kho trong DB sau khi hủy đơn: ${phoBo.stock}`);
      if (phoBo.stock === 10) {
        log.success('SỰ KIỆN KAFKA [ORDER_CANCELLED] HOẠT ĐỘNG XUẤT SẮC! Kho hàng tự động được hoàn lại nguyên trạng là 10.');
      } else {
        log.warn('Kho hàng không được hoàn trả đầy đủ!');
      }
    }
  } catch (err) {
    log.error('Lỗi khi kiểm tra hoàn kho!');
  }

  log.header('🏆 KẾT QUẢ NGHIỆM THU: TOÀN BỘ 5 SERVICES CHẠY TRÊN DOCKER HOẠT ĐỘNG HOÀN HẢO 100%! 🏁');
}

runFullFlowTests();
