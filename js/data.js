/**
 * HostelHub - Complete Data Store & Auto-Seeding Dataset (v2.5)
 * Manages Hostel Blocks, Rooms, Students, Bookings, Allocations, Payments, Complaints, and LocalStorage Sync.
 */

const DATA_VERSION = '2.5';

const HOSTEL_BLOCKS = [
  { id: 'BLOCK-A', name: 'Block A (Boys Hostel)', type: 'Boys', totalFloors: 3, totalRooms: 18, warden: 'Dr. R. K. Sharma', contact: '+91 98765 43210' },
  { id: 'BLOCK-B', name: 'Block B (Girls Hostel)', type: 'Girls', totalFloors: 3, totalRooms: 16, warden: 'Prof. Sunita Patil', contact: '+91 98765 43211' },
  { id: 'BLOCK-C', name: 'Block C (PG & International)', type: 'Co-ed / PG', totalFloors: 2, totalRooms: 8, warden: 'Dr. Arthur Vance', contact: '+91 98765 43212' }
];

const INITIAL_ROOMS = [
  // Block A (Boys Hostel - Floor 1 & 2)
  { id: 'A-101-A', number: 'A-101-A', block: 'BLOCK-A', floor: 1, type: '4-Bed Dorm', bedType: 'Single Bunk', capacity: 1, rate: 1200, status: 'Occupied', condition: 'Clean', currentStudentId: 'STU-2024-001', currentGuest: 'Rohan Sharma' },
  { id: 'A-101-B', number: 'A-101-B', block: 'BLOCK-A', floor: 1, type: '4-Bed Dorm', bedType: 'Single Bunk', capacity: 1, rate: 1200, status: 'Occupied', condition: 'Clean', currentStudentId: 'STU-2024-002', currentGuest: 'Aditya Verma' },
  { id: 'A-101-C', number: 'A-101-C', block: 'BLOCK-A', floor: 1, type: '4-Bed Dorm', bedType: 'Single Bunk', capacity: 1, rate: 1200, status: 'Available', condition: 'Clean', currentStudentId: null, currentGuest: null },
  { id: 'A-101-D', number: 'A-101-D', block: 'BLOCK-A', floor: 1, type: '4-Bed Dorm', bedType: 'Single Bunk', capacity: 1, rate: 1200, status: 'Available', condition: 'Clean', currentStudentId: null, currentGuest: null },
  
  { id: 'A-102-A', number: 'A-102-A', block: 'BLOCK-A', floor: 1, type: '2-Bed Sharing', bedType: 'Twin Single', capacity: 1, rate: 1800, status: 'Occupied', condition: 'Clean', currentStudentId: 'STU-2024-003', currentGuest: 'Mateo Rossi' },
  { id: 'A-102-B', number: 'A-102-B', block: 'BLOCK-A', floor: 1, type: '2-Bed Sharing', bedType: 'Twin Single', capacity: 1, rate: 1800, status: 'Occupied', condition: 'Clean', currentStudentId: 'STU-2024-004', currentGuest: 'Lucas Silva' },
  
  { id: 'A-201', number: 'A-201', block: 'BLOCK-A', floor: 2, type: 'Single Private (AC)', bedType: 'King Bed', capacity: 1, rate: 2500, status: 'Occupied', condition: 'Clean', currentStudentId: 'STU-2024-005', currentGuest: 'Alexander Wright' },
  { id: 'A-202', number: 'A-202', block: 'BLOCK-A', floor: 2, type: 'Single Private (AC)', bedType: 'King Bed', capacity: 1, rate: 2500, status: 'Available', condition: 'Clean', currentStudentId: null, currentGuest: null },
  { id: 'A-203', number: 'A-203', block: 'BLOCK-A', floor: 2, type: '2-Bed Sharing', bedType: 'Twin Single', capacity: 2, rate: 1500, status: 'Maintenance', condition: 'Needs Cleaning', currentStudentId: null, currentGuest: null },
  { id: 'A-204', number: 'A-204', block: 'BLOCK-A', floor: 2, type: '2-Bed Sharing', bedType: 'Twin Single', capacity: 2, rate: 1500, status: 'Available', condition: 'Clean', currentStudentId: null, currentGuest: null },

  // Block B (Girls Hostel - Floor 1 & 2)
  { id: 'B-101-A', number: 'B-101-A', block: 'BLOCK-B', floor: 1, type: '3-Bed Sharing', bedType: 'Single Bed', capacity: 1, rate: 1600, status: 'Occupied', condition: 'Clean', currentStudentId: 'STU-2024-006', currentGuest: 'Ananya Deshmukh' },
  { id: 'B-101-B', number: 'B-101-B', block: 'BLOCK-B', floor: 1, type: '3-Bed Sharing', bedType: 'Single Bed', capacity: 1, rate: 1600, status: 'Occupied', condition: 'Clean', currentStudentId: 'STU-2024-007', currentGuest: 'Sophia Chen' },
  { id: 'B-101-C', number: 'B-101-C', block: 'BLOCK-B', floor: 1, type: '3-Bed Sharing', bedType: 'Single Bed', capacity: 1, rate: 1600, status: 'Available', condition: 'Clean', currentStudentId: null, currentGuest: null },
  
  { id: 'B-201', number: 'B-201', block: 'BLOCK-B', floor: 2, type: 'Single Deluxe (AC)', bedType: 'Queen Bed', capacity: 1, rate: 2600, status: 'Occupied', condition: 'Clean', currentStudentId: 'STU-2024-008', currentGuest: 'Elena Rostova' },
  { id: 'B-202', number: 'B-202', block: 'BLOCK-B', floor: 2, type: 'Single Deluxe (AC)', bedType: 'Queen Bed', capacity: 1, rate: 2600, status: 'Available', condition: 'Clean', currentStudentId: null, currentGuest: null },
  { id: 'B-203', number: 'B-203', block: 'BLOCK-B', floor: 2, type: '2-Bed Sharing', bedType: 'Twin Single', capacity: 2, rate: 1400, status: 'Occupied', condition: 'Clean', currentStudentId: 'STU-2024-009', currentGuest: 'Amara Diop' },
  { id: 'B-204', number: 'B-204', block: 'BLOCK-B', floor: 2, type: '2-Bed Sharing', bedType: 'Twin Single', capacity: 2, rate: 1400, status: 'Maintenance', condition: 'In Progress', currentStudentId: null, currentGuest: null },

  // Block C (PG & International)
  { id: 'C-301', number: 'C-301', block: 'BLOCK-C', floor: 3, type: 'Studio Suite (AC + Kitchenette)', bedType: 'King Suite', capacity: 2, rate: 3500, status: 'Occupied', condition: 'Clean', currentStudentId: 'STU-2024-010', currentGuest: 'Julian Vance' },
  { id: 'C-302', number: 'C-302', block: 'BLOCK-C', floor: 3, type: 'Studio Suite (AC + Kitchenette)', bedType: 'King Suite', capacity: 2, rate: 3500, status: 'Available', condition: 'Clean', currentStudentId: null, currentGuest: null }
];

