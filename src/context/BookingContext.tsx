import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Trip,
  TripSeat,
  Booking,
  Coupon,
  PassengerInfo,
  PaymentMethod,
  BookingChannel,
  Counter,
  BusOperator,
  DailyCashRecord,
  CounterExpense,
  Bus,
  Driver,
  Helper,
} from '../types';
import {
  INITIAL_TRIPS,
  INITIAL_BOOKINGS,
  INITIAL_COUPONS,
  INITIAL_COUNTERS,
  INITIAL_OPERATORS,
  INITIAL_BUSES,
  INITIAL_DRIVERS,
  INITIAL_HELPERS,
} from '../services/mockData';
import { generateSeatsForTrip } from '../utils/seatHelpers';

export interface SearchParams {
  from: string;
  to: string;
  date: string;
  returnDate?: string;
  passengers: number;
  busClass?: string;
}

interface BookingContextType {
  trips: Trip[];
  operators: BusOperator[];
  counters: Counter[];
  buses: Bus[];
  drivers: Driver[];
  helpers: Helper[];
  bookings: Booking[];
  coupons: Coupon[];
  searchParams: SearchParams;
  setSearchParams: (params: SearchParams) => void;
  selectedTrip: Trip | null;
  setSelectedTrip: (trip: Trip | null) => void;
  tripSeats: Record<string, TripSeat[]>;
  selectedSeats: string[];
  selectSeat: (seatNumber: string) => boolean;
  unselectSeat: (seatNumber: string) => void;
  clearSelectedSeats: () => void;
  selectedBoardingPoint: string;
  setSelectedBoardingPoint: (point: string) => void;
  selectedDroppingPoint: string;
  setSelectedDroppingPoint: (point: string) => void;
  holdRemainingSeconds: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string, subtotal: number) => { success: boolean; message: string };
  removeCoupon: () => void;
  confirmBooking: (
    passenger: PassengerInfo,
    paymentMethod: PaymentMethod,
    channel: BookingChannel,
    counterId?: string
  ) => { success: boolean; booking?: Booking; error?: string };
  cancelBooking: (bookingId: string, reason: string) => boolean;
  verifyTicketQr: (qrCode: string) => { valid: boolean; booking?: Booking; message: string };

  // Operator Controls
  addTrip: (trip: Omit<Trip, 'id' | 'availableSeats' | 'totalSeats'>) => void;
  updateTripStatus: (tripId: string, status: Trip['status']) => void;
  cancelTrip: (tripId: string, reason: string) => void;
  addBus: (bus: Omit<Bus, 'id'>) => void;
  updateBusStatus: (busId: string, status: Bus['status']) => void;
  addDriver: (driver: Omit<Driver, 'id'>) => void;
  addHelper: (helper: Omit<Helper, 'id'>) => void;
  addCounter: (counter: Omit<Counter, 'id'>) => void;

  // Seat Cancellation & Blocking by Operator
  operatorCancelSeat: (tripId: string, seatNumber: string, reason: string) => boolean;
  operatorBlockSeat: (tripId: string, seatNumber: string, reason?: string) => boolean;
  operatorUnblockSeat: (tripId: string, seatNumber: string) => boolean;

  // Counter Actions
  dailyCashRecords: DailyCashRecord[];
  counterExpenses: CounterExpense[];
  closeDailyCash: (counterId: string, cashDrawerTotal: number, staffName: string) => void;
  addCounterExpense: (expense: Omit<CounterExpense, 'id' | 'date'>) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('jatrasheba_trips');
    return saved ? JSON.parse(saved) : INITIAL_TRIPS;
  });

  const [operators] = useState<BusOperator[]>(() => {
    const saved = localStorage.getItem('jatrasheba_operators');
    return saved ? JSON.parse(saved) : INITIAL_OPERATORS;
  });

  const [counters, setCounters] = useState<Counter[]>(() => {
    const saved = localStorage.getItem('jatrasheba_counters');
    return saved ? JSON.parse(saved) : INITIAL_COUNTERS;
  });

  const [buses, setBuses] = useState<Bus[]>(() => {
    const saved = localStorage.getItem('jatrasheba_buses');
    return saved ? JSON.parse(saved) : INITIAL_BUSES;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('jatrasheba_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [helpers, setHelpers] = useState<Helper[]>(() => {
    const saved = localStorage.getItem('jatrasheba_helpers');
    return saved ? JSON.parse(saved) : INITIAL_HELPERS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('jatrasheba_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [coupons] = useState<Coupon[]>(INITIAL_COUPONS);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    from: 'Dhaka',
    to: "Cox's Bazar",
    date: new Date().toISOString().split('T')[0],
    passengers: 1,
  });

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState<string>('');
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState<string>('');
  const [holdRemainingSeconds, setHoldRemainingSeconds] = useState<number>(600); // 10 minutes
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Initialize or retrieve Trip Seats cache
  const [tripSeats, setTripSeats] = useState<Record<string, TripSeat[]>>(() => {
    const saved = localStorage.getItem('jatrasheba_trip_seats');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    const initialMap: Record<string, TripSeat[]> = {};
    INITIAL_TRIPS.forEach((trip) => {
      const prebooked: string[] = [];
      if (trip.id === 'trip-01') prebooked.push('A1', 'A2', 'C1', 'C2', 'E3', 'E4');
      if (trip.id === 'trip-02') prebooked.push('L-A1', 'U-A1', 'L-B1');
      if (trip.id === 'trip-03') prebooked.push('B1', 'B2', 'D3', 'D4');
      initialMap[trip.id] = generateSeatsForTrip(
        trip.id,
        trip.layoutType,
        trip.totalSeats,
        trip.baseFare,
        prebooked
      );
    });
    return initialMap;
  });

  // Daily cash records for POS
  const [dailyCashRecords, setDailyCashRecords] = useState<DailyCashRecord[]>([
    {
      id: 'dcr-01',
      counterId: 'cnt-01',
      counterName: 'Sayedabad Counter 1',
      date: new Date().toISOString().split('T')[0],
      totalBookings: 14,
      cashCollected: 38400,
      digitalCollected: 16200,
      expenses: 1200,
      netCash: 37200,
      status: 'open',
    },
  ]);

  const [counterExpenses, setCounterExpenses] = useState<CounterExpense[]>([
    {
      id: 'exp-01',
      counterId: 'cnt-01',
      category: 'Thermal Paper Rolls',
      amount: 450,
      description: '10 rolls of 80mm POS receipt paper',
      date: new Date().toISOString().split('T')[0],
      loggedBy: 'Md. Rafiqul Islam',
    },
    {
      id: 'exp-02',
      counterId: 'cnt-01',
      category: 'Counter Refreshment',
      amount: 750,
      description: 'Drinking water and tea for counter staff',
      date: new Date().toISOString().split('T')[0],
      loggedBy: 'Md. Rafiqul Islam',
    },
  ]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('jatrasheba_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('jatrasheba_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('jatrasheba_trip_seats', JSON.stringify(tripSeats));
  }, [tripSeats]);

  useEffect(() => {
    localStorage.setItem('jatrasheba_buses', JSON.stringify(buses));
  }, [buses]);

  useEffect(() => {
    localStorage.setItem('jatrasheba_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('jatrasheba_helpers', JSON.stringify(helpers));
  }, [helpers]);

  useEffect(() => {
    localStorage.setItem('jatrasheba_counters', JSON.stringify(counters));
  }, [counters]);

  // Seat hold timer countdown
  useEffect(() => {
    if (selectedSeats.length === 0) {
      setHoldRemainingSeconds(600);
      return;
    }

    const interval = setInterval(() => {
      setHoldRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearSelectedSeats();
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSeats]);

  const selectSeat = (seatNumber: string): boolean => {
    if (!selectedTrip) return false;
    const currentSeats = tripSeats[selectedTrip.id] || [];
    const targetSeat = currentSeats.find((s) => s.seatNumber === seatNumber);

    if (!targetSeat || targetSeat.status === 'booked' || targetSeat.status === 'held' || targetSeat.status === 'reserved' || targetSeat.status === 'disabled') {
      return false;
    }

    if (selectedSeats.includes(seatNumber)) {
      unselectSeat(seatNumber);
      return true;
    }

    if (selectedSeats.length >= 4) {
      alert('You can select a maximum of 4 seats per booking.');
      return false;
    }

    setSelectedSeats([...selectedSeats, seatNumber]);
    setHoldRemainingSeconds(600);
    return true;
  };

  const unselectSeat = (seatNumber: string) => {
    setSelectedSeats(selectedSeats.filter((s) => s !== seatNumber));
  };

  const clearSelectedSeats = () => {
    setSelectedSeats([]);
  };

  const applyCoupon = (code: string, subtotal: number): { success: boolean; message: string } => {
    const coupon = coupons.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );
    if (!coupon) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }
    if (subtotal < coupon.minSpend) {
      return {
        success: false,
        message: `Minimum spend for ${coupon.code} is ৳ ${coupon.minSpend}.`,
      };
    }
    setAppliedCoupon(coupon);
    return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const confirmBooking = (
    passenger: PassengerInfo,
    paymentMethod: PaymentMethod,
    channel: BookingChannel,
    counterId?: string
  ): { success: boolean; booking?: Booking; error?: string } => {
    if (!selectedTrip) return { success: false, error: 'No trip selected' };
    if (selectedSeats.length === 0) return { success: false, error: 'No seats selected' };

    const currentSeats = tripSeats[selectedTrip.id] || [];

    const conflict = selectedSeats.some((seatNum) => {
      const s = currentSeats.find((seat) => seat.seatNumber === seatNum);
      return !s || s.status === 'booked' || s.status === 'reserved';
    });

    if (conflict) {
      return { success: false, error: 'One or more selected seats have already been booked or reserved.' };
    }

    const subtotal = selectedSeats.reduce((acc, seatNum) => {
      const s = currentSeats.find((seat) => seat.seatNumber === seatNum);
      return acc + (s?.fare || selectedTrip.baseFare);
    }, 0);

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

    const serviceFee = channel === 'counter' ? 0 : 50;
    const payableAmount = Math.max(0, subtotal - discount + serviceFee);

    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const bookingReference = `BD-${datePart}-${randomSuffix}`;
    const qrPayload = `JATRA:${bookingReference}:${selectedTrip.id}:${selectedSeats.join(',')}`;

    const newBooking: Booking = {
      id: 'bk-' + Math.random().toString(36).substring(2, 9),
      bookingReference,
      tripId: selectedTrip.id,
      trip: selectedTrip,
      passenger,
      operatorId: selectedTrip.operatorId,
      operatorName: selectedTrip.operatorName,
      counterId,
      bookingChannel: channel,
      status: 'confirmed',
      seatNumbers: [...selectedSeats],
      totalAmount: subtotal,
      discountAmount: discount,
      serviceFee,
      payableAmount,
      paymentStatus: 'successful',
      paymentMethod,
      transactionRef: `TRX-${paymentMethod.toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`,
      boardingPoint: selectedBoardingPoint || selectedTrip.boardingPoints[0]?.name || 'Sayedabad',
      droppingPoint: selectedDroppingPoint || selectedTrip.droppingPoints[0]?.name || "Cox's Bazar",
      journeyDate: selectedTrip.departureDate,
      departureTime: selectedTrip.departureTime,
      coachNumber: selectedTrip.coachNumber,
      createdAt: new Date().toISOString(),
      qrPayload,
    };

    const updatedSeats = currentSeats.map((seat) => {
      if (selectedSeats.includes(seat.seatNumber)) {
        return {
          ...seat,
          status: 'booked' as const,
        };
      }
      return seat;
    });

    setTripSeats((prev) => ({
      ...prev,
      [selectedTrip.id]: updatedSeats,
    }));

    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === selectedTrip.id) {
          return {
            ...t,
            availableSeats: Math.max(0, t.availableSeats - selectedSeats.length),
          };
        }
        return t;
      })
    );

    setBookings((prev) => [newBooking, ...prev]);

    setSelectedSeats([]);
    setAppliedCoupon(null);

    return { success: true, booking: newBooking };
  };

  const cancelBooking = (bookingId: string, _reason: string): boolean => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || booking.status === 'cancelled') return false;

    const tripId = booking.tripId;
    const currentSeats = tripSeats[tripId] || [];
    const updatedSeats = currentSeats.map((seat) => {
      if (booking.seatNumbers.includes(seat.seatNumber)) {
        return {
          ...seat,
          status: 'available' as const,
        };
      }
      return seat;
    });

    setTripSeats((prev) => ({
      ...prev,
      [tripId]: updatedSeats,
    }));

    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            availableSeats: t.availableSeats + booking.seatNumbers.length,
          };
        }
        return t;
      })
    );

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'cancelled',
            paymentStatus: 'refunded',
          };
        }
        return b;
      })
    );

    return true;
  };

  // OPERATOR CANCEL SPECIFIC SEAT
  const operatorCancelSeat = (tripId: string, seatNumber: string, _reason: string): boolean => {
    const currentSeats = tripSeats[tripId] || [];
    const targetSeat = currentSeats.find((s) => s.seatNumber === seatNumber);
    if (!targetSeat) return false;

    // Release seat on live inventory
    const updatedSeats = currentSeats.map((s) => {
      if (s.seatNumber === seatNumber) {
        return {
          ...s,
          status: 'available' as const,
          heldBySession: undefined,
          holdExpiresAt: undefined,
        };
      }
      return s;
    });

    setTripSeats((prev) => ({
      ...prev,
      [tripId]: updatedSeats,
    }));

    // Update trip available seats count
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            availableSeats: Math.min(t.totalSeats, t.availableSeats + 1),
          };
        }
        return t;
      })
    );

    // Update or adjust any booking containing this seat
    setBookings((prev) =>
      prev.map((b) => {
        if (b.tripId === tripId && b.seatNumbers.includes(seatNumber)) {
          if (b.seatNumbers.length === 1) {
            return {
              ...b,
              status: 'cancelled',
              paymentStatus: 'refunded',
            };
          } else {
            const updatedSeatList = b.seatNumbers.filter((sn) => sn !== seatNumber);
            return {
              ...b,
              seatNumbers: updatedSeatList,
            };
          }
        }
        return b;
      })
    );

    return true;
  };

  // OPERATOR BLOCK / RESERVE SEAT (e.g. VIP Quota, Driver Quota, Breakdown)
  const operatorBlockSeat = (tripId: string, seatNumber: string, _reason?: string): boolean => {
    const currentSeats = tripSeats[tripId] || [];
    const targetSeat = currentSeats.find((s) => s.seatNumber === seatNumber);
    if (!targetSeat || targetSeat.status === 'booked') return false;

    const updatedSeats = currentSeats.map((s) => {
      if (s.seatNumber === seatNumber) {
        return {
          ...s,
          status: 'reserved' as const,
        };
      }
      return s;
    });

    setTripSeats((prev) => ({
      ...prev,
      [tripId]: updatedSeats,
    }));

    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            availableSeats: Math.max(0, t.availableSeats - 1),
          };
        }
        return t;
      })
    );

    return true;
  };

  // OPERATOR UNBLOCK SEAT
  const operatorUnblockSeat = (tripId: string, seatNumber: string): boolean => {
    const currentSeats = tripSeats[tripId] || [];
    const targetSeat = currentSeats.find((s) => s.seatNumber === seatNumber);
    if (!targetSeat) return false;

    const updatedSeats = currentSeats.map((s) => {
      if (s.seatNumber === seatNumber) {
        return {
          ...s,
          status: 'available' as const,
        };
      }
      return s;
    });

    setTripSeats((prev) => ({
      ...prev,
      [tripId]: updatedSeats,
    }));

    setTrips((prev) =>
      prev.map((t) => {
        if (t.id === tripId) {
          return {
            ...t,
            availableSeats: Math.min(t.totalSeats, t.availableSeats + 1),
          };
        }
        return t;
      })
    );

    return true;
  };

  const cancelTrip = (tripId: string, _reason: string) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status: 'cancelled' as const } : t))
    );

    // Cancel all associated bookings
    setBookings((prev) =>
      prev.map((b) => {
        if (b.tripId === tripId && b.status !== 'cancelled') {
          return {
            ...b,
            status: 'cancelled',
            paymentStatus: 'refunded',
          };
        }
        return b;
      })
    );
  };

  const verifyTicketQr = (qrCode: string): { valid: boolean; booking?: Booking; message: string } => {
    if (!qrCode) return { valid: false, message: 'Empty QR code payload.' };
    const matched = bookings.find((b) => b.qrPayload === qrCode || qrCode.includes(b.bookingReference));
    if (!matched) {
      return { valid: false, message: 'Ticket reference not found or invalid!' };
    }
    if (matched.status === 'cancelled') {
      return { valid: false, booking: matched, message: 'Warning: This ticket has been CANCELLED and refunded!' };
    }
    return { valid: true, booking: matched, message: 'Ticket Verified! Valid for Boarding.' };
  };

  const addTrip = (newTripData: Omit<Trip, 'id' | 'availableSeats' | 'totalSeats'>) => {
    const id = 'trip-' + Math.random().toString(36).substring(2, 8);
    const totalSeats = newTripData.layoutType === '2+1' ? 28 : newTripData.layoutType === 'sleeper' ? 30 : 36;
    const newTrip: Trip = {
      ...newTripData,
      id,
      availableSeats: totalSeats,
      totalSeats,
    };

    setTrips((prev) => [newTrip, ...prev]);

    const seats = generateSeatsForTrip(id, newTrip.layoutType, totalSeats, newTrip.baseFare);
    setTripSeats((prev) => ({
      ...prev,
      [id]: seats,
    }));
  };

  const updateTripStatus = (tripId: string, status: Trip['status']) => {
    setTrips((prev) =>
      prev.map((t) => (t.id === tripId ? { ...t, status } : t))
    );
  };

  const addBus = (busData: Omit<Bus, 'id'>) => {
    const newBus: Bus = {
      ...busData,
      id: 'bus-' + Math.random().toString(36).substring(2, 8),
    };
    setBuses((prev) => [newBus, ...prev]);
  };

  const updateBusStatus = (busId: string, status: Bus['status']) => {
    setBuses((prev) =>
      prev.map((b) => (b.id === busId ? { ...b, status } : b))
    );
  };

  const addDriver = (driverData: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      ...driverData,
      id: 'drv-' + Math.random().toString(36).substring(2, 8),
    };
    setDrivers((prev) => [newDriver, ...prev]);
  };

  const addHelper = (helperData: Omit<Helper, 'id'>) => {
    const newHelper: Helper = {
      ...helperData,
      id: 'hlp-' + Math.random().toString(36).substring(2, 8),
    };
    setHelpers((prev) => [newHelper, ...prev]);
  };

  const addCounter = (counterData: Omit<Counter, 'id'>) => {
    const newCounter: Counter = {
      ...counterData,
      id: 'cnt-' + Math.random().toString(36).substring(2, 8),
    };
    setCounters((prev) => [newCounter, ...prev]);
  };

  const closeDailyCash = (counterId: string, cashDrawerTotal: number, staffName: string) => {
    setDailyCashRecords((prev) =>
      prev.map((rec) => {
        if (rec.counterId === counterId && rec.status === 'open') {
          return {
            ...rec,
            netCash: cashDrawerTotal,
            status: 'closed',
            closedBy: staffName,
          };
        }
        return rec;
      })
    );
  };

  const addCounterExpense = (expenseData: Omit<CounterExpense, 'id' | 'date'>) => {
    const newExp: CounterExpense = {
      ...expenseData,
      id: 'exp-' + Math.random().toString(36).substring(2, 8),
      date: new Date().toISOString().split('T')[0],
    };
    setCounterExpenses((prev) => [newExp, ...prev]);
  };

  return (
    <BookingContext.Provider
      value={{
        trips,
        operators,
        counters,
        buses,
        drivers,
        helpers,
        bookings,
        coupons,
        searchParams,
        setSearchParams,
        selectedTrip,
        setSelectedTrip,
        tripSeats,
        selectedSeats,
        selectSeat,
        unselectSeat,
        clearSelectedSeats,
        selectedBoardingPoint,
        setSelectedBoardingPoint,
        selectedDroppingPoint,
        setSelectedDroppingPoint,
        holdRemainingSeconds,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        confirmBooking,
        cancelBooking,
        verifyTicketQr,
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
        dailyCashRecords,
        counterExpenses,
        closeDailyCash,
        addCounterExpense,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
