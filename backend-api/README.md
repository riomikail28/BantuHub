# BantuHub Backend API

Laravel REST API untuk BantuHub.

## Prasyarat

- PHP 8.2+
- Composer
- MySQL 8+ atau PostgreSQL 14+

## Setup Lokal

```bash
cd backend-api
composer install
cp .env.example .env
php artisan key:generate
```

Atur koneksi database di `.env`, lalu jalankan:

```bash
php artisan migrate --seed
php artisan serve
```

API lokal akan berjalan di:

```text
http://127.0.0.1:8000
```

Health check:

```text
GET /api/health
```

## Auth API

Public endpoints:

```text
POST /api/auth/register/customer
POST /api/auth/register/provider
POST /api/auth/login
```

Private endpoints, gunakan bearer token Sanctum:

```text
POST /api/auth/logout
GET /api/auth/me
```

Format response sukses:

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Contoh register customer:

```json
{
  "name": "Customer Test",
  "email": "customer@example.test",
  "password": "password",
  "password_confirmation": "password",
  "phone": "081234567890"
}
```

Contoh register provider:

```json
{
  "name": "Provider Test",
  "email": "provider@example.test",
  "password": "password",
  "password_confirmation": "password",
  "business_name": "Provider Service"
}
```

Provider baru akan memiliki `verification_status` bernilai `pending`. Endpoint pembuatan layanan provider nantinya harus memakai middleware `provider.approved`.

## Admin API

Semua endpoint admin wajib memakai bearer token Sanctum milik user dengan role `admin`.

```text
GET    /api/admin/dashboard

GET    /api/admin/categories
POST   /api/admin/categories
GET    /api/admin/categories/{id}
PUT    /api/admin/categories/{id}
DELETE /api/admin/categories/{id}

GET    /api/admin/customers
GET    /api/admin/customers/{id}

GET    /api/admin/providers
GET    /api/admin/providers/{id}
PUT    /api/admin/providers/{id}/approve
PUT    /api/admin/providers/{id}/reject
PUT    /api/admin/providers/{id}/suspend
```

Dashboard summary mengembalikan data yang sudah tersedia:

```json
{
  "total_users": 10,
  "total_customers": 5,
  "total_providers": 4,
  "pending_providers": 2,
  "approved_providers": 1,
  "total_categories": 7,
  "active_categories": 7
}
```

Contoh create category:

```json
{
  "name": "Jasa Legal",
  "description": "Layanan konsultasi dan dokumen legal.",
  "is_active": true
}
```

Contoh update category:

```json
{
  "name": "Jasa Kreatif",
  "slug": "jasa-kreatif",
  "description": "Layanan desain, konten, dan produksi digital.",
  "is_active": true
}
```

Status verifikasi provider:

- `pending`: provider baru mendaftar dan belum diverifikasi
- `verified`: provider sudah disetujui admin
- `rejected`: provider ditolak admin

Suspend provider akan mengubah `users.status` menjadi `suspended`.

## Provider API

Semua endpoint provider wajib memakai bearer token Sanctum milik user dengan role `provider`.

```text
GET    /api/provider/dashboard
GET    /api/provider/profile
PUT    /api/provider/profile
GET    /api/provider/categories
GET    /api/provider/services
POST   /api/provider/services
GET    /api/provider/services/{id}
PUT    /api/provider/services/{id}
DELETE /api/provider/services/{id}
```

`POST /api/provider/services` juga memakai middleware `provider.approved`. Provider dengan `verification_status` selain `verified` atau user `status` selain `active` tidak bisa membuat layanan.

Contoh update provider profile:

```json
{
  "business_name": "Bantu Service",
  "bio": "Mitra layanan perbaikan rumah dan elektronik.",
  "address": "Jl. Contoh No. 1",
  "city": "Jakarta",
  "province": "DKI Jakarta",
  "postal_code": "12345"
}
```

Contoh create service:

```json
{
  "category_id": 1,
  "name": "AC Cleaning",
  "description": "Cleaning AC rumah.",
  "price": 125000,
  "duration_minutes": 60,
  "service_method": "home_service",
  "image": "services/ac-cleaning.jpg"
}
```

Nilai `service_method`:

- `home_service`
- `visit_store`
- `online_service`

Nilai `services.status`:

- `pending_review`
- `active`
- `inactive`

`DELETE /api/provider/services/{id}` tidak menghapus data secara fisik. Endpoint ini menonaktifkan layanan dengan mengubah `status` menjadi `inactive`.

## Seeder Awal

Seeder membuat:

- Role: `admin`, `customer`, `provider`
- User admin awal dari variabel `.env`
- Kategori jasa awal

Variabel admin:

```env
ADMIN_NAME="BantuHub Admin"
ADMIN_EMAIL=admin@bantuhub.test
ADMIN_PASSWORD=password
```

## Status Implementasi

Sudah dibuat:

- Migrations database dasar
- Model dan relationship dasar
- Seeder role, admin, dan kategori
- Route health check

Belum dibuat:

- Booking
- Transaksi
- Frontend

## Verifikasi

Setelah PHP dan Composer tersedia, jalankan:

```bash
composer install
php artisan migrate:fresh --seed
php artisan test
```