const INITIAL_STUDENTS = [
  {
    id: 'STU-2024-001',
    name: 'Rohan Sharma',
    rollNo: '2024-CSE-042',
    email: 'rohan.sharma@college.edu',
    password: 'password123',
    phone: '+91 98230 11223',
    department: 'Computer Science & Engineering',
    year: '3rd Year (Semester 5)',
    gender: 'Male',
    loyaltyTier: 'Gold',
    loyaltyPoints: 1420,
    currentStatus: 'In-House',
    totalStays: 4,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    hostelBlock: 'Block A (Boys Hostel)',
    roomAssigned: 'A-101-A',
    bedNumber: 'Bed A',
    allocationDate: '2026-07-15',
    guardianName: 'Suresh Sharma',
    guardianPhone: '+91 98230 99887',
    emergencyContact: '+91 98230 11223',
    address: '42 MG Road, Pune, Maharashtra',
    feeStatus: 'Paid',
    totalFees: 12000,
    paidFees: 12000,
    pendingFees: 0,
    notes: 'Merit scholar. Quiet room preferred.'
  },
  {
    id: 'STU-2024-002',
    name: 'Aditya Verma',
    rollNo: '2024-CSE-043',
    email: 'aditya.verma@college.edu',
    password: 'password123',
    phone: '+91 98230 44556',
    department: 'Computer Science & Engineering',
    year: '3rd Year (Semester 5)',
    gender: 'Male',
    loyaltyTier: 'Silver',
    loyaltyPoints: 750,
    currentStatus: 'In-House',
    totalStays: 2,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    hostelBlock: 'Block A (Boys Hostel)',
    roomAssigned: 'A-101-B',
    bedNumber: 'Bed B',
    allocationDate: '2026-07-15',
    guardianName: 'Prakash Verma',
    guardianPhone: '+91 98230 11000',
    emergencyContact: '+91 98230 44556',
    address: '77 Shivaji Nagar, Pune',
    feeStatus: 'Paid',
    totalFees: 12000,
    paidFees: 12000,
    pendingFees: 0,
    notes: 'Roommate of Rohan Sharma.'
  },
  {
    id: 'STU-2024-006',
    name: 'Ananya Deshmukh',
    rollNo: '2024-IT-018',
    email: 'ananya.deshmukh@college.edu',
    password: 'password123',
    phone: '+91 98110 55443',
    department: 'Information Technology',
    year: '2nd Year (Semester 3)',
    gender: 'Female',
    loyaltyTier: 'Platinum',
    loyaltyPoints: 2850,
    currentStatus: 'In-House',
    totalStays: 6,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    hostelBlock: 'Block B (Girls Hostel)',
    roomAssigned: 'B-101-A',
    bedNumber: 'Bed A',
    allocationDate: '2026-07-16',
    guardianName: 'Kavita Deshmukh',
    guardianPhone: '+91 98110 88776',
    emergencyContact: '+91 98110 55443',
    address: '15 FC Road, Mumbai, Maharashtra',
    feeStatus: 'Partial',
    totalFees: 15000,
    paidFees: 10000,
    pendingFees: 5000,
    notes: 'Resident Representative for Block B.'
  },
  {
    id: 'STU-2024-007',
    name: 'Sophia Chen',
    rollNo: '2024-AI-005',
    email: 'sophia.chen@techglobal.com',
    password: 'password123',
    phone: '+1 (415) 890-3412',
    department: 'Artificial Intelligence & Data Science',
    year: '3rd Year (Semester 5)',
    gender: 'Female',
    loyaltyTier: 'Gold',
    loyaltyPoints: 1650,
    currentStatus: 'In-House',
    totalStays: 3,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    hostelBlock: 'Block B (Girls Hostel)',
    roomAssigned: 'B-101-B',
    bedNumber: 'Bed B',
    allocationDate: '2026-07-18',
    guardianName: 'David Chen',
    guardianPhone: '+1 415 890 0001',
    emergencyContact: '+1 415 890 3412',
    address: 'San Francisco, CA, USA',
    feeStatus: 'Overdue',
    totalFees: 16000,
    paidFees: 0,
    pendingFees: 16000,
    notes: 'Robotics lab project resident.'
  },
  {
    id: 'STU-2024-005',
    name: 'Alexander Wright',
    rollNo: '2024-MECH-099',
    email: 'alex.wright@wanderlust.io',
    password: 'password123',
    phone: '+44 7700 900452',
    department: 'Mechanical Engineering',
    year: '4th Year (Semester 7)',
    gender: 'Male',
    loyaltyTier: 'Silver',
    loyaltyPoints: 890,
    currentStatus: 'In-House',
    totalStays: 2,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    hostelBlock: 'Block A (Boys Hostel)',
    roomAssigned: 'A-201',
    bedNumber: 'Bed A (Single)',
    allocationDate: '2026-07-10',
    guardianName: 'Emma Wright',
    guardianPhone: '+44 7700 900111',
    emergencyContact: '+44 7700 900452',
    address: 'London, United Kingdom',
    feeStatus: 'Paid',
    totalFees: 20000,
    paidFees: 20000,
    pendingFees: 0,
    notes: 'Exchange scholar from UK.'
  },
  {
    id: 'STU-2024-003',
    name: 'Mateo Rossi',
    rollNo: '2024-CIVIL-012',
    email: 'mateo.rossi@italia.it',
    password: 'password123',
    phone: '+39 02 8765 4321',
    department: 'Civil & Architectural Engineering',
    year: '2nd Year (Semester 3)',
    gender: 'Male',
    loyaltyTier: 'Silver',
    loyaltyPoints: 600,
    currentStatus: 'In-House',
    totalStays: 1,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    hostelBlock: 'Block A (Boys Hostel)',
    roomAssigned: 'A-102-A',
    bedNumber: 'Bed A',
    allocationDate: '2026-07-20',
    guardianName: 'Marco Rossi',
    guardianPhone: '+39 02 8765 0000',
    emergencyContact: '+39 02 8765 4321',
    address: 'Milan, Italy',
    feeStatus: 'Paid',
    totalFees: 14000,
    paidFees: 14000,
    pendingFees: 0,
    notes: 'Design team lead.'
  }
];

