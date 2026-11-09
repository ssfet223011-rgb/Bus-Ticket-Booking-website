import React, { useState } from 'react';
import {
  Trip,
  TripSeat,
} from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { formatBDT, formatTime24to12 } from '../../utils/seatHelpers';
import {
  Clock,
  ShieldAlert,
  ArrowRight,
  Disc,
  LogIn,
  CheckCircle,
  AlertCircle,
  Tag,
  MapPin,
} from 'lucide-react';

interface SeatMapProps {
  trip: Trip;
  onProceedToCheckout: () => void;
  isCounterMode?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  trip,
  onProceedToCheckout,
  isCounterMode = false,
}) => {
  const { t } = useLanguage();
  const {
    tripSeats,
    selectedSeats,
    selectSeat,
    selectedBoardingPoint,
    setSelectedBoardingPoint,
    selectedDroppingPoint,
    setSelectedDroppingPoint,
    holdRemainingSeconds,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useBooking();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(
    null
  );
  const [activeDeckTab, setActiveDeckTab] = useState<'lower' | 'upper'>('lower');

  const currentSeats: TripSeat[] = tripSeats[trip.id] || [];

  // Group seats by deck
  const lowerSeats = currentSeats.filter((s) => !s.deck || s.deck === 'lower');
  const upperSeats = currentSeats.filter((s) => s.deck === 'upper');
  const displaySeats = activeDeckTab === 'lower' ? lowerSeats : upperSeats;

  // Maximum row number
  const maxRow = Math.max(...displaySeats.map((s) => s.row), 0);

  // Group by rows
  const rowList: number[] = [];
  for (let r = 0; r <= maxRow; r++) {
    rowList.push(r);
  }

  // Calculate fare breakdown
  const selectedSeatObjects = currentSeats.filter((s) =>
    selectedSeats.includes(s.seatNumber)
  );

  const subtotal = selectedSeatObjects.reduce(
    (sum, seat) => sum + (seat.fare || trip.baseFare),
    0
  );

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
        discount = appliedCoupon.maxDiscount;
      }
    } else {
      discount = appliedCoupon.discountValue;
    }
  }

  const serviceFee = isCounterMode ? 0 : selectedSeats.length > 0 ? 50 : 0;
  const grandTotal = Math.max(0, subtotal - discount + serviceFee);

  const handleApplyCouponCode = () => {
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput, subtotal);
    setCouponFeedback(res);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-6 rounded-b-2xl">
      {/* 10-Minute Seat Hold Notification Banner */}
      {selectedSeats.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between text-amber-900 text-xs shadow-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span className="font-semibold">
              Temporary Seat Hold Active: Seats locked for your booking.
            </span>
          </div>
          <div className="flex items-center space-x-1.5 font-bold bg-amber-200/80 px-2.5 py-1 rounded-lg text-amber-900">
            <span>Timer:</span>
            <span className="font-mono text-sm">{formatTimer(holdRemainingSeconds)}</span>
          </div>
        </div>
      )}

      {/* Main Grid: Left Bus Seat Grid, Right Points & Fare Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Bus Seat Layout (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200">
          {/* Sleeper Deck Selector if applicable */}
          {trip.layoutType === 'sleeper' && (
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => setActiveDeckTab('lower')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                  activeDeckTab === 'lower'
                    ? 'bg-[#142B4A] text-white border-[#142B4A]'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                Lower Deck Berths
              </button>
              <button
                onClick={() => setActiveDeckTab('upper')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition ${
                  activeDeckTab === 'upper'
                    ? 'bg-[#142B4A] text-white border-[#142B4A]'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                Upper Deck Berths
              </button>
            </div>
          )}

          {/* Seat Status Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 text-xs font-medium text-slate-600">
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 rounded border-2 border-slate-300 bg-white"></div>
              <span>{t('seat.legendAvailable')}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 rounded bg-[#246BCE] border-2 border-[#1E3A8A]"></div>
              <span>{t('seat.legendSelected')}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 rounded bg-amber-400 border-2 border-amber-600 animate-pulse"></div>
              <span>{t('seat.legendHeld')}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 rounded bg-slate-200 border-2 border-slate-300"></div>
              <span>{t('seat.legendBooked')}</span>
            </div>
          </div>

          {/* Bus Physical Layout Container */}
          <div className="max-w-xs mx-auto bg-slate-50 rounded-2xl p-4 border-2 border-slate-300 shadow-inner">
            {/* Front: Driver position (Right) and Door entrance (Left) */}
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-slate-300 text-slate-500 text-xs font-semibold">
              <div className="flex items-center space-x-1 bg-slate-200 px-2 py-1 rounded">
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span>Door / Entry</span>
              </div>
              <div className="flex items-center space-x-1 bg-slate-200 px-2.5 py-1 rounded">
                <Disc className="w-4 h-4 text-slate-700" />
                <span>Driver</span>
              </div>
            </div>

            {/* Matrix of Seats */}
            <div className="space-y-2.5">
              {rowList.map((rowIdx) => {
                const seatsInRow = displaySeats.filter((s) => s.row === rowIdx);
                if (seatsInRow.length === 0) return null;

                // Render seats according to columns
                return (
                  <div key={rowIdx} className="flex justify-between items-center px-1">
                    {/* Left Column pair */}
                    <div className="flex space-x-2">
                      {seatsInRow
                        .filter((s) => s.col <= 1)
                        .map((seat) => renderSeatButton(seat))}
                    </div>

                    {/* Aisle */}
                    <div className="text-[10px] font-mono text-slate-400 select-none">
                      {rowIdx + 1}
                    </div>

                    {/* Right Column pair / single for 2+1 */}
                    <div className="flex space-x-2">
                      {seatsInRow
                        .filter((s) => s.col >= 2)
                        .map((seat) => renderSeatButton(seat))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rear of Bus */}
            <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[10px] text-slate-600 uppercase font-bold tracking-widest">
              Back / Engine
            </div>
          </div>
        </div>

        {/* Right Column: Boarding/Dropping Points, Fare Breakdown, Checkout CTA (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Boarding Point Selector */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-[#246BCE]" />
              <span>{t('seat.boarding')}</span>
            </label>
            <select
              value={selectedBoardingPoint}
              onChange={(e) => setSelectedBoardingPoint(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#246BCE] outline-none"
            >
              <option value="">Select Boarding Counter / Stand</option>
              {trip.boardingPoints.map((bp) => (
                <option key={bp.id} value={`${bp.name} (${bp.time})`}>
                  {bp.name} - {formatTime24to12(bp.time)}
                </option>
              ))}
            </select>
          </div>

          {/* Dropping Point Selector */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-[#F59E0B]" />
              <span>{t('seat.dropping')}</span>
            </label>
            <select
              value={selectedDroppingPoint}
              onChange={(e) => setSelectedDroppingPoint(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#246BCE] outline-none"
            >
              <option value="">Select Dropping Counter / Stand</option>
              {trip.droppingPoints.map((dp) => (
                <option key={dp.id} value={`${dp.name} (${dp.time})`}>
                  {dp.name} - {formatTime24to12(dp.time)}
                </option>
              ))}
            </select>
          </div>

          {/* Fare Summary & Coupon Box */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-[#142B4A] border-b border-slate-100 pb-2">
              {t('seat.fareSummary')}
            </h4>

            {/* Selected Seats list */}
            <div className="flex justify-between text-xs text-slate-600">
              <span>Selected Seats:</span>
              <span className="font-bold text-[#246BCE]">
                {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
              </span>
            </div>

            {/* Base fare */}
            <div className="flex justify-between text-xs text-slate-600">
              <span>Base Fare ({selectedSeats.length} seats):</span>
              <span className="font-semibold">{formatBDT(subtotal)}</span>
            </div>

            {/* Online Service Fee */}
            {!isCounterMode && (
              <div className="flex justify-between text-xs text-slate-600">
                <span>Online Service Charge:</span>
                <span className="font-semibold">{formatBDT(serviceFee)}</span>
              </div>
            )}

            {/* Coupon Discount */}
            {discount > 0 && (
              <div className="flex justify-between text-xs text-emerald-600 font-bold">
                <span>Coupon ({appliedCoupon?.code}):</span>
                <span>-{formatBDT(discount)}</span>
              </div>
            )}

            {/* Coupon Input Form */}
            {!isCounterMode && selectedSeats.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex space-x-1.5">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Coupon (e.g. SHUVOJATRA)"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs uppercase font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-[#246BCE]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCouponCode}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition"
                  >
                    Apply
                  </button>
                </div>
                {couponFeedback && (
                  <p
                    className={`text-[11px] mt-1 font-medium ${
                      couponFeedback.success ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {couponFeedback.message}
                  </p>
                )}
              </div>
            )}

            {/* Grand Total */}
            <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-center text-sm font-extrabold text-[#142B4A]">
              <span>{t('seat.total')}:</span>
              <span className="text-lg text-[#246BCE]">{formatBDT(grandTotal)}</span>
            </div>

            {/* Checkout / Counter Issue Button */}
            <button
              onClick={onProceedToCheckout}
              disabled={selectedSeats.length === 0}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 ${
                selectedSeats.length > 0
                  ? 'bg-[#246BCE] hover:bg-[#1D4ED8] text-white cursor-pointer hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>
                {isCounterMode ? 'Proceed to Issue Ticket' : t('seat.continueBooking')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {selectedSeats.length === 0 && (
              <p className="text-[11px] text-center text-slate-600">
                Click on any available seat above to begin booking.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function renderSeatButton(seat: TripSeat) {
    const isSelected = selectedSeats.includes(seat.seatNumber);
    const isBooked = seat.status === 'booked';
    const isHeld = seat.status === 'held' && !isSelected;

    let buttonClass = 'bg-white border-2 border-slate-300 text-slate-800 hover:border-[#246BCE]';
    if (isSelected) {
      buttonClass =
        'bg-[#246BCE] border-2 border-[#1E3A8A] text-white font-bold scale-105 shadow';
    } else if (isBooked) {
      buttonClass =
        'bg-slate-200 border-2 border-slate-300 text-slate-400 cursor-not-allowed select-none';
    } else if (isHeld) {
      buttonClass =
        'bg-amber-300 border-2 border-amber-500 text-amber-900 cursor-not-allowed animate-pulse';
    }

    return (
      <button
        key={seat.id}
        type="button"
        disabled={isBooked || isHeld}
        onClick={() => selectSeat(seat.seatNumber)}
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition ${buttonClass}`}
        title={`Seat ${seat.seatNumber} - ${formatBDT(seat.fare || trip.baseFare)}`}
      >
        <span>{seat.seatNumber}</span>
      </button>
    );
  }
};
