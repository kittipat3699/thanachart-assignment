# ttb-life

วิธีรันโปรเจกต์

โปรเจกต์นี้มี 2 ส่วน:
- Frontend: `frontend-stock` (Next.js)
- Backend: `backend/src/ECommerce.Api` (.NET 8)

## 1) เอาไฟล์จากอีเมลมาวาง


- `env.local` -> `frontend-stock/.env.local`
- `appsettings.local.json` -> `backend/src/ECommerce.Api/appsettings.Local.json`

หมายเหตุ:
- ถ้าไฟล์ frontend ไม่มีจุดหน้า ให้เปลี่ยนชื่อเป็น `.env.local`
- backend ต้องใช้ชื่อ `appsettings.Local.json` (L ตัวใหญ่)

## 2) ติดตั้งที่ต้องมีในเครื่อง

- Node.js + npm
- .NET SDK 8

## 3) รัน Backend

```bash
cd backend/src/ECommerce.Api
dotnet restore
dotnet run
```

Backend จะรันที่ `http://localhost:5000`

check api API:

```bash
curl http://localhost:5000/health
```

## 4) รัน Frontend

```bash
cd frontend-stock
npm install
npm run dev
```

เปิดเว็บที่ `http://localhost:3000`