const INITIAL_BOOKINGS = [
  {
    id: 'BKG-7001',
    guestName: 'Rohan Sharma',
    guestEmail: 'rohan.sharma@college.edu',
    roomId: 'A-101-A',
    roomNumber: 'A-101-A',
    startDate: '2026-08-20',
    endDate: '2026-09-08',
    checkIn: '2026-08-20',
    checkOut: '2026-09-08',
    status: 'Checked-In',
    pax: 1,
    totalAmount: 1200,
    paymentStatus: 'Paid',
    channel: 'Campus Allotment',
    color: 'teal'
  },
  {
    id: 'BKG-7002',
    guestName: 'Aditya Verma',
    guestEmail: 'aditya.verma@college.edu',
    roomId: 'A-101-B',
    roomNumber: 'A-101-B',
    startDate: '2026-08-22',
    endDate: '2026-09-05',
    checkIn: '2026-08-22',
    checkOut: '2026-09-05',
    status: 'Checked-In',
    pax: 1,
    totalAmount: 1200,
    paymentStatus: 'Paid',
    channel: 'Direct Allotment',
    color: 'indigo'
  },
  {
    id: 'BKG-7003',
    guestName: 'Mateo Rossi',
    guestEmail: 'mateo.rossi@italia.it',
    roomId: 'A-102-A',
    roomNumber: 'A-102-A',
    startDate: '2026-08-24',
    endDate: '2026-09-02',
    checkIn: '2026-08-24',
    checkOut: '2026-09-02',
    status: 'Confirmed',
    pax: 1,
    totalAmount: 1800,
    paymentStatus: 'Paid',
    channel: 'Campus Portal',
    color: 'teal'
  },
  {
    id: 'BKG-7004',
    guestName: 'Lucas Silva',
    guestEmail: 'lucas.silva@rio.br',
    roomId: 'A-102-B',
    roomNumber: 'A-102-B',
    startDate: '2026-08-25',
    endDate: '2026-09-06',
    checkIn: '2026-08-25',
    checkOut: '2026-09-06',
    status: 'Checked-In',
    pax: 1,
    totalAmount: 1800,
    paymentStatus: 'Paid',
    channel: 'Campus Portal',
    color: 'emerald'
  },
  {
    id: 'BKG-7005',
    guestName: 'Alexander Wright',
    guestEmail: 'alex.wright@wanderlust.io',
    roomId: 'A-201',
    roomNumber: 'A-201',
    startDate: '2026-08-23',
    endDate: '2026-09-07',
    checkIn: '2026-08-23',
    checkOut: '2026-09-07',
    status: 'Checked-In',
    pax: 1,
    totalAmount: 2500,
    paymentStatus: 'Paid',
    channel: 'International Portal',
    color: 'purple'
  },
  {
    id: 'BKG-7006',
    guestName: 'Ananya Deshmukh',
    guestEmail: 'ananya.deshmukh@college.edu',
    roomId: 'B-101-A',
    roomNumber: 'B-101-A',
    startDate: '2026-08-20',
    endDate: '2026-09-10',
    checkIn: '2026-08-20',
    checkOut: '2026-09-10',
    status: 'Checked-In',
    pax: 1,
    totalAmount: 1600,
    paymentStatus: 'Paid',
    channel: 'Direct Allotment',
    color: 'teal'
  },
  {
    id: 'BKG-7007',
    guestName: 'Sophia Chen',
    guestEmail: 'sophia.chen@techglobal.com',
    roomId: 'B-101-B',
    roomNumber: 'B-101-B',
    startDate: '2026-08-22',
    endDate: '2026-09-04',
    checkIn: '2026-08-22',
    checkOut: '2026-09-04',
    status: 'Confirmed',
    pax: 1,
    totalAmount: 1600,
    paymentStatus: 'Pending',
    channel: 'Academic Exchange',
    color: 'amber'
  },
  {
    id: 'BKG-7008',
    guestName: 'Elena Rostova',
    guestEmail: 'elena.rostova@travel.ru',
    roomId: 'B-201',
    roomNumber: 'B-201',
    startDate: '2026-08-25',
    endDate: '2026-09-03',
    checkIn: '2026-08-25',
    checkOut: '2026-09-03',
    status: 'Checked-In',
    pax: 1,
    totalAmount: 2600,
    paymentStatus: 'Paid',
    channel: 'Direct Booking',
    color: 'indigo'
  },
  {
    id: 'BKG-7009',
    guestName: 'Amara Diop',
    guestEmail: 'amara.diop@dakar.sn',
    roomId: 'B-203',
    roomNumber: 'B-203',
    startDate: '2026-08-24',
    endDate: '2026-09-01',
    checkIn: '2026-08-24',
    checkOut: '2026-09-01',
    status: 'Checked-In',
    pax: 1,
    totalAmount: 1400,
    paymentStatus: 'Paid',
    channel: 'Campus Portal',
    color: 'teal'
  },
  {
    id: 'BKG-7010',
    guestName: 'Julian Vance',
    guestEmail: 'julian.vance@oxford.ac.uk',
    roomId: 'C-301',
    roomNumber: 'C-301',
    startDate: '2026-08-21',
    endDate: '2026-09-09',
    checkIn: '2026-08-21',
    checkOut: '2026-09-09',
    status: 'Checked-In',
    pax: 2,
    totalAmount: 3500,
    paymentStatus: 'Paid',
    channel: 'Scholar Fellow Allotment',
    color: 'purple'
  }
];

