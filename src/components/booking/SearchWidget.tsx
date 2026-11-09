import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  Search,
  ArrowLeftRight,
  Bus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { INITIAL_CITIES } from '../../services/mockData';

interface SearchWidgetProps {
  onSearch: () => void;
  onSelectCountersTab?: () => void;
  onSelectVerifyTab?: () => void;
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({
  onSearch,
  onSelectCountersTab,
  onSelectVerifyTab,
}) => {
  const { t } = useLanguage();
  const { searchParams, setSearchParams } = useBooking();

  const [from, setFrom] = useState(searchParams.from);
  const [to, setTo] = useState(searchParams.to);
  const [date, setDate] = useState(searchParams.date);
  const [returnDate, setReturnDate] = useState(searchParams.returnDate || '');
  const [passengers, setPassengers] = useState(searchParams.passengers || 1);
  const [busClass, setBusClass] = useState(searchParams.busClass || 'all');
  const [activeSearchTab, setActiveSearchTab] = useState<'bus' | 'counter' | 'verify'>('bus');

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleQuickRoute = (fromCity: string, toCity: string) => {
    setFrom(fromCity);
    setTo(toCity);
    setSearchParams({
      ...searchParams,
      from: fromCity,
      to: toCity,
    });
    onSearch();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      from,
      to,
      date,
      returnDate: returnDate || undefined,
      passengers,
      busClass: busClass === 'all' ? undefined : busClass,
    });
    onSearch();
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Category Tabs: Bus, Counter, Verify */}
      <div className="flex items-center space-x-2 mb-2">
        <button
          onClick={() => setActiveSearchTab('bus')}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-t-xl font-bold text-sm transition ${
            activeSearchTab === 'bus'
              ? 'bg-white text-[#142B4A] shadow-md border-t-2 border-[#246BCE]'
              : 'bg-white/30 text-white hover:bg-white/40'
          }`}
        >
          <Bus className="w-4 h-4 text-[#246BCE]" />
          <span>{t('search.tabBus')}</span>
        </button>

        <button
          onClick={() => {
            if (onSelectCountersTab) onSelectCountersTab();
          }}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-t-xl font-medium text-sm bg-white/20 text-white hover:bg-white/30 transition"
        >
          <MapPin className="w-4 h-4 text-[#F59E0B]" />
          <span>{t('search.tabCounters')}</span>
        </button>

        <button
          onClick={() => {
            if (onSelectVerifyTab) onSelectVerifyTab();
          }}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-t-xl font-medium text-sm bg-white/20 text-white hover:bg-white/30 transition"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{t('search.tabVerify')}</span>
        </button>
      </div>

      {/* Main Search Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl rounded-tl-none shadow-2xl p-4 sm:p-6 border border-slate-200/80 text-slate-800"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* FROM CITY */}
          <div className="md:col-span-3 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-[#246BCE]" />
              <span>{t('search.from')}</span>
            </label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#246BCE] focus:bg-white outline-none transition"
              required
            >
              {INITIAL_CITIES.map((c) => (
                <option key={c.id} value={c.nameEn}>
                  {c.nameEn} ({c.nameBn})
                </option>
              ))}
            </select>
          </div>

          {/* SWAP BUTTON */}
          <div className="hidden md:flex md:col-span-1 justify-center items-center pt-5">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 rounded-full bg-slate-100 hover:bg-[#246BCE] hover:text-white text-slate-600 transition shadow-sm border border-slate-200"
              title={t('search.swap')}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* TO CITY */}
          <div className="md:col-span-3 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{t('search.to')}</span>
            </label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#246BCE] focus:bg-white outline-none transition"
              required
            >
              {INITIAL_CITIES.map((c) => (
                <option key={c.id} value={c.nameEn}>
                  {c.nameEn} ({c.nameBn})
                </option>
              ))}
            </select>
          </div>

          {/* JOURNEY DATE */}
          <div className="md:col-span-2 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('search.journeyDate')}</span>
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#246BCE] focus:bg-white outline-none transition"
              required
            />
          </div>

          {/* PASSENGERS & CLASS */}
          <div className="md:col-span-1 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span>Pass.</span>
            </label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2 py-2.5 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-[#246BCE] focus:bg-white outline-none transition"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>

          {/* SEARCH BUTTON */}
          <div className="md:col-span-2 pt-2 md:pt-5">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#246BCE] to-[#142B4A] hover:from-[#1D4ED8] hover:to-[#0F172A] text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2 group cursor-pointer"
            >
              <Search className="w-4 h-4 group-hover:scale-110 transition" />
              <span>{t('search.button')}</span>
            </button>
          </div>
        </div>

        {/* Trending Searches Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{t('search.trending')}</span>
          </span>

          <button
            type="button"
            onClick={() => handleQuickRoute('Dhaka', "Cox's Bazar")}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#246BCE] text-slate-700 border border-slate-200 transition font-medium"
          >
            Dhaka ➔ Cox's Bazar
          </button>

          <button
            type="button"
            onClick={() => handleQuickRoute('Dhaka', 'Chattogram')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#246BCE] text-slate-700 border border-slate-200 transition font-medium"
          >
            Dhaka ➔ Chattogram
          </button>

          <button
            type="button"
            onClick={() => handleQuickRoute('Dhaka', 'Sylhet')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#246BCE] text-slate-700 border border-slate-200 transition font-medium"
          >
            Dhaka ➔ Sylhet
          </button>

          <button
            type="button"
            onClick={() => handleQuickRoute('Dhaka', 'Rajshahi')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#246BCE] text-slate-700 border border-slate-200 transition font-medium"
          >
            Dhaka ➔ Rajshahi
          </button>
        </div>
      </form>
    </div>
  );
};
