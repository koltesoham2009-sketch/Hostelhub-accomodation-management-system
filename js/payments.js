/**
 * HostelHub - Fee & Payment Management Module
 * Manages Student Fee Breakdown, Online Checkout Simulator (UPI QR, Card, NetBanking),
 * Official Fee Receipts, and Warden Financial Ledgers.
 */

class PaymentsModule {
  constructor() {
    this.container = document.getElementById('view-payments');
    this.statusFilter = 'ALL';
    this.searchQuery = '';
  }

  init() {
    this.render();
  }

  render() {
    const payments = window.store.getPayments();
    const students = window.store.getStudents();
    const isStudent = window.auth && window.auth.isStudent();
    const currentUser = window.auth ? window.auth.currentUser : null;

    // Financial totals
    const totalCollected = payments.filter(p => p.status === 'Paid' || p.status === 'Partial').reduce((sum, p) => sum + (p.paidAmount || 0), 0);
    const totalDues = students.reduce((sum, s) => sum + (s.pendingFees || 0), 0);
    const defaultersCount = students.filter(s => s.feeStatus === 'Overdue' || s.pendingFees > 0).length;

    // Filter payments list
    const filteredPayments = payments.filter(p => {
      const matchSearch = !this.searchQuery ||
        p.studentName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.rollNo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (p.roomNumber && p.roomNumber.toLowerCase().includes(this.searchQuery.toLowerCase()));

      const matchStatus = this.statusFilter === 'ALL' || p.status === this.statusFilter;

      // If student view, filter by their own record
      if (isStudent && currentUser) {
        return p.studentId === currentUser.id;
      }
      return matchSearch && matchStatus;
    });

    const studentRecord = isStudent && currentUser ? students.find(s => s.id === currentUser.id) : null;

    this.container.innerHTML = `
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Hostel Fee & Payment Management</h1>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Billing Cycle 2026
            </span>
          </div>
          <p class="text-sm text-slate-500 mt-0.5">Semester room rent, mess charges, online checkout, and official fee receipts</p>
        </div>

        <div class="flex items-center gap-3">
          ${isStudent ? `
            <button onclick="window.payments.openOnlineCheckoutModal('${currentUser?.id}')" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-bold text-xs transition-all flex items-center gap-2">
              💳 Pay Hostel Dues Online
            </button>
          ` : `
            <button onclick="window.payments.openRecordOfflineModal()" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-semibold text-xs transition-all flex items-center gap-2">
              + Record Offline Payment
            </button>
          `}
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        
        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Fee Collections</span>
            <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">$${totalCollected.toLocaleString()}</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            💰
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Hostel Dues</span>
            <div class="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">$${totalDues.toLocaleString()}</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            ⚠️
          </div>
        </div>

        <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Fee Accounts</span>
            <div class="text-2xl font-black text-slate-900 dark:text-white mt-1">${defaultersCount} Students</div>
          </div>
          <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold">
            📋
          </div>
        </div>

      </div>

      <!-- Student Personalized Fee Dues Banner (If viewing as student) -->
      ${isStudent && studentRecord ? `
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border ${studentRecord.pendingFees > 0 ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-emerald-400 ring-2 ring-emerald-400/20'} shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="badge ${studentRecord.feeStatus === 'Paid' ? 'badge-available' : studentRecord.feeStatus === 'Partial' ? 'badge-clean' : 'badge-maintenance'}">
                ● Fee Status: ${studentRecord.feeStatus}
              </span>
              <span class="text-xs text-slate-400">${studentRecord.roomAssigned || 'Resident'} • Semester 5</span>
            </div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white mt-1.5">
              ${studentRecord.pendingFees === 0 ? 'Hostel & Mess Fees Fully Paid!' : `Outstanding Balance: $${studentRecord.pendingFees.toLocaleString()}`}
            </h2>
            <p class="text-xs text-slate-500 mt-0.5">Total Semester Fees: $${studentRecord.totalFees.toLocaleString()} (Paid: $${studentRecord.paidFees.toLocaleString()})</p>
          </div>

          <div class="flex items-center gap-3">
            ${studentRecord.pendingFees > 0 ? `
              <button onclick="window.payments.openOnlineCheckoutModal('${studentRecord.id}')" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-2">
                💳 Pay $${studentRecord.pendingFees} Online
              </button>
            ` : `
              <span class="text-xs text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg">
                ✓ No Pending Dues
              </span>
            `}
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
            placeholder="Search student, roll number, or transaction ID..." 
            value="${this.searchQuery}"
            oninput="window.payments.handleSearch(this.value)"
            class="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div class="flex items-center gap-2.5">
          <select 
            onchange="window.payments.filterStatus(this.value)"
            class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-lg px-3 py-2">
            <option value="ALL" ${this.statusFilter === 'ALL' ? 'selected' : ''}>All Payment Statuses</option>
            <option value="Paid" ${this.statusFilter === 'Paid' ? 'selected' : ''}>● Fully Paid</option>
            <option value="Partial" ${this.statusFilter === 'Partial' ? 'selected' : ''}>● Partial Payment</option>
            <option value="Overdue" ${this.statusFilter === 'Overdue' ? 'selected' : ''}>● Overdue Dues</option>
          </select>
        </div>

      </div>

      <!-- Payments Table -->
      <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse dense-table">
            <thead>
              <tr>
                <th>Student / Roll No</th>
                <th>Semester / Term</th>
                <th>Room Unit</th>
                <th>Total Fee</th>
                <th>Paid / Pending</th>
                <th>Payment Mode</th>
                <th>Status</th>
                <th class="text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPayments.length === 0 ? `
                <tr>
                  <td colspan="8" class="text-center py-10 text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ` : filteredPayments.map(p => `
                <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td>
                    <div class="font-bold text-slate-900 dark:text-white text-xs">${p.studentName}</div>
                    <div class="text-[11px] text-slate-400 font-mono">${p.rollNo}</div>
                  </td>
                  <td>
                    <div class="text-xs text-slate-700 dark:text-slate-300 font-medium">${p.semester}</div>
                    <div class="text-[10px] text-slate-400 font-mono">${p.id}</div>
                  </td>
                  <td>
                    <span class="text-xs font-bold text-teal-700 dark:text-teal-400">${p.roomNumber || 'A-101'}</span>
                  </td>
                  <td>
                    <div class="font-bold text-slate-900 dark:text-white text-xs">$${p.structure?.total || 12000}</div>
                    <div class="text-[10px] text-slate-400">Due: ${p.dueDate}</div>
                  </td>
                  <td>
                    <div class="text-xs font-bold text-emerald-600 dark:text-emerald-400">$${p.paidAmount} Paid</div>
                    ${p.pendingAmount > 0 ? `
                      <div class="text-[10px] font-bold text-rose-500">$${p.pendingAmount} Pending</div>
                    ` : `
                      <div class="text-[10px] text-emerald-600">Cleared ✓</div>
                    `}
                  </td>
                  <td>
                    <span class="text-xs text-slate-700 dark:text-slate-300">${p.method}</span>
                  </td>
                  <td>
                    <span class="badge ${
                      p.status === 'Paid' ? 'badge-available' :
                      p.status === 'Partial' ? 'badge-clean' : 'badge-maintenance'
                    }">
                      ● ${p.status}
                    </span>
                  </td>
                  <td class="text-right">
                    ${p.paidAmount > 0 ? `
                      <button onclick="window.payments.printFeeReceipt('${p.id}')" class="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs font-semibold">
                        🧾 Receipt
                      </button>
                    ` : `
                      <button onclick="window.payments.openOnlineCheckoutModal('${p.studentId}')" class="px-2.5 py-1 bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 rounded text-xs font-bold">
                        Pay Dues
                      </button>
                    `}
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

  openOnlineCheckoutModal(studentId) {
    const student = window.store.getStudentById(studentId) || window.store.getStudents()[0];
    if (!student) return;

    const modalContent = document.getElementById('payment-modal-content');
    const amountToPay = student.pendingFees || 12000;

    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white rounded-t-2xl">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            💳
          </div>
          <div>
            <h3 class="text-base font-bold">Hostel Fee Payment Portal</h3>
            <p class="text-xs text-slate-400">${student.name} (${student.rollNo})</p>
          </div>
        </div>
        <button onclick="window.app.closeModal('modal-payment')" class="text-slate-400 hover:text-white text-xl font-bold p-1">&times;</button>
      </div>

      <div class="p-6 space-y-5">
        
        <!-- Fee Summary Card -->
        <div class="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Payable Amount</span>
            <div class="text-2xl font-black text-slate-900 dark:text-white mt-0.5">$${amountToPay}.00</div>
          </div>
          <div class="text-right text-xs text-slate-500">
            <div>Semester 5 Fee (Fall 2026)</div>
            <div class="text-emerald-600 font-bold">Zero Convenience Fee</div>
          </div>
        </div>

        <!-- Payment Method Tabs: UPI QR / Card / NetBanking -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Select Payment Method</label>
          <div class="grid grid-cols-3 gap-2 mb-4">
            <button type="button" onclick="window.payments.switchPaymentTab('upi')" id="paytab-upi" class="p-2.5 rounded-lg border-2 border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold text-xs text-center">
              📱 UPI / QR Code
            </button>
            <button type="button" onclick="window.payments.switchPaymentTab('card')" id="paytab-card" class="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-xs text-center">
              💳 Debit / Credit Card
            </button>
            <button type="button" onclick="window.payments.switchPaymentTab('net')" id="paytab-net" class="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-xs text-center">
              🏦 Net Banking
            </button>
          </div>

          <!-- Tab 1: UPI QR Mode -->
          <div id="paycontent-upi" class="text-center p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div class="w-36 h-36 mx-auto bg-white p-2.5 rounded-xl border-2 border-slate-900 flex flex-col items-center justify-center shadow-inner">
              <svg class="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                <rect width="30" height="30" x="10" y="10" />
                <rect width="30" height="30" x="60" y="10" />
                <rect width="30" height="30" x="10" y="60" />
                <rect width="10" height="10" x="20" y="20" fill="white" />
                <rect width="10" height="10" x="70" y="20" fill="white" />
                <rect width="10" height="10" x="20" y="70" fill="white" />
                <rect width="10" height="10" x="50" y="50" />
                <rect width="10" height="10" x="70" y="70" />
                <rect width="10" height="10" x="50" y="70" />
                <rect width="10" height="10" x="70" y="50" />
              </svg>
            </div>
            <div class="text-xs font-bold text-slate-800 dark:text-slate-200">Scan QR Code with any UPI App</div>
            <div class="text-[11px] text-slate-400">Google Pay • PhonePe • Paytm • BHIM</div>
          </div>

          <!-- Tab 2: Card Mode -->
          <div id="paycontent-card" class="space-y-3 hidden">
            <div>
              <label class="block text-[11px] font-bold text-slate-500 mb-1">Card Number</label>
              <input type="text" placeholder="4111 2222 3333 4444" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-bold text-slate-500 mb-1">Expiry (MM/YY)</label>
                <input type="text" placeholder="08/28" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2" />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-500 mb-1">CVV</label>
                <input type="password" placeholder="•••" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2" />
              </div>
            </div>
          </div>

          <!-- Tab 3: Net Banking Mode -->
          <div id="paycontent-net" class="space-y-3 hidden">
            <label class="block text-[11px] font-bold text-slate-500 mb-1">Choose Bank</label>
            <select class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
              <option>HDFC Bank</option>
              <option>State Bank of India (SBI)</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
            </select>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button type="button" onclick="window.app.closeModal('modal-payment')" class="px-4 py-2 text-xs font-semibold text-slate-600">
            Cancel
          </button>
          <button type="button" onclick="window.payments.simulateCompletePayment('${student.id}', ${amountToPay})" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-2">
            ✓ Complete Payment ($${amountToPay})
          </button>
        </div>

      </div>
    `;

    window.app.openModal('modal-payment');
  }

  switchPaymentTab(mode) {
    ['upi', 'card', 'net'].forEach(m => {
      const tab = document.getElementById(`paytab-${m}`);
      const content = document.getElementById(`paycontent-${m}`);
      if (tab && content) {
        if (m === mode) {
          tab.classList.add('border-teal-600', 'bg-teal-50', 'text-teal-700');
          content.classList.remove('hidden');
        } else {
          tab.classList.remove('border-teal-600', 'bg-teal-50', 'text-teal-700');
          content.classList.add('hidden');
        }
      }
    });
  }

  simulateCompletePayment(studentId, amount) {
    const student = window.store.getStudentById(studentId);
    if (!student) return;

    const newPay = {
      id: 'PAY-' + Math.floor(9000 + Math.random() * 1000),
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      roomNumber: student.roomAssigned || 'A-101',
      semester: 'Semester 5 (Fall 2026)',
      structure: {
        roomRent: amount * 0.5,
        messCharges: amount * 0.35,
        cautionDeposit: 500,
        maintenanceFee: 500,
        total: amount
      },
      paidAmount: amount,
      pendingAmount: 0,
      status: 'Paid',
      dueDate: '2026-08-30',
      paidDate: new Date().toISOString().split('T')[0],
      method: 'Online UPI (Completed)',
      transactionId: 'TXN-' + Date.now(),
      receiptNumber: 'REC-2026-' + Math.floor(1000 + Math.random() * 9000)
    };

    window.store.addPayment(newPay);
    window.app.closeModal('modal-payment');
    window.app.playAudio('success');
    window.app.showToast(`Payment of $${amount} received! Receipt generated.`, 'success');
    this.render();
    this.printFeeReceipt(newPay.id);
  }

  printFeeReceipt(payId) {
    const pay = window.store.getPayments().find(p => p.id === payId);
    if (!pay) return;

    const modalContent = document.getElementById('payment-modal-content');
    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Hostel Fee Receipt</h3>
        <button onclick="window.app.closeModal('modal-payment')" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">&times;</button>
      </div>

      <div class="p-6 space-y-5">
        <div id="receipt-paper" class="p-6 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl space-y-4 text-xs font-sans">
          
          <div class="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <div>
              <div class="font-black text-base uppercase text-slate-900 dark:text-white">HOSTELHUB RESIDENTIAL CAMPUS</div>
              <div class="text-[11px] text-slate-400">Official Student Housing & Mess Fee Receipt</div>
            </div>
            <div class="text-right">
              <div class="font-bold text-emerald-600 text-sm">PAID IN FULL ✓</div>
              <div class="font-mono text-[10px] text-slate-400">${pay.receiptNumber}</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 py-1">
            <div>
              <span class="text-[10px] text-slate-400 font-bold uppercase">Student Details</span>
              <div class="font-bold text-slate-900 dark:text-white">${pay.studentName}</div>
              <div class="text-slate-500">Roll No: ${pay.rollNo}</div>
              <div class="text-slate-500">Room: ${pay.roomNumber}</div>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-slate-400 font-bold uppercase">Transaction Info</span>
              <div class="font-mono font-bold">${pay.transactionId}</div>
              <div class="text-slate-500">Date: ${pay.paidDate || '2026-08-26'}</div>
              <div class="text-slate-500">${pay.method}</div>
            </div>
          </div>

          <table class="w-full text-left border-t border-b border-slate-100 dark:border-slate-800 py-2">
            <thead>
              <tr class="text-[10px] uppercase text-slate-400">
                <th class="py-1">Fee Head</th>
                <th class="py-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 dark:divide-slate-800">
              <tr>
                <td class="py-1.5 font-medium">Room Rent (${pay.semester})</td>
                <td class="py-1.5 text-right font-bold">$${pay.structure?.roomRent || 6000}</td>
              </tr>
              <tr>
                <td class="py-1.5 font-medium">Mess & Food Service</td>
                <td class="py-1.5 text-right font-bold">$${pay.structure?.messCharges || 4000}</td>
              </tr>
              <tr>
                <td class="py-1.5 font-medium">Hostel Caution & Maintenance</td>
                <td class="py-1.5 text-right font-bold">$${(pay.structure?.cautionDeposit || 1000) + (pay.structure?.maintenanceFee || 1000)}</td>
              </tr>
            </tbody>
          </table>

          <div class="flex items-center justify-between pt-1">
            <span class="font-bold text-slate-700 dark:text-slate-300">Total Paid:</span>
            <span class="text-lg font-black text-slate-900 dark:text-white">$${pay.paidAmount}.00</span>
          </div>

        </div>

        <div class="flex items-center justify-between">
          <button type="button" onclick="window.app.closeModal('modal-payment')" class="px-4 py-2 text-xs font-semibold text-slate-600">
            Close
          </button>
          <button type="button" onclick="window.print()" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-sm flex items-center gap-2">
            🖨️ Print Fee Receipt / PDF
          </button>
        </div>
      </div>
    `;

    window.app.openModal('modal-payment');
  }

  openRecordOfflineModal() {
    const students = window.store.getStudents();
    const modalContent = document.getElementById('payment-modal-content');

    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <h3 class="text-base font-bold text-slate-900 dark:text-white">Record Offline Desk Payment</h3>
        <button onclick="window.app.closeModal('modal-payment')" class="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">&times;</button>
      </div>

      <form onsubmit="window.payments.handleRecordOfflineSubmit(event)" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Select Student</label>
          <select id="offline-student" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
            ${students.map(s => `<option value="${s.id}">${s.name} (${s.rollNo}) - Pending: $${s.pendingFees || 0}</option>`).join('')}
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Amount Collected ($)</label>
            <input type="number" id="offline-amount" required value="5000" min="100" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Payment Mode</label>
            <select id="offline-mode" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              <option value="Cash at Warden Office">Cash at Warden Office</option>
              <option value="Demand Draft / Cheque">Demand Draft / Cheque</option>
              <option value="POS Card Swipe">POS Card Swipe</option>
            </select>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-payment')" class="px-4 py-2 text-xs font-semibold text-slate-600">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm">
            Save Payment & Issue Receipt
          </button>
        </div>
      </form>
    `;

    window.app.openModal('modal-payment');
  }

  handleRecordOfflineSubmit(e) {
    e.preventDefault();
    const studentId = document.getElementById('offline-student').value;
    const amount = parseFloat(document.getElementById('offline-amount').value);
    const mode = document.getElementById('offline-mode').value;

    const student = window.store.getStudentById(studentId);
    if (!student) return;

    const newPay = {
      id: 'PAY-' + Math.floor(9000 + Math.random() * 1000),
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo,
      roomNumber: student.roomAssigned || 'A-101',
      semester: 'Semester 5 (Fall 2026)',
      structure: {
        roomRent: amount * 0.6,
        messCharges: amount * 0.4,
        cautionDeposit: 0,
        maintenanceFee: 0,
        total: amount
      },
      paidAmount: amount,
      pendingAmount: Math.max(0, (student.pendingFees || 12000) - amount),
      status: (student.pendingFees || 12000) - amount <= 0 ? 'Paid' : 'Partial',
      dueDate: '2026-08-30',
      paidDate: new Date().toISOString().split('T')[0],
      method: mode,
      transactionId: 'RCPT-' + Date.now(),
      receiptNumber: 'REC-2026-' + Math.floor(1000 + Math.random() * 9000)
    };

    window.store.addPayment(newPay);
    window.app.closeModal('modal-payment');
    window.app.playAudio('success');
    window.app.showToast(`Offline payment of $${amount} recorded for ${student.name}`, 'success');
    this.render();
  }
}

// Global Payments Module
window.payments = new PaymentsModule();
