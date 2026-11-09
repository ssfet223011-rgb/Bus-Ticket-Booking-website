import { TripSeat, LayoutType, SeatStatus } from '../types';

export function generateSeatsForTrip(
  tripId: string,
  layoutType: LayoutType,
  totalSeats: number,
  baseFare: number,
  prebookedSeats: string[] = []
): TripSeat[] {
  const seats: TripSeat[] = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  if (layoutType === '2+1') {
    // 2+1 layout (e.g., A1, A2 [aisle] A3)
    const numRows = Math.ceil(totalSeats / 3);
    for (let r = 0; r < numRows && r < rows.length; r++) {
      const rowLetter = rows[r];
      for (let c = 1; c <= 3; c++) {
        const seatNumber = `${rowLetter}${c}`;
        const isBooked = prebookedSeats.includes(seatNumber);
        seats.push({
          id: `${tripId}-${seatNumber}`,
          tripId,
          seatNumber,
          seatType: c === 3 ? 'vip' : 'standard',
          fare: c === 3 ? baseFare + 200 : baseFare,
          status: isBooked ? 'booked' : 'available',
          row: r,
          col: c <= 2 ? c - 1 : 3, // col 0, 1, and 3 (aisle at col 2)
          deck: 'lower',
        });
      }
    }
  } else if (layoutType === 'sleeper') {
    // Sleeper coach: lower and upper berths
    const numRows = Math.ceil(totalSeats / 4);
    for (let r = 0; r < numRows && r < rows.length; r++) {
      const rowLetter = rows[r];
      // Lower deck berths
      seats.push({
        id: `${tripId}-L${rowLetter}1`,
        tripId,
        seatNumber: `L-${rowLetter}1`,
        seatType: 'sleeper',
        fare: baseFare,
        status: prebookedSeats.includes(`L-${rowLetter}1`) ? 'booked' : 'available',
        row: r,
        col: 0,
        deck: 'lower',
      });
      seats.push({
        id: `${tripId}-L${rowLetter}2`,
        tripId,
        seatNumber: `L-${rowLetter}2`,
        seatType: 'sleeper',
        fare: baseFare,
        status: prebookedSeats.includes(`L-${rowLetter}2`) ? 'booked' : 'available',
        row: r,
        col: 2,
        deck: 'lower',
      });
      // Upper deck berths
      seats.push({
        id: `${tripId}-U${rowLetter}1`,
        tripId,
        seatNumber: `U-${rowLetter}1`,
        seatType: 'sleeper',
        fare: baseFare + 100,
        status: prebookedSeats.includes(`U-${rowLetter}1`) ? 'booked' : 'available',
        row: r,
        col: 0,
        deck: 'upper',
      });
      seats.push({
        id: `${tripId}-U${rowLetter}2`,
        tripId,
        seatNumber: `U-${rowLetter}2`,
        seatType: 'sleeper',
        fare: baseFare + 100,
        status: prebookedSeats.includes(`U-${rowLetter}2`) ? 'booked' : 'available',
        row: r,
        col: 2,
        deck: 'upper',
      });
    }
  } else {
    // Standard 2+2 layout (A1, A2 [aisle] A3, A4)
    const numRows = Math.ceil(totalSeats / 4);
    for (let r = 0; r < numRows && r < rows.length; r++) {
      const rowLetter = rows[r];
      for (let c = 1; c <= 4; c++) {
        const seatNumber = `${rowLetter}${c}`;
        const isBooked = prebookedSeats.includes(seatNumber);
        seats.push({
          id: `${tripId}-${seatNumber}`,
          tripId,
          seatNumber,
          seatType: 'standard',
          fare: baseFare,
          status: isBooked ? 'booked' : 'available',
          row: r,
          col: c <= 2 ? c - 1 : c, // col 0, 1, (gap at 2), 3, 4
          deck: 'lower',
        });
      }
    }
  }

  return seats;
}

export function formatBDT(amount: number): string {
  return `৳ ${amount.toLocaleString('en-BD')}`;
}

export function formatTime24to12(time24: string): string {
  if (!time24) return '';
  const [hourStr, minuteStr] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${hour}:${minuteStr} ${ampm}`;
}
