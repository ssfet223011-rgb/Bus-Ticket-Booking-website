import React, { useState } from 'react';
import {
  Bus,
  MapPin,
  Calendar,
  PhoneCall,
  User,
  ShieldCheck,
  Store,
  Compass,
  QrCode,
  Globe,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenVerifier: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenVerifier }) => {
  const { language, setLanguage, t } = useLanguage();
  const { currentUser, role, loginAsRole, loginAsOperator, availableTestProfiles, operatorAccounts } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleLabel = (r: UserRole) => {
    if (r === 'operator_owner' || r === 'operator_manager') {
      const match = operatorAccounts.find((acc) => acc.operatorId === currentUser?.operatorId);
      return match ? `Operator: ${match.companyName}` : 'Operator Portal';
    }
    switch (r) {
      case 'super_admin':
        return 'Super Admin';
      case 'counter_operator':
      case 'counter_manager':
        return 'POS Counter (Sayedabad)';
      default:
        return 'Passenger';
    }
  };

  const getRoleBadgeColor = (r: UserRole) => {
    switch (r) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'operator_owner':
      case 'operator_manager':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'counter_operator':
      case 'counter_manager':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#142B4A] text-white shadow-md border-b border-[#1E3A8A]">
      {/* Top micro bar: Hotline, bilingual switcher, role persona quick switcher */}
      <div className="bg-[#0B1A2E] text-xs py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          {/* Hotline & support */}
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="flex items-center space-x-1">
              <PhoneCall className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="font-semibold text-white">{t('nav.hotline')}</span>
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-300">24/7 Transport Helpdesk BD</span>
          </div>

          {/* Right controls: Role Selector Switcher & Language Switcher */}
          <div className="flex items-center space-x-3">
            {/* Quick Persona / Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center space-x-1.5 px-2 py-0.5 rounded text-xs border font-medium transition ${getRoleBadgeColor(
                  role
                )}`}
                title="Switch User Role to test permissions"
              >
                <span>Role: {getRoleLabel(role)}</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-2xl py-2 z-50 text-slate-800 border border-slate-200 max-h-[85vh] overflow-y-auto">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    General Test Personas
                  </div>
                  {availableTestProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        loginAsRole(profile.role);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                        role === profile.role && currentUser?.id === profile.id ? 'bg-blue-50 font-bold text-[#246BCE]' : ''
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{profile.fullName}</div>
                        <div className="text-[10px] text-slate-400">{profile.email}</div>
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {profile.role.replace('_', ' ')}
                      </span>
                    </button>
                  ))}

                  <div className="px-3 py-1.5 mt-1 border-t border-b border-slate-100 text-[10px] font-black text-[#F59E0B] uppercase tracking-wider bg-amber-50/50">
                    Bus Company Operator Logins
                  </div>
                  {operatorAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        loginAsOperator(acc.operatorId);
                        setActiveTab('operator-dashboard');
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-amber-50/60 transition ${
                        currentUser?.operatorId === acc.operatorId && role === 'operator_owner'
                          ? 'bg-amber-100 font-bold text-slate-900 border-l-4 border-[#F59E0B]'
                          : ''
                      }`}
                    >
                      <img src={acc.logoUrl} alt={acc.companyName} className="w-6 h-6 rounded-md object-cover" />
                      <div className="truncate flex-1">
                        <div className="font-bold text-slate-800 text-[11px] truncate">{acc.companyName}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{acc.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1 rounded transition border border-white/20"
            >
              <Globe className="w-3 h-3 text-[#F59E0B]" />
              <span className="font-bold">{language === 'en' ? 'বাংলা' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#246BCE] to-[#1E3A8A] flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-105 transition">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-extrabold tracking-tight text-white">Jatra</span>
                <span className="text-2xl font-extrabold text-[#F59E0B]">Sheba</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#246BCE]/40 text-blue-200 border border-blue-400/30">
                  BD
                </span>
              </div>
              <p className="text-[10px] text-slate-300 tracking-wide">Multi-Operator & Counter POS Hub</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-lg transition ${
                activeTab === 'home'
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {t('nav.home')}
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`px-3 py-2 rounded-lg transition ${
                activeTab === 'search'
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {t('nav.busTickets')}
            </button>

            <button
              onClick={() => setActiveTab('counters')}
              className={`px-3 py-2 rounded-lg transition flex items-center space-x-1 ${
                activeTab === 'counters'
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#F59E0B]" />
              <span>{t('nav.counters')}</span>
            </button>

            <button
              onClick={() => setActiveTab('travel-info')}
              className={`px-3 py-2 rounded-lg transition flex items-center space-x-1 ${
                activeTab === 'travel-info'
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>{t('nav.travelInfo')}</span>
            </button>

            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-3 py-2 rounded-lg transition ${
                activeTab === 'my-bookings'
                  ? 'bg-white/15 text-white font-semibold'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {t('nav.myBookings')}
            </button>

            {/* Role-specific Dashboard shortcut tabs */}
            {(role === 'counter_operator' || role === 'counter_manager' || role === 'super_admin') && (
              <button
                onClick={() => setActiveTab('counter-pos')}
                className={`px-3 py-2 rounded-lg transition flex items-center space-x-1.5 ${
                  activeTab === 'counter-pos'
                    ? 'bg-[#F59E0B] text-slate-900 font-bold shadow-md'
                    : 'bg-amber-500/20 text-[#F59E0B] hover:bg-amber-500/30'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>{t('nav.counterPos')}</span>
              </button>
            )}

            {(role === 'operator_owner' || role === 'operator_manager' || role === 'super_admin') && (
              <button
                onClick={() => setActiveTab('operator-dashboard')}
                className={`px-3 py-2 rounded-lg transition flex items-center space-x-1 ${
                  activeTab === 'operator-dashboard'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-emerald-300 hover:bg-emerald-950/40'
                }`}
              >
                <Bus className="w-4 h-4" />
                <span>Operator</span>
              </button>
            )}

            {role === 'super_admin' && (
              <button
                onClick={() => setActiveTab('admin-dashboard')}
                className={`px-3 py-2 rounded-lg transition flex items-center space-x-1 ${
                  activeTab === 'admin-dashboard'
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-purple-300 hover:bg-purple-950/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Super Admin</span>
              </button>
            )}
          </nav>

          {/* Quick QR Verify button on header */}
          <div className="hidden lg:flex items-center space-x-2">
            <button
              onClick={onOpenVerifier}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20 transition"
              title="Scan or verify passenger QR ticket"
            >
              <QrCode className="w-4 h-4 text-[#F59E0B]" />
              <span>Verify Ticket</span>
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={onOpenVerifier}
              className="p-1.5 rounded bg-white/10 text-white"
              title="Verify Ticket"
            >
              <QrCode className="w-5 h-5 text-[#F59E0B]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F2038] border-t border-white/10 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded text-slate-200 hover:bg-white/10 font-medium"
          >
            {t('nav.home')}
          </button>
          <button
            onClick={() => {
              setActiveTab('search');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded text-slate-200 hover:bg-white/10 font-medium"
          >
            {t('nav.busTickets')}
          </button>
          <button
            onClick={() => {
              setActiveTab('counters');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded text-slate-200 hover:bg-white/10 font-medium flex items-center space-x-2"
          >
            <MapPin className="w-4 h-4 text-[#F59E0B]" />
            <span>{t('nav.counters')}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('travel-info');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded text-slate-200 hover:bg-white/10 font-medium flex items-center space-x-2"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>{t('nav.travelInfo')}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('my-bookings');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded text-slate-200 hover:bg-white/10 font-medium"
          >
            {t('nav.myBookings')}
          </button>
          <button
            onClick={() => {
              setActiveTab('counter-pos');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded bg-[#F59E0B] text-slate-900 font-bold flex items-center space-x-2"
          >
            <Store className="w-4 h-4" />
            <span>{t('nav.counterPos')}</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('operator-dashboard');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded bg-emerald-600 text-white font-medium flex items-center space-x-2"
          >
            <Bus className="w-4 h-4" />
            <span>Operator Dashboard</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('admin-dashboard');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded bg-purple-700 text-white font-medium flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Super Admin Dashboard</span>
          </button>
        </div>
      )}
    </header>
  );
};
