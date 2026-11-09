import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { BusOperator, Counter, Trip, Booking } from '../../types';
import { formatBDT } from '../../utils/seatHelpers';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Bus,
  Users,
  Store,
  Layers,
  Settings,
  FileText,
  CheckCircle,
  XCircle,
  PlusCircle,
  Search,
  Filter,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { trips, operators, counters, bookings } = useBooking();

  const [activeTab, setActiveTab] = useState<'overview' | 'operators' | 'counters' | 'settlements' | 'audit'>(
    'overview'
  );

  // Compute live statistics from actual state
  const totalRevenue = bookings.reduce((sum, b) => sum + b.payableAmount, 0);
  const totalBookingsCount = bookings.length;
  const onlineBookingsCount = bookings.filter((b) => b.bookingChannel === 'website').length;
  const counterBookingsCount = bookings.filter((b) => b.bookingChannel === 'counter').length;
  const totalCommissionRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount * 0.05), 0);

  const totalCapacity = trips.reduce((sum, t) => sum + t.totalSeats, 0);
  const totalOccupied = trips.reduce((sum, t) => sum + (t.totalSeats - t.availableSeats), 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 74;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Super Admin Top Banner */}
      <div className="bg-[#142B4A] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-[#1E3A8A]">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black">Super Admin Command Center</h2>
              <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2 py-0.5 rounded border border-purple-400/30">
                Full Platform Authority
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Bangladesh Transportation Ecosystem • Central Inventory & Multi-Tenant Supervision
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center bg-white/10 p-1 rounded-2xl border border-white/15 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'overview' ? 'bg-white text-[#142B4A] shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('operators')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'operators' ? 'bg-white text-[#142B4A] shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Operators ({operators.length})
          </button>
          <button
            onClick={() => setActiveTab('counters')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'counters' ? 'bg-white text-[#142B4A] shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Counters ({counters.length})
          </button>
          <button
            onClick={() => setActiveTab('settlements')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'settlements' ? 'bg-white text-[#142B4A] shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Settlements
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-xl transition ${
              activeTab === 'audit' ? 'bg-white text-[#142B4A] shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <span className="text-xs text-slate-600 font-semibold block">Total Gross Revenue</span>
              <span className="text-2xl font-black text-[#142B4A] block mt-1">
                {formatBDT(totalRevenue)}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">Across all operators</span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <span className="text-xs text-slate-600 font-semibold block">Platform Commission Earned</span>
              <span className="text-2xl font-black text-[#246BCE] block mt-1">
                {formatBDT(totalCommissionRevenue)}
              </span>
              <span className="text-[11px] text-slate-400">Net platform fee</span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <span className="text-xs text-slate-600 font-semibold block">Booking Channels</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-base font-black text-purple-600">Web: {onlineBookingsCount}</span>
                <span className="text-slate-400">|</span>
                <span className="text-base font-black text-[#F59E0B]">POS: {counterBookingsCount}</span>
              </div>
              <span className="text-[11px] text-slate-400">Total: {totalBookingsCount} bookings</span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <span className="text-xs text-slate-600 font-semibold block">Fleet Occupancy</span>
              <span className="text-2xl font-black text-emerald-600 block mt-1">
                {occupancyRate}%
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">Healthy load factor</span>
            </div>
          </div>

          {/* Recent Global Bookings */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-base text-[#142B4A]">
              Latest Platform Bookings (Live Supabase Stream)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Operator</th>
                    <th className="pb-3">Passenger</th>
                    <th className="pb-3">Channel</th>
                    <th className="pb-3">Seats</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-mono font-bold text-[#246BCE]">
                        {b.bookingReference}
                      </td>
                      <td className="py-3 font-semibold text-slate-800">
                        {b.operatorName}
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-slate-800">{b.passenger.fullName}</div>
                        <div className="text-[11px] text-slate-400">{b.passenger.phone}</div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`uppercase text-[10px] font-bold px-2 py-0.5 rounded ${
                            b.bookingChannel === 'counter'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {b.bookingChannel}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-slate-700">
                        {b.seatNumbers.join(', ')}
                      </td>
                      <td className="py-3 font-bold text-slate-900">
                        {formatBDT(b.payableAmount)}
                      </td>
                      <td className="py-3">
                        <span className="uppercase text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-50 text-emerald-700">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Operators Management Tab */}
      {activeTab === 'operators' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base text-[#142B4A]">
              Registered Bus Operators & Commission Agreements
            </h3>
            <button className="px-3 py-1.5 bg-[#246BCE] text-white rounded-xl text-xs font-bold shadow hover:bg-[#1D4ED8]">
              + Onboard Operator
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Operator Name</th>
                  <th className="pb-3">Code</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Fleet Size</th>
                  <th className="pb-3">Platform Comm %</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operators.map((op) => (
                  <tr key={op.id} className="hover:bg-slate-50">
                    <td className="py-3">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={op.logoUrl}
                          alt={op.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-bold text-slate-800">{op.name}</div>
                          {op.isOwnFleet && (
                            <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-semibold">
                              Own Managed Fleet
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-600">{op.code}</td>
                    <td className="py-3">
                      <div>{op.contactPhone}</div>
                      <div className="text-[10px] text-slate-400">{op.contactEmail}</div>
                    </td>
                    <td className="py-3 font-bold text-slate-800">{op.totalBuses || 30} Buses</td>
                    <td className="py-3 font-bold text-[#246BCE]">{op.commissionRate}%</td>
                    <td className="py-3">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        {op.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button className="text-xs text-[#246BCE] hover:underline font-semibold">
                        Edit Terms
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Counters Tab */}
      {activeTab === 'counters' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base text-[#142B4A]">
              Physical Ticket Counters (Nationwide POS Terminals)
            </h3>
            <span className="text-xs text-slate-500">
              Total {counters.length} Counters Connected
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Counter Code</th>
                  <th className="pb-3">Branch Name</th>
                  <th className="pb-3">Operator</th>
                  <th className="pb-3">City & Location</th>
                  <th className="pb-3">Phone</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {counters.map((cnt) => (
                  <tr key={cnt.id} className="hover:bg-slate-50">
                    <td className="py-3 font-mono font-bold text-[#246BCE]">{cnt.code}</td>
                    <td className="py-3 font-bold text-slate-800">{cnt.name}</td>
                    <td className="py-3 text-slate-600">{cnt.operatorName}</td>
                    <td className="py-3">
                      <div>{cnt.city}</div>
                      <div className="text-[10px] text-slate-400">{cnt.address}</div>
                    </td>
                    <td className="py-3 font-mono text-slate-600">{cnt.phone}</td>
                    <td className="py-3">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        Active POS
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settlements Tab */}
      {activeTab === 'settlements' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-base text-[#142B4A]">
            Financial Settlement Statements & Operator Payouts
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Operator</th>
                  <th className="pb-3">Period</th>
                  <th className="pb-3">Gross Sales</th>
                  <th className="pb-3">Platform Comm. (5%)</th>
                  <th className="pb-3">Net Payable</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operators.map((op) => {
                  const gross = (op.totalTrips || 50) * 14500;
                  const comm = (gross * op.commissionRate) / 100;
                  const net = gross - comm;
                  return (
                    <tr key={op.id} className="hover:bg-slate-50">
                      <td className="py-3 font-bold text-slate-800">{op.name}</td>
                      <td className="py-3 text-slate-500">Current Billing Cycle</td>
                      <td className="py-3 font-bold text-slate-900">{formatBDT(gross)}</td>
                      <td className="py-3 text-rose-600 font-bold">-{formatBDT(comm)}</td>
                      <td className="py-3 font-black text-emerald-700">{formatBDT(net)}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-[#246BCE] font-bold text-[10px] uppercase">
                          Ready for EFT
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="px-2.5 py-1 bg-[#142B4A] hover:bg-[#1E3A8A] text-white text-[11px] rounded-lg font-bold">
                          Process Payout
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-extrabold text-base text-[#142B4A]">
            System Audit & Security Activity Logs
          </h3>
          <div className="space-y-2">
            {[
              {
                time: 'Just now',
                user: 'Farabi Rahman (Super Admin)',
                action: 'COMMISSION_SETTING_VERIFIED',
                details: 'Confirmed billing rate 5.0% for Green Line and Shohagh',
              },
              {
                time: '15 mins ago',
                user: 'Md. Rafiqul Islam (Sayedabad POS)',
                action: 'COUNTER_TICKET_ISSUED',
                details: 'Issued ticket BD-20261103-GLP001 via Cash POS',
              },
              {
                time: '1 hour ago',
                user: 'Automated Realtime Cron',
                action: 'RELEASE_EXPIRED_HOLDS',
                details: 'Checked trip_seats table and unheld 2 timed-out reservations',
              },
            ].map((log, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-slate-800">{log.action}</div>
                  <div className="text-slate-500">{log.details}</div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  <div className="font-medium text-slate-600">{log.user}</div>
                  <div>{log.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
