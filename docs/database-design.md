# Rancangan Database Awal

Dokumen ini mencatat rancangan database tahap awal untuk BantuHub. Fokus saat ini adalah fondasi auth, role, profil customer/provider, dan kategori jasa.

## Tabel

### roles

Menyimpan role aplikasi.

- `id`
- `name` unik: `admin`, `customer`, `provider`
- `display_name`
- `timestamps`

### users

Menyimpan akun utama untuk semua role.

- `id`
- `role_id`
- `name`
- `email` unik
- `email_verified_at`
- `password`
- `phone` nullable
- `status`: `active`, `inactive`, `suspended`
- `remember_token`
- `timestamps`

### customer_profiles

Data khusus customer.

- `id`
- `user_id` unik
- `address` nullable
- `city` nullable
- `province` nullable
- `postal_code` nullable
- `timestamps`

### provider_profiles

Data khusus mitra/provider.

- `id`
- `user_id` unik
- `business_name` nullable
- `bio` nullable
- `address` nullable
- `city` nullable
- `province` nullable
- `postal_code` nullable
- `verification_status`: `pending`, `verified`, `rejected`
- `rating_average`
- `rating_count`
- `timestamps`

### service_categories

Master kategori jasa.

- `id`
- `name`
- `slug` unik
- `description` nullable
- `is_active`
- `timestamps`

### provider_service_category

Relasi many-to-many provider dengan kategori jasa.

- `id`
- `provider_profile_id`
- `service_category_id`
- `timestamps`
- unik gabungan `provider_profile_id`, `service_category_id`

## Catatan Transaksi

Fee platform ditetapkan 2% dari transaksi selesai. Tabel booking, order, payment, dan platform fee sengaja belum dibuat pada tahap ini karena alur booking belum diimplementasikan.
