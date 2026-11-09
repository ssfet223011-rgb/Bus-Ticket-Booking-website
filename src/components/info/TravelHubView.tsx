import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  MapPin,
  PhoneCall,
  Clock,
  Bus,
  ShieldCheck,
  Search,
  HelpCircle,
  FileText,
  Navigation,
  Sparkles,
} from 'lucide-react';

export const TravelHubView: React.FC = () => {
  const { counters, operators, trips } = useBooking();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'counters' | 'operators' | 'routes' | 'faqs'>('counters');
  const [cityFilter, setCityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter counters
  const filteredCounters = counters.filter((c) => {
    if (cityFilter !== 'all' && c.city.toLowerCase() !== cityFilter.toLowerCase()) return false;
    if (
      searchQuery &&
      !c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.address.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !c.city.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Travel Hub Banner */}
      <div className="bg-[#142B4A] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#1E3A8A] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#F59E0B] font-black block mb-1">
            Official Bangladesh Transport Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black">
            Travel Information & Counter Locator Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Locate physical ticket counters across Bangladesh with GPS coordinates, phone contacts, authorized operator listings, and live schedules.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center bg-white/10 p-1.5 rounded-2xl border border-white/20 text-xs font-bold">
          <button
            onClick={() => setActiveTab('counters')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
              activeTab === 'counters' ? 'bg-[#F59E0B] text-slate-900 shadow' : 'text-slate-200 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Counter Locator</span>
          </button>
          <button
            onClick={() => setActiveTab('operators')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
              activeTab === 'operators' ? 'bg-white text-[#142B4A] shadow' : 'text-slate-200 hover:text-white'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Operators Directory</span>
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
              activeTab === 'routes' ? 'bg-white text-[#142B4A] shadow' : 'text-slate-200 hover:text-white'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>Popular Routes</span>
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
              activeTab === 'faqs' ? 'bg-white text-[#142B4A] shadow' : 'text-slate-200 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>FAQs & Policy</span>
          </button>
        </div>
      </div>

      {/* 1. Counter Locator Tab */}
      {activeTab === 'counters' && (
        <div className="space-y-6">
          {/* Search & City Filter Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search counter by branch name, terminal, or address..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#246BCE]"
              />
            </div>

            <div className="flex space-x-2 w-full sm:w-auto">
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
              >
                <option value="all">All Cities (Bangladesh)</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Cox's Bazar">Cox's Bazar</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
              </select>
            </div>
          </div>

          {/* Counter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCounters.map((cnt) => (
              <div
                key={cnt.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#246BCE] bg-blue-50 px-2 py-0.5 rounded">
                      {cnt.code}
                    </span>
                    <h3 className="font-extrabold text-base text-[#142B4A] mt-1">{cnt.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{cnt.operatorName}</p>
                  </div>
                  <span className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-[#F59E0B]">
                    <MapPin className="w-4 h-4" />
                  </span>
                </div>

                <p className="text-xs text-slate-600 flex items-start space-x-1.5 leading-relaxed">
                  <span>{cnt.address}</span>
                </p>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-1 text-slate-700 font-bold">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{cnt.phone}</span>
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${cnt.name} ${cnt.address}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 text-[#246BCE] hover:underline font-semibold"
                  >
                    <span>View Map</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Operators Directory Tab */}
      {activeTab === 'operators' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {operators.map((op) => (
            <div
              key={op.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition space-y-4"
            >
              <div className="flex items-center space-x-3.5">
                <img
                  src={op.logoUrl}
                  alt={op.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-base text-[#142B4A]">{op.name}</h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      ★ {op.rating} Rating
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Code: {op.code}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{op.address}</p>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Helpline:</span>
                  <span className="font-bold text-slate-800">{op.contactPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fleet Size:</span>
                  <span className="font-semibold">{op.totalBuses || 35} Coaches</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Popular Routes Tab */}
      {activeTab === 'routes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              route: "Dhaka ⇄ Cox's Bazar",
              duration: '8h 30m',
              distance: '390 km',
              operators: 'Green Line, Shohagh, Desh Travels',
              amenities: 'Scania Multi-Axle, Royal Sleeper, Breakfast Stop',
            },
            {
              route: 'Dhaka ⇄ Chattogram',
              duration: '5h 15m',
              distance: '245 km',
              operators: 'Shohagh, Green Line, Hanif',
              amenities: 'High-speed Highway Express, Daily 80+ Departures',
            },
            {
              route: 'Dhaka ⇄ Sylhet',
              duration: '5h 30m',
              distance: '240 km',
              operators: 'Ena Travels, Green Line',
              amenities: 'Luxury AC Universe, 24/7 Schedule',
            },
            {
              route: 'Dhaka ⇄ Rajshahi',
              duration: '5h 30m',
              distance: '250 km',
              operators: 'Hanif Enterprise, Desh Travels',
              amenities: 'Via Bangabandhu Bridge, AC & Deluxe Coaches',
            },
          ].map((r, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 space-y-2.5"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-base text-[#142B4A]">{r.route}</h4>
                <span className="text-xs font-mono font-bold bg-blue-50 text-[#246BCE] px-2.5 py-1 rounded-full">
                  {r.duration}
                </span>
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Distance:</span> {r.distance} •{' '}
                <span className="font-semibold text-slate-800">Key Fleets:</span> {r.operators}
              </div>
              <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {r.amenities}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 4. FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-lg text-[#142B4A]">
            Frequently Asked Questions & Ticketing Policies
          </h3>
          <div className="divide-y divide-slate-100">
            {[
              {
                q: 'How does the 10-minute temporary seat hold work?',
                a: 'When you click and select seats, the system immediately applies a transactional database lock for 10 minutes. This prevents other online passengers or counter agents from booking the same seat while you enter your details.',
              },
              {
                q: 'Can physical counter staff issue tickets for online seats?',
                a: 'Yes! Both online passengers and physical counter operators share the exact same real-time PostgreSQL inventory in real time. Once a ticket is issued at a counter, it becomes instantly booked online, preventing duplicate reservations.',
              },
              {
                q: 'How can conductors verify passenger tickets upon boarding?',
                a: 'Each ticket contains a tamper-proof QR code with a signed verification payload. Conductors can scan the code using the built-in Conductor Verifier tool to instantly confirm passenger validity and prevent re-use.',
              },
              {
                q: 'What is the ticket cancellation and refund policy?',
                a: 'Passengers can request cancellation through their dashboard up to 12 hours before trip departure. Once approved, the refund is processed back to the original bKash/Nagad or counter source minus the operator service fee.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="py-4 space-y-1.5">
                <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4 text-[#246BCE] shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-600 pl-6 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