const INITIAL_ALLOCATIONS = [
  {
    id: 'ALLOT-1001',
    studentId: 'STU-2024-001',
    studentName: 'Rohan Sharma',
    rollNo: '2024-CSE-042',
    department: 'Computer Science',
    gender: 'Male',
    preferredBlock: 'BLOCK-A',
    preferredRoomType: '4-Bed Dorm',
    allocatedBlock: 'Block A (Boys Hostel)',
    allocatedRoomId: 'A-101-A',
    allocatedBed: 'Bed A',
    term: 'Fall 2026',
    status: 'Allocated',
    requestedDate: '2026-07-10',
    allottedDate: '2026-07-15',
    allottedBy: 'Chief Warden',
    remarks: 'Regular academic merit allocation'
  },
  {
    id: 'ALLOT-1002',
    studentId: 'STU-2024-006',
    studentName: 'Ananya Deshmukh',
    rollNo: '2024-IT-018',
    department: 'Information Technology',
    gender: 'Female',
    preferredBlock: 'BLOCK-B',
    preferredRoomType: '3-Bed Sharing',
    allocatedBlock: 'Block B (Girls Hostel)',
    allocatedRoomId: 'B-101-A',
    allocatedBed: 'Bed A',
    term: 'Fall 2026',
    status: 'Allocated',
    requestedDate: '2026-07-12',
    allottedDate: '2026-07-16',
    allottedBy: 'Warden Sunita Patil',
    remarks: 'Allotted as per department quota'
  },
  {
    id: 'ALLOT-1003',
    studentId: 'STU-2024-012',
    studentName: 'Vikram Mehta',
    rollNo: '2024-ECE-031',
    department: 'Electronics & Telecomm',
    gender: 'Male',
    preferredBlock: 'BLOCK-A',
    preferredRoomType: '2-Bed Sharing',
    allocatedBlock: null,
    allocatedRoomId: null,
    allocatedBed: null,
    term: 'Fall 2026',
    status: 'Pending',
    requestedDate: '2026-08-25',
    allottedDate: null,
    allottedBy: null,
    remarks: 'Pending room availability verification'
  }
];

