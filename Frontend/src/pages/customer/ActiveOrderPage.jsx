import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { formatRp, formatDate } from '@/lib/utils';
import { statusMapping } from '@/lib/statusMapping';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';

export default function ActiveOrderPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveOrders = async () => {
    try {
      const response = await api.get('/customer/orders/active');
      setOrders(response.data.data || response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
    const interval = setInterval(fetchActiveOrders, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 max-w-5xl mx-auto pb-24 md:pb-32">
      <div className="space-y-1 md:space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">Pesanan Aktif</h2>
        <p className="text-neutral-500 text-sm md:text-base">Pantau proses laundry Anda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))
        ) : orders.length === 0 ? (
          <div className="col-span-full text-center py-16 md:py-24 space-y-3 md:space-y-4 bg-white rounded-2xl border border-dashed border-neutral-200">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <Clock className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <p className="text-neutral-500 font-medium md:text-lg">Belum ada pesanan aktif.</p>
          </div>
        ) : (
          orders.map((order) => {
            const statusConfig = statusMapping[order.status] || { label: order.status, color: 'bg-neutral-100 text-neutral-800' };
            
            return (
              <div 
                key={order.id} 
                onClick={() => navigate(`/customer/orders/${order.order_code}`)}
                className="bg-white border border-neutral-200 rounded-2xl p-4 md:p-6 space-y-4 md:space-y-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-fit"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs md:text-sm font-bold text-neutral-500 tracking-wider uppercase truncate">
                    #{order.order_code}
                  </span>
                  <span className={`text-[10px] md:text-xs font-bold px-2.5 md:px-3 py-1 rounded-full whitespace-nowrap shrink-0 ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4 text-sm md:text-base bg-neutral-50 p-3 md:p-4 rounded-xl border border-neutral-100">
                  <div>
                    <div className="text-neutral-500 text-[11px] md:text-xs mb-1 md:mb-1.5 uppercase font-semibold tracking-wide">Pick Up</div>
                    <div className="font-medium text-neutral-900">{formatDate(order.pickup_date)}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-[11px] md:text-xs mb-1 md:mb-1.5 uppercase font-semibold tracking-wide">Delivery</div>
                    <div className="font-medium text-neutral-900">{formatDate(order.delivery_date)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <div className="text-sm md:text-base">
                    <span className="text-neutral-500">{order.price_label}: </span>
                    <span className="font-bold text-blue-600">{formatRp(order.total_price)}</span>
                  </div>
                  <span className="text-xs md:text-sm font-bold text-blue-600 flex items-center group-hover:translate-x-1 transition-transform">
                    Detail <span className="ml-1">&rarr;</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}