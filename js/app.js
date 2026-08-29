/**
 * HostelHub - Enhanced Application Controller
 * Handles Navigation Routing, Interactive Notification Dropdown, Command Palette (Ctrl+K),
 * Reservation/Booking Engine, Audio Feedback Engine, Dark Theme, Modals, and State Synchronization.
 */

class HostelHubApp {
  constructor() {
    this.currentView = 'dashboard';
    this.isDarkMode = localStorage.getItem('hostelhub_dark_mode') === 'true';
    this.isAudioMuted = localStorage.getItem('hostelhub_audio_muted') === 'true';
    this.audioCtx = null;
    this.selectedCommandIndex = 0;
    this.filteredCommands = [];
    
    this.initTheme();
    this.initEventListeners();
  }

  init() {
    if (window.auth) {
      window.auth.updateAppForRole();
    }
    const hash = window.location.hash.replace('#', '') || (window.auth && window.auth.isStudent() ? 'student-home' : 'dashboard');
    this.navigate(hash);
    this.updateBellBadge();
  }

  // --- Audio Synthesis Feedback (Zero External Files) ---
  initAudio() {
    if (!this.audioCtx && typeof window.AudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playAudio(type = 'pop') {
    if (this.isAudioMuted) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'success' || type === 'chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'resolve') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(1046.50, now + 0.16);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'warning') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch (e) {}
  }

  toggleAudioMute() {
    this.isAudioMuted = !this.isAudioMuted;
    localStorage.setItem('hostelhub_audio_muted', this.isAudioMuted);
    this.showToast(this.isAudioMuted ? 'Sound effects muted' : 'Sound effects enabled', 'info');
  }

  // --- Dark Mode Theme Manager ---
  initTheme() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('hostelhub_dark_mode', this.isDarkMode);
    this.initTheme();
    this.playAudio('pop');
    this.showToast(this.isDarkMode ? 'Switched to Dark Slate Theme' : 'Switched to Clean Light Theme', 'info');
  }

  // --- View Routing & Navigation ---
  navigate(viewId) {
    const views = ['dashboard', 'student-home', 'rooms', 'allocations', 'payments', 'complaints', 'calendar', 'settings'];
    
    let targetView = viewId;
    if (targetView === 'guests') {
      targetView = 'allocations';
    } else if (targetView === 'student-home' || (targetView === 'dashboard' && window.auth && window.auth.isStudent())) {
      targetView = 'dashboard';
    }

    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        if (v === targetView) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-view') === targetView) {
        link.classList.add('bg-teal-600', 'text-white', 'font-bold');
        link.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
      } else {
        link.classList.remove('bg-teal-600', 'text-white', 'font-bold');
        link.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
      }
    });

    this.currentView = targetView;
    window.location.hash = targetView;

    if (targetView === 'dashboard' && window.dashboard) {
      window.dashboard.render();
    } else if (targetView === 'rooms' && window.rooms) {
      window.rooms.render();
    } else if (targetView === 'allocations' && window.allocations) {
      window.allocations.render();
    } else if (targetView === 'payments' && window.payments) {
      window.payments.render();
    } else if (targetView === 'complaints' && window.complaints) {
      window.complaints.render();
    } else if (targetView === 'calendar' && window.calendar) {
      window.calendar.render();
    }

    window.scrollTo(0, 0);
  }

  // --- Reservation / Booking Engine ---
  openReservationModal(params = {}) {
    const rooms = window.store.getRooms();
    const modalContent = document.getElementById('reservation-modal-content');
    if (!modalContent) return;

    const defaultRoomId = params.roomId || (rooms.find(r => r.status === 'Available') || rooms[0]).id;
    const defaultCheckIn = params.checkIn || new Date().toISOString().split('T')[0];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 14);
    const defaultCheckOut = params.checkOut || nextDate.toISOString().split('T')[0];

    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
        <div class="flex items-center gap-2">
          <span class="text-xl">📅</span>
          <div>
            <h3 class="text-base font-bold">New Booking / Room Reservation</h3>
            <p class="text-xs text-slate-400">Front Desk & Campus Stay Management</p>
          </div>
        </div>
        <button onclick="window.app.closeModal('modal-reservation')" class="text-slate-400 hover:text-white text-xl font-bold p-1">&times;</button>
      </div>

      <form onsubmit="window.app.handleReservationSubmit(event)" class="p-6 space-y-4 text-xs font-sans">
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Guest / Student Full Name</label>
            <input type="text" id="res-guest-name" required placeholder="e.g. David Miller" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Contact Email / Phone</label>
            <input type="text" id="res-guest-contact" required placeholder="e.g. david@email.com / +91 98..." class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Select Unit / Bed</label>
            <select id="res-room-id" required class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              ${rooms.map(r => `
                <option value="${r.id}" ${r.id === defaultRoomId ? 'selected' : ''}>${r.number} - ${r.type} ($${r.rate}/mo • ${r.status})</option>
              `).join('')}
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Booking Channel</label>
            <select id="res-channel" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              <option value="Direct Front Desk">Direct Front Desk (Walk-In)</option>
              <option value="Campus Student Portal">Campus Student Portal</option>
              <option value="Academic Exchange">Academic Exchange Program</option>
              <option value="Website Booking">Direct Website</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Check-In Date</label>
            <input type="date" id="res-checkin" required value="${defaultCheckIn}" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Check-Out Date</label>
            <input type="date" id="res-checkout" required value="${defaultCheckOut}" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Number of Occupants (Pax)</label>
            <input type="number" id="res-pax" min="1" max="4" value="1" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Payment Status</label>
            <select id="res-pay-status" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              <option value="Paid">Paid in Full</option>
              <option value="Partial">Partial Deposit Paid</option>
              <option value="Pending">Pay at Front Desk</option>
            </select>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-reservation')" class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm">
            Confirm & Create Booking
          </button>
        </div>

      </form>
    `;

    this.openModal('modal-reservation');
  }

  handleReservationSubmit(e) {
    e.preventDefault();
    const guestName = document.getElementById('res-guest-name').value.trim();
    const contact = document.getElementById('res-guest-contact').value.trim();
    const roomId = document.getElementById('res-room-id').value;
    const channel = document.getElementById('res-channel').value;
    const checkIn = document.getElementById('res-checkin').value;
    const checkOut = document.getElementById('res-checkout').value;
    const pax = parseInt(document.getElementById('res-pax').value, 10);
    const payStatus = document.getElementById('res-pay-status').value;

    const rooms = window.store.getRooms();
    const room = rooms.find(r => r.id === roomId);

    const newBooking = {
      id: 'BKG-' + Math.floor(7000 + Math.random() * 2000),
      guestName,
      guestEmail: contact.includes('@') ? contact : `${guestName.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      roomId,
      roomNumber: room ? room.number : roomId,
      startDate: checkIn,
      endDate: checkOut,
      checkIn,
      checkOut,
      status: 'Confirmed',
      pax,
      totalAmount: room ? room.rate : 1500,
      paymentStatus: payStatus,
      channel,
      color: 'teal'
    };

    window.store.addBooking(newBooking);
    if (room) {
      window.store.updateRoomStatus(roomId, 'Occupied');
      room.currentGuest = guestName;
      window.store.saveRooms(rooms);
    }

    this.closeModal('modal-reservation');
    this.playAudio('success');
    this.showToast(`Booking ${newBooking.id} confirmed for ${guestName}!`, 'success');

    if (this.currentView === 'calendar' && window.calendar) window.calendar.render();
    if (this.currentView === 'rooms' && window.rooms) window.rooms.render();
    if (this.currentView === 'dashboard' && window.dashboard) window.dashboard.render();
  }

  openBookingDetailsModal(bookingId) {
    const bookings = window.store.getBookings ? window.store.getBookings() : [];
    const bk = bookings.find(b => b.id === bookingId);
    if (!bk) return;

    const modalContent = document.getElementById('booking-details-modal-content');
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
        <div>
          <h3 class="text-base font-bold">Booking Details: ${bk.id}</h3>
          <p class="text-xs text-slate-400">Unit ${bk.roomNumber} • ${bk.status}</p>
        </div>
        <button onclick="window.app.closeModal('modal-booking-details')" class="text-slate-400 hover:text-white text-xl font-bold p-1">&times;</button>
      </div>

      <div class="p-6 space-y-4 text-xs font-sans">
        
        <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
          <div class="flex justify-between">
            <span class="text-slate-400">Guest / Student:</span>
            <strong class="text-slate-900 dark:text-white">${bk.guestName}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Email:</span>
            <span>${bk.guestEmail}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Dates:</span>
            <strong class="text-teal-600">${bk.checkIn || bk.startDate} → ${bk.checkOut || bk.endDate}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Total Rate:</span>
            <strong>$${bk.totalAmount || 1500} (${bk.paymentStatus || 'Paid'})</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Channel:</span>
            <span>${bk.channel || 'Direct'}</span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
          ${bk.status !== 'Checked-In' ? `
            <button onclick="window.app.checkInBooking('${bk.id}')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm">
              ✓ Check In Guest
            </button>
          ` : `
            <button onclick="window.app.checkOutBooking('${bk.id}')" class="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs shadow-sm">
              🚪 Check Out & Free Room
            </button>
          `}
          <button onclick="window.app.closeModal('modal-booking-details')" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold">
            Close
          </button>
        </div>

      </div>
    `;

    this.openModal('modal-booking-details');
  }

  checkInBooking(bookingId) {
    const bookings = window.store.getBookings();
    const bk = bookings.find(b => b.id === bookingId);
    if (bk) {
      bk.status = 'Checked-In';
      window.store.saveBookings(bookings);
      this.playAudio('success');
      this.showToast(`Guest ${bk.guestName} checked in to Unit ${bk.roomNumber}`, 'success');
      this.closeModal('modal-booking-details');
      if (this.currentView === 'calendar' && window.calendar) window.calendar.render();
    }
  }

  checkOutBooking(bookingId) {
    const bookings = window.store.getBookings();
    const bk = bookings.find(b => b.id === bookingId);
    if (bk) {
      bk.status = 'Checked-Out';
      window.store.saveBookings(bookings);
      window.store.updateRoomStatus(bk.roomId, 'Available');
      this.playAudio('resolve');
      this.showToast(`Guest ${bk.guestName} checked out. Unit ${bk.roomNumber} now available.`, 'info');
      this.closeModal('modal-booking-details');
      if (this.currentView === 'calendar' && window.calendar) window.calendar.render();
      if (this.currentView === 'rooms' && window.rooms) window.rooms.render();
    }
  }

  // --- Room Add / Edit Modals ---
  openAddRoomModal() {
    const modalContent = document.getElementById('room-modal-content');
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
        <h3 class="text-base font-bold">Add Hostel Unit / Room</h3>
        <button onclick="window.app.closeModal('modal-room')" class="text-slate-400 hover:text-white text-xl font-bold p-1">&times;</button>
      </div>

      <form onsubmit="window.app.handleAddRoomSubmit(event)" class="p-6 space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Room #</label>
            <input type="text" id="add-room-num" required placeholder="e.g. A-301" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Hostel Block</label>
            <select id="add-room-block" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              <option value="BLOCK-A">Block A (Boys)</option>
              <option value="BLOCK-B">Block B (Girls)</option>
              <option value="BLOCK-C">Block C (PG)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Room Type</label>
            <select id="add-room-type" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              <option>4-Bed Dorm</option>
              <option>2-Bed Sharing</option>
              <option>Single Private (AC)</option>
              <option>Studio Suite</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Monthly Rate ($)</label>
            <input type="number" id="add-room-rate" required value="1500" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-room')" class="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
          <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm">Save Unit</button>
        </div>
      </form>
    `;

    this.openModal('modal-room');
  }

  handleAddRoomSubmit(e) {
    e.preventDefault();
    const num = document.getElementById('add-room-num').value.trim();
    const block = document.getElementById('add-room-block').value;
    const type = document.getElementById('add-room-type').value;
    const rate = parseFloat(document.getElementById('add-room-rate').value);

    const newRoom = {
      id: num,
      number: num,
      block: block === 'BLOCK-B' ? 'Block B (Girls Hostel)' : 'Block A (Boys Hostel)',
      floor: parseInt(num.split('-')[1] ? num.split('-')[1][0] : '1', 10) || 1,
      type,
      bedType: type.includes('Single') ? 'King Bed' : 'Single Bed',
      ac: type.includes('AC'),
      capacity: type.includes('4') ? 4 : type.includes('2') ? 2 : 1,
      rate,
      status: 'Available',
      condition: 'Clean',
      currentStudentId: null,
      currentGuest: null
    };

    window.store.addRoom(newRoom);
    this.closeModal('modal-room');
    this.playAudio('success');
    this.showToast(`Unit ${num} added to inventory!`, 'success');
    if (window.rooms) window.rooms.render();
  }

  openEditRoomModal(roomId) {
    const rooms = window.store.getRooms();
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const modalContent = document.getElementById('room-modal-content');
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
        <h3 class="text-base font-bold">Edit Unit ${room.number}</h3>
        <button onclick="window.app.closeModal('modal-room')" class="text-slate-400 hover:text-white text-xl font-bold p-1">&times;</button>
      </div>

      <form onsubmit="window.app.handleEditRoomSubmit(event, '${room.id}')" class="p-6 space-y-4 text-xs">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Occupancy Status</label>
            <select id="edit-room-status" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              <option value="Available" ${room.status === 'Available' ? 'selected' : ''}>Available</option>
              <option value="Occupied" ${room.status === 'Occupied' ? 'selected' : ''}>Occupied</option>
              <option value="Maintenance" ${room.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Housekeeping Condition</label>
            <select id="edit-room-condition" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              <option value="Clean" ${room.condition === 'Clean' ? 'selected' : ''}>Clean & Inspected</option>
              <option value="Needs Cleaning" ${room.condition === 'Needs Cleaning' ? 'selected' : ''}>Needs Cleaning</option>
              <option value="In Progress" ${room.condition === 'In Progress' ? 'selected' : ''}>Cleaning In Progress</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Monthly Rate ($)</label>
          <input type="number" id="edit-room-rate" required value="${room.rate}" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-room')" class="px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
          <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm">Save Changes</button>
        </div>
      </form>
    `;

    this.openModal('modal-room');
  }

  handleEditRoomSubmit(e, roomId) {
    e.preventDefault();
    const rooms = window.store.getRooms();
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    room.status = document.getElementById('edit-room-status').value;
    room.condition = document.getElementById('edit-room-condition').value;
    room.rate = parseFloat(document.getElementById('edit-room-rate').value);

    window.store.saveRooms(rooms);
    this.closeModal('modal-room');
    this.playAudio('pop');
    this.showToast(`Unit ${room.number} updated!`, 'success');
    if (window.rooms) window.rooms.render();
  }

  // --- Notification Bell Dropdown Popover ---
  toggleNotificationsDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;

    const isHidden = dropdown.classList.contains('hidden');
    if (isHidden) {
      this.renderNotificationsDropdown();
      dropdown.classList.remove('hidden');
      this.playAudio('pop');
    } else {
      dropdown.classList.add('hidden');
    }
  }

  closeNotificationsDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown && !dropdown.classList.contains('hidden')) {
      dropdown.classList.add('hidden');
    }
  }

  updateBellBadge() {
    const alerts = window.store.getAlerts().filter(a => !a.resolved);
    const complaints = window.store.getComplaints().filter(c => c.status !== 'Resolved');
    const totalCount = alerts.length + complaints.length;

    const badge = document.getElementById('bell-badge');
    const countBadge = document.getElementById('notif-count-badge');

    if (badge) {
      if (totalCount > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
    if (countBadge) {
      countBadge.innerText = `${totalCount} Pending`;
    }
  }

  renderNotificationsDropdown() {
    const alerts = window.store.getAlerts().filter(a => !a.resolved);
    const complaints = window.store.getComplaints().filter(c => c.status !== 'Resolved');
    const listContainer = document.getElementById('notif-items-list');
    if (!listContainer) return;

    const allItems = [
      ...alerts.map(a => ({ ...a, itemType: 'alert' })),
      ...complaints.map(c => ({ id: c.id, type: c.category, title: c.title, detail: `${c.roomNumber} (${c.studentName})`, time: c.createdAt, itemType: 'complaint' }))
    ];

    if (allItems.length === 0) {
      listContainer.innerHTML = `
        <div class="p-8 text-center text-slate-400">
          <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-lg">✓</div>
          <div class="text-xs font-bold text-slate-700 dark:text-slate-300">All clear! No pending alerts</div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = allItems.map(item => `
      <div class="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
            item.type === 'Maintenance' || item.type === 'Plumbing' || item.type === 'Electrical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' :
            'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
          }">
            ${item.type === 'Electrical' ? '⚡' : item.type === 'Plumbing' ? '🚿' : '⚠️'}
          </div>
          <div>
            <div class="text-xs font-bold text-slate-900 dark:text-white leading-snug">${item.title}</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${item.detail || item.unit}</div>
            <span class="text-[10px] text-slate-400 font-mono mt-1 block">${item.time || 'Today'}</span>
          </div>
        </div>

        <button onclick="window.app.resolveNotificationItem('${item.id}', '${item.itemType}')" class="px-2 py-1 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-700 dark:text-teal-300 rounded text-[10px] font-bold">
          Resolve
        </button>
      </div>
    `).join('');
  }

  resolveNotificationItem(id, itemType) {
    if (itemType === 'complaint') {
      window.store.updateComplaintStatus(id, 'Resolved', 'Resolved via quick notification popover');
    } else {
      window.store.resolveAlert(id);
    }
    this.playAudio('resolve');
    this.showToast('Item resolved and closed', 'success');
    this.updateBellBadge();
    this.renderNotificationsDropdown();
    if (window.dashboard) window.dashboard.render();
  }

  resolveAllNotifications() {
    window.store.getAlerts().forEach(a => window.store.resolveAlert(a.id));
    window.store.getComplaints().forEach(c => window.store.updateComplaintStatus(c.id, 'Resolved', 'Bulk resolved'));
    this.playAudio('resolve');
    this.showToast('All notifications resolved', 'success');
    this.updateBellBadge();
    this.renderNotificationsDropdown();
    if (window.dashboard) window.dashboard.render();
  }

  // --- Command Palette (Ctrl+K) ---
  openCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    const input = document.getElementById('command-palette-input');
    if (!modal || !input) return;

    modal.classList.remove('hidden');
    input.value = '';
    this.searchCommands('');
    setTimeout(() => input.focus(), 50);
  }

  closeCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    if (modal) modal.classList.add('hidden');
  }

  searchCommands(query) {
    const q = query.toLowerCase().trim();
    const rooms = window.store.getRooms();
    const students = window.store.getStudents();

    const staticCommands = [
      { category: 'Actions', title: '+ New Booking / Reservation', subtitle: 'Book a room for a student/guest', action: () => this.openReservationModal() },
      { category: 'Navigation', title: 'Booking Calendar Matrix', subtitle: 'Gantt timeline & occupancy grid', action: () => this.navigate('calendar') },
      { category: 'Navigation', title: 'Overview Dashboard', subtitle: 'Building Occupancy & Metrics', action: () => this.navigate('dashboard') },
      { category: 'Navigation', title: 'Room Allocation Management', subtitle: 'Bed assignments & approval queue', action: () => this.navigate('allocations') },
      { category: 'Navigation', title: 'Hostel Fee & Payment Management', subtitle: 'Student dues & receipts', action: () => this.navigate('payments') },
      { category: 'Navigation', title: 'Complaint & Grievance Helpdesk', subtitle: 'Maintenance repair tickets', action: () => this.navigate('complaints') },
      { category: 'Actions', title: '+ Apply for Room Allotment', subtitle: 'Submit new student residency form', action: () => window.allocations.openApplyModal() },
      { category: 'Actions', title: '+ Lodge Maintenance Complaint', subtitle: 'Report electrical/plumbing issues', action: () => window.complaints.openNewComplaintModal() },
      { category: 'Account', title: '⇄ Switch Role / User Portal', subtitle: 'Toggle between Warden and Student', action: () => window.auth.openAuthModal('switch') }
    ];

    rooms.forEach(r => {
      staticCommands.push({
        category: 'Hostel Units',
        title: `Room ${r.number} (${r.type})`,
        subtitle: `${r.block} • Status: ${r.status}`,
        action: () => {
          this.navigate('rooms');
          window.rooms.handleSearch(r.number);
        }
      });
    });

    students.forEach(s => {
      staticCommands.push({
        category: 'Resident Students',
        title: `${s.name} (${s.rollNo})`,
        subtitle: `${s.department} • Room: ${s.roomAssigned || 'Pending'}`,
        action: () => {
          this.navigate('allocations');
          window.allocations.handleSearch(s.name);
        }
      });
    });

    this.filteredCommands = staticCommands.filter(c => 
      !q || c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );

    this.selectedCommandIndex = 0;
    this.renderCommandResults();
  }

  renderCommandResults() {
    const list = document.getElementById('command-results-list');
    if (!list) return;

    if (this.filteredCommands.length === 0) {
      list.innerHTML = `
        <div class="p-8 text-center text-slate-400 text-xs">
          No matching views, rooms, or actions found.
        </div>
      `;
      return;
    }

    list.innerHTML = this.filteredCommands.map((cmd, idx) => `
      <div 
        onclick="window.app.executeCommand(${idx})"
        class="px-4 py-2.5 flex items-center justify-between cursor-pointer rounded-lg transition-colors ${
          idx === this.selectedCommandIndex ? 'bg-teal-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
        }">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider block ${idx === this.selectedCommandIndex ? 'text-teal-100' : 'text-slate-400'}">${cmd.category}</span>
          <div class="text-xs font-bold leading-snug">${cmd.title}</div>
          <div class="text-[11px] ${idx === this.selectedCommandIndex ? 'text-teal-100' : 'text-slate-400'}">${cmd.subtitle}</div>
        </div>
        <span class="text-xs font-mono opacity-60">↵</span>
      </div>
    `).join('');
  }

  executeCommand(index) {
    const cmd = this.filteredCommands[index];
    if (cmd && cmd.action) {
      this.closeCommandPalette();
      this.playAudio('pop');
      cmd.action();
    }
  }

  // --- Modals & Toasts ---
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.remove('hidden');
      this.playAudio('pop');
    }
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
  }

  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `p-3.5 rounded-xl shadow-lg text-xs font-bold text-white flex items-center gap-2.5 transition-all transform translate-y-2 opacity-0 ${
      type === 'success' ? 'bg-emerald-600' :
      type === 'error' ? 'bg-rose-600' :
      type === 'warning' ? 'bg-amber-600' : 'bg-slate-900'
    }`;

    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- Keyboard Shortcuts & Global Events ---
  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCommandPalette();
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.openCommandPalette();
      }

      if (e.key === 'Escape') {
        this.closeNotificationsDropdown();
        this.closeCommandPalette();
      }

      const paletteModal = document.getElementById('command-palette-modal');
      if (paletteModal && !paletteModal.classList.contains('hidden')) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectedCommandIndex = Math.min(this.selectedCommandIndex + 1, this.filteredCommands.length - 1);
          this.renderCommandResults();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectedCommandIndex = Math.max(this.selectedCommandIndex - 1, 0);
          this.renderCommandResults();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeCommand(this.selectedCommandIndex);
        }
      }
    });

    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '') || 'dashboard';
      if (h !== this.currentView) {
        this.navigate(h);
      }
    });

    document.addEventListener('click', (e) => {
      const notifContainer = document.getElementById('notification-center-container');
      if (notifContainer && !notifContainer.contains(e.target)) {
        this.closeNotificationsDropdown();
      }
    });
  }
}

// Instantiate global app
window.app = new HostelHubApp();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
