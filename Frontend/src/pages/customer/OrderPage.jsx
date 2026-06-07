import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, ArrowLeft, ArrowRight, CheckCircle2, Loader2, MapPin, Plus } from 'lucide-react';
import api from '@/api/axios';
import { formatRp, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrderPage({ cart }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 2 State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [note, setNote] = useState('');

  // Add new address state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [regions, setRegions] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');
  const [newAddressDetail, setNewAddressDetail] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Fetch addresses on mount if step 2
  useEffect(() => {
    if (step === 2) {
      fetchAddresses();
      fetchRegions();
    }
  }, [step]);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/customer/addresses');
      const data = response.data.data || response.data;
      setAddresses(data);
      const primary = data.find(a => a.is_primary);
      if (primary && !selectedAddressId) setSelectedAddressId(primary.id);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!selectedVillageId || !newAddressDetail.trim()) {
      setError('Lengkapi data alamat terlebih dahulu');
      return;
    }

    setIsAddingAddress(true);
    setError('');
    try {
      await api.post('/customer/addresses', {
        village_id: selectedVillageId,
        detail: newAddressDetail,
        is_primary: addresses.length === 0
      });
      setShowAddAddress(false);
      setSelectedCityId('');
      setSelectedDistrictId('');
      setSelectedVillageId('');
      setNewAddressDetail('');
      fetchAddresses();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambah alamat');
    } finally {
      setIsAddingAddress(false);
    }
  };

  const handleConfirmOrder = async () => {
    setIsLoading(true);
    setError('');
    try {
      const payload = {
        address_id: selectedAddressId,
        duration_days: cart.duration,
        pickup_date: pickupDate,
        note: note,
        items: cart.items.map(item => ({
          service_id: item.service_id,
          quantity: item.quantity
        }))
      };
      await api.post('/customer/orders', payload);
      cart.clearCart();
      navigate('/customer/orders/active');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  const getDeliveryDate = () => {
    if (!pickupDate || !cart.duration) return '-';
    const date = new Date(pickupDate);
    date.setDate(date.getDate() + cart.duration);
    return date.toISOString().split('T')[0];
  };

  const selectedCity = regions.find(c => c.id == selectedCityId);
  const districts = selectedCity ? selectedCity.districts || [] : [];
  const selectedDistrict = districts.find(d => d.id == selectedDistrictId);
  const villages = selectedDistrict ? selectedDistrict.villages || [] : [];

  const renderStep1 = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
        <h2 className="text-xl md:text-2xl font-bold">Keranjang</h2>
        {cart.duration && <span className="bg-blue-100 text-blue-800 text-xs md:text-sm px-3 py-1 md:py-1.5 rounded-full font-semibold">{cart.duration} Hari Pengerjaan</span>}
      </div>

      {cart.items.length === 0 ? (
        <div className="text-center py-16 space-y-4 bg-white rounded-2xl border border-neutral-100">
          <div className="text-neutral-400 md:text-lg">Keranjang masih kosong</div>
          <Button onClick={() => navigate('/customer/home')} variant="outline" className="h-11 px-6">
            Kembali ke Beranda
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4 md:space-y-5">
            {cart.items.map((item) => (
              <div key={item.service_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                <div className="flex-1">
                  <h4 className="font-semibold text-neutral-900 md:text-lg">{item.name}</h4>
                  <div className="text-sm md:text-base font-medium text-neutral-500 mt-1">
                    {formatRp(item.price)}
                  </div>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="flex items-center gap-3 bg-neutral-50 px-3 md:px-4 py-1.5 md:py-2 rounded-xl border border-neutral-200">
                    <button
                      onClick={() => cart.updateQty(item.service_id, item.quantity - 1)}
                      className="text-neutral-500 hover:text-neutral-900 font-bold w-6 h-6 flex items-center justify-center text-lg"
                    >-</button>
                    <span className="w-5 md:w-6 text-center font-bold text-sm md:text-base">{item.quantity}</span>
                    <button
                      onClick={() => cart.updateQty(item.service_id, item.quantity + 1)}
                      className="text-neutral-500 hover:text-neutral-900 font-bold w-6 h-6 flex items-center justify-center text-lg"
                    >+</button>
                  </div>
                  <button
                    onClick={() => cart.removeItem(item.service_id)}
                    className="p-2.5 md:p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-5 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-neutral-500 font-medium md:text-lg">Total Estimasi</span>
            <span className="text-xl md:text-2xl font-bold text-blue-600">{formatRp(cart.totalEstimasi)}</span>
          </div>

          <Button onClick={() => setStep(2)} className="w-full h-12 md:h-14 text-base md:text-lg rounded-xl">
            Lanjut Pemesanan <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
        <button onClick={() => setStep(1)} className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors">
          <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-neutral-700" />
        </button>
        <h2 className="text-xl md:text-2xl font-bold">Alamat & Pengiriman</h2>
      </div>

      <div className="space-y-4 md:space-y-6">
        <h3 className="font-semibold text-neutral-900 flex items-center gap-2 md:text-lg">
          <MapPin className="w-5 h-5 text-blue-600" /> Pilih Alamat
        </h3>

        {isLoading ? (
          <Skeleton className="h-24 w-full rounded-2xl" />
        ) : showAddAddress ? (
          <form onSubmit={handleAddAddress} className="space-y-4 md:space-y-5 p-4 md:p-6 border border-neutral-200 rounded-2xl bg-white shadow-sm">
            <h4 className="font-medium text-sm md:text-base text-neutral-900 border-b border-neutral-100 pb-2">Tambah Alamat Baru</h4>
            {error && <div className="text-xs md:text-sm text-red-500 bg-red-50 p-2 rounded-md">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <select
                className="w-full h-11 md:h-12 px-3 md:px-4 rounded-xl border border-neutral-300 text-sm md:text-base bg-white"
                value={selectedCityId} onChange={(e) => { setSelectedCityId(e.target.value); setSelectedDistrictId(''); setSelectedVillageId(''); }}
              >
                <option value="">Pilih Kota</option>
                {regions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              <select
                className="w-full h-11 md:h-12 px-3 md:px-4 rounded-xl border border-neutral-300 text-sm md:text-base bg-white disabled:opacity-50"
                value={selectedDistrictId} onChange={(e) => { setSelectedDistrictId(e.target.value); setSelectedVillageId(''); }}
                disabled={!selectedCityId}
              >
                <option value="">Pilih Kecamatan</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>

              <select
                className="w-full h-11 md:h-12 px-3 md:px-4 rounded-xl border border-neutral-300 text-sm md:text-base bg-white disabled:opacity-50 md:col-span-2"
                value={selectedVillageId} onChange={(e) => setSelectedVillageId(e.target.value)}
                disabled={!selectedDistrictId}
              >
                <option value="">Pilih Kelurahan</option>
                {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>

              <textarea
                placeholder="Detail alamat (Jalan, Blok, No Rumah)"
                className="w-full h-24 p-3 md:p-4 rounded-xl border border-neutral-300 text-sm md:text-base bg-white resize-none md:col-span-2"
                value={newAddressDetail} onChange={(e) => setNewAddressDetail(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 h-11 md:h-12 rounded-xl" onClick={() => setShowAddAddress(false)}>Batal</Button>
              <Button type="submit" className="flex-1 h-11 md:h-12 rounded-xl" disabled={isAddingAddress}>
                {isAddingAddress ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan'}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {addresses.map(addr => (
                <label key={addr.id} className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${selectedAddressId === addr.id ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-neutral-200 bg-white hover:border-blue-300'}`}>
                  <input type="radio" name="address" className="mt-1 w-4 h-4 text-blue-600 shrink-0" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} />
                  <div className="flex-1 space-y-1 md:space-y-1.5 overflow-hidden">
                    <p className="font-medium text-sm md:text-base text-neutral-900 leading-snug">{addr.detail}</p>
                    <p className="text-xs md:text-sm text-neutral-500 leading-snug">{addr.village_name}, {addr.district_name}, {addr.city_name}</p>
                  </div>
                </label>
              ))}
            </div>
            {addresses.length === 0 && <p className="text-sm md:text-base text-neutral-500 py-4 text-center bg-white rounded-2xl border border-dashed border-neutral-200">Belum ada alamat tersimpan.</p>}
            <Button variant="outline" className="w-full border-dashed h-12 md:h-14 rounded-xl" onClick={() => setShowAddAddress(true)}>
              <Plus className="w-5 h-5 mr-2" /> Tambah Alamat Baru
            </Button>
          </>
        )}
      </div>

      <div className="space-y-4 md:space-y-6 pt-6 border-t border-neutral-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-2 md:space-y-3">
            <Label className="text-sm md:text-base font-semibold">Tanggal Penjemputan (Pick Up)</Label>
            <Input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="h-11 md:h-12 w-full rounded-xl text-base"
            />
            {pickupDate && (
              <div className="p-3 bg-blue-50/50 rounded-xl text-sm md:text-base border border-blue-100 text-blue-900 mt-3">
                Estimasi Selesai (Delivery): <br className="md:hidden" />
                <span className="font-bold">{formatDate(getDeliveryDate())}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 md:space-y-3">
            <Label className="text-sm md:text-base font-semibold">Catatan (Opsional)</Label>
            <textarea
              className="w-full h-full min-h-[100px] p-3 md:p-4 rounded-xl border border-neutral-300 text-sm md:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 transition-shadow"
              placeholder="Contoh: Tolong pisahkan baju putih..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && !showAddAddress && <div className="text-sm md:text-base text-red-500 text-center bg-red-50 p-3 rounded-xl">{error}</div>}

      <Button
        onClick={() => {
          if (!selectedAddressId || !pickupDate) {
            setError('Pilih alamat dan tanggal penjemputan');
            return;
          }
          setError('');
          setStep(3);
        }}
        className="w-full h-12 md:h-14 text-base md:text-lg rounded-xl mt-6 md:mt-8"
      >
        Lanjut ke Ringkasan <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );

  const renderStep3 = () => {
    const selAddr = addresses.find(a => a.id === selectedAddressId);
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <button onClick={() => setStep(2)} className="p-2 -ml-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-neutral-700" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold">Ringkasan Pesanan</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="p-4 md:p-6 bg-white border border-neutral-200 rounded-2xl space-y-4 md:space-y-5 shadow-sm h-fit">
            <div className="flex items-center gap-2 text-blue-600 font-bold mb-2 md:text-lg border-b border-neutral-100 pb-3">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> Rincian Layanan
            </div>

            <div className="space-y-3">
              {cart.items.map(item => (
                <div key={item.service_id} className="flex justify-between text-sm md:text-base">
                  <span className="text-neutral-700"><span className="font-semibold">{item.quantity}x</span> {item.name}</span>
                  <span className="font-medium text-neutral-900">{formatRp(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-between font-bold text-lg md:text-xl">
              <span>Total Estimasi</span>
              <span className="text-blue-600">{formatRp(cart.totalEstimasi)}</span>
            </div>
          </div>

          <div className="p-4 md:p-6 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-4 text-sm md:text-base h-fit">
            <div>
              <div className="text-neutral-500 font-medium mb-1 md:mb-1.5">Durasi Pengerjaan</div>
              <div className="font-bold text-neutral-900 text-lg">{cart.duration} Hari</div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-200">
              <div>
                <div className="text-neutral-500 font-medium mb-1 md:mb-1.5">Jadwal Pick Up</div>
                <div className="font-semibold text-neutral-900">{formatDate(pickupDate)}</div>
              </div>
              <div>
                <div className="text-neutral-500 font-medium mb-1 md:mb-1.5">Est. Selesai</div>
                <div className="font-semibold text-neutral-900">{formatDate(getDeliveryDate())}</div>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-200">
              <div className="text-neutral-500 font-medium mb-1 md:mb-1.5">Alamat Pengiriman</div>
              <div className="font-medium leading-relaxed text-neutral-800 bg-white p-3 rounded-xl border border-neutral-100">
                {selAddr?.detail}, {selAddr?.village_name}, {selAddr?.district_name}, {selAddr?.city_name}
              </div>
            </div>
            {note && (
              <div className="pt-3 border-t border-neutral-200">
                <div className="text-neutral-500 font-medium mb-1 md:mb-1.5">Catatan</div>
                <div className="font-medium italic text-neutral-700">"{note}"</div>
              </div>
            )}
          </div>
        </div>

        {error && <div className="text-sm md:text-base text-red-500 text-center bg-red-50 p-3 rounded-xl">{error}</div>}

        <Button onClick={handleConfirmOrder} disabled={isLoading} className="w-full h-12 md:h-14 text-base md:text-xl rounded-xl font-bold mt-4 md:mt-8 shadow-md">
          {isLoading ? (
            <><Loader2 className="w-5 h-5 md:w-6 md:h-6 mr-2 animate-spin" /> Memproses...</>
          ) : (
            'Konfirmasi Pesanan'
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 pb-24 md:pb-32 max-w-4xl mx-auto">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}
