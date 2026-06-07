import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { formatRp, formatDate } from '@/lib/utils';
import { statusMapping } from '@/lib/statusMapping';
import { Skeleton } from '@/components/ui/skeleton';
import { History as HistoryIcon } from 'lucide-react';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/customer/orders/history');
        setOrders(response.data.data || response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 max-w-5xl mx-auto pb-24 md:pb-32">
      <div className="space-y-1 md:space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">Riwayat Pesanan</h2>
        <p className="text-neutral-500 text-sm md:text-base">Pesanan yang sudah selesai atau dibatalkan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 md:h-36 w-full rounded-2xl" />
          ))
        ) : orders.length === 0 ? (
          <div className="col-span-full text-center py-16 md:py-24 space-y-3 md:space-y-4 bg-white border border-dashed border-neutral-200 rounded-2xl">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
              <HistoryIcon className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <p className="text-neutral-500 font-medium md:text-lg">Belum ada riwayat pesanan.</p>
          </div>
        ) : (
          orders.map((order) => {
            const statusConfig = statusMapping[order.status] || { label: order.status, color: 'bg-neutral-100 text-neutral-800' };
            const isCancelled = order.status === 'cancelled';
            
            return (
              <div 
                key={order.id} 
                onClick={() => navigate(`/customer/orders/${order.order_code}`)}
                className={`border rounded-2xl p-4 md:p-5 space-y-3 md:space-y-4 shadow-sm hover:shadow-md transition-all cursor-pointer h-fit ${
                  isCancelled ? 'bg-neutral-50 border-neutral-200 opacity-80 hover:opacity-100' : 'bg-white border-neutral-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs md:text-sm font-bold text-neutral-500 uppercase truncate">#{order.order_code}</div>
                    <div className="text-[11px] md:text-xs text-neutral-500 mt-1">{formatDate(order.pickup_date)}</div>
                  </div>
                  <span className={`text-[10px] md:text-xs font-bold px-2 md:px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                <div className="flex items-end justify-between pt-3 md:pt-4 border-t border-neutral-100">
                  <div>
                    <div className="text-[10px] md:text-xs text-neutral-500 uppercase tracking-wide font-semibold mb-1">Total Bayar</div>
                    <div className={`font-bold md:text-lg ${isCancelled ? 'text-neutral-600 line-through' : 'text-neutral-900'}`}>
                      {formatRp(order.total_price)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-[11px] md:text-xs font-bold px-2 py-1 rounded-md ${order.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                      {order.payment_status === 'paid' ? 'Lunas' : 'Belum Lunas'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
