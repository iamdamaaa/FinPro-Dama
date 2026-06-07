import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Home, Plus, Pencil, Trash2 } from 'lucide-react';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegionPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    mode: 'add', // 'add', 'edit', 'delete'
    type: 'city', // 'city', 'district', 'village'
    parent_id: null, // used when adding district/village
    item: null, // item to edit/delete
    title: '',
  });

  const [formData, setFormData] = useState({ name: '' });
  const [formLoading, setFormLoading] = useState(false);

  const fetchCities = async () => {
    try {
      const response = await api.get('/admin/cities');
      setCities(response.data);
    } catch (err) {
      console.error('Failed to fetch cities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const closeDialog = () => {
    setDialogConfig({ ...dialogConfig, isOpen: false });
    setFormData({ name: '' });
  };

  const openAdd = (type, parent_id = null) => {
    let title = 'Tambah Kota';
    if (type === 'district') title = 'Tambah Kecamatan';
    if (type === 'village') title = 'Tambah Kelurahan';

    setDialogConfig({
      isOpen: true,
      mode: 'add',
      type,
      parent_id,
      item: null,
      title,
    });
    setFormData({ name: '' });
  };

  const openEdit = (type, item) => {
    let title = 'Edit Kota';
    if (type === 'district') title = 'Edit Kecamatan';
    if (type === 'village') title = 'Edit Kelurahan';

    setDialogConfig({
      isOpen: true,
      mode: 'edit',
      type,
      parent_id: null,
      item,
      title,
    });
    setFormData({ name: item.name });
  };

  const openDelete = (type, item) => {
    let title = 'Hapus Kota';
    if (type === 'district') title = 'Hapus Kecamatan';
    if (type === 'village') title = 'Hapus Kelurahan';

    setDialogConfig({
      isOpen: true,
      mode: 'delete',
      type,
      parent_id: null,
      item,
      title,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const { mode, type, parent_id, item } = dialogConfig;
    const endpoint = type === 'city' ? '/admin/cities' : type === 'district' ? '/admin/districts' : '/admin/villages';

    try {
      if (mode === 'add') {
        const payload = { name: formData.name };
        if (type === 'district') payload.city_id = parent_id;
        if (type === 'village') payload.district_id = parent_id;
        await api.post(endpoint, payload);
      } else if (mode === 'edit') {
        await api.put(`${endpoint}/${item.id}`, { name: formData.name });
      }
      closeDialog();
      fetchCities();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    const { type, item } = dialogConfig;
    const endpoint = type === 'city' ? '/admin/cities' : type === 'district' ? '/admin/districts' : '/admin/villages';

    try {
      await api.delete(`${endpoint}/${item.id}`);
      closeDialog();
      fetchCities();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan saat menghapus.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <h1 className="text-2xl font-semibold tracking-tight">Wilayah Layanan</h1>
        <Button onClick={() => openAdd('city')}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kota
        </Button>
      </div>

      <div className="bg-white rounded-md border border-neutral-200 shadow-sm p-4">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : cities.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            Belum ada data wilayah. Silakan tambah kota.
          </div>
        ) : (
          <Accordion type="multiple" className="w-full space-y-4">
            {cities.map((city) => (
              <AccordionItem key={`city-${city.id}`} value={`city-${city.id}`} className="border rounded-md px-4 shadow-sm">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 w-full">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-lg">{city.name}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="flex gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={() => openAdd('district', city.id)}>
                      <Plus className="w-4 h-4 mr-1" /> Tambah Kecamatan
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit('city', city)}>
                      <Pencil className="w-4 h-4 mr-1" /> Edit Kota
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => openDelete('city', city)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Hapus Kota
                    </Button>
                  </div>

                  <Accordion type="multiple" className="w-full pl-6 border-l-2 border-neutral-100 space-y-2 mt-4">
                    {(!city.districts || city.districts.length === 0) && (
                      <p className="text-sm text-neutral-400 italic mb-2">Belum ada kecamatan.</p>
                    )}
                    {city.districts && city.districts.map(district => (
                      <AccordionItem key={`dist-${district.id}`} value={`dist-${district.id}`} className="border border-neutral-100 rounded-md px-3 bg-neutral-50">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-neutral-800">{district.name}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex gap-2 mb-4 mt-2">
                            <Button variant="outline" size="sm" onClick={() => openAdd('village', district.id)}>
                              <Plus className="w-4 h-4 mr-1" /> Tambah Kelurahan
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEdit('district', district)}>
                              <Pencil className="w-4 h-4 mr-1" /> Edit Kec
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => openDelete('district', district)}>
                              <Trash2 className="w-4 h-4 mr-1" /> Hapus Kec
                            </Button>
                          </div>

                          <div className="pl-6 border-l-2 border-neutral-200 mt-4 space-y-2">
                            {(!district.villages || district.villages.length === 0) && (
                              <p className="text-sm text-neutral-400 italic">Belum ada kelurahan.</p>
                            )}
                            {district.villages && district.villages.map(village => (
                              <div key={`vill-${village.id}`} className="flex items-center justify-between p-2 bg-white border border-neutral-200 rounded-md">
                                <div className="flex items-center gap-2">
                                  <Home className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm text-neutral-700">{village.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => openEdit('village', village)} className="text-neutral-400 hover:text-blue-600 p-1">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => openDelete('village', village)} className="text-neutral-400 hover:text-red-600 p-1">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogConfig.isOpen && (dialogConfig.mode === 'add' || dialogConfig.mode === 'edit')} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogConfig.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nama</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={formLoading}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeDialog} disabled={formLoading}>Batal</Button>
              <Button type="submit" disabled={formLoading}>Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={dialogConfig.isOpen && dialogConfig.mode === 'delete'} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogConfig.title}</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-neutral-600">
            <p className="mb-2">Apakah Anda yakin ingin menghapus <strong>{dialogConfig.item?.name}</strong>?</p>
            {dialogConfig.type === 'city' && (
              <p className="text-sm text-red-600">Menghapus kota akan menghapus semua kecamatan dan kelurahan di dalamnya.</p>
            )}
            {dialogConfig.type === 'district' && (
              <p className="text-sm text-red-600">Menghapus kecamatan akan menghapus semua kelurahan di dalamnya.</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeDialog} disabled={formLoading}>Batal</Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={formLoading}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
