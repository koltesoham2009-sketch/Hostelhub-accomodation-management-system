/**
 * HostelHub - Enhanced Application Controller
 * Handles Navigation Routing, Interactive Notification Dropdown, Command Palette (Ctrl+K),
 * Audio Feedback Engine, Dark Theme, Modals, Drawers, and State Synchronization.
 */

class HostelHubApp {
  constructor() {
    this.currentView = 'dashboard';
    this.isDarkMode = localStorage.getItem('hostelhub_dark_mode') === 'true';
    this.isAudioMuted = localStorage.getItem('hostelhub_audio_muted') === 'true';
    this.audioCtx = null;
    this.selectedCommandIndex = 0;
    this.filteredCommands = [];
    
    this.initTheme();
    this.initEventListeners();
  }

  init() {
    if (window.auth) {
      window.auth.updateAppForRole();
    }
    const hash = window.location.hash.replace('#', '') || (window.auth && window.auth.isStudent() ? 'student-home' : 'dashboard');
    this.navigate(hash);
    this.updateBellBadge();
  }

  // --- Audio Synthesis Feedback (Zero External Files) ---
  initAudio() {
    if (!this.audioCtx && typeof window.AudioContext !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playAudio(type = 'pop') {
    if (this.isAudioMuted) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'success' || type === 'chime') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'resolve') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        osc.frequency.setValueAtTime(1046.50, now + 0.16);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'warning') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch (e) {}
  }

  toggleAudioMute() {
    this.isAudioMuted = !this.isAudioMuted;
    localStorage.setItem('hostelhub_audio_muted', this.isAudioMuted);
    this.showToast(this.isAudioMuted ? 'Sound effects muted' : 'Sound effects enabled', 'info');
  }

  // --- Dark Mode Theme Manager ---
  initTheme() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('hostelhub_dark_mode', this.isDarkMode);
    this.initTheme();
    this.playAudio('pop');
    this.showToast(this.isDarkMode ? 'Switched to Dark Slate Theme' : 'Switched to Clean Light Theme', 'info');
  }

  // --- View Routing & Navigation ---
  navigate(viewId) {
    const views = ['dashboard', 'student-home', 'rooms', 'allocations', 'payments', 'complaints', 'calendar', 'guests', 'settings'];
    
    // Normalise view
    let targetView = viewId;
    if (targetView === 'student-home' || (targetView === 'dashboard' && window.auth && window.auth.isStudent())) {
      targetView = 'dashboard';
    }

    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        if (v === targetView) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    // Update Nav Sidebar styles
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('data-view') === targetView) {
        link.classList.add('bg-teal-600', 'text-white', 'font-bold');
        link.classList.remove('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
      } else {
        link.classList.remove('bg-teal-600', 'text-white', 'font-bold');
        link.classList.add('text-slate-400', 'hover:text-white', 'hover:bg-slate-800');
      }
    });

    this.currentView = targetView;
    window.location.hash = targetView;

    // Trigger target module render
    if (targetView === 'dashboard' && window.dashboard) {
      window.dashboard.render();
    } else if (targetView === 'rooms' && window.rooms) {
      window.rooms.render();
    } else if (targetView === 'allocations' && window.allocations) {
      window.allocations.render();
    } else if (targetView === 'payments' && window.payments) {
      window.payments.render();
    } else if (targetView === 'complaints' && window.complaints) {
      window.complaints.render();
    } else if (targetView === 'calendar' && window.calendar) {
      window.calendar.render();
    } else if (targetView === 'guests' && window.guests) {
      window.guests.render();
    }

    window.scrollTo(0, 0);
  }

  // --- Notification Bell Dropdown Popover ---
  toggleNotificationsDropdown(event) {
    if (event) event.stopPropagation();
    const dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;

    const isHidden = dropdown.classList.contains('hidden');
    if (isHidden) {
      this.renderNotificationsDropdown();
      dropdown.classList.remove('hidden');
      this.playAudio('pop');
    } else {
      dropdown.classList.add('hidden');
    }
  }

  closeNotificationsDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown && !dropdown.classList.contains('hidden')) {
      dropdown.classList.add('hidden');
    }
  }

  updateBellBadge() {
    const alerts = window.store.getAlerts().filter(a => !a.resolved);
    const complaints = window.store.getComplaints().filter(c => c.status !== 'Resolved');
    const totalCount = alerts.length + complaints.length;

    const badge = document.getElementById('bell-badge');
    const countBadge = document.getElementById('notif-count-badge');

    if (badge) {
      if (totalCount > 0) {
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
    if (countBadge) {
      countBadge.innerText = `${totalCount} Pending`;
    }
  }

  renderNotificationsDropdown() {
    const alerts = window.store.getAlerts().filter(a => !a.resolved);
    const complaints = window.store.getComplaints().filter(c => c.status !== 'Resolved');
    const listContainer = document.getElementById('notif-items-list');
    if (!listContainer) return;

    const allItems = [
      ...alerts.map(a => ({ ...a, itemType: 'alert' })),
      ...complaints.map(c => ({ id: c.id, type: c.category, title: c.title, detail: `${c.roomNumber} (${c.studentName})`, time: c.createdAt, itemType: 'complaint' }))
    ];

    if (allItems.length === 0) {
      listContainer.innerHTML = `
        <div class="p-8 text-center text-slate-400">
          <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold text-lg">✓</div>
          <div class="text-xs font-bold text-slate-700 dark:text-slate-300">All clear! No pending alerts</div>
          <p class="text-[10px] text-slate-400 mt-0.5">Facility tickets and room maintenance are up to date.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = allItems.map(item => `
      <div id="notif-row-${item.id}" class="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
            item.type === 'Maintenance' || item.type === 'Plumbing' || item.type === 'Electrical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' :
            'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
          }">
            ${item.type === 'Electrical' ? '⚡' : item.type === 'Plumbing' ? '🚿' : '⚠️'}
          </div>
          <div>
            <div class="text-xs font-bold text-slate-900 dark:text-white leading-snug">${item.title}</div>
            <div class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">${item.detail || item.unit}</div>
            <span class="text-[10px] text-slate-400 font-mono mt-1 block">${item.time || 'Today'}</span>
          </div>
        </div>

        <div class="flex flex-col items-end gap-1.5 shrink-0">
          <button onclick="window.app.resolveNotificationItem('${item.id}', '${item.itemType}')" class="px-2 py-1 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-700 dark:text-teal-300 rounded text-[10px] font-bold transition-colors">
            Resolve
          </button>
        </div>
      </div>
    `).join('');
  }

  resolveNotificationItem(id, itemType) {
    if (itemType === 'complaint') {
      window.store.updateComplaintStatus(id, 'Resolved', 'Resolved via quick notification popover');
    } else {
      window.store.resolveAlert(id);
    }
    this.playAudio('resolve');
    this.showToast('Item resolved and closed', 'success');
    this.updateBellBadge();
    this.renderNotificationsDropdown();
    if (window.dashboard) window.dashboard.render();
  }

  resolveAllNotifications() {
    window.store.getAlerts().forEach(a => window.store.resolveAlert(a.id));
    window.store.getComplaints().forEach(c => window.store.updateComplaintStatus(c.id, 'Resolved', 'Bulk resolved'));
    this.playAudio('resolve');
    this.showToast('All notifications resolved', 'success');
    this.updateBellBadge();
    this.renderNotificationsDropdown();
    if (window.dashboard) window.dashboard.render();
  }

  // --- Command Palette (Ctrl+K) ---
  openCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    const input = document.getElementById('command-palette-input');
    if (!modal || !input) return;

    modal.classList.remove('hidden');
    input.value = '';
    this.searchCommands('');
    setTimeout(() => input.focus(), 50);
  }

  closeCommandPalette() {
    const modal = document.getElementById('command-palette-modal');
    if (modal) modal.classList.add('hidden');
  }

  searchCommands(query) {
    const q = query.toLowerCase().trim();
    const rooms = window.store.getRooms();
    const students = window.store.getStudents();

    const staticCommands = [
      { category: 'Navigation', title: 'Go to Overview Dashboard', subtitle: 'Building Occupancy & Metrics', action: () => this.navigate('dashboard') },
      { category: 'Navigation', title: 'Room Allocation Management', subtitle: 'Bed assignments & approval queue', action: () => this.navigate('allocations') },
      { category: 'Navigation', title: 'Hostel Fee & Payment Management', subtitle: 'Student dues & receipts', action: () => this.navigate('payments') },
      { category: 'Navigation', title: 'Complaint & Grievance Helpdesk', subtitle: 'Maintenance repair tickets', action: () => this.navigate('complaints') },
      { category: 'Navigation', title: 'Room Inventory & Floor Matrix', subtitle: 'View all hostel units', action: () => this.navigate('rooms') },
      { category: 'Actions', title: '+ Apply for Room Allotment', subtitle: 'Submit new student residency form', action: () => window.allocations.openApplyModal() },
      { category: 'Actions', title: '+ Lodge Maintenance Complaint', subtitle: 'Report electrical/plumbing issues', action: () => window.complaints.openNewComplaintModal() },
      { category: 'Actions', title: '💳 Pay Hostel Dues Online', subtitle: 'Simulate UPI / Card payment checkout', action: () => window.payments.openOnlineCheckoutModal() },
      { category: 'Account', title: '⇄ Switch Role / User Portal', subtitle: 'Toggle between Warden and Student', action: () => window.auth.openAuthModal('switch') },
      { category: 'Account', title: '☀️ / 🌙 Toggle Light / Dark Theme', subtitle: 'Switch color theme', action: () => this.toggleDarkMode() }
    ];

    // Add dynamic rooms
    rooms.forEach(r => {
      staticCommands.push({
        category: 'Hostel Units',
        title: `Room ${r.number} (${r.type})`,
        subtitle: `${r.block} • Floor ${r.floor} • Status: ${r.status}`,
        action: () => {
          this.navigate('rooms');
          window.rooms.handleSearch(r.number);
        }
      });
    });

    // Add students
    students.forEach(s => {
      staticCommands.push({
        category: 'Resident Students',
        title: `${s.name} (${s.rollNo})`,
        subtitle: `${s.department} • Room: ${s.roomAssigned || 'Pending'}`,
        action: () => {
          this.navigate('allocations');
          window.allocations.handleSearch(s.name);
        }
      });
    });

    this.filteredCommands = staticCommands.filter(c => 
      !q || c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );

    this.selectedCommandIndex = 0;
    this.renderCommandResults();
  }

  renderCommandResults() {
    const list = document.getElementById('command-results-list');
    if (!list) return;

    if (this.filteredCommands.length === 0) {
      list.innerHTML = `
        <div class="p-8 text-center text-slate-400 text-xs">
          No matching views, rooms, or actions found.
        </div>
      `;
      return;
    }

    list.innerHTML = this.filteredCommands.map((cmd, idx) => `
      <div 
        onclick="window.app.executeCommand(${idx})"
        class="px-4 py-2.5 flex items-center justify-between cursor-pointer rounded-lg transition-colors ${
          idx === this.selectedCommandIndex ? 'bg-teal-500 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
        }">
        <div>
          <span class="text-[10px] font-bold uppercase tracking-wider block ${idx === this.selectedCommandIndex ? 'text-teal-100' : 'text-slate-400'}">${cmd.category}</span>
          <div class="text-xs font-bold leading-snug">${cmd.title}</div>
          <div class="text-[11px] ${idx === this.selectedCommandIndex ? 'text-teal-100' : 'text-slate-400'}">${cmd.subtitle}</div>
        </div>
        <span class="text-xs font-mono opacity-60">↵</span>
      </div>
    `).join('');
  }

  executeCommand(index) {
    const cmd = this.filteredCommands[index];
    if (cmd && cmd.action) {
      this.closeCommandPalette();
      this.playAudio('pop');
      cmd.action();
    }
  }

  // --- Modals & Toasts ---
  openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
      el.classList.remove('hidden');
      this.playAudio('pop');
    }
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
  }

  showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `p-3.5 rounded-xl shadow-lg text-xs font-bold text-white flex items-center gap-2.5 transition-all transform translate-y-2 opacity-0 ${
      type === 'success' ? 'bg-emerald-600' :
      type === 'error' ? 'bg-rose-600' :
      type === 'warning' ? 'bg-amber-600' : 'bg-slate-900'
    }`;

    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  exportDailySummary() {
    const rooms = window.store.getRooms();
    const students = window.store.getStudents();
    const payments = window.store.getPayments();
    
    let csv = 'HostelHub Daily Audit Export\n';
    csv += `Date: ${new Date().toLocaleDateString()}\n`;
    csv += `Total Rooms: ${rooms.length}\n`;
    csv += `Occupied Beds: ${rooms.filter(r=>r.status==='Occupied').length}\n`;
    csv += `Total Resident Students: ${students.length}\n\n`;
    csv += 'Student Name,Roll No,Room Assigned,Hostel Block,Fee Status,Pending Dues\n';

    students.forEach(s => {
      csv += `"${s.name}","${s.rollNo}","${s.roomAssigned || 'N/A'}","${s.hostelBlock}","${s.feeStatus}","$${s.pendingFees || 0}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `HostelHub_Audit_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    this.showToast('Night audit summary exported as CSV', 'success');
  }

  // --- Keyboard Shortcuts & Global Events ---
  initEventListeners() {
    window.addEventListener('keydown', (e) => {
      // Spotlight Shortcut (Ctrl+K or Cmd+K or /)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCommandPalette();
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        this.openCommandPalette();
      }

      // Escape dismisses dropdowns/modals
      if (e.key === 'Escape') {
        this.closeNotificationsDropdown();
        this.closeCommandPalette();
      }

      // Command palette arrow navigation
      const paletteModal = document.getElementById('command-palette-modal');
      if (paletteModal && !paletteModal.classList.contains('hidden')) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.selectedCommandIndex = Math.min(this.selectedCommandIndex + 1, this.filteredCommands.length - 1);
          this.renderCommandResults();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.selectedCommandIndex = Math.max(this.selectedCommandIndex - 1, 0);
          this.renderCommandResults();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeCommand(this.selectedCommandIndex);
        }
      }
    });

    // Close notifications on outside click
    document.addEventListener('click', (e) => {
      const notifContainer = document.getElementById('notification-center-container');
      if (notifContainer && !notifContainer.contains(e.target)) {
        this.closeNotificationsDropdown();
      }
    });
  }
}

// Instantiate global app
window.app = new HostelHubApp();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
