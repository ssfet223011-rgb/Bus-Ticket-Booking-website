import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { Trip, Booking } from '../../types';
import { formatBDT, formatTime24to12 } from '../../utils/seatHelpers';
import {
  Store,
  Calendar,
  Users,
  Printer,
  DollarSign,
  TrendingUp,
  CreditCard,
  PlusCircle,
  FileText,
  Clock,
  MapPin,
  CheckCircle,
  Search,
  X,
  RotateCcw,
} from 'lucide-react';
import { TripCard } from '../booking/TripCard';
import { CheckoutModal } from '../booking/CheckoutModal';
import { ETicketCard } from '../ticket/ETicketCard';
import { ThermalReceipt } from '../ticket/ThermalReceipt';

export const CounterPosView: React.FC = () => {
  const {
    trips,
    counters,
    bookings,
    selectedTrip,
    setSelectedTrip,
    dailyCashRecords,
    counterExpenses,
    closeDailyCash,
    addCounterExpense,
    cancelBooking,
  } = useBooking();
  const { currentUser } = useAuth();

  // Selected counter (defaults to Sayedabad Counter 1)
  const currentCounter =
    counters.find((c) => c.id === currentUser?.counterId) || counters[0];

  // Filters for POS terminal
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [searchRefQuery, setSearchRefQuery] = useState('');

  // POS Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [printThermalBooking, setPrintThermalBooking] = useState<Booking | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCashClosingModalOpen, setIsCashClosingModalOpen] = useState(false);

  // New Expense form
  const [expenseCat, setExpenseCat] = useState('Counter Paper Rolls');
  const [expenseAmount, setExpenseAmount] = useState(350);
  const [expenseDesc, setExpenseDesc] = useState('Thermal printer rolls & pens');

  // Cash Closing form
  const [countedCash, setCountedCash] = useState(42000);

  // Filter trips for counter
  const filteredTrips = trips.filter((t) => {
    if (selectedRoute !== 'all') {
      const routeStr = `${t.originCity}-${t.destinationCity}`;
      if (routeStr !== selectedRoute) return false;
    }
    return true;
  });

  // Today's counter stats
  const todayBookings = bookings.filter(
    (b) => b.bookingChannel === 'counter' || b.counterId === currentCounter.id
  );
  const totalCounterSales = todayBookings.reduce((sum, b) => sum + b.payableAmount, 0);
  const totalCashCollected = todayBookings
    .filter((b) => b.paymentMethod === 'cash')
    .reduce((sum, b) => sum + b.payableAmount, 0);
  const totalDigitalCollected = totalCounterSales - totalCashCollected;

  const handleBookingConfirmed = (booking: Booking) => {
    setIsCheckoutOpen(false);
    setConfirmedBooking(booking);
    // Auto-open thermal receipt preview for instant printing
    setPrintThermalBooking(booking);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    addCounterExpense({
      counterId: currentCounter.id,
      category: expenseCat,
      amount: expenseAmount,
      description: expenseDesc,
      loggedBy: currentUser?.fullName || 'Counter Staff',
    });
    setIsExpenseModalOpen(false);
  };

  const handleExecuteCashClosing = (e: React.FormEvent) => {
    e.preventDefault();
    closeDailyCash(
      currentCounter.id,
      countedCash,
      currentUser?.fullName || 'Md. Rafiqul Islam'
    );
    setIsCashClosingModalOpen(false);
    alert('Daily Cash Closing successfully recorded and locked for the shift.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* POS Terminal Header & Shift Summary */}
      <div className="bg-[#142B4A] rounded-3xl p-6 text-white shadow-xl border border-[#1E3A8A] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#F59E0B] flex items-center justify-center text-slate-900 font-bold shadow-lg">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black">{currentCounter.name}</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-400/30 uppercase">
                Active Shift
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Terminal ID: {currentCounter.code} • Operator: {currentCounter.operatorName} • Operator: {currentUser?.fullName}
            </p>
          </div>
        </div>

        {/* Action Buttons: Log Expense & End-of-Day Closing */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#F59E0B]" />
            <span>Log Expense</span>
          </button>

          <button
            onClick={() => setIsCashClosingModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#F59E0B] hover:bg-amber-400 text-slate-900 rounded-xl text-xs font-black shadow-lg transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Daily Cash Closing</span>
          </button>
        </div>
      </div>

      {/* Real-Time Shift KPI Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <span className="text-xs text-slate-600 font-semibold block">Today's Tickets</span>
          <span className="text-2xl font-black text-[#142B4A] block mt-1">
            {todayBookings.length}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">Walk-in & Phone</span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <span className="text-xs text-slate-600 font-semibold block">Total Sales</span>
          <span className="text-2xl font-black text-[#246BCE] block mt-1">
            {formatBDT(totalCounterSales)}
          </span>
          <span className="text-[11px] text-slate-400">Total gross collection</span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <span className="text-xs text-slate-600 font-semibold block">Cash in Drawer</span>
          <span className="text-2xl font-black text-emerald-600 block mt-1">
            {formatBDT(totalCashCollected)}
          </span>
          <span className="text-[11px] text-slate-400">Physical bank notes</span>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
          <span className="text-xs text-slate-600 font-semibold block">MFS / Digital</span>
          <span className="text-2xl font-black text-purple-600 block mt-1">
            {formatBDT(totalDigitalCollected)}
          </span>
          <span className="text-[11px] text-slate-400">bKash, Nagad & Cards</span>
        </div>
      </div>

      {/* Ticket Lookup / Quick Search bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchRefQuery}
            onChange={(e) => setSearchRefQuery(e.target.value)}
            placeholder="Search Counter Ticket by Reference (e.g. BD-20261103) or Phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#246BCE]"
          />
        </div>

        {/* Route Filter Dropdown */}
        <div className="flex space-x-2 w-full sm:w-auto">
          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
          >
            <option value="all">All Routes</option>
            <option value="Dhaka-Cox's Bazar">Dhaka ➔ Cox's Bazar</option>
            <option value="Dhaka-Chattogram">Dhaka ➔ Chattogram</option>
            <option value="Dhaka-Sylhet">Dhaka ➔ Sylhet</option>
            <option value="Dhaka-Rajshahi">Dhaka ➔ Rajshahi</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
          />
        </div>
      </div>

      {/* If a ticket is confirmed, show the E-Ticket & Thermal print modal */}
      {confirmedBooking && (
        <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-emerald-500 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 text-emerald-700 font-extrabold text-sm sm:text-base">
              <CheckCircle className="w-5 h-5" />
              <span>Counter Ticket Issued Successfully!</span>
            </div>
            <button
              onClick={() => setConfirmedBooking(null)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg"
            >
              Done / Next Walk-in Customer
            </button>
          </div>
          <ETicketCard
            booking={confirmedBooking}
            onClose={() => setConfirmedBooking(null)}
            onPrintThermal={() => setPrintThermalBooking(confirmedBooking)}
          />
        </div>
      )}

      {/* Thermal Receipt Print Modal */}
      {printThermalBooking && (
        <ThermalReceipt
          booking={printThermalBooking}
          onClose={() => setPrintThermalBooking(null)}
        />
      )}

      {/* POS Bus Trips & Live Seat Picker */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-base text-[#142B4A] flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#246BCE]" />
          <span>Available Scheduled Buses for {selectedDate}</span>
        </h3>

        <div className="space-y-4">
          {filteredTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              isExpanded={selectedTrip?.id === trip.id}
              onToggleExpand={() =>
                setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)
              }
              onProceedToCheckout={() => setIsCheckoutOpen(true)}
              isCounterMode={true}
            />
          ))}
        </div>
      </div>

      {/* Recent Counter Issued Tickets Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-extrabold text-base text-[#142B4A] mb-4">
          Recent Counter Bookings & Print Ledger
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">Ref ID</th>
                <th className="pb-3">Passenger</th>
                <th className="pb-3">Operator & Coach</th>
                <th className="pb-3">Seats</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-mono font-bold text-[#246BCE]">
                    {b.bookingReference}
                  </td>
                  <td className="py-3">
                    <div className="font-bold text-slate-800">{b.passenger.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{b.passenger.phone}</div>
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-slate-700">{b.operatorName}</div>
                    <div className="text-[10px] text-slate-400">{b.coachNumber}</div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-[#246BCE] font-mono font-bold">
                      {b.seatNumbers.join(', ')}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-900">
                    {formatBDT(b.payableAmount)}
                  </td>
                  <td className="py-3">
                    <span className="uppercase font-semibold text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {b.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setPrintThermalBooking(b)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        title="Print 80mm Thermal Receipt"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#F59E0B]" />
                      </button>
                      <button
                        onClick={() => setConfirmedBooking(b)}
                        className="px-2 py-1 rounded-lg bg-[#246BCE] hover:bg-[#1D4ED8] text-white text-[11px] font-semibold transition"
                      >
                        View E-Ticket
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Modal in Counter Mode */}
      {selectedTrip && (
        <CheckoutModal
          trip={selectedTrip}
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onBookingSuccess={handleBookingConfirmed}
          isCounterMode={true}
        />
      )}

      {/* Log Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateExpense}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <h4 className="font-extrabold text-base text-[#142B4A]">
                Log Counter Expense
              </h4>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <input
                type="text"
                required
                value={expenseCat}
                onChange={(e) => setExpenseCat(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (BDT ৳)
              </label>
              <input
                type="number"
                required
                min={1}
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description / Memo
              </label>
              <textarea
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs"
                rows={2}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#246BCE] text-white font-bold text-xs shadow hover:bg-[#1D4ED8]"
            >
              Save Expense Voucher
            </button>
          </form>
        </div>
      )}

      {/* Cash Closing Modal */}
      {isCashClosingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleExecuteCashClosing}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <h4 className="font-extrabold text-base text-[#142B4A]">
                End-of-Day Shift Cash Closing
              </h4>
              <button
                type="button"
                onClick={() => setIsCashClosingModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Perform physical cash count in drawer and record reconciliation for{' '}
              <strong>{currentCounter.name}</strong>.
            </p>

            <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Calculated System Cash:</span>
                <span className="font-bold">{formatBDT(totalCashCollected)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Digital Collection (MFS):</span>
                <span>{formatBDT(totalDigitalCollected)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Actual Physical Cash Counted (৳)
              </label>
              <input
                type="number"
                required
                value={countedCash}
                onChange={(e) => setCountedCash(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-2 text-base font-black text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#F59E0B] text-slate-900 font-extrabold text-xs shadow hover:bg-amber-400"
            >
              Verify, Lock & Close Shift
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
