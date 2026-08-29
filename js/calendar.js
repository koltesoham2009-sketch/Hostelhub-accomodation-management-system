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
    if (!this.container) return;
    const allRooms = window.store.getRooms();
    const allBookings = window.store.getBookings ? window.store.getBookings() : [];

    // Filter rooms if type or floor filter active
    const rooms = allRooms.filter(r => {
      const matchType = this.roomTypeFilter === 'ALL' || r.type.includes(this.roomTypeFilter);
      const matchFloor = this.selectedFloor === 'ALL' || r.floor.toString() === this.selectedFloor;
      return matchType && matchFloor;
    });

    // Generate date columns
    const dates = [];
    const todayStr = '2026-08-26';
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
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Booking Calendar Matrix</h1>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Gantt Timeline
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-0.5">Visual unit allocation timeline, reservations, and maintenance scheduling</p>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="window.calendar.goToToday()" class="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm">
            Today
          </button>
          <div class="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 shadow-sm">
            <button onclick="window.calendar.shiftDays(-7)" class="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="Previous 7 Days">
              ◀
            </button>
            <span class="px-3 text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">${dateRangeLabel}</span>
            <button onclick="window.calendar.shiftDays(7)" class="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title="Next 7 Days">
              ▶
            </button>
          </div>

          <button onclick="window.allocations.openApplyModal()" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-semibold text-xs transition-all flex items-center gap-2">
            + New Reservation / Allotment
          </button>
        </div>
      </div>

      <!-- Gantt Matrix Container -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        
        <div class="overflow-x-auto dark-scrollbar">
          <div class="min-w-[1000px] gantt-container">
            
            <!-- Matrix Header: Sticky Room Title + Date Columns -->
            <div class="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 sticky top-0 z-20">
              
              <!-- Sticky Room Column Header -->
              <div class="w-[180px] min-w-[180px] p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-r-2 border-slate-200 dark:border-slate-800 sticky left-0 bg-slate-50 dark:bg-slate-900 z-30 flex items-center justify-between">
                <span>Room / Bed Unit</span>
                <span class="text-[10px] text-slate-400 font-semibold">${rooms.length} units</span>
              </div>

              <!-- Date Headers -->
              <div class="flex flex-1">
                ${dates.map(d => `
                  <div class="gantt-header-cell ${d.isToday ? 'today' : ''}">
                    <div class="text-[10px] font-bold uppercase ${d.isToday ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}">${d.dayName}</div>
                    <div class="text-sm font-extrabold ${d.isToday ? 'text-teal-600 dark:text-teal-400' : 'text-slate-800 dark:text-slate-200'}">${d.dayNumber}</div>
                    <div class="text-[9px] text-slate-400 font-medium">${d.monthName}</div>
                  </div>
                `).join('')}
              </div>

            </div>

            <!-- Matrix Body: One row per room -->
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              ${rooms.map(room => {
                const roomBookings = allBookings.filter(b => b.roomId === room.id || b.roomNumber === room.number);

                return `
                  <div class="gantt-row group" data-room-id="${room.id}">
                    
                    <!-- Sticky Left Room Info Cell -->
                    <div class="gantt-room-cell p-2.5 flex items-center justify-between">
                      <div>
                        <div class="flex items-center gap-1.5">
                          <span class="font-bold text-xs text-slate-900 dark:text-white">${room.number}</span>
                          <span class="text-[10px] text-slate-400 font-medium">${room.block || 'F' + room.floor}</span>
                        </div>
                        <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[110px] font-medium" title="${room.type}">
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
                          title="Click to reserve ${room.number} on ${d.dateStr}">
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

    const checkIn = booking.checkIn || booking.startDate || '2026-08-20';
    const checkOut = booking.checkOut || booking.endDate || '2026-09-05';

    if (checkOut <= startDateStr || checkIn > endDateStr) {
      return '';
    }

    const cellWidth = 90;
    const startObj = new Date(checkIn);
    const timelineStartObj = new Date(startDateStr);
    const dayDiffStart = Math.max(0, Math.round((startObj - timelineStartObj) / (1000 * 60 * 60 * 24)));
    
    const endObj = new Date(checkOut);
    const effectiveStart = startObj < timelineStartObj ? timelineStartObj : startObj;
    const effectiveEnd = endObj;
    const nightSpan = Math.max(1, Math.round((effectiveEnd - effectiveStart) / (1000 * 60 * 60 * 24)));

    const leftPos = dayDiffStart * cellWidth + 4;
    const blockWidth = Math.max(80, nightSpan * cellWidth - 8);

    const isMaintenance = booking.status === 'Maintenance';
    const statusClass = 
      isMaintenance ? 'booking-maintenance' :
      booking.status === 'Checked-In' || booking.status === 'Checked In' ? 'booking-checked-in' :
      booking.status === 'Pending' ? 'booking-pending' : 'booking-confirmed';

    return `
      <div 
        class="gantt-booking-block ${statusClass}"
        style="left: ${leftPos}px; width: ${blockWidth}px;"
        onclick="event.stopPropagation(); window.calendar.openBookingDetails('${booking.id}')"
        title="${booking.guestName} (${checkIn} to ${checkOut})">
        
        <span class="truncate text-[11px] font-bold">
          ${isMaintenance ? '🛠️ ' : '👤 '}${booking.guestName}
        </span>
        <span class="text-[9px] opacity-90 font-normal shrink-0">
          (${nightSpan}d)
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
    window.allocations.openApplyModal();
  }

  openBookingDetails(bookingId) {
    const bk = (window.store.getBookings ? window.store.getBookings() : []).find(b => b.id === bookingId);
    if (!bk) return;
    window.app.showToast(`Booking ${bk.id}: ${bk.guestName} in Unit ${bk.roomNumber} (${bk.status})`, 'info');
  }
}

// Global calendar instance
window.calendar = new CalendarModule();
