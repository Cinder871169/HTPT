# 🍔 Hệ Thống Đặt Món Ăn Trực Tuyến - Food Ordering Microservice (Kafka)

## Giới thiệu

Hệ thống đặt món ăn trực tuyến được xây dựng theo kiến trúc **Microservice**, cho phép khách hàng đặt món từ các nhà hàng, theo dõi trạng thái đơn hàng và nhận thông báo theo thời gian thực. Hệ thống bao gồm nhiều dịch vụ độc lập giao tiếp với nhau đồng bộ qua **RESTful API** và bất đồng bộ qua **Apache Kafka** (message broker) thông qua **API Gateway**.

---

## Kiến trúc hệ thống

```
                          ┌──────────────────┐
                          │   Client / App   │
                          └────────┬─────────┘
                                   │
                          ┌────────▼─────────┐
                          │   API Gateway    │
                          │    (Port 3000)   │
                          └──┬───┬───┬───┬───┘
                             │   │   │   │
              ┌──────────────┤   │   │   ├──────────────┐
              │              │   │   │                   │
     ┌────────▼──────┐ ┌────▼───▼────┐ ┌────────▼──────┐
     │ User Service  │ │ Restaurant  │ │  Notification  │
     │  (Port 3001)  │ │  Service    │ │   Service      │
     │               │ │ (Port 3002) │ │  (Port 3004)   │
     └───────┬───────┘ └──────┬──────┘ └───────┬────────┘
             │                │                 │
             │         ┌─────▼──────┐          │
             │         │   Order    │          │
             │         │  Service   │          │
             │         │ (Port 3003)│          │
             │         └─────┬──────┘          │
             │               │                 │
     ┌───────▼───────────────▼─────────────────▼────────┐
     │                   Apache Kafka                  │
     │              (Port 9092 / 29092)                │
     └───────────────────────┬──────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │    MongoDB      │
                    │  (Port 27017)   │
                    └─────────────────┘
```

---

## Công nghệ sử dụng (Tech Stack)

| Thành phần         | Công nghệ                        |
| ------------------- | --------------------------------- |
| Ngôn ngữ            | Node.js (JavaScript)             |
| Framework            | Express.js                       |
| Cơ sở dữ liệu       | MongoDB + Mongoose               |
| Message Broker       | Apache Kafka (kafkajs)           |
| Xác thực             | JWT (jsonwebtoken)               |
| Logging              | Winston                          |
| Container            | Docker & Docker Compose          |
| API Gateway          | Express + http-proxy-middleware  |

---

## Yêu cầu hệ thống (Prerequisites)

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Docker** & **Docker Compose** >= 2.x
- **MongoDB** >= 7.x (nếu chạy local)
- **Apache Kafka** & **Zookeeper** >= 3.x (nếu chạy local)

---

## Hướng dẫn chạy

### 1. Chạy trên môi trường Local

```bash
# Clone dự án
git clone <repo-url>
# Chuyển vào thư mục dự án
cd HTPT

# Cài đặt dependencies cho từng service
cd user-service && npm install && cd ..
cd restaurant-service && npm install && cd ..
cd order-service && npm install && cd ..
cd notification-service && npm install && cd ..
cd api-gateway && npm install && cd ..

# Khởi động MongoDB và Kafka (nếu chưa chạy)
# Đảm bảo Zookeeper chạy trước Kafka.
# Kafka chạy ở cổng localhost:9092.

# Chạy từng service (mở mỗi service trong 1 terminal riêng)
cd user-service && npm run dev
cd restaurant-service && npm run dev
cd order-service && npm run dev
cd notification-service && npm run dev
cd api-gateway && npm run dev
```

### 2. Chạy bằng Docker Compose

```bash
# Build và khởi động tất cả services
docker-compose up --build

# Chạy ở chế độ nền (detached)
docker-compose up --build -d

# Xem logs
docker-compose logs -f

# Dừng tất cả services
docker-compose down

# Dừng và xóa volumes
docker-compose down -v
```

---

## API Endpoints

### 🔐 User Service (Port 3001)

