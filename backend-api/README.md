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

## Environment Production

Jangan commit file `.env` asli. Untuk production, set environment variable dari dashboard hosting:

```env
APP_NAME=BantuHub
APP_ENV=production
APP_KEY=base64:GENERATE_DI_SERVER
APP_DEBUG=false
APP_URL=https://domain-backend-anda
FRONTEND_URL=https://domain-frontend-anda

DB_CONNECTION=pgsql
DB_HOST=host-database
DB_PORT=5432
DB_DATABASE=bantuhub
DB_USERNAME=username
DB_PASSWORD=password

SANCTUM_STATEFUL_DOMAINS=domain-frontend-anda
SESSION_DOMAIN=.domain-frontend-anda

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
LOG_CHANNEL=stack
LOG_LEVEL=error
```

Jika memakai MySQL, gunakan `DB_CONNECTION=mysql` dan `DB_PORT=3306`.

CORS membaca `FRONTEND_URL` dari env production.

Setelah deploy dan env final:

```bash
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache
```

Pastikan `storage/` dan `bootstrap/cache/` writable oleh runtime hosting.

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
- `suspended`: provider dinonaktifkan admin

Suspend provider akan mengubah `users.status` dan `provider_profiles.verification_status` menjadi `suspended`.

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

## Public dan Customer API

Endpoint public bisa diakses tanpa login:

```text
GET /api/categories
GET /api/services
GET /api/services/{id}
```

Endpoint customer wajib memakai bearer token Sanctum milik user dengan role `customer`:

```text
GET /api/customer/dashboard
```

Public service hanya menampilkan layanan dengan:

- `services.status = active`
- provider `users.status = active`
- provider `verification_status = verified`

Filter layanan:

```text
GET /api/services?category_id=1&service_method=home_service&min_price=50000&max_price=200000&keyword=cleaning
```

Parameter filter:

- `category_id`: filter berdasarkan kategori
- `service_method`: `home_service`, `visit_store`, atau `online_service`
- `min_price`: harga minimum
- `max_price`: harga maksimum
- `keyword`: pencarian nama layanan

Detail layanan menyertakan kategori, provider, profil provider, dan rating provider jika tersedia di `provider_profile.rating_average` dan `provider_profile.rating_count`.

## Booking API

Endpoint booking customer wajib memakai bearer token Sanctum milik user dengan role `customer`:

```text
POST /api/customer/bookings
GET  /api/customer/bookings
GET  /api/customer/bookings/{id}
```

Endpoint booking provider wajib memakai bearer token Sanctum milik user dengan role `provider`:

```text
GET /api/provider/bookings
GET /api/provider/bookings/{id}
PUT /api/provider/bookings/{id}/accept
PUT /api/provider/bookings/{id}/reject
PUT /api/provider/bookings/{id}/status
```

Contoh create booking:

```json
{
  "service_id": 1,
  "booking_date": "2026-05-19",
  "booking_time": "10:00",
  "service_method": "home_service",
  "address": "Jl. Contoh No. 1",
  "customer_note": "Mohon datang tepat waktu."
}
```

Booking hanya bisa dibuat untuk layanan yang:

- `services.status = active`
- provider `users.status = active`
- provider `verification_status = verified`

Status awal booking adalah `pending`. `booking_code` dibuat otomatis dengan format:

```text
BK-YYYYMMDD-0001
```

Contoh accept booking:

```json
{
  "note": "Booking diterima."
}
```

Contoh update status booking:

```json
{
  "status": "on_the_way",
  "note": "Mitra sedang menuju lokasi."
}
```

Flow status provider tahap ini:

- `pending` ke `accepted` atau `rejected`
- `accepted` ke `on_the_way` atau `in_progress`
- `on_the_way` ke `arrived_at_location`
- `arrived_at_location` ke `in_progress`
- `in_progress` ke `waiting_payment`
- `waiting_payment` belum bisa menjadi `paid` sampai modul payment dibuat

Setiap perubahan status dicatat di `booking_status_logs`.

## Payment Manual dan Fee Platform

Endpoint payment customer wajib memakai bearer token Sanctum milik user dengan role `customer`:

```text
POST /api/customer/bookings/{id}/payment
GET  /api/customer/bookings/{id}/payment
```

Payment hanya bisa dibuat jika booking milik customer tersebut dan `bookings.status = waiting_payment`.

Contoh upload payment manual:

```json
{
  "payment_method": "manual_transfer",
  "payment_proof": "payments/proof-transfer.jpg"
}
```

Nilai `payment_method`:

- `manual_transfer`
- `cash`

Endpoint payment admin wajib memakai bearer token Sanctum milik user dengan role `admin`:

```text
GET /api/admin/payments
GET /api/admin/payments/{id}
PUT /api/admin/payments/{id}/approve
PUT /api/admin/payments/{id}/reject
```

Contoh reject payment:

```json
{
  "admin_note": "Bukti pembayaran tidak terbaca."
}
```

Jika admin approve payment:

- `payments.payment_status` menjadi `paid`
- `payments.paid_at` diisi
- `payments.verified_by` diisi user admin
- `bookings.status` menjadi `paid`
- perubahan status booking dicatat ke `booking_status_logs`

Endpoint earning provider wajib memakai bearer token Sanctum milik user dengan role `provider`:

```text
GET /api/provider/earnings
```

Fee platform mengikuti `config('bantuhub.platform_fee_percent')`.

Contoh perhitungan:

```text
service_price = 200000
platform_fee_percent = 2
platform_fee_amount = 4000
provider_earning = 196000
total_payment = 200000
```

Payment gateway asli belum dibuat pada tahap ini.

## Review dan Rating

Endpoint customer:

```text
POST /api/customer/bookings/{id}/review
GET  /api/customer/reviews
```

