/**
 * HostelHub Data Store & Initial Dataset
 * Provides rich initial hostel data and LocalStorage persistence.
 */

const INITIAL_ROOMS = [
  // Floor 1 (Dorms & Standard)
  { id: '101-A', number: '101-A', floor: 1, type: '4-Bed Mixed Dorm', capacity: 1, bedType: 'Single Bunk', rate: 28, status: 'Occupied', condition: 'Clean', currentGuest: 'Lucas Silva' },
  { id: '101-B', number: '101-B', floor: 1, type: '4-Bed Mixed Dorm', capacity: 1, bedType: 'Single Bunk', rate: 28, status: 'Occupied', condition: 'Clean', currentGuest: 'Elena Rostova' },
  { id: '101-C', number: '101-C', floor: 1, type: '4-Bed Mixed Dorm', capacity: 1, bedType: 'Single Bunk', rate: 28, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '101-D', number: '101-D', floor: 1, type: '4-Bed Mixed Dorm', capacity: 1, bedType: 'Single Bunk', rate: 28, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '102-A', number: '102-A', floor: 1, type: '6-Bed Mixed Dorm', capacity: 1, bedType: 'Single Bunk', rate: 24, status: 'Occupied', condition: 'Clean', currentGuest: 'Mateo Rossi' },
  { id: '102-B', number: '102-B', floor: 1, type: '6-Bed Mixed Dorm', capacity: 1, bedType: 'Single Bunk', rate: 24, status: 'Occupied', condition: 'Clean', currentGuest: 'Sophia Chen' },
  { id: '102-C', number: '102-C', floor: 1, type: '6-Bed Mixed Dorm', capacity: 1, bedType: 'Single Bunk', rate: 24, status: 'Available', condition: 'Needs Cleaning', currentGuest: null },
  { id: '102-D', number: '102-D', floor: 1, type: '6-Bed Mixed Dorm', capacity: 1, bedType: 'Single Bunk', rate: 24, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '102-E', number: '102-E', floor: 1, type: '6-Bed Mixed Dorm', capacity: 1, bedType: 'Single Bunk', rate: 24, status: 'Occupied', condition: 'Clean', currentGuest: 'Liam O\'Connor' },
  { id: '102-F', number: '102-F', floor: 1, type: '6-Bed Mixed Dorm', capacity: 1, bedType: 'Single Bunk', rate: 24, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '103-A', number: '103-A', floor: 1, type: '8-Bed Female Dorm', capacity: 1, bedType: 'Single Bunk', rate: 26, status: 'Occupied', condition: 'Clean', currentGuest: 'Amara Diop' },
  { id: '103-B', number: '103-B', floor: 1, type: '8-Bed Female Dorm', capacity: 1, bedType: 'Single Bunk', rate: 26, status: 'Occupied', condition: 'Clean', currentGuest: 'Chloe Bennett' },
  { id: '103-C', number: '103-C', floor: 1, type: '8-Bed Female Dorm', capacity: 1, bedType: 'Single Bunk', rate: 26, status: 'Occupied', condition: 'Clean', currentGuest: 'Yuki Tanaka' },
  { id: '103-D', number: '103-D', floor: 1, type: '8-Bed Female Dorm', capacity: 1, bedType: 'Single Bunk', rate: 26, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '103-E', number: '103-E', floor: 1, type: '8-Bed Female Dorm', capacity: 1, bedType: 'Single Bunk', rate: 26, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '103-F', number: '103-F', floor: 1, type: '8-Bed Female Dorm', capacity: 1, bedType: 'Single Bunk', rate: 26, status: 'Available', condition: 'Needs Cleaning', currentGuest: null },
  { id: '103-G', number: '103-G', floor: 1, type: '8-Bed Female Dorm', capacity: 1, bedType: 'Single Bunk', rate: 26, status: 'Occupied', condition: 'Clean', currentGuest: 'Maria Garcia' },
  { id: '103-H', number: '103-H', floor: 1, type: '8-Bed Female Dorm', capacity: 1, bedType: 'Single Bunk', rate: 26, status: 'Occupied', condition: 'Clean', currentGuest: 'Hannah Schmidt' },

  // Floor 2 (Private Rooms & Ensuite)
  { id: '201', number: '201', floor: 2, type: 'Private Deluxe', capacity: 2, bedType: 'Queen Bed', rate: 75, status: 'Occupied', condition: 'Clean', currentGuest: 'Alexander Wright' },
  { id: '202', number: '202', floor: 2, type: 'Private Deluxe', capacity: 2, bedType: 'Queen Bed', rate: 75, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '203', number: '203', floor: 2, type: 'Twin Ensuite', capacity: 2, bedType: '2 Twin Beds', rate: 68, status: 'Occupied', condition: 'Clean', currentGuest: 'Noah & Leo Becker' },
  { id: '204', number: '204', floor: 2, type: 'Twin Ensuite', capacity: 2, bedType: '2 Twin Beds', rate: 68, status: 'Maintenance', condition: 'Needs Cleaning', currentGuest: null },
  { id: '205', number: '205', floor: 2, type: 'Private Deluxe', capacity: 2, bedType: 'Queen Bed', rate: 75, status: 'Occupied', condition: 'Clean', currentGuest: 'Camila Morales' },
  { id: '206', number: '206', floor: 2, type: 'Single Private', capacity: 1, bedType: 'Double Bed', rate: 55, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '207', number: '207', floor: 2, type: 'Single Private', capacity: 1, bedType: 'Double Bed', rate: 55, status: 'Occupied', condition: 'Clean', currentGuest: 'Kenji Sato' },
  { id: '208', number: '208', floor: 2, type: 'Single Private', capacity: 1, bedType: 'Double Bed', rate: 55, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '209', number: '209', floor: 2, type: 'Private Deluxe', capacity: 2, bedType: 'King Bed', rate: 85, status: 'Occupied', condition: 'Clean', currentGuest: 'Freja Lindqvist' },
  { id: '210', number: '210', floor: 2, type: 'Private Deluxe', capacity: 2, bedType: 'King Bed', rate: 85, status: 'Available', condition: 'Needs Cleaning', currentGuest: null },
  { id: '211', number: '211', floor: 2, type: 'Twin Ensuite', capacity: 2, bedType: '2 Twin Beds', rate: 68, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '212', number: '212', floor: 2, type: 'Twin Ensuite', capacity: 2, bedType: '2 Twin Beds', rate: 68, status: 'Maintenance', condition: 'In Progress', currentGuest: null },

  // Floor 3 (Suites & Pods)
  { id: '301', number: '301', floor: 3, type: 'Penthouse Suite', capacity: 4, bedType: 'King + Sofa Bed', rate: 140, status: 'Occupied', condition: 'Clean', currentGuest: 'Julian Vance' },
  { id: '302', number: '302', floor: 3, type: 'Penthouse Suite', capacity: 4, bedType: 'King + Sofa Bed', rate: 140, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '303', number: '303', floor: 3, type: 'Private Balcony', capacity: 2, bedType: 'Queen Bed', rate: 95, status: 'Occupied', condition: 'Clean', currentGuest: 'Zoe & Maya Patel' },
  { id: '304', number: '304', floor: 3, type: 'Private Balcony', capacity: 2, bedType: 'Queen Bed', rate: 95, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '305-A', number: '305-A', floor: 3, type: 'Quiet Pod Dorm', capacity: 1, bedType: 'Acoustic Pod', rate: 35, status: 'Occupied', condition: 'Clean', currentGuest: 'David Miller' },
  { id: '305-B', number: '305-B', floor: 3, type: 'Quiet Pod Dorm', capacity: 1, bedType: 'Acoustic Pod', rate: 35, status: 'Occupied', condition: 'Clean', currentGuest: 'Sarah Connor' },
  { id: '305-C', number: '305-C', floor: 3, type: 'Quiet Pod Dorm', capacity: 1, bedType: 'Acoustic Pod', rate: 35, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '305-D', number: '305-D', floor: 3, type: 'Quiet Pod Dorm', capacity: 1, bedType: 'Acoustic Pod', rate: 35, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '306', number: '306', floor: 3, type: 'Family Studio', capacity: 5, bedType: 'Queen + 3 Bunks', rate: 130, status: 'Occupied', condition: 'Clean', currentGuest: 'The Dubois Family' },
  { id: '307', number: '307', floor: 3, type: 'Family Studio', capacity: 5, bedType: 'Queen + 3 Bunks', rate: 130, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '308', number: '308', floor: 3, type: 'Private Deluxe', capacity: 2, bedType: 'King Bed', rate: 85, status: 'Available', condition: 'Clean', currentGuest: null },
  { id: '309', number: '309', floor: 3, type: 'Private Deluxe', capacity: 2, bedType: 'King Bed', rate: 85, status: 'Maintenance', condition: 'Needs Cleaning', currentGuest: null }
];