const INITIAL_PAYMENTS = [
  {
    id: 'PAY-9011',
    studentId: 'STU-2024-001',
    studentName: 'Rohan Sharma',
    rollNo: '2024-CSE-042',
    roomNumber: 'A-101-A',
    semester: 'Semester 5 (Fall 2026)',
    structure: {
      roomRent: 6000,
      messCharges: 4000,
      cautionDeposit: 1000,
      maintenanceFee: 1000,
      total: 12000
    },
    paidAmount: 12000,
    pendingAmount: 0,
    status: 'Paid',
    dueDate: '2026-08-15',
    paidDate: '2026-08-10',
    method: 'UPI (Google Pay)',
    transactionId: 'UPI-9842019284',
    receiptNumber: 'REC-2026-0841'
  },
  {
    id: 'PAY-9012',
    studentId: 'STU-2024-006',
    studentName: 'Ananya Deshmukh',
    rollNo: '2024-IT-018',
    roomNumber: 'B-101-A',
    semester: 'Semester 3 (Fall 2026)',
    structure: {
      roomRent: 8000,
      messCharges: 5000,
      cautionDeposit: 1000,
      maintenanceFee: 1000,
      total: 15000
    },
    paidAmount: 10000,
    pendingAmount: 5000,
    status: 'Partial',
    dueDate: '2026-08-30',
    paidDate: '2026-08-12',
    method: 'Net Banking (HDFC Bank)',
    transactionId: 'HDFC-8841029',
    receiptNumber: 'REC-2026-0842'
  },
  {
    id: 'PAY-9013',
    studentId: 'STU-2024-007',
    studentName: 'Sophia Chen',
    rollNo: '2024-AI-005',
    roomNumber: 'B-101-B',
    semester: 'Semester 5 (Fall 2026)',
    structure: {
      roomRent: 9000,
      messCharges: 5000,
      cautionDeposit: 1000,
      maintenanceFee: 1000,
      total: 16000
    },
    paidAmount: 0,
    pendingAmount: 16000,
    status: 'Overdue',
    dueDate: '2026-08-20',
    paidDate: null,
    method: 'Pending',
    transactionId: '-',
    receiptNumber: '-'
  }
];

