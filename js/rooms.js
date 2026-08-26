/**
 * HostelHub - Enhanced Room Management Module
 * Granular control center for property inventory, bulk actions, status, housekeeping condition, and filtering.
 */

class RoomsModule {
  constructor() {
    this.container = document.getElementById('view-rooms');
    this.currentViewMode = 'table'; // 'table' or 'grid'
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.typeFilter = 'ALL';
    this.conditionFilter = 'ALL';
    this.floorFilter = 'ALL';
    this.selectedRoomIds = new Set();
  }

  init() {
    this.render();
  }

  setFilters(filters = {}) {
    if (filters.roomFilter) this.searchQuery = filters.roomFilter;
    if (filters.statusFilter) this.statusFilter = filters.statusFilter;
    this.render();
  }

  render() {
    const allRooms = window.store.getRooms();

    // Summary Counts
    const totalCount = allRooms.length;
    const availableCount = allRooms.filter(r => r.status === 'Available').length;
    const occupiedCount = allRooms.filter(r => r.status === 'Occupied').length;
    const maintenanceCount = allRooms.filter(r => r.status === 'Maintenance').length;
    const needsCleanCount = allRooms.filter(r => r.condition === 'Needs Cleaning').length;

    // Filter logic
    const filteredRooms = allRooms.filter(r => {
      const matchesSearch = !this.searchQuery || 
        r.number.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        r.type.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (r.currentGuest && r.currentGuest.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesStatus = this.statusFilter === 'ALL' || r.status === this.statusFilter;
      const matchesType = this.typeFilter === 'ALL' || r.type === this.typeFilter;
      const matchesCondition = this.conditionFilter === 'ALL' || r.condition === this.conditionFilter;
      const matchesFloor = this.floorFilter === 'ALL' || r.floor.toString() === this.floorFilter;

      return matchesSearch && matchesStatus && matchesType && matchesCondition && matchesFloor;
    });

    // Room types for filter dropdown
    const roomTypes = [...new Set(allRooms.map(r => r.type))];

    this.container.innerHTML = `
      <!-- Header Bar -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Room Management</h1>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              ${filteredRooms.length} Units Visible
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-0.5">Physical property inventory, occupancy status, and housekeeping logistics</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- View Toggle -->
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-lg flex items-center shadow-sm">
            <button onclick="window.rooms.setViewMode('table')" class="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${this.currentViewMode === 'table' ? 'bg-slate-900 text-white dark:bg-teal-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
              </svg>
              Table
            </button>
            <button onclick="window.rooms.setViewMode('grid')" class="px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${this.currentViewMode === 'grid' ? 'bg-slate-900 text-white dark:bg-teal-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              Grid
            </button>
          </div>

          <button onclick="window.rooms.openAddRoomModal()" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-semibold text-sm transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add Unit
          </button>
        </div>
      </div>

      <!-- Quick KPI Badges / Filter Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        
        <div onclick="window.rooms.filterByStatus('ALL')" class="bg-white dark:bg-slate-900 p-4 rounded-xl border ${this.statusFilter === 'ALL' ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200 dark:border-slate-800'} shadow-sm cursor-pointer hover:border-slate-300 transition-all flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Units</span>
            <div class="text-2xl font-black text-slate-900 dark:text-white mt-1">${totalCount}</div>
          </div>
          <span class="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm">All</span>
        </div>

        <div onclick="window.rooms.filterByStatus('Available')" class="bg-white dark:bg-slate-900 p-4 rounded-xl border ${this.statusFilter === 'Available' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-800'} shadow-sm cursor-pointer hover:border-emerald-300 transition-all flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Available</span>
            <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${availableCount}</div>
          </div>
          <span class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </span>
        </div>

        <div onclick="window.rooms.filterByStatus('Occupied')" class="bg-white dark:bg-slate-900 p-4 rounded-xl border ${this.statusFilter === 'Occupied' ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200 dark:border-slate-800'} shadow-sm cursor-pointer hover:border-teal-300 transition-all flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Occupied</span>
            <div class="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">${occupiedCount}</div>
          </div>
          <span class="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </span>
        </div>

        <div onclick="window.rooms.filterByStatus('Maintenance')" class="bg-white dark:bg-slate-900 p-4 rounded-xl border ${this.statusFilter === 'Maintenance' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-800'} shadow-sm cursor-pointer hover:border-rose-300 transition-all flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Maintenance</span>
            <div class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">${maintenanceCount}</div>
          </div>
          <span class="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </span>
        </div>

      </div>

      <!-- Advanced Filter & Search Toolbar -->
      <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        <!-- Search -->
        <div class="relative flex-1 min-w-[240px]">
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search room #, type, or guest name..." 
            value="${this.searchQuery}"
            oninput="window.rooms.handleSearch(this.value)"
            class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
          />
        </div>

        <!-- Filter Selects -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Room Type Filter -->
          <select 
            onchange="window.rooms.filterByType(this.value)" 
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="ALL" ${this.typeFilter === 'ALL' ? 'selected' : ''}>All Room Types</option>
            ${roomTypes.map(type => `
              <option value="${type}" ${this.typeFilter === type ? 'selected' : ''}>${type}</option>
            `).join('')}
          </select>

          <!-- Housekeeping Condition Filter -->
          <select 
            onchange="window.rooms.filterByCondition(this.value)" 
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="ALL" ${this.conditionFilter === 'ALL' ? 'selected' : ''}>All Conditions</option>
            <option value="Clean" ${this.conditionFilter === 'Clean' ? 'selected' : ''}>Clean & Inspected</option>
            <option value="Needs Cleaning" ${this.conditionFilter === 'Needs Cleaning' ? 'selected' : ''}>Needs Cleaning (${needsCleanCount})</option>
            <option value="In Progress" ${this.conditionFilter === 'In Progress' ? 'selected' : ''}>Cleaning In Progress</option>
          </select>

          <!-- Floor Filter -->
          <select 
            onchange="window.rooms.filterByFloor(this.value)" 
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="ALL" ${this.floorFilter === 'ALL' ? 'selected' : ''}>All Floors</option>
            <option value="1" ${this.floorFilter === '1' ? 'selected' : ''}>Floor 1 (Dorms)</option>
            <option value="2" ${this.floorFilter === '2' ? 'selected' : ''}>Floor 2 (Privates)</option>
            <option value="3" ${this.floorFilter === '3' ? 'selected' : ''}>Floor 3 (Suites)</option>
          </select>

          ${(this.searchQuery || this.statusFilter !== 'ALL' || this.typeFilter !== 'ALL' || this.conditionFilter !== 'ALL' || this.floorFilter !== 'ALL') ? `
            <button onclick="window.rooms.resetFilters()" class="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-2 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Reset
            </button>
          ` : ''}
        </div>

      </div>

      <!-- Main Room View (Table or Grid) -->
      ${this.currentViewMode === 'table' ? this.renderTableView(filteredRooms) : this.renderGridView(filteredRooms)}

      <!-- Floating Bulk Actions Toolbar (when units are selected) -->
      ${this.selectedRoomIds.size > 0 ? `
        <div class="bulk-toolbar">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            <span class="font-bold text-xs">${this.selectedRoomIds.size} Units Selected</span>
          </div>
          <div class="h-4 w-px bg-slate-700"></div>
          <div class="flex items-center gap-2">
            <button onclick="window.rooms.bulkSetCondition('Clean')" class="px-3 py-1 bg-teal-600 hover:bg-teal-500 rounded-md text-xs font-bold transition-colors">
              ✓ Mark Cleaned
            </button>
            <button onclick="window.rooms.bulkSetStatus('Available')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-md text-xs font-bold transition-colors">
              ● Set Available
            </button>
            <button onclick="window.rooms.bulkSetStatus('Maintenance')" class="px-3 py-1 bg-rose-600 hover:bg-rose-500 rounded-md text-xs font-bold transition-colors">
              🛠️ Set Maintenance
            </button>
            <button onclick="window.rooms.clearSelection()" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-md text-xs text-slate-300 transition-colors">
              ✕ Deselect
            </button>
          </div>
        </div>
      ` : ''}
    `;
  }

  renderTableView(rooms) {
    if (rooms.length === 0) {
      return `
        <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
          <svg class="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
          </svg>
          <div class="text-base font-bold text-slate-700 dark:text-slate-300">No rooms match your filter criteria</div>
          <p class="text-xs text-slate-400 mt-1">Try clearing filters or search queries to view all hostel units.</p>
        </div>
      `;
    }

    const allSelected = rooms.every(r => this.selectedRoomIds.has(r.id));

    return `
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse dense-table">
            <thead>
              <tr>
                <th class="w-10 text-center">
                  <input 
                    type="checkbox" 
                    ${allSelected ? 'checked' : ''} 
                    onchange="window.rooms.toggleSelectAll(this.checked, ${JSON.stringify(rooms.map(r=>r.id)).replace(/"/g, '&quot;')})"
                    class="rounded text-teal-600 focus:ring-teal-500" 
                  />
                </th>
                <th>Unit / Room #</th>
                <th>Type & Bed Config</th>
                <th>Floor</th>
                <th>Status</th>
                <th>Condition</th>
                <th>Rate / Night</th>
                <th>Current Guest</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${rooms.map(r => `
                <tr class="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${this.selectedRoomIds.has(r.id) ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''}">
                  <td class="text-center">
                    <input 
                      type="checkbox" 
                      ${this.selectedRoomIds.has(r.id) ? 'checked' : ''} 
                      onchange="window.rooms.toggleSelectRoom('${r.id}')"
                      class="rounded text-teal-600 focus:ring-teal-500" 
                    />
                  </td>
                  <td class="font-bold text-slate-900 dark:text-white">
                    <div class="flex items-center gap-2">
                      <span class="w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                        ${r.number}
                      </span>
                      <span>${r.number}</span>
                    </div>
                  </td>
                  <td>
                    <div class="font-semibold text-slate-800 dark:text-slate-200">${r.type}</div>
                    <div class="text-[11px] text-slate-400">${r.bedType} • Max ${r.capacity} pax</div>
                  </td>
                  <td>
                    <span class="text-xs font-semibold text-slate-600 dark:text-slate-400">Floor ${r.floor}</span>
                  </td>
                  <td>
                    <div class="relative inline-block">
                      <select 
                        onchange="window.rooms.changeRoomStatus('${r.id}', this.value)"
                        class="text-xs font-bold rounded-md px-2.5 py-1 appearance-none pr-6 cursor-pointer focus:outline-none transition-all ${
                          r.status === 'Available' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                          r.status === 'Occupied' ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800' :
                          'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }">
                        <option value="Available" ${r.status === 'Available' ? 'selected' : ''}>● Available</option>
                        <option value="Occupied" ${r.status === 'Occupied' ? 'selected' : ''}>● Occupied</option>
                        <option value="Maintenance" ${r.status === 'Maintenance' ? 'selected' : ''}>● Maintenance</option>
                      </select>
                      <svg class="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </td>
                  <td>
                    <button 
                      onclick="window.rooms.toggleCondition('${r.id}', '${r.condition}')"
                      class="text-xs font-semibold rounded-md px-2.5 py-1 flex items-center gap-1.5 transition-colors ${
                        r.condition === 'Clean' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100' :
                        r.condition === 'Needs Cleaning' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100' :
                        'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100'
                      }" 
                      title="Click to change cleaning state">
                      <span class="w-1.5 h-1.5 rounded-full ${
                        r.condition === 'Clean' ? 'bg-blue-500' :
                        r.condition === 'Needs Cleaning' ? 'bg-amber-500' : 'bg-purple-500'
                      }"></span>
                      ${r.condition}
                    </button>
                  </td>
                  <td class="font-bold text-slate-900 dark:text-white">
                    $${r.rate} <span class="text-[10px] font-normal text-slate-400">/ night</span>
                  </td>
                  <td>
                    ${r.currentGuest ? `
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-[10px] font-bold flex items-center justify-center">
                          ${r.currentGuest.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <span class="font-medium text-slate-800 dark:text-slate-200 text-xs">${r.currentGuest}</span>
                      </div>
                    ` : `
                      <span class="text-xs text-slate-400 italic">Vacant</span>
                    `}
                  </td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      ${r.status === 'Available' ? `
                        <button 
                          onclick="window.app.openReservationModal({ roomId: '${r.id}' })"
                          class="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 rounded text-xs font-semibold transition-colors">
                          Book
                        </button>
                      ` : ''}
                      <button 
                        onclick="window.rooms.openEditRoomModal('${r.id}')"
                        class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Edit Room Details">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
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

