export const statusMapping = {
    pending: { label: 'Pesanan Diterima', color: 'bg-blue-100 text-blue-800' },
    picked_up: { label: 'Pick Up Berhasil', color: 'bg-indigo-100 text-indigo-800' },
    processing: { label: 'Proses', color: 'bg-yellow-100 text-yellow-800' },
    ready: { label: 'Siap Diantar', color: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' },
};

export const nextStatusMap = {
    pending: ['picked_up', 'cancelled'],
    picked_up: ['processing', 'cancelled'],
    processing: ['ready', 'cancelled'],
    ready: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
};