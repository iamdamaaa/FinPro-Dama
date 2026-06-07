import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  Truck, 
  Clock, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  ShoppingBag
} from 'lucide-react';
import api from '@/api/axios';
import { formatRp } from '@/lib/utils';

export default function LandingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDuration, setSelectedDuration] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/public/categories');
        setCategories(response.data.data || response.data);
      } catch (error) {
        console.error("Gagal memuat kategori:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAction = () => {
    const token = localStorage.getItem('customer_token');
    if (token) {
      navigate('/customer/home');
    } else {
      navigate('/customer/login');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20 md:pb-10">
      
      {/* 1. Hero Section */}
      <section className="relative pt-20 md:pt-32 pb-16 px-4 md:px-6 max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-50 text-blue-700 text-xs md:text-sm font-semibold tracking-wide border border-blue-100 mb-2 md:mb-4">
          <Sparkles className="w-4 h-4 md:w-5 md:h-5" /> Solusi Pakaian Bersih
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-neutral-950 leading-tight">
          Anjem Laundry
        </h1>
        <p className="text-neutral-500 text-base md:text-xl max-w-xl mx-auto leading-relaxed">
          Laundry antar jemput terpercaya. Hasil bersih, rapi, dan wangi tanpa perlu keluar rumah.
        </p>
        <div className="pt-4 md:pt-6">
          <Button 
            onClick={handleAction} 
            className="h-14 md:h-16 px-8 md:px-10 text-lg md:text-xl w-full sm:w-auto shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 transition-all hover:-translate-y-0.5"
          >
            Pesan Sekarang <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6" />
          </Button>
        </div>
      </section>

      {/* 2. Keunggulan Section */}
      <section className="px-4 md:px-6 max-w-5xl mx-auto py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-3 md:space-y-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm md:text-base">Durasi Fleksibel</h3>
              <p className="text-xs md:text-sm text-neutral-500 mt-1.5 md:mt-2">Pilihan 1, 2, atau 3 hari selesai.</p>
            </div>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-3 md:space-y-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm md:text-base">Antar Jemput</h3>
              <p className="text-xs md:text-sm text-neutral-500 mt-1.5 md:mt-2">Kami jemput kotor, antar bersih.</p>
            </div>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-3 md:space-y-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm md:text-base">Bersih & Rapi</h3>
              <p className="text-xs md:text-sm text-neutral-500 mt-1.5 md:mt-2">Kualitas cucian terjamin.</p>
            </div>
          </div>
          <div className="bg-white p-5 md:p-6 rounded-2xl border border-neutral-100 shadow-sm space-y-3 md:space-y-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 text-sm md:text-base">Multi Layanan</h3>
              <p className="text-xs md:text-sm text-neutral-500 mt-1.5 md:mt-2">Baju, sepatu, tas, dll.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Katalog Layanan */}
      <section className="px-4 md:px-6 max-w-5xl mx-auto py-10 md:py-16 space-y-6 md:space-y-8">
        <div className="text-center space-y-2 md:space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Katalog Layanan</h2>
          <p className="text-sm md:text-base text-neutral-500">Cek estimasi harga layanan kami</p>
        </div>

        {/* Filter Durasi */}
        <div className="max-w-md mx-auto bg-white p-2 rounded-2xl border border-neutral-200 shadow-sm flex gap-2">
          {[1, 2, 3].map((days) => (
            <button
              key={days}
              onClick={() => setSelectedDuration(days)}
              className={`flex-1 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-semibold transition-all ${
                selectedDuration === days
                  ? 'bg-neutral-900 text-white shadow-md'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
              }`}
            >
              {days} Hari
            </button>
          ))}
        </div>

        {/* Katalog List */}
        <div className="space-y-8 md:space-y-12">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10 md:py-20 text-neutral-400 border border-dashed border-neutral-300 rounded-2xl">
              Belum ada layanan.
            </div>
          ) : (
            categories.map(category => (
              <div key={category.id} className="space-y-4 md:space-y-6">
                <h3 className="font-semibold text-neutral-900 px-1 text-lg md:text-xl border-b border-neutral-100 pb-2">{category.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {category.services.map(service => {
                    const priceKey = `price_${selectedDuration}day`;
                    const currentPrice = service[priceKey];
                    const isAvailable = currentPrice !== null && currentPrice !== undefined;

                    return (
                      <div 
                        key={service.id} 
                        className={`flex items-center justify-between p-4 md:p-5 bg-white rounded-2xl border transition-all ${
                          isAvailable 
                            ? 'border-neutral-200 shadow-sm hover:shadow-md' 
                            : 'border-neutral-100 bg-neutral-50 opacity-60'
                        }`}
                      >
                        <div className="space-y-1 md:space-y-1.5">
                          <h4 className="font-medium text-neutral-900 text-sm md:text-base">{service.name}</h4>
                          <p className="text-sm md:text-base text-neutral-500 font-medium">
                            {isAvailable ? formatRp(currentPrice) : 'Tidak Tersedia'}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant={isAvailable ? "default" : "secondary"}
                          disabled={!isAvailable}
                          onClick={handleAction}
                          className="rounded-xl h-9 md:h-10 px-4 shadow-none"
                        >
                          <ShoppingBag className="w-4 h-4 md:mr-1.5 hidden md:block" /> 
                          <span className="md:hidden">Pesan</span>
                          <span className="hidden md:inline">Pesan</span>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. CTA Section */}
      <section className="px-4 md:px-6 max-w-4xl mx-auto py-12 md:py-20 text-center space-y-5">
        <div className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white space-y-4 md:space-y-6 shadow-xl shadow-blue-600/20">
          <h2 className="text-2xl md:text-4xl font-bold">Siap Mencuci?</h2>
          <p className="text-blue-100 text-sm md:text-lg max-w-lg mx-auto">
            Daftar sekarang dan nikmati kemudahan laundry antar jemput.
          </p>
          <Button 
            variant="secondary" 
            onClick={handleAction} 
            className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-12 text-blue-700 font-bold text-base md:text-lg bg-white hover:bg-neutral-50 mt-2 md:mt-4"
          >
            Mulai Pesan
          </Button>
        </div>
      </section>

    </div>
  );
}
