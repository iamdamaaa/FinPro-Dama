import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/admin/request-otp', { phone });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat meminta OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/admin/verify-otp', { phone, code });
      login(response.data.token, response.data.user);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Kode OTP tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg border border-neutral-200 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
            Anjem Laundry Admin
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            Silakan login untuk mengakses dashboard
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                type="text"
                placeholder="08xxxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Meminta OTP...' : 'Kirim OTP'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Kode OTP</Label>
              <Input
                id="code"
                type="text"
                placeholder="Masukkan 6 digit kode"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Memverifikasi...' : 'Verifikasi OTP'}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCode('');
                setError('');
              }}
              className="w-full mt-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Ganti Nomor
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
