import React from 'react';
import { Filter, RotateCcw, Clock, Bus, DollarSign } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatBDT } from '../../utils/seatHelpers';

export interface FilterState {
  departureTimes: string[]; // 'morning' | 'afternoon' | 'night'
  busTypes: string[]; // 'ac' | 'non-ac' | 'sleeper' | 'seater'
  operators: string[];
  maxPrice: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  availableOperators: string[];
  onReset: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  setFilters,
  availableOperators,
  onReset,
}) => {
  const { t } = useLanguage();

  const handleTimeToggle = (slot: string) => {
    setFilters((prev) => ({
      ...prev,
      departureTimes: prev.departureTimes.includes(slot)
        ? prev.departureTimes.filter((s) => s !== slot)
        : [...prev.departureTimes, slot],
    }));
  };

  const handleTypeToggle = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      busTypes: prev.busTypes.includes(type)
        ? prev.busTypes.filter((t) => t !== type)
        : [...prev.busTypes, type],
    }));
  };

  const handleOperatorToggle = (op: string) => {
    setFilters((prev) => ({
      ...prev,
      operators: prev.operators.includes(op)
        ? prev.operators.filter((o) => o !== op)
        : [...prev.operators, op],
    }));
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 text-slate-800 space-y-6">
      {/* Title & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 font-bold text-base text-[#142B4A]">
          <Filter className="w-4 h-4 text-[#246BCE]" />
          <span>{t('results.filters')}</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center space-x-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t('results.resetFilters')}</span>
        </button>
      </div>

      {/* 1. Departure Time Slots */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-[#246BCE]" />
          <span>{t('results.departureTime')}</span>
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'morning', label: '6am - 12pm (Morning)' },
            { id: 'afternoon', label: '12pm - 6pm (Afternoon)' },
            { id: 'night', label: '6pm - 6am (Night)' },
          ].map((slot) => {
            const isChecked = filters.departureTimes.includes(slot.id);
            return (
              <label
                key={slot.id}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer border transition ${
                  isChecked
                    ? 'bg-blue-50/80 border-[#246BCE] text-[#246BCE] font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{slot.label}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleTimeToggle(slot.id)}
                  className="rounded text-[#246BCE] focus:ring-0"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Bus Categories */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
          <Bus className="w-3.5 h-3.5 text-[#246BCE]" />
          <span>{t('results.busType')}</span>
        </label>
        <div className="space-y-1.5">
          {[
            { id: 'ac', label: 'AC Luxury Coach' },
            { id: 'non-ac', label: 'Non-AC Deluxe' },
            { id: 'sleeper', label: 'Royal Sleeper' },
            { id: '2+1', label: 'VIP Business (2+1)' },
          ].map((type) => {
            const isChecked = filters.busTypes.includes(type.id);
            return (
              <label
                key={type.id}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer border transition ${
                  isChecked
                    ? 'bg-blue-50/80 border-[#246BCE] text-[#246BCE] font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{type.label}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleTypeToggle(type.id)}
                  className="rounded text-[#246BCE] focus:ring-0"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Bus Operators */}
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
          <Bus className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>{t('results.operator')}</span>
        </label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {availableOperators.map((operatorName) => {
            const isChecked = filters.operators.includes(operatorName);
            return (
              <label
                key={operatorName}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer border transition ${
                  isChecked
                    ? 'bg-blue-50/80 border-[#246BCE] text-[#246BCE] font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate pr-2">{operatorName}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleOperatorToggle(operatorName)}
                  className="rounded text-[#246BCE] focus:ring-0"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Price Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('results.priceRange')}</span>
          </label>
          <span className="text-xs font-bold text-[#246BCE]">
            Up to {formatBDT(filters.maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="500"
          max="3000"
          step="50"
          value={filters.maxPrice}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
          }
          className="w-full accent-[#246BCE] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-slate-600 font-medium mt-1">
          <span>৳ 500</span>
          <span>৳ 3,000</span>
        </div>
      </div>
    </div>
  );
};
