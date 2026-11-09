import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Booking } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { formatBDT, formatTime24to12 } from '../../utils/seatHelpers';
import {
  Printer,
  Download,
  Share2,
  CheckCircle,
  Bus,
  Clock,
  MapPin,
  ShieldCheck,
  PhoneCall,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface ETicketCardProps {
  booking: Booking;
  onClose?: () => void;
  onPrintThermal?: () => void;
}

export const ETicketCard: React.FC<ETicketCardProps> = ({
  booking,
  onClose,
  onPrintThermal,
}) => {
  const { t } = useLanguage();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrintA4 = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto my-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4 no-print">
        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{t('ticket.successTitle')}</span>
          </span>
          <span className="text-xs text-slate-500 font-mono">
            Ref: {booking.bookingReference}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {onPrintThermal && (
            <button
              onClick={onPrintThermal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow transition"
              title="Print 80mm POS thermal receipt"
            >
              <Printer className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Thermal Receipt (80mm)</span>
            </button>
          )}

          <button
            onClick={handlePrintA4}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#246BCE] hover:bg-[#1D4ED8] text-white text-xs font-semibold shadow transition"
            title="Download PDF / Print Full Ticket"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF / Print</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
            >
              {t('common.close')}
            </button>
          )}
        </div>
      </div>

      {/* Printable E-Ticket Card (A4 Friendly Layout) */}
      <div
        ref={printRef}
        className="print-area a4-ticket bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden text-slate-800"
      >
        {/* Ticket Header */}
        <div className="bg-[#142B4A] text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-[#F59E0B]">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#246BCE] flex items-center justify-center text-white shadow-lg">
              <Bus className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight">JatraSheba</span>
                <span className="text-xs uppercase bg-[#F59E0B] text-slate-900 px-2 py-0.5 rounded font-black">
                  E-TICKET
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official Multi-Operator Intercity Passenger Boarding Pass
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
              Booking Reference
            </span>
            <span className="text-lg font-mono font-black text-[#F59E0B] tracking-wider block">
              {booking.bookingReference}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">
              Payment Status: PAID ({booking.paymentMethod.toUpperCase()})
            </span>
          </div>
        </div>

        {/* Operator & Journey Highlights */}
        <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Operator */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Bus Operator & Fleet
              </span>
              <h3 className="text-xl font-black text-[#142B4A]">{booking.operatorName}</h3>
              <p className="text-xs text-slate-600 font-semibold">{booking.coachNumber}</p>
            </div>

            {/* Journey Date & Time */}
            <div className="text-left md:text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Departure Schedule
              </span>
              <div className="flex items-center md:justify-center space-x-1.5 text-base font-black text-slate-800">
                <Calendar className="w-4 h-4 text-[#246BCE]" />
                <span>{booking.journeyDate}</span>
                <span>•</span>
                <Clock className="w-4 h-4 text-[#246BCE]" />
                <span>{formatTime24to12(booking.departureTime)}</span>
              </div>
            </div>

            {/* Seat Assignment */}
            <div className="text-left md:text-right">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Assigned Seats
              </span>
              <div className="inline-flex space-x-1">
                {booking.seatNumbers.map((sn) => (
                  <span
                    key={sn}
                    className="px-3 py-1 bg-[#246BCE] text-white font-mono font-black text-base rounded-lg shadow-sm"
                  >
                    {sn}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Core Ticket Details & QR Code Verification Section */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Passenger & Routing Info (Col 8) */}
          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">
                  Passenger Name
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {booking.passenger.fullName}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">
                  Contact Mobile
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {booking.passenger.phone}
                </span>
              </div>
            </div>

            {/* Boarding and Dropping points */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[#246BCE] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                    Boarding Point & Counter
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {booking.boardingPoint}
                  </p>
                </div>
              </div>

              <div className="w-0.5 h-4 bg-slate-200 ml-3.5"></div>

              <div className="flex items-start space-x-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-[#F59E0B] shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                    Dropping Point & Terminal
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {booking.droppingPoint}
                  </p>
                </div>
              </div>
            </div>

            {/* Fare Breakdown Row */}
            <div className="flex justify-between items-center px-4 py-3 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
              <span>Base: {formatBDT(booking.totalAmount)}</span>
              {booking.discountAmount > 0 && (
                <span className="text-emerald-700">
                  Discount: -{formatBDT(booking.discountAmount)}
                </span>
              )}
              <span>Fee: {formatBDT(booking.serviceFee)}</span>
              <span className="font-extrabold text-sm text-[#142B4A]">
                Total: {formatBDT(booking.payableAmount)}
              </span>
            </div>
          </div>

          {/* QR Code Verification Module (Col 4) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200 mb-2">
              <QRCodeSVG
                value={booking.qrPayload}
                size={140}
                level="H"
                includeMargin={false}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-600 block">
              Scan for Boarding Pass
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Secured HMAC Digital Signature
            </span>
            <div className="mt-2 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
              VERIFIED TICKET
            </div>
          </div>
        </div>

        {/* Travel Instructions Footer */}
        <div className="bg-slate-100 px-6 sm:px-8 py-4 border-t border-slate-200 text-slate-600 text-[11px] leading-relaxed">
          <div className="flex items-start space-x-2 mb-1.5 text-slate-700 font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
            <span>Important Passenger Travel Guidelines:</span>
          </div>
          <ol className="list-decimal pl-5 space-y-0.5 text-slate-500">
            <li>
              Please arrive at the boarding counter at least <strong>20 minutes prior</strong> to scheduled departure time.
            </li>
            <li>
              Present either this digital QR ticket or the booking SMS along with a valid photo ID upon boarding.
            </li>
            <li>
              Standard baggage allowance is 20kg per passenger. Flammable and hazardous goods are strictly prohibited.
            </li>
            <li>
              Cancellations and rescheduling must be requested at least 12 hours before departure via the helpline <strong>16460</strong>.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
