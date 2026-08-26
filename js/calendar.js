/**
 * HostelHub - Booking Calendar Module
 * Gantt-style visual timeline matrix for room assignment, reservations, and maintenance periods.
 */

class CalendarModule {
  constructor() {
    this.container = document.getElementById('view-calendar');
    // Start date defaults to 2 days before today (Aug 24, 2026)
    this.startDate = new Date(2026, 7, 24);
    this.daySpan = 14; // Default 14-day timeline
    this.roomTypeFilter = 'ALL';
    this.selectedFloor = 'ALL';
  }

  init() {
    this.render();
  }

  render() {
    const allRooms = window.store.getRooms();
    const allBookings = window.store.getBookings();

    // Filter rooms if type or floor filter active
    const rooms = allRooms.filter(r => {
      const matchType = this.roomTypeFilter === 'ALL' || r.type.includes(this.roomTypeFilter);
      const matchFloor = this.selectedFloor === 'ALL' || r.floor.toString() === this.selectedFloor;
      return matchType && matchFloor;
    });

    // Generate date columns
    const dates = [];
    const todayStr = '2026-08-26'; // Fixed reference today date
    for (let i = 0; i < this.daySpan; i++) {
      const d = new Date(this.startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      const isToday = dateStr === todayStr;
      dates.push({ date: d, dateStr, dayName, dayNumber, monthName, isToday });
    }

    const startMonth = dates[0].monthName;
    const endMonth = dates[dates.length - 1].monthName;
    const dateRangeLabel = startMonth === endMonth ? 
      `${startMonth} ${dates[0].dayNumber} - ${dates[dates.length - 1].dayNumber}, 2026` :
      `${startMonth} ${dates[0].dayNumber} - ${endMonth} ${dates[dates.length - 1].dayNumber}, 2026`;

    this.container.innerHTML = `
      <!-- Calendar Header & Controls -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Booking Calendar</h1>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Gantt Timeline
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-0.5">Visual room assignments, multi-day stays, and maintenance downtime</p>
        </div>

        <!-- Controls Toolbar -->
        <div class="flex flex-wrap items-center gap-3">
          
          <!-- Date Navigator -->
          <div class="bg-white border border-slate-200 rounded-lg p-1 flex items-center shadow-sm">
            <button onclick="window.calendar.shiftDays(-7)" class="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors" title="Previous 7 Days">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button onclick="window.calendar.goToToday()" class="px-3 py-1 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded transition-colors">
              Today
            </button>
            <button onclick="window.calendar.shiftDays(7)" class="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors" title="Next 7 Days">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>

          <span class="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
            📅 ${dateRangeLabel}
          </span>

          <!-- View Span Selector (7d / 14d / 21d) -->
          <div class="bg-white border border-slate-200 rounded-lg p-1 flex items-center shadow-sm">
            <button onclick="window.calendar.setDaySpan(7)" class="px-2.5 py-1 text-xs font-semibold rounded ${this.daySpan === 7 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}">
              7D
            </button>
            <button onclick="window.calendar.setDaySpan(14)" class="px-2.5 py-1 text-xs font-semibold rounded ${this.daySpan === 14 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}">
              14D
            </button>
            <button onclick="window.calendar.setDaySpan(21)" class="px-2.5 py-1 text-xs font-semibold rounded ${this.daySpan === 21 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}">
              21D
            </button>
          </div>

          <button onclick="window.app.openReservationModal()" class="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-semibold text-xs transition-all flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Book Room
          </button>
        </div>
      </div>

      <!-- Filter Subbar & Legend -->
      <div class="bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Filter Units:</span>
          
          <select 
            onchange="window.calendar.filterType(this.value)"
            class="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="ALL" ${this.roomTypeFilter === 'ALL' ? 'selected' : ''}>All Categories</option>
            <option value="Dorm" ${this.roomTypeFilter === 'Dorm' ? 'selected' : ''}>Dormitories</option>
            <option value="Private" ${this.roomTypeFilter === 'Private' ? 'selected' : ''}>Private Deluxe</option>
            <option value="Suite" ${this.roomTypeFilter === 'Suite' ? 'selected' : ''}>Suites & Studios</option>
          </select>

          <select 
            onchange="window.calendar.filterFloor(this.value)"
            class="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="ALL" ${this.selectedFloor === 'ALL' ? 'selected' : ''}>All Floors</option>
            <option value="1" ${this.selectedFloor === '1' ? 'selected' : ''}>Floor 1</option>
            <option value="2" ${this.selectedFloor === '2' ? 'selected' : ''}>Floor 2</option>
            <option value="3" ${this.selectedFloor === '3' ? 'selected' : ''}>Floor 3</option>
          </select>
        </div>

        <!-- Color Legend -->
        <div class="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm bg-teal-600"></span>
            <span class="text-slate-600">Confirmed</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm bg-indigo-700"></span>
            <span class="text-slate-600">Checked In</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm bg-amber-600"></span>
            <span class="text-slate-600">Pending</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-3 rounded-sm bg-rose-500"></span>
            <span class="text-slate-600">Maintenance</span>
          </div>
        </div>

      </div>

      <!-- Gantt Matrix Container -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        <div class="overflow-x-auto dark-scrollbar">
          <div class="min-w-[1000px] gantt-container">
            
            <!-- Matrix Header: Sticky Room Title + Date Columns -->
            <div class="flex border-b border-slate-200 bg-slate-50/80 sticky top-0 z-20">
              
              <!-- Sticky Room Column Header -->
              <div class="w-[180px] min-w-[180px] p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-r-2 border-slate-200 sticky left-0 bg-slate-50 z-30 flex items-center justify-between">
                <span>Room / Unit</span>
                <span class="text-[10px] text-slate-400 font-semibold">${rooms.length} units</span>
              </div>

              <!-- Date Headers -->
              <div class="flex flex-1">
                ${dates.map(d => `
                  <div class="gantt-header-cell ${d.isToday ? 'today' : ''}">
                    <div class="text-[10px] font-bold uppercase ${d.isToday ? 'text-teal-700' : 'text-slate-400'}">${d.dayName}</div>
                    <div class="text-sm font-extrabold ${d.isToday ? 'text-teal-600' : 'text-slate-800'}">${d.dayNumber}</div>
                    <div class="text-[9px] text-slate-400 font-medium">${d.monthName}</div>
                  </div>
                `).join('')}
              </div>

            </div>

            <!-- Matrix Body: One row per room -->
            <div class="divide-y divide-slate-100">
              ${rooms.map(room => {
                // Find all bookings for this room
                const roomBookings = allBookings.filter(b => b.roomId === room.id);

                return `
                  <div class="gantt-row group" data-room-id="${room.id}">
                    
                    <!-- Sticky Left Room Info Cell -->
                    <div class="gantt-room-cell p-2.5 flex items-center justify-between">
                      <div>
                        <div class="flex items-center gap-1.5">
                          <span class="font-bold text-xs text-slate-900">${room.number}</span>
                          <span class="text-[10px] text-slate-400 font-medium">F${room.floor}</span>
                        </div>
                        <div class="text-[10px] text-slate-500 truncate max-w-[110px] font-medium" title="${room.type}">
                          ${room.type}
                        </div>
                      </div>
                      <span class="w-2 h-2 rounded-full ${
                        room.status === 'Available' ? 'bg-emerald-500' :
                        room.status === 'Occupied' ? 'bg-teal-500' : 'bg-rose-500'
                      }" title="${room.status}"></span>
                    </div>

                    <!-- Days Track with Grid Cells & Overlay Booking Blocks -->
                    <div class="gantt-days-track">
                      
                      <!-- Empty background click-to-book cells -->
                      ${dates.map(d => `
                        <div 
                          class="gantt-day-cell ${d.isToday ? 'today' : ''}" 
                          onclick="window.calendar.handleCellClick('${room.id}', '${d.dateStr}')"
                          title="Click to reserve ${room.number} starting ${d.dateStr}">
                        </div>
                      `).join('')}

                      <!-- Render Reservation Blocks on top of the track -->
                      ${roomBookings.map(bk => this.renderBookingBlock(bk, dates)).join('')}

                    </div>

                  </div>
                `;
              }).join('')}
            </div>

          </div>
        </div>

      </div>
    `;
  }

