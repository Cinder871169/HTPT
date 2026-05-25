# Food Ordering Microservices

Backend đặt đồ ăn theo kiến trúc microservice, chạy bằng Docker Compose.

## Service hiện có

| Service | Port | Chức năng |
| --- | --- | --- |
| API Gateway | 3000 | Routing, JWT auth, rate limit |
| User Service | 3001 | Đăng ký, đăng nhập, user profile |
| Restaurant Service | 3002 | Nhà hàng, menu, tồn kho |
| Order Service | 3003 | Đơn hàng, publish order events |
| Notification Service | 3004 | Thông báo, consume order events |
| MongoDB | 27017 | Database cho các service |
| Kafka | 9092 | Message broker cho order events |

Lưu ý: bản code hiện tại dùng Kafka, không dùng RabbitMQ. Vì vậy `restaurant-service` cũng consume topic Kafka `order-events`.

## Chạy bằng Docker

Yêu cầu: Docker Desktop đang chạy.

```powershell
docker compose up --build
```

Chạy nền:

```powershell
docker compose up -d --build
```

Kiểm tra container:

```powershell
docker compose ps
```

Xem log riêng của restaurant-service:

```powershell
docker compose logs -f restaurant-service
```

Dừng toàn bộ:

```powershell
docker compose down
```

Nếu muốn xóa luôn dữ liệu MongoDB:

```powershell
docker compose down -v
```

## Health check

```powershell
curl.exe http://localhost:3000/health
curl.exe http://localhost:3002/health
```

## Test nhanh Restaurant API qua Gateway

Đăng ký tài khoản chủ nhà hàng:

```powershell
curl.exe -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d "{\"name\":\"Owner One\",\"email\":\"owner1@test.com\",\"password\":\"123456\",\"role\":\"restaurant_owner\"}"
```

Đăng nhập và lấy token:

```powershell
curl.exe -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"owner1@test.com\",\"password\":\"123456\"}"
```

Tạo nhà hàng, thay `YOUR_TOKEN` bằng token nhận được:

```powershell
curl.exe -X POST http://localhost:3000/api/restaurants `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d "{\"name\":\"Pho Demo\",\"address\":\"123 Nguyen Trai\",\"phone\":\"0909000000\",\"cuisine\":[\"Vietnamese\",\"Noodle\"]}"
```

Thêm món vào menu, thay `RESTAURANT_ID`:

```powershell
curl.exe -X POST http://localhost:3000/api/restaurants/RESTAURANT_ID/menu `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -d "{\"name\":\"Pho Bo\",\"description\":\"Beef noodle soup\",\"price\":55000,\"category\":\"Noodle\",\"stock\":20}"
```

Xem danh sách nhà hàng và menu là public:

```powershell
curl.exe http://localhost:3000/api/restaurants
curl.exe http://localhost:3000/api/restaurants/RESTAURANT_ID/menu
```

## Luồng stock tự động

Khi `order-service` publish event:

- `ORDER_CREATED`: `restaurant-service` trừ `stock` của các `menuItemId` trong đơn.
- `ORDER_CANCELLED`: `restaurant-service` hoàn lại `stock`.
- Nếu `stock` về `0`, món tự chuyển `isAvailable = false`.

