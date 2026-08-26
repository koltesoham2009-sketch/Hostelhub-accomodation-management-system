/**
 * HostelHub - Admin Dashboard Module
 * Manages Occupancy Gauge, Revenue Analytics, Urgent Alerts, Quick Actions, and Activity Feed.
 */

class DashboardModule {
  constructor() {
    this.container = document.getElementById('view-dashboard');
  }

  init() {
    this.render();
  }

  render() {
    const rooms = window.store.getRooms();
    const bookings = window.store.getBookings();
    const alerts = window.store.getAlerts().filter(a => !a.resolved);
    const activities = window.store.getActivities();
    const revenue = window.store.getRevenue();

    // Calculations
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
    const availableRooms = rooms.filter(r => r.status === 'Available').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
    const occupancyPercentage = Math.round((occupiedRooms / totalRooms) * 100);

    // Bed capacity calculations
    const totalBeds = rooms.reduce((sum, r) => sum + (r.capacity || 1), 0);
    const occupiedBeds = rooms.filter(r => r.status === 'Occupied').reduce((sum, r) => sum + (r.capacity || 1), 0);

    // Render HTML structure
    this.container.innerHTML = `
      <!-- Dashboard Top Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
              Live Operations
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-0.5">Real-time pulse of hostel inventory, revenue, and daily logistics</p>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm flex items-center gap-2 font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Today: <span class="font-semibold text-slate-900">Wednesday, Aug 26, 2026</span>
          </div>
          <button onclick="window.app.openReservationModal()" class="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg shadow-sm font-semibold text-sm transition-all shadow-teal-600/20 hover:shadow-md">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            New Reservation
          </button>
        </div>
      </div>

      <!-- Top Metric Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        <!-- Occupancy Gauge Card -->
        <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Occupancy Rate</span>
            <span class="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md">${occupiedRooms}/${totalRooms} Units</span>
          </div>
          
          <div class="flex items-center justify-center my-3 relative">
            <svg class="w-32 h-32" viewBox="0 0 100 100">
              <!-- Background circle -->
              <circle cx="50" cy="50" r="40" stroke="#f1f5f9" stroke-width="10" fill="none" />
              <!-- Gauge circle -->
              <circle class="gauge-circle" cx="50" cy="50" r="40" stroke="#0d9488" stroke-width="10" 
                stroke-dasharray="251.2" 
                stroke-dashoffset="${251.2 - (251.2 * occupancyPercentage) / 100}" 
                stroke-linecap="round" fill="none" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="text-3xl font-black text-slate-900">${occupancyPercentage}%</span>
              <span class="text-[10px] font-semibold text-slate-400 uppercase">Occupied</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs border-t border-slate-100 pt-3 text-slate-500">
            <span>Bed Capacity:</span>
            <span class="font-bold text-slate-800">${occupiedBeds} / ${totalBeds} Beds Active</span>
          </div>
        </div>

        <!-- Weekly Revenue Card -->
        <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Weekly Revenue</span>
            <span class="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              <svg class="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
              +${revenue.growthPercentage}%
            </span>
          </div>

          <div class="my-2">
            <div class="text-3xl font-black text-slate-900 tracking-tight">$${revenue.currentWeekTotal.toLocaleString()}</div>
            <div class="text-xs text-slate-400 mt-0.5">vs. $${revenue.previousWeekTotal.toLocaleString()} previous week</div>
          </div>

          <!-- Mini Sparkline / Bar visualization -->
          <div class="mt-2 pt-2 border-t border-slate-100">
            <div class="flex items-end justify-between gap-1 h-12">
              ${revenue.dailyData.map(d => `
                <div class="flex-1 flex flex-col items-center gap-1 group relative">
                  <div class="w-full bg-slate-100 rounded-t-sm h-full flex items-end">
                    <div class="w-full bg-teal-500 group-hover:bg-teal-600 rounded-t-sm transition-all duration-300" style="height: ${(d.amount / 2400) * 100}%"></div>
                  </div>
                  <span class="text-[9px] font-semibold text-slate-400">${d.day.substring(0, 3)}</span>
                  <!-- Tooltip -->
                  <div class="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">
                    <span class="font-bold">$${d.amount}</span>
                    <span class="text-slate-300 text-[9px]">${d.occupancy}% occ</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Available Inventory Card -->
        <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Available Rooms</span>
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
          </div>

          <div class="my-2">
            <div class="text-3xl font-black text-slate-900">${availableRooms} <span class="text-base font-normal text-slate-400">/ ${totalRooms}</span></div>
            <div class="text-xs text-emerald-600 font-medium mt-0.5">Ready for instant check-in</div>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-500">Maintenance:</span>
            <span class="font-bold ${maintenanceRooms > 0 ? 'text-rose-600' : 'text-slate-700'}">${maintenanceRooms} units blocked</span>
          </div>
        </div>

        <!-- Active Guests In-House Card -->
        <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">In-House Guests</span>
            <div class="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>

          <div class="my-2">
            <div class="text-3xl font-black text-slate-900">${bookings.filter(b => b.status === 'Checked In').length} <span class="text-sm font-normal text-slate-400">Checked In</span></div>
            <div class="text-xs text-indigo-600 font-medium mt-0.5">3 arriving today • 2 checkouts</div>
          </div>

          <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-500">VIP & Loyalty Members:</span>
            <span class="font-bold text-slate-800">6 Members</span>
          </div>
        </div>

      </div>

      <!-- Quick Actions Grid Bar -->
      <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm mb-8">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Operational Actions</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button onclick="window.app.openWalkInModal()" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left group">
            <div class="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 group-hover:text-teal-700">Walk-In Check-In</div>
              <div class="text-[11px] text-slate-400">Instant registration</div>
            </div>
          </button>

          <button onclick="window.app.openInvoiceModal()" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left group">
            <div class="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 group-hover:text-teal-700">Generate Invoice</div>
              <div class="text-[11px] text-slate-400">Billing & receipts</div>
            </div>
          </button>

          <button onclick="window.app.openMaintenanceModal()" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left group">
            <div class="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 group-hover:text-teal-700">Block for Service</div>
              <div class="text-[11px] text-slate-400">Log repair / outage</div>
            </div>
          </button>

          <button onclick="window.app.exportDailySummary()" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all text-left group">
            <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 group-hover:text-teal-700">Export Daily Log</div>
              <div class="text-[11px] text-slate-400">Night audit summary</div>
            </div>
          </button>

        </div>
      </div>

      <!-- Two-Column Operational Section: Urgent Alerts & Live Activity Feed -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left: Urgent Action Center (7 cols) -->
        <div class="lg:col-span-7 flex flex-col gap-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div class="flex items-center gap-2.5">
                <div class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></div>
                <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Urgent Alerts & Operations</h2>
              </div>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full ${alerts.length > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}">
                ${alerts.length} Pending
              </span>
            </div>

            <div class="divide-y divide-slate-100" id="alerts-list">
              ${alerts.length === 0 ? `
                <div class="p-8 text-center text-slate-400 text-sm">
                  <svg class="w-10 h-10 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  All alerts resolved. Operational state is optimal!
                </div>
              ` : alerts.map(alert => `
                <div class="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4" id="alert-item-${alert.id}">
                  <div class="flex items-start gap-3.5">
                    <div class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      alert.priority === 'high' ? 'bg-rose-100 text-rose-600' :
                      alert.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                    }">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${alert.type === 'maintenance' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>' :
                          alert.type === 'checkin' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>' :
                          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'}
                      </svg>
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-slate-900">${alert.title}</span>
                        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          alert.priority === 'high' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          alert.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }">${alert.priority}</span>
                      </div>
                      <p class="text-xs text-slate-600 mt-1 leading-relaxed">${alert.description}</p>
                      <div class="text-[11px] text-slate-400 mt-2 flex items-center gap-3">
                        <span>🕒 ${alert.timestamp}</span>
                        ${alert.roomId ? `<span>🛏️ Unit: <strong class="text-slate-700">${alert.roomId}</strong></span>` : ''}
                      </div>
                    </div>
                  </div>

                  <div class="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 self-end sm:self-center">
                    <button onclick="window.dashboard.resolveAlert('${alert.id}')" class="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Resolve
                    </button>
                    ${alert.roomId ? `
                      <button onclick="window.app.navigate('rooms', { roomFilter: '${alert.roomId}' })" class="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium underline">
                        View Room
                      </button>
                    ` : ''}
                  </div>
                </div>
              `).join('')}
            </div>

          </div>
        </div>

        <!-- Right: Real-Time Activity Log (5 cols) -->
        <div class="lg:col-span-5 flex flex-col gap-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            
            <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 class="text-sm font-bold text-slate-900 uppercase tracking-wide">Recent Activity Feed</h2>
              <button onclick="window.dashboard.render()" class="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Refresh
              </button>
            </div>

            <div class="p-5 flex-1 overflow-y-auto max-h-[380px] space-y-4">
              ${activities.slice(0, 7).map(act => `
                <div class="flex items-start gap-3.5 text-xs">
                  <div class="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200 mt-0.5">
                    <svg class="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="text-slate-800 font-medium leading-relaxed">${act.text}</p>
                    <span class="text-[10px] text-slate-400 font-semibold mt-0.5 block">Today at ${act.time}</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-center">
              <span class="text-[11px] text-slate-500 font-medium">Automatic sync enabled with property PMS</span>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  resolveAlert(alertId) {
    window.store.resolveAlert(alertId);
    window.app.showToast('Urgent alert resolved successfully', 'success');
    this.render();
  }
}

// Global dashboard instance
window.dashboard = new DashboardModule();
