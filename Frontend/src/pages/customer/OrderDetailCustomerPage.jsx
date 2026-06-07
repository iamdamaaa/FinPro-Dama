import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import { formatRp, formatDate } from '@/lib/utils';
import { statusMapping } from '@/lib/statusMapping';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Loader2, AlertTriangle, Download } from 'lucide-react';

export default function OrderDetailCustomerPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Cancel dialog state
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/customer/orders/${code}`);
        setOrder(response.data.data || response.data);
      } catch (err) {
        setError('Pesanan tidak ditemukan');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [code]);

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    
    setIsCancelling(true);
    try {
      await api.post(`/customer/orders/${code}/cancel`, { cancellation_reason: cancelReason });
      setShowCancelDialog(false);
      navigate('/customer/history');
    } catch (err) {
      console.error(err);
      setShowCancelDialog(false);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) return <div className="p-4 md:p-8 space-y-4 max-w-3xl mx-auto"><Skeleton className="h-8 w-1/3"/><Skeleton className="h-40 w-full"/><Skeleton className="h-60 w-full"/></div>;
  if (error || !order) return <div className="p-4 md:p-8 text-center text-red-500 font-medium md:text-lg">{error}</div>;

  const statusConfig = statusMapping[order.status] || { label: order.status, color: 'bg-neutral-100 text-neutral-800' };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-32 space-y-6 md:space-y-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-neutral-700" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold">Detail Pesanan</h2>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 space-y-5 md:space-y-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs md:text-sm text-neutral-500 mb-1">Order ID</div>
            <div className="font-mono font-bold text-sm md:text-lg uppercase truncate">#{order.order_code}</div>
          </div>
          <span className={`text-xs md:text-sm font-bold px-3 md:px-4 py-1.5 md:py-2 rounded-full whitespace-nowrap ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>

        <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 text-sm md:text-base">
          <div>
            <div className="text-neutral-500 mb-1 md:mb-1.5 text-xs md:text-sm font-medium">Status Bayar</div>
            <div className={`font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
              {order.payment_status === 'paid' ? 'Lunas' : 'Belum Lunas'}
            </div>
          </div>
          <div>
            <div className="text-neutral-500 mb-1 md:mb-1.5 text-xs md:text-sm font-medium">Durasi</div>
            <div className="font-bold text-neutral-900">{order.duration_days} Hari</div>
          </div>
          <div>
            <div className="text-neutral-500 mb-1 md:mb-1.5 text-xs md:text-sm font-medium">Pick Up</div>
            <div className="font-bold text-neutral-900">{formatDate(order.pickup_date)}</div>
          </div>
          <div>
            <div className="text-neutral-500 mb-1 md:mb-1.5 text-xs md:text-sm font-medium">Delivery</div>
            <div className="font-bold text-neutral-900">{formatDate(order.delivery_date)}</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 space-y-4 md:space-y-5 shadow-sm">
        <h3 className="font-bold text-neutral-900 border-b border-neutral-100 pb-3 md:text-lg">Daftar Layanan</h3>
        <div className="space-y-3 md:space-y-4">
          {order.items?.map(item => (
            <div key={item.id} className="flex justify-between items-start text-sm md:text-base">
              <div className="text-neutral-700 flex-1 pr-4">
                <span className="font-semibold text-neutral-900">{item.quantity}x</span> {item.service_name}
                <div className="text-[11px] md:text-sm text-neutral-400 mt-1 font-medium">@ {formatRp(item.price)}</div>
              </div>
              <div className="font-bold text-neutral-900 shrink-0">{formatRp(item.subtotal)}</div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-neutral-100 flex justify-between items-center font-bold">
          <span className="text-neutral-600 md:text-lg">{order.price_label}</span>
          <span className="text-blue-600 text-lg md:text-2xl">{formatRp(order.total_price)}</span>
        </div>
      </div>

      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 md:p-6 space-y-4 md:space-y-5 text-sm md:text-base shadow-sm">
        <div>
          <div className="text-neutral-500 font-semibold mb-1.5 md:mb-2 text-xs md:text-sm uppercase tracking-wide">Alamat Pengiriman</div>
          <div className="font-medium text-neutral-800 leading-relaxed bg-white p-3 md:p-4 rounded-xl border border-neutral-100 break-words">
            {order.address?.detail}, {order.address?.village_name}, {order.address?.district_name}, {order.address?.city_name}
          </div>
        </div>
        {order.note && (
          <div>
            <div className="text-neutral-500 font-semibold mb-1.5 md:mb-2 text-xs md:text-sm uppercase tracking-wide">Catatan</div>
            <div className="font-medium text-neutral-800 italic bg-white p-3 md:p-4 rounded-xl border border-neutral-100">"{order.note}"</div>
          </div>
        )}
        {order.cancellation_reason && (
          <div className="p-4 bg-red-50 text-red-800 rounded-xl mt-4 border border-red-100">
            <div className="font-bold mb-1.5 md:text-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" /> Alasan Batal:
            </div>
            <div className="leading-relaxed">{order.cancellation_reason}</div>
          </div>
        )}
      </div>

      {order.status === 'pending' && (
        <div className="pt-6">
          <Button 
            variant="destructive" 
            className="w-full h-12 md:h-14 md:text-lg font-bold bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 rounded-xl transition-colors"
            onClick={() => setShowCancelDialog(true)}
          >
            Batalkan Pesanan
          </Button>
        </div>
      )}

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md w-[95%] rounded-2xl p-5 md:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 md:text-xl">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
              Batalkan Pesanan
            </DialogTitle>
            <DialogDescription className="md:text-base">
              Yakin ingin membatalkan pesanan ini? Aksi ini tidak dapat dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <textarea
              className="w-full h-28 p-3 md:p-4 rounded-xl border border-neutral-300 text-sm md:text-base resize-none focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
              placeholder="Berikan alasan pembatalan..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter className="flex gap-3 sm:justify-between pt-2">
            <Button variant="outline" className="flex-1 h-11 md:h-12 rounded-xl" onClick={() => setShowCancelDialog(false)}>Kembali</Button>
            <Button variant="destructive" className="flex-1 h-11 md:h-12 rounded-xl font-bold" onClick={handleCancel} disabled={!cancelReason.trim() || isCancelling}>
              {isCancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ya, Batalkan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
