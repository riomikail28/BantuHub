# BantuHub

BantuHub adalah marketplace jasa serba bisa berbasis web responsive yang mempertemukan customer dengan provider/mitra penyedia jasa.

## Struktur Repository

```text
bantuhub/
├── backend-api/
├── frontend-web/
├── docs/
└── README.md
```

## Stack

- Backend: Laravel REST API
- Frontend: Next.js App Router, TypeScript, Tailwind CSS
- Database: MySQL atau PostgreSQL
- Auth: Laravel Sanctum
- Fee platform: 2% dari transaksi selesai

## Akun Demo

Semua akun demo menggunakan password:

```text
password
```

| Role | Email |
| --- | --- |
| Admin | admin@bantuhub.test |
| Customer | customer@bantuhub.test |
| Provider | provider@bantuhub.test |

Provider demo memiliki `users.status = active` dan `provider_profiles.verification_status = verified`.

## Menjalankan Backend

```bash
cd backend-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

Backend berjalan di:

```text
http://127.0.0.1:8000
```

## Menjalankan Frontend

```bash
cd frontend-web
npm install
cp .env.example .env.local
npm run dev
```

Pastikan `.env.local` berisi:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Frontend berjalan di:

```text
http://localhost:3000
```

## Checklist Testing Manual

- Login admin, cek dashboard, payments, reports, dan CRM.
- Login provider, cek dashboard, services, bookings, earnings, reviews, dan complaints.
- Login customer, cari jasa, buat booking, cek order, payment, review, dan complaint.
- Cek public pages `/`, `/services`, dan `/services/{id}` di desktop dan mobile.
- Pastikan fee platform pada payment paid sesuai `config('bantuhub.platform_fee_percent')`.

## Verifikasi

Backend:

```bash
cd backend-api
php artisan migrate:fresh --seed
php artisan test
```

Frontend:

```bash
cd frontend-web
npm run build
```