const INITIAL_COMPLAINTS = [
  {
    id: 'CMP-801',
    studentId: 'STU-2024-001',
    studentName: 'Rohan Sharma',
    roomNumber: 'A-101',
    block: 'Block A (Boys Hostel)',
    category: 'Electrical',
    title: 'Ceiling Fan making squeaking noise & regulator not working',
    description: 'The ceiling fan in Room A-101 runs at high speed only, regulator knob is stuck.',
    priority: 'Medium',
    status: 'Assigned',
    assignedTo: 'Rajesh Electrician',
    createdAt: '2026-08-27 10:30 AM',
    resolvedAt: null,
    rating: null,
    staffNotes: 'Technician dispatched for 2:00 PM slot'
  },
  {
    id: 'CMP-802',
    studentId: 'STU-2024-006',
    studentName: 'Ananya Deshmukh',
    roomNumber: 'B-101',
    block: 'Block B (Girls Hostel)',
    category: 'Plumbing',
    title: 'Washroom hot water tap leaking water continuously',
    description: 'Hot water geyser connection tap is dripping heavily, causing floor dampness.',
    priority: 'High',
    status: 'In Progress',
    assignedTo: 'Suresh Plumber',
    createdAt: '2026-08-28 08:15 AM',
    resolvedAt: null,
    rating: null,
    staffNotes: 'Washer replacement required'
  },
  {
    id: 'CMP-803',
    studentId: 'STU-2024-005',
    studentName: 'Alexander Wright',
    roomNumber: 'A-201',
    block: 'Block A (Boys Hostel)',
    category: 'Wi-Fi / Internet',
    title: 'Wi-Fi Access Point 2nd Floor disconnecting frequently',
    description: 'Signal drops every 10 minutes during evening study hours.',
    priority: 'Low',
    status: 'Resolved',
    assignedTo: 'IT Network Team',
    createdAt: '2026-08-25 04:00 PM',
    resolvedAt: '2026-08-26 11:00 AM',
    rating: 5,
    staffNotes: 'Router firmware upgraded and channel changed'
  }
];

const INITIAL_ALERTS = [
  { id: 'ALT-1', type: 'Maintenance', title: 'AC Water Leak reported', unit: 'Unit A-203', time: '10m ago', resolved: false },
  { id: 'ALT-2', type: 'Housekeeping', title: 'Deep Sanitization pending', unit: 'Unit B-204', time: '25m ago', resolved: false },
  { id: 'ALT-3', type: 'Plumbing', title: 'Water Pressure fluctuation', unit: 'Block A Floor 2', time: '1h ago', resolved: false }
];

const MESS_MENU = {
  today: 'Wednesday',
  breakfast: 'Poha, Boiled Eggs / Banana, Masala Tea, Coffee',
  lunch: 'Paneer Butter Masala, Dal Tadka, Jeera Rice, Chapatis, Green Salad',
  snacks: 'Samosa / Veg Cutlet, Filter Coffee',
  dinner: 'Veg Biryani / Chicken Curry, Raita, Gulab Jamun'
};

const NOTICE_BOARD = [
  { id: 'NOT-1', date: '2026-08-28', title: 'Hostel Annual Sports & Cultural Meet 2026', author: 'Chief Warden', priority: 'High', text: 'Registrations for Inter-Block Cricket and Badminton tournament are now open at the warden office.' },
  { id: 'NOT-2', date: '2026-08-26', title: 'Scheduled Water Tank Cleaning - Saturday', author: 'Maintenance Office', priority: 'Medium', text: 'Water supply to Block A & B will be restricted from 9:00 AM to 1:00 PM on Saturday for routine maintenance.' },
  { id: 'NOT-3', date: '2026-08-24', title: 'Late Entry Gate Timing Notice', author: 'Hostel Committee', priority: 'Low', text: 'Curfew time for all resident students is strictly 10:00 PM. Digital biometric punch is mandatory.' }
];

/**
 * HostelDataStore with auto-migration and robust fallbacks
 */
class HostelDataStore {
  constructor() {
    this.storageKeyPrefix = 'hostelhub_';
    this.initStore();
  }

