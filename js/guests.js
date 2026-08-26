/**
 * HostelHub - Guest Directory & CRM Module
 * Centralized database for guest profiles, stay history, preferences, and loyalty program tracking.
 */

class GuestsModule {
  constructor() {
    this.container = document.getElementById('view-guests');
    this.searchQuery = '';
    this.tierFilter = 'ALL';
    this.statusFilter = 'ALL';
  }

  init() {
    this.render();
  }

  render() {
    const allGuests = window.store.getGuests();

    // Summary counts
    const totalCount = allGuests.length;
    const inHouseCount = allGuests.filter(g => g.currentStatus === 'In-House').length;
    const platinumCount = allGuests.filter(g => g.loyaltyTier === 'Platinum').length;
    const goldCount = allGuests.filter(g => g.loyaltyTier === 'Gold').length;

    // Filter logic
    const filteredGuests = allGuests.filter(g => {
      const matchesSearch = !this.searchQuery ||
        g.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        g.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        g.phone.includes(this.searchQuery) ||
        (g.passportNumber && g.passportNumber.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesTier = this.tierFilter === 'ALL' || g.loyaltyTier === this.tierFilter;
      const matchesStatus = this.statusFilter === 'ALL' || g.currentStatus === this.statusFilter;

      return matchesSearch && matchesTier && matchesStatus;
    });

    this.container.innerHTML = `
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Guest Directory & CRM</h1>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Loyalty Program
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-0.5">Centralized guest profiles, stay records, preferences, and loyalty tiers</p>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="window.guests.exportGuestsCSV()" class="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm font-semibold text-xs transition-all flex items-center gap-1.5">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export CSV
          </button>

          <button onclick="window.app.openAddGuestModal()" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-semibold text-sm transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
            Add Guest
          </button>
        </div>
      </div>

      <!-- Quick KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Profiles</span>
            <div class="text-2xl font-black text-slate-900 mt-1">${totalCount}</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">In-House Now</span>
            <div class="text-2xl font-black text-teal-600 mt-1">${inHouseCount}</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Platinum VIPs</span>
            <div class="text-2xl font-black text-purple-600 mt-1">${platinumCount}</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
            💎
          </div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Gold Members</span>
            <div class="text-2xl font-black text-amber-600 mt-1">${goldCount}</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
            🥇
          </div>
        </div>

      </div>

      <!-- Search & Filters -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        <div class="relative flex-1 min-w-[260px]">
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search by guest name, email, phone, or passport #..." 
            value="${this.searchQuery}"
            oninput="window.guests.handleSearch(this.value)"
            class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Loyalty Filter -->
          <select 
            onchange="window.guests.filterByTier(this.value)"
            class="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="ALL" ${this.tierFilter === 'ALL' ? 'selected' : ''}>All Loyalty Tiers</option>
            <option value="Platinum" ${this.tierFilter === 'Platinum' ? 'selected' : ''}>💎 Platinum</option>
            <option value="Gold" ${this.tierFilter === 'Gold' ? 'selected' : ''}>🥇 Gold</option>
            <option value="Silver" ${this.tierFilter === 'Silver' ? 'selected' : ''}>🥈 Silver</option>
          </select>

          <!-- Status Filter -->
          <select 
            onchange="window.guests.filterByStatus(this.value)"
            class="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="ALL" ${this.statusFilter === 'ALL' ? 'selected' : ''}>All Statuses</option>
            <option value="In-House" ${this.statusFilter === 'In-House' ? 'selected' : ''}>In-House</option>
            <option value="Reserved" ${this.statusFilter === 'Reserved' ? 'selected' : ''}>Upcoming Booking</option>
            <option value="Checked Out" ${this.statusFilter === 'Checked Out' ? 'selected' : ''}>Past Guest</option>
          </select>

          ${(this.searchQuery || this.tierFilter !== 'ALL' || this.statusFilter !== 'ALL') ? `
            <button onclick="window.guests.resetFilters()" class="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-2 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Reset
            </button>
          ` : ''}
        </div>

      </div>

      <!-- Guest Directory Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse dense-table">
            <thead>
              <tr>
                <th>Guest Profile</th>
                <th>Contact Details</th>
                <th>Nationality</th>
                <th>Loyalty Tier</th>
                <th>Stays / Spend</th>
                <th>Current Status</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredGuests.length === 0 ? `
                <tr>
                  <td colspan="7" class="text-center py-10 text-slate-400">
                    No guest profiles found matching your search.
                  </td>
                </tr>
              ` : filteredGuests.map(g => `
                <tr class="cursor-pointer hover:bg-slate-50 transition-colors" onclick="window.guests.openProfileDrawer('${g.id}')">
                  <td>
                    <div class="flex items-center gap-3">
                      <img src="${g.avatar}" alt="${g.name}" class="w-9 h-9 rounded-full object-cover border border-slate-200" />
                      <div>
                        <div class="font-bold text-slate-900 text-sm hover:text-teal-700 transition-colors">${g.name}</div>
                        <div class="text-[11px] text-slate-400 font-mono">${g.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="text-xs text-slate-700 font-medium">${g.email}</div>
                    <div class="text-[11px] text-slate-400">${g.phone}</div>
                  </td>
                  <td>
                    <span class="text-xs text-slate-700 font-medium">${g.nationality}</span>
                  </td>
                  <td>
                    <span class="badge ${
                      g.loyaltyTier === 'Platinum' ? 'badge-platinum' :
                      g.loyaltyTier === 'Gold' ? 'badge-gold' : 'badge-silver'
                    }">
                      ${g.loyaltyTier === 'Platinum' ? '💎' : g.loyaltyTier === 'Gold' ? '🥇' : '🥈'}
                      ${g.loyaltyTier} (${g.loyaltyPoints} pts)
                    </span>
                  </td>
                  <td>
                    <div class="font-bold text-slate-800 text-xs">${g.totalStays} Stays</div>
                    <div class="text-[11px] text-emerald-600 font-semibold">$${g.lifetimeSpend.toLocaleString()} Total</div>
                  </td>
                  <td>
                    <span class="badge ${
                      g.currentStatus === 'In-House' ? 'badge-occupied' : 'badge-silver'
                    }">
                      ${g.currentStatus} ${g.roomAssigned ? `(${g.roomAssigned})` : ''}
                    </span>
                  </td>
                  <td class="text-right" onclick="event.stopPropagation()">
                    <div class="flex items-center justify-end gap-1.5">
                      <button 
                        onclick="window.guests.openProfileDrawer('${g.id}')"
                        class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors">
                        Profile
                      </button>
                      <button 
                        onclick="window.app.openReservationModal({ guestId: '${g.id}' })"
                        class="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded text-xs font-semibold transition-colors">
                        Book
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- Handlers ---
  handleSearch(val) {
    this.searchQuery = val;
    this.render();
  }

  filterByTier(tier) {
    this.tierFilter = tier;
    this.render();
  }

  filterByStatus(status) {
    this.statusFilter = status;
    this.render();
  }

  resetFilters() {
    this.searchQuery = '';
    this.tierFilter = 'ALL';
    this.statusFilter = 'ALL';
    this.render();
  }

  openProfileDrawer(guestId) {
    window.app.openGuestProfileDrawer(guestId);
  }

  exportGuestsCSV() {
    const guests = window.store.getGuests();
    let csv = 'ID,Name,Email,Phone,Nationality,Loyalty Tier,Loyalty Points,Total Stays,Lifetime Spend ($),Status,Room Assigned\n';
    
    guests.forEach(g => {
      csv += `"${g.id}","${g.name}","${g.email}","${g.phone}","${g.nationality}","${g.loyaltyTier}",${g.loyaltyPoints},${g.totalStays},${g.lifetimeSpend},"${g.currentStatus}","${g.roomAssigned || 'N/A'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `HostelHub_Guest_Directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.app.showToast('Guest directory exported to CSV successfully', 'success');
  }
}

// Global guests instance
window.guests = new GuestsModule();
