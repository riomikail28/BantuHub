# BantuHub Frontend Web

Next.js App Router frontend untuk BantuHub.

## Setup

```bash
cd frontend-web
npm install
cp .env.example .env.local
npm run dev
```

Default API URL:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Frontend lokal berjalan di:

```text
http://localhost:3000
```

## Akun Demo

Jalankan backend dengan `php artisan migrate:fresh --seed`, lalu gunakan akun berikut:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@bantuhub.test` | `password` |
| Customer | `customer@bantuhub.test` | `password` |
| Provider | `provider@bantuhub.test` | `password` |

## Fitur Tahap Awal

- Homepage
- Login
- Register customer
- Register provider
- Public service list
- Public service detail
- Redirect dashboard berdasarkan role
- Role-based layout untuk admin, customer, dan provider

## Admin Frontend

Halaman admin yang sudah terhubung ke Laravel API:

- `/admin/dashboard` menggunakan `GET /api/admin/dashboard`
- `/admin/categories` menggunakan CRUD `/api/admin/categories`
- `/admin/providers` menggunakan `/api/admin/providers` dan aksi approve/reject/suspend

Pastikan login sebagai user dengan role `admin`. Token disimpan di `localStorage` untuk tahap MVP.

## Checklist Testing Manual

- `/` tampil baik di desktop dan mobile.
- `/services` bisa filter kategori, metode layanan, harga minimum/maksimum, dan keyword.
- `/services/[id]` menampilkan detail layanan dan modal booking untuk customer login.
- `/customer/orders` menampilkan detail booking, payment, review, dan complaint.
- `/provider/bookings` menampilkan detail booking dan aksi update status.
- `/admin/dashboard`, `/admin/payments`, dan `/admin/reports` menampilkan data dari API.

## Verifikasi

```bash
npm run build
```
