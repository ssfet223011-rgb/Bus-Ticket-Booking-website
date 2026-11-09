import React, { useState } from 'react';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import { useBooking } from './context/BookingContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SearchWidget } from './components/booking/SearchWidget';
import { FilterSidebar, FilterState } from './components/booking/FilterSidebar';
import { TripCard } from './components/booking/TripCard';
import { CheckoutModal } from './components/booking/CheckoutModal';
import { ETicketCard } from './components/ticket/ETicketCard';
import { QRScannerModal } from './components/ticket/QRScannerModal';
import { ThermalReceipt } from './components/ticket/ThermalReceipt';
import { CounterPosView } from './components/counter/CounterPosView';
import { OperatorDashboard } from './components/operator/OperatorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TravelHubView } from './components/info/TravelHubView';
import { MyBookingsView } from './components/passenger/MyBookingsView';
import { Trip, Booking } from './types';
import { formatBDT } from './utils/seatHelpers';
import {
  Bus,
  ShieldCheck,
  CreditCard,
  MapPin,
  Clock,
  Star,
  Sparkles,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Users,
  Compass,
  Award,
} from 'lucide-react';

export const App: React.FC = () => {
  const { t } = useLanguage();
  const { role } = useAuth();
  const {
    trips,
    operators,
    searchParams,
    setSearchParams,
    selectedTrip,
    setSelectedTrip,
  } = useBooking();

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('home');

  // Modals
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [printThermalBooking, setPrintThermalBooking] = useState<Booking | null>(null);

  // Search results filters
  const [filters, setFilters] = useState<FilterState>({
    departureTimes: [],
    busTypes: [],
    operators: [],
    maxPrice: 3000,
  });

  const [sortBy, setSortBy] = useState<string>('earliest');

  // Filter trips based on searchParams and filter sidebar
  const filteredTrips = trips
    .filter((trip) => {
      // Origin and destination matching
      if (
        searchParams.from &&
        trip.originCity.toLowerCase() !== searchParams.from.toLowerCase()
      ) {
        return false;
      }
      if (
        searchParams.to &&
        trip.destinationCity.toLowerCase() !== searchParams.to.toLowerCase()
      ) {
        return false;
      }

      // Price filter
      if (trip.baseFare > filters.maxPrice) {
        return false;
      }

      // Operators filter
      if (filters.operators.length > 0 && !filters.operators.includes(trip.operatorName)) {
        return false;
      }

      // Bus Types filter
      if (filters.busTypes.length > 0) {
        let matchesType = false;
        if (filters.busTypes.includes('ac') && trip.isAc) matchesType = true;
        if (filters.busTypes.includes('non-ac') && !trip.isAc) matchesType = true;
        if (filters.busTypes.includes('sleeper') && trip.layoutType === 'sleeper')
          matchesType = true;
        if (filters.busTypes.includes('2+1') && trip.layoutType === '2+1') matchesType = true;
        if (!matchesType) return false;
      }

      // Departure Time filter
      if (filters.departureTimes.length > 0) {
        const hour = parseInt(trip.departureTime.split(':')[0], 10);
        let matchesTime = false;
        if (filters.departureTimes.includes('morning') && hour >= 6 && hour < 12)
          matchesTime = true;
        if (filters.departureTimes.includes('afternoon') && hour >= 12 && hour < 18)
          matchesTime = true;
        if (filters.departureTimes.includes('night') && (hour >= 18 || hour < 6))
          matchesTime = true;
        if (!matchesTime) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.baseFare - b.baseFare;
      if (sortBy === 'price-high') return b.baseFare - a.baseFare;
      if (sortBy === 'earliest') return a.departureTime.localeCompare(b.departureTime);
      if (sortBy === 'latest') return b.departureTime.localeCompare(a.departureTime);
      return 0;
    });

  const availableOperators = Array.from(new Set(trips.map((t) => t.operatorName)));

  const handleResetFilters = () => {
    setFilters({
      departureTimes: [],
      busTypes: [],
      operators: [],
      maxPrice: 3000,
    });
  };

  const handleBookingConfirmed = (booking: Booking) => {
    setIsCheckoutOpen(false);
    setConfirmedBooking(booking);
    setActiveTab('my-bookings');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenVerifier={() => setIsVerifierOpen(true)}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {/* ============================================================= */}
        {/* VIEW 1: HOMEPAGE */}
        {/* ============================================================= */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            {/* HERO SECTION WITH SEARCH WIDGET */}
            <div className="relative bg-[#142B4A] pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-[#1E3A8A]">
              {/* Background gradient decorative shapes */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#246BCE]/20 blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#F59E0B]/15 blur-3xl pointer-events-none"></div>

              <div className="relative max-w-7xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold text-white border border-white/15 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Centralized Live Seat Inventory & Unified Counter POS</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
                  {t('hero.title')}
                </h1>

                <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  {t('hero.subtitle')}
                </p>

                {/* Hero Search Box */}
                <div className="pt-4">
                  <SearchWidget
                    onSearch={() => setActiveTab('search')}
                    onSelectCountersTab={() => setActiveTab('counters')}
                    onSelectVerifyTab={() => setIsVerifierOpen(true)}
                  />
                </div>
              </div>
            </div>

            {/* POPULAR DESTINATIONS GRID */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-[#246BCE]">
                    Explore Bangladesh
                  </span>
                  <h2 className="text-2xl font-black text-[#142B4A]">
                    Popular Travel Destinations
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('search')}
                  className="text-xs font-bold text-[#246BCE] hover:text-[#1D4ED8] flex items-center space-x-1"
                >
                  <span>View All Buses</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: "Cox's Bazar",
                    tag: 'World Longest Sea Beach',
                    trips: '120+ Daily Trips',
                    image:
                      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop',
                    fare: 'From ৳ 1,600',
                  },
                  {
                    name: 'Chattogram',
                    tag: 'Commercial Capital & Port',
                    trips: '85+ Daily Trips',
                    image:
                      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&h=400&fit=crop',
                    fare: 'From ৳ 900',
                  },
                  {
                    name: 'Sylhet',
                    tag: 'Land of Tea Gardens & Hills',
                    trips: '65+ Daily Trips',
                    image:
                      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
                    fare: 'From ৳ 850',
                  },
                  {
                    name: 'Rajshahi',
                    tag: 'Silk City & Mango Orchards',
                    trips: '50+ Daily Trips',
                    image:
                      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&h=400&fit=crop',
                    fare: 'From ৳ 650',
                  },
                ].map((dest, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSearchParams({
                        ...searchParams,
                        from: 'Dhaka',
                        to: dest.name,
                      });
                      setActiveTab('search');
                    }}
                    className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition cursor-pointer border border-slate-200/80 bg-white"
                  >
                    <div className="h-44 overflow-hidden relative">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <span className="absolute bottom-3 left-3 text-white font-black text-lg">
                        {dest.name}
                      </span>
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
                        {dest.fare}
                      </span>
                    </div>

                    <div className="p-3.5 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">{dest.tag}</span>
                      <span className="font-bold text-[#246BCE]">{dest.trips}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FEATURED BUS OPERATORS */}
            <section className="bg-white py-12 border-y border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="text-center max-w-2xl mx-auto space-y-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-[#246BCE]">
                    Official Transport Partners
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#142B4A]">
                    Trusted by 50+ Top Bus Companies
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Book tickets from certified luxury AC coaches, sleeper berths, and business class fleets.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
                  {operators.map((op) => (
                    <div
                      key={op.id}
                      onClick={() => {
                        setFilters((prev) => ({
                          ...prev,
                          operators: [op.name],
                        }));
                        setActiveTab('search');
                      }}
                      className="bg-slate-50 hover:bg-white rounded-2xl p-4 border border-slate-200 text-center hover:shadow-lg transition cursor-pointer group flex flex-col items-center justify-center space-y-2"
                    >
                      <img
                        src={op.logoUrl}
                        alt={op.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 group-hover:scale-105 transition"
                      />
                      <h4 className="font-extrabold text-xs text-slate-800 line-clamp-1">
                        {op.name}
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        ★ {op.rating} Rating
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* WHY CHOOSE JATRASHEBA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="bg-[#142B4A] rounded-3xl p-8 sm:p-12 text-white shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 border border-[#1E3A8A]">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#246BCE] flex items-center justify-center text-white">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-lg">Centralized Seat Inventory</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Online passengers and physical counter operators share the exact same PostgreSQL database. Zero duplicate booking conflicts.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-slate-900">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-lg">800+ Physical Counters</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Sayedabad, Gabtoli, Mohakhali, Dampara, Kolatoli, Kadamtali—our unified POS terminal runs live across all bus counters.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-lg">Instant bKash, Nagad & Cash</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Fast checkout with simulated MFS gateway flows, printable 80mm thermal receipts, and digital QR boarding passes.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ============================================================= */}
        {/* VIEW 2: SEARCH RESULTS & SEAT BOOKING */}
        {/* ============================================================= */}
        {activeTab === 'search' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Search Bar on top */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200">
              <SearchWidget onSearch={() => {}} />
            </div>

            {/* Results Header: Route + Count + Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#142B4A]">
                  {searchParams.from} ➔ {searchParams.to}
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Showing {filteredTrips.length} {t('results.found')} on{' '}
                  <span className="text-slate-800">{searchParams.date}</span>
                </p>
              </div>

              {/* Sort by dropdown */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-semibold text-slate-500">{t('results.sortBy')}:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800 outline-none"
                >
                  <option value="earliest">{t('results.departEarliest')}</option>
                  <option value="latest">{t('results.departLatest')}</option>
                  <option value="price-low">{t('results.fareLowHigh')}</option>
                  <option value="price-high">{t('results.fareHighLow')}</option>
                </select>
              </div>
            </div>

            {/* Layout: Left Filter Sidebar, Right Trip Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Sidebar Filters (Col 3) */}
              <div className="lg:col-span-3">
                <FilterSidebar
                  filters={filters}
                  setFilters={setFilters}
                  availableOperators={availableOperators}
                  onReset={handleResetFilters}
                />
              </div>

              {/* Trip Cards List (Col 9) */}
              <div className="lg:col-span-9 space-y-4">
                {filteredTrips.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                    <Bus className="w-12 h-12 mx-auto text-slate-300" />
                    <h3 className="font-extrabold text-base text-slate-700">
                      No Scheduled Trips Found
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try adjusting your date or resetting filter criteria to see other available departures.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-[#246BCE] text-white rounded-xl text-xs font-bold"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  filteredTrips.map((trip) => (
                    <TripCard
                      key={trip.id}
                      trip={trip}
                      isExpanded={selectedTrip?.id === trip.id}
                      onToggleExpand={() =>
                        setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)
                      }
                      onProceedToCheckout={() => setIsCheckoutOpen(true)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* VIEW 3: COUNTER LOCATOR & MAP */}
        {/* ============================================================= */}
        {activeTab === 'counters' && <TravelHubView />}

        {/* ============================================================= */}
        {/* VIEW 4: TRAVEL INFORMATION HUB */}
        {/* ============================================================= */}
        {activeTab === 'travel-info' && <TravelHubView />}

        {/* ============================================================= */}
        {/* VIEW 5: PASSENGER BOOKINGS PORTAL */}
        {/* ============================================================= */}
        {activeTab === 'my-bookings' && <MyBookingsView />}

        {/* ============================================================= */}
        {/* VIEW 6: COUNTER POS TERMINAL */}
        {/* ============================================================= */}
        {activeTab === 'counter-pos' && <CounterPosView />}

        {/* ============================================================= */}
        {/* VIEW 7: OPERATOR DASHBOARD */}
        {/* ============================================================= */}
        {activeTab === 'operator-dashboard' && <OperatorDashboard />}

        {/* ============================================================= */}
        {/* VIEW 8: SUPER ADMIN DASHBOARD */}
        {/* ============================================================= */}
        {activeTab === 'admin-dashboard' && <AdminDashboard />}
      </main>

      {/* Global Modals: Checkout, E-Ticket, QR Verifier, Thermal */}
      {selectedTrip && (
        <CheckoutModal
          trip={selectedTrip}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onBookingSuccess={handleBookingConfirmed}
        />
      )}

      {/* Conductor QR Ticket Verifier */}
      <QRScannerModal
        isOpen={isVerifierOpen}
        onClose={() => setIsVerifierOpen(false)}
      />

      {/* Global Thermal Receipt Preview Modal */}
      {printThermalBooking && (
        <ThermalReceipt
          booking={printThermalBooking}
          onClose={() => setPrintThermalBooking(null)}
        />
      )}

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default App;

