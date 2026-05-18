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

Semua akun demo menggunakan password `password`.

| Role | Email |
| --- | --- |
| Admin | `admin@bantuhub.test` |
| Customer | `customer@bantuhub.test` |
| Provider | `provider@bantuhub.test` |

Provider demo memiliki `users.status = active` dan `provider_profiles.verification_status = verified`.

## Menjalankan Backend Lokal

```bash
cd backend-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

Backend lokal berjalan di `http://127.0.0.1:8000`.

## Menjalankan Frontend Lokal

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

Frontend lokal berjalan di `http://localhost:3000`.

## Deployment Hemat

Target deployment yang disarankan:

- Frontend Next.js: Vercel
- Backend Laravel API: Render, Railway, atau VPS kecil
- Database production: PostgreSQL/MySQL cloud dari provider hosting

Jangan commit file `.env` asli. Gunakan environment variables dari dashboard hosting.

### Deploy Frontend ke Vercel

1. Import repository ke Vercel.
2. Set Root Directory ke `frontend-web`.
3. Set Build Command:

```bash
npm run build
```

4. Set environment variable production:

```env
NEXT_PUBLIC_API_URL=https://domain-backend-anda/api
```

5. Deploy, lalu catat domain frontend, misalnya:

```text
https://bantuhub.vercel.app
```

### Deploy Backend Laravel

Gunakan root project `backend-api` di Render/Railway/VPS.

Build/install command:

```bash
composer install --no-dev --optimize-autoloader
```

Start command untuk hosting yang mendukung PHP process:

```bash
php artisan serve --host=0.0.0.0 --port=$PORT
```

Untuk VPS/Nginx/Apache, arahkan document root ke:

```text
backend-api/public
```

Set environment variable production minimal:

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

Jika memakai MySQL, gunakan:

```env
DB_CONNECTION=mysql
DB_PORT=3306
```

Generate `APP_KEY` di server:

```bash
php artisan key:generate --show
```

### Migrate dan Seed Production

Untuk demo/presentasi, jalankan:

```bash
php artisan migrate --force
php artisan db:seed --force
```

Untuk reset database demo dari nol:

```bash
php artisan migrate:fresh --seed --force
```

Gunakan `migrate:fresh` hanya jika aman menghapus data production.

### Optimize Backend Production

Setelah env final:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Jika env berubah, jalankan:

```bash
php artisan optimize:clear
php artisan config:cache
```

Pastikan folder berikut writable oleh runtime:

```text
storage/
bootstrap/cache/
```

### Testing Setelah Deploy

Backend:

- Buka `GET https://domain-backend-anda/api/health`.
- Login admin via frontend.
- Cek admin dashboard, payments, reports, dan CRM.
- Login provider demo, cek services, bookings, earnings, reviews, complaints.
- Login customer demo, cek service discovery, orders, payment, review, complaint.

Frontend:

- Buka `/`, `/services`, `/login`, `/register`.
- Pastikan `NEXT_PUBLIC_API_URL` mengarah ke backend production.
- Pastikan CORS tidak memblokir request API dari domain Vercel.

## Checklist Testing Manual

- Login admin, cek dashboard, payments, reports, dan CRM.
- Login provider, cek dashboard, services, bookings, earnings, reviews, dan complaints.
- Login customer, cari jasa, buat booking, cek order, payment, review, dan complaint.
- Cek public pages `/`, `/services`, dan `/services/{id}` di desktop dan mobile.
- Pastikan fee platform pada payment paid sesuai `config('bantuhub.platform_fee_percent')`.

## Verifikasi Lokal

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