  initStore() {
    const version = localStorage.getItem(this.storageKeyPrefix + 'version');
    if (version !== DATA_VERSION) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    localStorage.setItem(this.storageKeyPrefix + 'version', DATA_VERSION);
    localStorage.setItem(this.storageKeyPrefix + 'blocks', JSON.stringify(HOSTEL_BLOCKS));
    localStorage.setItem(this.storageKeyPrefix + 'rooms', JSON.stringify(INITIAL_ROOMS));
    localStorage.setItem(this.storageKeyPrefix + 'students', JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(this.storageKeyPrefix + 'bookings', JSON.stringify(INITIAL_BOOKINGS));
    localStorage.setItem(this.storageKeyPrefix + 'allocations', JSON.stringify(INITIAL_ALLOCATIONS));
    localStorage.setItem(this.storageKeyPrefix + 'payments', JSON.stringify(INITIAL_PAYMENTS));
    localStorage.setItem(this.storageKeyPrefix + 'complaints', JSON.stringify(INITIAL_COMPLAINTS));
    localStorage.setItem(this.storageKeyPrefix + 'alerts', JSON.stringify(INITIAL_ALERTS));
    localStorage.setItem(this.storageKeyPrefix + 'mess_menu', JSON.stringify(MESS_MENU));
    localStorage.setItem(this.storageKeyPrefix + 'notices', JSON.stringify(NOTICE_BOARD));
  }

  // --- Blocks ---
  getBlocks() {
    const raw = localStorage.getItem(this.storageKeyPrefix + 'blocks');
    return raw ? JSON.parse(raw) : HOSTEL_BLOCKS;
  }

  // --- Rooms ---
  getRooms() {
    const raw = localStorage.getItem(this.storageKeyPrefix + 'rooms');
    return raw ? JSON.parse(raw) : INITIAL_ROOMS;
  }

  saveRooms(rooms) {
    localStorage.setItem(this.storageKeyPrefix + 'rooms', JSON.stringify(rooms));
  }

  updateRoomStatus(roomId, newStatus) {
    const rooms = this.getRooms();
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      room.status = newStatus;
      if (newStatus === 'Available') {
        room.currentStudentId = null;
        room.currentGuest = null;
      }
      this.saveRooms(rooms);
    }
  }

