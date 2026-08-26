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
    // Check URL hash or default to dashboard
    const hash = window.location.hash.replace('#', '') || 'dashboard';
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
        // Upbeat double chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'resolve') {
        // High resolve ding
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(1046.50, now + 0.16); // C6
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'warning') {
        // Warning buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        // Subtle soft pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.06);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch (e) {
      // Audio fallback silent
    }
  }

  toggleAudioMute() {
    this.isAudioMuted = !this.isAudioMuted;
    localStorage.setItem('hostelhub_audio_muted', this.isAudioMuted);
    this.showToast(this.isAudioMuted ? 'Sound effects muted' : 'Sound effects enabled', 'info');
  }

  // --- Dark Mode Theme Manager ---
  initTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    this.updateThemeButtonIcon();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('hostelhub_dark_mode', this.isDarkMode);
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      this.showToast('Switched to Cyber Slate Dark Mode', 'info');
    } else {
      document.body.classList.remove('dark-theme');
      this.showToast('Switched to Clean Light Mode', 'info');
    }
    this.updateThemeButtonIcon();
    this.playAudio('pop');
  }

  updateThemeButtonIcon() {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.innerHTML = this.isDarkMode ? `
        <svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      ` : `
        <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
        </svg>
      `;
    }
  }

  // --- Keyboard Shortcuts & Global Event Listeners ---
  initEventListeners() {
    document.addEventListener('keydown', (e) => {
      // Escape closes modals, dropdowns & drawers
      if (e.key === 'Escape') {
        this.closeAllModals();
        this.closeGuestProfileDrawer();
        this.closeNotificationsDropdown();
        this.closeCommandPalette();
      }

      // Command Palette Trigger: Ctrl+K, Cmd+K, or '/' (when not focused in an input)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCommandPalette();
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        this.openCommandPalette();
      }

      // Command Palette Arrow Key Navigation
      const palette = document.getElementById('command-palette-modal');
      if (palette && !palette.classList.contains('modal-hidden')) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.navigateCommandPalette(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.navigateCommandPalette(-1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSelectedCommand();
        }
      }
    });

    // Close notifications dropdown on click outside
    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('notification-dropdown');
      const btn = document.getElementById('btn-notifications');
      if (dropdown && !dropdown.classList.contains('hidden')) {
        if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
          this.closeNotificationsDropdown();
        }
      }
    });
  }

  // --- Notification Bell Popover Controller ---
  toggleNotificationsDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;

    const isHidden = dropdown.classList.contains('hidden');
    if (isHidden) {
      this.renderNotificationsList();
      dropdown.classList.remove('hidden');
      this.playAudio('pop');
    } else {
      this.closeNotificationsDropdown();
    }
  }

  closeNotificationsDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
  }

  updateBellBadge() {
    const activeAlerts = window.store.getAlerts().filter(a => !a.resolved);
    const badge = document.getElementById('bell-badge');
    if (badge) {
      if (activeAlerts.length > 0) {
        badge.textContent = activeAlerts.length;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }
  }

  renderNotificationsList() {
    const container = document.getElementById('notif-items-container');
    const countBadge = document.getElementById('notif-count-badge');
    if (!container) return;

    const alerts = window.store.getAlerts().filter(a => !a.resolved);
    this.updateBellBadge();

    if (countBadge) {
      countBadge.textContent = `${alerts.length} Pending`;
    }

    if (alerts.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400 text-xs">
          <div class="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            ✓
          </div>
          <p class="font-bold text-slate-700">All alerts resolved!</p>
          <span class="text-[11px] text-slate-400 mt-0.5 block">Hostel operations running smoothly.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = alerts.map(alert => `
      <div class="notif-item p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
        <div class="flex items-start gap-2.5">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
            alert.priority === 'high' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' :
            alert.priority === 'medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 
            'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
          }">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              ${alert.type === 'maintenance' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>' :
                alert.type === 'checkin' ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>' :
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'}
            </svg>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-slate-900 dark:text-white">${alert.title}</span>
              <span class="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                alert.priority === 'high' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30'
              }">${alert.priority}</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">${alert.description}</p>
            <div class="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
              <span>🕒 ${alert.timestamp}</span>
              ${alert.roomId ? `<span class="font-semibold text-slate-600 dark:text-slate-300">Unit: ${alert.roomId}</span>` : ''}
            </div>
          </div>
        </div>

        <div class="flex flex-col items-end gap-1.5 shrink-0">
          <button 
            onclick="window.app.resolveAlertFromDropdown('${alert.id}', event)"
            class="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded text-[11px] font-bold transition-all flex items-center gap-1">
            ✓ Resolve
          </button>
          ${alert.roomId ? `
            <button 
              onclick="window.app.closeNotificationsDropdown(); window.app.navigate('rooms', { roomFilter: '${alert.roomId}' })"
              class="text-[10px] text-teal-600 dark:text-teal-400 hover:underline font-medium">
              View Unit
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  resolveAlertFromDropdown(alertId, e) {
    if (e) e.stopPropagation();
    window.store.resolveAlert(alertId);
    this.playAudio('resolve');
    this.showToast('Urgent alert resolved', 'success');
    this.renderNotificationsList();
    this.updateBellBadge();
    if (this.currentView === 'dashboard' && window.dashboard) {
      window.dashboard.render();
    }
  }

  resolveAllAlerts() {
    const alerts = window.store.getAlerts().filter(a => !a.resolved);
    alerts.forEach(a => window.store.resolveAlert(a.id));
    this.playAudio('resolve');
    this.showToast('All urgent alerts marked as resolved', 'success');
    this.renderNotificationsList();
    this.updateBellBadge();
    if (this.currentView === 'dashboard' && window.dashboard) {
      window.dashboard.render();
    }
  }

  // --- Command Palette Spotlight Controller ---
  openCommandPalette() {
    const palette = document.getElementById('command-palette-modal');
    if (!palette) return;

    palette.classList.remove('modal-hidden');
    const input = document.getElementById('command-palette-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    this.handleCommandSearch('');
    this.playAudio('pop');
  }

  closeCommandPalette() {
    const palette = document.getElementById('command-palette-modal');
    if (palette) palette.classList.add('modal-hidden');
  }

  handleCommandSearch(query) {
    const q = query.toLowerCase().trim();
    const rooms = window.store.getRooms();
    const guests = window.store.getGuests();

    const commands = [
      // Navigation
      { type: 'Navigation', icon: '📊', title: 'Go to Overview Dashboard', action: () => this.navigate('dashboard') },
      { type: 'Navigation', icon: '🛏️', title: 'Go to Room Management', action: () => this.navigate('rooms') },
      { type: 'Navigation', icon: '📅', title: 'Go to Booking Calendar Gantt', action: () => this.navigate('calendar') },
      { type: 'Navigation', icon: '👥', title: 'Go to Guest Directory CRM', action: () => this.navigate('guests') },
      { type: 'Navigation', icon: '📈', title: 'Go to Financial Analytics', action: () => this.navigate('analytics') },
      { type: 'Navigation', icon: '⚙️', title: 'Go to Settings', action: () => this.navigate('settings') },

      // Quick Actions
      { type: 'Quick Action', icon: '➕', title: 'Create New Reservation', action: () => this.openReservationModal() },
      { type: 'Quick Action', icon: '⚡', title: 'Walk-In Quick Check-In', action: () => this.openWalkInModal() },
      { type: 'Quick Action', icon: '🛠️', title: 'Block Room for Maintenance', action: () => this.openMaintenanceModal() },
      { type: 'Quick Action', icon: '🧾', title: 'Generate Guest Folio / Invoice', action: () => this.openInvoiceModal() },
      { type: 'Quick Action', icon: '📤', title: 'Export Guest Directory to CSV', action: () => window.guests && window.guests.exportGuestsCSV() },
      { type: 'Quick Action', icon: '🌙', title: 'Toggle Light / Dark Mode', action: () => this.toggleTheme() },
      { type: 'Quick Action', icon: '🔊', title: 'Toggle Sound Effects Mute', action: () => this.toggleAudioMute() },
      { type: 'Quick Action', icon: '🔄', title: 'Reset Demo Data to Defaults', action: () => this.resetAllDemoData() },
    ];

    // Add matching rooms
    rooms.forEach(r => {
      commands.push({
        type: 'Rooms',
        icon: '🛏️',
        title: `Room ${r.number} (${r.type} - Floor ${r.floor}) • ${r.status}`,
        action: () => this.navigate('rooms', { roomFilter: r.number })
      });
    });

    // Add matching guests
    guests.forEach(g => {
      commands.push({
        type: 'Guests',
        icon: '👤',
        title: `Guest: ${g.name} (${g.loyaltyTier} - ${g.email})`,
        action: () => {
          this.navigate('guests');
          this.openGuestProfileDrawer(g.id);
        }
      });
    });

    this.filteredCommands = q ? commands.filter(c => 
      c.title.toLowerCase().includes(q) || c.type.toLowerCase().includes(q)
    ) : commands.slice(0, 10);

    this.selectedCommandIndex = 0;
    this.renderCommandResults();
  }

  renderCommandResults() {
    const list = document.getElementById('command-palette-results');
    if (!list) return;

    if (this.filteredCommands.length === 0) {
      list.innerHTML = `
        <div class="p-8 text-center text-slate-400 text-xs">
          No matching commands, rooms, or guest profiles found.
        </div>
      `;
      return;
    }

    list.innerHTML = this.filteredCommands.map((cmd, idx) => `
      <div 
        onclick="window.app.executeCommand(${idx})"
        class="command-item px-4 py-3 cursor-pointer flex items-center justify-between text-xs rounded-lg mx-2 my-1 ${
          idx === this.selectedCommandIndex ? 'selected' : ''
        }">
        <div class="flex items-center gap-3">
          <span class="text-base">${cmd.icon}</span>
          <div>
            <div class="font-bold text-slate-900 dark:text-white">${cmd.title}</div>
            <span class="text-[10px] text-slate-400">${cmd.type}</span>
          </div>
        </div>
        <span class="kbd-badge text-[10px]">↵ Enter</span>
      </div>
    `).join('');
  }

  navigateCommandPalette(direction) {
    if (this.filteredCommands.length === 0) return;
    this.selectedCommandIndex = (this.selectedCommandIndex + direction + this.filteredCommands.length) % this.filteredCommands.length;
    this.renderCommandResults();
  }

  executeSelectedCommand() {
    const cmd = this.filteredCommands[this.selectedCommandIndex];
    if (cmd) {
      this.closeCommandPalette();
      cmd.action();
      this.playAudio('pop');
    }
  }

  executeCommand(idx) {
    const cmd = this.filteredCommands[idx];
    if (cmd) {
      this.closeCommandPalette();
      cmd.action();
      this.playAudio('pop');
    }
  }

  // --- View Routing ---
  navigate(viewName, params = {}) {
    this.currentView = viewName;
    window.location.hash = viewName;
    this.closeNotificationsDropdown();

    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Hide all views
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.add('hidden');
    });

    // Show target view
    const targetPanel = document.getElementById(`view-${viewName}`);
    if (targetPanel) {
      targetPanel.classList.remove('hidden');
    }

    // Initialize/refresh corresponding view module
    if (viewName === 'dashboard' && window.dashboard) {
      window.dashboard.init();
    } else if (viewName === 'rooms' && window.rooms) {
      window.rooms.init();
      if (params.roomFilter) window.rooms.setFilters(params);
    } else if (viewName === 'calendar' && window.calendar) {
      window.calendar.init();
    } else if (viewName === 'guests' && window.guests) {
      window.guests.init();
    } else if (viewName === 'analytics') {
      this.renderAnalyticsView();
    } else if (viewName === 'settings') {
      this.renderSettingsView();
    }

    this.updateBellBadge();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Toast Notifications ---
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const iconSvg = type === 'success' ? `
      <svg class="w-5 h-5 shrink-0 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ` : type === 'error' ? `
      <svg class="w-5 h-5 shrink-0 text-rose-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ` : `
      <svg class="w-5 h-5 shrink-0 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    `;

    toast.innerHTML = `
      ${iconSvg}
      <span class="flex-1">${message}</span>
      <button onclick="this.parentElement.remove()" class="text-white/70 hover:text-white text-base leading-none">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- Modal Helpers ---
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('modal-hidden');
      this.playAudio('pop');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('modal-hidden');
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal-wrapper').forEach(m => m.classList.add('modal-hidden'));
  }

  // --- New Reservation Modal ---
  openReservationModal(prefill = {}) {
    const guests = window.store.getGuests();
    const rooms = window.store.getRooms();

    const todayStr = '2026-08-26';
    const tomorrow = new Date(2026, 7, 28);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const checkInVal = prefill.checkIn || todayStr;
    const checkOutVal = prefill.checkOut || tomorrowStr;

    const modalContent = document.getElementById('reservation-modal-content');
    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">New Reservation</h3>
            <p class="text-xs text-slate-400">Create booking and assign room/bed</p>
          </div>
        </div>
        <button onclick="window.app.closeModal('modal-reservation')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold p-1">&times;</button>
      </div>

      <form id="new-reservation-form" onsubmit="window.app.handleCreateReservation(event)" class="p-6 space-y-4">
        
        <!-- Guest Selection or Quick Name -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Guest Record</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <select id="res-guest-select" onchange="window.app.handleGuestSelectChange(this.value)" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500">
                <option value="new">+ Quick Add New Guest</option>
                ${guests.map(g => `
                  <option value="${g.id}" ${prefill.guestId === g.id ? 'selected' : ''}>
                    ${g.name} (${g.loyaltyTier} - ${g.email})
                  </option>
                `).join('')}
              </select>
            </div>

            <div>
              <input 
                type="text" 
                id="res-guest-name" 
                placeholder="Full Guest Name" 
                required 
                class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" 
              />
            </div>
          </div>
        </div>

        <!-- Room / Bed Selection -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Room / Bed</label>
            <select id="res-room-select" onchange="window.app.recalculateReservationTotal()" required class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500">
              ${rooms.map(r => `
                <option value="${r.id}" data-rate="${r.rate}" ${prefill.roomId === r.id ? 'selected' : ''}>
                  ${r.number} - ${r.type} ($${r.rate}/night, ${r.status})
                </option>
              `).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Booking Source</label>
            <select id="res-source" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500">
              <option value="Direct Website">Direct Website</option>
              <option value="Walk-In">Front Desk Walk-In</option>
              <option value="Hostelworld">Hostelworld</option>
              <option value="Booking.com">Booking.com</option>
              <option value="Airbnb">Airbnb</option>
            </select>
          </div>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Check-In Date</label>
            <input 
              type="date" 
              id="res-checkin" 
              value="${checkInVal}" 
              onchange="window.app.recalculateReservationTotal()"
              required 
              class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" 
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Check-Out Date</label>
            <input 
              type="date" 
              id="res-checkout" 
              value="${checkOutVal}" 
              onchange="window.app.recalculateReservationTotal()"
              required 
              class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" 
            />
          </div>
        </div>

        <!-- Add-ons -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Hostel Add-ons & Services</label>
          <div class="grid grid-cols-3 gap-2">
            <label class="flex items-center gap-2 p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <input type="checkbox" id="addon-breakfast" onchange="window.app.recalculateReservationTotal()" class="rounded text-teal-600 focus:ring-teal-500" />
              <span>🍳 Breakfast ($8/day)</span>
            </label>
            <label class="flex items-center gap-2 p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <input type="checkbox" id="addon-towel" onchange="window.app.recalculateReservationTotal()" class="rounded text-teal-600 focus:ring-teal-500" />
              <span>🧺 Towel ($4)</span>
            </label>
            <label class="flex items-center gap-2 p-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">
              <input type="checkbox" id="addon-shuttle" onchange="window.app.recalculateReservationTotal()" class="rounded text-teal-600 focus:ring-teal-500" />
              <span>🚐 Shuttle ($20)</span>
            </label>
          </div>
        </div>

        <!-- Payment & Pricing Calculation Box -->
        <div class="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span id="calc-nights-label">Rate: 2 Nights @ $28/nt</span>
            <span class="font-bold text-slate-800 dark:text-slate-200" id="calc-room-subtotal">$56.00</span>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Add-ons & Extras:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200" id="calc-addons-subtotal">$0.00</span>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Taxes & Tourism Fee (10%):</span>
            <span class="font-bold text-slate-800 dark:text-slate-200" id="calc-tax-subtotal">$5.60</span>
          </div>
          <div class="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span class="text-sm font-black text-slate-900 dark:text-white">Total Price:</span>
            <span class="text-lg font-black text-teal-600 dark:text-teal-400" id="calc-total-price">$61.60</span>
          </div>
        </div>

        <!-- Payment Status -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Payment Status</label>
            <select id="res-payment-status" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500">
              <option value="Paid">Paid in Full</option>
              <option value="Deposit Paid">Deposit Paid (50%)</option>
              <option value="Pay on Arrival">Pay on Arrival</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Initial Booking State</label>
            <select id="res-booking-status" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500">
              <option value="Checked In">Check In Immediately (In-House)</option>
              <option value="Confirmed" selected>Confirmed (Upcoming)</option>
              <option value="Pending">Pending Confirmation</option>
            </select>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-reservation')" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-lg shadow-sm font-bold text-xs transition-all shadow-teal-600/20">
            Confirm & Save Booking
          </button>
        </div>

      </form>
    `;

    this.openModal('modal-reservation');
    
    // Trigger initial calculation
    if (prefill.guestId) {
      const g = guests.find(guest => guest.id === prefill.guestId);
      if (g) document.getElementById('res-guest-name').value = g.name;
    }
    this.recalculateReservationTotal();
  }

  handleGuestSelectChange(val) {
    const nameInput = document.getElementById('res-guest-name');
    if (val === 'new') {
      nameInput.value = '';
      nameInput.focus();
    } else {
      const guest = window.store.getGuestById(val);
      if (guest) nameInput.value = guest.name;
    }
  }

  recalculateReservationTotal() {
    const roomSelect = document.getElementById('res-room-select');
    const checkinInput = document.getElementById('res-checkin');
    const checkoutInput = document.getElementById('res-checkout');
    if (!roomSelect || !checkinInput || !checkoutInput) return;

    const selectedOption = roomSelect.options[roomSelect.selectedIndex];
    const rate = parseFloat(selectedOption?.getAttribute('data-rate') || 28);

    const d1 = new Date(checkinInput.value);
    const d2 = new Date(checkoutInput.value);
    const nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) || 1);

    let addons = 0;
    if (document.getElementById('addon-breakfast')?.checked) addons += (8 * nights);
    if (document.getElementById('addon-towel')?.checked) addons += 4;
    if (document.getElementById('addon-shuttle')?.checked) addons += 20;

    const roomSubtotal = rate * nights;
    const taxes = (roomSubtotal + addons) * 0.10;
    const total = roomSubtotal + addons + taxes;

    document.getElementById('calc-nights-label').textContent = `Rate: ${nights} Night(s) @ $${rate}/nt`;
    document.getElementById('calc-room-subtotal').textContent = `$${roomSubtotal.toFixed(2)}`;
    document.getElementById('calc-addons-subtotal').textContent = `$${addons.toFixed(2)}`;
    document.getElementById('calc-tax-subtotal').textContent = `$${taxes.toFixed(2)}`;
    document.getElementById('calc-total-price').textContent = `$${total.toFixed(2)}`;
  }

  handleCreateReservation(e) {
    e.preventDefault();
    const guestSelect = document.getElementById('res-guest-select').value;
    const guestName = document.getElementById('res-guest-name').value.trim();
    const roomId = document.getElementById('res-room-select').value;
    const checkIn = document.getElementById('res-checkin').value;
    const checkOut = document.getElementById('res-checkout').value;
    const source = document.getElementById('res-source').value;
    const paymentStatus = document.getElementById('res-payment-status').value;
    const bookingStatus = document.getElementById('res-booking-status').value;

    const rooms = window.store.getRooms();
    const room = rooms.find(r => r.id === roomId);

    let guestId = guestSelect !== 'new' ? guestSelect : null;
    if (!guestId) {
      // Create new guest
      const newGuest = window.store.addGuest({
        id: 'G-' + Math.floor(1000 + Math.random() * 9000),
        name: guestName,
        email: `${guestName.toLowerCase().replace(/\s+/g, '.')}@guest.com`,
        phone: '+1 (555) 019-' + Math.floor(1000 + Math.random() * 9000),
        nationality: 'International',
        countryCode: 'UN',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        loyaltyTier: 'Silver',
        loyaltyPoints: 100,
        totalStays: 1,
        lifetimeSpend: 60,
        lastStay: checkIn,
        currentStatus: bookingStatus === 'Checked In' ? 'In-House' : 'Reserved',
        roomAssigned: roomId,
        preferences: { bed: 'Standard', dietary: 'Standard', notes: 'First-time hostel guest' },
        emergencyContact: 'Not provided'
      });
      guestId = newGuest.id;
    }

    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const nights = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) || 1);
    const rate = room ? room.rate : 28;
    const total = rate * nights * 1.1;

    const newBooking = {
      id: 'BK-' + Math.floor(8000 + Math.random() * 2000),
      guestId,
      guestName,
      roomId,
      roomNumber: room ? room.number : roomId,
      roomType: room ? room.type : 'Standard',
      checkIn,
      checkOut,
      status: bookingStatus,
      guestsCount: 1,
      nightlyRate: rate,
      totalNights: nights,
      totalPrice: Math.round(total),
      paidAmount: paymentStatus === 'Paid' ? Math.round(total) : paymentStatus === 'Deposit Paid' ? Math.round(total / 2) : 0,
      paymentStatus,
      source
    };

    window.store.addBooking(newBooking);
    this.closeModal('modal-reservation');
    this.playAudio('success');
    this.showToast(`Reservation ${newBooking.id} created successfully for ${guestName}!`, 'success');

    // Refresh active view
    this.navigate(this.currentView);
  }

  // --- Walk-In Modal ---
  openWalkInModal() {
    const availableRooms = window.store.getRooms().filter(r => r.status === 'Available');
    const modalContent = document.getElementById('walkin-modal-content');

    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            ⚡
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Walk-In Instant Check-In</h3>
            <p class="text-xs text-slate-400">Fast 60-second guest onboarding</p>
          </div>
        </div>
        <button onclick="window.app.closeModal('modal-walkin')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold p-1">&times;</button>
      </div>

      <form id="walkin-form" onsubmit="window.app.handleWalkInCheckIn(event)" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Guest Full Name</label>
          <input type="text" id="walkin-name" required placeholder="e.g. Marco Polo" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Assign Available Unit</label>
            <select id="walkin-room" required class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500">
              ${availableRooms.length === 0 ? '<option value="">No available rooms!</option>' : 
                availableRooms.map(r => `<option value="${r.id}">${r.number} - ${r.type} ($${r.rate}/nt)</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Duration (Nights)</label>
            <input type="number" id="walkin-nights" min="1" max="30" value="1" required class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Payment Collected</label>
          <select id="walkin-payment" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500">
            <option value="Cash">Cash Collected at Desk</option>
            <option value="Card Terminal">Credit/Debit Card (POS)</option>
            <option value="Contactless">Apple Pay / Contactless</option>
          </select>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-walkin')" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-bold text-xs">
            Complete Check-In & Issue Key
          </button>
        </div>
      </form>
    `;

    this.openModal('modal-walkin');
  }

  handleWalkInCheckIn(e) {
    e.preventDefault();
    const guestName = document.getElementById('walkin-name').value.trim();
    const roomId = document.getElementById('walkin-room').value;
    const nights = parseInt(document.getElementById('walkin-nights').value, 10) || 1;

    if (!roomId) {
      this.showToast('Please choose an available room', 'error');
      return;
    }

    const rooms = window.store.getRooms();
    const room = rooms.find(r => r.id === roomId);

    const todayStr = '2026-08-26';
    const outDate = new Date(2026, 7, 26 + nights).toISOString().split('T')[0];

    const newGuest = window.store.addGuest({
      id: 'G-' + Math.floor(1000 + Math.random() * 9000),
      name: guestName,
      email: `${guestName.toLowerCase().replace(/\s+/g, '.')}@walkin.com`,
      phone: '+1 (555) 019-' + Math.floor(1000 + Math.random() * 9000),
      nationality: 'Walk-In Guest',
      countryCode: 'UN',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      loyaltyTier: 'Silver',
      loyaltyPoints: 50,
      totalStays: 1,
      lifetimeSpend: room ? room.rate * nights : 30,
      lastStay: todayStr,
      currentStatus: 'In-House',
      roomAssigned: roomId,
      preferences: { bed: 'Standard', dietary: 'Standard', notes: 'Walk-in guest' }
    });

    const newBooking = {
      id: 'BK-' + Math.floor(8000 + Math.random() * 2000),
      guestId: newGuest.id,
      guestName,
      roomId,
      roomNumber: room ? room.number : roomId,
      roomType: room ? room.type : 'Standard',
      checkIn: todayStr,
      checkOut: outDate,
      status: 'Checked In',
      guestsCount: 1,
      nightlyRate: room ? room.rate : 28,
      totalNights: nights,
      totalPrice: room ? room.rate * nights : 28,
      paidAmount: room ? room.rate * nights : 28,
      paymentStatus: 'Paid',
      source: 'Walk-In'
    };

    window.store.addBooking(newBooking);
    this.closeModal('modal-walkin');
    this.playAudio('success');
    this.showToast(`Walk-in guest ${guestName} checked into Room ${room.number}!`, 'success');
    this.navigate(this.currentView);
  }

  // --- Maintenance Modal ---
  openMaintenanceModal() {
    const rooms = window.store.getRooms();
    const modalContent = document.getElementById('maintenance-modal-content');

    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            🛠️
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Block Room for Service / Repair</h3>
            <p class="text-xs text-slate-400">Log outage and notify maintenance team</p>
          </div>
        </div>
        <button onclick="window.app.closeModal('modal-maintenance')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold p-1">&times;</button>
      </div>

      <form id="maintenance-form" onsubmit="window.app.handleLogMaintenance(event)" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Unit</label>
          <select id="maint-room" required class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500">
            ${rooms.map(r => `<option value="${r.id}">${r.number} (${r.type} - Floor ${r.floor})</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Issue Summary</label>
          <input type="text" id="maint-title" required placeholder="e.g. Broken Shower Head / Plumbing repair" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Priority Level</label>
          <select id="maint-priority" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500">
            <option value="high">🔴 High Priority (Room Unavailable)</option>
            <option value="medium">🟡 Medium (Fix by end of day)</option>
            <option value="low">🔵 Low (Scheduled routine maintenance)</option>
          </select>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-maintenance')" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm font-bold text-xs">
            Block Room & Dispatch Ticket
          </button>
        </div>
      </form>
    `;

    this.openModal('modal-maintenance');
  }

  handleLogMaintenance(e) {
    e.preventDefault();
    const roomId = document.getElementById('maint-room').value;
    const title = document.getElementById('maint-title').value.trim();
    const priority = document.getElementById('maint-priority').value;

    window.store.updateRoomStatus(roomId, 'Maintenance');
    window.store.addAlert({
      id: 'ALT-' + Date.now(),
      type: 'maintenance',
      title: `Room ${roomId}: ${title}`,
      description: `Dispatched to housekeeping/facilities team with priority [${priority.toUpperCase()}].`,
      priority,
      timestamp: 'Just now',
      roomId,
      resolved: false
    });

    this.closeModal('modal-maintenance');
    this.playAudio('warning');
    this.showToast(`Room ${roomId} blocked for maintenance. Ticket created!`, 'warning');
    this.updateBellBadge();
    this.navigate(this.currentView);
  }

  // --- Invoice Modal ---
  openInvoiceModal() {
    const bookings = window.store.getBookings();
    const modalContent = document.getElementById('invoice-modal-content');

    const firstBk = bookings[0] || {};

    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
            🧾
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Guest Invoice & Folio</h3>
            <p class="text-xs text-slate-400">Print or email official hostel invoice</p>
          </div>
        </div>
        <button onclick="window.app.closeModal('modal-invoice')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold p-1">&times;</button>
      </div>

      <div class="p-6 space-y-4">
        <!-- Booking Selector -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Booking</label>
          <select id="invoice-booking-select" onchange="window.app.renderInvoiceDetails(this.value)" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500">
            ${bookings.map(b => `<option value="${b.id}">${b.id} - ${b.guestName} (Room ${b.roomNumber} • $${b.totalPrice})</option>`).join('')}
          </select>
        </div>

        <!-- Printable Invoice Container -->
        <div id="invoice-paper" class="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm space-y-4 font-sans">
          <!-- Populated by renderInvoiceDetails -->
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button type="button" onclick="window.app.closeModal('modal-invoice')" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400">
            Close
          </button>
          <button type="button" onclick="window.print()" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm font-bold text-xs flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
            </svg>
            Print Folio / PDF
          </button>
        </div>
      </div>
    `;

    this.openModal('modal-invoice');
    this.renderInvoiceDetails(firstBk.id);
  }

  renderInvoiceDetails(bookingId) {
    const booking = window.store.getBookings().find(b => b.id === bookingId);
    if (!booking) return;

    const paper = document.getElementById('invoice-paper');
    if (!paper) return;

    paper.innerHTML = `
      <div class="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded bg-teal-600 text-white flex items-center justify-center font-bold text-xs">H</div>
            <span class="font-extrabold text-base text-slate-900 dark:text-white">HostelHub Downtown</span>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">452 Traveler's Way, Central District • VAT: 994-201-92</p>
        </div>
        <div class="text-right">
          <div class="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Official Receipt</div>
          <div class="text-xs text-slate-500 dark:text-slate-400 font-mono">${booking.id}</div>
          <div class="text-[10px] text-slate-400">Date: 2026-08-26</div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 text-xs py-2">
        <div>
          <div class="text-slate-400 font-bold text-[10px] uppercase">Guest Name</div>
          <div class="font-bold text-slate-900 dark:text-white mt-0.5">${booking.guestName}</div>
          <div class="text-slate-500 dark:text-slate-400 text-[11px]">Room: ${booking.roomNumber} (${booking.roomType})</div>
        </div>
        <div class="text-right">
          <div class="text-slate-400 font-bold text-[10px] uppercase">Stay Span</div>
          <div class="font-medium text-slate-700 dark:text-slate-300 mt-0.5">${booking.checkIn} → ${booking.checkOut}</div>
          <div class="text-slate-500 dark:text-slate-400 text-[11px]">${booking.totalNights} Nights • ${booking.status}</div>
        </div>
      </div>

      <table class="w-full text-xs text-left border-t border-b border-slate-100 dark:border-slate-800 py-2">
        <thead>
          <tr class="text-slate-400 uppercase text-[10px]">
            <th class="py-1">Description</th>
            <th class="py-1 text-center">Nights</th>
            <th class="py-1 text-right">Rate</th>
            <th class="py-1 text-right">Amount</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50 dark:divide-slate-800">
          <tr>
            <td class="py-1.5 font-medium text-slate-800 dark:text-slate-200">${booking.roomType} Accommodation</td>
            <td class="py-1.5 text-center text-slate-600 dark:text-slate-400">${booking.totalNights}</td>
            <td class="py-1.5 text-right text-slate-600 dark:text-slate-400">$${booking.nightlyRate}</td>
            <td class="py-1.5 text-right font-bold text-slate-900 dark:text-white">$${booking.nightlyRate * booking.totalNights}</td>
          </tr>
          <tr>
            <td class="py-1.5 font-medium text-slate-800 dark:text-slate-200">City Tourism Tax (10%)</td>
            <td class="py-1.5 text-center text-slate-600 dark:text-slate-400">-</td>
            <td class="py-1.5 text-right text-slate-600 dark:text-slate-400">-</td>
            <td class="py-1.5 text-right font-bold text-slate-900 dark:text-white">$${Math.round(booking.totalPrice * 0.1)}</td>
          </tr>
        </tbody>
      </table>

      <div class="flex items-center justify-between pt-2">
        <div>
          <span class="badge ${booking.paymentStatus === 'Paid' ? 'badge-available' : 'badge-needs-cleaning'}">
            ● Payment: ${booking.paymentStatus}
          </span>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-500 font-bold mr-2">Grand Total:</span>
          <span class="text-base font-black text-slate-900 dark:text-white">$${booking.totalPrice}.00</span>
        </div>
      </div>
    `;
  }

  // --- Booking Details Modal ---
  openBookingDetailsModal(bookingId) {
    const booking = window.store.getBookings().find(b => b.id === bookingId);
    if (!booking) return;

    const modalContent = document.getElementById('booking-details-modal-content');
    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            📋
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Reservation ${booking.id}</h3>
            <p class="text-xs text-slate-400">${booking.guestName} • Room ${booking.roomNumber}</p>
          </div>
        </div>
        <button onclick="window.app.closeModal('modal-booking-details')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold p-1">&times;</button>
      </div>

      <div class="p-6 space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span class="text-[10px] font-bold uppercase text-slate-400">Check-In</span>
            <div class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">${booking.checkIn}</div>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span class="text-[10px] font-bold uppercase text-slate-400">Check-Out</span>
            <div class="text-sm font-bold text-slate-900 dark:text-white mt-0.5">${booking.checkOut}</div>
          </div>
        </div>

        <div class="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 text-xs">
          <div class="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Room Type:</span>
            <strong class="text-slate-900 dark:text-white">${booking.roomType} (Unit ${booking.roomNumber})</strong>
          </div>
          <div class="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Current Status:</span>
            <span class="font-bold text-teal-700 dark:text-teal-400">${booking.status}</span>
          </div>
          <div class="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Total Duration:</span>
            <strong class="text-slate-900 dark:text-white">${booking.totalNights} Night(s)</strong>
          </div>
          <div class="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Source Channel:</span>
            <strong class="text-slate-900 dark:text-white">${booking.source}</strong>
          </div>
          <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
            <span class="font-bold text-slate-700 dark:text-slate-300">Total Price:</span>
            <span class="font-black text-sm text-slate-900 dark:text-white">$${booking.totalPrice} (${booking.paymentStatus})</span>
          </div>
        </div>

        <!-- Quick Status Change Actions -->
        <div class="pt-2 flex flex-wrap items-center justify-end gap-2">
          ${booking.status !== 'Checked In' ? `
            <button onclick="window.app.updateBookingStatus('${booking.id}', 'Checked In')" class="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm">
              Check In Guest
            </button>
          ` : `
            <button onclick="window.app.updateBookingStatus('${booking.id}', 'Checked Out')" class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm">
              Check Out Guest
            </button>
          `}
          <button onclick="window.app.closeModal('modal-booking-details')" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 text-slate-700 rounded-lg text-xs font-semibold">
            Done
          </button>
        </div>
      </div>
    `;

    this.openModal('modal-booking-details');
  }

  updateBookingStatus(bookingId, status) {
    window.store.updateBookingStatus(bookingId, status);
    this.closeModal('modal-booking-details');
    this.playAudio('success');
    this.showToast(`Booking ${bookingId} updated to ${status}`, 'success');
    this.navigate(this.currentView);
  }

  // --- Guest Profile Slide-Over Drawer ---
  openGuestProfileDrawer(guestId) {
    const guest = window.store.getGuestById(guestId);
    if (!guest) return;

    const drawer = document.getElementById('guest-profile-drawer');
    const drawerContent = document.getElementById('guest-drawer-content');

    const guestBookings = window.store.getBookings().filter(b => b.guestId === guest.id);

    drawerContent.innerHTML = `
      <!-- Drawer Header with Avatar -->
      <div class="p-6 bg-slate-900 text-white relative">
        <button onclick="window.app.closeGuestProfileDrawer()" class="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        
        <div class="flex items-center gap-4">
          <img src="${guest.avatar}" alt="${guest.name}" class="w-16 h-16 rounded-full object-cover border-2 border-teal-500 shadow-md" />
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-lg font-bold">${guest.name}</h2>
              <span class="badge ${
                guest.loyaltyTier === 'Platinum' ? 'badge-platinum' :
                guest.loyaltyTier === 'Gold' ? 'badge-gold' : 'badge-silver'
              }">
                ${guest.loyaltyTier}
              </span>
            </div>
            <div class="text-xs text-slate-400 mt-0.5">${guest.email}</div>
            <div class="text-xs text-teal-400 font-medium">${guest.phone}</div>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div class="text-slate-400 text-[10px] uppercase">Loyalty Pts</div>
            <div class="text-base font-bold text-amber-400">${guest.loyaltyPoints}</div>
          </div>
          <div>
            <div class="text-slate-400 text-[10px] uppercase">Total Stays</div>
            <div class="text-base font-bold text-white">${guest.totalStays}</div>
          </div>
          <div>
            <div class="text-slate-400 text-[10px] uppercase">Lifetime Spend</div>
            <div class="text-base font-bold text-emerald-400">$${guest.lifetimeSpend}</div>
          </div>
        </div>
      </div>

      <!-- Drawer Body -->
      <div class="p-6 space-y-6 overflow-y-auto flex-1 dark:bg-slate-900">
        
        <!-- Direct Quick Communication Buttons -->
        <div class="flex items-center gap-2">
          <button onclick="window.app.simulateSendSMS('${guest.name}')" class="flex-1 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
            💬 Send SMS Notice
          </button>
          <button onclick="window.app.simulateSendEmail('${guest.email}')" class="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
            ✉️ Send Confirmation
          </button>
        </div>

        <!-- Personal & Identity -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Identification & Contact</h4>
          <div class="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-500">Nationality:</span>
              <strong class="text-slate-900 dark:text-white">${guest.nationality}</strong>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Passport / ID:</span>
              <span class="font-mono font-semibold text-slate-800 dark:text-slate-200">${guest.passportNumber || 'VERIFIED-ON-FILE'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Emergency Contact:</span>
              <span class="text-slate-800 dark:text-slate-200">${guest.emergencyContact || 'Not recorded'}</span>
            </div>
          </div>
        </div>

        <!-- Preferences & Notes -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Guest Preferences & Habits</h4>
          <div class="bg-teal-50/60 dark:bg-teal-950/30 p-3.5 rounded-xl border border-teal-100 dark:border-teal-900/40 text-xs space-y-2">
            <div class="flex items-center gap-2 text-teal-900 dark:text-teal-300">
              <span class="font-bold">Bed Preference:</span>
              <span>${guest.preferences?.bed || 'Standard'}</span>
            </div>
            <div class="flex items-center gap-2 text-teal-900 dark:text-teal-300">
              <span class="font-bold">Dietary:</span>
              <span>${guest.preferences?.dietary || 'Standard'}</span>
            </div>
            <p class="text-teal-800/80 dark:text-teal-300/80 text-[11px] pt-1 border-t border-teal-100/60 dark:border-teal-900/40 leading-relaxed italic">
              "${guest.preferences?.notes || 'No special requests noted.'}"
            </p>
          </div>
        </div>

        <!-- Stay History Timeline -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Stay History & Bookings</h4>
            <span class="text-xs text-slate-400">${guestBookings.length} Records</span>
          </div>

          <div class="space-y-2.5">
            ${guestBookings.length === 0 ? `
              <div class="text-center py-6 text-slate-400 text-xs">No active bookings recorded for this guest.</div>
            ` : guestBookings.map(bk => `
              <div class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-teal-500 transition-colors text-xs flex items-center justify-between">
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">${bk.roomType} (Room ${bk.roomNumber})</div>
                  <div class="text-[11px] text-slate-400">${bk.checkIn} to ${bk.checkOut} (${bk.totalNights}n)</div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-slate-900 dark:text-white">$${bk.totalPrice}</div>
                  <span class="text-[10px] font-semibold ${bk.status === 'Checked In' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500'}">${bk.status}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- Drawer Footer Actions -->
      <div class="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <button onclick="window.app.closeGuestProfileDrawer()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400">
          Close
        </button>
        <button onclick="window.app.closeGuestProfileDrawer(); window.app.openReservationModal({ guestId: '${guest.id}' })" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-sm">
          + Book New Stay
        </button>
      </div>
    `;

    drawer.classList.remove('drawer-hidden');
    this.playAudio('pop');
  }

  closeGuestProfileDrawer() {
    const drawer = document.getElementById('guest-profile-drawer');
    if (drawer) drawer.classList.add('drawer-hidden');
  }

  simulateSendSMS(name) {
    this.playAudio('success');
    this.showToast(`SMS sent to ${name}: "Welcome to HostelHub! Your room key and WiFi info are ready."`, 'info');
  }

  simulateSendEmail(email) {
    this.playAudio('success');
    this.showToast(`Confirmation email dispatched to ${email}`, 'success');
  }

  // --- Add Guest Modal ---
  openAddGuestModal() {
    const modalContent = document.getElementById('addguest-modal-content');
    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            👤
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Create Guest Profile</h3>
            <p class="text-xs text-slate-400">Add traveler to CRM and loyalty database</p>
          </div>
        </div>
        <button onclick="window.app.closeModal('modal-addguest')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold p-1">&times;</button>
      </div>

      <form id="addguest-form" onsubmit="window.app.handleSaveNewGuest(event)" class="p-6 space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
            <input type="text" id="newguest-name" required placeholder="Jane Doe" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nationality</label>
            <input type="text" id="newguest-nationality" required placeholder="e.g. France, Japan, USA" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
            <input type="email" id="newguest-email" required placeholder="guest@travel.com" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number</label>
            <input type="text" id="newguest-phone" required placeholder="+1 555 1234" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Loyalty Tier</label>
            <select id="newguest-tier" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500">
              <option value="Silver">Silver (Standard)</option>
              <option value="Gold">Gold (Frequent)</option>
              <option value="Platinum">Platinum (VIP)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Passport / National ID</label>
            <input type="text" id="newguest-passport" placeholder="Optional ID number" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-addguest')" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-bold text-xs">
            Save Guest Profile
          </button>
        </div>
      </form>
    `;

    this.openModal('modal-addguest');
  }

  handleSaveNewGuest(e) {
    e.preventDefault();
    const name = document.getElementById('newguest-name').value.trim();
    const nationality = document.getElementById('newguest-nationality').value.trim();
    const email = document.getElementById('newguest-email').value.trim();
    const phone = document.getElementById('newguest-phone').value.trim();
    const loyaltyTier = document.getElementById('newguest-tier').value;
    const passportNumber = document.getElementById('newguest-passport').value.trim();

    window.store.addGuest({
      id: 'G-' + Math.floor(1000 + Math.random() * 9000),
      name,
      nationality,
      email,
      phone,
      loyaltyTier,
      loyaltyPoints: loyaltyTier === 'Platinum' ? 3000 : loyaltyTier === 'Gold' ? 1500 : 500,
      totalStays: 0,
      lifetimeSpend: 0,
      lastStay: '-',
      currentStatus: 'Reserved',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      passportNumber: passportNumber || 'ID-' + Math.floor(10000 + Math.random() * 90000),
      preferences: { bed: 'Flexible', dietary: 'Standard', notes: 'Created via desk portal' }
    });

    this.closeModal('modal-addguest');
    this.playAudio('success');
    this.showToast(`Guest profile created for ${name}`, 'success');
    if (window.guests) window.guests.render();
  }

  // --- Add / Edit Room Modal ---
  openAddRoomModal() {
    const modalContent = document.getElementById('room-modal-content');
    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            🛏️
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-900 dark:text-white">Add New Hostel Unit</h3>
            <p class="text-xs text-slate-400">Configure bed, room type, and rate</p>
          </div>
        </div>
        <button onclick="window.app.closeModal('modal-room')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold p-1">&times;</button>
      </div>

      <form id="addroom-form" onsubmit="window.app.handleSaveNewRoom(event)" class="p-6 space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Unit #</label>
            <input type="text" id="newroom-number" required placeholder="e.g. 310 or 104-A" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Floor Level</label>
            <select id="newroom-floor" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500">
              <option value="1">Floor 1</option>
              <option value="2">Floor 2</option>
              <option value="3">Floor 3</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Room Category</label>
          <select id="newroom-type" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500">
            <option value="4-Bed Mixed Dorm">4-Bed Mixed Dorm</option>
            <option value="6-Bed Mixed Dorm">6-Bed Mixed Dorm</option>
            <option value="8-Bed Female Dorm">8-Bed Female Dorm</option>
            <option value="Private Deluxe">Private Deluxe</option>
            <option value="Twin Ensuite">Twin Ensuite</option>
            <option value="Penthouse Suite">Penthouse Suite</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Capacity (Pax)</label>
            <input type="number" id="newroom-capacity" min="1" max="12" value="1" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Rate / Night ($)</label>
            <input type="number" id="newroom-rate" min="10" max="500" value="30" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-room')" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm font-bold text-xs">
            Create Unit
          </button>
        </div>
      </form>
    `;

    this.openModal('modal-room');
  }

  handleSaveNewRoom(e) {
    e.preventDefault();
    const number = document.getElementById('newroom-number').value.trim();
    const floor = parseInt(document.getElementById('newroom-floor').value, 10);
    const type = document.getElementById('newroom-type').value;
    const capacity = parseInt(document.getElementById('newroom-capacity').value, 10);
    const rate = parseFloat(document.getElementById('newroom-rate').value);

    window.store.addRoom({
      id: number,
      number,
      floor,
      type,
      capacity,
      bedType: capacity === 1 ? 'Single Bunk' : 'Double / Ensuite',
      rate,
      status: 'Available',
      condition: 'Clean',
      currentGuest: null
    });

    this.closeModal('modal-room');
    this.playAudio('success');
    this.showToast(`Unit ${number} successfully added to inventory`, 'success');
    if (window.rooms) window.rooms.render();
  }

  openEditRoomModal(roomId) {
    const room = window.store.getRooms().find(r => r.id === roomId);
    if (!room) return;

    const modalContent = document.getElementById('room-modal-content');
    modalContent.innerHTML = `
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/50">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Edit Unit ${room.number}</h3>
          <p class="text-xs text-slate-400">Update rates and housekeeping status</p>
        </div>
        <button onclick="window.app.closeModal('modal-room')" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xl font-bold p-1">&times;</button>
      </div>

      <form onsubmit="window.app.handleUpdateRoom(event, '${room.id}')" class="p-6 space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nightly Rate ($)</label>
            <input type="number" id="editroom-rate" value="${room.rate}" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5" />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Status</label>
            <select id="editroom-status" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
              <option value="Available" ${room.status === 'Available' ? 'selected' : ''}>Available</option>
              <option value="Occupied" ${room.status === 'Occupied' ? 'selected' : ''}>Occupied</option>
              <option value="Maintenance" ${room.status === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Housekeeping State</label>
          <select id="editroom-condition" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
            <option value="Clean" ${room.condition === 'Clean' ? 'selected' : ''}>Clean & Inspected</option>
            <option value="Needs Cleaning" ${room.condition === 'Needs Cleaning' ? 'selected' : ''}>Needs Cleaning</option>
            <option value="In Progress" ${room.condition === 'In Progress' ? 'selected' : ''}>In Progress</option>
          </select>
        </div>

        <div class="pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
          <button type="button" onclick="window.app.closeModal('modal-room')" class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold">
            Update Unit
          </button>
        </div>
      </form>
    `;

    this.openModal('modal-room');
  }

  handleUpdateRoom(e, roomId) {
    e.preventDefault();
    const rate = parseFloat(document.getElementById('editroom-rate').value);
    const status = document.getElementById('editroom-status').value;
    const condition = document.getElementById('editroom-condition').value;

    const rooms = window.store.getRooms();
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      room.rate = rate;
      room.status = status;
      room.condition = condition;
      window.store.saveRooms(rooms);
    }

    this.closeModal('modal-room');
    this.playAudio('pop');
    this.showToast(`Unit ${roomId} settings updated`, 'info');
    if (window.rooms) window.rooms.render();
  }

  // --- Export Daily Summary Log ---
  exportDailySummary() {
    const rooms = window.store.getRooms();
    const bookings = window.store.getBookings();
    const rev = window.store.getRevenue();

    const text = `=====================================================
HOSTELHUB PMS - DAILY NIGHT AUDIT REPORT
Date: 2026-08-26 | Property: HostelHub Central
=====================================================

1. OCCUPANCY SUMMARY
- Total Units: ${rooms.length}
- Occupied Units: ${rooms.filter(r => r.status === 'Occupied').length}
- Available Units: ${rooms.filter(r => r.status === 'Available').length}
- Out-of-Service / Maintenance: ${rooms.filter(r => r.status === 'Maintenance').length}
- Occupancy Rate: ${Math.round((rooms.filter(r => r.status === 'Occupied').length / rooms.length) * 100)}%

2. FINANCIAL SNAPSHOT
- Weekly Revenue: $${rev.currentWeekTotal} (Growth: +${rev.growthPercentage}%)
- Today's Expected Room Rev: $1,680.00
- Open Folio Balances: $0.00

3. IN-HOUSE GUESTS (${bookings.filter(b => b.status === 'Checked In').length})
${bookings.filter(b => b.status === 'Checked In').map(b => `* Room ${b.roomNumber}: ${b.guestName} (${b.checkIn} to ${b.checkOut}) - ${b.paymentStatus}`).join('\n')}

=====================================================
Generated automatically by HostelHub Property Management System.
`;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HostelHub_Daily_Audit_2026-08-26.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.playAudio('success');
    this.showToast('Daily audit summary downloaded', 'success');
  }

  // --- Reset All Data ---
  resetAllDemoData() {
    if (confirm('Reset all demo data back to initial defaults?')) {
      window.store.resetToDefaults();
      this.playAudio('success');
      this.showToast('All demo data restored to initial factory defaults', 'info');
      this.navigate('dashboard');
    }
  }

  // --- Analytics & Settings View Renderers ---
  renderAnalyticsView() {
    const container = document.getElementById('view-analytics');
    const rev = window.store.getRevenue();

    container.innerHTML = `
      <div class="mb-6">
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Financial & Occupancy Analytics</h1>
        <p class="text-sm text-slate-500 mt-0.5">Historical revenue pacing, channel performance, and ADR metrics</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Average Daily Rate (ADR)</span>
          <div class="text-3xl font-black text-slate-900 mt-2">$42.80</div>
          <div class="text-xs text-emerald-600 font-semibold mt-1">+8.4% vs last month</div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">RevPAR (Per Available Room)</span>
          <div class="text-3xl font-black text-slate-900 mt-2">$33.40</div>
          <div class="text-xs text-emerald-600 font-semibold mt-1">+12.1% vs last month</div>
        </div>

        <div class="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Direct Booking Share</span>
          <div class="text-3xl font-black text-slate-900 mt-2">64%</div>
          <div class="text-xs text-teal-600 font-semibold mt-1">Saved $840 in OTA commissions</div>
        </div>
      </div>

      <!-- Channel Breakdown Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Booking Channel Performance</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Direct Website & Front Desk (64%)</span>
              <span>$7,968</span>
            </div>
            <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div class="bg-teal-600 h-full rounded-full" style="width: 64%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Hostelworld (22%)</span>
              <span>$2,739</span>
            </div>
            <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div class="bg-indigo-600 h-full rounded-full" style="width: 22%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Booking.com (10%)</span>
              <span>$1,245</span>
            </div>
            <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div class="bg-blue-500 h-full rounded-full" style="width: 10%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Airbnb (4%)</span>
              <span>$498</span>
            </div>
            <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div class="bg-rose-500 h-full rounded-full" style="width: 4%"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderSettingsView() {
    const container = document.getElementById('view-settings');
    container.innerHTML = `
      <div class="mb-6">
        <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Preferences</h1>
        <p class="text-sm text-slate-500 mt-0.5">Hostel configuration, currency, tax rates, sound effects, and database state</p>
      </div>

      <div class="max-w-2xl bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div>
          <h3 class="text-sm font-bold text-slate-900">Property Details</h3>
          <div class="grid grid-cols-2 gap-4 mt-3 text-xs">
            <div>
              <label class="block font-bold text-slate-500 mb-1">Hostel Name</label>
              <input type="text" value="HostelHub Downtown" class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium" />
            </div>
            <div>
              <label class="block font-bold text-slate-500 mb-1">Primary Currency</label>
              <select class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium">
                <option selected>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-100">
          <h3 class="text-sm font-bold text-slate-900">Sound Effects</h3>
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-slate-500">Play subtle audio chime for bookings, check-ins, and alert resolutions</span>
            <button onclick="window.app.toggleAudioMute()" class="px-3 py-1.5 rounded-lg text-xs font-bold ${this.isAudioMuted ? 'bg-slate-100 text-slate-700' : 'bg-teal-50 text-teal-700 border border-teal-200'}">
              ${this.isAudioMuted ? '🔇 Audio Muted' : '🔊 Audio Active'}
            </button>
          </div>
        </div>

        <div class="pt-6 border-t border-slate-100">
          <h3 class="text-sm font-bold text-slate-900">Demo Data Reset</h3>
          <p class="text-xs text-slate-400 mt-1">Restore all rooms, bookings, guests, and operational metrics back to original demo values.</p>
          <button onclick="window.app.resetAllDemoData()" class="mt-3 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors">
            Reset Demo State
          </button>
        </div>
      </div>
    `;
  }
}

// Global application bootstrap
window.app = new HostelHubApp();

document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
