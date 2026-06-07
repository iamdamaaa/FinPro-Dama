<?php

namespace App\Http\Controllers;

use App\Models\Otp;
use App\Models\User;
use App\Jobs\SendWhatsAppNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // --------------------------------------------------------
    // PRIVATE: Logika OTP — dipakai oleh semua flow
    // Mengirim atau resend OTP ke nomor telepon tertentu
    // --------------------------------------------------------
    private function handleOtpRequest(string $phone)
    {
        $otp = Otp::where('phone', $phone)->first();
        $now = now();

        if ($otp) {
            // Reset window jika sudah lebih dari 1 jam
            if ($otp->window_start->diffInMinutes($now) > 60) {
                $otp->window_start = $now;
                $otp->resend_count = 0;
            }

            if ($otp->resend_count >= 3) {
                return response()->json([
                    'message' => 'Limit request OTP tercapai. Tunggu 1 jam.'
                ], 429);
            }

            $otp->resend_count++;
            $otp->code       = rand(100000, 999999);
            $otp->expires_at = $now->copy()->addMinutes(10);
            $otp->save();
        } else {
            $otp = Otp::create([
                'phone'        => $phone,
                'code'         => rand(100000, 999999),
                'resend_count' => 1,
                'expires_at'   => $now->copy()->addMinutes(10),
                'window_start' => $now,
            ]);
        }

        SendWhatsAppNotification::dispatch(
            $phone,
            'Kode OTP Anjem Laundry Anda: ' . $otp->code
        );

        return response()->json(['message' => 'OTP telah dikirim via WhatsApp.']);
    }

    // --------------------------------------------------------
    // PRIVATE: Validasi OTP — dipakai oleh verifyOtp & adminVerifyOtp
    // Return OTP jika valid, null jika tidak
    // --------------------------------------------------------
    private function validateOtp(string $phone, string $code)
    {
        return Otp::where('phone', $phone)
                  ->where('code', $code)
                  ->where('expires_at', '>', now())
                  ->first();
    }

    // ========================================================
    // CUSTOMER — Register
    // POST /api/auth/register
    // Body: { name, email, phone }
    // Alur: kirim OTP dulu, user belum dibuat
    // ========================================================
    public function register(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'phone' => 'required|string|unique:users,phone',
        ]);

        return $this->handleOtpRequest($request->phone);
    }

    // ========================================================
    // CUSTOMER — Login
    // POST /api/auth/login
    // Body: { phone }
    // ========================================================
    public function login(Request $request)
    {
        $request->validate(['phone' => 'required|string']);

        $user = User::where('phone', $request->phone)
                    ->where('role', 'customer')
                    ->first();

        if (!$user) {
            return response()->json([
                'message' => 'Nomor telepon belum terdaftar.'
            ], 404);
        }

        return $this->handleOtpRequest($request->phone);
    }

    // ========================================================
    // CUSTOMER — Verifikasi OTP (Register & Login jadi satu)
    // POST /api/auth/verify-otp
    // Body: { phone, code, name?, email? }
    // ========================================================
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'code'  => 'required|string',
            'name'  => 'nullable|string|max:255',
            'email' => 'nullable|email',
        ]);

        $otp = $this->validateOtp($request->phone, $request->code);

        if (!$otp) {
            return response()->json([
                'message' => 'OTP tidak valid atau kadaluwarsa.'
            ], 400);
        }

        $user = User::where('phone', $request->phone)
                    ->where('role', 'customer') // ← pastikan hanya customer
                    ->first();

        if (!$user) {
            // Alur register — buat user baru
            if (!$request->name) {
                return response()->json([
                    'message' => 'Nama wajib diisi saat pendaftaran.'
                ], 400);
            }
            if (!$request->email) {
                return response()->json([
                    'message' => 'Email wajib diisi saat pendaftaran.'
                ], 400);
            }

            $user = User::create([
                'name'     => $request->name,
                'email'    => $request->email,
                'phone'    => $request->phone,
                'role'     => 'customer',
                'password' => Hash::make(Str::random(32)),
            ]);
        }

        // Hapus OTP yang sudah dipakai
        $otp->delete();

        $token = $user->createToken('customer_web')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user,
        ]);
    }

    // ========================================================
    // ADMIN — Request OTP
    // POST /api/auth/admin/request-otp
    // Body: { phone }
    // Hanya bisa request OTP jika nomor terdaftar sebagai admin
    // ========================================================
    public function adminRequestOtp(Request $request)
    {
        $request->validate(['phone' => 'required|string']);

        // Pastikan nomor ini memang terdaftar sebagai admin
        // Kalau customer coba pakai endpoint ini → ditolak
        $admin = User::where('phone', $request->phone)
                     ->where('role', 'admin')
                     ->first();

        if (!$admin) {
            return response()->json([
                'message' => 'Nomor telepon tidak terdaftar sebagai admin.'
            ], 404);
        }

        return $this->handleOtpRequest($request->phone);
    }

    // ========================================================
    // ADMIN — Verifikasi OTP
    // POST /api/auth/admin/verify-otp
    // Body: { phone, code }
    // ========================================================
    public function adminVerifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'code'  => 'required|string',
        ]);

        $otp = $this->validateOtp($request->phone, $request->code);

        if (!$otp) {
            return response()->json([
                'message' => 'OTP tidak valid atau kadaluwarsa.'
            ], 400);
        }

        // Double check — pastikan benar-benar admin
        // Ini lapisan kedua keamanan selain adminRequestOtp
        $admin = User::where('phone', $request->phone)
                     ->where('role', 'admin')
                     ->first();

        if (!$admin) {
            return response()->json([
                'message' => 'Akses ditolak.'
            ], 403);
        }

        // Hapus OTP yang sudah dipakai
        $otp->delete();

        $token = $admin->createToken('admin_dashboard')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $admin,
        ]);
    }
}