  updateRoomCondition(roomId, newCondition) {
    const rooms = this.getRooms();
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      room.condition = newCondition;
      this.saveRooms(rooms);
    }
  }

  addRoom(room) {
    const rooms = this.getRooms();
    rooms.push(room);
    this.saveRooms(rooms);
  }

  // --- Students / CRM Directory ---
  getStudents() {
    const raw = localStorage.getItem(this.storageKeyPrefix + 'students');
    if (!raw || raw === '[]') {
      localStorage.setItem(this.storageKeyPrefix + 'students', JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    return JSON.parse(raw);
  }

  saveStudents(students) {
    localStorage.setItem(this.storageKeyPrefix + 'students', JSON.stringify(students));
  }

  getStudentById(id) {
    return this.getStudents().find(s => s.id === id);
  }

  addStudent(student) {
    const students = this.getStudents();
    students.unshift(student);
    this.saveStudents(students);
    return student;
  }

  getGuests() {
    return this.getStudents();
  }

  saveGuests(guests) {
    this.saveStudents(guests);
  }

  getGuestById(id) {
    return this.getStudentById(id);
  }

  addGuest(guest) {
    return this.addStudent(guest);
  }

  // --- Bookings & Calendar ---
  getBookings() {
    const raw = localStorage.getItem(this.storageKeyPrefix + 'bookings');
    if (!raw || raw === '[]') {
      localStorage.setItem(this.storageKeyPrefix + 'bookings', JSON.stringify(INITIAL_BOOKINGS));
      return INITIAL_BOOKINGS;
    }
    return JSON.parse(raw);
  }

  saveBookings(bookings) {
    localStorage.setItem(this.storageKeyPrefix + 'bookings', JSON.stringify(bookings));
  }

  addBooking(booking) {
    const bookings = this.getBookings();
    bookings.unshift(booking);
    this.saveBookings(bookings);
    return booking;
  }

  // --- Room Allocations ---
  getAllocations() {
    const raw = localStorage.getItem(this.storageKeyPrefix + 'allocations');
    return raw ? JSON.parse(raw) : INITIAL_ALLOCATIONS;
  }

  saveAllocations(allocations) {
    localStorage.setItem(this.storageKeyPrefix + 'allocations', JSON.stringify(allocations));
  }

  addAllocationRequest(req) {
    const allocations = this.getAllocations();
    allocations.unshift(req);
    this.saveAllocations(allocations);
    return req;
  }

  approveAllocation(allotmentId, roomId, bedName, allottedBy = 'Chief Warden') {
    const allocations = this.getAllocations();
    const allot = allocations.find(a => a.id === allotmentId);
    if (allot) {
      allot.status = 'Allocated';
      allot.allocatedRoomId = roomId;
      allot.allocatedBed = bedName;
      allot.allottedDate = new Date().toISOString().split('T')[0];
      allot.allottedBy = allottedBy;
      this.saveAllocations(allocations);

      const rooms = this.getRooms();
      const room = rooms.find(r => r.id === roomId);
      if (room) {
        room.status = 'Occupied';
        room.currentStudentId = allot.studentId;
        room.currentGuest = allot.studentName;
        this.saveRooms(rooms);
      }

      const students = this.getStudents();
      const student = students.find(s => s.id === allot.studentId);
      if (student) {
        student.roomAssigned = roomId;
        student.bedNumber = bedName;
        student.hostelBlock = allot.preferredBlock === 'BLOCK-B' ? 'Block B (Girls Hostel)' : 'Block A (Boys Hostel)';
        this.saveStudents(students);
      }
    }
  }

  // --- Payments & Fees ---
  getPayments() {
    const raw = localStorage.getItem(this.storageKeyPrefix + 'payments');
    return raw ? JSON.parse(raw) : INITIAL_PAYMENTS;
  }

  savePayments(payments) {
    localStorage.setItem(this.storageKeyPrefix + 'payments', JSON.stringify(payments));
  }

  addPayment(pay) {
    const payments = this.getPayments();
    payments.unshift(pay);
    this.savePayments(payments);

    const students = this.getStudents();
    const student = students.find(s => s.id === pay.studentId);
    if (student) {
      student.paidFees = (student.paidFees || 0) + pay.paidAmount;
      student.pendingFees = Math.max(0, (student.totalFees || 12000) - student.paidFees);
      student.feeStatus = student.pendingFees === 0 ? 'Paid' : 'Partial';
      this.saveStudents(students);
    }
    return pay;
  }

  // --- Complaints ---
  getComplaints() {
    const raw = localStorage.getItem(this.storageKeyPrefix + 'complaints');
    return raw ? JSON.parse(raw) : INITIAL_COMPLAINTS;
  }

  saveComplaints(complaints) {
    localStorage.setItem(this.storageKeyPrefix + 'complaints', JSON.stringify(complaints));
  }

  addComplaint(cmp) {
    const complaints = this.getComplaints();
    complaints.unshift(cmp);
    this.saveComplaints(complaints);
    return cmp;
  }

  updateComplaintStatus(cmpId, status, staffNotes = '', assignedTo = '') {
    const complaints = this.getComplaints();
    const cmp = complaints.find(c => c.id === cmpId);
    if (cmp) {
      cmp.status = status;
      if (staffNotes) cmp.staffNotes = staffNotes;
      if (assignedTo) cmp.assignedTo = assignedTo;
      if (status === 'Resolved') cmp.resolvedAt = new Date().toLocaleString();
      this.saveComplaints(complaints);
    }
  }

  rateComplaint(cmpId, rating) {
    const complaints = this.getComplaints();
    const cmp = complaints.find(c => c.id === cmpId);
    if (cmp) {
      cmp.rating = rating;
      this.saveComplaints(complaints);
    }
  }

  // --- Alerts ---
  getAlerts() {
    const raw = localStorage.getItem(this.storageKeyPrefix + 'alerts');
    return raw ? JSON.parse(raw) : INITIAL_ALERTS;
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
    }
  }

  addAlert(alert) {
    const alerts = this.getAlerts();
    alerts.unshift(alert);
    this.saveAlerts(alerts);
  }

  getRevenue() {
    return {
      currentWeekTotal: 142500,
      growthPercentage: 14.2,
      previousWeekTotal: 124100,
      dailyData: [
        { day: 'Thu (20)', amount: 18400, occupancy: 82 },
        { day: 'Fri (21)', amount: 22100, occupancy: 88 },
        { day: 'Sat (22)', amount: 26500, occupancy: 94 },
        { day: 'Sun (23)', amount: 24200, occupancy: 91 },
        { day: 'Mon (24)', amount: 17800, occupancy: 84 },
        { day: 'Tue (25)', amount: 16900, occupancy: 85 },
        { day: 'Wed (26)', amount: 16600, occupancy: 87 }
      ]
    };
  }

  getMessMenu() {
    const raw = localStorage.getItem(this.storageKeyPrefix + 'mess_menu');
    return raw ? JSON.parse(raw) : MESS_MENU;
  }

  getNotices() {
    const raw = localStorage.getItem(this.storageKeyPrefix + 'notices');
    return raw ? JSON.parse(raw) : NOTICE_BOARD;
  }
}

// Global store
window.store = new HostelDataStore();