const INITIAL_GUESTS = [
  {
    id: 'G-1001',
    name: 'Alexander Wright',
    email: 'alex.wright@wanderlust.io',
    phone: '+44 7700 900452',
    nationality: 'United Kingdom',
    countryCode: 'GB',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    loyaltyTier: 'Platinum',
    loyaltyPoints: 3450,
    totalStays: 9,
    lifetimeSpend: 2420,
    lastStay: '2026-08-20',
    currentStatus: 'In-House',
    roomAssigned: '201',
    preferences: { bed: 'High Floor / Non-Smoking', dietary: 'Vegetarian', notes: 'Digital Nomad, prefers high-speed corner desk' },
    emergencyContact: 'Emma Wright (+44 7700 900111)',
    passportNumber: 'GB982341209'
  },
  {
    id: 'G-1002',
    name: 'Sophia Chen',
    email: 'sophia.chen@techglobal.com',
    phone: '+1 (415) 890-3412',
    nationality: 'United States',
    countryCode: 'US',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    loyaltyTier: 'Gold',
    loyaltyPoints: 1820,
    totalStays: 5,
    lifetimeSpend: 1140,
    lastStay: '2026-08-22',
    currentStatus: 'In-House',
    roomAssigned: '102-B',
    preferences: { bed: 'Bottom Bunk only', dietary: 'No Dairy', notes: 'Requested extra locker key' },
    emergencyContact: 'David Chen (+1 415 890 0001)',
    passportNumber: 'US441908234'
  },
  {
    id: 'G-1003',
    name: 'Lucas Silva',
    email: 'lucas.silva@rio.br',
    phone: '+55 21 98844-3321',
    nationality: 'Brazil',
    countryCode: 'BR',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    loyaltyTier: 'Gold',
    loyaltyPoints: 1450,
    totalStays: 4,
    lifetimeSpend: 780,
    lastStay: '2026-08-24',
    currentStatus: 'In-House',
    roomAssigned: '101-A',
    preferences: { bed: 'Near window', dietary: 'Standard', notes: 'Surfer, storage for board' },
    emergencyContact: 'Beatriz Silva (+55 21 98844-0000)',
    passportNumber: 'BR55902188'
  },
  {
    id: 'G-1004',
    name: 'Elena Rostova',
    email: 'elena.rostova@travel.de',
    phone: '+49 151 5553421',
    nationality: 'Germany',
    countryCode: 'DE',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    loyaltyTier: 'Silver',
    loyaltyPoints: 620,
    totalStays: 2,
    lifetimeSpend: 390,
    lastStay: '2026-08-25',
    currentStatus: 'In-House',
    roomAssigned: '101-B',
    preferences: { bed: 'Quiet room', dietary: 'Gluten-Free', notes: 'Arrived on night train' },
    emergencyContact: 'Hans Rostova (+49 151 5550000)',
    passportNumber: 'DE33901248'
  },
  {
    id: 'G-1005',
    name: 'Julian Vance',
    email: 'julian.vance@venture.co',
    phone: '+1 (212) 555-0199',
    nationality: 'Canada',
    countryCode: 'CA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    loyaltyTier: 'Platinum',
    loyaltyPoints: 4900,
    totalStays: 12,
    lifetimeSpend: 4680,
    lastStay: '2026-08-23',
    currentStatus: 'In-House',
    roomAssigned: '301',
    preferences: { bed: 'Penthouse King', dietary: 'Vegan', notes: 'VIP booking with airport pickup' },
    emergencyContact: 'Rachel Vance (+1 212 555-0100)',
    passportNumber: 'CA99482012'
  },
  {
    id: 'G-1006',
    name: 'Amara Diop',
    email: 'amara.diop@dakar.sn',
    phone: '+221 77 654 3210',
    nationality: 'Senegal',
    countryCode: 'SN',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    loyaltyTier: 'Gold',
    loyaltyPoints: 2100,
    totalStays: 6,
    lifetimeSpend: 920,
    lastStay: '2026-08-21',
    currentStatus: 'In-House',
    roomAssigned: '103-A',
    preferences: { bed: 'Female Dorm only', dietary: 'Halal', notes: 'Attending arts festival' },
    emergencyContact: 'Ousmane Diop (+221 77 654 0000)',
    passportNumber: 'SN88102391'
  },
  {
    id: 'G-1007',
    name: 'Kenji Sato',
    email: 'kenji.sato@tokyo.jp',
    phone: '+81 90 1234 5678',
    nationality: 'Japan',
    countryCode: 'JP',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    loyaltyTier: 'Silver',
    loyaltyPoints: 850,
    totalStays: 3,
    lifetimeSpend: 510,
    lastStay: '2026-08-24',
    currentStatus: 'In-House',
    roomAssigned: '207',
    preferences: { bed: 'Single Private', dietary: 'Standard', notes: 'Early morning departures' },
    emergencyContact: 'Yoko Sato (+81 90 1234 0000)',
    passportNumber: 'JP11209384'
  },
  {
    id: 'G-1008',
    name: 'Chloe Bennett',
    email: 'chloe.b@sydney.au',
    phone: '+61 400 123 456',
    nationality: 'Australia',
    countryCode: 'AU',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    loyaltyTier: 'Silver',
    loyaltyPoints: 400,
    totalStays: 1,
    lifetimeSpend: 210,
    lastStay: '2026-08-25',
    currentStatus: 'In-House',
    roomAssigned: '103-B',
    preferences: { bed: 'Top Bunk', dietary: 'Vegetarian', notes: 'Backpacking Southeast Asia loop' },
    emergencyContact: 'Mark Bennett (+61 400 123 000)',
    passportNumber: 'AU77192034'
  }
];

