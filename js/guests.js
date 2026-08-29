/**
 * HostelHub - Student & Resident CRM Directory Module
 * Centralized database for student profiles, academic departments, guardian contacts, room history, and loyalty program.
 */

class GuestsModule {
  constructor() {
    this.searchQuery = '';
    this.deptFilter = 'ALL';
    this.statusFilter = 'ALL';
  }

  init() {
    this.render();
  }

  render() {
    const container = document.getElementById('view-guests');
    if (!container) return;

    const allStudents = window.store.getStudents ? window.store.getStudents() : [];

    // Summary counts
    const totalCount = allStudents.length;
    const inHouseCount = allStudents.filter(g => g.roomAssigned).length;
    const paidCount = allStudents.filter(g => g.feeStatus === 'Paid').length;
    const duesCount = allStudents.filter(g => g.pendingFees > 0).length;

    // Filter logic
    const filteredStudents = allStudents.filter(g => {
      const matchesSearch = !this.searchQuery ||
        g.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        g.email.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        g.rollNo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (g.phone && g.phone.includes(this.searchQuery)) ||
        (g.roomAssigned && g.roomAssigned.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchesDept = this.deptFilter === 'ALL' || (g.department && g.department.includes(this.deptFilter));
      const matchesStatus = this.statusFilter === 'ALL' || (this.statusFilter === 'Allotted' ? !!g.roomAssigned : !g.roomAssigned);

      return matchesSearch && matchesDept && matchesStatus;
    });

    container.innerHTML = `
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Student CRM Directory</h1>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              ${filteredStudents.length} Students Listed
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-0.5">Centralized resident student profiles, academic departments, guardian contacts, and room records</p>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="window.guests.exportGuestsCSV()" class="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 rounded-lg shadow-sm font-semibold text-xs transition-all flex items-center gap-1.5">
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Export CSV
          </button>

          <button onclick="window.auth.openAuthModal('student-register')" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-semibold text-xs transition-all flex items-center gap-2">
            + Register Student
          </button>
        </div>
      </div>

      <!-- Quick KPI Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        
        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
            <div class="text-2xl font-black text-slate-900 dark:text-white mt-1">${totalCount}</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-sm">
            👥
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Hostel Residents</span>
            <div class="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">${inHouseCount}</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
            🏢
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Fees Cleared</span>
            <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${paidCount}</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            ✓
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Dues</span>
            <div class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">${duesCount}</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
            ⚠️
          </div>
        </div>

      </div>

      <!-- Search & Filters -->
      <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        <div class="relative flex-1 min-w-[260px]">
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search student name, roll #, department, or room..." 
            value="${this.searchQuery}"
            oninput="window.guests.handleSearch(this.value)"
            class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>

        <div class="flex items-center gap-2.5">
          <select 
            onchange="window.guests.filterByDept(this.value)"
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="ALL" ${this.deptFilter === 'ALL' ? 'selected' : ''}>All Departments</option>
            <option value="Computer" ${this.deptFilter === 'Computer' ? 'selected' : ''}>Computer Science</option>
            <option value="Information" ${this.deptFilter === 'Information' ? 'selected' : ''}>Information Tech</option>
            <option value="Mechanical" ${this.deptFilter === 'Mechanical' ? 'selected' : ''}>Mechanical</option>
            <option value="Artificial" ${this.deptFilter === 'Artificial' ? 'selected' : ''}>AI & Data Science</option>
            <option value="Civil" ${this.deptFilter === 'Civil' ? 'selected' : ''}>Civil Engineering</option>
          </select>

          <select 
            onchange="window.guests.filterByStatus(this.value)"
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="ALL" ${this.statusFilter === 'ALL' ? 'selected' : ''}>All Allotment Statuses</option>
            <option value="Allotted" ${this.statusFilter === 'Allotted' ? 'selected' : ''}>Allotted in Hostel</option>
            <option value="Unallotted" ${this.statusFilter === 'Unallotted' ? 'selected' : ''}>Pending Allotment</option>
          </select>
        </div>

      </div>

      <!-- Student Directory Table -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse dense-table">
            <thead>
              <tr>
                <th>Student Profile</th>
                <th>Roll No / Dept</th>
                <th>Hostel Unit</th>
                <th>Fee Status</th>
                <th>Guardian Contact</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStudents.length === 0 ? `
                <tr>
                  <td colspan="6" class="text-center py-10 text-slate-400">
                    No student records found matching filter criteria.
                  </td>
                </tr>
              ` : filteredStudents.map(g => `
                <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td>
                    <div class="flex items-center gap-3">
                      <img src="${g.avatar}" alt="${g.name}" class="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                      <div>
                        <div class="font-bold text-slate-900 dark:text-white text-xs">${g.name}</div>
                        <div class="text-[11px] text-slate-400">${g.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="text-xs text-slate-800 dark:text-slate-200 font-mono font-bold">${g.rollNo}</div>
                    <div class="text-[10px] text-slate-400 truncate max-w-[140px]">${g.department}</div>
                  </td>
                  <td>
                    ${g.roomAssigned ? `
                      <div class="font-bold text-teal-700 dark:text-teal-400 text-xs">${g.roomAssigned} (${g.bedNumber || 'Bed A'})</div>
                      <div class="text-[10px] text-slate-400">${g.hostelBlock}</div>
                    ` : `
                      <span class="text-xs text-amber-600 italic">Pending Allotment</span>
                    `}
                  </td>
                  <td>
                    <span class="badge ${g.feeStatus === 'Paid' ? 'badge-available' : g.feeStatus === 'Partial' ? 'badge-clean' : 'badge-maintenance'}">
                      ● ${g.feeStatus || 'Paid'}
                    </span>
                    ${g.pendingFees > 0 ? `<div class="text-[10px] text-rose-500 font-bold mt-0.5">$${g.pendingFees} Due</div>` : ''}
                  </td>
                  <td>
                    <div class="text-xs text-slate-700 dark:text-slate-300 font-medium">${g.guardianName || 'Guardian'}</div>
                    <div class="text-[10px] text-slate-400">${g.guardianPhone || g.phone}</div>
                  </td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button 
                        onclick="window.guests.openProfileDrawer('${g.id}')"
                        class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold">
                        Profile
                      </button>
                      <button 
                        onclick="window.app.openReservationModal({ guestName: '${g.name}' })"
                        class="px-2.5 py-1 bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 rounded text-xs font-bold">
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

  filterByDept(dept) {
    this.deptFilter = dept;
    this.render();
  }

  filterByStatus(status) {
    this.statusFilter = status;
    this.render();
  }

  openProfileDrawer(studentId) {
    const student = window.store.getStudentById ? window.store.getStudentById(studentId) : null;
    if (!student) return;

    const drawer = document.getElementById('guest-profile-drawer');
    const content = document.getElementById('guest-drawer-content');
    if (!drawer || !content) return;

    content.innerHTML = `
      <div class="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
        <h3 class="text-base font-black text-slate-900 dark:text-white">Resident Student Profile</h3>
        <button onclick="window.guests.closeDrawer()" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">&times;</button>
      </div>

      <div class="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
        
        <div class="flex items-center gap-4">
          <img src="${student.avatar}" alt="${student.name}" class="w-14 h-14 rounded-full object-cover border-2 border-teal-500 shadow" />
          <div>
            <h4 class="text-base font-black text-slate-900 dark:text-white">${student.name}</h4>
            <div class="text-slate-500 font-mono font-bold">${student.rollNo}</div>
            <div class="text-[11px] text-teal-600 font-semibold mt-0.5">${student.department}</div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
          <div class="flex justify-between">
            <span class="text-slate-400">Hostel Block:</span>
            <strong class="text-slate-900 dark:text-white">${student.hostelBlock || 'Pending Allotment'}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Room & Bed:</span>
            <strong class="text-teal-600">${student.roomAssigned || 'N/A'} (${student.bedNumber || 'Bed A'})</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Fee Status:</span>
            <span class="font-bold ${student.feeStatus === 'Paid' ? 'text-emerald-600' : 'text-rose-500'}">${student.feeStatus} (${student.pendingFees === 0 ? 'No Dues' : '$' + student.pendingFees + ' Pending'})</span>
          </div>
        </div>

        <div class="space-y-2">
          <div class="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">Contact & Guardian</div>
          <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-1">
            <div>📞 Student Phone: <strong>${student.phone}</strong></div>
            <div>✉️ Email: <strong>${student.email}</strong></div>
            <div>👨‍👩‍👧 Guardian: <strong>${student.guardianName || 'Parent'} (${student.guardianPhone || student.phone})</strong></div>
            <div>📍 Home Address: <span class="text-slate-500">${student.address || 'Maharashtra, India'}</span></div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <button onclick="window.app.showToast('SMS Access Notice dispatched to ' + student.phone, 'success')" class="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs">
            📲 Send SMS Notice
          </button>
          <button onclick="window.guests.closeDrawer()" class="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-600 dark:text-slate-300 text-xs">
            Close
          </button>
        </div>

      </div>
    `;

    drawer.classList.remove('hidden');
  }

  closeDrawer() {
    const drawer = document.getElementById('guest-profile-drawer');
    if (drawer) drawer.classList.add('hidden');
  }

  exportGuestsCSV() {
    const students = window.store.getStudents ? window.store.getStudents() : [];
    let csv = 'Roll No,Name,Email,Phone,Department,Hostel Block,Room,Fee Status,Pending Dues\n';
    
    students.forEach(s => {
      csv += `"${s.rollNo}","${s.name}","${s.email}","${s.phone}","${s.department}","${s.hostelBlock}","${s.roomAssigned || 'N/A'}","${s.feeStatus}","$${s.pendingFees || 0}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HostelHub_Students_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.app.showToast('Student CRM directory exported as CSV', 'success');
  }
}

// Global guests instance
window.guests = new GuestsModule();
