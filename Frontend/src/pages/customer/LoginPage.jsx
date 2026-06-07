import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import api from '@/api/axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 Data
  const [phone, setPhone] = useState('');

  // Step 2 Data
  const [otp, setOtp] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError('Nomor telepon wajib diisi');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/login', { phone });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Nomor telepon tidak ditemukan. Silakan daftar terlebih dahulu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.length < 6) {
      setError('Kode OTP harus 6 digit');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { phone, code: otp });

      const { token, user } = response.data;
      localStorage.setItem('customer_token', token);
      localStorage.setItem('customer_user', JSON.stringify(user));
      navigate('/customer/home');

    } catch (err) {
      setError(err.response?.data?.message || 'Kode OTP salah atau kedaluwarsa');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-md mx-auto space-y-6 md:space-y-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-neutral-100">

        <div className="space-y-2 text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {step === 1 ? 'Masuk ke Akun' : 'Verifikasi OTP'}
          </h1>
          <p className="text-sm md:text-base text-neutral-500">
            {step === 1
              ? 'Masukkan nomor WhatsApp Anda untuk masuk'
              : `Kode OTP telah dikirim ke ${phone}`
            }
          </p>
        </div>

        {error && (
          <div className="p-3 md:p-4 text-sm text-red-500 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
            <div className="space-y-2 md:space-y-3">
              <Label htmlFor="phone" className="text-sm md:text-base">Nomor WhatsApp</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isLoading}
                className="h-11 md:h-12 w-full text-base"
              />
            </div>

            <Button type="submit" className="w-full h-11 md:h-12 text-base md:text-lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mengirim OTP...
                </>
              ) : (
                'Kirim OTP'
              )}
            </Button>

            <p className="text-center text-sm md:text-base text-neutral-500 pt-2 md:pt-3">
              Belum punya akun?{' '}
              <Link to="/customer/register" className="text-neutral-900 hover:underline font-medium">
                Daftar di sini
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4 md:space-y-5">
            <div className="space-y-2 md:space-y-3">
              <Label htmlFor="otp" className="text-sm md:text-base">Kode OTP (6 Digit)</Label>
              <Input
                id="otp"
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={isLoading}
                className="h-12 md:h-14 text-center tracking-[0.5em] font-mono text-lg md:text-xl w-full"
              />
            </div>

            <Button type="submit" className="w-full h-11 md:h-12 text-base md:text-lg" disabled={isLoading || otp.length < 6}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Verifikasi OTP'
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full h-11 md:h-12 text-base md:text-lg text-neutral-500"
              onClick={() => {
                setStep(1);
                setOtp('');
                setError('');
              }}
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Ganti Nomor
            </Button>
          </form>
        )}

      </div>
    </div>
  );
}