  renderGridView(rooms) {
    if (rooms.length === 0) {
      return `<div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">No rooms match filter.</div>`;
    }

    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        ${rooms.map(r => `
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between">
                <div>
                  <span class="text-xs font-semibold text-slate-400">Floor ${r.floor}</span>
                  <div class="text-xl font-black text-slate-900 dark:text-white">${r.number}</div>
                </div>
                <span class="badge ${
                  r.status === 'Available' ? 'badge-available' :
                  r.status === 'Occupied' ? 'badge-occupied' : 'badge-maintenance'
                }">
                  ${r.status}
                </span>
              </div>

              <div class="mt-3 text-xs">
                <div class="font-semibold text-slate-800 dark:text-slate-200">${r.type}</div>
                <div class="text-slate-400 text-[11px] mt-0.5">${r.bedType} • Max ${r.capacity} pax</div>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span class="text-slate-400 font-medium">Housekeeping:</span>
                <span class="font-semibold ${
                  r.condition === 'Clean' ? 'text-blue-600 dark:text-blue-400' :
                  r.condition === 'Needs Cleaning' ? 'text-amber-600 dark:text-amber-400' : 'text-purple-600 dark:text-purple-400'
                }">
                  ${r.condition}
                </span>
              </div>

              <div class="mt-2 flex items-center justify-between text-xs">
                <span class="text-slate-400 font-medium">Rate:</span>
                <span class="font-bold text-slate-900 dark:text-white">$${r.rate} / night</span>
              </div>

              ${r.currentGuest ? `
                <div class="mt-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 text-[10px] font-bold flex items-center justify-center">
                    ${r.currentGuest.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <span class="font-medium text-slate-800 dark:text-slate-200 truncate">${r.currentGuest}</span>
                </div>
              ` : ''}
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button 
                onclick="window.rooms.toggleCondition('${r.id}', '${r.condition}')"
                class="text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                Mark Cleaned
              </button>
              ${r.status === 'Available' ? `
                <button 
                  onclick="window.app.openReservationModal({ roomId: '${r.id}' })"
                  class="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-sm">
                  Book
                </button>
              ` : `
                <button 
                  onclick="window.rooms.openEditRoomModal('${r.id}')"
                  class="text-xs text-slate-400 hover:text-slate-600 font-medium">
                  Manage
                </button>
              `}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // --- Bulk Actions & Selection Handlers ---
  toggleSelectRoom(roomId) {
    if (this.selectedRoomIds.has(roomId)) {
      this.selectedRoomIds.delete(roomId);
    } else {
      this.selectedRoomIds.add(roomId);
    }
    window.app.playAudio('pop');
    this.render();
  }

  toggleSelectAll(checked, roomIds) {
    if (checked) {
      roomIds.forEach(id => this.selectedRoomIds.add(id));
    } else {
      this.selectedRoomIds.clear();
    }
    window.app.playAudio('pop');
    this.render();
  }

  clearSelection() {
    this.selectedRoomIds.clear();
    this.render();
  }

  bulkSetCondition(newCondition) {
    this.selectedRoomIds.forEach(roomId => {
      window.store.updateRoomCondition(roomId, newCondition);
    });
    window.app.playAudio('success');
    window.app.showToast(`${this.selectedRoomIds.size} units marked as ${newCondition}`, 'success');
    this.selectedRoomIds.clear();
    this.render();
  }

  bulkSetStatus(newStatus) {
    this.selectedRoomIds.forEach(roomId => {
      window.store.updateRoomStatus(roomId, newStatus);
    });
    window.app.playAudio('pop');
    window.app.showToast(`${this.selectedRoomIds.size} units updated to ${newStatus}`, 'info');
    this.selectedRoomIds.clear();
    this.render();
    if (window.dashboard) window.dashboard.render();
  }

  // --- Handlers & Interactions ---
  handleSearch(query) {
    this.searchQuery = query;
    this.render();
  }

  filterByStatus(status) {
    this.statusFilter = status;
    window.app.playAudio('pop');
    this.render();
  }

  filterByType(type) {
    this.typeFilter = type;
    this.render();
  }

  filterByCondition(condition) {
    this.conditionFilter = condition;
    this.render();
  }

  filterByFloor(floor) {
    this.floorFilter = floor;
    this.render();
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    window.app.playAudio('pop');
    this.render();
  }

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.typeFilter = 'ALL';
    this.conditionFilter = 'ALL';
    this.floorFilter = 'ALL';
    this.render();
  }

  changeRoomStatus(roomId, newStatus) {
    window.store.updateRoomStatus(roomId, newStatus);
    window.app.playAudio('pop');
    window.app.showToast(`Room status updated to ${newStatus}`, 'info');
    this.render();
    if (window.dashboard) window.dashboard.render();
  }

  toggleCondition(roomId, currentCondition) {
    const nextCondition = currentCondition === 'Clean' ? 'Needs Cleaning' :
      currentCondition === 'Needs Cleaning' ? 'In Progress' : 'Clean';
    window.store.updateRoomCondition(roomId, nextCondition);
    window.app.playAudio('pop');
    window.app.showToast(`Housekeeping status updated to ${nextCondition}`, 'success');
    this.render();
  }

  openAddRoomModal() {
    window.app.openAddRoomModal();
  }

  openEditRoomModal(roomId) {
    window.app.openEditRoomModal(roomId);
  }
}

// Global rooms instance
window.rooms = new RoomsModule();
