/**
 * HostelHub - Complaint & Grievance Helpdesk Module
 * Handles Multi-Category Student Complaint Lodging, Live Ticket Pipeline,
 * Warden Technician Dispatching, and Student Resolution Ratings.
 */

class ComplaintsModule {
  constructor() {
    this.container = document.getElementById('view-complaints');
    this.categoryFilter = 'ALL';
    this.statusFilter = 'ALL';
    this.searchQuery = '';
  }

  init() {
    this.render();
  }

  render() {
    const complaints = window.store.getComplaints();
    const isStudent = window.auth && window.auth.isStudent();
    const currentUser = window.auth ? window.auth.currentUser : null;

    const totalOpen = complaints.filter(c => c.status !== 'Resolved').length;
    const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
    const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

    // Filter complaints
    const filteredComplaints = complaints.filter(c => {
      const matchSearch = !this.searchQuery ||
        c.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.studentName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.roomNumber.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchCategory = this.categoryFilter === 'ALL' || c.category === this.categoryFilter;
      const matchStatus = this.statusFilter === 'ALL' || c.status === this.statusFilter;

      // If student view, optionally highlight or show their own
      if (isStudent && currentUser) {
        return c.studentId === currentUser.id && matchCategory && matchStatus;
      }
      return matchSearch && matchCategory && matchStatus;
    });

    this.container.innerHTML = `
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Hostel Grievance & Maintenance Helpdesk</h1>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              ${totalOpen} Active Issues
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-0.5">Facility repairs, electrical/plumbing tickets, wi-fi support, and mess feedback</p>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="window.complaints.openNewComplaintModal()" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-bold text-xs transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            + Lodge New Complaint
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        
        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Open Tickets</span>
            <div class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">${totalOpen} Pending</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            ⚠️
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Technicians In-Field</span>
            <div class="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">${inProgressCount} Assigned</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            🛠️
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved This Term</span>
            <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${resolvedCount} Closed</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            ✓
          </div>
        </div>

      </div>

      <!-- Search & Category Filters -->
      <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        <div class="relative flex-1 min-w-[240px]">
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search complaint title, room, or student..." 
            value="${this.searchQuery}"
            oninput="window.complaints.handleSearch(this.value)"
            class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <select 
            onchange="window.complaints.filterCategory(this.value)"
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg px-3 py-2">
            <option value="ALL" ${this.categoryFilter === 'ALL' ? 'selected' : ''}>All Categories</option>
            <option value="Electrical" ${this.categoryFilter === 'Electrical' ? 'selected' : ''}>⚡ Electrical / Fan / AC</option>
            <option value="Plumbing" ${this.categoryFilter === 'Plumbing' ? 'selected' : ''}>🚿 Plumbing / Washroom</option>
            <option value="Wi-Fi / Internet" ${this.categoryFilter === 'Wi-Fi / Internet' ? 'selected' : ''}>📶 Wi-Fi & Internet</option>
            <option value="Cleanliness" ${this.categoryFilter === 'Cleanliness' ? 'selected' : ''}>🧹 Cleanliness / Housekeeping</option>
            <option value="Mess & Food" ${this.categoryFilter === 'Mess & Food' ? 'selected' : ''}>🍲 Mess & Dining</option>
          </select>

          <select 
            onchange="window.complaints.filterStatus(this.value)"
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg px-3 py-2">
            <option value="ALL" ${this.statusFilter === 'ALL' ? 'selected' : ''}>All Statuses</option>
            <option value="Submitted" ${this.statusFilter === 'Submitted' ? 'selected' : ''}>Submitted</option>
            <option value="Assigned" ${this.statusFilter === 'Assigned' ? 'selected' : ''}>Assigned to Staff</option>
            <option value="In Progress" ${this.statusFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
            <option value="Resolved" ${this.statusFilter === 'Resolved' ? 'selected' : ''}>Resolved & Closed</option>
          </select>
        </div>

      </div>

      <!-- Tickets Grid / Cards -->
      <div class="space-y-4">
        ${filteredComplaints.length === 0 ? `
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
            <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
              ✓
            </div>
            <div class="text-sm font-bold text-slate-700 dark:text-slate-300">No active complaints found</div>
            <p class="text-xs text-slate-400 mt-0.5">All reported issues have been addressed by maintenance staff.</p>
          </div>
        ` : filteredComplaints.map(cmp => `
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <div class="flex items-start gap-4">
              <!-- Category Icon Badge -->
              <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                cmp.category === 'Electrical' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' :
                cmp.category === 'Plumbing' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' :
                cmp.category === 'Wi-Fi / Internet' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' :
                'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300'
              }">
                ${cmp.category === 'Electrical' ? '⚡' : cmp.category === 'Plumbing' ? '🚿' : cmp.category === 'Wi-Fi / Internet' ? '📶' : '🛠️'}
              </div>

              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-xs font-mono font-bold text-slate-400">${cmp.id}</span>
                  <span class="text-xs font-black text-slate-900 dark:text-white">${cmp.title}</span>
                  <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    cmp.priority === 'High' || cmp.priority === 'Urgent' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                  }">${cmp.priority}</span>
                </div>

                <p class="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">${cmp.description}</p>

                <div class="text-[11px] text-slate-400 mt-2 flex flex-wrap items-center gap-4">
                  <span>👤 Reported by: <strong class="text-slate-700 dark:text-slate-300">${cmp.studentName}</strong></span>
                  <span>🛏️ Unit: <strong class="text-slate-700 dark:text-slate-300">${cmp.roomNumber} (${cmp.block})</strong></span>
                  <span>🕒 ${cmp.createdAt}</span>
                  ${cmp.assignedTo ? `<span>🔧 Assigned: <strong class="text-teal-600">${cmp.assignedTo}</strong></span>` : ''}
                </div>

                ${cmp.staffNotes ? `
                  <div class="mt-2 text-[11px] p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 italic">
                    Staff update: "${cmp.staffNotes}"
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Actions & Status Pipeline -->
            <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              <span class="badge ${
                cmp.status === 'Resolved' ? 'badge-available' :
                cmp.status === 'In Progress' ? 'badge-in-progress' : 'badge-needs-cleaning'
              }">
                ● Status: ${cmp.status}
              </span>

              ${cmp.status !== 'Resolved' ? `
                <div class="flex items-center gap-1.5">
                  <button onclick="window.complaints.openDispatchModal('${cmp.id}')" class="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm">
                    Manage / Dispatch
                  </button>
                </div>
              ` : `
                <div class="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  ★ ★ ★ ★ ★ <span class="text-slate-400 text-[10px] ml-1">(5.0)</span>
                </div>
              `}
            </div>

          </div>
        `).join('')}
      </div>
    `;
  }

  // --- Handlers ---
  handleSearch(val) {
    this.searchQuery = val;
    this.render();
  }

  filterCategory(cat) {
    this.categoryFilter = cat;
    this.render();
  }

  filterStatus(st) {
    this.statusFilter = st;
    this.render();
  }

  openNewComplaintModal() {
    const student = window.auth ? window.auth.currentUser : null;
    const modalContent = document.getElementById('complaint-modal-content');

    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            🛠️
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Lodge Hostel Grievance / Maintenance Ticket</h3>
            <p class="text-xs text-slate-400">Direct dispatch to warden and facility technicians</p>
          </div>
        </div>
        <button onclick="window.app.closeModal('modal-complaint')" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">&times;</button>
      </div>

      <form onsubmit="window.complaints.handleNewComplaintSubmit(event)" class="p-6 space-y-4">
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Resident Student</label>
            <input type="text" id="cmp-name" required value="${student ? student.name : ''}" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Room Unit & Block</label>
            <input type="text" id="cmp-room" required value="${student ? student.roomAssigned || 'A-101' : 'A-101'}" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Issue Category</label>
            <select id="cmp-category" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              <option value="Electrical">⚡ Electrical / Fan / AC / Switch</option>
              <option value="Plumbing">🚿 Plumbing / Geyser / Washroom</option>
              <option value="Wi-Fi / Internet">📶 Wi-Fi Access / LAN Speed</option>
              <option value="Cleanliness">🧹 Housekeeping / Sanitation</option>
              <option value="Furniture">🪑 Bed / Cupboard / Study Desk</option>
              <option value="Mess & Food">🍲 Mess & Dining Hygiene</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Severity / Urgency</label>
            <select id="cmp-priority" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              <option value="Urgent">🔴 Urgent (Immediate resolution)</option>
              <option value="High" selected>🟡 High (Within 24 hours)</option>
              <option value="Medium">🔵 Medium (Routine maintenance)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Issue Headline</label>
          <input type="text" id="cmp-title" required placeholder="e.g. Washroom geyser power socket spark" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Detailed Description</label>
          <textarea id="cmp-desc" required rows="3" placeholder="Please describe when the issue started and exact location..." class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"></textarea>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-complaint')" class="px-4 py-2 text-xs font-semibold text-slate-600">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-sm">
            Dispatch Ticket to Warden
          </button>
        </div>

      </form>
    `;

    window.app.openModal('modal-complaint');
  }

  handleNewComplaintSubmit(e) {
    e.preventDefault();
    const student = window.auth ? window.auth.currentUser : null;
    const name = document.getElementById('cmp-name').value.trim();
    const room = document.getElementById('cmp-room').value.trim();
    const category = document.getElementById('cmp-category').value;
    const priority = document.getElementById('cmp-priority').value;
    const title = document.getElementById('cmp-title').value.trim();
    const desc = document.getElementById('cmp-desc').value.trim();

    const newCmp = {
      id: 'CMP-' + Math.floor(800 + Math.random() * 200),
      studentId: student ? student.id : 'STU-GEN',
      studentName: name,
      roomNumber: room,
      block: room.startsWith('B') ? 'Block B (Girls Hostel)' : 'Block A (Boys Hostel)',
      category,
      title,
      description: desc,
      priority,
      status: 'Submitted',
      assignedTo: null,
      createdAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      resolvedAt: null,
      rating: null,
      staffNotes: 'Ticket received by warden desk'
    };

    window.store.addComplaint(newCmp);
    window.app.closeModal('modal-complaint');
    window.app.playAudio('warning');
    window.app.showToast(`Ticket ${newCmp.id} lodged successfully! Warden notified.`, 'success');
    this.render();
  }

  openDispatchModal(cmpId) {
    const cmp = window.store.getComplaints().find(c => c.id === cmpId);
    if (!cmp) return;

    const modalContent = document.getElementById('complaint-modal-content');
    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Manage Ticket ${cmp.id}</h3>
          <p class="text-xs text-slate-400">${cmp.title} (${cmp.roomNumber})</p>
        </div>
        <button onclick="window.app.closeModal('modal-complaint')" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">&times;</button>
      </div>

      <form onsubmit="window.complaints.handleDispatchSubmit(event, '${cmp.id}')" class="p-6 space-y-4">
        
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Assign Maintenance Technician</label>
          <select id="dispatch-staff" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
            <option value="Rajesh (Senior Electrician)">Rajesh (Senior Electrician)</option>
            <option value="Suresh (Senior Plumber)">Suresh (Senior Plumber)</option>
            <option value="IT Campus Network Team">IT Campus Network Team</option>
            <option value="Deep Clean Sanitation Crew">Deep Clean Sanitation Crew</option>
            <option value="Carpenter & Furniture Crew">Carpenter & Furniture Crew</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Update Status</label>
          <select id="dispatch-status" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
            <option value="Assigned" ${cmp.status === 'Assigned' ? 'selected' : ''}>Assigned to Technician</option>
            <option value="In Progress" ${cmp.status === 'In Progress' ? 'selected' : ''}>In Progress / Parts Ordered</option>
            <option value="Resolved" ${cmp.status === 'Resolved' ? 'selected' : ''}>✓ Resolved & Fixed</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Warden / Staff Update Notes</label>
          <textarea id="dispatch-notes" rows="2" placeholder="e.g. Capacitor replaced in fan motor. Tested working." class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">${cmp.staffNotes || ''}</textarea>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-complaint')" class="px-4 py-2 text-xs font-semibold text-slate-600">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm">
            Save Status & Notify Student
          </button>
        </div>

      </form>
    `;

    window.app.openModal('modal-complaint');
  }

  handleDispatchSubmit(e, cmpId) {
    e.preventDefault();
    const staff = document.getElementById('dispatch-staff').value;
    const status = document.getElementById('dispatch-status').value;
    const notes = document.getElementById('dispatch-notes').value.trim();

    window.store.updateComplaintStatus(cmpId, status, notes, staff);
    window.app.closeModal('modal-complaint');
    window.app.playAudio('success');
    window.app.showToast(`Ticket ${cmpId} updated to ${status}`, 'success');
    this.render();
  }
}

// Global Complaints Module
window.complaints = new ComplaintsModule();