| Method | Endpoint              | Mô tả                      | Auth |
| ------ | --------------------- | --------------------------- | ---- |
| POST   | `/api/users/register` | Đăng ký tài khoản mới       | ❌   |
| POST   | `/api/users/login`    | Đăng nhập                   | ❌   |
| GET    | `/api/users/profile`  | Xem thông tin cá nhân        | ✅   |
| PUT    | `/api/users/profile`  | Cập nhật thông tin cá nhân   | ✅   |
| GET    | `/api/users`          | Danh sách người dùng (Admin) | ✅   |

### 🍽️ Restaurant Service (Port 3002)

| Method | Endpoint                          | Mô tả                          | Auth |
| ------ | --------------------------------- | ------------------------------- | ---- |
| POST   | `/api/restaurants`                | Tạo nhà hàng mới                | ✅   |
| GET    | `/api/restaurants`                | Danh sách nhà hàng              | ❌   |
| GET    | `/api/restaurants/:id`            | Chi tiết nhà hàng               | ❌   |
| PUT    | `/api/restaurants/:id`            | Cập nhật nhà hàng               | ✅   |
| DELETE | `/api/restaurants/:id`            | Xóa nhà hàng                    | ✅   |
| POST   | `/api/restaurants/:id/menu`       | Thêm món ăn vào menu            | ✅   |
| PUT    | `/api/restaurants/:id/menu/:itemId` | Cập nhật món ăn               | ✅   |
| DELETE | `/api/restaurants/:id/menu/:itemId` | Xóa món ăn                   | ✅   |

### 📦 Order Service (Port 3003)

| Method | Endpoint                      | Mô tả                            | Auth |
| ------ | ----------------------------- | --------------------------------- | ---- |
| POST   | `/api/orders`                 | Tạo đơn hàng mới                  | ✅   |
| GET    | `/api/orders`                 | Danh sách đơn hàng của người dùng  | ✅   |
| GET    | `/api/orders/:id`             | Chi tiết đơn hàng                  | ✅   |
| PUT    | `/api/orders/:id/status`      | Cập nhật trạng thái đơn hàng       | ✅   |
| PUT    | `/api/orders/:id/cancel`      | Hủy đơn hàng                      | ✅   |
| GET    | `/api/orders/restaurant/:id`  | Đơn hàng theo nhà hàng (Owner)     | ✅   |

### 🔔 Notification Service (Port 3004)

| Method | Endpoint                          | Mô tả                        | Auth |
| ------ | --------------------------------- | ----------------------------- | ---- |
| GET    | `/api/notifications`              | Danh sách thông báo            | ✅   |
| PUT    | `/api/notifications/:id/read`     | Đánh dấu đã đọc               | ✅   |
| PUT    | `/api/notifications/read-all`     | Đánh dấu tất cả đã đọc        | ✅   |
| DELETE | `/api/notifications/:id`          | Xóa thông báo                  | ✅   |

### 🌐 API Gateway (Port 3000)

| Prefix             | Forward tới           |
| ------------------- | --------------------- |
| `/api/users`        | User Service :3001    |
| `/api/restaurants`  | Restaurant Service :3002 |
| `/api/orders`       | Order Service :3003   |
| `/api/notifications`| Notification Service :3004 |

---

## Tài khoản mặc định

| Email               | Mật khẩu   | Vai trò |
| ------------------- | ----------- | ------- |
| admin@foodapp.com   | admin123    | Admin   |

---

## Cấu trúc dự án

```
HTPT/
├── api-gateway/            # API Gateway - điều hướng request
│   ├── src/
│   │   ├── index.js
│   │   └── proxy.js
│   ├── Dockerfile
│   └── package.json
│
├── user-service/           # Quản lý người dùng & xác thực
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
│
├── restaurant-service/     # Quản lý nhà hàng & menu
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
│
├── order-service/          # Quản lý đơn hàng
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
│
├── notification-service/   # Quản lý thông báo
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
│
├── shared/                 # Code dùng chung giữa các service
│   ├── constants.js        # Hằng số (Kafka topics, roles, status...)
│   ├── logger.js           # Winston logger factory
│   └── kafka.js            # [NEW] Kafka connection helper (thay thế rabbitmq.js)
│
├── docker-compose.yml      # Docker Compose configuration (tích hợp Kafka & Zookeeper)
├── .env                    # Biến môi trường (local)
├── .env.docker             # Biến môi trường (Docker)
└── README.md               # Tài liệu dự án
```

---

## License

MIT
