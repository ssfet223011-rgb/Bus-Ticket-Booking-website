import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { Booking } from '../../types';
import { formatBDT, formatTime24to12 } from '../../utils/seatHelpers';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Download,
  Printer,
  XCircle,
  AlertTriangle,
  CheckCircle,
  Bus,
} from 'lucide-react';
import { ETicketCard } from '../ticket/ETicketCard';
import { ThermalReceipt } from '../ticket/ThermalReceipt';

export const MyBookingsView: React.FC = () => {
  const { bookings, cancelBooking } = useBooking();
  const { currentUser } = useAuth();

  const [activeBookingForView, setActiveBookingForView] = useState<Booking | null>(null);
  const [activeThermalBooking, setActiveThermalBooking] = useState<Booking | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of travel plan');

  // Filter bookings for passenger
  const myBookings = bookings;

  const handleCancel = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking and initiate a refund?')) {
      const ok = cancelBooking(bookingId, cancelReason);
      if (ok) {
        alert('Booking cancelled successfully! Seats have been released.');
        setCancellingBookingId(null);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Passenger Header */}
      <div className="bg-[#142B4A] rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-[#1E3A8A]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black">My Bookings & Travel History</h1>
          <p className="text-xs text-slate-300 mt-1">
            Passenger: {currentUser?.fullName} • Phone: {currentUser?.phone}
          </p>
        </div>
        <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs font-semibold">
          <span>{myBookings.length} Recorded Bookings</span>
        </div>
      </div>

      {/* Selected E-Ticket Modal / View */}
      {activeBookingForView && (
        <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-extrabold text-base text-[#142B4A]">
              Viewing Boarding Pass
            </h3>
            <button
              onClick={() => setActiveBookingForView(null)}
              className="text-xs font-bold px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700"
            >
              Back to Bookings List
            </button>
          </div>
          <ETicketCard
            booking={activeBookingForView}
            onClose={() => setActiveBookingForView(null)}
            onPrintThermal={() => setActiveThermalBooking(activeBookingForView)}
          />
        </div>
      )}

      {/* Thermal Receipt Print Modal */}
      {activeThermalBooking && (
        <ThermalReceipt
          booking={activeThermalBooking}
          onClose={() => setActiveThermalBooking(null)}
        />
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {myBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
            <Ticket className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-base text-slate-600">No Bookings Found</h3>
            <p className="text-xs">Search routes and reserve your first seat today!</p>
          </div>
        ) : (
          myBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#246BCE] flex items-center justify-center font-bold">
                    <Bus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-[#142B4A]">
                      {b.operatorName}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-400">
                      Ref: {b.bookingReference}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      b.status === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {b.status}
                  </span>
                  <span className="font-mono text-xs font-black text-slate-800">
                    {formatBDT(b.payableAmount)}
                  </span>
                </div>
              </div>

              {/* Middle row: Schedule and Route */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Journey Date & Time:</span>
                  <div className="font-bold text-slate-800 flex items-center space-x-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-[#246BCE]" />
                    <span>{b.journeyDate}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5 text-[#246BCE]" />
                    <span>{formatTime24to12(b.departureTime)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold">Assigned Seat(s):</span>
                  <span className="font-mono font-bold text-[#246BCE] text-sm block mt-0.5">
                    {b.seatNumbers.join(', ')}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-semibold">Boarding Point:</span>
                  <span className="font-bold text-slate-700 block mt-0.5 truncate">
                    {b.boardingPoint}
                  </span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveBookingForView(b)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#246BCE] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View / Download Ticket</span>
                  </button>

                  <button
                    onClick={() => setActiveThermalBooking(b)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow transition"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Thermal Receipt</span>
                  </button>
                </div>

                {b.status === 'confirmed' && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Ticket & Refund</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
