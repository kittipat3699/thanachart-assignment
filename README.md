# NovaCart Monorepo

E-commerce MVP ในโครงสร้าง monorepo ตาม requirement:

- `frontend`: Next.js (App Router + TypeScript + Tailwind + shadcn-style components)
- `backend`: .NET 8 Web API (Model + Controller + Service)
- `supabase`: SQL migration สำหรับ Supabase Postgres/Auth

## Features

### Customer
- แสดงสินค้า active จาก `GET /api/v1/items`
- เพิ่มสินค้าเข้า cart (เก็บ localStorage)
- guest checkout ผ่าน `POST /api/v1/orders`

### Admin
- Login ด้วย Supabase Auth (email/password)
- CRUD items
- ปรับ stock (increase/decrease)
- CRUD admin users (create/list/update active/delete)

## Project Structure

- `/frontend`
- `/backend/src/ECommerce.Api`
- `/backend/tests/ECommerce.Api.Tests`
- `/supabase/migrations`

## Setup

### 1) Prerequisites

- Node.js LTS + npm
- .NET SDK 8.0+
- Supabase project

### 2) Database (Supabase)

รัน migration:

- `supabase/migrations/20260504150000_init_ecommerce.sql`

### 3) Backend

1. คัดลอก `backend/src/ECommerce.Api/appsettings.Local.json.example` เป็น `backend/src/ECommerce.Api/appsettings.Local.json`
2. ใส่ค่าจริงของ Supabase
3. รัน API:

```bash
cd backend/src/ECommerce.Api
dotnet restore
dotnet run
```

ค่าเริ่มต้น API คือ `https://localhost:5001` หรือ `http://localhost:5000` ตาม profile

### 4) Frontend

1. คัดลอก `frontend/.env.example` เป็น `frontend/.env.local`
2. แก้ค่า `NEXT_PUBLIC_API_BASE_URL` ให้ตรง backend
3. รันเว็บ:

```bash
cd frontend
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## API Summary

### Public
- `GET /api/v1/items`
- `POST /api/v1/orders`

### Admin
- `GET /api/v1/admin/items`
- `POST /api/v1/admin/items`
- `PUT /api/v1/admin/items/{id}`
- `DELETE /api/v1/admin/items/{id}`
- `POST /api/v1/admin/items/{id}/adjust-stock`
- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users`
- `PATCH /api/v1/admin/users/{id}`
- `DELETE /api/v1/admin/users/{id}`

## Test

```bash
# backend
cd backend/tests/ECommerce.Api.Tests
dotnet test
dotnet restore
dotnet run --launch-profile http

# frontend
cd frontend
npm run test
```

Email: admin+1777883883539@mock-com.local
Password: Adm!YKox9guGrHE