/**
 * HostelHub - Enhanced Dashboard Module
 * Dual-Mode Dashboard: Admin Mission Control & Student Resident Portal.
 */

class DashboardModule {
  constructor() {
    this.container = document.getElementById('view-dashboard');
  }

  init() {
    this.render();
  }

  render() {
    const isStudent = window.auth && window.auth.isStudent();
    if (isStudent) {
      this.renderStudentDashboard();
    } else {
      this.renderAdminDashboard();
    }
  }

  // ================= ADMIN / WARDEN DASHBOARD =================
  renderAdminDashboard() {
    const rooms = window.store.getRooms();
    const students = window.store.getStudents();
    const allocations = window.store.getAllocations();
    const payments = window.store.getPayments();
    const complaints = window.store.getComplaints().filter(c => c.status !== 'Resolved');
    const alerts = window.store.getAlerts().filter(a => !a.resolved);
    const notices = window.store.getNotices();
    const revenue = window.store.getRevenue();

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'Occupied').length;
    const availableRooms = rooms.filter(r => r.status === 'Available').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
    const occupancyPercentage = Math.round((occupiedRooms / totalRooms) * 100);

    const pendingAllocations = allocations.filter(a => a.status === 'Pending').length;
    const totalDues = students.reduce((sum, s) => sum + (s.pendingFees || 0), 0);

    this.container.innerHTML = `
      <!-- Dashboard Top Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Hostel Operations Overview</h1>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Chief Warden Mission Control
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-0.5">Real-time room occupancy, student allocations, fee collections, and maintenance tickets</p>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="window.auth.openAuthModal('switch')" class="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm flex items-center gap-1.5 transition-all">
            ⇄ Switch to Student View
          </button>
          <button onclick="window.allocations.openApplyModal()" class="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-semibold text-xs transition-all">
            + New Allotment
          </button>
        </div>
      </div>

      <!-- Top Metric Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        <!-- Occupancy Gauge Card -->
        <div class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Hostel Bed Occupancy</span>
            <span class="text-xs font-semibold text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md">${occupiedRooms}/${totalRooms} Units</span>
          </div>
          
          <div class="flex items-center justify-center my-3 relative">
            <svg class="w-32 h-32" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#f1f5f9" stroke-width="10" fill="none" class="dark:stroke-slate-800" />
              <circle class="gauge-circle" cx="50" cy="50" r="40" stroke="#0d9488" stroke-width="10" 
                stroke-dasharray="251.2" 
                stroke-dashoffset="${251.2 - (251.2 * occupancyPercentage) / 100}" 
                stroke-linecap="round" fill="none" />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="text-3xl font-black text-slate-900 dark:text-white">${occupancyPercentage}%</span>
              <span class="text-[10px] font-semibold text-slate-400 uppercase">Occupied</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-3 text-slate-500">
            <span>Available Vacancies:</span>
            <span class="font-bold text-emerald-600">${availableRooms} Beds Ready</span>
          </div>
        </div>

        <!-- Pending Room Allotments -->
        <div class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Room Applications</span>
            <span class="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">${pendingAllocations} Pending</span>
          </div>

          <div class="my-2">
            <div class="text-3xl font-black text-slate-900 dark:text-white">${pendingAllocations} <span class="text-sm font-normal text-slate-400">Applications</span></div>
            <div class="text-xs text-amber-600 font-semibold mt-0.5">Awaiting Warden Approval</div>
          </div>

          <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button onclick="window.app.navigate('allocations')" class="text-teal-600 font-bold hover:underline">
              Review Allocation Queue →
            </button>
          </div>
        </div>

        <!-- Fee Collections & Dues -->
        <div class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Hostel Fee Dues</span>
            <span class="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">$${totalDues.toLocaleString()} Pending</span>
          </div>

          <div class="my-2">
            <div class="text-3xl font-black text-slate-900 dark:text-white">$${totalDues.toLocaleString()}</div>
            <div class="text-xs text-slate-400 mt-0.5">Across ${students.filter(s=>s.pendingFees>0).length} student accounts</div>
          </div>

          <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button onclick="window.app.navigate('payments')" class="text-teal-600 font-bold hover:underline">
              Open Fee Management →
            </button>
          </div>
        </div>

        <!-- Active Complaints & Tickets -->
        <div class="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Open Grievances</span>
            <span class="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md">${complaints.length} Tickets</span>
          </div>

          <div class="my-2">
            <div class="text-3xl font-black text-slate-900 dark:text-white">${complaints.length} <span class="text-sm font-normal text-slate-400">Open</span></div>
            <div class="text-xs text-rose-600 font-semibold mt-0.5">Electrical & Plumbing repairs</div>
          </div>

          <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button onclick="window.app.navigate('complaints')" class="text-teal-600 font-bold hover:underline">
              Dispatch Technicians →
            </button>
          </div>
        </div>

      </div>

      <!-- Operational Action Shortcuts -->
      <div class="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Hostel Management Quick Actions</div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          <button onclick="window.allocations.openApplyModal()" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50/40 transition-all text-left group">
            <div class="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-base group-hover:scale-105 transition-transform">
              🏢
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600">Room Allocation</div>
              <div class="text-[11px] text-slate-400">Assign bed to student</div>
            </div>
          </button>

          <button onclick="window.payments.openRecordOfflineModal()" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50/40 transition-all text-left group">
            <div class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base group-hover:scale-105 transition-transform">
              💵
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600">Collect Hostel Fee</div>
              <div class="text-[11px] text-slate-400">Record cash / POS payment</div>
            </div>
          </button>

          <button onclick="window.complaints.openNewComplaintModal()" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50/40 transition-all text-left group">
            <div class="w-10 h-10 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-base group-hover:scale-105 transition-transform">
              🛠️
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600">Lodge Complaint</div>
              <div class="text-[11px] text-slate-400">Dispatch repair staff</div>
            </div>
          </button>

          <button onclick="window.app.exportDailySummary()" class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-teal-500 hover:bg-teal-50/40 transition-all text-left group">
            <div class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base group-hover:scale-105 transition-transform">
              📊
            </div>
            <div>
              <div class="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600">Daily Night Audit</div>
              <div class="text-[11px] text-slate-400">Export residency ledger</div>
            </div>
          </button>

        </div>
      </div>

      <!-- Active Grievances & Notice Board -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left: Open Tickets (7 cols) -->
        <div class="lg:col-span-7">
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div class="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Urgent Facility Grievances</h2>
              <button onclick="window.app.navigate('complaints')" class="text-xs text-teal-600 font-bold hover:underline">View All Tickets →</button>
            </div>

            <div class="divide-y divide-slate-100 dark:divide-slate-800">
              ${complaints.slice(0, 3).map(cmp => `
                <div class="p-4 flex items-start justify-between gap-3">
                  <div class="flex items-start gap-3">
                    <span class="text-lg">${cmp.category === 'Electrical' ? '⚡' : cmp.category === 'Plumbing' ? '🚿' : '📶'}</span>
                    <div>
                      <div class="text-xs font-bold text-slate-900 dark:text-white">${cmp.title}</div>
                      <div class="text-[11px] text-slate-500 mt-0.5">${cmp.roomNumber} (${cmp.block}) • ${cmp.studentName}</div>
                      <span class="badge ${cmp.status === 'Assigned' ? 'badge-in-progress' : 'badge-needs-cleaning'} mt-1">
                        ● ${cmp.status}
                      </span>
                    </div>
                  </div>

