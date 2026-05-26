/**
 * =============================================================
 *  SEED DEMO DATA - Food Ordering Microservice
 * =============================================================
 *  Script tạo dữ liệu demo cho toàn bộ hệ thống.
 *
 *  Cách chạy:
 *    - Docker:  docker exec -it htpt-user-service-1 node /app/seeds/seed-demo-data.js
 *    - Hoặc:   node seeds/seed-demo-data.js
 *
 *  Yêu cầu: MongoDB đang chạy (localhost:27017 hoặc qua Docker)
 * =============================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── CONFIG ──────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Database names (phải khớp với docker-compose.yml)
const DB_NAMES = {
  users: 'food_users_db',
  restaurants: 'food_restaurants_db',
  orders: 'food_orders_db',
  notifications: 'food_notifications_db',
};

// ─── SCHEMA DEFINITIONS (mirror từ các service) ─────────────

// --- User Schema ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  role: { type: String, enum: ['customer', 'restaurant_owner', 'admin'], default: 'customer' },
}, { timestamps: true });

// --- Restaurant Schema ---
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  address: { type: String, required: true, trim: true, maxlength: 300 },
  phone: { type: String, trim: true, maxlength: 30 },
  cuisine: { type: [String], default: [] },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// --- MenuItem Schema ---
const menuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 500 },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true, maxlength: 80 },
  imageUrl: { type: String, trim: true },
  isAvailable: { type: Boolean, default: true },
  stock: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

// --- Order Sub-schema ---
const orderItemSchema = new mongoose.Schema({
  menuItemId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  restaurantId: { type: String, required: true, index: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled'],
  },
  deliveryAddress: { type: String, required: true },
  note: { type: String, trim: true, maxLength: 500 },
}, { timestamps: true });

// --- Notification Schema ---
const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  orderId: { type: String },
  type: { type: String, required: true, enum: ['order_created', 'order_status', 'order_cancelled', 'system'] },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

// ─── DEMO DATA ───────────────────────────────────────────────

async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

async function seed() {
  console.log('\n🌱 ═══════════════════════════════════════════');
  console.log('   SEED DEMO DATA - Food Ordering System');
  console.log('═══════════════════════════════════════════════\n');

  // ── CONNECT TO DATABASES ───────────────────────────────────
  const userConn = await mongoose.createConnection(`${MONGODB_URI}/${DB_NAMES.users}`).asPromise();
  const restConn = await mongoose.createConnection(`${MONGODB_URI}/${DB_NAMES.restaurants}`).asPromise();
  const orderConn = await mongoose.createConnection(`${MONGODB_URI}/${DB_NAMES.orders}`).asPromise();
  const notiConn = await mongoose.createConnection(`${MONGODB_URI}/${DB_NAMES.notifications}`).asPromise();

  console.log('✅ Đã kết nối tới tất cả databases\n');

  // ── REGISTER MODELS ────────────────────────────────────────
  const User = userConn.model('User', userSchema);
  const Restaurant = restConn.model('Restaurant', restaurantSchema);
  const MenuItem = restConn.model('MenuItem', menuItemSchema);
  const Order = orderConn.model('Order', orderSchema);
  const Notification = notiConn.model('Notification', notificationSchema);

  // ── CLEAR OLD DATA ─────────────────────────────────────────
  console.log('🗑️  Xóa dữ liệu cũ...');
  await User.deleteMany({});
  await Restaurant.deleteMany({});
  await MenuItem.deleteMany({});
  await Order.deleteMany({});
  await Notification.deleteMany({});
  console.log('   Đã xóa toàn bộ dữ liệu cũ\n');

  // ══════════════════════════════════════════════════════════
  //  1. TẠO USERS
  // ══════════════════════════════════════════════════════════
  console.log('👤 Tạo Users...');

  const hashedPw = await hashPassword('123456');
  const adminPw = await hashPassword('admin123');

  const usersData = [
    // Admin
    {
      name: 'System Admin',
      email: 'admin@foodapp.com',
      password: adminPw,
      phone: '0901000000',
      address: 'Tòa nhà Admin, 1 Đường Lê Lợi, Quận 1, TP.HCM',
      role: 'admin',
    },
    // Restaurant Owners
    {
      name: 'Nguyễn Văn Hùng',
      email: 'hung.owner@gmail.com',
      password: hashedPw,
      phone: '0912345001',
      address: '45 Nguyễn Huệ, Quận 1, TP.HCM',
      role: 'restaurant_owner',
    },
    {
      name: 'Trần Thị Mai',
      email: 'mai.owner@gmail.com',
      password: hashedPw,
      phone: '0912345002',
      address: '78 Lê Thánh Tôn, Quận 1, TP.HCM',
      role: 'restaurant_owner',
    },
    {
      name: 'Phạm Đức Anh',
      email: 'anh.owner@gmail.com',
      password: hashedPw,
      phone: '0912345003',
      address: '123 Trần Hưng Đạo, Quận 5, TP.HCM',
      role: 'restaurant_owner',
    },
    {
      name: 'Lê Hoàng Nam',
      email: 'nam.owner@gmail.com',
      password: hashedPw,
      phone: '0912345004',
      address: '56 Pasteur, Quận 3, TP.HCM',
      role: 'restaurant_owner',
    },
    // Customers
    {
      name: 'Võ Minh Tuấn',
      email: 'tuan.customer@gmail.com',
      password: hashedPw,
      phone: '0987654001',
      address: '200 Nguyễn Thị Minh Khai, Quận 3, TP.HCM',
      role: 'customer',
    },
    {
      name: 'Đặng Thị Hoa',
      email: 'hoa.customer@gmail.com',
      password: hashedPw,
      phone: '0987654002',
      address: '89 Cách Mạng Tháng 8, Quận 10, TP.HCM',
      role: 'customer',
    },
    {
      name: 'Bùi Quốc Khánh',
      email: 'khanh.customer@gmail.com',
      password: hashedPw,
      phone: '0987654003',
      address: '34 Hai Bà Trưng, Quận 1, TP.HCM',
      role: 'customer',
    },
    {
      name: 'Hoàng Thị Lan',
      email: 'lan.customer@gmail.com',
      password: hashedPw,
      phone: '0987654004',
      address: '67 Võ Văn Tần, Quận 3, TP.HCM',
      role: 'customer',
    },
    {
      name: 'Ngô Thanh Sơn',
      email: 'son.customer@gmail.com',
      password: hashedPw,
      phone: '0987654005',
      address: '12 Điện Biên Phủ, Bình Thạnh, TP.HCM',
      role: 'customer',
    },
  ];

  const users = await User.insertMany(usersData);
  console.log(`   ✅ Đã tạo ${users.length} users`);

  // Map users by role for easy reference
  const admin = users[0];
  const owners = users.slice(1, 5);
  const customers = users.slice(5);

  console.log(`   📋 Admin: ${admin.email} / admin123`);
  console.log(`   📋 Owners: ${owners.map(o => o.email).join(', ')} / 123456`);
  console.log(`   📋 Customers: ${customers.map(c => c.email).join(', ')} / 123456\n`);

  // ══════════════════════════════════════════════════════════
  //  2. TẠO RESTAURANTS
  // ══════════════════════════════════════════════════════════
  console.log('🏪 Tạo Restaurants...');

  const restaurantsData = [
    {
      name: 'Phở Hà Nội 36',
      ownerId: owners[0]._id,
      address: '36 Lê Thái Tổ, Hoàn Kiếm, Hà Nội',
      phone: '024.3828.9536',
      cuisine: ['Việt Nam', 'Phở', 'Bún'],
      rating: 4.5,
      isActive: true,
    },
    {
      name: 'Cơm Tấm Sài Gòn',
      ownerId: owners[0]._id,
      address: '84 Nguyễn Du, Quận 1, TP.HCM',
      phone: '028.3822.1234',
      cuisine: ['Việt Nam', 'Cơm', 'Miền Nam'],
      rating: 4.2,
      isActive: true,
    },
    {
      name: 'Bún Bò Huế Đông Ba',
      ownerId: owners[1]._id,
      address: '17A Lý Tự Trọng, Quận 1, TP.HCM',
      phone: '028.3825.5678',
      cuisine: ['Việt Nam', 'Bún Bò', 'Miền Trung'],
      rating: 4.7,
      isActive: true,
    },
    {
      name: 'Pizza Italia Express',
      ownerId: owners[2]._id,
      address: '150 Nam Kỳ Khởi Nghĩa, Quận 3, TP.HCM',
      phone: '028.3930.9999',
      cuisine: ['Ý', 'Pizza', 'Pasta'],
      rating: 4.0,
      isActive: true,
    },
    {
      name: 'Sushi Tokyo Garden',
      ownerId: owners[2]._id,
      address: '22 Thái Văn Lung, Quận 1, TP.HCM',
      phone: '028.3824.7777',
      cuisine: ['Nhật Bản', 'Sushi', 'Ramen'],
      rating: 4.8,
      isActive: true,
    },
    {
      name: 'Trà Sữa Gong Cha',
      ownerId: owners[3]._id,
      address: '99 Nguyễn Trãi, Quận 5, TP.HCM',
      phone: '028.3838.8888',
      cuisine: ['Đài Loan', 'Trà sữa', 'Đồ uống'],
      rating: 4.3,
      isActive: true,
    },
    {
      name: 'Nhà hàng Hải Sản Biển Đông',
      ownerId: owners[3]._id,
      address: '245 Hoàng Sa, Quận 1, TP.HCM',
      phone: '028.3910.6666',
      cuisine: ['Việt Nam', 'Hải sản', 'Lẩu'],
      rating: 4.6,
      isActive: true,
    },
    {
      name: 'Quán Chay An Lạc',
      ownerId: owners[1]._id,
      address: '55 Sư Vạn Hạnh, Quận 10, TP.HCM',
      phone: '028.3862.3333',
      cuisine: ['Chay', 'Healthy', 'Việt Nam'],
      rating: 4.1,
      isActive: true,
    },
  ];

  const restaurants = await Restaurant.insertMany(restaurantsData);
  console.log(`   ✅ Đã tạo ${restaurants.length} nhà hàng\n`);

  // ══════════════════════════════════════════════════════════
  //  3. TẠO MENU ITEMS
  // ══════════════════════════════════════════════════════════
  console.log('🍜 Tạo Menu Items...');

  const menuData = [
    // ── Phở Hà Nội 36 (restaurants[0]) ──
    { restaurantId: restaurants[0]._id, name: 'Phở Bò Tái', description: 'Phở bò tái chính gốc Hà Nội, nước dùng ninh xương 12 tiếng', price: 55000, category: 'Phở', stock: 100 },
    { restaurantId: restaurants[0]._id, name: 'Phở Bò Tái Nạm', description: 'Phở bò tái nạm đầy đặn, rau thơm tươi', price: 60000, category: 'Phở', stock: 80 },
    { restaurantId: restaurants[0]._id, name: 'Phở Bò Tái Gầu', description: 'Phở bò tái gầu béo ngậy', price: 65000, category: 'Phở', stock: 60 },
    { restaurantId: restaurants[0]._id, name: 'Phở Gà', description: 'Phở gà ta thả vườn, nước trong vị ngọt', price: 50000, category: 'Phở', stock: 70 },
    { restaurantId: restaurants[0]._id, name: 'Bún Chả Hà Nội', description: 'Bún chả nướng than hoa, chấm nước mắm pha đặc biệt', price: 55000, category: 'Bún', stock: 50 },
    { restaurantId: restaurants[0]._id, name: 'Nem Rán', description: 'Nem rán giòn rụm, nhân thịt heo rau củ', price: 40000, category: 'Khai vị', stock: 40 },
    { restaurantId: restaurants[0]._id, name: 'Trà Đá', description: 'Trà đá truyền thống', price: 5000, category: 'Đồ uống', stock: 200 },
    { restaurantId: restaurants[0]._id, name: 'Nước Chanh Tươi', description: 'Nước chanh tươi mát lạnh', price: 15000, category: 'Đồ uống', stock: 100 },

    // ── Cơm Tấm Sài Gòn (restaurants[1]) ──
    { restaurantId: restaurants[1]._id, name: 'Cơm Tấm Sườn Bì Chả', description: 'Cơm tấm đầy đủ sườn nướng, bì, chả trứng', price: 50000, category: 'Cơm Tấm', stock: 100 },
    { restaurantId: restaurants[1]._id, name: 'Cơm Tấm Sườn Nướng', description: 'Cơm tấm sườn nướng mỡ hành thơm lừng', price: 40000, category: 'Cơm Tấm', stock: 80 },
    { restaurantId: restaurants[1]._id, name: 'Cơm Tấm Đặc Biệt', description: 'Cơm tấm sườn bì chả + trứng ốp la + đồ chua', price: 65000, category: 'Cơm Tấm', stock: 50 },
    { restaurantId: restaurants[1]._id, name: 'Gỏi Cuốn', description: 'Gỏi cuốn tôm thịt (2 cuốn), chấm tương đậu', price: 30000, category: 'Khai vị', stock: 60 },
    { restaurantId: restaurants[1]._id, name: 'Canh Chua Cá Lóc', description: 'Canh chua cá lóc nấu thơm, đậm đà miền Tây', price: 45000, category: 'Canh', stock: 30 },
    { restaurantId: restaurants[1]._id, name: 'Nước Mía', description: 'Nước mía ép tươi nguyên chất', price: 12000, category: 'Đồ uống', stock: 150 },

    // ── Bún Bò Huế Đông Ba (restaurants[2]) ──
    { restaurantId: restaurants[2]._id, name: 'Bún Bò Huế Đặc Biệt', description: 'Bún bò Huế chính gốc với giò heo, bò viên, chả cua', price: 65000, category: 'Bún Bò', stock: 80 },
    { restaurantId: restaurants[2]._id, name: 'Bún Bò Huế Thường', description: 'Bún bò Huế truyền thống', price: 45000, category: 'Bún Bò', stock: 100 },
    { restaurantId: restaurants[2]._id, name: 'Bún Bò Giò Heo', description: 'Bún bò với giò heo ninh mềm', price: 55000, category: 'Bún Bò', stock: 60 },
    { restaurantId: restaurants[2]._id, name: 'Bánh Bèo', description: 'Bánh bèo chén Huế, tôm chấy, hành phi', price: 35000, category: 'Đặc sản Huế', stock: 50 },
    { restaurantId: restaurants[2]._id, name: 'Bánh Nậm', description: 'Bánh nậm Huế truyền thống', price: 30000, category: 'Đặc sản Huế', stock: 40 },
    { restaurantId: restaurants[2]._id, name: 'Chè Huế Thập Cẩm', description: 'Chè Huế nhiều loại đậu, bột lọc', price: 25000, category: 'Tráng miệng', stock: 45 },

    // ── Pizza Italia Express (restaurants[3]) ──
    { restaurantId: restaurants[3]._id, name: 'Pizza Margherita', description: 'Pizza truyền thống Ý với sốt cà chua, mozzarella, húng quế', price: 129000, category: 'Pizza', stock: 40 },
    { restaurantId: restaurants[3]._id, name: 'Pizza Pepperoni', description: 'Pizza pepperoni xúc xích Ý, phô mai kéo sợi', price: 149000, category: 'Pizza', stock: 35 },
    { restaurantId: restaurants[3]._id, name: 'Pizza Hải Sản', description: 'Pizza tôm, mực, sò điệp với sốt kem', price: 169000, category: 'Pizza', stock: 30 },
    { restaurantId: restaurants[3]._id, name: 'Spaghetti Bolognese', description: 'Mỳ Ý sốt thịt bằm truyền thống', price: 89000, category: 'Pasta', stock: 50 },
    { restaurantId: restaurants[3]._id, name: 'Fettuccine Alfredo', description: 'Mỳ dẹt sốt kem parmesan', price: 99000, category: 'Pasta', stock: 40 },
    { restaurantId: restaurants[3]._id, name: 'Tiramisu', description: 'Bánh tiramisu cà phê Ý chính gốc', price: 59000, category: 'Tráng miệng', stock: 25 },
    { restaurantId: restaurants[3]._id, name: 'Coca Cola', description: 'Coca Cola lon 330ml', price: 20000, category: 'Đồ uống', stock: 200 },

    // ── Sushi Tokyo Garden (restaurants[4]) ──
    { restaurantId: restaurants[4]._id, name: 'Set Sushi Premium', description: '12 miếng sushi cá hồi, cá ngừ, tôm, lươn', price: 299000, category: 'Sushi', stock: 20 },
    { restaurantId: restaurants[4]._id, name: 'Sashimi Cá Hồi', description: 'Sashimi cá hồi Na Uy tươi (8 miếng)', price: 189000, category: 'Sashimi', stock: 25 },
    { restaurantId: restaurants[4]._id, name: 'Ramen Tonkotsu', description: 'Mỳ ramen nước dùng xương heo đậm đà 18 tiếng', price: 119000, category: 'Ramen', stock: 40 },
    { restaurantId: restaurants[4]._id, name: 'Ramen Miso', description: 'Mỳ ramen nước dùng miso truyền thống', price: 109000, category: 'Ramen', stock: 35 },
    { restaurantId: restaurants[4]._id, name: 'Tempura Tôm', description: 'Tôm tempura giòn (5 con), chấm sốt tentsuyu', price: 139000, category: 'Tempura', stock: 30 },
    { restaurantId: restaurants[4]._id, name: 'Gyoza', description: 'Há cảo Nhật chiên giòn (6 cái)', price: 69000, category: 'Khai vị', stock: 50 },
    { restaurantId: restaurants[4]._id, name: 'Trà Xanh Matcha', description: 'Trà xanh matcha Nhật Bản', price: 45000, category: 'Đồ uống', stock: 80 },

    // ── Trà Sữa Gong Cha (restaurants[5]) ──
    { restaurantId: restaurants[5]._id, name: 'Trà Sữa Trân Châu Đen', description: 'Trà sữa truyền thống với trân châu đen dai', price: 45000, category: 'Trà sữa', stock: 150 },
    { restaurantId: restaurants[5]._id, name: 'Trà Sữa Matcha', description: 'Trà sữa matcha Nhật thơm béo', price: 50000, category: 'Trà sữa', stock: 100 },
    { restaurantId: restaurants[5]._id, name: 'Trà Đào Cam Sả', description: 'Trà đào cam sả thanh mát', price: 40000, category: 'Trà trái cây', stock: 120 },
    { restaurantId: restaurants[5]._id, name: 'Trà Vải Lychee', description: 'Trà vải tươi mát lạnh', price: 42000, category: 'Trà trái cây', stock: 90 },
    { restaurantId: restaurants[5]._id, name: 'Sữa Tươi Trân Châu Đường Đen', description: 'Sữa tươi với trân châu đường đen Okinawa', price: 55000, category: 'Sữa tươi', stock: 80 },
    { restaurantId: restaurants[5]._id, name: 'Bánh Mochi', description: 'Bánh mochi nhân kem (3 viên)', price: 35000, category: 'Tráng miệng', stock: 60 },

    // ── Hải Sản Biển Đông (restaurants[6]) ──
    { restaurantId: restaurants[6]._id, name: 'Tôm Hùm Nướng Bơ Tỏi', description: 'Tôm hùm Alaska nướng bơ tỏi thơm lừng', price: 890000, category: 'Hải sản cao cấp', stock: 10 },
    { restaurantId: restaurants[6]._id, name: 'Cua Rang Me', description: 'Cua biển rang me chua ngọt đậm đà', price: 450000, category: 'Hải sản', stock: 15 },
    { restaurantId: restaurants[6]._id, name: 'Mực Nướng Sa Tế', description: 'Mực ống nướng sa tế cay nồng', price: 180000, category: 'Hải sản', stock: 30 },
    { restaurantId: restaurants[6]._id, name: 'Lẩu Hải Sản Thập Cẩm', description: 'Lẩu hải sản tôm, mực, nghêu, cá cho 2-3 người', price: 350000, category: 'Lẩu', stock: 20 },
    { restaurantId: restaurants[6]._id, name: 'Sò Điệp Nướng Mỡ Hành', description: 'Sò điệp tươi nướng mỡ hành đậu phộng', price: 120000, category: 'Hải sản', stock: 25 },
    { restaurantId: restaurants[6]._id, name: 'Cơm Chiên Hải Sản', description: 'Cơm chiên với tôm, mực, sò điệp', price: 95000, category: 'Cơm', stock: 40 },
    { restaurantId: restaurants[6]._id, name: 'Bia Tiger', description: 'Bia Tiger lon 330ml', price: 25000, category: 'Đồ uống', stock: 200 },

    // ── Quán Chay An Lạc (restaurants[7]) ──
    { restaurantId: restaurants[7]._id, name: 'Phở Chay', description: 'Phở chay nước dùng rau củ, nấm đông cô', price: 40000, category: 'Phở & Bún', stock: 60 },
    { restaurantId: restaurants[7]._id, name: 'Bún Riêu Chay', description: 'Bún riêu chay cà chua, đậu hũ non', price: 42000, category: 'Phở & Bún', stock: 50 },
    { restaurantId: restaurants[7]._id, name: 'Cơm Chay Đặc Biệt', description: 'Cơm với 5 món chay: giả gà, giả sườn, rau xào, canh, đậu hũ', price: 55000, category: 'Cơm', stock: 40 },
    { restaurantId: restaurants[7]._id, name: 'Gỏi Cuốn Chay', description: 'Gỏi cuốn rau củ, đậu hũ, bún (2 cuốn)', price: 25000, category: 'Khai vị', stock: 50 },
    { restaurantId: restaurants[7]._id, name: 'Nấm Xào Thập Cẩm', description: 'Hỗn hợp nấm xào dầu hào chay', price: 48000, category: 'Món xào', stock: 35 },
    { restaurantId: restaurants[7]._id, name: 'Nước Ép Rau Má', description: 'Nước ép rau má thanh nhiệt', price: 18000, category: 'Đồ uống', stock: 100 },
  ];

  const menuItems = await MenuItem.insertMany(menuData);
  console.log(`   ✅ Đã tạo ${menuItems.length} món ăn cho ${restaurants.length} nhà hàng\n`);

  // ══════════════════════════════════════════════════════════
  //  4. TẠO ORDERS
  // ══════════════════════════════════════════════════════════
  console.log('📦 Tạo Orders...');

  // Helper: pick random menu items from a restaurant
  function getMenuItemsForRestaurant(restId) {
    return menuItems.filter(m => m.restaurantId.toString() === restId.toString());
  }

  const ordersData = [
    // Order 1: Tuấn đặt Phở Hà Nội 36
    (() => {
      const items = getMenuItemsForRestaurant(restaurants[0]._id);
      const orderItems = [
        { menuItemId: items[0]._id.toString(), name: items[0].name, quantity: 2, price: items[0].price },
        { menuItemId: items[5]._id.toString(), name: items[5].name, quantity: 1, price: items[5].price },
        { menuItemId: items[6]._id.toString(), name: items[6].name, quantity: 2, price: items[6].price },
      ];
      return {
        userId: customers[0]._id.toString(),
        restaurantId: restaurants[0]._id.toString(),
        items: orderItems,
        totalAmount: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: 'delivered',
        deliveryAddress: customers[0].address,
        note: 'Phở ít hành, nhiều giá',
      };
    })(),

    // Order 2: Hoa đặt Pizza
    (() => {
      const items = getMenuItemsForRestaurant(restaurants[3]._id);
      const orderItems = [
        { menuItemId: items[1]._id.toString(), name: items[1].name, quantity: 1, price: items[1].price },
        { menuItemId: items[3]._id.toString(), name: items[3].name, quantity: 1, price: items[3].price },
        { menuItemId: items[6]._id.toString(), name: items[6].name, quantity: 2, price: items[6].price },
      ];
      return {
        userId: customers[1]._id.toString(),
        restaurantId: restaurants[3]._id.toString(),
        items: orderItems,
        totalAmount: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: 'delivered',
        deliveryAddress: customers[1].address,
        note: 'Giao trước 12h trưa',
      };
    })(),

    // Order 3: Khánh đặt Sushi
    (() => {
      const items = getMenuItemsForRestaurant(restaurants[4]._id);
      const orderItems = [
        { menuItemId: items[0]._id.toString(), name: items[0].name, quantity: 1, price: items[0].price },
        { menuItemId: items[4]._id.toString(), name: items[4].name, quantity: 1, price: items[4].price },
        { menuItemId: items[6]._id.toString(), name: items[6].name, quantity: 2, price: items[6].price },
      ];
      return {
        userId: customers[2]._id.toString(),
        restaurantId: restaurants[4]._id.toString(),
        items: orderItems,
        totalAmount: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: 'preparing',
        deliveryAddress: customers[2].address,
        note: 'Không wasabi',
      };
    })(),

    // Order 4: Lan đặt Trà Sữa
    (() => {
      const items = getMenuItemsForRestaurant(restaurants[5]._id);
      const orderItems = [
        { menuItemId: items[0]._id.toString(), name: items[0].name, quantity: 3, price: items[0].price },
        { menuItemId: items[2]._id.toString(), name: items[2].name, quantity: 2, price: items[2].price },
        { menuItemId: items[5]._id.toString(), name: items[5].name, quantity: 1, price: items[5].price },
      ];
      return {
        userId: customers[3]._id.toString(),
        restaurantId: restaurants[5]._id.toString(),
        items: orderItems,
        totalAmount: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: 'delivering',
        deliveryAddress: customers[3].address,
        note: 'Ít đường, ít đá',
      };
    })(),

    // Order 5: Sơn đặt Bún Bò Huế
    (() => {
      const items = getMenuItemsForRestaurant(restaurants[2]._id);
      const orderItems = [
        { menuItemId: items[0]._id.toString(), name: items[0].name, quantity: 1, price: items[0].price },
        { menuItemId: items[3]._id.toString(), name: items[3].name, quantity: 1, price: items[3].price },
        { menuItemId: items[5]._id.toString(), name: items[5].name, quantity: 1, price: items[5].price },
      ];
      return {
        userId: customers[4]._id.toString(),
        restaurantId: restaurants[2]._id.toString(),
        items: orderItems,
        totalAmount: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: 'confirmed',
        deliveryAddress: customers[4].address,
        note: 'Cay vừa',
      };
    })(),

    // Order 6: Tuấn đặt Cơm Tấm (lần 2)
    (() => {
      const items = getMenuItemsForRestaurant(restaurants[1]._id);
      const orderItems = [
        { menuItemId: items[2]._id.toString(), name: items[2].name, quantity: 2, price: items[2].price },
        { menuItemId: items[5]._id.toString(), name: items[5].name, quantity: 2, price: items[5].price },
      ];
      return {
        userId: customers[0]._id.toString(),
        restaurantId: restaurants[1]._id.toString(),
        items: orderItems,
        totalAmount: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: 'pending',
        deliveryAddress: customers[0].address,
        note: '',
      };
    })(),

    // Order 7: Hoa đặt Hải Sản
    (() => {
      const items = getMenuItemsForRestaurant(restaurants[6]._id);
      const orderItems = [
        { menuItemId: items[1]._id.toString(), name: items[1].name, quantity: 1, price: items[1].price },
        { menuItemId: items[2]._id.toString(), name: items[2].name, quantity: 1, price: items[2].price },
        { menuItemId: items[5]._id.toString(), name: items[5].name, quantity: 1, price: items[5].price },
        { menuItemId: items[6]._id.toString(), name: items[6].name, quantity: 3, price: items[6].price },
      ];
      return {
        userId: customers[1]._id.toString(),
        restaurantId: restaurants[6]._id.toString(),
        items: orderItems,
        totalAmount: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: 'delivered',
        deliveryAddress: '200A Hoàng Sa, Quận 1, TP.HCM',
        note: 'Cua rang me cay ít',
      };
    })(),

    // Order 8: Khánh đặt Chay
    (() => {
      const items = getMenuItemsForRestaurant(restaurants[7]._id);
      const orderItems = [
        { menuItemId: items[2]._id.toString(), name: items[2].name, quantity: 1, price: items[2].price },
        { menuItemId: items[4]._id.toString(), name: items[4].name, quantity: 1, price: items[4].price },
        { menuItemId: items[5]._id.toString(), name: items[5].name, quantity: 1, price: items[5].price },
      ];
      return {
        userId: customers[2]._id.toString(),
        restaurantId: restaurants[7]._id.toString(),
        items: orderItems,
        totalAmount: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: 'delivered',
        deliveryAddress: customers[2].address,
        note: '',
      };
    })(),

    // Order 9: Lan đặt Phở (cancelled)
    (() => {
      const items = getMenuItemsForRestaurant(restaurants[0]._id);
      const orderItems = [
        { menuItemId: items[1]._id.toString(), name: items[1].name, quantity: 1, price: items[1].price },
        { menuItemId: items[7]._id.toString(), name: items[7].name, quantity: 1, price: items[7].price },
      ];
      return {
        userId: customers[3]._id.toString(),
        restaurantId: restaurants[0]._id.toString(),
        items: orderItems,
        totalAmount: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: 'cancelled',
        deliveryAddress: customers[3].address,
        note: 'Hủy vì đổi ý',
      };
    })(),

    // Order 10: Sơn đặt Pizza (pending)
    (() => {
      const items = getMenuItemsForRestaurant(restaurants[3]._id);
      const orderItems = [
        { menuItemId: items[2]._id.toString(), name: items[2].name, quantity: 2, price: items[2].price },
        { menuItemId: items[5]._id.toString(), name: items[5].name, quantity: 2, price: items[5].price },
      ];
      return {
        userId: customers[4]._id.toString(),
        restaurantId: restaurants[3]._id.toString(),
        items: orderItems,
        totalAmount: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
        status: 'pending',
        deliveryAddress: customers[4].address,
        note: 'Pizza hải sản không hành',
      };
    })(),
  ];

  const orders = await Order.insertMany(ordersData);
  console.log(`   ✅ Đã tạo ${orders.length} đơn hàng\n`);

  // ══════════════════════════════════════════════════════════
  //  5. TẠO NOTIFICATIONS
  // ══════════════════════════════════════════════════════════
  console.log('🔔 Tạo Notifications...');

  const notificationsData = [
    // Notifications cho các order đã delivered
    {
      userId: customers[0]._id.toString(),
      orderId: orders[0]._id.toString(),
      type: 'order_created',
      title: 'Đơn hàng mới',
      message: `Đơn hàng #${orders[0]._id.toString().slice(-6)} từ Phở Hà Nội 36 đã được tạo thành công.`,
      isRead: true,
    },
    {
      userId: customers[0]._id.toString(),
      orderId: orders[0]._id.toString(),
      type: 'order_status',
      title: 'Đơn hàng đã giao',
      message: `Đơn hàng #${orders[0]._id.toString().slice(-6)} đã được giao thành công. Chúc bạn ngon miệng!`,
      isRead: true,
    },
    {
      userId: customers[1]._id.toString(),
      orderId: orders[1]._id.toString(),
      type: 'order_created',
      title: 'Đơn hàng mới',
      message: `Đơn hàng #${orders[1]._id.toString().slice(-6)} từ Pizza Italia Express đã được tạo.`,
      isRead: true,
    },
    {
      userId: customers[1]._id.toString(),
      orderId: orders[1]._id.toString(),
      type: 'order_status',
      title: 'Đơn hàng đã giao',
      message: `Đơn hàng #${orders[1]._id.toString().slice(-6)} đã giao thành công!`,
      isRead: false,
    },
    {
      userId: customers[2]._id.toString(),
      orderId: orders[2]._id.toString(),
      type: 'order_created',
      title: 'Đơn hàng mới',
      message: `Đơn hàng #${orders[2]._id.toString().slice(-6)} từ Sushi Tokyo Garden đang được chuẩn bị.`,
      isRead: false,
    },
    {
      userId: customers[2]._id.toString(),
      orderId: orders[2]._id.toString(),
      type: 'order_status',
      title: 'Đang chuẩn bị',
      message: `Nhà hàng đang chuẩn bị đơn hàng #${orders[2]._id.toString().slice(-6)} của bạn.`,
      isRead: false,
    },
    {
      userId: customers[3]._id.toString(),
      orderId: orders[3]._id.toString(),
      type: 'order_created',
      title: 'Đơn hàng mới',
      message: `Đơn hàng #${orders[3]._id.toString().slice(-6)} từ Trà Sữa Gong Cha đã được tạo.`,
      isRead: true,
    },
    {
      userId: customers[3]._id.toString(),
      orderId: orders[3]._id.toString(),
      type: 'order_status',
      title: 'Đang giao hàng',
      message: `Shipper đang trên đường giao đơn #${orders[3]._id.toString().slice(-6)}. Vui lòng chuẩn bị nhận hàng!`,
      isRead: false,
    },
    {
      userId: customers[4]._id.toString(),
      orderId: orders[4]._id.toString(),
      type: 'order_created',
      title: 'Đơn hàng mới',
      message: `Đơn hàng #${orders[4]._id.toString().slice(-6)} từ Bún Bò Huế Đông Ba đã được xác nhận.`,
      isRead: false,
    },
    // Cancelled order notification
    {
      userId: customers[3]._id.toString(),
      orderId: orders[8]._id.toString(),
      type: 'order_cancelled',
      title: 'Đơn hàng đã hủy',
      message: `Đơn hàng #${orders[8]._id.toString().slice(-6)} từ Phở Hà Nội 36 đã được hủy thành công.`,
      isRead: true,
    },
    // System notifications
    {
      userId: customers[0]._id.toString(),
      type: 'system',
      title: 'Chào mừng bạn mới!',
      message: 'Chào mừng bạn đến với Food Ordering App! Khám phá hàng trăm nhà hàng gần bạn.',
      isRead: true,
    },
    {
      userId: customers[1]._id.toString(),
      type: 'system',
      title: 'Ưu đãi đặc biệt',
      message: 'Giảm 20% cho đơn hàng đầu tiên! Sử dụng mã: WELCOME20',
      isRead: false,
    },
    {
      userId: customers[2]._id.toString(),
      type: 'system',
      title: 'Chào mừng bạn mới!',
      message: 'Chào mừng bạn đến với Food Ordering App! Khám phá hàng trăm nhà hàng gần bạn.',
      isRead: true,
    },
    {
      userId: customers[3]._id.toString(),
      type: 'system',
      title: 'Chào mừng bạn mới!',
      message: 'Chào mừng bạn đến với Food Ordering App!',
      isRead: true,
    },
    {
      userId: customers[4]._id.toString(),
      type: 'system',
      title: 'Chào mừng bạn mới!',
      message: 'Chào mừng bạn đến với Food Ordering App! Đặt món ngay hôm nay.',
      isRead: false,
    },
  ];

  const notifications = await Notification.insertMany(notificationsData);
  console.log(`   ✅ Đã tạo ${notifications.length} thông báo\n`);

  // ══════════════════════════════════════════════════════════
  //  SUMMARY
  // ══════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════');
  console.log('📊 TỔNG KẾT DỮ LIỆU DEMO');
  console.log('═══════════════════════════════════════════════');
  console.log(`   👤 Users:         ${users.length} (1 admin, ${owners.length} owners, ${customers.length} customers)`);
  console.log(`   🏪 Restaurants:   ${restaurants.length}`);
  console.log(`   🍜 Menu Items:    ${menuItems.length}`);
  console.log(`   📦 Orders:        ${orders.length}`);
  console.log(`   🔔 Notifications: ${notifications.length}`);
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('🔑 TÀI KHOẢN ĐĂNG NHẬP');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('  ADMIN:');
  console.log('    Email:    admin@foodapp.com');
  console.log('    Password: admin123');
  console.log('');
  console.log('  RESTAURANT OWNERS:');
  owners.forEach(o => {
    console.log(`    ${o.name.padEnd(20)} | ${o.email.padEnd(28)} | 123456`);
  });
  console.log('');
  console.log('  CUSTOMERS:');
  customers.forEach(c => {
    console.log(`    ${c.name.padEnd(20)} | ${c.email.padEnd(28)} | 123456`);
  });
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('🏪 NHÀ HÀNG');
  console.log('═══════════════════════════════════════════════');
  restaurants.forEach((r, i) => {
    const menus = getMenuItemsForRestaurant(r._id);
    console.log(`   ${i + 1}. ${r.name} (${menus.length} món) ⭐ ${r.rating}`);
  });
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('📦 ĐƠN HÀNG');
  console.log('═══════════════════════════════════════════════');
  orders.forEach((o, i) => {
    const customer = customers.find(c => c._id.toString() === o.userId);
    const restaurant = restaurants.find(r => r._id.toString() === o.restaurantId);
    const statusEmoji = {
      pending: '⏳', confirmed: '✅', preparing: '👨‍🍳',
      delivering: '🚗', delivered: '📬', cancelled: '❌',
    };
    console.log(`   ${i + 1}. ${statusEmoji[o.status]} ${o.status.padEnd(12)} | ${(customer?.name || 'N/A').padEnd(18)} → ${restaurant?.name || 'N/A'} | ${o.totalAmount.toLocaleString()}đ`);
  });
  console.log('');
  console.log('✅ Seed hoàn tất! Hệ thống sẵn sàng cho demo.\n');

  // ── CLEANUP ────────────────────────────────────────────────
  await userConn.close();
  await restConn.close();
  await orderConn.close();
  await notiConn.close();

  process.exit(0);
}

// ─── RUN ─────────────────────────────────────────────────────
seed().catch(err => {
  console.error('❌ Seed thất bại:', err);
  process.exit(1);
});
