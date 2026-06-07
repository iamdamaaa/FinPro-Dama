import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { User, MapPin, LogOut, CheckCircle2, Trash2, Edit2, Loader2, Plus } from 'lucide-react';
import api from '@/api/axios';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(JSON.parse(localStorage.getItem('customer_user') || '{}'));
  const [name, setName] = useState(customer.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [addresses, setAddresses] = useState([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Address Modal States
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isEditingAddr, setIsEditingAddr] = useState(false);
  const [editAddrId, setEditAddrId] = useState(null);
  
  const [regions, setRegions] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [isSavingAddr, setIsSavingAddr] = useState(false);

  useEffect(() => {
    fetchAddresses();
    fetchRegions();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/customer/addresses');
      setAddresses(response.data.data || response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await api.get('/customer/regions');
      setRegions(response.data.data || response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsUpdatingProfile(true);
    setProfileMsg('');
    try {
      const response = await api.put('/customer/profile', { name });
      const updatedUser = response.data.user || response.data.data;
      if (updatedUser) {
        localStorage.setItem('customer_user', JSON.stringify(updatedUser));
        setCustomer(updatedUser);
      }
      setProfileMsg('Profil berhasil diperbarui');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileMsg('Gagal memperbarui profil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    navigate('/customer/login');
  };

  const setPrimary = async (id) => {
    try {
      await api.put(`/customer/addresses/${id}/primary`);
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAddress = async (id) => {
    if (!confirm('Yakin ingin menghapus alamat ini?')) return;
    try {
      await api.delete(`/customer/addresses/${id}`);
      fetchAddresses();
    } catch (err) {
      alert('Gagal menghapus alamat');
    }
  };

  const openAddModal = () => {
    setIsEditingAddr(false);
    setEditAddrId(null);
    setSelectedCityId('');
    setSelectedDistrictId('');
    setSelectedVillageId('');
    setAddressDetail('');
    setShowAddressModal(true);
  };

  const openEditModal = (addr) => {
    setIsEditingAddr(true);
    setEditAddrId(addr.id);
    setSelectedCityId('');
    setSelectedDistrictId('');
    setSelectedVillageId('');
    setAddressDetail(addr.detail);
    setShowAddressModal(true);
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    setIsSavingAddr(true);
    try {
      if (isEditingAddr) {
        const payload = { detail: addressDetail };
        if (selectedVillageId) payload.village_id = selectedVillageId;
        await api.put(`/customer/addresses/${editAddrId}`, payload);
      } else {
        await api.post('/customer/addresses', {
          village_id: selectedVillageId,
          detail: addressDetail,
          is_primary: addresses.length === 0
        });
      }
      setShowAddressModal(false);
      fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan alamat');
    } finally {
      setIsSavingAddr(false);
    }
  };

  const selectedCity = regions.find(c => c.id == selectedCityId);
  const districts = selectedCity ? selectedCity.districts || [] : [];
  const selectedDistrict = districts.find(d => d.id == selectedDistrictId);
  const villages = selectedDistrict ? selectedDistrict.villages || [] : [];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 md:space-y-12 pb-24 md:pb-32 max-w-5xl mx-auto">
      {/* Profil Section */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex items-center gap-3 border-b border-neutral-100 pb-3">
          <User className="text-blue-600 w-6 h-6 md:w-7 md:h-7" />
          <h2 className="text-xl md:text-2xl font-bold">Profil Saya</h2>
        </div>

        <form onSubmit={handleUpdateProfile} className="max-w-2xl bg-white p-5 md:p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-5 md:space-y-6">
          <div className="space-y-2 md:space-y-3">
            <Label className="text-sm md:text-base">Nama Lengkap</Label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="h-11 md:h-12 text-base rounded-xl"
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label className="text-sm md:text-base">Nomor WhatsApp</Label>
            <Input 
              value={customer.phone || ''} 
              disabled 
              className="h-11 md:h-12 text-base rounded-xl bg-neutral-50 text-neutral-500 cursor-not-allowed"
            />
            <p className="text-xs md:text-sm text-neutral-400">Nomor telepon tidak dapat diubah</p>
          </div>
          
          <Button type="submit" disabled={isUpdatingProfile} className="w-full sm:w-auto px-8 h-11 md:h-12 rounded-xl text-base font-semibold">
            {isUpdatingProfile ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Simpan Perubahan'}
          </Button>

          {profileMsg && (
            <div className={`text-sm md:text-base font-medium ${profileMsg.includes('Gagal') ? 'text-red-500' : 'text-green-600'}`}>
              {profileMsg}
            </div>
          )}
        </form>
      </section>

      {/* Alamat Section */}
      <section className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-3">
            <MapPin className="text-blue-600 w-6 h-6 md:w-7 md:h-7" />
            <h2 className="text-xl md:text-2xl font-bold">Alamat Tersimpan</h2>
          </div>
          <button onClick={openAddModal} className="p-2 md:px-4 md:py-2 flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors font-medium text-sm md:text-base">
            <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Tambah Alamat</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {isLoadingAddresses ? (
            <div className="col-span-full text-center text-sm md:text-base text-neutral-400 py-6">Memuat alamat...</div>
          ) : addresses.length === 0 ? (
            <div className="col-span-full text-center text-sm md:text-base text-neutral-400 py-10 md:py-16 bg-white border border-dashed border-neutral-200 rounded-2xl">Belum ada alamat tersimpan.</div>
          ) : (
            addresses.map(addr => (
              <div key={addr.id} className="flex flex-col bg-white p-4 md:p-6 rounded-2xl border border-neutral-200 shadow-sm space-y-4 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 leading-snug break-words md:text-lg">{addr.detail}</p>
                    <p className="text-xs md:text-sm text-neutral-500 break-words leading-relaxed">{addr.village_name}, {addr.district_name}, {addr.city_name}</p>
                  </div>
                  {addr.is_primary && (
                    <span className="shrink-0 bg-blue-100 text-blue-700 text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" /> Utama
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-2 md:gap-3 pt-4 border-t border-neutral-100 mt-auto">
                  {!addr.is_primary && (
                    <Button variant="outline" size="sm" className="h-9 md:h-10 text-xs md:text-sm rounded-lg flex-1" onClick={() => setPrimary(addr.id)}>
                      Jadikan Utama
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="h-9 md:h-10 w-12 md:w-14 shrink-0 text-neutral-600 rounded-lg" onClick={() => openEditModal(addr)}>
                    <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-9 md:h-10 w-12 md:w-14 shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg border-red-100" onClick={() => deleteAddress(addr.id)}>
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Logout */}
      <section className="pt-8 md:pt-12 max-w-sm">
        <Button variant="destructive" className="w-full font-bold bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 shadow-none h-12 md:h-14 rounded-xl text-base" onClick={handleLogout}>
          <LogOut className="w-5 h-5 mr-2" /> Keluar Akun
        </Button>
      </section>

      {/* Dialog Alamat */}
      <Dialog open={showAddressModal} onOpenChange={setShowAddressModal}>
        <DialogContent className="sm:max-w-xl w-[95%] rounded-2xl p-5 md:p-6 lg:p-8">
          <DialogHeader>
            <DialogTitle className="md:text-xl">{isEditingAddr ? 'Edit Alamat' : 'Tambah Alamat Baru'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={saveAddress} className="space-y-5 md:space-y-6 pt-2">
            {isEditingAddr && (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-800 text-xs md:text-sm">
                Kosongkan pilihan wilayah jika hanya ingin mengubah detail alamat.
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <select 
                className="w-full h-11 md:h-12 px-3 md:px-4 rounded-xl border border-neutral-300 text-sm md:text-base bg-white"
                value={selectedCityId} onChange={(e) => { setSelectedCityId(e.target.value); setSelectedDistrictId(''); setSelectedVillageId(''); }}
                required={!isEditingAddr}
              >
                <option value="">Pilih Kota</option>
                {regions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select 
                className="w-full h-11 md:h-12 px-3 md:px-4 rounded-xl border border-neutral-300 text-sm md:text-base bg-white disabled:opacity-50"
                value={selectedDistrictId} onChange={(e) => { setSelectedDistrictId(e.target.value); setSelectedVillageId(''); }}
                disabled={!selectedCityId}
                required={!isEditingAddr && !!selectedCityId}
              >
                <option value="">Pilih Kecamatan</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>

              <select 
                className="w-full h-11 md:h-12 px-3 md:px-4 rounded-xl border border-neutral-300 text-sm md:text-base bg-white disabled:opacity-50 md:col-span-2"
                value={selectedVillageId} onChange={(e) => setSelectedVillageId(e.target.value)}
                disabled={!selectedDistrictId}
                required={!isEditingAddr && !!selectedDistrictId}
              >
                <option value="">Pilih Kelurahan</option>
                {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>

              <textarea
                placeholder="Detail alamat (Jalan, Blok, No Rumah)"
                className="w-full h-24 md:h-28 p-3 md:p-4 rounded-xl border border-neutral-300 text-sm md:text-base bg-white resize-none md:col-span-2 focus:ring-2 focus:ring-blue-600 outline-none"
                value={addressDetail} onChange={(e) => setAddressDetail(e.target.value)}
                required
              />
            </div>

            <DialogFooter className="flex gap-3 sm:justify-end pt-2">
              <Button type="button" variant="outline" className="flex-1 sm:flex-none sm:w-32 h-11 md:h-12 rounded-xl" onClick={() => setShowAddressModal(false)}>Batal</Button>
              <Button type="submit" className="flex-1 sm:flex-none sm:w-32 h-11 md:h-12 rounded-xl font-bold" disabled={isSavingAddr}>
                {isSavingAddr ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
