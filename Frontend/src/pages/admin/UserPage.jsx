import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
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

export default function UserPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog Add Admin
  const [showAdd, setShowAdd] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await api.post('/admin/admins', formData);
      setShowAdd(false);
      setFormData({ name: '', email: '', phone: '' });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan saat menambahkan admin.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <h1 className="text-2xl font-semibold tracking-tight">Daftar Pengguna</h1>
        <Button onClick={() => setShowAdd(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah Admin
        </Button>
      </div>

      <div className="bg-white rounded-md border border-neutral-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>No. Telepon</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-neutral-500">
                  Belum ada data pengguna.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-neutral-500">{user.id}</TableCell>
                  <TableCell className="font-medium text-neutral-900">{user.name}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-neutral-100 text-neutral-800'}`}>
                      {user.role}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Admin Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAdmin} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={formLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Nomor Telepon</Label>
              <Input
                type="text"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                disabled={formLoading}
              />
              <p className="text-xs text-neutral-500">Admin akan login menggunakan nomor telepon ini via OTP.</p>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setShowAdd(false)} disabled={formLoading}>Batal</Button>
              <Button type="submit" disabled={formLoading}>Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
