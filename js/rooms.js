/**
 * HostelHub - Enhanced Hostel & Room Management Module
 * Granular control center for Hostel Blocks, Room Inventory, Bed Allocations, Housekeeping, and Bulk Operations.
 */

class RoomsModule {
  constructor() {
    this.container = document.getElementById('view-rooms');
    this.currentViewMode = 'table'; // 'table' or 'grid'
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.typeFilter = 'ALL';
    this.blockFilter = 'ALL';
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
    if (filters.blockFilter) this.blockFilter = filters.blockFilter;
    this.render();
  }

  render() {
    const allRooms = window.store.getRooms();
    const blocks = window.store.getBlocks();

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
      const matchesBlock = this.blockFilter === 'ALL' || r.block === this.blockFilter;
      const matchesCondition = this.conditionFilter === 'ALL' || r.condition === this.conditionFilter;
      const matchesFloor = this.floorFilter === 'ALL' || r.floor.toString() === this.floorFilter;

      return matchesSearch && matchesStatus && matchesType && matchesBlock && matchesCondition && matchesFloor;
    });

    // Room types for filter dropdown
    const roomTypes = [...new Set(allRooms.map(r => r.type))];

    this.container.innerHTML = `
      <!-- Header Bar -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Hostel & Room Management</h1>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              ${filteredRooms.length} Units Visible
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-0.5">Physical property inventory, block configurations, bed occupancy, and housekeeping logistics</p>
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

          <button onclick="window.rooms.openAddRoomModal()" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-semibold text-xs transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            + Add Hostel Unit
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
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Vacant Beds</span>
            <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${availableCount}</div>
          </div>
          <span class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            ✓
          </span>
        </div>

        <div onclick="window.rooms.filterByStatus('Occupied')" class="bg-white dark:bg-slate-900 p-4 rounded-xl border ${this.statusFilter === 'Occupied' ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200 dark:border-slate-800'} shadow-sm cursor-pointer hover:border-teal-300 transition-all flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Occupied</span>
            <div class="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">${occupiedCount}</div>
          </div>
          <span class="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
            👥
          </span>
        </div>

        <div onclick="window.rooms.filterByStatus('Maintenance')" class="bg-white dark:bg-slate-900 p-4 rounded-xl border ${this.statusFilter === 'Maintenance' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200 dark:border-slate-800'} shadow-sm cursor-pointer hover:border-rose-300 transition-all flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Maintenance</span>
            <div class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">${maintenanceCount}</div>
          </div>
          <span class="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
            🛠️
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
            placeholder="Search room #, type, or resident student..." 
            value="${this.searchQuery}"
            oninput="window.rooms.handleSearch(this.value)"
            class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>

        <!-- Filter Selects -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Hostel Block Filter -->
          <select 
            onchange="window.rooms.filterByBlock(this.value)" 
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg px-3 py-2">
            <option value="ALL" ${this.blockFilter === 'ALL' ? 'selected' : ''}>All Hostel Blocks</option>
            ${blocks.map(b => `
              <option value="${b.id}" ${this.blockFilter === b.id ? 'selected' : ''}>${b.name}</option>
            `).join('')}
          </select>

          <!-- Room Type Filter -->
          <select 
            onchange="window.rooms.filterByType(this.value)" 
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg px-3 py-2">
            <option value="ALL" ${this.typeFilter === 'ALL' ? 'selected' : ''}>All Room Types</option>
            ${roomTypes.map(type => `
              <option value="${type}" ${this.typeFilter === type ? 'selected' : ''}>${type}</option>
            `).join('')}
          </select>

          <!-- Housekeeping Condition Filter -->
          <select 
            onchange="window.rooms.filterByCondition(this.value)" 
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg px-3 py-2">
            <option value="ALL" ${this.conditionFilter === 'ALL' ? 'selected' : ''}>All Conditions</option>
            <option value="Clean" ${this.conditionFilter === 'Clean' ? 'selected' : ''}>Clean & Ready</option>
            <option value="Needs Cleaning" ${this.conditionFilter === 'Needs Cleaning' ? 'selected' : ''}>Needs Cleaning (${needsCleanCount})</option>
            <option value="In Progress" ${this.conditionFilter === 'In Progress' ? 'selected' : ''}>Cleaning In Progress</option>
          </select>

          ${(this.searchQuery || this.statusFilter !== 'ALL' || this.typeFilter !== 'ALL' || this.blockFilter !== 'ALL' || this.conditionFilter !== 'ALL') ? `
            <button onclick="window.rooms.resetFilters()" class="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-2 flex items-center gap-1">
              ✕ Reset
            </button>
          ` : ''}
        </div>

      </div>

      <!-- Main Room View (Table or Grid) -->
      ${this.currentViewMode === 'table' ? this.renderTableView(filteredRooms) : this.renderGridView(filteredRooms)}

      <!-- Floating Bulk Actions Toolbar -->
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
          <div class="text-base font-bold text-slate-700 dark:text-slate-300">No rooms match filter criteria</div>
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
                <th>Hostel Unit / Room #</th>
                <th>Block & Floor</th>
                <th>Type & AC Config</th>
                <th>Status</th>
                <th>Condition</th>
                <th>Monthly Rate</th>
                <th>Resident Student</th>
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
                      <span class="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                        ${r.number}
                      </span>
                      <span>${r.number}</span>
                    </div>
                  </td>
                  <td>
                    <div class="font-semibold text-slate-800 dark:text-slate-200 text-xs">${r.block || 'Block A'}</div>
                    <div class="text-[11px] text-slate-400">Floor ${r.floor}</div>
                  </td>
                  <td>
                    <div class="font-semibold text-slate-800 dark:text-slate-200 text-xs">${r.type}</div>
                    <div class="text-[11px] text-slate-400">${r.ac ? '❄️ Air Conditioned' : 'Non-AC'} • Max ${r.capacity} pax</div>
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
                      }">
                      ${r.condition}
                    </button>
                  </td>
                  <td class="font-bold text-slate-900 dark:text-white">
                    $${r.rate} <span class="text-[10px] font-normal text-slate-400">/ mo</span>
                  </td>
                  <td>
                    ${r.currentGuest ? `
                      <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center">
                          ${r.currentGuest.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <span class="font-medium text-slate-800 dark:text-slate-200 text-xs">${r.currentGuest}</span>
                      </div>
                    ` : `
                      <span class="text-xs text-slate-400 italic">Vacant Bed</span>
                    `}
                  </td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      ${r.status === 'Available' ? `
                        <button 
                          onclick="window.allocations.openApplyModal()"
                          class="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 rounded text-xs font-semibold transition-colors">
                          Allot
                        </button>
                      ` : ''}
                      <button 
                        onclick="window.rooms.openEditRoomModal('${r.id}')"
                        class="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded">
                        ✎
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
    return `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        ${rooms.map(r => `
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div class="flex items-start justify-between">
                <div>
                  <span class="text-xs font-semibold text-slate-400">${r.block} • Floor ${r.floor}</span>
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
                <div class="text-slate-400 text-[11px] mt-0.5">${r.ac ? '❄️ AC' : 'Non-AC'} • Max ${r.capacity} pax</div>
              </div>

              <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span class="text-slate-400 font-medium">Condition:</span>
                <span class="font-semibold text-blue-600">${r.condition}</span>
              </div>

              ${r.currentGuest ? `
                <div class="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold flex items-center justify-center">
                    ${r.currentGuest.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <span class="font-medium text-slate-800 dark:text-slate-200 truncate">${r.currentGuest}</span>
                </div>
              ` : ''}
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span class="font-bold text-xs text-slate-900 dark:text-white">$${r.rate}/mo</span>
              <button 
                onclick="window.rooms.openEditRoomModal('${r.id}')"
                class="text-xs text-slate-400 hover:text-slate-600 font-medium">
                Manage
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // --- Handlers ---
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

  filterByBlock(block) {
    this.blockFilter = block;
    this.render();
  }

  filterByCondition(condition) {
    this.conditionFilter = condition;
    this.render();
  }

  setViewMode(mode) {
    this.currentViewMode = mode;
    this.render();
  }

  resetFilters() {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.typeFilter = 'ALL';
    this.blockFilter = 'ALL';
    this.conditionFilter = 'ALL';
    this.floorFilter = 'ALL';
    this.render();
  }

  toggleSelectRoom(roomId) {
    if (this.selectedRoomIds.has(roomId)) {
      this.selectedRoomIds.delete(roomId);
    } else {
      this.selectedRoomIds.add(roomId);
    }
    this.render();
  }

  toggleSelectAll(checked, roomIds) {
    if (checked) {
      roomIds.forEach(id => this.selectedRoomIds.add(id));
    } else {
      this.selectedRoomIds.clear();
    }
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
    window.app.showToast(`${this.selectedRoomIds.size} units marked as ${newCondition}`, 'success');
    this.selectedRoomIds.clear();
    this.render();
  }

  bulkSetStatus(newStatus) {
    this.selectedRoomIds.forEach(roomId => {
      window.store.updateRoomStatus(roomId, newStatus);
    });
    window.app.showToast(`${this.selectedRoomIds.size} units updated to ${newStatus}`, 'info');
    this.selectedRoomIds.clear();
    this.render();
  }

  changeRoomStatus(roomId, newStatus) {
    window.store.updateRoomStatus(roomId, newStatus);
    window.app.showToast(`Room status updated to ${newStatus}`, 'info');
    this.render();
  }

  toggleCondition(roomId, currentCondition) {
    const nextCondition = currentCondition === 'Clean' ? 'Needs Cleaning' :
      currentCondition === 'Needs Cleaning' ? 'In Progress' : 'Clean';
    window.store.updateRoomCondition(roomId, nextCondition);
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
