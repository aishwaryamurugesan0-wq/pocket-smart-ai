import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutGrid, ArrowLeftRight, Wallet, PieChart, Sparkles, PiggyBank, Settings as SettingsIcon,
  Sun, Moon, Bell, LogOut, Menu, X, Wallet as LogoIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationPanel from './NotificationPanel';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budget', label: 'Budget', icon: Wallet },
  { to: '/analytics', label: 'Analytics', icon: PieChart },
  { to: '/assistant', label: 'AI Assistant', icon: Sparkles },
  { to: '/savings', label: 'Savings', icon: PiggyBank },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

// Bottom nav on mobile shows a focused subset; everything is still reachable
// from the hamburger menu.
const MOBILE_NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: LayoutGrid },
  { to: '/transactions', label: 'Activity', icon: ArrowLeftRight },
  { to: '/budget', label: 'Budget', icon: Wallet },
  { to: '/assistant', label: 'Assistant', icon: Sparkles },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-moss-500 text-white flex items-center justify-center shrink-0">
        <LogoIcon size={18} />
      </div>
      <div className="leading-tight">
        <p className="font-display font-bold text-[15px] text-white">Pocket Smart AI</p>
        <p className="text-[11px] text-ink-300">Budget & Recommendation Assistant</p>
      </div>
    </div>
  );
}

function DesktopSidebar() {
  const { logout } = useAuth();
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-ink-800 min-h-screen px-4 py-6 sticky top-0">
      <div className="px-2 mb-8">
        <Logo />
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-moss-500 text-white' : 'text-ink-200 hover:bg-ink-700 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={logout}
        className="mt-4 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-200 hover:bg-ink-700 hover:text-white transition-colors"
      >
        <LogOut size={18} />
        Log out
      </button>
    </aside>
  );
}

function MobileDrawer({ open, onClose }) {
  const { logout } = useAuth();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-ink-900/60" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-ink-800 px-4 py-6 flex flex-col animate-slide-up">
        <div className="flex items-center justify-between mb-8 px-2">
          <Logo />
          <button onClick={onClose} aria-label="Close menu" className="text-ink-200"><X size={22} /></button>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-moss-500 text-white' : 'text-ink-200 hover:bg-ink-700 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-ink-200 hover:bg-ink-700 hover:text-white">
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </div>
  );
}

function MobileBottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-ink-800 border-t border-ink-50 dark:border-ink-700 flex items-stretch"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium ${
              isActive ? 'text-moss-500' : 'text-ink-300 dark:text-ink-200'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function TopBar({ onMenuClick }) {
  const { profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (profile?.full_name || 'there').split(' ')[0];

  return (
    <header className="sticky top-0 z-30 bg-paper/90 dark:bg-ink-900/90 backdrop-blur border-b border-ink-50 dark:border-ink-700"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden text-ink-700 dark:text-paper" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <div>
            <h1 className="font-display font-semibold text-lg leading-tight">{greeting}, {firstName}</h1>
            <p className="text-xs text-ink-400 dark:text-ink-200 hidden sm:block">Here's where your money stands today.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center text-ink-600 dark:text-paper hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <div className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-ink-600 dark:text-paper hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
          </div>
          <div className="w-9 h-9 rounded-full bg-moss-100 text-moss-700 flex items-center justify-center font-display font-semibold text-sm">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-paper dark:bg-ink-900">
      <DesktopSidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 px-4 lg:px-8 py-6 pb-24 lg:pb-10 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