// Helper to generate dynamic dates relative to today (Aug 26, 2026)
const getRelativeDate = (offsetDays) => {
  const d = new Date(2026, 7, 26); // Aug 26, 2026
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const INITIAL_BOOKINGS = [
  {
    id: 'BK-8901',
    guestId: 'G-1001',
    guestName: 'Alexander Wright',
    roomId: '201',
    roomNumber: '201',
    roomType: 'Private Deluxe',
    checkIn: getRelativeDate(-2), // Aug 24
    checkOut: getRelativeDate(3), // Aug 29
    status: 'Checked In',
    guestsCount: 1,
    nightlyRate: 75,
    totalNights: 5,
    totalPrice: 375,
    paidAmount: 375,
    paymentStatus: 'Paid',
    source: 'Direct Website'
  },
  {
    id: 'BK-8902',
    guestId: 'G-1002',
    guestName: 'Sophia Chen',
    roomId: '102-B',
    roomNumber: '102-B',
    roomType: '6-Bed Mixed Dorm',
    checkIn: getRelativeDate(-1), // Aug 25
    checkOut: getRelativeDate(4), // Aug 30
    status: 'Checked In',
    guestsCount: 1,
    nightlyRate: 24,
    totalNights: 5,
    totalPrice: 120,
    paidAmount: 120,
    paymentStatus: 'Paid',
    source: 'Hostelworld'
  },
  {
    id: 'BK-8903',
    guestId: 'G-1003',
    guestName: 'Lucas Silva',
    roomId: '101-A',
    roomNumber: '101-A',
    roomType: '4-Bed Mixed Dorm',
    checkIn: getRelativeDate(0), // Aug 26
    checkOut: getRelativeDate(2), // Aug 28
    status: 'Checked In',
    guestsCount: 1,
    nightlyRate: 28,
    totalNights: 2,
    totalPrice: 56,
    paidAmount: 56,
    paymentStatus: 'Paid',
    source: 'Walk-In'
  },
  {
    id: 'BK-8904',
    guestId: 'G-1004',
    guestName: 'Elena Rostova',
    roomId: '101-B',
    roomNumber: '101-B',
    roomType: '4-Bed Mixed Dorm',
    checkIn: getRelativeDate(0), // Aug 26
    checkOut: getRelativeDate(5), // Aug 31
    status: 'Checked In',
    guestsCount: 1,
    nightlyRate: 28,
    totalNights: 5,
    totalPrice: 140,
    paidAmount: 140,
    paymentStatus: 'Paid',
    source: 'Booking.com'
  },
  {
    id: 'BK-8905',
    guestId: 'G-1005',
    guestName: 'Julian Vance',
    roomId: '301',
    roomNumber: '301',
    roomType: 'Penthouse Suite',
    checkIn: getRelativeDate(-3), // Aug 23
    checkOut: getRelativeDate(1), // Aug 27
    status: 'Checked In',
    guestsCount: 2,
    nightlyRate: 140,
    totalNights: 4,
    totalPrice: 560,
    paidAmount: 560,
    paymentStatus: 'Paid',
    source: 'Direct Website'
  },
  {
    id: 'BK-8906',
    guestId: 'G-1006',
    guestName: 'Amara Diop',
    roomId: '103-A',
    roomNumber: '103-A',
    roomType: '8-Bed Female Dorm',
    checkIn: getRelativeDate(-2), // Aug 24
    checkOut: getRelativeDate(2), // Aug 28
    status: 'Checked In',
    guestsCount: 1,
    nightlyRate: 26,
    totalNights: 4,
    totalPrice: 104,
    paidAmount: 104,
    paymentStatus: 'Paid',
    source: 'Hostelworld'
  },
  {
    id: 'BK-8907',
    guestId: 'G-1007',
    guestName: 'Kenji Sato',
    roomId: '207',
    roomNumber: '207',
    roomType: 'Single Private',
    checkIn: getRelativeDate(0), // Aug 26
    checkOut: getRelativeDate(3), // Aug 29
    status: 'Checked In',
    guestsCount: 1,
    nightlyRate: 55,
    totalNights: 3,
    totalPrice: 165,
    paidAmount: 165,
    paymentStatus: 'Paid',
    source: 'Direct Website'
  },
  {
    id: 'BK-8908',
    guestId: 'G-1008',
    guestName: 'Chloe Bennett',
    roomId: '103-B',
    roomNumber: '103-B',
    roomType: '8-Bed Female Dorm',
    checkIn: getRelativeDate(-1), // Aug 25
    checkOut: getRelativeDate(4), // Aug 30
    status: 'Checked In',
    guestsCount: 1,
    nightlyRate: 26,
    totalNights: 5,
    totalPrice: 130,
    paidAmount: 130,
    paymentStatus: 'Paid',
    source: 'Walk-In'
  },
  // Upcoming / Confirmed / Pending bookings
  {
    id: 'BK-8909',
    guestId: 'G-1001',
    guestName: 'Liam Davis',
    roomId: '202',
    roomNumber: '202',
    roomType: 'Private Deluxe',
    checkIn: getRelativeDate(1), // Aug 27
    checkOut: getRelativeDate(5), // Aug 31
    status: 'Confirmed',
    guestsCount: 2,
    nightlyRate: 75,
    totalNights: 4,
    totalPrice: 300,
    paidAmount: 100,
    paymentStatus: 'Deposit Paid',
    source: 'Airbnb'
  },
  {
    id: 'BK-8910',
    guestId: 'G-1002',
    guestName: 'Nadia Popov',
    roomId: '101-C',
    roomNumber: '101-C',
    roomType: '4-Bed Mixed Dorm',
    checkIn: getRelativeDate(2), // Aug 28
    checkOut: getRelativeDate(6), // Sep 1
    status: 'Confirmed',
    guestsCount: 1,
    nightlyRate: 28,
    totalNights: 4,
    totalPrice: 112,
    paidAmount: 112,
    paymentStatus: 'Paid',
    source: 'Direct Website'
  },
  {
    id: 'BK-8911',
    guestId: 'G-1003',
    guestName: 'Oscar Nilsson',
    roomId: '206',
    roomNumber: '206',
    roomType: 'Single Private',
    checkIn: getRelativeDate(1), // Aug 27
    checkOut: getRelativeDate(4), // Aug 30
    status: 'Pending',
    guestsCount: 1,
    nightlyRate: 55,
    totalNights: 3,
    totalPrice: 165,
    paidAmount: 0,
    paymentStatus: 'Unpaid',
    source: 'Phone Booking'
  },
  {
    id: 'BK-8912',
    guestId: null,
    guestName: 'HVAC Air Filter Replacement',
    roomId: '204',
    roomNumber: '204',
    roomType: 'Twin Ensuite',
    checkIn: getRelativeDate(-1),
    checkOut: getRelativeDate(2),
    status: 'Maintenance',
    guestsCount: 0,
    nightlyRate: 0,
    totalNights: 3,
    totalPrice: 0,
    paidAmount: 0,
    paymentStatus: 'N/A',
    source: 'Internal Maintenance'
  },
  {
    id: 'BK-8913',
    guestId: null,
    guestName: 'Bathroom Tile Regrouting',
    roomId: '212',
    roomNumber: '212',
    roomType: 'Twin Ensuite',
    checkIn: getRelativeDate(0),
    checkOut: getRelativeDate(3),
    status: 'Maintenance',
    guestsCount: 0,
    nightlyRate: 0,
    totalNights: 3,
    totalPrice: 0,
    paidAmount: 0,
    paymentStatus: 'N/A',
    source: 'Internal Maintenance'
  },
  {
    id: 'BK-8914',
    guestId: 'G-1004',
    guestName: 'Zoe & Maya Patel',
    roomId: '303',
    roomNumber: '303',
    roomType: 'Private Balcony',
    checkIn: getRelativeDate(-2),
    checkOut: getRelativeDate(3),
    status: 'Checked In',
    guestsCount: 2,
    nightlyRate: 95,
    totalNights: 5,
    totalPrice: 475,
    paidAmount: 475,
    paymentStatus: 'Paid',
    source: 'Direct Website'
  }
];

const INITIAL_ALERTS = [
  {
    id: 'ALT-101',
    type: 'maintenance',
    title: 'Room 204: AC Unit Leaking',
    description: 'Technician scheduled for 10:30 AM today. Keep room blocked from booking until inspection passes.',
    priority: 'high',
    timestamp: '15 mins ago',
    roomId: '204',
    resolved: false
  },
  {
    id: 'ALT-102',
    type: 'checkin',
    title: 'Late Check-in Arrival: Room 102-E',
    description: 'Liam O\'Connor requested digital door access code for 11:45 PM late night arrival.',
    priority: 'medium',
    timestamp: '42 mins ago',
    roomId: '102-E',
    resolved: false
  },
  {
    id: 'ALT-103',
    type: 'housekeeping',
    title: 'Room 301: Deep Clean Request',
    description: 'Julian Vance scheduled checkout tomorrow at 11:00 AM. VIP Penthouse requires deep sanitation for incoming guest.',
    priority: 'low',
    timestamp: '2 hours ago',
    roomId: '301',
    resolved: false
  }
];

const INITIAL_ACTIVITIES = [
  { id: 'ACT-1', time: '18:42', type: 'checkin', text: 'Lucas Silva checked into Room 101-A', icon: 'user-check', color: 'teal' },
  { id: 'ACT-2', time: '18:15', type: 'payment', text: 'Payment of $140 received for BK-8904 (Elena Rostova)', icon: 'credit-card', color: 'green' },
  { id: 'ACT-3', time: '17:30', type: 'clean', text: 'Room 201 marked as Inspected & Ready by Housekeeping', icon: 'sparkles', color: 'blue' },
  { id: 'ACT-4', time: '16:45', type: 'booking', text: 'New direct reservation created: Zoe & Maya Patel (Room 303)', icon: 'calendar-plus', color: 'purple' },
  { id: 'ACT-5', time: '15:20', type: 'maintenance', text: 'Room 212 blocked for scheduled bathroom tile maintenance', icon: 'tool', color: 'amber' }
];

const REVENUE_METRICS = {
  currentWeekTotal: 12450,
  growthPercentage: 14.2,
  previousWeekTotal: 10900,
  dailyData: [
    { day: 'Thu (20)', amount: 1420, prevAmount: 1300, occupancy: 71 },
    { day: 'Fri (21)', amount: 1890, prevAmount: 1650, occupancy: 85 },
    { day: 'Sat (22)', amount: 2240, prevAmount: 1980, occupancy: 94 },
    { day: 'Sun (23)', amount: 2110, prevAmount: 1850, occupancy: 89 },
    { day: 'Mon (24)', amount: 1530, prevAmount: 1320, occupancy: 76 },
    { day: 'Tue (25)', amount: 1580, prevAmount: 1380, occupancy: 78 },
    { day: 'Wed (26)', amount: 1680, prevAmount: 1420, occupancy: 82 }
  ]
};

/**
 * State Manager Class with LocalStorage Sync
 */
class HostelDataStore {
  constructor() {
    this.storageKeyPrefix = 'hostelhub_';
    this.initStore();
  }

  initStore() {
    if (!localStorage.getItem(this.storageKeyPrefix + 'rooms')) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    localStorage.setItem(this.storageKeyPrefix + 'rooms', JSON.stringify(INITIAL_ROOMS));
    localStorage.setItem(this.storageKeyPrefix + 'guests', JSON.stringify(INITIAL_GUESTS));
    localStorage.setItem(this.storageKeyPrefix + 'bookings', JSON.stringify(INITIAL_BOOKINGS));
    localStorage.setItem(this.storageKeyPrefix + 'alerts', JSON.stringify(INITIAL_ALERTS));
    localStorage.setItem(this.storageKeyPrefix + 'activities', JSON.stringify(INITIAL_ACTIVITIES));
    localStorage.setItem(this.storageKeyPrefix + 'revenue', JSON.stringify(REVENUE_METRICS));
  }

  // --- Rooms ---
  getRooms() {
    return JSON.parse(localStorage.getItem(this.storageKeyPrefix + 'rooms') || '[]');
  }

  saveRooms(rooms) {
    localStorage.setItem(this.storageKeyPrefix + 'rooms', JSON.stringify(rooms));
  }

  updateRoomStatus(roomId, newStatus) {
    const rooms = this.getRooms();
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      room.status = newStatus;
      if (newStatus === 'Available') room.currentGuest = null;
      this.saveRooms(rooms);
      this.addActivity(`Room ${room.number} status updated to ${newStatus}`, 'tool', 'blue');
    }
  }

  updateRoomCondition(roomId, newCondition) {
    const rooms = this.getRooms();
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      room.condition = newCondition;
      this.saveRooms(rooms);
      this.addActivity(`Room ${room.number} condition set to ${newCondition}`, 'sparkles', 'green');
    }
  }

  addRoom(room) {
    const rooms = this.getRooms();
    rooms.push(room);
    this.saveRooms(rooms);
    this.addActivity(`New room ${room.number} added to inventory`, 'home', 'teal');
  }

  // --- Guests ---
  getGuests() {
    return JSON.parse(localStorage.getItem(this.storageKeyPrefix + 'guests') || '[]');
  }

  saveGuests(guests) {
    localStorage.setItem(this.storageKeyPrefix + 'guests', JSON.stringify(guests));
  }

  getGuestById(guestId) {
    const guests = this.getGuests();
    return guests.find(g => g.id === guestId);
  }

  addGuest(guest) {
    const guests = this.getGuests();
    guests.unshift(guest);
    this.saveGuests(guests);
    this.addActivity(`New guest registered: ${guest.name}`, 'user-plus', 'teal');
    return guest;
  }

  // --- Bookings ---
  getBookings() {
    return JSON.parse(localStorage.getItem(this.storageKeyPrefix + 'bookings') || '[]');
  }

  saveBookings(bookings) {
    localStorage.setItem(this.storageKeyPrefix + 'bookings', JSON.stringify(bookings));
  }

  addBooking(booking) {
    const bookings = this.getBookings();
    bookings.push(booking);
    this.saveBookings(bookings);

    // Update room status if checkIn is today
    const rooms = this.getRooms();
    const room = rooms.find(r => r.id === booking.roomId);
    if (room && booking.status === 'Checked In') {
      room.status = 'Occupied';
      room.currentGuest = booking.guestName;
      this.saveRooms(rooms);
    }

    this.addActivity(`New reservation ${booking.id} created for ${booking.guestName} (Room ${booking.roomNumber})`, 'calendar-plus', 'teal');
    return booking;
  }

  updateBookingStatus(bookingId, newStatus) {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = newStatus;
      this.saveBookings(bookings);

      const rooms = this.getRooms();
      const room = rooms.find(r => r.id === booking.roomId);
      if (room) {
        if (newStatus === 'Checked In') {
          room.status = 'Occupied';
          room.currentGuest = booking.guestName;
        } else if (newStatus === 'Checked Out') {
          room.status = 'Available';
          room.condition = 'Needs Cleaning';
          room.currentGuest = null;
        }
        this.saveRooms(rooms);
      }

      this.addActivity(`Booking ${booking.id} (${booking.guestName}) marked as ${newStatus}`, 'check-circle', 'purple');
    }
  }

  // --- Alerts ---
  getAlerts() {
    return JSON.parse(localStorage.getItem(this.storageKeyPrefix + 'alerts') || '[]');
  }

  saveAlerts(alerts) {
    localStorage.setItem(this.storageKeyPrefix + 'alerts', JSON.stringify(alerts));
  }

  resolveAlert(alertId) {
    const alerts = this.getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      this.saveAlerts(alerts);
      this.addActivity(`Alert resolved: ${alert.title}`, 'check', 'green');
    }
  }

  addAlert(alert) {
    const alerts = this.getAlerts();
    alerts.unshift(alert);
    this.saveAlerts(alerts);
  }

  // --- Activities ---
  getActivities() {
    return JSON.parse(localStorage.getItem(this.storageKeyPrefix + 'activities') || '[]');
  }

  addActivity(text, icon = 'info', color = 'teal') {
    const activities = this.getActivities();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    activities.unshift({
      id: 'ACT-' + Date.now(),
      time: timeStr,
      type: 'event',
      text,
      icon,
      color
    });
    if (activities.length > 30) activities.pop();
    localStorage.setItem(this.storageKeyPrefix + 'activities', JSON.stringify(activities));
  }

  // --- Revenue Metrics ---
  getRevenue() {
    return JSON.parse(localStorage.getItem(this.storageKeyPrefix + 'revenue') || JSON.stringify(REVENUE_METRICS));
  }
}

// Instantiate global store
window.store = new HostelDataStore();