  renderBookingBlock(booking, dates) {
    const startDateStr = dates[0].dateStr;
    const endDateStr = dates[dates.length - 1].dateStr;

    // Check if booking overlaps with current visible dates
    if (booking.checkOut <= startDateStr || booking.checkIn > endDateStr) {
      return '';
    }

    const cellWidth = 90; // matches .gantt-day-cell width (90px)
    
    // Calculate start day offset relative to first visible date
    const startObj = new Date(booking.checkIn);
    const timelineStartObj = new Date(startDateStr);
    const dayDiffStart = Math.max(0, Math.round((startObj - timelineStartObj) / (1000 * 60 * 60 * 24)));
    
    // Calculate span
    const endObj = new Date(booking.checkOut);
    const effectiveStart = startObj < timelineStartObj ? timelineStartObj : startObj;
    const effectiveEnd = endObj;
    const nightSpan = Math.max(1, Math.round((effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)));

    const leftPos = dayDiffStart * cellWidth + 4;
    const blockWidth = Math.max(80, nightSpan * cellWidth - 8);

    const isMaintenance = booking.status === 'Maintenance';
    const statusClass = 
      isMaintenance ? 'booking-maintenance' :
      booking.status === 'Checked In' ? 'booking-checked-in' :
      booking.status === 'Pending' ? 'booking-pending' : 'booking-confirmed';

    return `
      <div 
        class="gantt-booking-block ${statusClass}"
        style="left: ${leftPos}px; width: ${blockWidth}px;"
        onclick="event.stopPropagation(); window.calendar.openBookingDetails('${booking.id}')"
        title="${booking.guestName} (${booking.checkIn} to ${booking.checkOut})">
        
        <span class="truncate text-[11px] font-bold">
          ${isMaintenance ? '🛠️ ' : '👤 '}${booking.guestName}
        </span>
        <span class="text-[9px] opacity-90 font-normal shrink-0">
          (${booking.totalNights || nightSpan}n)
        </span>
      </div>
    `;
  }

  // --- Interaction Methods ---
  shiftDays(days) {
    this.startDate.setDate(this.startDate.getDate() + days);
    this.render();
  }

  goToToday() {
    this.startDate = new Date(2026, 7, 24);
    this.render();
  }

  setDaySpan(span) {
    this.daySpan = span;
    this.render();
  }

  filterType(type) {
    this.roomTypeFilter = type;
    this.render();
  }

  filterFloor(floor) {
    this.selectedFloor = floor;
    this.render();
  }

  handleCellClick(roomId, dateStr) {
    const nextDay = new Date(dateStr);
    nextDay.setDate(nextDay.getDate() + 2);
    const nextDayStr = nextDay.toISOString().split('T')[0];

    window.app.openReservationModal({
      roomId,
      checkIn: dateStr,
      checkOut: nextDayStr
    });
  }

  openBookingDetails(bookingId) {
    window.app.openBookingDetailsModal(bookingId);
  }
}

// Global calendar instance
window.calendar = new CalendarModule();
