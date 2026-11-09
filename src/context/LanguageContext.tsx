import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.busTickets': 'Bus Tickets',
    'nav.routes': 'Routes',
    'nav.operators': 'Operators',
    'nav.counters': 'Counters & Map',
    'nav.offers': 'Offers',
    'nav.travelInfo': 'Travel Hub',
    'nav.contact': 'Support',
    'nav.login': 'Sign In',
    'nav.myBookings': 'My Bookings',
    'nav.counterPos': 'Counter POS',
    'nav.operatorPanel': 'Operator Dashboard',
    'nav.adminPanel': 'Super Admin',
    'nav.hotline': 'Hotline: 16460 / 09610-016460',

    // Hero Search
    'hero.title': 'Book Intercity Bus Tickets Across Bangladesh',
    'hero.subtitle': 'Reliable, instant seat reservation for over 50+ operators and 800+ counters.',
    'search.tabBus': 'Bus Tickets',
    'search.tabCounters': 'Find Counters',
    'search.tabVerify': 'Verify Ticket',
    'search.from': 'From (Origin)',
    'search.to': 'To (Destination)',
    'search.journeyDate': 'Journey Date',
    'search.returnDate': 'Return Date (Optional)',
    'search.passengers': 'Passengers',
    'search.busClass': 'Class / Category',
    'search.allClasses': 'All Classes',
    'search.button': 'Search Buses',
    'search.trending': 'Popular Routes:',
    'search.swap': 'Swap Cities',

    // Trip results & filters
    'results.found': 'available trips found',
    'results.filters': 'Filter Trips',
    'results.resetFilters': 'Reset All',
    'results.departureTime': 'Departure Time',
    'results.morning': 'Morning (06:00 - 12:00)',
    'results.afternoon': 'Afternoon (12:00 - 18:00)',
    'results.night': 'Night (18:00 - 06:00)',
    'results.busType': 'Bus Type',
    'results.acOnly': 'AC Luxury',
    'results.nonAc': 'Non-AC',
    'results.sleeper': 'Sleeper Coach',
    'results.priceRange': 'Price Range',
    'results.operator': 'Bus Operator',
    'results.viewSeats': 'View Seats',
    'results.hideSeats': 'Hide Seats',
    'results.seatsAvailable': 'Seats Available',
    'results.fare': 'Ticket Fare',
    'results.sortBy': 'Sort By',
    'results.fareLowHigh': 'Price: Low to High',
    'results.fareHighLow': 'Price: High to Low',
    'results.departEarliest': 'Earliest Departure',
    'results.departLatest': 'Latest Departure',

    // Seat selection
    'seat.selectSeat': 'Select Your Seats',
    'seat.legendAvailable': 'Available',
    'seat.legendSelected': 'Selected',
    'seat.legendHeld': 'Held (in progress)',
    'seat.legendBooked': 'Booked',
    'seat.legendFemale': 'Female Reserved',
    'seat.driver': 'Driver',
    'seat.door': 'Door',
    'seat.lowerDeck': 'Lower Deck',
    'seat.upperDeck': 'Upper Deck',
    'seat.boarding': 'Boarding Point',
    'seat.dropping': 'Dropping Point',
    'seat.fareSummary': 'Fare Summary',
    'seat.baseFare': 'Base Fare',
    'seat.serviceFee': 'Online Service Fee',
    'seat.discount': 'Discount',
    'seat.total': 'Total Payable',
    'seat.continueBooking': 'Continue to Checkout',
    'seat.maxSeatsWarning': 'You can select up to 4 seats per booking.',
    'seat.selectPointsWarning': 'Please select both boarding and dropping points to continue.',

    // Checkout
    'checkout.title': 'Passenger Information & Payment',
    'checkout.fullName': 'Full Name',
    'checkout.phone': 'Mobile Number (BD +880)',
    'checkout.email': 'Email Address',
    'checkout.gender': 'Gender',
    'checkout.male': 'Male',
    'checkout.female': 'Female',
    'checkout.nid': 'National ID / Passport (Optional)',
    'checkout.paymentMethod': 'Select Payment Method',
    'checkout.bkash': 'bKash Instant',
    'checkout.nagad': 'Nagad',
    'checkout.cards': 'Debit / Credit Card',
    'checkout.counterCash': 'Pay Cash at Counter',
    'checkout.applyCoupon': 'Apply Coupon',
    'checkout.couponPlaceholder': 'Enter coupon code (e.g. SHUVOJATRA)',
    'checkout.applied': 'Coupon Applied!',
    'checkout.payNow': 'Confirm & Pay Securely',
    'checkout.termsAgree': 'By continuing you agree to the Bangladesh Transport Ticketing & Cancellation policies.',

    // Ticket
    'ticket.successTitle': 'Booking Confirmed!',
    'ticket.reference': 'Booking Reference',
    'ticket.downloadPdf': 'Download PDF E-Ticket',
    'ticket.printThermal': 'Print Thermal POS Receipt',
    'ticket.journeyDetails': 'Journey Details',
    'ticket.importantNote': 'Please present this digital QR ticket or SMS at the counter 20 minutes before departure.',

    // Counter POS
    'pos.title': 'Counter POS Terminal',
    'pos.fastBooking': 'Walk-in Fast Booking',
    'pos.todaysBookings': "Today's Bookings",
    'pos.todaysSales': "Today's Cash Collection",
    'pos.dailyClosing': 'End-of-Day Cash Closing',
    'pos.expenseEntry': 'Log Counter Expense',
    'pos.printThermal': 'Instant Thermal Print (80mm)',
    'pos.collectCash': 'Confirm & Issue Ticket',

    // General
    'common.currency': '৳',
    'common.bdt': 'BDT',
    'common.loading': 'Loading data...',
    'common.close': 'Close',
    'common.cancel': 'Cancel',
    'common.save': 'Save Changes',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.status': 'Status',
  },
  bn: {
    // Navigation
    'nav.home': 'হোম',
    'nav.busTickets': 'বাস টিকিট',
    'nav.routes': 'রুটসমূহ',
    'nav.operators': 'বাস অপারেটর',
    'nav.counters': 'কাউন্টার ও মানচিত্র',
    'nav.offers': 'অফারসমূহ',
    'nav.travelInfo': 'ভ্রমণ তথ্য ও গাইড',
    'nav.contact': 'সহায়তা কেন্দ্র',
    'nav.login': 'লগইন / সাইনআপ',
    'nav.myBookings': 'আমার টিকিট',
    'nav.counterPos': 'কাউন্টার পিওএস',
    'nav.operatorPanel': 'অপারেটর ড্যাশবোর্ড',
    'nav.adminPanel': 'সুপার অ্যাডমিন',
    'nav.hotline': 'হটলাইন: ১৬৪৬০ / ০৯৬১০-০১৬৪৬০',

    // Hero Search
    'hero.title': 'বাংলাদেশের সেরা বাস টিকিট বুকিং প্ল্যাটফর্ম',
    'hero.subtitle': '৫০+ অপারেটর এবং ৮০০+ কাউন্টারের সাথে তাৎক্ষণিক অনলাইন ও কাউন্টার টিকিট সংরক্ষণ।',
    'search.tabBus': 'বাসের টিকিট',
    'search.tabCounters': 'কাউন্টার খুঁজুন',
    'search.tabVerify': 'টিকিট যাচাই',
    'search.from': 'কোথা থেকে (শুরু)',
    'search.to': 'কোথায় যাবেন (গন্তব্য)',
    'search.journeyDate': 'যাত্রার তারিখ',
    'search.returnDate': 'ফেরার তারিখ (ঐচ্ছিক)',
    'search.passengers': 'যাত্রী সংখ্যা',
    'search.busClass': 'বাস ক্যাটাগরি',
    'search.allClasses': 'সব ক্যাটাগরি',
    'search.button': 'বাস খুঁজুন',
    'search.trending': 'জনপ্রিয় রুট:',
    'search.swap': 'শহর বদলান',

    // Trip results & filters
    'results.found': 'টি বাস পাওয়া গেছে',
    'results.filters': 'ফিল্টারসমূহ',
    'results.resetFilters': 'রিসেট করুন',
    'results.departureTime': 'ছাড়ার সময়',
    'results.morning': 'সকাল (০৬:০০ - ১২:০০)',
    'results.afternoon': 'দুপুর ও বিকেল (১২:০০ - ১৮:০০)',
    'results.night': 'রাত (১৮:০০ - ০৬:০০)',
    'results.busType': 'বাসের ধরন',
    'results.acOnly': 'এসি লাক্সারি',
    'results.nonAc': 'নন-এসি',
    'results.sleeper': 'স্লিপার কোচ',
    'results.priceRange': 'ভাড়ার পরিধি',
    'results.operator': 'বাস কোম্পানি',
    'results.viewSeats': 'আসন দেখুন',
    'results.hideSeats': 'আসন লুকান',
    'results.seatsAvailable': 'আসন ফাঁকা আছে',
    'results.fare': 'ভাড়া',
    'results.sortBy': 'সাজান',
    'results.fareLowHigh': 'ভাড়া: কম থেকে বেশি',
    'results.fareHighLow': 'ভাড়া: বেশি থেকে কম',
    'results.departEarliest': 'আগে ছাড়বে',
    'results.departLatest': 'দেরিতে ছাড়বে',

    // Seat selection
    'seat.selectSeat': 'পছন্দের আসন নির্বাচন করুন',
    'seat.legendAvailable': 'খালি',
    'seat.legendSelected': 'নির্বাচিত',
    'seat.legendHeld': 'প্রক্রিয়াধীন (হোল্ড)',
    'seat.legendBooked': 'বুক করা হয়েছে',
    'seat.legendFemale': 'মহিলাদের জন্য সংরক্ষিত',
    'seat.driver': 'ড্রাইভার',
    'seat.door': 'দরজা',
    'seat.lowerDeck': 'নিচের ডেক',
    'seat.upperDeck': 'উপরের ডেক',
    'seat.boarding': 'বোর্ডিং পয়েন্ট (ওঠার স্থান)',
    'seat.dropping': 'ড্রপিং পয়েন্ট (নামার স্থান)',
    'seat.fareSummary': 'ভাড়ার বিবরণ',
    'seat.baseFare': 'মূল ভাড়া',
    'seat.serviceFee': 'অনলাইন সার্ভিস চার্জ',
    'seat.discount': 'ছাড় / ডিসকাউন্ট',
    'seat.total': 'মোট প্রদেয় টাকা',
    'seat.continueBooking': 'চেকআউটে এগিয়ে যান',
    'seat.maxSeatsWarning': 'একবারে সর্বোচ্চ ৪টি আসন বুকিং করা যাবে।',
    'seat.selectPointsWarning': 'অনুগ্রহ করে বোর্ডিং এবং ড্রপিং পয়েন্ট নির্বাচন করুন।',

    // Checkout
    'checkout.title': 'যাত্রীর তথ্য ও নিরাপদ পেমেন্ট',
    'checkout.fullName': 'যাত্রীর পুরো নাম',
    'checkout.phone': 'মোবাইল নম্বর (+৮৮০)',
    'checkout.email': 'ইমেইল অ্যাড্রেস',
    'checkout.gender': 'লিঙ্গ',
    'checkout.male': 'পুরুষ',
    'checkout.female': 'মহিলা',
    'checkout.nid': 'জাতীয় পরিচয়পত্র / পাসপোর্ট (ঐচ্ছিক)',
    'checkout.paymentMethod': 'পেমেন্ট মাধ্যম বেছে নিন',
    'checkout.bkash': 'বিকাশ ইনস্ট্যান্ট পেমেন্ট',
    'checkout.nagad': 'নগদ',
    'checkout.cards': 'ডেবিট / ক্রেডিট কার্ড',
    'checkout.counterCash': 'কাউন্টারে নগদ ক্যাশ',
    'checkout.applyCoupon': 'কুপন প্রয়োগ করুন',
    'checkout.couponPlaceholder': 'কুপন কোড লিখুন (যেমন: SHUVOJATRA)',
    'checkout.applied': 'কুপন কার্যকর হয়েছে!',
    'checkout.payNow': 'নিশ্চিত করুন ও পেমেন্ট করুন',
    'checkout.termsAgree': 'এগিয়ে যাওয়ার মাধ্যমে আপনি আমাদের বাতিল ও রিফান্ড নীতিমালা মেনে নিচ্ছেন।',

    // Ticket
    'ticket.successTitle': 'বুকিং সফলভাবে নিশ্চিত হয়েছে!',
    'ticket.reference': 'বুকিং রেফারেন্স',
    'ticket.downloadPdf': 'ই-টিকিট পিডিএফ ডাউনলোড',
    'ticket.printThermal': 'থার্মাল পিওএস রশিদ প্রিন্ট',
    'ticket.journeyDetails': 'যাত্রার বিবরণ',
    'ticket.importantNote': 'যাত্রার নির্ধারিত সময়ের অন্তত ২০ মিনিট পূর্বে বাস কাউন্টারে ডিজিটাল টিকিট অথবা মেসেজ প্রদর্শন করুন।',

    // Counter POS
    'pos.title': 'কাউন্টার পিওএস টার্মিনাল',
    'pos.fastBooking': 'সরাসরি দ্রুত টিকিট প্রদান',
    'pos.todaysBookings': 'আজকের মোট টিকিট',
    'pos.todaysSales': 'আজকের নগদ কালেকশন',
    'pos.dailyClosing': 'দিনের শেষ ক্যাশ ক্লোজিং',
    'pos.expenseEntry': 'কাউন্টার খরচ এন্ট্রি',
    'pos.printThermal': 'থার্মাল প্রিন্ট (৮০ মিমি)',
    'pos.collectCash': 'ক্যাশ গ্রহণ ও টিকিট দিন',

    // General
    'common.currency': '৳',
    'common.bdt': 'টাকা',
    'common.loading': 'তথ্য লোড হচ্ছে...',
    'common.close': 'বন্ধ করুন',
    'common.cancel': 'বাতিল',
    'common.save': 'সংরক্ষণ করুন',
    'common.delete': 'মুছে ফেলুন',
    'common.search': 'অনুসন্ধান',
    'common.status': 'অবস্থা',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('jatrasheba_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('jatrasheba_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
