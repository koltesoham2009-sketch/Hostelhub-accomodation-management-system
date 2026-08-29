class AuthModule {
  constructor() {
    this.currentUser = null;
    this.currentProfile = null;
    this.initialized = false;
  }

  async initialize() {
    try {
      if (!window.supabaseClient) {
        console.warn("Supabase client not initialized yet");
        return;
      }

      const { data: { session } } = await window.supabaseClient.auth.getSession();

      if (session && session.user) {
        await this.loadUserProfile(session.user);
      } else {
        this.currentUser = null;
        this.currentProfile = null;
      }

      window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
          setTimeout(async () => {
            await this.loadUserProfile(session.user);
          }, 0);
        } else {
          this.currentUser = null;
          this.currentProfile = null;
          this.updateAppForRole();
        }
      });

      this.initialized = true;
    } catch (error) {
      console.error("Supabase initialization error:", error);
      this.currentUser = null;
      this.currentProfile = null;
    }
  }

  async loadUserProfile(user) {
    try {
      const { data: profile, error } = await window.supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Profile loading error:", error);
        this.currentUser = user;
        this.currentProfile = null;
        return null;
      }

      this.currentUser = user;
      this.currentProfile = {
        ...profile,
        email: user.email
      };

      this.updateAppForRole();

      return this.currentProfile;
    } catch (error) {
      console.error("Profile error:", error);
      return null;
    }
  }

  isLoggedIn() {
    return !!this.currentUser;
  }

  getUser() {
    return this.currentUser;
  }

  getProfile() {
    return this.currentProfile;
  }

  getRole() {
    return this.currentProfile?.role || null;
  }

  isAdmin() {
    return this.getRole() === "admin" || this.getRole() === "warden";
  }

  isWarden() {
    return this.getRole() === "warden";
  }

  isStudent() {
    return this.getRole() === "student";
  }

  async login(email, password, role = "student") {
    if (!email || !password) {
      window.app.showToast("Please enter email and password", "error");
      return false;
    }

    try {
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error("Login error:", error);
        window.app.showToast(error.message, "error");
        return false;
      }

      if (!data.user) {
        window.app.showToast("Login failed", "error");
        return false;
      }

      const profile = await this.loadUserProfile(data.user);

      if (!profile) {
        await window.supabaseClient.auth.signOut();
        window.app.showToast("User profile not found", "error");
        return false;
      }

      const actualRole = profile.role;

      if (role === "admin") {
        if (actualRole !== "admin" && actualRole !== "warden") {
          await window.supabaseClient.auth.signOut();
          window.app.showToast("This account is not an Admin/Warden account", "error");
          return false;
        }

        window.app.showToast("Admin/Warden login successful", "success");
        window.app.closeModal("modal-auth");
        window.app.navigate("dashboard");
        return true;
      }

      if (actualRole !== "student") {
        await window.supabaseClient.auth.signOut();
        window.app.showToast("Please use the Admin/Warden login", "error");
        return false;
      }

      window.app.showToast(
        `Welcome back, ${profile.full_name || data.user.email}!`,
        "success"
      );

      window.app.closeModal("modal-auth");
      window.app.navigate("student-home");

      return true;

    } catch (error) {
      console.error("Unexpected login error:", error);
      window.app.showToast("Something went wrong during login", "error");
      return false;
    }
  }

  async registerStudent(studentData) {
    if (!studentData.name || !studentData.email || !studentData.password) {
      window.app.showToast("Please fill all required fields", "error");
      return false;
    }

    if (studentData.password.length < 6) {
      window.app.showToast("Password must contain at least 6 characters", "error");
      return false;
    }

    try {
      const { data, error } = await window.supabaseClient.auth.signUp({
        email: studentData.email,
        password: studentData.password,
        options: {
          data: {
            full_name: studentData.name,
            roll_no: studentData.rollNo,
            department: studentData.department,
            year: studentData.year,
            gender: studentData.gender,
            phone: studentData.phone,
            guardian_name: studentData.guardianName || "",
            guardian_phone: studentData.guardianPhone || ""
          }
        }
      });

      if (error) {
        console.error("Registration error:", error);
        window.app.showToast(error.message, "error");
        return false;
      }

      if (!data.user) {
        window.app.showToast("Registration failed", "error");
        return false;
      }

      if (!data.session) {
        window.app.showToast(
          "Registration successful. Please verify your email before logging in.",
          "success"
        );

        this.switchAuthTab("student-login");

        document.getElementById("login-student-email").value =
          studentData.email;

        document.getElementById("login-student-pwd").value = "";

        return true;
      }

      await this.loadUserProfile(data.user);

      window.app.showToast(
        `Registration successful! Welcome ${studentData.name}`,
        "success"
      );

      window.app.closeModal("modal-auth");
      window.app.navigate("student-home");

      return true;

    } catch (error) {
      console.error("Unexpected registration error:", error);
      window.app.showToast("Something went wrong during registration", "error");
      return false;
    }
  }

  async logout() {
    try {
      const { error } = await window.supabaseClient.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        window.app.showToast(error.message, "error");
        return;
      }

      this.currentUser = null;
      this.currentProfile = null;

      this.updateAppForRole();

      window.app.showToast("Signed out successfully", "info");

      window.app.navigate("dashboard");

    } catch (error) {
      console.error("Logout error:", error);
      window.app.showToast("Unable to sign out", "error");
    }
  }

  updateAppForRole() {
    const user = this.currentUser;
    const profile = this.currentProfile;

    const roleBadge = document.getElementById("header-role-badge");

    if (roleBadge) {
      if (!user || !profile) {
        roleBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-slate-400"></span>
          <span class="font-bold text-slate-500">Not Signed In</span>
        `;
      } else if (profile.role === "admin") {
        roleBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span class="font-bold text-slate-700 dark:text-slate-300">
            Admin Portal
          </span>
        `;
      } else if (profile.role === "warden") {
        roleBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span class="font-bold text-slate-700 dark:text-slate-300">
            Warden Portal
          </span>
        `;
      } else {
        roleBadge.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-teal-500"></span>
          <span class="font-bold text-slate-700 dark:text-slate-300">
            ${profile.full_name || user.email}
          </span>
        `;
      }
    }

    const profileWidget = document.getElementById("sidebar-user-widget");

    if (profileWidget) {
      if (!user || !profile) {
        profileWidget.innerHTML = `
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              👤
            </div>
            <div>
              <div class="text-xs font-bold text-white">
                Guest
              </div>
              <div class="text-[10px] text-slate-400">
                Not signed in
              </div>
            </div>
          </div>

          <button
            onclick="window.auth.openAuthModal('login')"
            class="px-2 py-1 bg-teal-600 text-white rounded text-[10px] font-bold"
          >
            Login
          </button>
        `;
      } else {
        const name = profile.full_name || user.email;
        const role = profile.role || "student";

        profileWidget.innerHTML = `
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
              ${name.charAt(0).toUpperCase()}
            </div>

            <div class="truncate max-w-[110px]">
              <div class="text-xs font-bold text-white truncate">
                ${name}
              </div>

              <div class="text-[10px] text-slate-400 font-medium truncate">
                ${role}
              </div>
            </div>
          </div>

          <button
            onclick="window.auth.logout()"
            class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded text-xs"
            title="Logout"
          >
            ↪
          </button>
        `;
      }
    }

    const adminNavLinks = document.querySelectorAll(".nav-admin-only");
    const studentNavLinks = document.querySelectorAll(".nav-student-only");

    if (profile && (profile.role === "admin" || profile.role === "warden")) {
      adminNavLinks.forEach(el => el.classList.remove("hidden"));
      studentNavLinks.forEach(el => el.classList.add("hidden"));
    } else if (profile && profile.role === "student") {
      adminNavLinks.forEach(el => el.classList.add("hidden"));
      studentNavLinks.forEach(el => el.classList.remove("hidden"));
    }
  }

  openAuthModal(initialTab = "login") {
    const modalContent = document.getElementById("auth-modal-content");

    if (!modalContent) return;

    modalContent.innerHTML = `
      <div class="p-6 bg-slate-900 text-white rounded-t-2xl relative">

        <button
          onclick="window.app.closeModal('modal-auth')"
          class="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl"
        >
          &times;
        </button>

        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xl">
            🎓
          </div>

          <div>
            <h2 class="text-lg font-black tracking-tight">
              HostelHub Portal
            </h2>

            <p class="text-xs text-slate-400">
              Student & Administration Authentication
            </p>
          </div>
        </div>
      </div>

      <div class="p-6">

        <div class="flex border-b border-slate-200 dark:border-slate-800 mb-5">

          <button
            onclick="window.auth.switchAuthTab('student-login')"
            id="tab-btn-student-login"
            class="flex-1 pb-2.5 text-xs font-bold text-teal-600 border-b-2 border-teal-600"
          >
            Student Login
          </button>

          <button
            onclick="window.auth.switchAuthTab('admin-login')"
            id="tab-btn-admin-login"
            class="flex-1 pb-2.5 text-xs font-bold text-slate-400 border-b-2 border-transparent"
          >
            Admin / Warden Login
          </button>

          <button
            onclick="window.auth.switchAuthTab('student-register')"
            id="tab-btn-student-register"
            class="flex-1 pb-2.5 text-xs font-bold text-slate-400 border-b-2 border-transparent"
          >
            + Student Signup
          </button>

        </div>

        <form
          id="form-student-login"
          onsubmit="window.auth.handleStudentLoginSubmit(event)"
          class="space-y-4"
        >

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Student Email
            </label>

            <input
              type="email"
              id="login-student-email"
              required
              placeholder="student@example.com"
              class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Password
            </label>

            <input
              type="password"
              id="login-student-pwd"
              required
              placeholder="Enter your password"
              class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
            />
          </div>

          <button
            type="submit"
            class="w-full px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs"
          >
            Sign In to Student Portal
          </button>

        </form>

        <form
          id="form-admin-login"
          onsubmit="window.auth.handleAdminLoginSubmit(event)"
          class="space-y-4 hidden"
        >

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Admin / Warden Email
            </label>

            <input
              type="email"
              id="login-admin-email"
              required
              placeholder="admin@example.com"
              class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Password
            </label>

            <input
              type="password"
              id="login-admin-pwd"
              required
              placeholder="Enter your password"
              class="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5"
            />
          </div>

          <button
            type="submit"
            class="w-full px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs"
          >
            Sign In as Admin / Warden
          </button>

        </form>

        <form
          id="form-student-register"
          onsubmit="window.auth.handleStudentRegisterSubmit(event)"
          class="space-y-3.5 hidden"
        >

          <div class="grid grid-cols-2 gap-3">

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">
                Full Student Name
              </label>

              <input
                type="text"
                id="reg-name"
                required
                placeholder="Your full name"
                class="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">
                Roll No
              </label>

              <input
                type="text"
                id="reg-rollno"
                required
                placeholder="2026-CSE-001"
                class="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              />
            </div>

          </div>

          <div class="grid grid-cols-2 gap-3">

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">
                Department
              </label>

              <select
                id="reg-dept"
                class="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              >
                <option>Computer Science & Engineering</option>
                <option>Information Technology</option>
                <option>Mechanical Engineering</option>
                <option>Civil Engineering</option>
                <option>Electronics & Telecomm</option>
                <option>AI & Data Science</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">
                Year / Semester
              </label>

              <select
                id="reg-year"
                class="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              >
                <option>1st Year (Semester 1)</option>
                <option>2nd Year (Semester 3)</option>
                <option>3rd Year (Semester 5)</option>
                <option>4th Year (Semester 7)</option>
              </select>
            </div>

          </div>

          <div class="grid grid-cols-3 gap-3">

            <div class="col-span-2">
              <label class="block text-xs font-bold text-slate-500 mb-1">
                Email Address
              </label>

              <input
                type="email"
                id="reg-email"
                required
                placeholder="student@example.com"
                class="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">
                Gender
              </label>

              <select
                id="reg-gender"
                class="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

          </div>

          <div class="grid grid-cols-2 gap-3">

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">
                Phone Number
              </label>

              <input
                type="text"
                id="reg-phone"
                required
                placeholder="+91 9876543210"
                class="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">
                Password
              </label>

              <input
                type="password"
                id="reg-pwd"
                required
                minlength="6"
                placeholder="Minimum 6 characters"
                class="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              />
            </div>

          </div>

          <div class="grid grid-cols-2 gap-3">

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">
                Guardian Name
              </label>

              <input
                type="text"
                id="reg-guardian"
                placeholder="Parent / Guardian"
                class="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 mb-1">
                Guardian Phone
              </label>

              <input
                type="text"
                id="reg-guardian-phone"
                placeholder="Guardian contact"
                class="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2"
              />
            </div>

          </div>

          <button
            type="submit"
            class="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs"
          >
            Create Student Account
          </button>

        </form>

      </div>
    `;

    window.app.openModal("modal-auth");

    if (initialTab === "admin-login") {
      this.switchAuthTab("admin-login");
    } else if (initialTab === "student-register") {
      this.switchAuthTab("student-register");
    } else {
      this.switchAuthTab("student-login");
    }
  }

  switchAuthTab(tab) {
    const tabs = [
      "student-login",
      "admin-login",
      "student-register"
    ];

    tabs.forEach(currentTab => {
      const button = document.getElementById(`tab-btn-${currentTab}`);
      const form = document.getElementById(`form-${currentTab}`);

      if (!button || !form) return;

      if (currentTab === tab) {
        button.classList.add(
          "text-teal-600",
          "border-teal-600"
        );

        button.classList.remove(
          "text-slate-400",
          "border-transparent"
        );

        form.classList.remove("hidden");

      } else {
        button.classList.remove(
          "text-teal-600",
          "border-teal-600"
        );

        button.classList.add(
          "text-slate-400",
          "border-transparent"
        );

        form.classList.add("hidden");
      }
    });
  }

  async handleStudentLoginSubmit(event) {
    event.preventDefault();

    const email =
      document.getElementById("login-student-email").value.trim();

    const password =
      document.getElementById("login-student-pwd").value;

    await this.login(email, password, "student");
  }

  async handleAdminLoginSubmit(event) {
    event.preventDefault();

    const email =
      document.getElementById("login-admin-email").value.trim();

    const password =
      document.getElementById("login-admin-pwd").value;

    await this.login(email, password, "admin");
  }

  async handleStudentRegisterSubmit(event) {
    event.preventDefault();

    const studentData = {
      name: document.getElementById("reg-name").value.trim(),
      rollNo: document.getElementById("reg-rollno").value.trim(),
      department: document.getElementById("reg-dept").value,
      year: document.getElementById("reg-year").value,
      email: document.getElementById("reg-email").value.trim(),
      gender: document.getElementById("reg-gender").value,
      phone: document.getElementById("reg-phone").value.trim(),
      password: document.getElementById("reg-pwd").value,
      guardianName: document.getElementById("reg-guardian").value.trim(),
      guardianPhone: document.getElementById("reg-guardian-phone").value.trim()
    };

    await this.registerStudent(studentData);
  }

  quickLoginAsAdmin() {
    window.app.showToast(
      "Quick demo login has been disabled. Please use your Supabase account.",
      "info"
    );
  }

  quickLoginAsStudent() {
    window.app.showToast(
      "Quick demo login has been disabled. Please use your Supabase account.",
      "info"
    );
  }
}

window.auth = new AuthModule();
