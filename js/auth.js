/**
 * HostelHub - Authentication & Role-Based Access Control (RBAC) Module
 * Handles Student Registration, Student Login, Admin/Warden Login, Session Management, and Role Switching.
 */

class AuthModule {
  constructor() {
    this.sessionKey = 'hostelhub_current_user';
    this.currentUser = this.loadSession();
  }

  loadSession() {
    const saved = localStorage.getItem(this.sessionKey);
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    // Default initial session: Admin (Chief Warden)
    return {
      id: 'ADM-001',
      name: 'Dr. R. K. Sharma',
      role: 'admin',
      title: 'Chief Warden',
      email: 'admin@hostelhub.edu',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
    };
  }

  saveSession(user) {
    this.currentUser = user;
    localStorage.setItem(this.sessionKey, JSON.stringify(user));
    this.updateAppForRole();
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  isStudent() {
    return this.currentUser && this.currentUser.role === 'student';
  }

  // --- Student Registration ---
  registerStudent(studentData) {
    const existing = window.store.getStudents().find(s => s.email.toLowerCase() === studentData.email.toLowerCase() || s.rollNo.toLowerCase() === studentData.rollNo.toLowerCase());
    if (existing) {
      window.app.showToast('Student with this Email or Roll Number already registered', 'error');
      return false;
    }

    const newStudent = {
      id: 'STU-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900),
      name: studentData.name,
      rollNo: studentData.rollNo,
      email: studentData.email,
      password: studentData.password || 'student123',
      phone: studentData.phone,
      department: studentData.department,
      year: studentData.year,
      gender: studentData.gender,
      guardianName: studentData.guardianName || 'Guardian',
      guardianPhone: studentData.guardianPhone || '',
      emergencyContact: studentData.emergencyContact || studentData.phone,
      address: studentData.address || 'Campus Residence',
      avatar: studentData.gender === 'Female' ? 
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' : 
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      hostelBlock: 'Pending Allotment',
      roomAssigned: null,
      bedNumber: null,
      allocationDate: null,
      feeStatus: 'Overdue',
      totalFees: 12000,
      paidFees: 0,
      pendingFees: 12000
    };

    window.store.addStudent(newStudent);
    window.app.showToast(`Registration successful! Welcome ${newStudent.name}`, 'success');

    // Auto-login as the new student
    this.loginStudent(newStudent.email, studentData.password);
    return true;
  }

  // --- Login Handler ---
  login(email, password, role = 'student') {
    if (role === 'admin') {
      if (email === 'admin@hostelhub.edu' && (password === 'admin123' || password === 'admin')) {
        this.saveSession({
          id: 'ADM-001',
          name: 'Dr. R. K. Sharma',
          role: 'admin',
          title: 'Chief Warden',
          email: 'admin@hostelhub.edu',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
        });
        window.app.showToast('Logged in as Chief Warden / Administrator', 'success');
        window.app.closeModal('modal-auth');
        window.app.navigate('dashboard');
        return true;
      } else {
        window.app.showToast('Invalid Admin Credentials (Use admin@hostelhub.edu / admin123)', 'error');
        return false;
      }
    } else {
      return this.loginStudent(email, password);
    }
  }

  loginStudent(email, password) {
    const students = window.store.getStudents();
    const student = students.find(s => s.email.toLowerCase() === email.toLowerCase());

    if (student) {
      this.saveSession({
        ...student,
        role: 'student',
        title: `Student (${student.rollNo})`
      });
      window.app.showToast(`Welcome back, ${student.name}!`, 'success');
      window.app.closeModal('modal-auth');
      window.app.navigate('student-home');
      return true;
    } else {
      window.app.showToast('No student account found with this email', 'error');
      return false;
    }
  }

  // --- Quick 1-Click Demo Logins for Fast Testing ---
  quickLoginAsAdmin() {
    this.login('admin@hostelhub.edu', 'admin123', 'admin');
  }

  quickLoginAsStudent(studentId = 'STU-2024-001') {
    const student = window.store.getStudentById(studentId) || window.store.getStudents()[0];
    if (student) {
      this.saveSession({
        ...student,
        role: 'student',
        title: `Student (${student.rollNo})`
      });
      window.app.showToast(`Switched to Student Portal (${student.name})`, 'info');
      window.app.closeModal('modal-auth');
      window.app.navigate('student-home');
    }
  }

  logout() {
    this.openAuthModal('login');
    window.app.showToast('Signed out of session', 'info');
  }

  // --- Role UI Synchronization ---
  updateAppForRole() {
    const user = this.currentUser;
    if (!user) return;

    // Update Top Header Role Badge
    const roleBadge = document.getElementById('header-role-badge');
    if (roleBadge) {
      if (user.role === 'admin') {
        roleBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span class="font-bold text-slate-700 dark:text-slate-300">Warden Portal</span>
        `;
      } else {
        roleBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-teal-500"></span>
          <span class="font-bold text-slate-700 dark:text-slate-300">${user.name} (${user.rollNo})</span>
        `;
      }
    }

    // Update Bottom Sidebar User Profile
    const profileWidget = document.getElementById('sidebar-user-widget');
    if (profileWidget) {
      profileWidget.innerHTML = `
        <div class="flex items-center gap-2.5">
          <div class="relative">
            <img src="${user.avatar}" alt="${user.name}" class="w-8 h-8 rounded-full object-cover border border-teal-500/50" />
            <span class="w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-emerald-500' : 'bg-teal-400'} ring-2 ring-slate-900 absolute -bottom-0.5 -right-0.5"></span>
          </div>
          <div class="truncate max-w-[110px]">
            <div class="text-xs font-bold text-white truncate">${user.name}</div>
            <div class="text-[10px] text-slate-400 font-medium truncate">${user.title || user.role}</div>
          </div>
        </div>
        <button onclick="window.auth.openAuthModal('switch')" class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors text-xs" title="Switch Role / Account">
          ⇄
        </button>
      `;
    }

    // Toggle Role-Specific Sidebar Navigation Links
    const adminNavLinks = document.querySelectorAll('.nav-admin-only');
    const studentNavLinks = document.querySelectorAll('.nav-student-only');

    if (user.role === 'admin') {
      adminNavLinks.forEach(el => el.classList.remove('hidden'));
      studentNavLinks.forEach(el => el.classList.add('hidden'));
    } else {
      adminNavLinks.forEach(el => el.classList.add('hidden'));
      studentNavLinks.forEach(el => el.classList.remove('hidden'));
    }
  }

  // --- Auth Modal Renderers ---
  openAuthModal(initialTab = 'login') {
    const modalContent = document.getElementById('auth-modal-content');
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div class="p-6 bg-slate-900 text-white rounded-t-2xl relative">
        <button onclick="window.app.closeModal('modal-auth')" class="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
        
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xl">
            🎓
          </div>
          <div>
            <h2 class="text-lg font-black tracking-tight">HostelHub Portal</h2>
            <p class="text-xs text-slate-400">Student & Administration Authentication</p>
          </div>
        </div>

        <!-- Role Quick Switch Bar -->
        <div class="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
          <span class="text-[11px] text-slate-400">1-Click Quick Demo Access:</span>
          <div class="flex items-center gap-2">
            <button onclick="window.auth.quickLoginAsAdmin()" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold shadow-sm">
              👑 Warden
            </button>
            <button onclick="window.auth.quickLoginAsStudent('STU-2024-001')" class="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-[11px] font-bold shadow-sm">
              👨‍🎓 Rohan
            </button>
            <button onclick="window.auth.quickLoginAsStudent('STU-2024-006')" class="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-bold shadow-sm">
              👩‍🎓 Ananya
            </button>
          </div>
        </div>
      </div>

      <!-- Auth Tabs: Student Login / Admin Login / Register Student -->
      <div class="p-6">
        
        <div class="flex border-b border-slate-200 dark:border-slate-800 mb-5">
          <button onclick="window.auth.switchAuthTab('student-login')" id="tab-btn-student-login" class="flex-1 pb-2.5 text-xs font-bold text-teal-600 border-b-2 border-teal-600 transition-colors">
            Student Login
          </button>
          <button onclick="window.auth.switchAuthTab('admin-login')" id="tab-btn-admin-login" class="flex-1 pb-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 border-b-2 border-transparent transition-colors">
            Admin / Warden Login
          </button>
          <button onclick="window.auth.switchAuthTab('student-register')" id="tab-btn-student-register" class="flex-1 pb-2.5 text-xs font-bold text-slate-400 hover:text-slate-600 border-b-2 border-transparent transition-colors">
            + New Student Signup
          </button>
        </div>

        <!-- Tab 1: Student Login Form -->
        <form id="form-student-login" onsubmit="window.auth.handleStudentLoginSubmit(event)" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Student Email Address</label>
            <input type="email" id="login-student-email" required value="rohan.sharma@college.edu" placeholder="e.g. rohan.sharma@college.edu" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
            <input type="password" id="login-student-pwd" required value="password123" placeholder="••••••••" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
          </div>

          <div class="pt-2 flex items-center justify-between">
            <span class="text-[11px] text-slate-400">Demo student: rohan.sharma@college.edu</span>
            <button type="submit" class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm">
              Sign In to Student Portal
            </button>
          </div>
        </form>

        <!-- Tab 2: Admin Login Form -->
        <form id="form-admin-login" onsubmit="window.auth.handleAdminLoginSubmit(event)" class="space-y-4 hidden">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Warden Admin Email</label>
            <input type="email" id="login-admin-email" required value="admin@hostelhub.edu" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Administrative Key / Password</label>
            <input type="password" id="login-admin-pwd" required value="admin123" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500" />
          </div>

          <div class="pt-2 flex items-center justify-between">
            <span class="text-[11px] text-slate-400">Demo Admin: admin@hostelhub.edu / admin123</span>
            <button type="submit" class="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow-sm">
              Sign In as Chief Warden
            </button>
          </div>
        </form>

        <!-- Tab 3: Student Registration Form -->
        <form id="form-student-register" onsubmit="window.auth.handleStudentRegisterSubmit(event)" class="space-y-3.5 hidden">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Full Student Name</label>
              <input type="text" id="reg-name" required placeholder="e.g. Siddharth Rao" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:bg-white" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Roll No / Registration ID</label>
              <input type="text" id="reg-rollno" required placeholder="e.g. 2024-CSE-105" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:bg-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Department / Branch</label>
              <select id="reg-dept" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                <option>Computer Science & Engineering</option>
                <option>Information Technology</option>
                <option>Mechanical Engineering</option>
                <option>Civil Engineering</option>
                <option>Electronics & Telecomm</option>
                <option>AI & Data Science</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Year / Semester</label>
              <select id="reg-year" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                <option>1st Year (Semester 1)</option>
                <option>2nd Year (Semester 3)</option>
                <option>3rd Year (Semester 5)</option>
                <option>4th Year (Semester 7)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address</label>
              <input type="email" id="reg-email" required placeholder="student@college.edu" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:bg-white" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Gender</label>
              <select id="reg-gender" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2">
                <option value="Male">Male (Block A)</option>
                <option value="Female">Female (Block B)</option>
                <option value="Other">Other / PG (Block C)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Phone Number</label>
              <input type="text" id="reg-phone" required placeholder="+91 98000 00000" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:bg-white" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Create Password</label>
              <input type="password" id="reg-pwd" required placeholder="Minimum 6 characters" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:bg-white" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Guardian Name</label>
              <input type="text" id="reg-guardian" placeholder="Parent / Guardian" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:bg-white" />
            </div>
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Guardian Phone</label>
              <input type="text" id="reg-guardian-phone" placeholder="Emergency contact" class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 focus:bg-white" />
            </div>
          </div>

          <div class="pt-2 flex items-center justify-end gap-3">
            <button type="submit" class="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-sm">
              Complete Student Registration & Access Portal
            </button>
          </div>
        </form>

      </div>
    `;

    window.app.openModal('modal-auth');
    if (initialTab !== 'login') {
      this.switchAuthTab(initialTab);
    }
  }

  switchAuthTab(tab) {
    const tabs = ['student-login', 'admin-login', 'student-register'];
    tabs.forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}`);
      const form = document.getElementById(`form-${t}`);
      if (btn && form) {
        if (t === tab) {
          btn.classList.add('text-teal-600', 'border-teal-600');
          btn.classList.remove('text-slate-400', 'border-transparent');
          form.classList.remove('hidden');
        } else {
          btn.classList.remove('text-teal-600', 'border-teal-600');
          btn.classList.add('text-slate-400', 'border-transparent');
          form.classList.add('hidden');
        }
      }
    });
  }

  handleStudentLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-student-email').value.trim();
    const pwd = document.getElementById('login-student-pwd').value;
    this.login(email, pwd, 'student');
  }

  handleAdminLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-admin-email').value.trim();
    const pwd = document.getElementById('login-admin-pwd').value;
    this.login(email, pwd, 'admin');
  }

  handleStudentRegisterSubmit(e) {
    e.preventDefault();
    const data = {
      name: document.getElementById('reg-name').value.trim(),
      rollNo: document.getElementById('reg-rollno').value.trim(),
      department: document.getElementById('reg-dept').value,
      year: document.getElementById('reg-year').value,
      email: document.getElementById('reg-email').value.trim(),
      gender: document.getElementById('reg-gender').value,
      phone: document.getElementById('reg-phone').value.trim(),
      password: document.getElementById('reg-pwd').value,
      guardianName: document.getElementById('reg-guardian').value.trim(),
      guardianPhone: document.getElementById('reg-guardian-phone').value.trim()
    };
    this.registerStudent(data);
  }
}

// Global Auth module
window.auth = new AuthModule();
