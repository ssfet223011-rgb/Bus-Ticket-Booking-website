import React, { useState } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { Trip, LayoutType, Bus, Driver, Helper, Counter, Booking } from '../../types';
import { formatBDT, formatTime24to12 } from '../../utils/seatHelpers';
import {
  Bus as BusIcon,
  Calendar,
  Clock,
  PlusCircle,
  Users,
  Printer,
  DollarSign,
  TrendingUp,
  Award,
  CheckCircle,
  X,
  Filter,
  ShieldCheck,
  MapPin,
  Lock,
  Unlock,
  AlertTriangle,
  UserCheck,
  UserX,
  Key,
  LogOut,
  Sliders,
  Settings,
  ArrowRight,
  PhoneCall,
  Search,
} from 'lucide-react';

export const OperatorDashboard: React.FC = () => {
  const {
    trips,
    operators,
    buses,
    drivers,
    helpers,
    counters,
    bookings,
    tripSeats,
    addTrip,
    updateTripStatus,
    cancelTrip,
    addBus,
    updateBusStatus,
    addDriver,
    addHelper,
    addCounter,
    operatorCancelSeat,
    operatorBlockSeat,
    operatorUnblockSeat,
  } = useBooking();

  const { currentUser, loginAsOperator, loginWithCredentials, operatorAccounts } = useAuth();

  // Active operator (matches currentUser's operatorId, or defaults to Green Line 'op-01')
  const currentOperator =
    operators.find((op) => op.id === currentUser?.operatorId) || operators[0];

  // Operator navigation tabs
  const [activeTab, setActiveTab] = useState<
    'trips' | 'seats' | 'fleet' | 'manifest' | 'counters' | 'staff' | 'finance'
  >('trips');

  // Filter operator's data
  const operatorTrips = trips.filter((t) => t.operatorId === currentOperator.id);
  const operatorBuses = buses.filter((b) => b.operatorId === currentOperator.id);
  const operatorDrivers = drivers.filter((d) => d.operatorId === currentOperator.id);
  const operatorHelpers = helpers.filter((h) => h.operatorId === currentOperator.id);
  const operatorCounters = counters.filter((c) => c.operatorId === currentOperator.id);
  const operatorBookings = bookings.filter((b) => b.operatorId === currentOperator.id);

  // Financial calculations
  const totalRevenue = operatorBookings.reduce((sum, b) => sum + b.payableAmount, 0);
  const platformCommission = (totalRevenue * currentOperator.commissionRate) / 100;
  const netEarnings = totalRevenue - platformCommission;

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAddBusModalOpen, setIsAddBusModalOpen] = useState(false);
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false);
  const [isAddHelperModalOpen, setIsAddHelperModalOpen] = useState(false);
  const [isAddCounterModalOpen, setIsAddCounterModalOpen] = useState(false);

  // Seat Cancellation & Blocking Modal state
  const [selectedSeatTrip, setSelectedSeatTrip] = useState<Trip>(operatorTrips[0] || trips[0]);
  const [targetSeatNumber, setTargetSeatNumber] = useState<string | null>(null);
  const [cancelSeatReason, setCancelSeatReason] = useState('Passenger phone cancellation request');
  const [blockSeatReason, setBlockSeatReason] = useState('VIP / Government Official Quota');
  const [seatActionType, setSeatActionType] = useState<'cancel' | 'block' | null>(null);

  // Manifest selection
  const [selectedManifestTrip, setSelectedManifestTrip] = useState<Trip | null>(
    operatorTrips[0] || null
  );

  // Boarding check-ins map (bookingId-seatNumber -> boolean)
  const [boardedMap, setBoardedMap] = useState<Record<string, boolean>>({});

  // New Trip Form state
  const [tripOrigin, setTripOrigin] = useState('Dhaka');
  const [tripDestination, setTripDestination] = useState("Cox's Bazar");
  const [tripCoachNum, setTripCoachNum] = useState(
    operatorBuses[0]?.coachNumber || 'GL-501 (Scania Multi-Axle)'
  );
  const [tripCategory, setTripCategory] = useState('Scania Multi-Axle Luxury AC');
  const [tripLayoutType, setTripLayoutType] = useState<LayoutType>('2+2');
  const [tripIsAc, setTripIsAc] = useState(true);
  const [tripDeptDate, setTripDeptDate] = useState(new Date().toISOString().split('T')[0]);
  const [tripDeptTime, setTripDeptTime] = useState('22:30');
  const [tripArrTime, setTripArrTime] = useState('07:00');
  const [tripDuration, setTripDuration] = useState('8h 30m');
  const [tripFare, setTripFare] = useState(1600);

  // New Bus Form state
  const [newBusCoachNo, setNewBusCoachNo] = useState('');
  const [newBusModel, setNewBusModel] = useState('');
  const [newBusRegNo, setNewBusRegNo] = useState('');
  const [newBusCategory, setNewBusCategory] = useState('Scania Luxury AC');
  const [newBusLayout, setNewBusLayout] = useState<LayoutType>('2+2');
  const [newBusHasGps, setNewBusHasGps] = useState(true);

  // New Driver Form state
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('+8801');
  const [driverLicense, setDriverLicense] = useState('');

  // New Helper Form state
  const [helperName, setHelperName] = useState('');
  const [helperPhone, setHelperPhone] = useState('+8801');

  // New Counter Form state
  const [counterName, setCounterName] = useState('');
  const [counterCode, setCounterCode] = useState('');
  const [counterCity, setCounterCity] = useState('Dhaka');
  const [counterAddress, setCounterAddress] = useState('');
  const [counterPhone, setCounterPhone] = useState('+8801');
  const [counterContactPerson, setCounterContactPerson] = useState('');

  // Payout request message
  const [payoutRequested, setPayoutRequested] = useState(false);

  // Handlers
  const handleOperatorLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginWithCredentials(loginEmail, loginPassword);
    if (res.success) {
      setIsLoginModalOpen(false);
      setLoginError('');
      setLoginPassword('');
    } else {
      setLoginError(res.message);
    }
  };

  const handleQuickOperatorSwitch = (opId: string) => {
    loginAsOperator(opId);
    setIsLoginModalOpen(false);
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    addTrip({
      operatorId: currentOperator.id,
      operatorName: currentOperator.name,
      operatorLogo: currentOperator.logoUrl,
      busId: 'bus-' + Math.random().toString(36).substring(2, 7),
      coachNumber: tripCoachNum,
      busCategory: tripCategory,
      isAc: tripIsAc,
      layoutType: tripLayoutType,
      originCity: tripOrigin,
      destinationCity: tripDestination,
      departureDate: tripDeptDate,
      departureTime: tripDeptTime,
      arrivalTime: tripArrTime,
      duration: tripDuration,
      baseFare: tripFare,
      boardingPoints: [
        { id: 'bp-1', name: `${tripOrigin} Terminal Gate 1`, time: tripDeptTime },
        { id: 'bp-2', name: `${tripOrigin} Arambagh Stand`, time: '23:15' },
      ],
      droppingPoints: [
        { id: 'dp-1', name: `${tripDestination} Central Counter`, time: tripArrTime },
      ],
      status: 'scheduled',
      rating: currentOperator.rating,
      facilities: ['Water', 'Blanket', 'Wi-Fi', 'Charging Port'],
    });

    setIsScheduleModalOpen(false);
    alert('New trip scheduled successfully and live inventory activated!');
  };

  const handleCreateBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBusCoachNo || !newBusRegNo) return;
    addBus({
      operatorId: currentOperator.id,
      operatorName: currentOperator.name,
      categoryId: 'cat-' + Math.random().toString(36).substring(2, 6),
      categoryName: newBusCategory,
      seatLayoutId: 'ly-01',
      registrationNumber: newBusRegNo,
      coachNumber: newBusCoachNo,
      model: newBusModel || 'Scania Touring HD',
      hasGps: newBusHasGps,
      status: 'active',
    });
    setIsAddBusModalOpen(false);
    setNewBusCoachNo('');
    setNewBusRegNo('');
    alert('Bus successfully registered in fleet!');
  };

  const handleCreateDriver = (e: React.FormEvent) => {
    e.preventDefault();
    addDriver({
      operatorId: currentOperator.id,
      fullName: driverName,
      phone: driverPhone,
      licenseNumber: driverLicense,
      status: 'active',
    });
    setIsAddDriverModalOpen(false);
    setDriverName('');
    setDriverLicense('');
    alert('Driver registered successfully!');
  };

  const handleCreateHelper = (e: React.FormEvent) => {
    e.preventDefault();
    addHelper({
      operatorId: currentOperator.id,
      fullName: helperName,
      phone: helperPhone,
      status: 'active',
    });
    setIsAddHelperModalOpen(false);
    setHelperName('');
    alert('Conductor/Helper registered successfully!');
  };

  const handleCreateCounter = (e: React.FormEvent) => {
    e.preventDefault();
    addCounter({
      operatorId: currentOperator.id,
      operatorName: currentOperator.name,
      name: counterName,
      code: counterCode || 'CNT-' + Math.floor(100 + Math.random() * 900),
      city: counterCity,
      address: counterAddress,
      latitude: 23.75,
      longitude: 90.38,
      phone: counterPhone,
      contactPerson: counterContactPerson,
      isActive: true,
      todaySales: 0,
      todayBookings: 0,
    });
    setIsAddCounterModalOpen(false);
    setCounterName('');
    setCounterAddress('');
    alert('Counter added successfully!');
  };

  const handleExecuteCancelSeat = () => {
    if (!selectedSeatTrip || !targetSeatNumber) return;
    operatorCancelSeat(selectedSeatTrip.id, targetSeatNumber, cancelSeatReason);
    setSeatActionType(null);
    setTargetSeatNumber(null);
    alert(`Seat ${targetSeatNumber} has been CANCELLED and released back to available inventory.`);
  };

  const handleExecuteBlockSeat = () => {
    if (!selectedSeatTrip || !targetSeatNumber) return;
    operatorBlockSeat(selectedSeatTrip.id, targetSeatNumber, blockSeatReason);
    setSeatActionType(null);
    setTargetSeatNumber(null);
    alert(`Seat ${targetSeatNumber} has been RESERVED / BLOCKED from booking.`);
  };

  const handleExecuteUnblockSeat = (seatNo: string) => {
    if (!selectedSeatTrip) return;
    operatorUnblockSeat(selectedSeatTrip.id, seatNo);
    alert(`Seat ${seatNo} has been UNBLOCKED and is now available for sale.`);
  };

  const manifestPassengers = selectedManifestTrip
    ? bookings.filter((b) => b.tripId === selectedManifestTrip.id && b.status !== 'cancelled')
    : [];

  const currentTripSeatsList = tripSeats[selectedSeatTrip?.id] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Operator Banner Header & Company Login Switcher */}
      <div className="bg-gradient-to-r from-[#142B4A] to-[#1E3A8A] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-blue-900">
        <div className="flex items-center space-x-4">
          <img
            src={currentOperator.logoUrl}
            alt={currentOperator.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow-lg shrink-0"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black">{currentOperator.name}</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded border border-emerald-400/30">
                ★ {currentOperator.rating} Rated
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Operator Code: <strong>{currentOperator.code}</strong> • Logged In As:{' '}
              <span className="text-[#F59E0B] font-bold">{currentUser?.fullName}</span> (
              {currentUser?.email})
            </p>
          </div>
        </div>

        {/* Action Controls: Switch Company Account & Schedule Trip */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition cursor-pointer"
            title="Switch operator company login"
          >
            <Key className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Switch Bus Company Login</span>
          </button>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#F59E0B] hover:bg-amber-400 text-slate-900 rounded-xl text-xs font-black shadow-lg transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Schedule New Trip</span>
          </button>
        </div>
      </div>

      {/* Operator Control Tabs Bar */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200 flex flex-wrap gap-1.5 text-xs font-bold">
        <button
          onClick={() => setActiveTab('trips')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
            activeTab === 'trips'
              ? 'bg-[#142B4A] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#F59E0B]" />
          <span>Trip Schedules ({operatorTrips.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('seats')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
            activeTab === 'seats'
              ? 'bg-[#142B4A] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Lock className="w-4 h-4 text-purple-400" />
          <span>Seat Cancellation & Quota Control</span>
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
            activeTab === 'fleet'
              ? 'bg-[#142B4A] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BusIcon className="w-4 h-4 text-emerald-500" />
          <span>Fleet Buses ({operatorBuses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('manifest')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
            activeTab === 'manifest'
              ? 'bg-[#142B4A] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-[#246BCE]" />
          <span>Passenger Manifest</span>
        </button>

        <button
          onClick={() => setActiveTab('counters')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
            activeTab === 'counters'
              ? 'bg-[#142B4A] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4 text-rose-500" />
          <span>Company Counters ({operatorCounters.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
            activeTab === 'staff'
              ? 'bg-[#142B4A] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4 text-amber-500" />
          <span>Drivers & Helpers ({operatorDrivers.length + operatorHelpers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 ${
            activeTab === 'finance'
              ? 'bg-[#142B4A] text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>Settlements & Payouts</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TRIP SCHEDULES & DEPARTURES */}
      {/* ========================================================================= */}
      {activeTab === 'trips' && (
        <div className="space-y-6">
          {/* Summary KPI Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">Scheduled Departures</span>
              <span className="text-2xl font-black text-[#142B4A] block mt-1">
                {operatorTrips.length}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">Daily Active Rosters</span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">Company Fleet</span>
              <span className="text-2xl font-black text-[#246BCE] block mt-1">
                {operatorBuses.length} Buses
              </span>
              <span className="text-[11px] text-slate-400">Scania, Volvo, Hyundai</span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">Confirmed Bookings</span>
              <span className="text-2xl font-black text-emerald-600 block mt-1">
                {operatorBookings.length}
              </span>
              <span className="text-[11px] text-slate-400">Online & Physical Counter</span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold block">Gross Ticket Sales</span>
              <span className="text-2xl font-black text-[#F59E0B] block mt-1">
                {formatBDT(totalRevenue)}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold">5% Commission: -{formatBDT(platformCommission)}</span>
            </div>
          </div>

          {/* Active Trips Table */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-[#142B4A]">
                Active Trips & Coach Departures
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(true)}
                className="px-3 py-1.5 bg-[#246BCE] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Add Schedule</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Coach No</th>
                    <th className="pb-3">Route</th>
                    <th className="pb-3">Departure Date/Time</th>
                    <th className="pb-3">Class</th>
                    <th className="pb-3">Available / Total</th>
                    <th className="pb-3">Fare</th>
                    <th className="pb-3">Status Control</th>
                    <th className="pb-3">Seat Management</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {operatorTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 font-bold text-slate-800">{trip.coachNumber}</td>
                      <td className="py-3 font-semibold text-[#246BCE]">
                        {trip.originCity} ➔ {trip.destinationCity}
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-slate-800">{trip.departureDate}</div>
                        <div className="text-[11px] text-slate-400">
                          {formatTime24to12(trip.departureTime)}
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {trip.busCategory}
                        </span>
                      </td>
                      <td className="py-3 font-bold">
                        <span className="text-emerald-600">{trip.availableSeats}</span> /{' '}
                        <span className="text-slate-400">{trip.totalSeats}</span>
                      </td>
                      <td className="py-3 font-black text-slate-900">
                        {formatBDT(trip.baseFare)}
                      </td>
                      <td className="py-3">
                        <select
                          value={trip.status}
                          onChange={(e) =>
                            updateTripStatus(trip.id, e.target.value as Trip['status'])
                          }
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="boarding">Boarding</option>
                          <option value="departed">Departed</option>
                          <option value="completed">Completed</option>
                          <option value="delayed">Delayed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => {
                              setSelectedSeatTrip(trip);
                              setActiveTab('seats');
                            }}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg transition"
                            title="Manage seat layout, cancel or block seats"
                          >
                            Seat Control
                          </button>
                          <button
                            onClick={() => {
                              setSelectedManifestTrip(trip);
                              setActiveTab('manifest');
                            }}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#246BCE] font-bold rounded-lg transition"
                          >
                            Manifest
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SEAT CANCELLATION & SEAT QUOTA CONTROL */}
      {/* ========================================================================= */}
      {activeTab === 'seats' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-lg text-[#142B4A]">
                Seat Cancellation & Inventory Quota Manager
              </h3>
              <p className="text-xs text-slate-500">
                Cancel any passenger seat, block VIP/Quota seats, or release held seats in real time.
              </p>
            </div>

            {/* Trip Selector Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Select Trip:</span>
              <select
                value={selectedSeatTrip?.id}
                onChange={(e) => {
                  const t = operatorTrips.find((x) => x.id === e.target.value);
                  if (t) setSelectedSeatTrip(t);
                }}
                className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-50"
              >
                {operatorTrips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.coachNumber} • {t.originCity} ➔ {t.destinationCity} ({t.departureDate})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Seat Status Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 rounded border-2 border-slate-300 bg-white"></div>
              <span>Available (Click to Block/Reserve)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 rounded bg-blue-600 text-white flex items-center justify-center text-[10px]">
                B
              </div>
              <span className="font-bold text-blue-700">Booked (Click to Cancel Seat)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-5 h-5 rounded bg-purple-600 text-white flex items-center justify-center text-[10px]">
                R
              </div>
              <span className="font-bold text-purple-700">Reserved/Blocked (Click to Unblock)</span>
            </div>
          </div>

          {/* Interactive Bus Seat Grid for Operator */}
          <div className="max-w-md mx-auto bg-slate-50 rounded-3xl p-6 border-2 border-slate-300 shadow-inner">
            <div className="text-center pb-3 border-b border-slate-300 text-xs font-bold text-slate-500">
              Front of Coach • Driver Cabin
            </div>

            <div className="grid grid-cols-4 gap-2.5 my-4">
              {currentTripSeatsList.map((seat) => {
                const isBooked = seat.status === 'booked';
                const isReserved = seat.status === 'reserved';
                const isAvailable = seat.status === 'available';

                let buttonClass = 'bg-white border-2 border-slate-300 text-slate-800 hover:border-purple-500';
                if (isBooked) {
                  buttonClass = 'bg-blue-600 text-white border-2 border-blue-800 font-bold shadow hover:bg-rose-600';
                } else if (isReserved) {
                  buttonClass = 'bg-purple-600 text-white border-2 border-purple-800 font-bold hover:bg-emerald-600';
                }

                return (
                  <button
                    key={seat.id}
                    type="button"
                    onClick={() => {
                      if (isBooked) {
                        setTargetSeatNumber(seat.seatNumber);
                        setSeatActionType('cancel');
                      } else if (isReserved) {
                        handleExecuteUnblockSeat(seat.seatNumber);
                      } else {
                        setTargetSeatNumber(seat.seatNumber);
                        setSeatActionType('block');
                      }
                    }}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center text-xs font-semibold transition cursor-pointer ${buttonClass}`}
                    title={
                      isBooked
                        ? `Seat ${seat.seatNumber} is BOOKED. Click to Cancel!`
                        : isReserved
                        ? `Seat ${seat.seatNumber} is BLOCKED. Click to Unblock!`
                        : `Seat ${seat.seatNumber} is AVAILABLE. Click to Reserve/Block.`
                    }
                  >
                    <span>{seat.seatNumber}</span>
                    <span className="text-[9px] uppercase font-mono">
                      {isBooked ? 'Booked' : isReserved ? 'Blocked' : 'Free'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-center pt-3 border-t border-slate-200 text-xs text-slate-400 font-bold uppercase">
              Rear of Bus
            </div>
          </div>

          {/* Seat Action Modal (Cancel Seat OR Block Seat) */}
          {seatActionType && targetSeatNumber && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex justify-between items-center border-b pb-3 border-slate-100">
                  <h4 className="font-extrabold text-base text-[#142B4A]">
                    {seatActionType === 'cancel'
                      ? `Cancel Booked Seat ${targetSeatNumber}`
                      : `Block / Reserve Seat ${targetSeatNumber}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setSeatActionType(null);
                      setTargetSeatNumber(null);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                  <div>
                    <strong>Trip:</strong> {selectedSeatTrip.coachNumber} (
                    {selectedSeatTrip.originCity} ➔ {selectedSeatTrip.destinationCity})
                  </div>
                  <div>
                    <strong>Seat Number:</strong> {targetSeatNumber}
                  </div>
                </div>

                {seatActionType === 'cancel' ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">
                      Reason for Cancellation
                    </label>
                    <input
                      type="text"
                      value={cancelSeatReason}
                      onChange={(e) => setCancelSeatReason(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                    />
                    <p className="text-[11px] text-rose-600 font-medium">
                      Warning: Cancelling this seat will immediately release it back to available online/counter inventory and process passenger refund.
                    </p>
                    <button
                      type="button"
                      onClick={handleExecuteCancelSeat}
                      className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
                    >
                      Confirm Seat Cancellation & Release
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700">
                      Reserve / Block Type
                    </label>
                    <select
                      value={blockSeatReason}
                      onChange={(e) => setBlockSeatReason(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold"
                    >
                      <option value="VIP / Government Official Quota">VIP / Official Quota</option>
                      <option value="Driver / Helper Staff Seat">Driver / Helper Staff Seat</option>
                      <option value="Female Only Reservation Quota">Female Only Reservation Quota</option>
                      <option value="Seat Breakdown / Maintenance Hold">Seat Breakdown / Maintenance Hold</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleExecuteBlockSeat}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
                    >
                      Lock & Reserve Seat
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BUS FLEET MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'fleet' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-base text-[#142B4A]">
                Company Fleet & Vehicle Inventory
              </h3>
              <p className="text-xs text-slate-500">
                Manage all registered buses, models, registration numbers, and active/maintenance states.
              </p>
            </div>
            <button
              onClick={() => setIsAddBusModalOpen(true)}
              className="px-3.5 py-2 bg-[#246BCE] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Register New Bus</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Coach Number</th>
                  <th className="pb-3">Vehicle Model</th>
                  <th className="pb-3">Registration No.</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">GPS Tracking</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {operatorBuses.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 font-bold text-slate-800">{b.coachNumber}</td>
                    <td className="py-3 font-semibold text-slate-600">{b.model}</td>
                    <td className="py-3 font-mono text-slate-700">{b.registrationNumber}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#246BCE] font-bold">
                        {b.categoryName || 'AC Luxury'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-emerald-600 font-bold flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>GPS Active</span>
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`uppercase font-bold text-[10px] px-2 py-0.5 rounded ${
                          b.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() =>
                          updateBusStatus(
                            b.id,
                            b.status === 'active' ? 'maintenance' : 'active'
                          )
                        }
                        className="text-xs text-[#246BCE] hover:underline font-bold"
                      >
                        Toggle {b.status === 'active' ? 'Maintenance' : 'Active'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PASSENGER MANIFEST & BOARDING CHECK-IN */}
      {/* ========================================================================= */}
      {activeTab === 'manifest' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#142B4A]">
                Conductor & Driver Passenger Manifest
              </h3>
              <p className="text-xs text-slate-500">
                View booked passengers, print trip manifest, and mark boarding check-ins live.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedManifestTrip?.id}
                onChange={(e) => {
                  const t = operatorTrips.find((x) => x.id === e.target.value);
                  if (t) setSelectedManifestTrip(t);
                }}
                className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-50"
              >
                {operatorTrips.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.coachNumber} ({t.originCity} ➔ {t.destinationCity} at {t.departureTime})
                  </option>
                ))}
              </select>

              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#246BCE] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Manifest</span>
              </button>
            </div>
          </div>

          {manifestPassengers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No confirmed bookings recorded yet for this trip.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold">
                    <th className="pb-2">Seat(s)</th>
                    <th className="pb-2">Passenger Name</th>
                    <th className="pb-2">Contact Mobile</th>
                    <th className="pb-2">Boarding Counter</th>
                    <th className="pb-2">Dropping Point</th>
                    <th className="pb-2">Channel</th>
                    <th className="pb-2">Boarding Check-In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {manifestPassengers.map((b) => {
                    const isBoarded = boardedMap[b.id] || false;
                    return (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-bold font-mono text-[#246BCE]">
                          {b.seatNumbers.join(', ')}
                        </td>
                        <td className="py-2.5 font-bold text-slate-800">
                          {b.passenger.fullName}
                        </td>
                        <td className="py-2.5 font-mono text-slate-600">
                          {b.passenger.phone}
                        </td>
                        <td className="py-2.5">{b.boardingPoint}</td>
                        <td className="py-2.5">{b.droppingPoint}</td>
                        <td className="py-2.5">
                          <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-bold">
                            {b.bookingChannel}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <button
                            onClick={() =>
                              setBoardedMap((prev) => ({
                                ...prev,
                                [b.id]: !isBoarded,
                              }))
                            }
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 ${
                              isBoarded
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{isBoarded ? 'Boarded' : 'Check In'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: COMPANY COUNTERS & BRANCHES */}
      {/* ========================================================================= */}
      {activeTab === 'counters' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-base text-[#142B4A]">
                Company Physical Ticket Counters
              </h3>
              <p className="text-xs text-slate-500">
                All physical ticket outlets operated by {currentOperator.name}.
              </p>
            </div>
            <button
              onClick={() => setIsAddCounterModalOpen(true)}
              className="px-3.5 py-2 bg-[#246BCE] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold shadow flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Company Counter</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {operatorCounters.map((cnt) => (
              <div
                key={cnt.id}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#246BCE] bg-blue-50 px-2 py-0.5 rounded">
                      {cnt.code}
                    </span>
                    <h4 className="font-bold text-sm text-[#142B4A] mt-1">{cnt.name}</h4>
                  </div>
                  <MapPin className="w-4 h-4 text-[#F59E0B]" />
                </div>
                <p className="text-xs text-slate-600">{cnt.address}</p>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-xs text-slate-700">
                  <span>Phone: {cnt.phone}</span>
                  <span className="font-bold text-emerald-600">Active POS</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: DRIVERS & HELPERS ROSTER */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Drivers Column */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-[#142B4A]">Assigned Drivers</h3>
              <button
                onClick={() => setIsAddDriverModalOpen(true)}
                className="px-3 py-1.5 bg-[#246BCE] text-white rounded-lg text-xs font-bold"
              >
                + Add Driver
              </button>
            </div>
            <div className="space-y-2">
              {operatorDrivers.map((drv) => (
                <div
                  key={drv.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-800">{drv.fullName}</div>
                    <div className="text-slate-500 font-mono">License: {drv.licenseNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-700">{drv.phone}</div>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">
                      {drv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Helpers Column */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-base text-[#142B4A]">Helpers / Conductors</h3>
              <button
                onClick={() => setIsAddHelperModalOpen(true)}
                className="px-3 py-1.5 bg-[#246BCE] text-white rounded-lg text-xs font-bold"
              >
                + Add Helper
              </button>
            </div>
            <div className="space-y-2">
              {operatorHelpers.map((hlp) => (
                <div
                  key={hlp.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs"
                >
                  <div className="font-bold text-slate-800">{hlp.fullName}</div>
                  <div className="text-right">
                    <div className="font-bold text-slate-700">{hlp.phone}</div>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase">
                      {hlp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: SETTLEMENTS & PAYOUTS */}
      {/* ========================================================================= */}
      {activeTab === 'finance' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div>
            <h3 className="font-extrabold text-lg text-[#142B4A]">
              Financial Settlements & Commission Statements
            </h3>
            <p className="text-xs text-slate-500">
              Clear breakdown of gross ticket bookings, 5% platform service commission, and net bank payout balance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">Total Gross Ticket Sales</span>
              <span className="text-2xl font-black text-slate-900 block mt-1">
                {formatBDT(totalRevenue)}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500 font-semibold">
                Platform Commission ({currentOperator.commissionRate}%)
              </span>
              <span className="text-2xl font-black text-rose-600 block mt-1">
                -{formatBDT(platformCommission)}
              </span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold">
                Net Payable Balance to Operator
              </span>
              <span className="text-2xl font-black text-emerald-700 block mt-1">
                {formatBDT(netEarnings)}
              </span>
            </div>
          </div>

          <div className="pt-2">
            {payoutRequested ? (
              <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>
                  Payout request submitted for {formatBDT(netEarnings)}. Finance manager will disburse via BEFTN/NPSB within 24 hours.
                </span>
              </div>
            ) : (
              <button
                onClick={() => setPayoutRequested(true)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
              >
                Request Bank Settlement / Payout ({formatBDT(netEarnings)})
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPERATOR LOGIN & SWITCHER MODAL */}
      {/* ========================================================================= */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3 border-slate-100">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-[#F59E0B]" />
                <h3 className="font-extrabold text-base text-[#142B4A]">
                  Bus Operator Company Login
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select any bus company below to instantly switch to that operator's private management portal:
            </p>

            {/* Quick 1-Click Company Logins */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                1-Click Direct Company Login:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {operatorAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickOperatorSwitch(acc.operatorId)}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition ${
                      currentOperator.id === acc.operatorId
                        ? 'border-[#246BCE] bg-blue-50/60 ring-2 ring-[#246BCE]'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={acc.logoUrl}
                      alt={acc.companyName}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-800 truncate">
                        {acc.companyName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {acc.email}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Email & Password Form */}
            <form onSubmit={handleOperatorLoginSubmit} className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Or Sign In with Email & Password:
              </span>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operator Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. greenline@operator.com"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (e.g. green123, shohagh123, hanif123, ena123)
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter operator password"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#246BCE] hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl shadow transition"
              >
                Sign In to Company Portal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE TRIP MODAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTrip}
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200">
              <h3 className="font-extrabold text-base text-[#142B4A]">
                Schedule New Bus Trip ({currentOperator.name})
              </h3>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Origin City</label>
                <input
                  type="text"
                  required
                  value={tripOrigin}
                  onChange={(e) => setTripOrigin(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination City</label>
                <input
                  type="text"
                  required
                  value={tripDestination}
                  onChange={(e) => setTripDestination(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Fleet Coach</label>
                <select
                  value={tripCoachNum}
                  onChange={(e) => setTripCoachNum(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
                >
                  {operatorBuses.map((b) => (
                    <option key={b.id} value={b.coachNumber}>
                      {b.coachNumber} ({b.model})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={tripCategory}
                  onChange={(e) => setTripCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seat Layout</label>
                <select
                  value={tripLayoutType}
                  onChange={(e) => setTripLayoutType(e.target.value as LayoutType)}
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
                >
                  <option value="2+2">2+2 Luxury (36 Seats)</option>
                  <option value="2+1">2+1 VIP Business Class (28 Seats)</option>
                  <option value="sleeper">Royal Sleeper (30 Berths)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Base Ticket Fare (৳)</label>
                <input
                  type="number"
                  required
                  value={tripFare}
                  onChange={(e) => setTripFare(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Departure Date</label>
                <input
                  type="date"
                  required
                  value={tripDeptDate}
                  onChange={(e) => setTripDeptDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Departure Time</label>
                <input
                  type="time"
                  required
                  value={tripDeptTime}
                  onChange={(e) => setTripDeptTime(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#246BCE] hover:bg-[#1D4ED8] text-white font-extrabold text-xs shadow-lg transition"
            >
              Confirm & Publish Trip Schedule
            </button>
          </form>
        </div>
      )}

      {/* REGISTER BUS MODAL */}
      {isAddBusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateBus}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-3.5"
          >
            <div className="flex justify-between items-center border-b pb-2 border-slate-200">
              <h4 className="font-extrabold text-base text-[#142B4A]">Register New Bus</h4>
              <button
                type="button"
                onClick={() => setIsAddBusModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Coach Number</label>
              <input
                type="text"
                required
                placeholder="e.g. GL-990 (Scania VIP)"
                value={newBusCoachNo}
                onChange={(e) => setNewBusCoachNo(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Registration Number</label>
              <input
                type="text"
                required
                placeholder="DHAKA-METRO-BA-19-XXXX"
                value={newBusRegNo}
                onChange={(e) => setNewBusRegNo(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Model</label>
              <input
                type="text"
                placeholder="e.g. Scania K410IB 6x2"
                value={newBusModel}
                onChange={(e) => setNewBusModel(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#246BCE] text-white font-bold text-xs shadow hover:bg-[#1D4ED8]"
            >
              Add Vehicle to Fleet
            </button>
          </form>
        </div>
      )}

      {/* ADD DRIVER MODAL */}
      {isAddDriverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDriver}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-3.5"
          >
            <div className="flex justify-between items-center border-b pb-2 border-slate-200">
              <h4 className="font-extrabold text-base text-[#142B4A]">Add Driver</h4>
              <button
                type="button"
                onClick={() => setIsAddDriverModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Driver Full Name</label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Driving License Number</label>
              <input
                type="text"
                required
                value={driverLicense}
                onChange={(e) => setDriverLicense(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#246BCE] text-white font-bold text-xs"
            >
              Save Driver
            </button>
          </form>
        </div>
      )}

      {/* ADD HELPER MODAL */}
      {isAddHelperModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateHelper}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-3.5"
          >
            <div className="flex justify-between items-center border-b pb-2 border-slate-200">
              <h4 className="font-extrabold text-base text-[#142B4A]">Add Conductor / Helper</h4>
              <button
                type="button"
                onClick={() => setIsAddHelperModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={helperName}
                onChange={(e) => setHelperName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                value={helperPhone}
                onChange={(e) => setHelperPhone(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#246BCE] text-white font-bold text-xs"
            >
              Save Helper
            </button>
          </form>
        </div>
      )}

      {/* ADD COUNTER MODAL */}
      {isAddCounterModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCounter}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-3.5"
          >
            <div className="flex justify-between items-center border-b pb-2 border-slate-200">
              <h4 className="font-extrabold text-base text-[#142B4A]">
                Add Physical Ticket Counter
              </h4>
              <button
                type="button"
                onClick={() => setIsAddCounterModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Branch Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Kolatoli Beach Counter 2"
                value={counterName}
                onChange={(e) => setCounterName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={counterCity}
                onChange={(e) => setCounterCity(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
              <textarea
                required
                value={counterAddress}
                onChange={(e) => setCounterAddress(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Counter Phone</label>
              <input
                type="tel"
                required
                value={counterPhone}
                onChange={(e) => setCounterPhone(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2 text-xs font-semibold"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#246BCE] text-white font-bold text-xs"
            >
              Save Counter Branch
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
