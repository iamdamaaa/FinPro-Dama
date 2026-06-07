import React, { useState, useEffect } from 'react';
import { Plus, Check } from 'lucide-react';
import api from '@/api/axios';
import { formatRp } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage({ cart }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  
  const customerUser = JSON.parse(localStorage.getItem('customer_user') || '{}');
  const nama = customerUser.name || 'Pelanggan';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/public/categories');
        setCategories(response.data.data || response.data);
      } catch (error) {
        console.error("Gagal memuat kategori", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleAddItem = (service) => {
    if (!cart.duration) {
      showToast("Pilih durasi pengerjaan terlebih dahulu");
      return;
    }
    
    const priceKey = `price_${cart.duration}day`;
    if (service[priceKey] === null || service[priceKey] === undefined) {
      showToast("Durasi layanan ini tidak tersedia");
      return;
    }

    cart.addItem(service, cart.duration);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 relative max-w-4xl mx-auto pb-24 md:pb-32">
      <div className="space-y-1 md:space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">Halo, {nama}! 👋</h2>
        <p className="text-neutral-500 text-sm md:text-base">Mau cuci apa hari ini?</p>
      </div>

      <div className="space-y-3 md:space-y-4">
        <h3 className="font-semibold text-neutral-900 md:text-lg">Pilih Durasi Pengerjaan</h3>
        <div className="flex gap-2 md:gap-4 max-w-md">
          {[1, 2, 3].map(days => (
            <button
              key={days}
              onClick={() => cart.setDuration(days)}
              className={`flex-1 py-3 md:py-3.5 rounded-xl border text-sm md:text-base font-semibold transition-all ${
                cart.duration === days
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-105'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-blue-300'
              }`}
            >
              {days} Hari
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 md:space-y-10">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 md:py-20 text-neutral-500 bg-white rounded-2xl border border-dashed border-neutral-200">
            Belum ada layanan yang tersedia.
          </div>
        ) : (
          categories.map(category => (
            <div key={category.id} className="space-y-3 md:space-y-4">
              <h3 className="font-semibold text-neutral-900 md:text-xl border-b border-neutral-100 pb-2">{category.name}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-5">
                {category.services.map(service => {
                  const currentPrice = cart.duration ? service[`price_${cart.duration}day`] : service.price_1day;
                  const isAvailable = cart.duration ? (service[`price_${cart.duration}day`] !== null) : true;
                  const itemInCart = cart.items.find(item => item.service_id === service.id);

                  return (
                    <div 
                      key={service.id} 
                      className={`flex items-center justify-between p-4 md:p-5 bg-white rounded-2xl border transition-all ${
                        isAvailable ? 'border-neutral-200 shadow-sm hover:shadow-md' : 'border-neutral-100 opacity-60 bg-neutral-50'
                      }`}
                    >
                      <div className="space-y-1 md:space-y-1.5">
                        <h4 className="font-medium text-neutral-900 text-base md:text-lg">{service.name}</h4>
                        <p className="text-sm md:text-base text-neutral-500 font-medium">
                          {cart.duration ? (
                            isAvailable ? formatRp(currentPrice) : 'Tidak Tersedia'
                          ) : (
                            'Pilih durasi untuk harga'
                          )}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddItem(service)}
                        disabled={!isAvailable && cart.duration}
                        className={`relative flex shrink-0 items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transition-colors ${
                          itemInCart 
                            ? 'bg-blue-100 text-blue-600'
                            : isAvailable 
                              ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200' 
                              : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                        }`}
                      >
                        {itemInCart ? <Check className="w-6 h-6 md:w-7 md:h-7" /> : <Plus className="w-6 h-6 md:w-7 md:h-7" />}
                        {itemInCart && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] md:text-xs font-bold text-white shadow-sm ring-2 ring-white">
                            {itemInCart.quantity}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {toastMsg && (
        <div className="fixed bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 bg-neutral-800 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium shadow-xl z-50 whitespace-nowrap animate-in fade-in slide-in-from-bottom-4">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
