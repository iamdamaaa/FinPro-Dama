import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, ClipboardList, History, User, ShoppingCart } from 'lucide-react';

const navItems = [
  { name: 'Beranda', path: '/customer/home', icon: Home },
  { name: 'Pesanan', path: '/customer/orders/active', icon: ClipboardList },
  { name: 'Riwayat', path: '/customer/history', icon: History },
  { name: 'Profil', path: '/customer/profile', icon: User },
];

export default function CustomerLayout({ cart, children }) {
  const navigate = useNavigate();
  const totalItems = cart?.totalItems || 0;

  return (
    <div className="flex flex-col h-screen bg-neutral-50 text-neutral-900 font-sans w-full relative overflow-hidden">

      {/* Header */}
      <header className="h-16 md:h-20 bg-white border-b border-neutral-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-40 shadow-sm">
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-neutral-900 cursor-pointer" onClick={() => navigate('/customer/home')}>
          Anjem Laundry
        </h1>
        <button
          onClick={() => navigate('/customer/order')}
          className="relative p-2 md:p-3 bg-neutral-50 rounded-full text-neutral-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] md:text-xs font-bold text-white shadow-sm ring-2 ring-white">
              {totalItems}
            </span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-24 scroll-smooth">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-neutral-200 flex justify-around items-center h-16 md:h-20 z-50 px-2 md:px-8 shadow-[0_-4px_6px_0px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive
                  ? 'text-blue-600'
                  : 'text-neutral-500 hover:text-blue-600 hover:bg-blue-50/50'
                }`
              }
            >
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-[10px] md:text-xs font-semibold">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

    </div>
  );
}