                  <button onclick="window.complaints.openDispatchModal('${cmp.id}')" class="px-3 py-1 bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 rounded text-xs font-bold">
                    Dispatch
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right: Official Notice Board (5 cols) -->
        <div class="lg:col-span-5">
          <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Hostel Notice Board</h2>
              <span class="text-[10px] text-slate-400 font-mono">LIVE FEED</span>
            </div>

            <div class="space-y-3">
              ${notices.map(n => `
                <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-slate-900 dark:text-white">${n.title}</span>
                    <span class="text-[9px] font-bold uppercase text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">${n.priority}</span>
                  </div>
                  <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">${n.text}</p>
                  <div class="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
                    <span>By: ${n.author}</span>
                    <span>${n.date}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // ================= STUDENT PERSONALIZED PORTAL =================
  renderStudentDashboard() {
    const student = window.auth ? window.auth.currentUser : null;
    if (!student) return;

    const studentRecord = window.store.getStudentById(student.id) || student;
    const complaints = window.store.getComplaints().filter(c => c.studentId === studentRecord.id);
    const payments = window.store.getPayments().filter(p => p.studentId === studentRecord.id);
    const menu = window.store.getMessMenu();
    const notices = window.store.getNotices();

    this.container.innerHTML = `
      <!-- Welcome Student Banner -->
      <div class="bg-gradient-to-r from-teal-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 md:p-8 shadow-lg mb-8 relative overflow-hidden">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div class="flex items-center gap-4">
            <img src="${studentRecord.avatar}" alt="${studentRecord.name}" class="w-16 h-16 rounded-full object-cover border-2 border-teal-400 shadow-md" />
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-teal-300">Student Resident Portal</span>
              <h1 class="text-2xl font-black tracking-tight mt-0.5">Welcome, ${studentRecord.name}!</h1>
              <p class="text-xs text-slate-300 mt-0.5">${studentRecord.department} • ${studentRecord.year} • Roll: ${studentRecord.rollNo}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button onclick="window.auth.openAuthModal('switch')" class="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg font-semibold text-xs border border-slate-700">
              ⇄ Switch Account
            </button>
            <button onclick="window.complaints.openNewComplaintModal()" class="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg font-bold text-xs shadow-sm">
              + File Grievance
            </button>
          </div>
        </div>
      </div>

      <!-- Student 3-Card Summary Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <!-- Room Allotment Card -->
        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">My Room & Bed Coordinates</span>
            <div class="text-2xl font-black text-slate-900 dark:text-white mt-2">${studentRecord.roomAssigned || 'Pending Allotment'}</div>
            <p class="text-xs text-slate-500 mt-1">${studentRecord.hostelBlock} • ${studentRecord.bedNumber || 'Bed A'}</p>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
            ${studentRecord.roomAssigned ? `
              <button onclick="window.allocations.printAllotmentLetter('ALLOT-1001')" class="text-xs text-teal-600 font-bold hover:underline">
                View Allotment Slip →
              </button>
            ` : `
              <button onclick="window.allocations.openApplyModal()" class="text-xs text-teal-600 font-bold hover:underline">
                Apply for Allotment →
              </button>
            `}
          </div>
        </div>

        <!-- Fee Balance & Payment Card -->
        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Hostel Fee Account</span>
              <span class="badge ${studentRecord.feeStatus === 'Paid' ? 'badge-available' : 'badge-maintenance'}">
                ● ${studentRecord.feeStatus}
              </span>
            </div>
            <div class="text-2xl font-black text-slate-900 dark:text-white mt-2">
              $${(studentRecord.pendingFees || 0).toLocaleString()} <span class="text-xs font-normal text-slate-400">Pending Dues</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">Total Term Fee: $${(studentRecord.totalFees || 12000).toLocaleString()}</p>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
            ${(studentRecord.pendingFees || 0) > 0 ? `
              <button onclick="window.payments.openOnlineCheckoutModal('${studentRecord.id}')" class="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold shadow-sm">
                Pay Fees Online
              </button>
            ` : `
              <span class="text-xs text-emerald-600 font-bold">Cleared (Receipt Available)</span>
            `}
          </div>
        </div>

        <!-- Active Complaints Card -->
        <div class="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">My Maintenance Tickets</span>
            <div class="text-2xl font-black text-slate-900 dark:text-white mt-2">${complaints.length} Tickets</div>
            <p class="text-xs text-slate-500 mt-1">${complaints.filter(c=>c.status!=='Resolved').length} currently active in field</p>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
            <button onclick="window.app.navigate('complaints')" class="text-xs text-teal-600 font-bold hover:underline">
              Track Complaints Pipeline →
            </button>
          </div>
        </div>

      </div>

      <!-- Student Bottom Section: Daily Mess Menu & Notices -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Today's Mess Menu (6 cols) -->
        <div class="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">🍲</span>
              <h2 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Daily Mess Dining Menu (Wednesday)</h2>
            </div>
            <span class="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">All Meals Included</span>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span class="font-bold text-slate-400 text-[10px] uppercase">Breakfast (07:30 - 09:30 AM)</span>
              <p class="font-medium text-slate-800 dark:text-slate-200 mt-1">${menu.breakfast}</p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span class="font-bold text-slate-400 text-[10px] uppercase">Lunch (12:30 - 02:30 PM)</span>
              <p class="font-medium text-slate-800 dark:text-slate-200 mt-1">${menu.lunch}</p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span class="font-bold text-slate-400 text-[10px] uppercase">Evening Snacks (05:00 - 06:00 PM)</span>
              <p class="font-medium text-slate-800 dark:text-slate-200 mt-1">${menu.snacks}</p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span class="font-bold text-slate-400 text-[10px] uppercase">Dinner (08:00 - 10:00 PM)</span>
              <p class="font-medium text-slate-800 dark:text-slate-200 mt-1">${menu.dinner}</p>
            </div>
          </div>
        </div>

        <!-- Campus Notices (6 cols) -->
        <div class="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-lg">📢</span>
              <h2 class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Campus & Hostel Notices</h2>
            </div>
          </div>

          <div class="space-y-2.5">
            ${notices.slice(0, 2).map(n => `
              <div class="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-lg text-xs">
                <div class="flex items-center justify-between">
                  <strong class="text-slate-900 dark:text-white">${n.title}</strong>
                  <span class="text-[10px] text-slate-400">${n.date}</span>
                </div>
                <p class="text-[11px] text-slate-600 dark:text-slate-400 mt-1">${n.text}</p>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }
}

// Global dashboard
window.dashboard = new DashboardModule();
