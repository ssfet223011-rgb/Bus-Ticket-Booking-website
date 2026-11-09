import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { Booking } from '../../types';
import { formatBDT, formatTime24to12 } from '../../utils/seatHelpers';
import {
  QrCode,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Bus,
  User,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose }) => {
  const { verifyTicketQr, bookings } = useBooking();
  const [inputCode, setInputCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    booking?: Booking;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = verifyTicketQr(inputCode.trim());
    setVerificationResult(res);
  };

  const handleQuickDemoVerify = (bookingRef: string) => {
    setInputCode(bookingRef);
    const res = verifyTicketQr(bookingRef);
    setVerificationResult(res);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-[#142B4A] text-white p-5 flex justify-between items-center">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#246BCE] flex items-center justify-center text-white">
              <QrCode className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Conductor QR Ticket Verifier</h3>
              <p className="text-xs text-slate-300">Live Boarding & Ticket Validation Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Scan QR Payload or Enter Booking Ref / Ticket ID
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="e.g. BD-20261103-GLP001"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-[#246BCE]"
                required
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#246BCE] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1"
              >
                <Search className="w-4 h-4" />
                <span>Verify</span>
              </button>
            </div>

            {/* Quick click demo references */}
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 pt-1">
              <span>Quick Test:</span>
              {bookings.slice(0, 2).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => handleQuickDemoVerify(b.bookingReference)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 text-[#246BCE] font-mono font-semibold transition"
                >
                  {b.bookingReference}
                </button>
              ))}
            </div>
          </form>

          {/* Verification Status Result */}
          {verificationResult && (
            <div
              className={`p-4 rounded-2xl border ${
                verificationResult.valid
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-start space-x-3">
                {verificationResult.valid ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-extrabold text-sm">{verificationResult.message}</h4>
                  {verificationResult.booking && (
                    <div className="mt-3 space-y-2 text-xs text-slate-700 bg-white/80 p-3 rounded-xl border border-slate-200">
                      <div className="flex justify-between font-bold">
                        <span>Passenger:</span>
                        <span>{verificationResult.booking.passenger.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mobile:</span>
                        <span className="font-mono">{verificationResult.booking.passenger.phone}</span>
                      </div>
                      <div className="flex justify-between font-bold text-[#246BCE]">
                        <span>Assigned Seats:</span>
                        <span className="text-sm font-black">
                          {verificationResult.booking.seatNumbers.join(', ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Operator & Coach:</span>
                        <span>
                          {verificationResult.booking.operatorName} (
                          {verificationResult.booking.coachNumber})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Boarding:</span>
                        <span className="text-right truncate max-w-[200px]">
                          {verificationResult.booking.boardingPoint}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold">
                        <span>Status:</span>
                        <span className="uppercase text-emerald-600">
                          {verificationResult.booking.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
