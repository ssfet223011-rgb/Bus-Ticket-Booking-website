import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Booking } from '../../types';
import { formatBDT, formatTime24to12 } from '../../utils/seatHelpers';
import { Printer, X } from 'lucide-react';

interface ThermalReceiptProps {
  booking: Booking;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({ booking, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-2xl">
        {/* Modal Controls (Hidden when printing) */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3 no-print">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
            <Printer className="w-4 h-4 text-[#F59E0B]" />
            <span>80mm POS Thermal Receipt</span>
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 bg-[#142B4A] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-lg transition"
            >
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable 80mm Receipt Area */}
        <div className="print-area thermal-receipt font-mono text-[11px] leading-tight text-black p-2 bg-white">
          <div className="text-center pb-2 border-b border-dashed border-black">
            <h2 className="font-black text-sm uppercase">{booking.operatorName}</h2>
            <p className="text-[10px]">PASSENGER BUS TICKET</p>
            <p className="text-[9px]">Counter: {booking.counterName || 'POS Sayedabad Central'}</p>
            <p className="text-[9px]">{new Date().toLocaleString()}</p>
          </div>

          <div className="py-2 border-b border-dashed border-black space-y-1">
            <div className="flex justify-between">
              <span>BOOKING REF:</span>
              <span className="font-bold">{booking.bookingReference}</span>
            </div>
            <div className="flex justify-between">
              <span>PASSENGER:</span>
              <span className="font-bold truncate max-w-[150px]">{booking.passenger.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span>PHONE:</span>
              <span className="font-bold">{booking.passenger.phone}</span>
            </div>
          </div>

          <div className="py-2 border-b border-dashed border-black space-y-1">
            <div>
              <span className="text-[9px] text-gray-600 block">JOURNEY:</span>
              <span className="font-bold block">
                {booking.trip?.originCity || 'Dhaka'} ➔ {booking.trip?.destinationCity || 'Destination'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>COACH:</span>
              <span className="font-bold">{booking.coachNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>DATE:</span>
              <span className="font-bold">{booking.journeyDate}</span>
            </div>
            <div className="flex justify-between">
              <span>TIME:</span>
              <span className="font-bold">{formatTime24to12(booking.departureTime)}</span>
            </div>
            <div className="flex justify-between">
              <span>SEATS:</span>
              <span className="font-bold text-xs">{booking.seatNumbers.join(', ')}</span>
            </div>
          </div>

          <div className="py-2 border-b border-dashed border-black space-y-1">
            <div className="text-[9px]">BOARDING: {booking.boardingPoint}</div>
            <div className="text-[9px]">DROPPING: {booking.droppingPoint}</div>
          </div>

          <div className="py-2 border-b-2 border-black space-y-1 font-bold">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>{formatBDT(booking.totalAmount)}</span>
            </div>
            {booking.discountAmount > 0 && (
              <div className="flex justify-between">
                <span>DISCOUNT:</span>
                <span>-{formatBDT(booking.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs pt-1">
              <span>TOTAL PAID:</span>
              <span>{formatBDT(booking.payableAmount)}</span>
            </div>
            <div className="text-[9px] text-right font-normal">
              Method: {booking.paymentMethod.toUpperCase()} (VERIFIED)
            </div>
          </div>

          {/* QR Code on Receipt */}
          <div className="pt-3 pb-1 text-center flex flex-col items-center">
            <QRCodeSVG value={booking.qrPayload} size={88} level="M" />
            <span className="text-[8px] mt-1 tracking-wider">{booking.bookingReference}</span>
            <p className="text-[8px] mt-1 italic">
              Please present this ticket at boarding. Helpline: 16460
            </p>
            <p className="text-[8px] font-bold mt-1">*** SHUVO JATRA ***</p>
          </div>
        </div>
      </div>
    </div>
  );
};