Review hanya bisa dibuat oleh customer pemilik booking jika status booking `paid` atau `completed`. Satu booking hanya boleh memiliki satu review.

Contoh create review:

```json
{
  "rating": 5,
  "review_text": "Layanan cepat dan rapi."
}
```

Setelah review dibuat, sistem menghitung ulang `provider_profiles.rating_average` dan `provider_profiles.rating_count`.

Endpoint provider:

```text
GET /api/provider/reviews
```

Endpoint admin:

```text
GET /api/admin/reviews
```

## Complaint

Endpoint customer:

```text
POST /api/customer/bookings/{id}/complaint
GET  /api/customer/complaints
GET  /api/customer/complaints/{id}
```

Complaint hanya bisa dibuat oleh customer pemilik booking jika status booking `paid`, `completed`, atau `complaint`. Saat complaint dibuat, booking status berubah menjadi `complaint` dan perubahan dicatat di `booking_status_logs`.

Contoh create complaint:

```json
{
  "complaint_text": "Layanan belum sesuai dengan kesepakatan."
}
```

Endpoint provider:

```text
GET /api/provider/complaints
GET /api/provider/complaints/{id}
```

Provider hanya bisa melihat complaint yang berkaitan dengan booking miliknya.

Endpoint admin:

```text
GET /api/admin/complaints
GET /api/admin/complaints/{id}
PUT /api/admin/complaints/{id}/process
PUT /api/admin/complaints/{id}/resolve
PUT /api/admin/complaints/{id}/reject
```

Contoh update complaint oleh admin:

```json
{
  "admin_response": "Komplain sedang ditinjau oleh admin."
}
```

Status complaint:

- `pending`
- `process`
- `resolved`
- `rejected`

## Mini CRM Admin

Semua endpoint Mini CRM wajib memakai bearer token Sanctum milik user dengan role `admin`.

```text
GET    /api/admin/crm/notes
POST   /api/admin/crm/notes
GET    /api/admin/crm/notes/{id}
PUT    /api/admin/crm/notes/{id}
DELETE /api/admin/crm/notes/{id}

GET /api/admin/crm/customers/{id}/summary
GET /api/admin/crm/providers/{id}/summary
```

Contoh create note untuk customer:

```json
{
  "user_id": 10,
  "note_type": "customer_note",
  "note": "Customer perlu follow up via WhatsApp."
}
```

Contoh create note untuk booking:

```json
{
  "booking_id": 20,
  "note_type": "booking_note",
  "note": "Booking perlu dicek manual oleh admin."
}
```

Nilai `note_type`:

- `customer_note`
- `provider_note`
- `booking_note`
- `complaint_note`
- `follow_up`
- `warning`

Customer CRM summary berisi data customer, jumlah booking, booking aktif, booking selesai, total complaint, total review, dan admin notes.

Provider CRM summary berisi data provider, profil provider, total layanan, total booking diterima, booking selesai, earning paid, rating, total complaint, dan admin notes.

## Laporan Admin

Semua endpoint laporan wajib memakai bearer token Sanctum milik user dengan role `admin`.

```text
GET /api/admin/reports/overview
GET /api/admin/reports/transactions
GET /api/admin/reports/bookings
GET /api/admin/reports/providers
GET /api/admin/reports/categories
GET /api/admin/reports/complaints
```

Contoh filter transaction report:

```text
GET /api/admin/reports/transactions?start_date=2026-05-01&end_date=2026-05-31&provider_id=5&category_id=1
```

Contoh filter booking report:

```text
GET /api/admin/reports/bookings?status=paid&start_date=2026-05-01&end_date=2026-05-31&provider_id=5&category_id=1
```

Contoh filter complaint report:

```text
GET /api/admin/reports/complaints?status=pending&start_date=2026-05-01&end_date=2026-05-31&provider_id=5
```

Report overview menghitung total transaksi, platform fee, dan provider earning dari payment yang sudah `paid`.

## Seeder Awal

Seeder membuat:

- Role: `admin`, `customer`, `provider`
- User admin awal dari variabel `.env`
- Kategori jasa awal
- Data demo untuk testing manual dan presentasi pada environment non-testing

Variabel admin:

```env
ADMIN_NAME="BantuHub Admin"
ADMIN_EMAIL=admin@bantuhub.test
ADMIN_PASSWORD=password
```

## Akun Demo

Seeder demo membuat akun berikut:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@bantuhub.test` | `password` |
| Customer | `customer@bantuhub.test` | `password` |
| Provider | `provider@bantuhub.test` | `password` |

Provider demo memiliki:

- `users.status = active`
- `provider_profiles.verification_status = verified`

Data demo juga mencakup:

- Customer tambahan
- Provider verified tambahan
- Service aktif untuk Jasa Rumah, Jasa Elektronik, Jasa Kreatif Digital, dan Jasa Care & Pendampingan Non-Medis
- Booking dengan status berbeda
- Payment paid dengan fee dari `config('bantuhub.platform_fee_percent')`
- Review, complaint, dan admin notes CRM

Contoh layanan demo:

- Cleaning Rumah Harian
- Service AC 1 PK
- Install Ulang Laptop
- Desain Logo UMKM
- Pendamping Pasien Rumah Sakit Non-Medis

## Checklist Testing Manual

- Login admin dan cek dashboard, payment approval, reports, complaint, dan CRM.
- Login provider demo dan cek layanan, booking masuk, earnings, reviews, dan complaints.
- Login customer demo dan cek orders, payment status, reviews, dan complaints.
- Cek public discovery: `GET /api/categories`, `GET /api/services`, dan detail service.
- Pastikan transaksi paid menghitung platform fee sesuai config BantuHub.

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
