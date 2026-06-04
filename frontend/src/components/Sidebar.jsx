import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  Building2,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const { t } = useLanguage();
  const navItems = [
    { name: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { name: t('plots'), path: '/plots', icon: Map },
    { name: t('customers'), path: '/customers', icon: Users },
    { name: t('siteVisits'), path: '/site-visits', icon: Calendar },
    { name: t('analytics'), path: '/analytics', icon: BarChart3 },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-6 dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-colors duration-200">
      <div>
        {/* Brand Banner */}
        <div className="flex items-center gap-3 px-2 pb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md shadow-primary-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-850 dark:text-white leading-none">PlotCRM</h1>
            <span className="text-[10px] font-bold tracking-wider text-primary-600 dark:text-primary-400 uppercase">Indian Agent Hub</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="border-t border-slate-100 pt-4 dark:border-slate-850">
        {/* User Card */}
        {user && (
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-800 dark:text-white">{user.full_name}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
        )}

        {/* Theme and Exit Actions */}
        <div className="flex items-center justify-between px-2 pt-1">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors duration-150"
            title="Log Out Session"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Navbar */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3.5 dark:border-slate-800 dark:bg-slate-900 lg:hidden transition-colors duration-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">PlotCRM</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity duration-200" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </div>

      {/* Desktop Panel layout */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-64">
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
