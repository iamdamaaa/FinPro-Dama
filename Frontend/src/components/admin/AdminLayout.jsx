import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Tag,
  Sparkles,
  MapPin,
  Users,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Kategori', path: '/admin/categories', icon: Tag },
  { name: 'Service', path: '/admin/services', icon: Sparkles },
  { name: 'Wilayah', path: '/admin/regions', icon: MapPin },
  { name: 'User', path: '/admin/users', icon: Users },
];

export default function AdminLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <h1 className="text-lg font-semibold tracking-tight text-neutral-900">Anjem Laundry</h1>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                    ? 'bg-neutral-100 text-neutral-900'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
                  }`
                }
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700 truncate pr-2">
              {user?.name || 'Admin'}
            </span>
            <button
              onClick={logout}
              className="text-neutral-500 hover:text-red-600 transition-colors p-1"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center px-8 shrink-0">
          <div className="flex-1"></div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-neutral-50">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}