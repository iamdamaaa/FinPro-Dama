import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formatRp = (angka) => {
  if (angka === null || angka === undefined) return 'Tidak Tersedia';
  return `Rp ${Number(angka).toLocaleString('id-ID')}`;
};

export default function ServicePage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    price_1day: '',
    price_2day: '',
    price_3day: '',
  });

  const fetchData = async () => {
    try {
      const [svcRes, catRes] = await Promise.all([
        api.get('/admin/services'),
        api.get('/admin/categories'),
      ]);
      setServices(svcRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Gagal memuat data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    // Prepare payload (convert empty string to null for prices)
    const payload = {
      category_id: formData.category_id,
      name: formData.name,
      price_1day: formData.price_1day === '' ? null : formData.price_1day,
      price_2day: formData.price_2day === '' ? null : formData.price_2day,
      price_3day: formData.price_3day === '' ? null : formData.price_3day,
    };

    try {
      if (selectedService) {
        await api.put(`/admin/services/${selectedService.id}`, payload);
      } else {
        await api.post('/admin/services', payload);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan layanan.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await api.delete(`/admin/services/${selectedService.id}`);
      setShowDelete(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan saat menghapus layanan.');
    } finally {
      setFormLoading(false);
    }
  };

  const openAdd = () => {
    setSelectedService(null);
    setFormData({
      category_id: categories.length > 0 ? categories[0].id : '',
      name: '',
      price_1day: '',
      price_2day: '',
      price_3day: '',
    });
    setShowForm(true);
  };

  const openEdit = (svc) => {
    setSelectedService(svc);
    setFormData({
      category_id: svc.category_id,
      name: svc.name,
      price_1day: svc.price_1day === null ? '' : svc.price_1day,
      price_2day: svc.price_2day === null ? '' : svc.price_2day,
      price_3day: svc.price_3day === null ? '' : svc.price_3day,
    });
    setShowForm(true);
  };

  const openDelete = (svc) => {
    setSelectedService(svc);
    setShowDelete(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <h1 className="text-2xl font-semibold tracking-tight">Daftar Layanan</h1>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Layanan
        </Button>
      </div>

      <div className="bg-white rounded-md border border-neutral-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Layanan</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Harga (1 Hari)</TableHead>
              <TableHead className="text-right">Harga (2 Hari)</TableHead>
              <TableHead className="text-right">Harga (3 Hari)</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-neutral-500">
                  Belum ada layanan.
                </TableCell>
              </TableRow>
            ) : (
              services.map((svc) => (
                <TableRow key={svc.id}>
                  <TableCell className="font-medium text-neutral-900">{svc.name}</TableCell>
                  <TableCell>{svc.category?.name}</TableCell>
                  <TableCell className={`text-right ${svc.price_1day === null ? 'text-neutral-400 italic' : ''}`}>
                    {formatRp(svc.price_1day)}
                  </TableCell>
                  <TableCell className={`text-right ${svc.price_2day === null ? 'text-neutral-400 italic' : ''}`}>
                    {formatRp(svc.price_2day)}
                  </TableCell>
                  <TableCell className={`text-right ${svc.price_3day === null ? 'text-neutral-400 italic' : ''}`}>
                    {formatRp(svc.price_3day)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <button onClick={() => openEdit(svc)} className="text-neutral-400 hover:text-blue-600 p-2 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => openDelete(svc)} className="text-neutral-400 hover:text-red-600 p-2 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedService ? 'Edit Layanan' : 'Tambah Layanan'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nama Layanan</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Kategori</Label>
              <select
                className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                required
                disabled={formLoading}
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Harga (1 Hari)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Kosongkan jika tdk ada"
                  value={formData.price_1day}
                  onChange={(e) => setFormData({ ...formData, price_1day: e.target.value })}
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Harga (2 Hari)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Kosongkan jika tdk ada"
                  value={formData.price_2day}
                  onChange={(e) => setFormData({ ...formData, price_2day: e.target.value })}
                  disabled={formLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Harga (3 Hari)</Label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Kosongkan jika tdk ada"
                  value={formData.price_3day}
                  onChange={(e) => setFormData({ ...formData, price_3day: e.target.value })}
                  disabled={formLoading}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)} disabled={formLoading}>Batal</Button>
              <Button type="submit" disabled={formLoading}>{selectedService ? 'Simpan Perubahan' : 'Tambah'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Layanan</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-neutral-600">
            Apakah Anda yakin ingin menghapus layanan <strong>{selectedService?.name}</strong>?
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setShowDelete(false)} disabled={formLoading}>Batal</Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={formLoading}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
