import React, { useState } from 'react';
import {
  Trip,
  PaymentMethod,
  BookingChannel,
  PassengerInfo,
  Booking,
} from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { formatBDT, formatTime24to12 } from '../../utils/seatHelpers';
import {
  X,
  ShieldCheck,
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  Bus,
  Clock,
  MapPin,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  isCounterMode?: boolean;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  trip,
  isOpen,
  onClose,
  onBookingSuccess,
  isCounterMode = false,
}) => {
  const { t } = useLanguage();
  const {
    selectedSeats,
    selectedBoardingPoint,
    selectedDroppingPoint,
    appliedCoupon,
    confirmBooking,
    tripSeats,
  } = useBooking();
  const { currentUser, role } = useAuth();

  // Passenger form state
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+8801');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [nid, setNid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    isCounterMode ? 'cash' : 'bkash'
  );

  // MFS Simulator State (bKash / Nagad modal step)
  const [mfsStep, setMfsStep] = useState<'form' | 'mfs_account' | 'mfs_otp' | 'mfs_pin' | 'processing'>('form');
  const [mfsAccount, setMfsAccount] = useState('01712345678');
  const [mfsOtp, setMfsOtp] = useState('123456');
  const [mfsPin, setMfsPin] = useState('12345');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Calculate pricing
  const currentTripSeats = tripSeats[trip.id] || [];
  const selectedSeatObjects = currentTripSeats.filter((s) =>
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

  const serviceFee = isCounterMode ? 0 : 50;
  const payableAmount = Math.max(0, subtotal - discount + serviceFee);

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setErrorMessage('Please fill in your name and phone number.');
      return;
    }

    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      // Open MFS gateway interactive simulation
      setMfsStep('mfs_account');
    } else {
      // Direct execute for Cash or Card
      processFinalBooking();
    }
  };

  const processFinalBooking = () => {
    setMfsStep('processing');
    setTimeout(() => {
      const passengerInfo: PassengerInfo = {
        fullName,
        phone,
        email,
        gender,
        nid,
      };

      const channel: BookingChannel = isCounterMode ? 'counter' : 'website';
      const counterId = isCounterMode ? currentUser?.counterId || 'cnt-01' : undefined;

      const result = confirmBooking(passengerInfo, paymentMethod, channel, counterId);

      if (result.success && result.booking) {
        // Fire confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        onBookingSuccess(result.booking);
      } else {
        setErrorMessage(result.error || 'Failed to complete booking. Please try again.');
        setMfsStep('form');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#142B4A] text-white p-5 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#246BCE] flex items-center justify-center text-white">
              <Bus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                {isCounterMode ? 'POS Counter Ticket Issue' : t('checkout.title')}
              </h3>
              <p className="text-xs text-slate-300">
                {trip.operatorName} • {trip.originCity} ➔ {trip.destinationCity}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MFS Payment Simulation Steps */}
        {mfsStep === 'mfs_account' && (
          <div className="p-6 bg-slate-50 space-y-4">
            <div className="text-center">
              <div
                className={`inline-block px-4 py-1.5 rounded-full text-white font-extrabold text-sm mb-2 shadow ${
                  paymentMethod === 'bkash' ? 'bg-[#D12053]' : 'bg-[#F7941D]'
                }`}
              >
                {paymentMethod === 'bkash' ? 'bKash Payment Gateway' : 'Nagad Gateway'}
              </div>
              <p className="text-xs text-slate-600">Merchant: JatraSheba Platform Ltd.</p>
              <p className="text-xl font-black text-slate-900 mt-1">{formatBDT(payableAmount)}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Enter your {paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} Account Number
              </label>
              <input
                type="text"
                value={mfsAccount}
                onChange={(e) => setMfsAccount(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold tracking-wider"
                placeholder="01XXXXXXXXX"
              />
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMfsStep('form')}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setMfsStep('mfs_otp')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg text-white ${
                    paymentMethod === 'bkash' ? 'bg-[#D12053]' : 'bg-[#F7941D]'
                  }`}
                >
                  Next (Send OTP)
                </button>
              </div>
            </div>
          </div>
        )}

        {mfsStep === 'mfs_otp' && (
          <div className="p-6 bg-slate-50 space-y-4">
            <div className="text-center">
              <span className="text-xs font-semibold text-slate-500">
                Verification Code sent to {mfsAccount}
              </span>
              <p className="text-xl font-black text-slate-900 mt-1">{formatBDT(payableAmount)}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Enter 6-digit OTP Code (Sandbox Demo: 123456)
              </label>
              <input
                type="text"
                value={mfsOtp}
                onChange={(e) => setMfsOtp(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-center text-lg font-mono font-bold tracking-widest"
                maxLength={6}
              />
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMfsStep('mfs_account')}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setMfsStep('mfs_pin')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg text-white ${
                    paymentMethod === 'bkash' ? 'bg-[#D12053]' : 'bg-[#F7941D]'
                  }`}
                >
                  Verify Code
                </button>
              </div>
            </div>
          </div>
        )}

        {mfsStep === 'mfs_pin' && (
          <div className="p-6 bg-slate-50 space-y-4">
            <div className="text-center">
              <span className="text-xs font-semibold text-slate-500">Enter Security PIN</span>
              <p className="text-xl font-black text-slate-900 mt-1">{formatBDT(payableAmount)}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Enter PIN (Sandbox Demo: Any 4-5 digits)
              </label>
              <input
                type="password"
                value={mfsPin}
                onChange={(e) => setMfsPin(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 text-center text-lg font-mono font-bold tracking-widest"
                maxLength={5}
              />
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMfsStep('mfs_otp')}
                  className="flex-1 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={processFinalBooking}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg text-white shadow-lg ${
                    paymentMethod === 'bkash' ? 'bg-[#D12053]' : 'bg-[#F7941D]'
                  }`}
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {mfsStep === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#246BCE] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h4 className="font-bold text-base text-slate-800">
              Verifying Transaction & Issuing Ticket...
            </h4>
            <p className="text-xs text-slate-500">
              Executing atomic seat lock & generating verifiable QR token.
            </p>
          </div>
        )}

        {/* Regular Form Step */}
        {mfsStep === 'form' && (
          <form onSubmit={handleStartPayment} className="p-5 sm:p-6 space-y-5">
            {/* Booking Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-slate-600 block">Journey Date:</span>
                <span className="font-bold">{trip.departureDate}</span>
              </div>
              <div>
                <span className="text-slate-600 block">Departure:</span>
                <span className="font-bold">{formatTime24to12(trip.departureTime)}</span>
              </div>
              <div>
                <span className="text-slate-600 block">Seats Selected:</span>
                <span className="font-bold text-[#246BCE]">{selectedSeats.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-600 block">Total Payable:</span>
                <span className="font-bold text-slate-900 text-sm">{formatBDT(payableAmount)}</span>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Passenger Personal Details */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                1. Passenger Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('checkout.fullName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#246BCE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('checkout.phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+8801XXXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#246BCE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('checkout.email')} (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#246BCE]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('checkout.gender')}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#246BCE]"
                  >
                    <option value="male">{t('checkout.male')}</option>
                    <option value="female">{t('checkout.female')}</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                2. Select Payment Method
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition text-center ${
                    paymentMethod === 'bkash'
                      ? 'border-[#D12053] bg-pink-50/50 shadow-sm ring-2 ring-[#D12053]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="font-black text-[#D12053] text-sm">bKash</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Instant MFS</span>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition text-center ${
                    paymentMethod === 'nagad'
                      ? 'border-[#F7941D] bg-orange-50/50 shadow-sm ring-2 ring-[#F7941D]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="font-black text-[#F7941D] text-sm">Nagad</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Instant MFS</span>
                </button>

                {/* Cards */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition text-center ${
                    paymentMethod === 'card'
                      ? 'border-[#246BCE] bg-blue-50/50 shadow-sm ring-2 ring-[#246BCE]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#246BCE] mb-0.5" />
                  <span className="font-bold text-slate-800 text-xs">Visa / Master</span>
                </button>

                {/* Counter Cash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition text-center ${
                    paymentMethod === 'cash'
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-600'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <span className="font-black text-emerald-700 text-sm">Cash</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Pay at Counter</span>
                </button>
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <label className="flex items-start space-x-2 text-[11px] text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  required
                  className="rounded text-[#246BCE] mt-0.5"
                />
                <span>{t('checkout.termsAgree')}</span>
              </label>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#246BCE] hover:bg-[#1D4ED8] text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {paymentMethod === 'cash'
                    ? 'Confirm & Issue Ticket (Cash)'
                    : `Pay ${formatBDT(payableAmount)} via ${paymentMethod.toUpperCase()}`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
