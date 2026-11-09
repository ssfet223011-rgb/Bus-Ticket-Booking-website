import React from 'react';
import { Bus, PhoneCall, Mail, MapPin, ShieldCheck, CreditCard, Headphones, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#142B4A] text-slate-300 pt-16 pb-8 border-t border-[#1E3A8A] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-12 border-b border-slate-700/60 text-white">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#246BCE]/20 flex items-center justify-center text-[#F59E0B] shrink-0 border border-blue-500/20">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">50+ Bus Operators</h4>
              <p className="text-xs text-slate-400">All major AC, Sleeper & Non-AC fleets</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#246BCE]/20 flex items-center justify-center text-emerald-400 shrink-0 border border-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">100% Secure Checkout</h4>
              <p className="text-xs text-slate-400">Instant bKash, Nagad & Card payment</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#246BCE]/20 flex items-center justify-center text-amber-400 shrink-0 border border-blue-500/20">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">800+ Physical Counters</h4>
              <p className="text-xs text-slate-400">Integrated online & counter POS inventory</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#246BCE]/20 flex items-center justify-center text-rose-400 shrink-0 border border-blue-500/20">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-sm">24/7 Helpline 16460</h4>
              <p className="text-xs text-slate-400">Dedicated passenger support team</p>
            </div>
          </div>
        </div>

        {/* 4 Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-[#246BCE] flex items-center justify-center text-white font-bold shadow">
                <Bus className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Jatra<span className="text-[#F59E0B]">Sheba</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bangladesh's next-generation intercity multi-operator bus ticketing and unified counter POS management platform. Connecting travelers to over 500+ destinations nationwide.
            </p>
            <div className="pt-2 text-xs text-slate-300 space-y-1.5">
              <div className="flex items-center space-x-2">
                <PhoneCall className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>16460 / +880 9610-016460</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>support@jatrasheba.com.bd</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Tejgaon C/A, Dhaka 1208, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Col 2: Popular Routes */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 border-b border-slate-700/60 pb-2">
              Popular Routes
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-white transition cursor-pointer">Dhaka ⇄ Cox's Bazar (Scania AC & Sleeper)</li>
              <li className="hover:text-white transition cursor-pointer">Dhaka ⇄ Chattogram (Daily 80+ Trips)</li>
              <li className="hover:text-white transition cursor-pointer">Dhaka ⇄ Sylhet (Express Highway)</li>
              <li className="hover:text-white transition cursor-pointer">Dhaka ⇄ Rajshahi (Bangabandhu Bridge)</li>
              <li className="hover:text-white transition cursor-pointer">Dhaka ⇄ Khulna (Padma Bridge Route)</li>
              <li className="hover:text-white transition cursor-pointer">Dhaka ⇄ Barishal (Direct Express)</li>
              <li className="hover:text-white transition cursor-pointer">Chattogram ⇄ Cox's Bazar Tourist Buses</li>
            </ul>
          </div>

          {/* Col 3: Operators & Services */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 border-b border-slate-700/60 pb-2">
              Top Bus Operators
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-white transition cursor-pointer">Green Line Paribahan (Scania Multi-Axle)</li>
              <li className="hover:text-white transition cursor-pointer">Shohagh Paribahan (Volvo & Scania)</li>
              <li className="hover:text-white transition cursor-pointer">Hanif Enterprise (Nationwide Fleet)</li>
              <li className="hover:text-white transition cursor-pointer">Ena Travels (Luxury AC)</li>
              <li className="hover:text-white transition cursor-pointer">Desh Travels (VIP Sleeper Class)</li>
              <li className="hover:text-white transition cursor-pointer">JatraSheba Express (Own Managed Fleet)</li>
            </ul>
          </div>

          {/* Col 4: Payment Partners & Policies */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 border-b border-slate-700/60 pb-2">
              Accepted Payment Methods
            </h4>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/10 rounded p-1.5 text-center text-xs font-bold text-pink-400 border border-white/10">
                bKash
              </div>
              <div className="bg-white/10 rounded p-1.5 text-center text-xs font-bold text-orange-400 border border-white/10">
                Nagad
              </div>
              <div className="bg-white/10 rounded p-1.5 text-center text-xs font-bold text-purple-400 border border-white/10">
                Rocket
              </div>
              <div className="bg-white/10 rounded p-1.5 text-center text-xs font-bold text-blue-400 border border-white/10">
                VISA
              </div>
              <div className="bg-white/10 rounded p-1.5 text-center text-xs font-bold text-red-400 border border-white/10">
                Mastercard
              </div>
              <div className="bg-white/10 rounded p-1.5 text-center text-xs font-bold text-emerald-400 border border-white/10">
                Cash POS
              </div>
            </div>

            <h5 className="text-white text-xs font-semibold mb-2">Help & Policies</h5>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="hover:text-white transition cursor-pointer">Cancellation & Refund Policy</li>
              <li className="hover:text-white transition cursor-pointer">Terms of Service (BRTA Compliance)</li>
              <li className="hover:text-white transition cursor-pointer">Luggage & Baggage Guidelines</li>
              <li className="hover:text-white transition cursor-pointer">Counter Partner Registration</li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} JatraSheba Platform Ltd. All rights reserved.</p>
          <p className="text-[11px] text-slate-400">
            Certified Multi-Operator Transport Management & Counter POS System • Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
};
