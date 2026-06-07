import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Pencil, Trash2, Plus, ArrowLeft } from 'lucide-react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { statusMapping, nextStatusMap } from '@/lib/statusMapping';
import { formatDate, formatRp } from '@/lib/utils';

export default function OrderDetailPage() {
  const { code } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [services, setServices] = useState([]);

  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    service_id: '',
    quantity: 1,
    custom_price: '',
    price: '',
  });

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/admin/orders/${code}`);
      setOrder(response.data);
    } catch (err) {
      setError('Gagal memuat detail pesanan.');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/admin/services');
      setServices(response.data);
    } catch (err) {
      console.error('Failed to fetch services', err);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchServices();
  }, [code]);

  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/admin/orders/${code}/status`, { status: newStatus });
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status.');
    }
  };

  const handlePaymentToggle = async () => {
    const newPaymentStatus = order.payment_status === 'paid' ? 'unpaid' : 'paid';
    try {
      await api.put(`/admin/orders/${code}/payment`, { payment_status: newPaymentStatus });
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah status pembayaran.');
    }
  };

  const handleDownloadInvoice = async () => {
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

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        service_id: formData.service_id,
        quantity: parseInt(formData.quantity),
      };
      if (formData.custom_price) {
        payload.custom_price = parseFloat(formData.custom_price);
      }
      await api.post(`/admin/orders/${code}/items`, payload);
      setShowAddItem(false);
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menambahkan item.');
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/orders/${code}/items/${selectedItem.id}`, {
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
      });
      setShowEditItem(false);
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah item.');
    }
  };

  const handleDeleteItem = async () => {
    try {
      await api.delete(`/admin/orders/${code}/items/${selectedItem.id}`);
      setShowDeleteConfirm(false);
      fetchOrder();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus item.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
        {error || 'Pesanan tidak ditemukan.'}
      </div>
    );
  }

  const currentStatusInfo = statusMapping[order.status] || {
    label: order.status,
    color: 'bg-neutral-100 text-neutral-800',
  };
  const nextStatuses = nextStatusMap[order.status] || [];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/dashboard"
            className="p-2 text-neutral-500 hover:text-neutral-900 bg-white rounded-full border border-neutral-200 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            Detail Pesanan {order.order_code}
          </h1>
        </div>
        <Button variant="outline" onClick={handleDownloadInvoice}>
          <Download className="w-4 h-4 mr-2" />
          Download Nota
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kolom Kiri */}
        <div className="md:col-span-2 space-y-6">
          {/* Info Pesanan */}
          <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-4">
              <h2 className="text-lg font-medium border-b border-neutral-100 pb-2">
                Informasi Pesanan
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-500">Nama Pelanggan</p>
                  <p className="font-medium text-neutral-900">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Durasi</p>
                  <p className="font-medium text-neutral-900">{order.duration_days} Hari</p>
                </div>
                <div>
                  <p className="text-neutral-500">Tanggal Pick Up</p>
                  <p className="font-medium text-neutral-900">{formatDate(order.pickup_date)}</p>
                </div>
                <div>
                  <p className="text-neutral-500">Tanggal Delivery</p>
                  <p className="font-medium text-neutral-900">{formatDate(order.delivery_date)}</p>
                </div>
              </div>
              {order.note && (
                <div className="bg-neutral-50 p-3 rounded-md border border-neutral-100 text-sm">
                  <p className="text-neutral-500 font-medium">Catatan:</p>
                  <p className="text-neutral-900">{order.note}</p>
                </div>
              )}
              {order.cancellation_reason && (
                <div className="bg-red-50 p-3 rounded-md border border-red-100 text-sm">
                  <p className="text-red-600 font-medium">Alasan Batal:</p>
                  <p className="text-red-900">{order.cancellation_reason}</p>
                </div>
              )}
            </div>
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0">
              {order.qr_base64 && (
                <>
                  <img
                    src={order.qr_base64}
                    alt="QR Code"
                    className="w-32 h-32 object-contain"
                  />
                  <span className="text-xs text-neutral-500 mt-2">
                    Scan QR untuk tracking
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Item Pesanan */}
          <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Daftar Item</h2>
              <Button
                size="sm"
                onClick={() => {
                  setFormData({ service_id: '', quantity: 1, custom_price: '' });
                  setShowAddItem(true);
                }}
              >
                <Plus className="w-4 h-4 mr-1" /> Tambah Item
              </Button>
            </div>
            <div className="border border-neutral-200 rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                    <TableHead>Layanan</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Harga Satuan</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-[100px] text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-neutral-500 py-4">
                        Belum ada item.
                      </TableCell>
                    </TableRow>
                  ) : (
                    order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.service_name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatRp(item.price)}</TableCell>
                        <TableCell className="text-right">{formatRp(item.subtotal)}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setFormData({ quantity: item.quantity, price: item.price });
                              setShowEditItem(true);
                            }}
                            className="text-neutral-400 hover:text-blue-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-neutral-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  <TableRow className="bg-neutral-50 font-semibold">
                    <TableCell colSpan={3} className="text-right">
                      {order.price_label} :
                    </TableCell>
                    <TableCell className="text-right text-lg text-blue-700">
                      {formatRp(order.total_price)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Log Status */}
          <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm">
            <h2 className="text-lg font-medium mb-4 border-b border-neutral-100 pb-2">
              Riwayat Perubahan Status
            </h2>
            {order.status_logs && order.status_logs.length > 0 ? (
              <div className="space-y-4">
                {order.status_logs.map((log, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="w-2 bg-neutral-200 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        {statusMapping[log.old_status]?.label || log.old_status}{' '}
                        &rarr;{' '}
                        <span className="text-blue-600">
                          {statusMapping[log.new_status]?.label || log.new_status}
                        </span>
                      </p>
                      <p className="text-xs text-neutral-500">
                        Oleh: {log.changed_by} &bull;{' '}
                        {new Date(log.changed_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                Belum ada riwayat perubahan status.
              </p>
            )}
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-lg font-medium border-b border-neutral-100 pb-2">
              Status Pesanan
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-500">Saat ini:</span>
              <span
                className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${currentStatusInfo.color}`}
              >
                {currentStatusInfo.label}
              </span>
            </div>
            {nextStatuses.length > 0 && (
              <div className="pt-4 space-y-2 border-t border-neutral-100 mt-4">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                  Ubah Status Menjadi:
                </p>
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((ns) => {
                    const nsInfo = statusMapping[ns];
                    const isCancel = ns === 'cancelled';
                    return (
                      <Button
                        key={ns}
                        variant={isCancel ? 'destructive' : 'default'}
                        className={!isCancel ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                        onClick={() => handleStatusChange(ns)}
                      >
                        {nsInfo.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Pembayaran */}
          <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-lg font-medium border-b border-neutral-100 pb-2">
              Pembayaran
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-neutral-500">Status:</span>
              {order.payment_status === 'paid' ? (
                <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Lunas
                </span>
              ) : (
                <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  Belum Lunas
                </span>
              )}
            </div>
            <Button variant="outline" className="w-full mt-2" onClick={handlePaymentToggle}>
              {order.payment_status === 'paid' ? 'Tandai Belum Lunas' : 'Tandai Sudah Lunas'}
            </Button>
          </div>

          {/* Data Pelanggan */}
          <div className="bg-white p-6 rounded-md border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-lg font-medium border-b border-neutral-100 pb-2">
              Data Pelanggan
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-neutral-500">Nama / No. HP</p>
                <p className="font-medium">{order.user?.name}</p>
                <p className="text-neutral-700">{order.user?.phone}</p>
              </div>
              <div>
                <p className="text-neutral-500">Email</p>
                <p className="font-medium">{order.user?.email || '-'}</p>
              </div>
              <div className="pt-2 border-t border-neutral-100">
                <p className="text-neutral-500 mb-1">Alamat Pick Up & Delivery</p>
                {order.address ? (
                  <p className="text-neutral-800 leading-relaxed">
                    {order.address.detail},<br />
                    Kel. {order.address.village_name}, Kec. {order.address.district_name},<br />
                    {order.address.city_name}
                  </p>
                ) : (
                  <p className="text-neutral-500 italic">Alamat tidak tersedia</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Tambah Item */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Item Layanan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Layanan</Label>
              <select
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={formData.service_id}
                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                required
              >
                <option value="">-- Pilih Layanan --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Harga Custom (Opsional)</Label>
              <Input
                type="number"
                min="0"
                placeholder="Biarkan kosong untuk pakai harga default"
                value={formData.custom_price}
                onChange={(e) => setFormData({ ...formData, custom_price: e.target.value })}
              />
              <p className="text-xs text-neutral-500">
                Isi jika ingin mengganti harga standar layanan
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowAddItem(false)}>
                Batal
              </Button>
              <Button type="submit">Tambah</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Item */}
      <Dialog open={showEditItem} onOpenChange={setShowEditItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item {selectedItem?.service_name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditItem} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Harga Satuan</Label>
              <Input
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowEditItem(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan Perubahan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Hapus Item */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Item</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-neutral-600">
            Apakah Anda yakin ingin menghapus{' '}
            <strong>{selectedItem?.service_name}</strong> dari pesanan ini? Total
            harga akan disesuaikan.
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Batal
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteItem}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}