<?php

namespace Database\Seeders;

use App\Models\AdminNote;
use App\Models\Booking;
use App\Models\Complaint;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Role;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::query()->where('name', 'admin')->firstOrFail();
        $customerRole = Role::query()->where('name', 'customer')->firstOrFail();
        $providerRole = Role::query()->where('name', 'provider')->firstOrFail();

        $admin = User::query()->where('email', 'admin@bantuhub.test')->firstOrFail();

        $customer = $this->createCustomer($customerRole->id, 'Customer Demo', 'customer@bantuhub.test', 'Jl. Melati No. 12');
        $secondCustomer = $this->createCustomer($customerRole->id, 'Rina Customer', 'rina.customer@bantuhub.test', 'Jl. Anggrek No. 8');
        $thirdCustomer = $this->createCustomer($customerRole->id, 'Budi Customer', 'budi.customer@bantuhub.test', 'Jl. Kenanga No. 3');

        $provider = $this->createProvider($providerRole->id, 'Provider Demo', 'provider@bantuhub.test', 'BantuHub Home Care', 'Mitra demo untuk layanan rumah dan care non-medis.');
        $electronicProvider = $this->createProvider($providerRole->id, 'Tekno Service Demo', 'tekno.provider@bantuhub.test', 'Tekno Service Center', 'Mitra demo untuk elektronik dan laptop.');
        $creativeProvider = $this->createProvider($providerRole->id, 'Kreatif Studio Demo', 'kreatif.provider@bantuhub.test', 'Kreatif Studio UMKM', 'Mitra demo untuk desain dan branding digital.');

        $categories = $this->categories();

        $services = [
            'cleaning' => $this->createService($provider, $categories['Jasa Rumah'], 'Cleaning Rumah Harian', 200000, 180, 'home_service'),
            'ac' => $this->createService($electronicProvider, $categories['Jasa Elektronik'], 'Service AC 1 PK', 175000, 90, 'home_service'),
            'laptop' => $this->createService($electronicProvider, $categories['Jasa Elektronik'], 'Install Ulang Laptop', 150000, 120, 'visit_store'),
            'logo' => $this->createService($creativeProvider, $categories['Jasa Kreatif Digital'], 'Desain Logo UMKM', 350000, null, 'online_service'),
            'care' => $this->createService($provider, $categories['Jasa Care & Pendampingan Non-Medis'], 'Pendamping Pasien Rumah Sakit Non-Medis', 300000, 240, 'home_service'),
        ];

        $bookings = [
            $this->createBooking('BK-DEMO-0001', $customer, $provider, $services['cleaning'], 'paid', 1, '09:00'),
            $this->createBooking('BK-DEMO-0002', $secondCustomer, $electronicProvider, $services['ac'], 'waiting_payment', 2, '13:00'),
            $this->createBooking('BK-DEMO-0003', $customer, $electronicProvider, $services['laptop'], 'accepted', 3, '10:30'),
            $this->createBooking('BK-DEMO-0004', $thirdCustomer, $creativeProvider, $services['logo'], 'completed', -2, '15:00'),
            $this->createBooking('BK-DEMO-0005', $secondCustomer, $provider, $services['care'], 'complaint', -1, '08:00'),
        ];

        $this->createPaidPayment($bookings[0], $admin);
        $this->createPaidPayment($bookings[3], $admin);
        $this->createReviews($bookings);
        $complaint = $this->createComplaint($bookings[4], $admin);
        $this->createAdminNotes($admin, $customer, $provider, $bookings[0], $complaint);
    }

    private function createCustomer(int $roleId, string $name, string $email, string $address): User
    {
        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'role_id' => $roleId,
                'name' => $name,
                'password' => Hash::make('password'),
                'phone' => '081234567890',
                'status' => 'active',
            ]
        );

        $user->customerProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'address' => $address,
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'postal_code' => '12345',
            ]
        );

        return $user;
    }

    private function createProvider(int $roleId, string $name, string $email, string $businessName, string $bio): User
    {
        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'role_id' => $roleId,
                'name' => $name,
                'password' => Hash::make('password'),
                'phone' => '081298765432',
                'status' => 'active',
            ]
        );

        $user->providerProfile()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'business_name' => $businessName,
                'bio' => $bio,
                'address' => 'Jl. Mitra Demo No. 10',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
                'postal_code' => '12345',
                'verification_status' => 'verified',
            ]
        );

        return $user;
    }

    /**
     * @return array<string, ServiceCategory>
     */
    private function categories(): array
    {
        $names = [
            'Jasa Rumah',
            'Jasa Elektronik',
            'Jasa Kreatif Digital',
            'Jasa Care & Pendampingan Non-Medis',
        ];

        $categories = [];

        foreach ($names as $name) {
            $categories[$name] = ServiceCategory::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'is_active' => true,
                ]
            );
        }

        return $categories;
    }

    private function createService(User $provider, ServiceCategory $category, string $name, int $price, ?int $duration, string $method): Service
    {
        return Service::query()->updateOrCreate(
            [
                'provider_id' => $provider->id,
                'slug' => Str::slug($name),
            ],
            [
                'category_id' => $category->id,
                'name' => $name,
                'description' => 'Data demo untuk presentasi BantuHub.',
                'price' => $price,
                'duration_minutes' => $duration,
                'service_method' => $method,
                'image' => null,
                'status' => 'active',
            ]
        );
    }

    private function createBooking(string $code, User $customer, User $provider, Service $service, string $status, int $dayOffset, string $time): Booking
    {
        $booking = Booking::query()->updateOrCreate(
            ['booking_code' => $code],
            [
                'customer_id' => $customer->id,
                'provider_id' => $provider->id,
                'service_id' => $service->id,
                'booking_date' => now()->addDays($dayOffset)->toDateString(),
                'booking_time' => $time,
                'service_method' => $service->service_method,
                'address' => $service->service_method === 'online_service' ? null : 'Jl. Demo Booking No. 5',
                'customer_note' => 'Data booking demo untuk testing manual.',
                'status' => $status,
                'total_price' => $service->price,
            ]
        );

        if ($booking->statusLogs()->doesntExist()) {
            $booking->addStatusLog(null, 'pending', $customer->id, 'Demo booking created.');

            if ($status !== 'pending') {
                $booking->addStatusLog('pending', $status, $provider->id, 'Demo booking status prepared.');
            }
        }

        return $booking;
    }

    private function createPaidPayment(Booking $booking, User $admin): Payment
    {
        $paymentData = app(PaymentService::class)->calculateForBooking($booking);

        return $booking->payment()->updateOrCreate(
            ['booking_id' => $booking->id],
            [
                ...$paymentData,
                'payment_method' => 'manual_transfer',
                'payment_proof' => 'demo/payment-proof.jpg',
                'payment_status' => 'paid',
                'admin_note' => 'Payment demo sudah diverifikasi.',
                'paid_at' => now(),
                'verified_by' => $admin->id,
            ]
        );
    }

    /**
     * @param array<int, Booking> $bookings
     */
    private function createReviews(array $bookings): void
    {
        Review::query()->updateOrCreate(
            ['booking_id' => $bookings[0]->id],
            [
                'customer_id' => $bookings[0]->customer_id,
                'provider_id' => $bookings[0]->provider_id,
                'rating' => 5,
                'review_text' => 'Cleaning rapi dan mitra datang tepat waktu.',
            ]
        );

        Review::query()->updateOrCreate(
            ['booking_id' => $bookings[3]->id],
            [
                'customer_id' => $bookings[3]->customer_id,
                'provider_id' => $bookings[3]->provider_id,
                'rating' => 4,
                'review_text' => 'Desain logo sesuai brief UMKM.',
            ]
        );

        foreach ([$bookings[0]->provider, $bookings[3]->provider] as $provider) {
            $provider->providerProfile()->update([
                'rating_average' => round((float) Review::query()->where('provider_id', $provider->id)->avg('rating'), 2),
                'rating_count' => Review::query()->where('provider_id', $provider->id)->count(),
            ]);
        }
    }

    private function createComplaint(Booking $booking, User $admin): Complaint
    {
        return Complaint::query()->updateOrCreate(
            [
                'booking_id' => $booking->id,
                'customer_id' => $booking->customer_id,
            ],
            [
                'provider_id' => $booking->provider_id,
                'complaint_text' => 'Customer meminta follow up jadwal pendampingan.',
                'status' => 'process',
                'admin_response' => 'Admin sedang menghubungi mitra terkait.',
                'resolved_by' => $admin->id,
                'resolved_at' => null,
            ]
        );
    }

    private function createAdminNotes(User $admin, User $customer, User $provider, Booking $booking, Complaint $complaint): void
    {
        $notes = [
            ['user_id' => $customer->id, 'booking_id' => null, 'note_type' => 'customer_note', 'note' => 'Customer demo aktif untuk alur booking dan payment.'],
            ['user_id' => $provider->id, 'booking_id' => null, 'note_type' => 'provider_note', 'note' => 'Provider demo sudah verified dan siap menerima booking.'],
            ['user_id' => null, 'booking_id' => $booking->id, 'note_type' => 'booking_note', 'note' => 'Booking demo paid untuk cek transaksi dan laporan.'],
            ['user_id' => $complaint->customer_id, 'booking_id' => $complaint->booking_id, 'note_type' => 'complaint_note', 'note' => 'Complaint demo sedang dalam proses follow up.'],
        ];

        foreach ($notes as $note) {
            AdminNote::query()->updateOrCreate(
                [
                    'user_id' => $note['user_id'],
                    'booking_id' => $note['booking_id'],
                    'note_type' => $note['note_type'],
                ],
                [
                    'note' => $note['note'],
                    'created_by' => $admin->id,
                ]
            );
        }
    }
}
