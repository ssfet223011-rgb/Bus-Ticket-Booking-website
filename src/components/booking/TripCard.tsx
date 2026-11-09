import React from 'react';
import {
  Trip,
} from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { formatBDT, formatTime24to12 } from '../../utils/seatHelpers';
import {
  Bus,
  Clock,
  MapPin,
  Star,
  Wifi,
  Coffee,
  Tv,
  Zap,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { SeatMap } from './SeatMap';

interface TripCardProps {
  trip: Trip;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onProceedToCheckout: () => void;
  isCounterMode?: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({
  trip,
  isExpanded,
  onToggleExpand,
  onProceedToCheckout,
  isCounterMode = false,
}) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
      {/* Top Main Section */}
      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Operator Info & Coach details */}
          <div className="flex items-start space-x-3.5">
            <img
              src={trip.operatorLogo}
              alt={trip.operatorName}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base sm:text-lg text-[#142B4A]">
                  {trip.operatorName}
                </h3>
                <span className="flex items-center space-x-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                  <span>{trip.rating}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                <span className="text-slate-700 font-semibold">{trip.coachNumber}</span>
                <span>•</span>
                <span className={trip.isAc ? 'text-[#246BCE] font-bold' : 'text-slate-600'}>
                  {trip.busCategory}
                </span>
              </div>
            </div>
          </div>

          {/* Schedule: Departure ➔ Duration ➔ Arrival */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="text-left">
              <span className="text-xs text-slate-400 font-medium block">Departure</span>
              <span className="text-base sm:text-lg font-extrabold text-[#142B4A]">
                {formatTime24to12(trip.departureTime)}
              </span>
              <span className="text-xs text-slate-500 block truncate max-w-[120px]">
                {trip.boardingPoints[0]?.name || trip.originCity}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[11px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-full mb-1">
                {trip.duration}
              </span>
              <div className="w-16 sm:w-24 h-0.5 bg-slate-300 relative">
                <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-[#246BCE]"></div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-medium block">Arrival</span>
              <span className="text-base sm:text-lg font-extrabold text-[#142B4A]">
                {formatTime24to12(trip.arrivalTime)}
              </span>
              <span className="text-xs text-slate-500 block truncate max-w-[120px]">
                {trip.droppingPoints[0]?.name || trip.destinationCity}
              </span>
            </div>
          </div>

          {/* Pricing & View Seats CTA */}
          <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
            <div className="text-left lg:text-right">
              <span className="text-xs text-slate-600 block">{t('results.fare')}</span>
              <span className="text-xl sm:text-2xl font-black text-[#142B4A]">
                {formatBDT(trip.baseFare)}
              </span>
              <span
                className={`text-xs font-semibold block ${
                  trip.availableSeats < 5 ? 'text-rose-600 font-bold' : 'text-emerald-600'
                }`}
              >
                {trip.availableSeats} {t('results.seatsAvailable')}
              </span>
            </div>

            <button
              onClick={onToggleExpand}
              className={`mt-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition shadow-sm ${
                isExpanded
                  ? 'bg-slate-800 text-white hover:bg-slate-900'
                  : 'bg-[#246BCE] text-white hover:bg-[#1D4ED8]'
              }`}
            >
              <span>{isExpanded ? t('results.hideSeats') : t('results.viewSeats')}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Facilities badges */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
          <span className="font-semibold text-slate-400">Amenities:</span>
          {trip.facilities.map((fac, idx) => (
            <span
              key={idx}
              className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-medium"
            >
              {fac}
            </span>
          ))}
        </div>
      </div>

      {/* Expanded Interactive Seat Map Section */}
      {isExpanded && (
        <SeatMap
          trip={trip}
          onProceedToCheckout={onProceedToCheckout}
          isCounterMode={isCounterMode}
        />
      )}
    </div>
  );
};
