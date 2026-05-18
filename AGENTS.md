# AGENTS.md

## Project

BantuHub

## Deskripsi

BantuHub adalah marketplace jasa serba bisa yang mempertemukan customer dengan mitra penyedia jasa.

## Stack

- Backend: Laravel REST API
- Frontend: Next.js / React
- Database: MySQL atau PostgreSQL
- Auth: Laravel Sanctum
- Fee platform: 2% dari transaksi selesai

## Aturan Coding

1. Gunakan struktur kode yang rapi dan mudah dikembangkan.
2. Backend harus berbentuk REST API, bukan Laravel Blade.
3. Semua endpoint private wajib menggunakan authentication.
4. Gunakan role: `admin`, `customer`, `provider`.
5. Jangan hardcode data penting.
6. Gunakan validation request untuk input penting.
7. Gunakan migration dan seeder untuk database.
8. Gunakan nama tabel dan kolom berbahasa Inggris.
9. Gunakan status yang konsisten.
10. Setiap perubahan status booking harus dicatat di `booking_status_logs`.

## Status Booking

- `pending`
- `accepted`
- `rejected`
- `on_the_way`
- `arrived_at_location`
- `in_progress`
- `waiting_payment`
- `paid`
- `completed`
- `cancelled`
- `complaint`

## Metode Layanan

- `home_service`
- `visit_store`
- `online_service`

## Catatan Domain

Kategori Care & Pendampingan harus dianggap sebagai layanan non-medis, bukan layanan tindakan medis.
