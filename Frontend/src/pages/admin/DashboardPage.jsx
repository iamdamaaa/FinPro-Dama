import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Download, Bell } from 'lucide-react';
import api from '@/api/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { statusMapping } from '@/lib/statusMapping';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [badgeCount, setBadgeCount] = useState(0);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders');
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat pesanan.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBadgeCount = async () => {
    try {
      const response = await api.get('/admin/orders/badge-count');
      setBadgeCount(response.data.count);
    } catch (err) {
      console.error('Failed to fetch badge count', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchBadgeCount();
    const interval = setInterval(fetchBadgeCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadInvoice = async (code) => {
    try {
      const response = await api.get(`/admin/orders/${code}/invoice`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Nota-${code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Gagal mengunduh nota.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <h1 className="text-2xl font-semibold tracking-tight">Daftar Pesanan</h1>
        <div className="relative">
          <Bell className="w-6 h-6 text-neutral-600" />
          {badgeCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              {badgeCount}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-md border border-neutral-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 text-center">QR Code</TableHead>
              <TableHead>ID Order</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Pick Up</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Alamat (Kec)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="w-10 h-10 rounded-sm" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-neutral-500">
                  Belum ada data pesanan.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const statusInfo = statusMapping[order.status] || {
                  label: order.status,
                  color: 'bg-neutral-100 text-neutral-800',
                };
                return (
                  <TableRow key={order.id}>
                    <TableCell className="p-2 text-center">
                      {order.qr_base64 && (
                        <img
                          src={order.qr_base64}
                          alt={`QR ${order.order_code}`}
                          className="w-[60px] h-[60px] object-contain mx-auto border border-neutral-100"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-blue-600 hover:underline">
                      <Link to={`/admin/orders/${order.order_code}`}>
                        {order.order_code}
                      </Link>
                    </TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{formatDate(order.pickup_date)}</TableCell>
                    <TableCell>{formatDate(order.delivery_date)}</TableCell>
                    <TableCell>{order.district_name}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Download Nota"
                        onClick={() => handleDownloadInvoice(order.order_code)}
                      >
                        <Download className="w-4 h-4 text-neutral-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}