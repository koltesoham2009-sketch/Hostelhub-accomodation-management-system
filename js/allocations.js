/**
 * HostelHub - Room Allocation Module
 * Handles Student Room Allocation Applications, Warden Approval Queue, Bed Allotment, and Printable Allotment Letters.
 */

class AllocationsModule {
  constructor() {
    this.container = document.getElementById('view-allocations');
    this.statusFilter = 'ALL';
    this.blockFilter = 'ALL';
    this.searchQuery = '';
  }

  init() {
    this.render();
  }

  render() {
    const allocations = window.store.getAllocations();
    const rooms = window.store.getRooms();
    const blocks = window.store.getBlocks();
    const students = window.store.getStudents();

    const totalAllocations = allocations.filter(a => a.status === 'Allocated').length;
    const pendingRequests = allocations.filter(a => a.status === 'Pending').length;
    const availableBeds = rooms.filter(r => r.status === 'Available').length;

    // Filter list
    const filteredAllocations = allocations.filter(a => {
      const matchSearch = !this.searchQuery ||
        a.studentName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        a.rollNo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (a.allocatedRoomId && a.allocatedRoomId.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchStatus = this.statusFilter === 'ALL' || a.status === this.statusFilter;
      const matchBlock = this.blockFilter === 'ALL' || a.preferredBlock === this.blockFilter || (a.allocatedBlock && a.allocatedBlock.includes(this.blockFilter));

      return matchSearch && matchStatus && matchBlock;
    });

    const isStudentUser = window.auth && window.auth.isStudent();
    const currentStudent = window.auth ? window.auth.currentUser : null;
    const studentAllotment = isStudentUser ? allocations.find(a => a.studentId === currentStudent.id) : null;

    this.container.innerHTML = `
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Room Allocation Management</h1>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Academic Term 2026-27
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-0.5">Hostel bed assignments, allotment approvals, and official residency letters</p>
        </div>

        <div class="flex items-center gap-3">
          <button onclick="window.allocations.openApplyModal()" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-semibold text-xs transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            + Apply for Allotment
          </button>
        </div>
      </div>

      <!-- Quick KPI Counters -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        
        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Active Resident Allotments</span>
            <div class="text-2xl font-black text-slate-900 dark:text-white mt-1">${totalAllocations} Allotted</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            🏢
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Warden Reviews</span>
            <div class="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">${pendingRequests} Requests</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            ⏳
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Vacant Beds Available</span>
            <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">${availableBeds} Beds</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            🛏️
          </div>
        </div>

      </div>

      <!-- Student Current Allotment Card (If viewing as Student) -->
      ${isStudentUser && studentAllotment ? `
        <div class="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-2xl p-6 shadow-md mb-6 relative overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-teal-300">My Resident Allotment</span>
              <h2 class="text-2xl font-black mt-1">${studentAllotment.allocatedRoomId ? `${studentAllotment.allocatedRoomId} (${studentAllotment.allocatedBed})` : 'Allotment in Review'}</h2>
              <p class="text-xs text-slate-300 mt-1">${studentAllotment.allocatedBlock || studentAllotment.preferredBlock} • ${studentAllotment.term}</p>
            </div>

            <div class="flex items-center gap-3">
              ${studentAllotment.allocatedRoomId ? `
                <button onclick="window.allocations.printAllotmentLetter('${studentAllotment.id}')" class="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg font-bold text-xs shadow-sm flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                  </svg>
                  Download Allotment Letter
                </button>
              ` : `
                <span class="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold">
                  Status: Verification Pending
                </span>
              `}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Search & Filters -->
      <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        <div class="relative flex-1 min-w-[240px]">
          <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input 
            type="text" 
            placeholder="Search student, roll number, or room..." 
            value="${this.searchQuery}"
            oninput="window.allocations.handleSearch(this.value)"
            class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div class="flex items-center gap-2.5">
          <select 
            onchange="window.allocations.filterStatus(this.value)"
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg px-3 py-2">
            <option value="ALL" ${this.statusFilter === 'ALL' ? 'selected' : ''}>All Allotment Statuses</option>
            <option value="Allocated" ${this.statusFilter === 'Allocated' ? 'selected' : ''}>● Allocated & Active</option>
            <option value="Pending" ${this.statusFilter === 'Pending' ? 'selected' : ''}>● Pending Review</option>
          </select>

          <select 
            onchange="window.allocations.filterBlock(this.value)"
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg px-3 py-2">
            <option value="ALL" ${this.blockFilter === 'ALL' ? 'selected' : ''}>All Blocks</option>
            <option value="BLOCK-A" ${this.blockFilter === 'BLOCK-A' ? 'selected' : ''}>Block A (Boys)</option>
            <option value="BLOCK-B" ${this.blockFilter === 'BLOCK-B' ? 'selected' : ''}>Block B (Girls)</option>
            <option value="BLOCK-C" ${this.blockFilter === 'BLOCK-C' ? 'selected' : ''}>Block C (PG)</option>
          </select>
        </div>

      </div>

      <!-- Allocations Master Table -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse dense-table">
            <thead>
              <tr>
                <th>Student & Roll No</th>
                <th>Department & Term</th>
                <th>Preference</th>
                <th>Allotted Room & Bed</th>
                <th>Status</th>
                <th>Allotment Date</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filteredAllocations.length === 0 ? `
                <tr>
                  <td colspan="7" class="text-center py-10 text-slate-400">
                    No room allocation records found matching filter criteria.
                  </td>
                </tr>
              ` : filteredAllocations.map(a => `
                <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td>
                    <div class="font-bold text-slate-900 dark:text-white text-xs">${a.studentName}</div>
                    <div class="text-[11px] text-slate-400 font-mono">${a.rollNo}</div>
                  </td>
                  <td>
                    <div class="text-xs text-slate-700 dark:text-slate-300 font-medium">${a.department}</div>
                    <div class="text-[10px] text-slate-400">${a.term}</div>
                  </td>
                  <td>
                    <div class="text-xs text-slate-800 dark:text-slate-200">${a.preferredRoomType}</div>
                    <div class="text-[10px] text-slate-400">${a.preferredBlock}</div>
                  </td>
                  <td>
                    ${a.allocatedRoomId ? `
                      <div class="font-bold text-teal-700 dark:text-teal-400 text-xs">Unit ${a.allocatedRoomId}</div>
                      <div class="text-[10px] text-slate-400 font-medium">${a.allocatedBed} • ${a.allocatedBlock}</div>
                    ` : `
                      <span class="text-xs text-amber-600 font-medium italic">Pending Allotment</span>
                    `}
                  </td>
                  <td>
                    <span class="badge ${a.status === 'Allocated' ? 'badge-available' : 'badge-needs-cleaning'}">
                      ● ${a.status}
                    </span>
                  </td>
                  <td>
                    <span class="text-xs text-slate-600 dark:text-slate-400">${a.allottedDate || a.requestedDate}</span>
                  </td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      ${a.status === 'Pending' ? `
                        <button onclick="window.allocations.openApproveModal('${a.id}')" class="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold shadow-sm">
                          Approve & Assign Bed
                        </button>
                      ` : `
                        <button onclick="window.allocations.printAllotmentLetter('${a.id}')" class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold">
                          Letter
                        </button>
                      `}
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

  filterStatus(status) {
    this.statusFilter = status;
    this.render();
  }

  filterBlock(block) {
    this.blockFilter = block;
    this.render();
  }

  openApplyModal() {
    const student = window.auth ? window.auth.currentUser : null;
    const blocks = window.store.getBlocks();
    const modalContent = document.getElementById('allotment-modal-content');

    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            🏢
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Apply for Room Allotment</h3>
            <p class="text-xs text-slate-400">Hostel residency application for Academic Term 2026-27</p>
          </div>
        </div>
        <button onclick="window.app.closeModal('modal-allotment')" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">&times;</button>
      </div>

      <form id="form-allotment-apply" onsubmit="window.allocations.handleApplySubmit(event)" class="p-6 space-y-4">
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Student Full Name</label>
            <input type="text" id="allot-student-name" required value="${student ? student.name : ''}" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Roll / Registration No</label>
            <input type="text" id="allot-student-roll" required value="${student ? student.rollNo || '' : ''}" placeholder="e.g. 2024-CSE-042" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Preferred Hostel Block</label>
            <select id="allot-pref-block" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              ${blocks.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Room Category Preference</label>
            <select id="allot-pref-type" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              <option value="4-Bed Dorm">4-Bed Dormitory (Economy)</option>
              <option value="2-Bed Sharing">2-Bed Twin Sharing (Standard)</option>
              <option value="Single Private (AC)">Single Private (AC Deluxe)</option>
              <option value="Studio Suite">Studio Suite (PG / Research Scholar)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Special Preferences / Medical Notes</label>
          <textarea id="allot-remarks" rows="2" placeholder="e.g. Ground floor preferred due to knee issue, quiet study room..." class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"></textarea>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-allotment')" class="px-4 py-2 text-xs font-semibold text-slate-600">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm">
            Submit Application to Warden
          </button>
        </div>

      </form>
    `;

    window.app.openModal('modal-allotment');
  }

  handleApplySubmit(e) {
    e.preventDefault();
    const student = window.auth ? window.auth.currentUser : null;
    const name = document.getElementById('allot-student-name').value.trim();
    const roll = document.getElementById('allot-student-roll').value.trim();
    const block = document.getElementById('allot-pref-block').value;
    const type = document.getElementById('allot-pref-type').value;
    const remarks = document.getElementById('allot-remarks').value.trim();

    const newReq = {
      id: 'ALLOT-' + Math.floor(1000 + Math.random() * 9000),
      studentId: student ? student.id : 'STU-' + Date.now(),
      studentName: name,
      rollNo: roll,
      department: student ? student.department : 'Engineering',
      gender: student ? student.gender : 'Male',
      preferredBlock: block,
      preferredRoomType: type,
      allocatedBlock: null,
      allocatedRoomId: null,
      allocatedBed: null,
      term: 'Fall 2026',
      status: 'Pending',
      requestedDate: new Date().toISOString().split('T')[0],
      allottedDate: null,
      allottedBy: null,
      remarks: remarks || 'Standard room request'
    };

    window.store.addAllocationRequest(newReq);
    window.app.closeModal('modal-allotment');
    window.app.playAudio('success');
    window.app.showToast('Room allotment application submitted successfully!', 'success');
    this.render();
  }

  openApproveModal(allotId) {
    const allot = window.store.getAllocations().find(a => a.id === allotId);
    if (!allot) return;

    const availableRooms = window.store.getRooms().filter(r => r.status === 'Available');
    const modalContent = document.getElementById('allotment-modal-content');

    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Approve & Allocate Bed</h3>
          <p class="text-xs text-slate-400">${allot.studentName} (${allot.rollNo}) • ${allot.preferredRoomType}</p>
        </div>
        <button onclick="window.app.closeModal('modal-allotment')" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">&times;</button>
      </div>

      <form onsubmit="window.allocations.handleApproveSubmit(event, '${allot.id}')" class="p-6 space-y-4">
        
        <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
          <div class="flex justify-between">
            <span class="text-slate-400">Department:</span>
            <strong class="text-slate-900 dark:text-white">${allot.department}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Preferred Block:</span>
            <strong class="text-slate-900 dark:text-white">${allot.preferredBlock}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Remarks:</span>
            <span class="text-slate-600 dark:text-slate-300 italic">"${allot.remarks}"</span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Assign Vacant Room Unit</label>
          <select id="approve-room" required class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
            ${availableRooms.length === 0 ? '<option value="">No vacant rooms in inventory!</option>' : 
              availableRooms.map(r => `<option value="${r.id}">${r.number} - ${r.type} (${r.block} • Floor ${r.floor})</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Bed Designation</label>
          <select id="approve-bed" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
            <option value="Bed A (Window Side)">Bed A (Window Side)</option>
            <option value="Bed B (Door Side)">Bed B (Door Side)</option>
            <option value="Bed C (Upper Bunk)">Bed C (Upper Bunk)</option>
            <option value="Bed D (Lower Bunk)">Bed D (Lower Bunk)</option>
            <option value="Single Master Bed">Single Master Bed</option>
          </select>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-allotment')" class="px-4 py-2 text-xs font-semibold text-slate-600">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm">
            Approve & Dispatch Allotment Letter
          </button>
        </div>

      </form>
    `;

    window.app.openModal('modal-allotment');
  }

  handleApproveSubmit(e, allotId) {
    e.preventDefault();
    const roomId = document.getElementById('approve-room').value;
    const bed = document.getElementById('approve-bed').value;
    if (!roomId) {
      window.app.showToast('Please select a valid room', 'error');
      return;
    }

    window.store.approveAllocation(allotId, roomId, bed, window.auth.currentUser?.name || 'Chief Warden');
    window.app.closeModal('modal-allotment');
    window.app.playAudio('success');
    window.app.showToast(`Room ${roomId} (${bed}) successfully allocated!`, 'success');
    this.render();
  }

  printAllotmentLetter(allotId) {
    const allot = window.store.getAllocations().find(a => a.id === allotId);
    if (!allot) return;

    const modalContent = document.getElementById('allotment-modal-content');
    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Official Room Allotment Letter</h3>
        <button onclick="window.app.closeModal('modal-allotment')" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">&times;</button>
      </div>

      <div class="p-6 space-y-6">
        <div id="allotment-letter-paper" class="p-8 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl space-y-5 text-slate-900 dark:text-white font-sans text-xs">
          
          <div class="text-center border-b-2 border-slate-900 dark:border-slate-600 pb-4">
            <h2 class="text-lg font-black uppercase tracking-wider">HOSTELHUB RESIDENTIAL CAMPUS</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Office of the Chief Warden & Student Housing Board</p>
            <div class="mt-2 inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 font-mono font-bold rounded">
              REF NO: ${allot.id} / ${allot.term}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 py-2">
            <div>
              <span class="text-[10px] text-slate-400 font-bold uppercase">Resident Scholar</span>
              <div class="text-sm font-bold">${allot.studentName}</div>
              <div class="text-slate-600 dark:text-slate-400">Roll No: ${allot.rollNo}</div>
              <div class="text-slate-600 dark:text-slate-400">Dept: ${allot.department}</div>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 font-bold uppercase">Allotment Coordinates</span>
              <div class="text-sm font-bold text-teal-600">Unit ${allot.allocatedRoomId}</div>
              <div class="text-slate-600 dark:text-slate-400">${allot.allocatedBed}</div>
              <div class="text-slate-600 dark:text-slate-400">${allot.allocatedBlock}</div>
            </div>
          </div>

          <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>Rules & Terms:</strong> Possession of electrical appliances (heaters/induction) without permission is strictly prohibited. Curfew hours are 10:00 PM. Mess charges are payable on a monthly basis.
          </div>

          <div class="pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div>
              <div class="font-bold">Student Signature</div>
              <div class="text-[10px] text-slate-400">Date: ${allot.allottedDate || '2026-08-26'}</div>
            </div>
            <div class="text-right">
              <div class="font-bold">${allot.allottedBy || 'Chief Warden'}</div>
              <div class="text-[10px] text-slate-400">Authorized Housing Seal ✓</div>
            </div>
          </div>

        </div>

        <div class="flex items-center justify-between">
          <button type="button" onclick="window.app.closeModal('modal-allotment')" class="px-4 py-2 text-xs font-semibold text-slate-600">
            Close
          </button>
          <button type="button" onclick="window.print()" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-2">
            🖨️ Print Allotment Slip / PDF
          </button>
        </div>
      </div>
    `;

    window.app.openModal('modal-allotment');
  }
}

// Global Allocations Module
window.allocations = new AllocationsModule();
