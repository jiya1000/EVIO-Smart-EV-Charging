// ════════════════════════════════════════════════
// GLOBAL STATE & DATA DEFINITIONS
// ════════════════════════════════════════════════

const DEFAULT_STATE = {
  loggedIn: false,
  user: {
    name: "User Account",
    email: "",
    phone: "",
    dob: "",
    photo: "",
    pointsEarnedTotal: 150,
    city: "Bengaluru",
    tier: "Basic Driver", // Basic Driver, Pro, Elite
    wallet: 150, // Rs
    points: 150, // 1 Point = 1 Rs
    vehicles: [
      { id: "v1", brand: "Tata Nexon EV", plate: "KA-03-MY-4321", active: true }
    ],
    bookings: [
      {
        id: "b_init",
        stationName: "Vijay Nagar EV Station",
        address: "Vijay Nagar, Indore",
        date: "Today",
        time: "06:00 PM - 07:00 PM",
        status: "Confirmed"
      }
    ],
    transactions: [
      { id: "t1", date: "03 Jun 2026", type: "Charging Reward - Fast DC Terminal", energy: "18.5 kWh", cost: "—", points: "+37 pts" },
      { id: "t2", date: "02 Jun 2026", type: "Charging Session - Vijay Nagar", energy: "22.4 kWh", cost: "₹358.40", points: "+45 pts" },
      { id: "t3", date: "02 Jun 2026", type: "Charging Reward - Bhawarkua Hub", energy: "14.6 kWh", cost: "—", points: "+29 pts" },
      { id: "t4", date: "30 May 2026", type: "Voucher Redemption - Amazon", energy: "Voucher", cost: "—", points: "-100 pts" }
    ]
  },
  session: {
    isActive: false,
    stationId: "st1",
    stationName: "Bhawarkua EV Charging Hub",
    vehicleName: "Tata Nexon EV",
    batteryPct: 0,
    energyCharged: 0,
    cost: 0,
    cashback: 0,
    timeLeft: 0, // min
    chargingSpeed: 30, // kW
    baseRate: 18 // Rs per kWh
  }
};

// Application State
let state = {};

// Load State from LocalStorage or fallback to defaults
function loadState() {
  const saved = localStorage.getItem("voltad_state");
  if (saved) {
    try {
      state = JSON.parse(saved);
    } catch (e) {
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  } else {
    state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  }
}

// Save State to LocalStorage
function saveState() {
  localStorage.setItem("voltad_state", JSON.stringify(state));
}

// Static Charging Stations List
const STATIONS = [
  {
    id: "st1",
    name: "Bhawarkua EV Charging Hub",
    address: "Bhawarkua, Indore",
    location: "Bhawarkua, Indore",
    type: "CCS2 & Type 2 (AC/DC Fast)",
    power: "50 kW",
    rate: 18,
    status: "available",
    slotsTotal: 3,
    slotsAvail: 2,
    ac: true,
    dc: true,
    acSlots: 2,
    dcSlots: 1,
    acTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM"],
    dcTimeSlots: ["09:00 AM", "12:00 PM", "04:00 PM"],
    icon: "fa-bolt",
    bgGrad: "linear-gradient(135deg, #071224 0%, #0c1e35 100%)",
    lat: 22.6868,
    lng: 75.8648
  },
  {
    id: "st2",
    name: "Bhawarkua Green Charge",
    address: "Bhawarkua Square, Indore",
    location: "Bhawarkua Square, Indore",
    type: "Type 2 (AC Green Charger)",
    power: "22 kW",
    rate: 15,
    status: "available",
    slotsTotal: 2,
    slotsAvail: 2,
    ac: true,
    dc: false,
    acSlots: 2,
    dcSlots: 0,
    acTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM"],
    dcTimeSlots: [],
    icon: "fa-charging-station",
    bgGrad: "linear-gradient(135deg, #070B10 0%, #0E1524 100%)",
    lat: 22.6879,
    lng: 75.8675
  },
  {
    id: "st3",
    name: "Vijay Nagar EV Station",
    address: "Vijay Nagar, Indore",
    location: "Vijay Nagar, Indore",
    type: "CCS2 & Type 2 (AC/DC Hub)",
    power: "60 kW",
    rate: 19,
    status: "busy",
    slotsTotal: 3,
    slotsAvail: 1,
    ac: true,
    dc: true,
    acSlots: 2,
    dcSlots: 1,
    acTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM"],
    dcTimeSlots: ["09:00 AM", "12:00 PM", "04:00 PM"],
    icon: "fa-plug",
    bgGrad: "linear-gradient(135deg, #071224 0%, #112540 100%)",
    lat: 22.7533,
    lng: 75.8937
  },
  {
    id: "st4",
    name: "Vijay Nagar Fast Charge",
    address: "Scheme No. 54, Vijay Nagar, Indore",
    location: "Scheme No. 54, Vijay Nagar, Indore",
    type: "CCS2 (Ultra DC Fast)",
    power: "120 kW",
    rate: 22,
    status: "available",
    slotsTotal: 3,
    slotsAvail: 2,
    ac: true,
    dc: true,
    acSlots: 2,
    dcSlots: 1,
    acTimeSlots: ["09:00 AM", "10:00 AM", "11:00 AM"],
    dcTimeSlots: ["09:00 AM", "12:00 PM", "04:00 PM"],
    icon: "fa-charging-station",
    bgGrad: "linear-gradient(135deg, #0c1e35 0%, #112540 100%)",
    lat: 22.752,
    lng: 75.9
  }
];

// Static Advertisements List
const ADS = [
  {
    id: "ad1",
    brand: "Nike India",
    title: "Run Green: Sustainability Meets High Performance",
    duration: 15, // seconds
    points: 15,
    icon: "fa-running",
    color: "#ff4d6d",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
  },
  {
    id: "ad2",
    brand: "Tesla Campaign",
    title: "Accelerating the World's Transition to Sustainable Energy",
    duration: 10,
    points: 8,
    icon: "fa-car-side",
    color: "#0af",
    img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&q=80"
  },
  {
    id: "ad3",
    brand: "Apple Solar Initiative",
    title: "Carbon Neutral by 2030: Powering Apple Devices Cleanly",
    duration: 20,
    points: 20,
    icon: "fa-apple-alt",
    color: "#398BFF",
    img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80"
  },
  {
    id: "ad4",
    brand: "Hyundai Clean Tech",
    title: "Ioniq 5: Electric Mobility That Empowers Your Everyday Life",
    duration: 25,
    points: 25,
    icon: "fa-leaf",
    color: "#ffa94d",
    img: "https://images.unsplash.com/photo-1668472851996-01584cfb776a?w=400&q=80"
  }
];

// Static Rewards Vouchers Shop
const VOUCHERS = [
  {
    id: "vouch1",
    brand: "Amazon Gift Voucher",
    title: "100 Points Shopping Voucher",
    pointsCost: 100,
    icon: "fa-shopping-basket",
    bgColor: "rgba(57,139,255,0.12)",
    iconColor: "var(--blue-electric)"
  },
  {
    id: "vouch2",
    brand: "VoltAd Charging Discount",
    title: "200 Points Charging Credits",
    pointsCost: 200,
    icon: "fa-bolt",
    bgColor: "rgba(57,139,255,0.12)",
    iconColor: "var(--blue-electric)"
  },
  {
    id: "vouch3",
    brand: "Tata Power Network Card",
    title: "450 Points Network Card",
    pointsCost: 450,
    icon: "fa-charging-station",
    bgColor: "rgba(37,99,235,0.12)",
    iconColor: "var(--blue)"
  },
  {
    id: "vouch4",
    brand: "Starbucks Beverage Card",
    title: "150 Points Beverage Voucher",
    pointsCost: 150,
    icon: "fa-mug-hot",
    bgColor: "rgba(57,139,255,0.12)",
    iconColor: "var(--text2)"
  }
];

// Admin Advertiser Campaigns
let adminCampaigns = [
  { brand: "Nike Green Run", target: "EV Commuters", impressions: 12400, spend: 186000, active: true },
  { brand: "Apple Clean Energy", target: "Urban Drivers", impressions: 8900, spend: 160200, active: true },
  { brand: "Tesla Drive EV", target: "High Income", impressions: 15300, spend: 122400, active: false },
  { brand: "Hyundai Ioniq 5", target: "General Public", impressions: 3400, spend: 85000, active: true }
];

// Single authorized administrator email
const ADMIN_EMAIL = "pjiya4285@gmail.com";

function isCurrentUserAdmin() {
  return Boolean(
    state.loggedIn &&
    state.user &&
    state.user.email &&
    state.user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
  );
}

// Charging loop simulator variables
let chargingInterval = null;
let currentBookingData = {
  stationId: "",
  stationName: "",
  address: "",
  rate: 18,
  selectedDayIndex: -1,
  selectedTimeSlot: ""
};

// Selected Ad Watch Variable
let activeWatchingAd = null;
let adTimerInterval = null;

// ════════════════════════════════════════════════
// TOAST NOTIFICATIONS & NOTIF SYSTEM
// ════════════════════════════════════════════════

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const iconName = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";
  toast.innerHTML = `
    <i class="fas ${iconName} toast-icon"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Automatically remove toast after 3.5 seconds
  setTimeout(() => {
    toast.style.animation = "slideInRight .3s ease reverse";
    toast.style.opacity = "0";
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3500);
}

function triggerNotification() {
  const notifications = [
    "Smart Charging Station 04 - MG Road is now fully charged!",
    "Charging Reward: +37 reward points earned from your last charging session!",
    "Your booked slot at Indiranagar is coming up in 2 hours.",
    "Upgrade to Pro Driver today to unlock a 1.5x charging rewards multiplier!"
  ];
  const randNotif = notifications[Math.floor(Math.random() * notifications.length)];
  showToast(randNotif, "success");
}

// ════════════════════════════════════════════════
// ROUTING & PAGE ENGINE (SPA)
// ════════════════════════════════════════════════

function showPage(pageId) {
  // Logged-in users do not need the login page again
  if (pageId === "auth" && state.loggedIn) {
    showToast("You are already logged in.", "success");
    showPage("dashboard");
    return;
  }

  // Hide all main pages
  const pages = document.querySelectorAll(".page");
  pages.forEach(p => {
    p.classList.remove("active");
    p.style.display = "none";
  });

  // Hide mobile toggle overlay/sidebar if open
  const sidebar = document.getElementById("dashboardSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("show");

  // Show selected page
  const activePage = document.getElementById(`page-${pageId}`);
  if (activePage) {
    activePage.classList.add("active");
    activePage.style.display = (pageId === "auth" || pageId === "dashboard") ? "flex" : "block";
    if (pageId === "auth") {
      const authRight = activePage.querySelector(".auth-right");
      if (authRight) {
        authRight.classList.remove("spring-enter");
        authRight.style.animation = 'none';
        void authRight.offsetWidth; // Force reflow
        authRight.style.animation = '';
        authRight.classList.add("spring-enter");
      }
    }
  }

  // Adjust Navbar visibility
  const publicNav = document.getElementById("public-nav");
  if (publicNav) {
    if (pageId === "landing" || pageId === "plans-public" || pageId === "stats") {
      publicNav.style.display = "flex";
    } else {
      publicNav.style.display = "none";
    }
  }

  // Show Log In buttons or profile picture depending on login state
  updateNavAuthState();

  // Scroll to top
  window.scrollTo(0, 0);

  // If entering dashboard page, sync variables & open Default Overview view
  if (pageId === "dashboard") {
    syncDashboardValues();
    showDashboardView("overview");
  }
}

function showDashboardView(viewId) {
  // Alias legacy subview IDs to unified Find & Book
  if (viewId === "stations" || viewId === "booking" || viewId === "find-book") {
    viewId = "find-book";
  }

  // Hide all subviews
  const subviews = document.querySelectorAll(".dash-subview");
  subviews.forEach(sv => sv.style.display = "none");

  // Remove active highlight from all sidebar navigation items
  const sidebarItems = document.querySelectorAll(".sidebar-item");
  sidebarItems.forEach(item => item.classList.remove("active"));

  // Show active subview
  const activeView = document.getElementById(`view-${viewId}`);
  if (activeView) {
    activeView.style.display = "block";
  }

  // Highlight active navigation items
  const activeNav = document.getElementById(`nav-${viewId}`);
  if (activeNav) {
    activeNav.classList.add("active");
  }

  // Hide mobile toggle overlay/sidebar on click
  const sidebar = document.getElementById("dashboardSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("show");

  // Update Topbar Title
  const topbarTitle = document.getElementById("dash-topbar-title");
  if (topbarTitle) {
    const titlesMap = {
      overview: "Dashboard Overview",
      "find-book": "Find & Book Charging",
      stations: "Find & Book Charging",
      booking: "Find & Book Charging",
      rewards: "My Rewards Wallet",
      subscriptions: "Manage Subscription",
      profile: "Profile & Settings",
      admin: "VoltAd Admin Control Panel"
    };
    topbarTitle.textContent = titlesMap[viewId] || "Dashboard";
  }

  // If ads view requested, redirect to rewards
  if (viewId === "ads") {
    showDashboardView("rewards");
    return;
  }

  // Render view components
  if (viewId === "find-book") {
    renderStations();
    if (!currentBookingData.stationId) {
      selectStationForBooking("st1");
    } else {
      renderBookingSlots();
    }
  } else if (viewId === "rewards") {
    renderRewardsVouchers();
    renderTransactionTable();
  } else if (viewId === "subscriptions") {
    renderSubscriptionCards();
  } else if (viewId === "profile") {
    renderProfileVehicles();
    switchProfileSubTab("details");
  } else if (viewId === "admin") {
    if (!isCurrentUserAdmin()) {
      showToast(`Access Denied: Only Administrator (${ADMIN_EMAIL}) can access this panel.`, "error");
      showDashboardView("overview");
      return;
    }
    renderAdminView();
  } else if (viewId === "overview") {
    renderOverviewBookings();
  }
}

// Toggle mobile navigation overlay
function toggleMobileSidebar() {
  const sidebar = document.getElementById("dashboardSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.toggle("open");
  if (overlay) overlay.classList.toggle("show");
}

// Smooth scroll to sections on landing page
function scrollToSection(sectionId) {
  // If another page (e.g. My Stats) is open, go to the homepage first
  const landing = document.getElementById("page-landing");
  if (landing && !landing.classList.contains("active")) {
    showPage("landing");
    setTimeout(() => {
      const target = document.getElementById(sectionId);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    }, 80);
    return;
  }

  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}

// ════════════════════════════════════════════════
// MOCK AUTHENTICATION SYSTEM
// ════════════════════════════════════════════════

function toggleAuthTab(tab) {
  const loginForm = document.getElementById("form-login");
  const signupForm = document.getElementById("form-signup");
  const otpForm = document.getElementById("form-otp");
  const forgotReqForm = document.getElementById("form-forgot-request");
  const forgotResetForm = document.getElementById("form-forgot-reset");
  const loginBtn = document.getElementById("tab-login-btn");
  const signupBtn = document.getElementById("tab-signup-btn");

  if (forgotReqForm) forgotReqForm.style.display = "none";
  if (forgotResetForm) forgotResetForm.style.display = "none";

  if (tab === "login") {
    if (loginForm) loginForm.style.display = "block";
    if (signupForm) signupForm.style.display = "none";
    if (otpForm) otpForm.style.display = "none";

    if (loginBtn) loginBtn.classList.add("active");
    if (signupBtn) signupBtn.classList.remove("active");
  } else {
    if (loginForm) loginForm.style.display = "none";
    if (signupForm) signupForm.style.display = "block";
    if (otpForm) otpForm.style.display = "none";

    if (loginBtn) loginBtn.classList.remove("active");
    if (signupBtn) signupBtn.classList.add("active");
  }
}

// ════════════════════════════════════════════════
// BACKEND API (login / signup / session)
// ════════════════════════════════════════════════

function getBackendBase() {
  return (window.location.port === "3000" || window.location.port === "") ? "" : "http://localhost:3000";
}

async function api(path, options = {}) {
  let res;
  const baseUrl = getBackendBase() + "/api";
  try {
    res = await fetch(baseUrl + path, {
      method: options.method || "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch (e) {
    throw new Error("Cannot reach the server. Start the backend and open http://localhost:3000");
  }

  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    // Not JSON
  }

  if (!res.ok) {
    const err = new Error(data.error || "Cannot reach the backend. Open the site at http://localhost:3000");
    err.status = res.status;
    throw err;
  }
  return data;
}

// Handler for Google and Social Sign-In buttons
function handleSocialAuth(provider) {
  if (provider === "Google") {
    const targetUrl = getBackendBase() + "/api/auth/google";
    window.location.href = targetUrl;
  } else {
    showToast(`${provider} authentication is coming soon!`, "info");
  }
}

function checkUrlAuthStatus() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("auth")) {
    const authType = params.get("auth");
    if (authType === "google") {
      showToast("Signed in with Google successfully!", "success");
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  } else if (params.has("auth_error")) {
    const errorMsg = params.get("auth_error");
    showToast(`Google Sign-In: ${decodeURIComponent(errorMsg)}`, "error");
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}


// Checks with the server if the user is still logged in and synchronizes state
async function restoreSession() {
  try {
    const data = await api("/user/state");
    if (data && data.loggedIn && data.user) {
      state.user = { ...state.user, ...data.user };
      if (data.session) state.session = { ...state.session, ...data.session };
      state.loggedIn = true;
    } else if (data && data.loggedIn === false) {
      state.loggedIn = false;
    }
  } catch (e) {
    // Server not reached or guest
  }

  // Ensure role and admin flags strictly match authorized email
  if (state.user && state.user.email) {
    const isAdmin = state.user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    state.user.role = isAdmin ? "admin" : "driver";
    state.user.isAdmin = isAdmin;
  }

  saveState();
  syncDashboardValues();
  updateNavAuthState();

  // If user navigated to #admin, verify permissions
  if (window.location.hash === "#admin") {
    if (isCurrentUserAdmin()) {
      showPage("dashboard");
      showDashboardView("admin");
    } else {
      window.location.hash = "";
      showPage("landing");
      if (state.loggedIn) {
        showToast(`Access Denied: Only Administrator (${ADMIN_EMAIL}) can access this panel.`, "error");
      }
    }
  }
}

// Instant 1-Click Demo Login for Testing and Evaluation
async function quickDemoLogin(role = "driver") {
  try {
    const submitBtns = document.querySelectorAll(".auth-panel-card button, .auth-right button");
    submitBtns.forEach(b => { if (b) b.disabled = true; });

    const result = await api("/auth/demo-login", {
      method: "POST",
      body: { role: role }
    });

    if (result && result.user) {
      state.user.name = result.user.name;
      state.user.email = result.user.email;
      state.user.tier = result.user.tier || (role === "admin" ? "Admin Console" : "Basic");
      state.user.role = result.user.role || role;
      state.user.isAdmin = !!result.user.isAdmin;
      state.user.wallet = Number(result.user.wallet) || (role === "admin" ? 10000 : 165);
      state.user.points = Number(result.user.points) || (role === "admin" ? 5000 : 165);
      state.loggedIn = true;

      if (state.user.isAdmin) {
        try { localStorage.setItem("evio_admin_user", JSON.stringify(result.user)); } catch (e) {}
      }

      saveState();
      syncDashboardValues();
      updateNavAuthState();

      showToast(`Logged in as Demo ${state.user.role === "admin" ? "Admin" : "Driver"} (${state.user.name})`, "success");

      if (state.user.isAdmin) {
        window.location.href = "/admin";
      } else {
        showPage("dashboard");
        showDashboardView("overview");
      }
    }
  } catch (err) {
    showToast(err.message || "Demo login failed", "error");
  } finally {
    const submitBtns = document.querySelectorAll(".auth-panel-card button, .auth-right button");
    submitBtns.forEach(b => { if (b) b.disabled = false; });
  }
}

// Password Visibility Toggle
function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    if (icon) {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    }
  } else {
    input.type = "password";
    if (icon) {
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  }
}

function goToDashboardOrLogin() {
  if (state.loggedIn) {
    showPage("dashboard");
    showDashboardView("overview");
  } else {
    showPage("auth");
    toggleAuthTab("login");
  }
}

async function handleAuth(event, type) {
  event.preventDefault();

  const submitBtn = event.target.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  try {
    let result;

    if (type === "login") {

      // LOGIN
      result = await api("/auth/login", {
        method: "POST",
        body: {
          email: document.getElementById("login-email").value,
          password: document.getElementById("login-password").value
        }
      });

      state.user.id = result.user.id;
      state.user.name = result.user.name || state.user.name;
      state.user.email = result.user.email || state.user.email;
      if (result.user.phone !== undefined) state.user.phone = result.user.phone;
      if (result.user.city !== undefined) state.user.city = result.user.city;
      if (result.user.dob !== undefined) state.user.dob = result.user.dob;
      if (result.user.photo !== undefined) state.user.photo = result.user.photo;
      if (result.user.points !== undefined) state.user.points = Number(result.user.points);
      if (result.user.wallet !== undefined) state.user.wallet = Number(result.user.wallet);
      if (result.user.points_earned_total !== undefined) state.user.pointsEarnedTotal = Number(result.user.points_earned_total);

      const isAdmin = result.user.email && result.user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
      state.user.tier = isAdmin ? "Admin Console" : (result.user.tier || result.user.subscription || "Basic Driver");
      state.user.role = isAdmin ? "admin" : "driver";
      state.user.isAdmin = isAdmin;

      if (isAdmin && result.user) {
        try { localStorage.setItem("evio_admin_user", JSON.stringify(result.user)); } catch (e) {}
      }

      state.loggedIn = true;
      saveState();
      syncDashboardValues();
      updateNavAuthState();

      showToast(`Welcome, ${state.user.name}!`, "success");
      showPage("dashboard");

    } else {

      // SIGNUP
      const name = document.getElementById("signup-name").value;
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;

      result = await api("/auth/signup", {
        method: "POST",
        body: {
          name: name,
          email: email,
          password: password
        }
      });

      // Store temporarily for OTP verification
      window.pendingSignup = {
        name: name,
        email: email,
        password: password
      };

      // Hide signup form
      document.getElementById("form-signup").style.display = "none";

      // Show OTP form
      document.getElementById("form-otp").style.display = "block";
      document.getElementById("otp-email-text").textContent =
        `OTP sent to ${email}`;

      showToast("OTP sent to your email!", "success");
    }

  } catch (err) {
    showToast(err.message, "error");

  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}
async function verifyOTP(event) {
  event.preventDefault();

  const otp = document.getElementById("otp-input").value.trim();

  if (otp.length !== 6) {
    showToast("Please enter a valid 6-digit OTP.", "error");
    return;
  }

  try {
    const result = await api("/auth/verify-otp", {
      method: "POST",
      body: {
        email: window.pendingSignup.email,
        otp: otp
      }
    });

    state.user.name = window.pendingSignup.name;
    state.user.email = window.pendingSignup.email;
    const isAdmin = window.pendingSignup.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    state.user.tier = isAdmin ? "Admin Console" : "Basic";
    state.user.role = isAdmin ? "admin" : "driver";
    state.user.isAdmin = isAdmin;

    state.user.wallet = 50;
    state.user.points = 50;
    state.user.pointsEarnedTotal = 50;
    state.user.bookings = [];

    state.user.transactions = [
      {
        id: "t_init",
        date: "Today",
        type: "Welcome Signup Bonus",
        energy: "Promo",
        cost: "+₹50",
        points: "+50 pts"
      }
    ];

    state.loggedIn = true;

    saveState();
    syncDashboardValues();
    updateNavAuthState();

    // Clear temporary signup data
    window.pendingSignup = null;

    document.getElementById("otp-input").value = "";

    showToast("Email verified successfully!", "success");

    showPage("dashboard");

  } catch (err) {
    showToast(err.message, "error");
  }
}


async function resendOTP() {

  if (!window.pendingSignup || !window.pendingSignup.email) {
    showToast("Signup session expired. Please sign up again.", "error");
    return;
  }

  try {

    await api("/auth/resend-otp", {
      method: "POST",
      body: {
        email: window.pendingSignup.email
      }
    });

    showToast("New OTP sent to your email!", "success");

  } catch (err) {
    showToast(err.message, "error");
  }
}

window.pendingForgotPasswordEmail = "";

function openUserForgotPassword() {
  const loginEmail = document.getElementById("login-email") ? document.getElementById("login-email").value.trim() : "";
  const forgotEmailInput = document.getElementById("forgot-email");
  if (forgotEmailInput && loginEmail) {
    forgotEmailInput.value = loginEmail;
  }

  const loginForm = document.getElementById("form-login");
  const signupForm = document.getElementById("form-signup");
  const otpForm = document.getElementById("form-otp");
  const forgotReqForm = document.getElementById("form-forgot-request");
  const forgotResetForm = document.getElementById("form-forgot-reset");

  if (loginForm) loginForm.style.display = "none";
  if (signupForm) signupForm.style.display = "none";
  if (otpForm) otpForm.style.display = "none";
  if (forgotResetForm) forgotResetForm.style.display = "none";
  if (forgotReqForm) forgotReqForm.style.display = "block";

  const loginBtn = document.getElementById("tab-login-btn");
  const signupBtn = document.getElementById("tab-signup-btn");
  if (loginBtn) loginBtn.classList.remove("active");
  if (signupBtn) signupBtn.classList.remove("active");
}

async function handleUserForgotPasswordRequest(event) {
  event.preventDefault();
  const email = (document.getElementById("forgot-email").value || "").trim().toLowerCase();
  if (!email) {
    showToast("Please enter your registered email.", "error");
    return;
  }

  const btn = document.getElementById("btn-forgot-send");
  if (btn) btn.disabled = true;

  try {
    await api("/auth/forgot-password", {
      method: "POST",
      body: { email }
    });

    window.pendingForgotPasswordEmail = email;
    const emailDisplay = document.getElementById("forgot-email-display-text");
    if (emailDisplay) {
      emailDisplay.textContent = `Verification code sent to ${email}. Enter it below with your new password:`;
    }

    document.getElementById("form-forgot-request").style.display = "none";
    document.getElementById("form-forgot-reset").style.display = "block";
    showToast("Password reset code sent to your email!", "success");
  } catch (err) {
    showToast(err.message || "Failed to send reset code.", "error");
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function handleUserForgotPasswordResend() {
  if (!window.pendingForgotPasswordEmail) {
    showToast("Session expired. Please enter your email again.", "error");
    openUserForgotPassword();
    return;
  }

  try {
    await api("/auth/forgot-password", {
      method: "POST",
      body: { email: window.pendingForgotPasswordEmail }
    });
    showToast("New reset code sent to your email!", "success");
  } catch (err) {
    showToast(err.message || "Failed to resend code.", "error");
  }
}

async function handleUserForgotPasswordReset(event) {
  event.preventDefault();
  const email = window.pendingForgotPasswordEmail || (document.getElementById("forgot-email") ? document.getElementById("forgot-email").value.trim() : "");
  const otp = (document.getElementById("forgot-otp-input").value || "").trim();
  const newPassword = document.getElementById("forgot-new-password").value;
  const confirmPassword = document.getElementById("forgot-confirm-password").value;

  if (otp.length !== 6) {
    showToast("Please enter a valid 6-digit OTP code.", "error");
    return;
  }
  if (newPassword.length < 8) {
    showToast("Password must be at least 8 characters.", "error");
    return;
  }
  if (newPassword !== confirmPassword) {
    showToast("Passwords do not match.", "error");
    return;
  }

  const btn = document.getElementById("btn-forgot-submit");
  if (btn) btn.disabled = true;

  try {
    await api("/auth/reset-password", {
      method: "POST",
      body: {
        email,
        otp,
        newPassword
      }
    });

    showToast("Password reset successfully! Please log in.", "success");
    toggleAuthTab("login");
    const loginEmailInput = document.getElementById("login-email");
    if (loginEmailInput) loginEmailInput.value = email;
    const loginPassInput = document.getElementById("login-password");
    if (loginPassInput) {
      loginPassInput.value = "";
      loginPassInput.focus();
    }
  } catch (err) {
    showToast(err.message || "Failed to reset password.", "error");
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function logout() {
  // Tell the server to end the session
  try {
    await api("/auth/logout", { method: "POST" });
  } catch (e) {}

  // Reset session simulator
  if (chargingInterval) {
    clearInterval(chargingInterval);
    chargingInterval = null;
  }
  state.loggedIn = false;
  saveState();
  closeProfileDropdown();
  closeUserModal();
  updateNavAuthState();
  showToast("Logged out successfully. Safe driving!", "success");
  showPage("landing");
}

// ════════════════════════════════════════════════
// DATA SYNC ENGINE
// ════════════════════════════════════════════════

function syncDashboardValues() {
  // Updates profile elements in the DOM using activeState
  const sidebarName = document.getElementById("sidebar-user-name");
  const sidebarTier = document.getElementById("sidebar-user-tier");
  const sidebarAvatar = document.getElementById("sidebar-user-avatar");
  
  const profileName = document.getElementById("profile-info-name");
  const profileEmail = document.getElementById("profile-info-email");
  const profileTierBadge = document.getElementById("profile-info-tier-badge");
  const profileLargeAvatar = document.getElementById("profile-large-avatar");

  // Name settings
  const displayName = state.user && state.user.name ? state.user.name : "User Account";
  if (sidebarName) sidebarName.textContent = displayName;
  if (profileName) profileName.textContent = displayName;

  // Avatar setting (Initial letter)
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";
  if (sidebarAvatar) sidebarAvatar.textContent = initial;
  if (profileLargeAvatar) profileLargeAvatar.textContent = initial;
  const navAvatar = document.getElementById("navAvatar");
  if (navAvatar) navAvatar.textContent = initial;

  // Email setting
  if (profileEmail) profileEmail.textContent = state.user.email || "";

  // Form Inputs sync (Keep profile input fields matched with user state)
  const profileNameInput = document.getElementById("profile-name-input");
  const profileEmailInput = document.getElementById("profile-email-input");
  const profilePhoneInput = document.getElementById("profile-phone-input");
  const profileCityInput = document.getElementById("profile-city-input");

  if (profileNameInput && state.user) profileNameInput.value = state.user.name || "";
  if (profileEmailInput && state.user) profileEmailInput.value = state.user.email || "";
  if (profilePhoneInput && state.user) profilePhoneInput.value = state.user.phone || "";
  if (profileCityInput && state.user) profileCityInput.value = state.user.city || "";

  // Membership setting
  const tierName = state.user && state.user.tier ? state.user.tier : "Basic Driver";
  if (sidebarTier) sidebarTier.textContent = tierName.includes("Driver") ? tierName : `${tierName} Driver`;
  if (profileTierBadge) profileTierBadge.textContent = `${tierName.replace(" Driver", "")} Membership`;

  // Subscriptions section active status badge sync
  const subActiveName = document.getElementById("sub-active-tier-name");
  const subActiveBadge = document.getElementById("sub-active-tier-badge");
  if (subActiveName) subActiveName.textContent = tierName.includes("Driver") ? tierName : `${tierName} Driver`;
  if (subActiveBadge) subActiveBadge.textContent = "Active";

  // Show Admin links in dashboard sidebar only for administrator accounts (pjiya4285@gmail.com)
  const adminLabel = document.getElementById("sidebar-admin-label");
  const adminNav = document.getElementById("nav-admin");
  const isAdminUser = isCurrentUserAdmin();
  if (adminLabel) adminLabel.style.display = isAdminUser ? "block" : "none";
  if (adminNav) adminNav.style.display = isAdminUser ? "flex" : "none";

  // Update Wallets stats visualizers
  const walletVal = document.getElementById("stat-wallet-bal");
  const pointsVal = document.getElementById("stat-points-earned");
  const rewardsDisplay = document.getElementById("rewards-wallet-display");
  const adsPointsDisplay = document.getElementById("ad-wallet-points-badge");
  const pointsNum = Number(state.user && state.user.points != null ? state.user.points : (state.user && state.user.wallet != null ? state.user.wallet : 0));
  if (walletVal) walletVal.textContent = `${pointsNum} pts`;
  if (pointsVal) pointsVal.textContent = `${pointsNum} pts`;
  if (rewardsDisplay) rewardsDisplay.textContent = `${pointsNum} pts`;
  if (adsPointsDisplay) adsPointsDisplay.innerHTML = `<i class="fas fa-coins"></i> Wallet: ${pointsNum} pts`;

  // Save multiplier representation
  const ratioVal = document.getElementById("stat-cashback-ratio");
  const multiplierVal = document.getElementById("stat-multiplier-val");
  
  let multiplier = 1.0;
  if (state.user.tier === "Pro") multiplier = 1.5;
  if (state.user.tier === "Elite") multiplier = 2.0;

  if (ratioVal) {
    if (state.user.tier === "Pro") ratioVal.textContent = "48%";
    else if (state.user.tier === "Elite") ratioVal.textContent = "60%";
    else ratioVal.textContent = "38%";
  }
  if (multiplierVal) multiplierVal.textContent = `${multiplier.toFixed(1)}x`;

  // Overview charging details
  updateSessionSimulatorDOM();
}

// ════════════════════════════════════════════════
// CHARGING LOOP SIMULATOR
// ════════════════════════════════════════════════

function updateSessionSimulatorDOM() {
  const activeView = document.getElementById("view-overview");
  if (!activeView) return;

  const ring = document.getElementById("overview-charge-ring");
  const percentageText = document.getElementById("overview-charge-pct");
  const fillBar = document.getElementById("session-progress-fill");
  
  const title = document.getElementById("session-title");
  const subtitle = document.getElementById("session-station-name");
  const rateDisplay = document.getElementById("session-rate-display");
  const badge = document.getElementById("session-status-badge");
  
  const timeLeft = document.getElementById("session-time-left");
  const energy = document.getElementById("session-energy");
  const cost = document.getElementById("session-cost");
  const cashback = document.getElementById("session-cashback");

  const stopBtn = document.getElementById("btn-session-toggle");

  if (state.session.isActive) {
    title.textContent = "Active Charging Session";
    subtitle.textContent = state.session.stationName;
    rateDisplay.textContent = `Power Output: ${state.session.chargingSpeed} kW | Base Rate: ₹${state.session.baseRate}/kWh`;
    
    badge.className = "badge badge-green";
    badge.innerHTML = `<span style="width:6px;height:6px;background:var(--blue-electric);border-radius:50%;display:inline-block"></span> Live`;

    percentageText.textContent = `${state.session.batteryPct}%`;
    const circleProgress = document.getElementById("overview-circle-progress");
    const totalLength = 301.59;
    if (circleProgress) {
      const pct = Math.min(100, Math.max(0, state.session.batteryPct));
      const offset = totalLength - (totalLength * (pct / 100));
      circleProgress.style.strokeDashoffset = offset.toFixed(2);
      if (ring) ring.style.background = "";
    } else if (ring) {
      ring.style.background = `conic-gradient(var(--blue-electric) 0% ${state.session.batteryPct}%, rgba(57,139,255,0.12) ${state.session.batteryPct}% 100%)`;
    }
    const bolt = document.getElementById("overview-charge-bolt");
    if (bolt) bolt.style.opacity = "1";
    const label = document.getElementById("overview-charge-label");
    if (label) label.textContent = "CHARGING";

    fillBar.style.width = `${state.session.batteryPct}%`;

    timeLeft.textContent = `${state.session.timeLeft} min`;
    energy.textContent = `${state.session.energyCharged.toFixed(2)} kWh`;
    cost.textContent = `₹${state.session.cost.toFixed(2)}`;
    cashback.textContent = `+${Math.round(state.session.cashback)} pts`;
    cashback.style.color = "var(--blue-electric)";

    stopBtn.className = "btn btn-danger btn-sm";
    stopBtn.textContent = "Stop Session";
  } else {
    // Session is idle
    title.textContent = "No Active Charging Session";
    subtitle.textContent = "Connect EV at any station node to initiate charging.";
    rateDisplay.textContent = "Select Find & Book to locate an EV port.";
    
    badge.className = "badge badge-gold";
    badge.innerHTML = `<span style="width:6px;height:6px;background:var(--gold);border-radius:50%;display:inline-block"></span> Plug-in Idle`;

    percentageText.textContent = "--";
    const circleProgress = document.getElementById("overview-circle-progress");
    if (circleProgress) {
      circleProgress.style.strokeDashoffset = "301.59";
      if (ring) ring.style.background = "";
    } else if (ring) {
      ring.style.background = `conic-gradient(var(--border) 0% 100%)`;
    }
    const bolt = document.getElementById("overview-charge-bolt");
    if (bolt) bolt.style.opacity = "0.3";
    const label = document.getElementById("overview-charge-label");
    if (label) label.textContent = "IDLE";

    fillBar.style.width = "0%";

    timeLeft.textContent = "--";
    energy.textContent = "0 kWh";
    cost.textContent = "₹0.00";
    cashback.textContent = "0 pts";
    cashback.style.color = "var(--text3)";

    stopBtn.className = "btn btn-primary btn-sm";
    stopBtn.textContent = "Start Charge Simulator";
  }
}

function startSimulatingCharging() {
  if (chargingInterval) clearInterval(chargingInterval);

  chargingInterval = setInterval(() => {
    if (state.session.isActive) {
      if (state.session.batteryPct < 100) {
        // Increment statistics
        state.session.batteryPct += 1;
        state.session.timeLeft = Math.max(0, state.session.timeLeft - 1);
        
        // Accumulate energy based on speed: (chargingSpeed kW * 1 minute / 60)
        const energyAdded = state.session.chargingSpeed / 60;
        state.session.energyCharged += energyAdded;
        
        // Costs & Cashbacks
        state.session.cost += energyAdded * state.session.baseRate;
        
        // Cashback increments automatically (e.g. 18% base cash offset)
        let multi = 1.0;
        if (state.user.tier === "Pro") multi = 1.5;
        if (state.user.tier === "Elite") multi = 2.0;
        state.session.cashback += energyAdded * state.session.baseRate * 0.18 * multi;

        saveState();
        updateSessionSimulatorDOM();
      } else {
        // Charging Complete
        clearInterval(chargingInterval);
        chargingInterval = null;
        showToast("Charging Session Completed! 100% Battery.", "success");
        completeSimulatedSession();
      }
    }
  }, 5000); // Trigger adjustments every 5 seconds
}

function toggleSimulatedSession() {
  if (state.session.isActive) {
    completeSimulatedSession();
  } else {
    // Start session
    state.session.isActive = true;
    state.session.stationName = "MG Road Fast Charger";
    state.session.batteryPct = 50;
    state.session.energyCharged = 0.0;
    state.session.cost = 50.00; // Base session connection fee
    state.session.cashback = 0.00;
    state.session.timeLeft = 35;
    state.session.chargingSpeed = 50;
    state.session.baseRate = 18;
    
    saveState();
    updateSessionSimulatorDOM();
    showToast("EV Charger connected. Battery current flow live.", "success");
    startSimulatingCharging();
  }
}

function completeSimulatedSession() {
  if (chargingInterval) {
    clearInterval(chargingInterval);
    chargingInterval = null;
  }

  if (state.session.isActive) {
    let multi = 1.0;
    if (state.user.tier === "Pro") multi = 1.5;
    if (state.user.tier === "Elite") multi = 2.0;

    // Direct charging reward calculation: 2 points per kWh * tier multiplier (min 1 pt)
    const earnedPoints = Math.max(1, Math.round(state.session.energyCharged * 2 * multi));
    const earnedCashback = Number(state.session.cashback.toFixed(2));
    const netPayment = Math.max(0, state.session.cost - earnedCashback);
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    // Deduct net payment from mock wallet & add charging rewards directly to wallet/points
    state.user.wallet = Math.max(0, state.user.wallet - netPayment);
    state.user.pointsEarnedTotal = getEarnedTotal() + earnedPoints;
    state.user.points = Math.round(state.user.points + earnedPoints);
    
    state.user.transactions.unshift({
      id: `t_chg_${Date.now()}`,
      date: dateStr,
      type: `Charging Reward - ${state.session.stationName}`,
      energy: `${state.session.energyCharged.toFixed(1)} kWh`,
      cost: `-₹${netPayment.toFixed(2)}`,
      points: `+${earnedPoints} pts`
    });

    state.session.isActive = false;
    saveState();
    syncDashboardValues();
    showToast(`⚡ Charging Complete! You earned +${earnedPoints} reward points & ₹${earnedCashback.toFixed(2)} cashback discount!`, "success");
  }
}

// ════════════════════════════════════════════════
// STATIONS & FILTERS VIEWS
// ════════════════════════════════════════════════

let activeFilter = 'all';

function renderStations() {
  const container = document.getElementById("stations-list-container");
  if (!container) return;

  container.innerHTML = "";
  const query = document.getElementById("station-search").value.toLowerCase();

  STATIONS.forEach(st => {
    // Search text filter
    const matchesSearch = st.name.toLowerCase().includes(query) || st.address.toLowerCase().includes(query);
    if (!matchesSearch) return;

    // Filter Chips
    if (activeFilter === "CCS2" && !st.type.includes("CCS2")) return;
    if (activeFilter === "Type 2" && !st.type.includes("Type 2")) return;
    if (activeFilter === "available" && st.status !== "available") return;

    const card = document.createElement("div");
    card.className = "station-card";
    
    // Status visual
    const statusDot = st.status === "available" ? "available" : "busy";
    const buttonText = st.status === "available" ? "Book Slot" : "Full / Queue";
    const btnClass = st.status === "available" ? "btn-primary" : "btn-ghost";

    // Slots representation dots
    let slotsHTML = "";
    for (let i = 0; i < st.slotsTotal; i++) {
      if (i < st.slotsAvail) {
        slotsHTML += `<span class="slot-dot avail"></span>`;
      } else {
        slotsHTML += `<span class="slot-dot taken"></span>`;
      }
    }

    card.innerHTML = `
      <div class="station-card-img" style="background: ${st.bgGrad}">
        <i class="fas ${st.icon}"></i>
        <span class="station-status-dot ${statusDot}"></span>
      </div>
      <div class="station-card-body">
        <div class="station-name">${st.name}</div>
        <div class="station-addr"><i class="fas fa-map-marker-alt" style="color: var(--blue)"></i> ${st.address}</div>
        <div class="station-meta">
          <div class="station-meta-item"><i class="fas fa-bolt"></i> ${st.power}</div>
          <div class="station-meta-item"><i class="fas fa-coins"></i> ₹${st.rate}/kWh</div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px; gap: 8px;">
          <div class="station-slots">
            <span style="font-size: 11px; color: var(--text3); font-weight:700; margin-right:4px;">SLOTS:</span>
            ${slotsHTML}
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <a href="map.html" class="btn btn-outline btn-sm" title="Locate on Map" style="padding: 8px 12px; display: inline-flex; align-items: center;">
              <i class="fas fa-map-marked-alt" style="color: var(--blue-electric);"></i>
            </a>
            <button class="btn ${btnClass} btn-sm" onclick="selectStationForBooking('${st.id}')" ${st.status === 'busy' ? 'disabled' : ''}>${buttonText}</button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function filterStations() {
  renderStations();
}

function toggleFilterChip(chipElement, type) {
  // Clear other active chips
  const chips = document.querySelectorAll(".filter-chip");
  chips.forEach(c => c.classList.remove("active"));
  
  chipElement.classList.add("active");
  activeFilter = type;
  renderStations();
}

function selectStationForBooking(stationId) {
  const st = STATIONS.find(s => s.id === stationId);
  if (!st) return;

  currentBookingData.stationId = st.id;
  currentBookingData.stationName = st.name;
  currentBookingData.address = st.address;
  currentBookingData.rate = st.rate;
  currentBookingData.selectedDayIndex = 0; // Default today
  currentBookingData.selectedTimeSlot = "";

  showDashboardView("find-book");
  renderBookingSlots();

  const bookEl = document.getElementById("booking-station-title");
  if (bookEl) {
    bookEl.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// ════════════════════════════════════════════════
// SLOT BOOKING ENGINE
// ════════════════════════════════════════════════

function renderBookingSlots() {
  // Headers settings
  document.getElementById("booking-station-title").textContent = currentBookingData.stationName;
  document.getElementById("booking-station-address").textContent = currentBookingData.address;
  document.getElementById("summary-station").textContent = currentBookingData.stationName;
  document.getElementById("summary-rate").textContent = `₹${currentBookingData.rate} / kWh`;

  // Render Calendar Strip (7 Days ahead)
  const calendarContainer = document.getElementById("calendar-days-container");
  if (calendarContainer) {
    calendarContainer.innerHTML = "";
    const daysName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    for (let i = 0; i < 7; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);

      const dayName = i === 0 ? "Today" : daysName[targetDate.getDay()];
      const dayNum = targetDate.getDate();
      
      const dayDiv = document.createElement("div");
      dayDiv.className = `cal-day ${i === currentBookingData.selectedDayIndex ? 'selected' : ''}`;
      dayDiv.onclick = () => selectBookingDate(i, targetDate);

      // Generate random mock slot availability counts
      const slotsAvailCount = i === 0 ? 3 : Math.floor(Math.random() * 8) + 1;

      dayDiv.innerHTML = `
        <div class="day-name">${dayName}</div>
        <div class="day-num">${dayNum}</div>
        <div class="day-slots">${slotsAvailCount} slots</div>
      `;
      calendarContainer.appendChild(dayDiv);
    }
  }

  // Render timeslots
  const timeContainer = document.getElementById("time-slots-container");
  if (timeContainer) {
    timeContainer.innerHTML = "";
    
    const times = [
      "08:00 AM - 09:00 AM", "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM",
      "12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM",
      "04:00 PM - 05:00 PM", "05:00 PM - 06:00 PM", "06:00 PM - 07:00 PM", "07:00 PM - 08:00 PM"
    ];

    times.forEach((t, index) => {
      const slotDiv = document.createElement("div");
      
      // Seed random occupied states
      let isOccupied = Math.random() > 0.65;
      
      // First slot of Today could be occupied to test visual
      if (currentBookingData.selectedDayIndex === 0 && index === 0) isOccupied = true;
      
      const isSelected = t === currentBookingData.selectedTimeSlot;

      if (isOccupied) {
        slotDiv.className = "time-slot occupied";
        slotDiv.textContent = t;
      } else {
        slotDiv.className = `time-slot ${isSelected ? 'selected' : ''}`;
        slotDiv.textContent = t;
        slotDiv.onclick = () => selectBookingTime(slotDiv, t);
      }

      timeContainer.appendChild(slotDiv);
    });
  }

  updateBookingInvoiceDOM();
}

function selectBookingDate(dayIndex, dateObject) {
  currentBookingData.selectedDayIndex = dayIndex;
  currentBookingData.selectedTimeSlot = ""; // Reset time selection on date switch
  
  const formattedDate = dateObject.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  document.getElementById("summary-date").textContent = formattedDate;
  
  renderBookingSlots();
}

function selectBookingTime(slotDivElement, slotTime) {
  // Clear highlight on other slots
  const slots = document.querySelectorAll(".time-slot");
  slots.forEach(s => s.classList.remove("selected"));

  slotDivElement.classList.add("selected");
  currentBookingData.selectedTimeSlot = slotTime;

  document.getElementById("summary-time").textContent = slotTime;
  updateBookingInvoiceDOM();
}

function updateBookingInvoiceDOM() {
  const multiplierVal = document.getElementById("summary-multiplier");
  const totalPriceText = document.getElementById("summary-total-price");

  let multiplier = 1.0;
  if (state.user.tier === "Pro") multiplier = 1.5;
  if (state.user.tier === "Elite") multiplier = 2.0;

  if (multiplierVal) multiplierVal.textContent = `${multiplier.toFixed(1)}x`;

  if (currentBookingData.selectedTimeSlot) {
    // Estimations: energy cost for 25 kWh + Rs 50 Booking fee
    const chargingEstim = 25 * currentBookingData.rate;
    const bookingFee = 50;
    
    // Ad cashback offset
    const cashbackDiscount = chargingEstim * 0.18 * multiplier;
    const finalPrice = Math.max(0, chargingEstim + bookingFee - cashbackDiscount);
    
    totalPriceText.textContent = `₹${finalPrice.toFixed(2)}`;
  } else {
    totalPriceText.textContent = `₹0.00`;
  }
}

function confirmBooking() {
  if (!currentBookingData.selectedTimeSlot) {
    showToast("Please select a vacant booking time slot first.", "error");
    return;
  }

  const dateObject = new Date();
  dateObject.setDate(dateObject.getDate() + currentBookingData.selectedDayIndex);
  const formattedDate = dateObject.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Add booking card to user array
  const newBooking = {
    id: `b_${Date.now()}`,
    stationId: currentBookingData.stationId || "st1",
    stationName: currentBookingData.stationName,
    address: currentBookingData.address,
    date: formattedDate,
    time: currentBookingData.selectedTimeSlot,
    status: "Confirmed"
  };

  state.user.bookings.unshift(newBooking);
  saveState();

  // Sync to backend
  api('/bookings', {
    method: 'POST',
    body: {
      stationId: currentBookingData.stationId || 'st1',
      date: formattedDate,
      time: currentBookingData.selectedTimeSlot
    }
  }).catch(e => console.warn('Booking backend sync notice:', e.message));

  showToast("Booking Confirmed Successfully!", "success");

  // Redirect to Dashboard overview to view list
  showDashboardView("overview");
}

function renderOverviewBookings() {
  const container = document.getElementById("overview-booking-list");
  if (!container) return;

  container.innerHTML = "";

  if (state.user.bookings.length === 0) {
    container.innerHTML = `<div style="font-size: 13px; color: var(--text3); text-align: center; padding: 20px 0;">No active bookings. Select Find Stations to book.</div>`;
    return;
  }

  state.user.bookings.forEach(b => {
    const card = document.createElement("div");
    card.className = "vehicle-card";
    card.style.justifyContent = "space-between";
    card.innerHTML = `
      <div>
        <div style="font-weight: 700; font-size: 14px;">${b.stationName}</div>
        <div style="font-size: 12px; color: var(--text3); margin-top: 4px;"><i class="far fa-calendar-alt"></i> ${b.date} | <i class="far fa-clock"></i> ${b.time}</div>
      </div>
      <span class="badge badge-green">${b.status}</span>
    `;
    container.appendChild(card);
  });
}

// ════════════════════════════════════════════════
// CHARGING REWARDS & WALLET
// ════════════════════════════════════════════════

function renderAds() {
  showDashboardView("rewards");
}

function watchAd() {
  showToast("Rewards are earned automatically from your charging sessions (2 pts/kWh + tier cashback)!", "info");
}

function claimAdRewards() {}
function closeAdModal() {}

// ════════════════════════════════════════════════
// REWARDS & TRANSACTION VIEWS
// ════════════════════════════════════════════════

function renderRewardsVouchers() {
  const container = document.getElementById("redeem-vouchers-container");
  if (!container) return;

  container.innerHTML = "";

  VOUCHERS.forEach(v => {
    const card = document.createElement("div");
    card.className = "redeem-card";
    card.innerHTML = `
      <div class="redeem-icon" style="color: ${v.iconColor};">${v.brand.charAt(0)}</div>
      <h4 style="font-size: 15px; margin-bottom: 6px;">${v.brand}</h4>
      <p style="font-size: 12px; color: var(--text3); margin-bottom: 12px;">${v.title}</p>
      <div class="points-cost">${v.pointsCost} Points</div>
      <button class="btn btn-outline btn-sm" style="width: 100%; border-color: rgba(57, 139, 255, 0.35); color: #F5F6F8;" onclick="redeemPoints('${v.id}')">Redeem for ${v.pointsCost} pts</button>
    `;
    container.appendChild(card);
  });
}

function redeemPoints(voucherId) {
  const v = VOUCHERS.find(x => x.id === voucherId);
  if (!v) return;

  if (state.user.points < v.pointsCost) {
    showToast(`Insufficient balance. You need ${v.pointsCost} points to redeem this card.`, "error");
    return;
  }

  // Deduct points
  state.user.points -= v.pointsCost;
  
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  state.user.transactions.unshift({
    id: `t_red_${Date.now()}`,
    date: dateStr,
    type: `Voucher Redeemed - ${v.brand}`,
    energy: `Voucher Code`,
    cost: `—`,
    points: `-${v.pointsCost} pts`
  });

  saveState();
  syncDashboardValues();
  renderRewardsVouchers();
  renderTransactionTable();

  // Sync with backend API
  api('/rewards/redeem', {
    method: 'POST',
    body: { voucherId: voucherId }
  }).catch(e => console.warn('Voucher redeem backend sync notice:', e.message));

  showToast(`Voucher redeemed successfully! Code: VOLT-${Math.floor(Math.random()*8999)+1000}`, "success");
}

function renderTransactionTable() {
  const container = document.getElementById("transaction-history-table");
  if (!container) return;

  container.innerHTML = "";

  state.user.transactions.forEach(t => {
    const row = document.createElement("tr");
    
    // Styling colors for cost/points
    const isEarning = t.cost.startsWith("+");
    const colorClass = isEarning ? "style='color: var(--blue-electric)'" : "";

    row.innerHTML = `
      <td>${t.date}</td>
      <td>${t.type}</td>
      <td>${t.energy}</td>
      <td ${colorClass}>${t.cost}</td>
      <td ${colorClass}>${t.points}</td>
    `;
    container.appendChild(row);
  });
}

// ════════════════════════════════════════════════
// SUBSCRIPTIONS TIER UPGRADES
// ════════════════════════════════════════════════

function renderSubscriptionCards() {
  const currentTier = (state.user && state.user.tier ? state.user.tier : "Basic").trim();
  const isPro = currentTier.toLowerCase().includes("pro");
  const isElite = currentTier.toLowerCase().includes("elite");

  const proCard = document.getElementById("plan-card-pro");
  const eliteCard = document.getElementById("plan-card-elite");
  const proBtn = document.getElementById("btn-sub-pro");
  const eliteBtn = document.getElementById("btn-sub-elite");
  const subActiveName = document.getElementById("sub-active-tier-name");
  const subActiveBadge = document.getElementById("sub-active-tier-badge");

  if (subActiveName) {
    if (isPro) subActiveName.textContent = "Pro Driver";
    else if (isElite) subActiveName.textContent = "Elite Driver";
    else subActiveName.textContent = "Basic Driver";
  }
  if (subActiveBadge) {
    subActiveBadge.textContent = "Active";
  }

  if (isPro) {
    if (proCard) {
      proCard.classList.add("featured");
      proCard.style.borderColor = "var(--primary)";
    }
    if (proBtn) {
      proBtn.textContent = "Current Active Plan";
      proBtn.className = "btn btn-primary";
      proBtn.disabled = true;
      proBtn.style.opacity = "0.9";
      proBtn.style.cursor = "default";
    }
    if (eliteCard) {
      eliteCard.classList.remove("featured");
      eliteCard.style.borderColor = "";
    }
    if (eliteBtn) {
      eliteBtn.textContent = "Upgrade to Elite";
      eliteBtn.className = "btn btn-outline";
      eliteBtn.disabled = false;
      eliteBtn.style.opacity = "1";
      eliteBtn.style.cursor = "pointer";
    }
  } else if (isElite) {
    if (eliteCard) {
      eliteCard.classList.add("featured");
      eliteCard.style.borderColor = "var(--primary)";
    }
    if (eliteBtn) {
      eliteBtn.textContent = "Current Active Plan";
      eliteBtn.className = "btn btn-primary";
      eliteBtn.disabled = true;
      eliteBtn.style.opacity = "0.9";
      eliteBtn.style.cursor = "default";
    }
    if (proCard) {
      proCard.classList.remove("featured");
      proCard.style.borderColor = "";
    }
    if (proBtn) {
      proBtn.textContent = "Switch to Pro";
      proBtn.className = "btn btn-outline";
      proBtn.disabled = false;
      proBtn.style.opacity = "1";
      proBtn.style.cursor = "pointer";
    }
  } else {
    // Basic Driver
    if (proCard) {
      proCard.classList.add("featured");
      proCard.style.borderColor = "";
    }
    if (proBtn) {
      proBtn.textContent = "Upgrade to Pro";
      proBtn.className = "btn btn-primary";
      proBtn.disabled = false;
      proBtn.style.opacity = "1";
      proBtn.style.cursor = "pointer";
    }
    if (eliteCard) {
      eliteCard.classList.remove("featured");
      eliteCard.style.borderColor = "";
    }
    if (eliteBtn) {
      eliteBtn.textContent = "Upgrade to Elite";
      eliteBtn.className = "btn btn-outline";
      eliteBtn.disabled = false;
      eliteBtn.style.opacity = "1";
      eliteBtn.style.cursor = "pointer";
    }
  }
}

async function upgradeSubscription(tier) {
  state.user.tier = tier;
  saveState();
  syncDashboardValues();
  renderSubscriptionCards();

  try {
    const res = await api('/auth/subscription', {
      method: 'PUT',
      body: { tier: tier }
    });
    if (res && res.tier) {
      state.user.tier = res.tier;
      saveState();
      syncDashboardValues();
      renderSubscriptionCards();
    }
  } catch (err) {
    console.warn("Subscription backend sync note:", err.message);
  }

  showToast(`Switched driver membership tier to ${tier}!`, "success");
}

// ════════════════════════════════════════════════
// PROFILE & VEHICLES MANAGER
// ════════════════════════════════════════════════

function switchProfileSubTab(tab) {
  const tabs = document.querySelectorAll(".profile-tab");
  tabs.forEach(t => t.classList.remove("active"));
  
  document.getElementById(`profile-tab-${tab}`).classList.add("active");

  // Switch views
  document.getElementById("profile-content-details").style.display = tab === "details" ? "block" : "none";
  document.getElementById("profile-content-vehicle").style.display = tab === "vehicle" ? "block" : "none";
  document.getElementById("profile-content-payment").style.display = tab === "payment" ? "block" : "none";
}

function renderProfileVehicles() {
  const container = document.getElementById("profile-vehicles-list-container");
  if (!container) return;

  container.innerHTML = "";

  state.user.vehicles.forEach(v => {
    const card = document.createElement("div");
    card.className = "vehicle-card";
    card.style.justifyContent = "space-between";
    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 16px;">
        <div class="vehicle-icon"><i class="fas fa-car"></i></div>
        <div>
          <div style="font-weight: 700;">${v.brand}</div>
          <div style="font-size: 12px; color: var(--text3);">${v.plate}</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        ${v.active ? '<span class="badge badge-green">Default</span>' : `<button class="btn btn-ghost btn-sm" onclick="setDefaultVehicle('${v.id}')">Set Default</button>`}
        <button class="btn btn-sm" onclick="removeVehicle('${v.id}')" style="background: none; color: var(--danger);"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;
    container.appendChild(card);
  });
}

function addNewVehicle(event) {
  event.preventDefault();
  
  const brand = document.getElementById("vehicle-brand").value;
  const plate = document.getElementById("vehicle-number").value.toUpperCase();

  // Create new EV object
  const newEV = {
    id: `v_${Date.now()}`,
    brand: brand,
    plate: plate,
    active: state.user.vehicles.length === 0 ? true : false
  };

  state.user.vehicles.push(newEV);
  saveState();
  renderProfileVehicles();
  
  document.getElementById("vehicle-number").value = "";
  showToast(`${brand} successfully added to account profile.`, "success");
}

function setDefaultVehicle(vehicleId) {
  state.user.vehicles.forEach(v => {
    v.active = v.id === vehicleId;
  });
  saveState();
  renderProfileVehicles();
  showToast("Default EV updated.", "success");
}

function removeVehicle(vehicleId) {
  state.user.vehicles = state.user.vehicles.filter(v => v.id !== vehicleId);
  
  // Re-establish active selection if deleted primary
  if (state.user.vehicles.length > 0 && !state.user.vehicles.some(v => v.active)) {
    state.user.vehicles[0].active = true;
  }
  
  saveState();
  renderProfileVehicles();
  showToast("Vehicle removed from registry.", "success");
}

async function saveProfileDetails(event) {
  event.preventDefault();
  
  const nameInput = document.getElementById("profile-name-input");
  const phoneInput = document.getElementById("profile-phone-input");
  const cityInput = document.getElementById("profile-city-input");

  const name = nameInput ? nameInput.value.trim() : "";
  const phone = phoneInput ? phoneInput.value.trim() : "";
  const city = cityInput ? cityInput.value.trim() : "";

  if (!name) {
    showToast("Please enter a valid profile name.", "error");
    return;
  }

  // Update local state immediately for instant UI responsiveness
  state.user.name = name;
  state.user.phone = phone;
  state.user.city = city;

  saveState();
  syncDashboardValues();

  // Persist to backend database / store.json
  try {
    const res = await api("/user/profile", {
      method: "PUT",
      body: { name, phone, city }
    });
    if (res && res.user) {
      state.user.name = res.user.name || name;
      state.user.phone = res.user.phone !== undefined ? res.user.phone : phone;
      state.user.city = res.user.city !== undefined ? res.user.city : city;
      saveState();
      syncDashboardValues();
    }
    showToast("Profile name and details saved successfully!", "success");
  } catch (err) {
    console.warn("Backend profile save warning:", err.message);
    // If backend is unavailable, local persistence is already established
    showToast("Profile updated locally.", "success");
  }
}

// ════════════════════════════════════════════════
// ADMIN DASHBOARD & ADV PANEL
// ════════════════════════════════════════════════

async function renderAdminView() {
  if (!isCurrentUserAdmin()) {
    showToast(`Access Denied: Only Administrator (${ADMIN_EMAIL}) can access this panel.`, "error");
    showDashboardView("overview");
    return;
  }

  // 1. Fetch live metrics from backend
  try {
    const statsData = await api("/admin/stats");
    if (statsData) {
      const activeEl = document.getElementById("admin-active-sessions");
      const advEl = document.getElementById("admin-advertiser-count");
      if (activeEl) activeEl.textContent = statsData.activeSessions || "489";
      if (advEl) advEl.textContent = statsData.activeAdvertisers || "34 Brands";
    }
  } catch (e) {
    // fallback to local defaults
  }

  // 2. Render Campaigns Table
  renderAdminCampaigns();

  // 3. Render Stations Manager Table
  renderAdminStations();

  // 4. Render Users Table
  renderAdminUsers();

  // 5. Render Bookings Table
  renderAdminBookings();
}

function renderAdminCampaigns() {
  const container = document.getElementById("admin-campaign-list");
  if (!container) return;
  container.innerHTML = "";

  adminCampaigns.forEach((c, index) => {
    const tr = document.createElement("tr");
    const statusText = c.active ? "badge-green" : "badge-red";
    const statusLabel = c.active ? "Active" : "Paused";
    const actionLabel = c.active ? "Pause" : "Resume";
    const actionClass = c.active ? "btn-outline" : "btn-primary";

    tr.innerHTML = `
      <td style="font-weight: 600;">${c.brand}</td>
      <td>${c.target}</td>
      <td>${(c.impressions || 0).toLocaleString()} views</td>
      <td>₹${(c.spend || 0).toLocaleString()}</td>
      <td><span class="badge ${statusText}">${statusLabel}</span></td>
      <td>
        <button class="btn ${actionClass} btn-sm" onclick="toggleCampaign(${index})">${actionLabel}</button>
      </td>
    `;
    container.appendChild(tr);
  });
}

function toggleNewCampaignForm() {
  const container = document.getElementById("new-campaign-form-container");
  if (!container) return;
  container.style.display = container.style.display === "none" ? "block" : "none";
}

async function submitNewCampaign() {
  const brand = document.getElementById("new-camp-brand").value.trim();
  const target = document.getElementById("new-camp-target").value.trim();
  const spend = document.getElementById("new-camp-spend").value;

  if (!brand || !target) {
    showToast("Please provide both Brand Name and Target Audience.", "error");
    return;
  }

  const newCamp = {
    id: adminCampaigns.length + 1,
    brand,
    target,
    impressions: 0,
    spend: Number(spend) || 50000,
    active: true
  };

  adminCampaigns.push(newCamp);

  // Sync to backend
  api('/campaigns', {
    method: 'POST',
    body: { brand, target, spend: newCamp.spend }
  }).catch(e => console.warn('Campaign sync notice:', e.message));

  toggleNewCampaignForm();
  renderAdminCampaigns();
  showToast(`Launched campaign for ${brand}!`, "success");

  // Reset inputs
  document.getElementById("new-camp-brand").value = "";
  document.getElementById("new-camp-target").value = "";
  document.getElementById("new-camp-spend").value = "";
}

function toggleCampaign(index) {
  adminCampaigns[index].active = !adminCampaigns[index].active;
  renderAdminCampaigns();

  // Sync with backend
  api(`/campaigns/${adminCampaigns[index].id || index + 1}/toggle`, {
    method: 'PUT'
  }).catch(e => console.warn('Toggle campaign sync notice:', e.message));

  const statusStr = adminCampaigns[index].active ? "resumed" : "paused";
  showToast(`Campaign ${adminCampaigns[index].brand} is now ${statusStr}.`, "success");
}

async function renderAdminStations() {
  const container = document.getElementById("admin-station-list");
  if (!container) return;

  let stations = STATIONS;
  try {
    const res = await api("/stations");
    if (res && res.stations) stations = res.stations;
  } catch (e) {
    // fallback to local STATIONS
  }

  const badgeEl = document.getElementById("admin-station-count-badge");
  if (badgeEl) badgeEl.textContent = `${stations.length} Hubs Monitored`;

  container.innerHTML = "";
  stations.forEach((s) => {
    const tr = document.createElement("tr");
    const isAvail = s.status === "available";
    const statusBadge = isAvail ? "badge-green" : (s.status === "busy" ? "badge-red" : "badge-outline");
    const actionLabel = isAvail ? "Set Maintenance" : "Set Available";

    tr.innerHTML = `
      <td style="font-weight: 600;"><i class="fas ${s.icon || 'fa-bolt'}" style="color:var(--blue-electric); margin-right:6px;"></i> ${s.name}</td>
      <td>${s.type}</td>
      <td><span style="color:var(--blue); font-weight:600;">${s.power}</span></td>
      <td>₹${s.rate}</td>
      <td><strong>${s.slotsAvail}</strong> / ${s.slotsTotal}</td>
      <td><span class="badge ${statusBadge}">${s.status.toUpperCase()}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="toggleStationStatus('${s.id}', '${s.status}')">${actionLabel}</button>
      </td>
    `;
    container.appendChild(tr);
  });
}

async function toggleStationStatus(stationId, currentStatus) {
  const newStatus = currentStatus === "available" ? "maintenance" : "available";
  const st = STATIONS.find(x => x.id === stationId);
  if (st) {
    st.status = newStatus;
  }

  try {
    await api(`/admin/stations/${stationId}/status`, {
      method: 'PUT',
      body: { status: newStatus }
    });
  } catch (e) {
    console.warn('Station status sync notice:', e.message);
  }

  renderAdminStations();
  showToast(`Station status updated to ${newStatus}.`, "success");
}

async function renderAdminUsers() {
  const container = document.getElementById("admin-user-list");
  if (!container) return;

  let users = [];

  try {
    const res = await api("/admin/users");
    if (res && res.users) {
      users = res.users;
    }
  } catch (e) {
    console.error("Failed to load admin users:", e);
  }

  container.innerHTML = "";
  if (users.length === 0) {
    container.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--text2); padding:1.5rem;">No user accounts found.</td></tr>`;
    return;
  }

  users.forEach((u) => {
    const isAdmin = String(u.email || '').trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const roleLabel = isAdmin ? "Administrator" : "Driver";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight: 600;">
        <span style="display:inline-block; width:26px; height:26px; background:var(--surface2); border-radius:50%; text-align:center; line-height:26px; font-size:12px; margin-right:6px; color:${isAdmin ? 'var(--gold)' : 'var(--blue-electric)'};">
          ${(u.name || 'U').charAt(0).toUpperCase()}
        </span>
        ${u.name || 'User'}
      </td>
      <td style="color:var(--text2);">${u.email || '-'}</td>
      <td>${u.phone || '-'}</td>
      <td>${u.city || 'Bengaluru'}</td>
      <td><span class="badge ${isAdmin ? 'badge-gold' : (u.tier === 'Elite' ? 'badge-gold' : (u.tier === 'Pro' ? 'badge-green' : 'badge-outline'))}">${isAdmin ? 'Admin Console' : (u.tier || 'Basic')}</span></td>
      <td style="font-weight:600; color:var(--blue-electric);">₹${Number(u.wallet || 0).toFixed(2)}</td>
      <td>${u.points || 0} pts</td>
      <td><span class="badge ${isAdmin ? 'badge-gold' : 'badge-outline'}">${roleLabel}</span></td>
    `;
    container.appendChild(tr);
  });
}

function refreshAdminUsers() {
  renderAdminUsers();
  showToast("User accounts refreshed.", "success");
}

async function renderAdminBookings() {
  const container = document.getElementById("admin-booking-list");
  if (!container) return;

  let bookings = state.user.bookings || [];
  try {
    const res = await api("/admin/bookings");
    if (res && res.bookings) bookings = res.bookings;
  } catch (e) {
    // fallback
  }

  container.innerHTML = "";
  if (bookings.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text3); padding: 18px;">No active network bookings.</td></tr>`;
    return;
  }

  bookings.forEach((b) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-family: monospace; font-size: 12px; color: var(--text3);">${b.id}</td>
      <td style="font-weight: 600;">${b.stationName}</td>
      <td>${b.date}</td>
      <td><span style="color: var(--blue);">${b.time}</span></td>
      <td><span class="badge ${b.status === 'Completed' ? 'badge-outline' : 'badge-green'}">${b.status}</span></td>
    `;
    container.appendChild(tr);
  });
}

// ════════════════════════════════════════════════
// LOGGED-IN NAVBAR: PROFILE PICTURE MENU + WINDOWS
// ════════════════════════════════════════════════

function escapeHTML(str) {
  return String(str == null ? "" : str).replace(/[&<>"']/g, ch => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
  ));
}

function getBookingHistory() {
  // Bookings made from the map page + bookings stored in app state
  let mapHistory = [];
  try {
    mapHistory = JSON.parse(localStorage.getItem("evioBookingHistory")) || [];
  } catch (e) {
    mapHistory = [];
  }
  const stateBookings = (state.user && state.user.bookings) ? state.user.bookings : [];
  return [...mapHistory, ...stateBookings];
}

function getEarnedTotal() {
  const u = state.user || {};
  const current = u.points || 0;
  return typeof u.pointsEarnedTotal === "number" ? Math.max(u.pointsEarnedTotal, current) : current;
}

const PLAN_DETAILS = {
  Basic: { label: "Free Plan", fee: "₹0", multiplier: "1.0x", bookings: "3 bookings / month", power: "Up to 22 kW", lead: "24 hours" },
  Pro:   { label: "Pro Driver", fee: "₹299 / month", multiplier: "1.5x", bookings: "Unlimited", power: "Up to 50 kW", lead: "3 days" },
  Elite: { label: "Elite Driver", fee: "₹599 / month", multiplier: "2.0x", bookings: "Unlimited", power: "Up to 120+ kW", lead: "7 days" }
};

// ---------- Navbar state (guest vs logged in) ----------

function applyAvatar(el, u) {
  if (!el) return;
  if (u.photo) {
    el.style.backgroundImage = `url("${u.photo}")`;
    el.textContent = "";
  } else {
    el.style.backgroundImage = "";
    el.textContent = u.name ? u.name.charAt(0).toUpperCase() : "U";
  }
}

function renderNavUser() {
  const u = state.user || {};
  applyAvatar(document.getElementById("navAvatar"), u);
  applyAvatar(document.getElementById("pd-avatar"), u);

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set("pd-name", u.name || "User");
  set("pd-email", u.email || "");
  set("pd-points-badge", `${u.points || 0} pts`);
}

function updateNavAuthState() {
  const guest = document.getElementById("navGuestActions");
  const menu = document.getElementById("navProfile");
  const loggedIn = !!state.loggedIn;

  if (guest) guest.style.display = loggedIn ? "none" : "flex";
  if (menu) menu.style.display = loggedIn ? "block" : "none";

  if (loggedIn) renderNavUser();
  else closeProfileDropdown();
}

function toggleProfileDropdown(event) {
  if (event) event.stopPropagation();
  const dropdown = document.getElementById("profileDropdown");
  const btn = document.getElementById("navAvatarBtn");
  if (!dropdown) return;

  const willOpen = !dropdown.classList.contains("open");
  if (willOpen) renderNavUser();
  dropdown.classList.toggle("open", willOpen);
  if (btn) btn.classList.toggle("open", willOpen);
}

function closeProfileDropdown() {
  const dropdown = document.getElementById("profileDropdown");
  const btn = document.getElementById("navAvatarBtn");
  if (dropdown) dropdown.classList.remove("open");
  if (btn) btn.classList.remove("open");
}

// Close dropdown on outside click, close windows with Escape
document.addEventListener("click", closeProfileDropdown);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeProfileDropdown();
    closeUserModal();
  }
});

// Smart handlers for homepage buttons and navigation
function handlePlanClick() {
  if (state.loggedIn) openUserModal("subscription");
  else showPage("auth");
}

function startCharging() {
  if (state.loggedIn) window.location.href = "map.html";
  else showPage("auth");
}

function navToStationBooking() {
  if (state.loggedIn) {
    showPage("dashboard");
    showDashboardView("find-book");
  } else {
    showPage("auth");
  }
}

function navToChargingRewards() {
  if (state.loggedIn) {
    showPage("dashboard");
    showDashboardView("rewards");
  } else {
    showPage("auth");
  }
}

function navToAdRewards() {
  navToChargingRewards();
}

function navToAdmin() {
  if (isCurrentUserAdmin()) {
    window.location.href = "/admin";
  } else {
    showToast(`Access Denied: Only Administrator (${ADMIN_EMAIL}) can access this panel.`, "error");
    if (!state.loggedIn) {
      showPage("auth");
    }
  }
}

function handleNavHamburger() {
  if (state.loggedIn) {
    showPage("dashboard");
  } else {
    showPage("auth");
  }
}

function openAuthModal(tab) {
  if (state.loggedIn) {
    showToast("You are already logged in.", "success");
    showPage("dashboard");
    return;
  }
  showPage("auth");
  if (typeof toggleAuthTab === "function") {
    toggleAuthTab(tab || "login");
  }
}
window.openAuthModal = openAuthModal;

// ---------- Popup window (modal) ----------

function openUserModal(type) {
  closeProfileDropdown();

  const modal = document.getElementById("userModal");
  const title = document.getElementById("userModalTitle");
  const body = document.getElementById("userModalBody");
  if (!modal || !title || !body) return;

  const titles = {
    profile: "Profile Settings",
    rewards: "My Rewards",
    subscription: "Subscription Details",
    bookings: "Booking Status"
  };
  title.textContent = titles[type] || "";
  modal.dataset.view = type;

  if (type === "profile") renderProfileModal();
  else if (type === "rewards") renderRewardsModal();
  else if (type === "subscription") renderSubscriptionModal();
  else if (type === "bookings") renderBookingsModal();

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeUserModal() {
  const modal = document.getElementById("userModal");
  if (modal) modal.classList.remove("active");
  document.body.style.overflow = "";
}

// Back: close the window and return to the account menu
function goBackFromModal() {
  closeUserModal();
  const dropdown = document.getElementById("profileDropdown");
  const btn = document.getElementById("navAvatarBtn");
  if (dropdown && state.loggedIn) {
    renderNavUser();
    dropdown.classList.add("open");
    if (btn) btn.classList.add("open");
  }
}

// ---------- 1. Profile Settings ----------

function dobToInputValue(dob) {
  if (!dob) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) return dob;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function readProfileDraft() {
  const val = (id) => {
    const el = document.getElementById(id);
    return el ? el.value : undefined;
  };
  return { name: val("um-name"), phone: val("um-phone"), dob: val("um-dob") };
}

function renderProfileModal(draft) {
  const u = state.user;
  const d = draft || {};
  const name = d.name !== undefined ? d.name : (u.name || "");
  const phone = d.phone !== undefined ? d.phone : (u.phone || "");
  const dob = d.dob !== undefined ? d.dob : dobToInputValue(u.dob);
  const today = new Date().toISOString().split("T")[0];

  document.getElementById("userModalBody").innerHTML = `
    <div class="um-photo-row">
      <div class="nav-avatar um-photo" id="um-photo-preview"></div>
      <div>
        <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('um-photo-input').click()"><i class="fas fa-camera"></i> Change Photo</button>
        ${u.photo ? `<button type="button" class="btn btn-ghost btn-sm" style="margin-left:8px;" onclick="removeProfilePhoto()">Remove</button>` : ""}
        <input type="file" id="um-photo-input" accept="image/*" style="display:none;" onchange="handlePhotoUpload(event)">
        <div style="font-size:12px;color:var(--text3);margin-top:8px;">JPG or PNG, shown in the top-right corner.</div>
      </div>
    </div>
    <form onsubmit="saveUserProfile(event)">
      <div class="um-grid">
        <div class="form-group">
          <label for="um-name">Name</label>
          <input type="text" id="um-name" class="form-input" value="${escapeHTML(name)}" required>
        </div>
        <div class="form-group">
          <label for="um-phone">Mobile No.</label>
          <input type="tel" id="um-phone" class="form-input" value="${escapeHTML(phone)}" placeholder="+91 98765 43210">
        </div>
        <div class="form-group">
          <label for="um-email">Email ID</label>
          <input type="email" id="um-email" class="form-input" value="${escapeHTML(u.email || "")}" disabled>
        </div>
        <div class="form-group">
          <label for="um-dob">DOB</label>
          <input type="date" id="um-dob" class="form-input" value="${escapeHTML(dob)}" max="${today}">
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="margin-top:6px;">Save Changes</button>
    </form>
  `;
  applyAvatar(document.getElementById("um-photo-preview"), u);
}

function saveUserProfile(event) {
  event.preventDefault();
  const name = document.getElementById("um-name").value.trim();
  if (!name) {
    showToast("Name cannot be empty.", "error");
    return;
  }
  state.user.name = name;
  state.user.phone = document.getElementById("um-phone").value.trim();
  state.user.dob = document.getElementById("um-dob").value;

  saveState();
  syncDashboardValues();
  renderNavUser();
  closeUserModal();
  showToast("Profile updated successfully.", "success");
}

function handlePhotoUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Please choose an image file.", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      // Center-crop to a small square so it fits in storage
      const size = 160;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      canvas.getContext("2d").drawImage(img, sx, sy, side, side, 0, 0, size, size);

      const draft = readProfileDraft();
      state.user.photo = canvas.toDataURL("image/jpeg", 0.85);
      try {
        saveState();
      } catch (e) {
        showToast("Photo is too large to save.", "error");
      }
      renderNavUser();
      renderProfileModal(draft);
      showToast("Profile photo updated.", "success");
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function removeProfilePhoto() {
  const draft = readProfileDraft();
  state.user.photo = "";
  saveState();
  renderNavUser();
  renderProfileModal(draft);
  showToast("Profile photo removed.", "success");
}

// ---------- 2. Rewards ----------

function renderRewardsModal() {
  const u = state.user;
  const remaining = u.points || 0;
  const earned = getEarnedTotal();
  const used = Math.max(0, earned - remaining);
  const pct = earned > 0 ? Math.min(100, Math.round((remaining / earned) * 100)) : 0;

  const recent = (u.transactions || []).slice(0, 5).map(t => {
    const isEarning = String(t.points).startsWith("+");
    return `
      <div class="um-list-row">
        <div>
          <div style="font-weight:600;font-size:13px;">${escapeHTML(t.type)}</div>
          <div style="font-size:12px;color:var(--text3);margin-top:2px;">${escapeHTML(t.date)}</div>
        </div>
        <div style="font-weight:700;color:${isEarning ? "var(--blue-electric)" : "var(--text2)"};">${escapeHTML(t.points)}</div>
      </div>`;
  }).join("");

  document.getElementById("userModalBody").innerHTML = `
    <div class="um-grid um-grid-3">
      <div class="um-stat">
        <div class="um-stat-label">Total Earned</div>
        <div class="um-stat-val" style="color:var(--blue-electric);">${earned} pts</div>
      </div>
      <div class="um-stat">
        <div class="um-stat-label">Used</div>
        <div class="um-stat-val">${used} pts</div>
      </div>
      <div class="um-stat um-stat-highlight">
        <div class="um-stat-label">Remaining</div>
        <div class="um-stat-val" style="color:var(--gold);">${remaining} pts</div>
      </div>
    </div>

    <div style="margin:18px 0 6px;font-size:12px;color:var(--text3);">${pct}% of your earned points are still available (1 pt = ₹1)</div>
    <div class="progress-track" style="height:8px;"><div class="progress-fill" style="width:${pct}%"></div></div>

    <h4 style="margin:24px 0 8px;font-size:14px;">Recent Activity</h4>
    <div>${recent || `<div class="pd-empty">No reward activity yet.</div>`}</div>

    <a href="map.html" class="btn btn-primary btn-sm" style="margin-top:20px;"><i class="fas fa-bolt"></i> Use Points on a Booking</a>
  `;
}

// ---------- 3. Subscription Details ----------

function renderSubscriptionModal() {
  const tier = state.user.tier;
  const isPaid = tier === "Pro" || tier === "Elite";
  const plan = PLAN_DETAILS[tier] || PLAN_DETAILS.Basic;

  const rows = [
    ["Current Plan", isPaid ? plan.label : "No active subscription"],
    ["Monthly Fee", plan.fee],
    ["Cashback Multiplier", plan.multiplier],
    ["Booking Limit", plan.bookings],
    ["Max Charging Power", plan.power],
    ["Booking Lead Time", plan.lead]
  ].map(r => `
    <div class="um-list-row">
      <span style="color:var(--text3);">${r[0]}</span>
      <span style="font-weight:600;">${escapeHTML(r[1])}</span>
    </div>`).join("");

  const planButtons = ["Pro", "Elite"].filter(p => p !== tier).map(p => {
    let verb = "Subscribe to";
    if (tier === "Pro" && p === "Elite") verb = "Upgrade to";
    if (tier === "Elite" && p === "Pro") verb = "Switch to";
    const cls = p === "Elite" ? "btn-primary" : "btn-outline";
    return `<button class="btn ${cls} btn-sm" onclick="changePlanFromModal('${p}')">${verb} ${p} — ${PLAN_DETAILS[p].fee}</button>`;
  }).join("");

  document.getElementById("userModalBody").innerHTML = `
    <div style="margin-bottom:14px;">
      <span class="badge ${isPaid ? "badge-green" : "badge-gold"}">${isPaid ? "Active" : "Free tier"}</span>
    </div>
    <div>${rows}</div>
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:22px;">${planButtons}</div>
  `;
}

function changePlanFromModal(tier) {
  upgradeSubscription(tier);
  renderSubscriptionModal();
}

// ---------- 4. Booking Status ----------

function renderBookingsModal() {
  const history = getBookingHistory();
  const body = document.getElementById("userModalBody");

  if (history.length === 0) {
    body.innerHTML = `
      <div class="pd-empty" style="padding:30px 0;">You have no bookings yet.</div>
      <a href="map.html" class="btn btn-primary btn-sm"><i class="fas fa-map-marker-alt"></i> Book a Slot</a>`;
    return;
  }

  const cards = history.map(b => {
    const status = b.status || "Confirmed";
    const badge = status === "Confirmed" ? "badge-green" : "badge-gold";
    const idText = b.id && String(b.id).startsWith("EVIO-") ? ` | ${escapeHTML(b.id)}` : "";
    return `
      <div class="um-booking">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
          <div style="font-weight:700;font-size:14px;">${escapeHTML(b.stationName)}</div>
          <span class="badge ${badge}">${escapeHTML(status)}</span>
        </div>
        ${b.address ? `<div style="font-size:12px;color:var(--text3);margin-top:4px;">${escapeHTML(b.address)}</div>` : ""}
        <div style="font-size:12px;color:var(--text2);margin-top:8px;">
          ${escapeHTML(b.date)} | ${escapeHTML(b.time)}${b.chargingType ? " | " + escapeHTML(b.chargingType) + " charging" : ""}${idText}
        </div>
      </div>`;
  }).join("");

  body.innerHTML = `
    <div style="font-size:13px;color:var(--text3);margin-bottom:12px;">${history.length} booking${history.length > 1 ? "s" : ""}</div>
    <div style="display:flex;flex-direction:column;gap:10px;">${cards}</div>
  `;
}

// ════════════════════════════════════════════════
// MY STATS (BMS + TPMS) — UI only
// Real data: call updateBMSStats({...}) once the BMS is connected
// ════════════════════════════════════════════════

// Expected data shape (all null until BMS sends data)
const BMS_EMPTY = {
  connected: false,
  voltage: null,          // V
  temperature: null,      // °C
  soc: null,              // %
  soh: null,              // %
  rangeKm: null,          // km
  charging: {
    avgStartLevel: null,  // %
    avgEndLevel: null     // %
  },
  tyreRecommendedPsi: 35, // change per vehicle
  tyres: {
    fl: { pressure: null, temp: null }, // PSI, °C
    fr: { pressure: null, temp: null },
    rl: { pressure: null, temp: null },
    rr: { pressure: null, temp: null }
  }
};

// Sample values used only by the "Preview with sample data" button
const BMS_SAMPLE = {
  connected: true,
  voltage: 382.4,
  temperature: 31.5,
  soc: 72,
  soh: 96,
  rangeKm: 248,
  charging: { avgStartLevel: 28, avgEndLevel: 64 },
  tyreRecommendedPsi: 35,
  tyres: {
    fl: { pressure: 35.2, temp: 29 },
    fr: { pressure: 34.8, temp: 30 },
    rl: { pressure: 33.9, temp: 31 },
    rr: { pressure: 28.4, temp: 32 }
  }
};

// Temperature bands (°C) — adjust as per battery spec
const BMS_TEMP_BANDS = { cold: 10, warm: 40, hot: 50 };

let bmsData = JSON.parse(JSON.stringify(BMS_EMPTY));
let bmsSampleOn = false;

function mergeBMS(target, source) {
  Object.keys(source).forEach(key => {
    const val = source[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      target[key] = mergeBMS(target[key] || {}, val);
    } else {
      target[key] = val;
    }
  });
  return target;
}

// Call this with real BMS data later, e.g. updateBMSStats({ connected: true, voltage: 381.2, soc: 70 })
function updateBMSStats(data) {
  mergeBMS(bmsData, data || {});
  renderMyStats();
}

function openMyStats(event) {
  if (event) event.preventDefault();
  if (!state.loggedIn) {
    showToast("Please log in to view your stats.", "error");
    showPage("auth");
    return;
  }
  showPage("stats");
  renderMyStats();
}

function toggleBMSSample() {
  bmsSampleOn = !bmsSampleOn;
  bmsData = JSON.parse(JSON.stringify(bmsSampleOn ? BMS_SAMPLE : BMS_EMPTY));
  renderMyStats();
}

function getTempStatus(t) {
  if (t == null) return { label: "No data", cls: "badge-muted" };
  if (t < BMS_TEMP_BANDS.cold) return { label: "Cold", cls: "badge-blue" };
  if (t < BMS_TEMP_BANDS.warm) return { label: "Normal", cls: "badge-green" };
  if (t < BMS_TEMP_BANDS.hot) return { label: "Warm", cls: "badge-gold" };
  return { label: "Hot", cls: "badge-red" };
}

function getTyreStatus(psi, recommended) {
  if (psi == null) return { label: "No data", cls: "badge-muted", level: "none" };
  const diff = (psi - recommended) / recommended;
  if (diff < -0.2) return { label: "Very Low", cls: "badge-red", level: "bad" };
  if (diff < -0.1) return { label: "Low", cls: "badge-gold", level: "warn" };
  if (diff > 0.1) return { label: "High", cls: "badge-gold", level: "warn" };
  return { label: "Normal", cls: "badge-green", level: "ok" };
}

function fmtVal(v, digits, unit) {
  if (v == null) return "--";
  return `${Number(v).toFixed(digits)}${unit ? " " + unit : ""}`;
}

function renderMyStats() {
  const d = bmsData;
  const setText = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  // Vehicle name
  const veh = (state.user.vehicles || []).find(v => v.active) || (state.user.vehicles || [])[0];
  setText("stats-vehicle", veh ? `${veh.brand} • ${veh.plate}` : "No vehicle added");

  // Connection status
  const badge = document.getElementById("bms-status-badge");
  if (badge) {
    badge.textContent = d.connected ? "BMS Connected" : "BMS Not Connected";
    badge.className = `badge ${d.connected ? "badge-green" : "badge-gold"}`;
  }
  const notice = document.getElementById("bms-notice");
  if (notice) notice.style.display = d.connected ? "none" : "flex";
  const sampleBtn = document.getElementById("bms-sample-btn");
  if (sampleBtn) sampleBtn.textContent = bmsSampleOn ? "Clear sample data" : "Preview with sample data";

  // Battery
  setText("bms-voltage", fmtVal(d.voltage, 1, "V"));
  setText("bms-temp", fmtVal(d.temperature, 1, "°C"));
  const tempStatus = getTempStatus(d.temperature);
  const tempBadge = document.getElementById("bms-temp-badge");
  if (tempBadge) {
    tempBadge.textContent = tempStatus.label;
    tempBadge.className = `badge ${tempStatus.cls}`;
  }

  setText("bms-soc", d.soc == null ? "--" : `${Math.round(d.soc)}%`);
  const ring = document.getElementById("bms-soc-ring");
  if (ring) {
    ring.style.background = d.soc == null
      ? "conic-gradient(var(--border) 0% 100%)"
      : `conic-gradient(var(--blue-electric) 0% ${d.soc}%, rgba(57,139,255,0.12) ${d.soc}% 100%)`;
  }

  setText("bms-soh", fmtVal(d.soh, 0, "%"));
  setText("bms-range", fmtVal(d.rangeKm, 0, "km"));

  // Charging behaviour
  const c = d.charging || {};
  setText("bms-avg-start-level", fmtVal(c.avgStartLevel, 0, "%"));
  setText("bms-avg-end-level", fmtVal(c.avgEndLevel, 0, "%"));
  const fill = document.getElementById("bms-range-fill");
  if (fill) {
    if (c.avgStartLevel != null && c.avgEndLevel != null) {
      fill.style.left = `${c.avgStartLevel}%`;
      fill.style.width = `${Math.max(0, c.avgEndLevel - c.avgStartLevel)}%`;
    } else {
      fill.style.left = "0";
      fill.style.width = "0";
    }
  }

  const alerts = [];

  // Alerts (generated from the values above)
  if (d.temperature != null && d.temperature >= BMS_TEMP_BANDS.warm) {
    alerts.push({ level: d.temperature >= BMS_TEMP_BANDS.hot ? "bad" : "warn", text: `Battery temperature is ${tempStatus.label.toLowerCase()} (${d.temperature.toFixed(1)} °C).` });
  }
  if (d.soc != null && d.soc < 20) {
    alerts.push({ level: "warn", text: `Battery level is low (${Math.round(d.soc)}%). Consider charging soon.` });
  }

  const alertBox = document.getElementById("bms-alerts");
  if (alertBox) {
    if (!d.connected) {
      alertBox.innerHTML = `<div class="pd-empty">Alerts will appear here once BMS is connected.</div>`;
    } else if (alerts.length === 0) {
      alertBox.innerHTML = `<div class="pd-empty" style="color:var(--blue-electric);"><i class="fas fa-check-circle"></i> No active alerts. Everything looks good.</div>`;
    } else {
      alertBox.innerHTML = alerts.map(a => `
        <div class="stats-alert ${a.level}">
          <i class="fas fa-exclamation-triangle"></i> ${a.text}
        </div>`).join("");
    }
  }
}

// ════════════════════════════════════════════════
// RUN INITIALIZER
// ════════════════════════════════════════════════

window.showAdmin = function() {
  if (!isCurrentUserAdmin()) {
    showToast(`Access Denied: Only Administrator (${ADMIN_EMAIL}) can access this panel.`, "error");
    if (!state.loggedIn) {
      openAuthModal("login");
    }
    return;
  }
  showPage("dashboard");
  showDashboardView("admin");
};

window.addEventListener("hashchange", () => {
  const hash = window.location.hash.replace("#", "").toLowerCase();
  if (hash === "admin") {
    if (!isCurrentUserAdmin()) {
      showToast(`Access Denied: Only Administrator (${ADMIN_EMAIL}) can access this panel.`, "error");
      window.location.hash = "";
      showPage("landing");
    } else {
      showPage("dashboard");
      showDashboardView("admin");
    }
  } else if (["overview", "stations", "booking", "rewards", "subscriptions", "profile"].includes(hash)) {
    showPage("dashboard");
    showDashboardView(hash);
  } else if (hash === "dashboard") {
    showPage("dashboard");
    showDashboardView("overview");
  } else if (hash === "landing" || hash === "home") {
    showPage("landing");
  } else if (hash === "login" || hash === "auth") {
    showPage("auth");
    toggleAuthTab("login");
  } else if (hash === "signup") {
    showPage("auth");
    toggleAuthTab("signup");
  }
});

// ════════════════════════════════════════════════
// OUTCROWD DYNAMIC ANIMATION ENGINE
// ════════════════════════════════════════════════

function initOutcrowdTilt() {
  const tiltWrapper = document.getElementById('heroCardWrapper') || document.querySelector('.hero-visual');
  const card = document.getElementById('heroVisualCard') || document.querySelector('.ev-card-mockup');
  const cryst1 = document.querySelector('.crystal-fragment.crystal-1');
  const cryst2 = document.querySelector('.crystal-fragment.crystal-2');
  if (!tiltWrapper || !card) return;

  tiltWrapper.addEventListener('mousemove', (e) => {
    card.style.animationPlayState = 'paused';

    const rect = tiltWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -11;
    const rotateY = ((x - centerX) / centerX) * 11;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

    // Magnetic parallax for crystal shards
    if (cryst1) {
      const c1x = ((x - centerX) / centerX) * -16;
      const c1y = ((y - centerY) / centerY) * -16;
      cryst1.style.transform = `translate3d(${c1x.toFixed(1)}px, ${c1y.toFixed(1)}px, 20px) rotate(${rotateY * 0.4}deg)`;
    }
    if (cryst2) {
      const c2x = ((x - centerX) / centerX) * 18;
      const c2y = ((y - centerY) / centerY) * 18;
      cryst2.style.transform = `translate3d(${c2x.toFixed(1)}px, ${c2y.toFixed(1)}px, 30px) rotate(${rotateX * -0.4}deg)`;
    }
  });

  tiltWrapper.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
    if (cryst1) {
      cryst1.style.transform = '';
      cryst1.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
    }
    if (cryst2) {
      cryst2.style.transform = '';
      cryst2.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
    }
    setTimeout(() => {
      card.style.animationPlayState = 'running';
      card.style.transition = '';
      if (cryst1) cryst1.style.transition = '';
      if (cryst2) cryst2.style.transition = '';
    }, 650);
  });

  tiltWrapper.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.12s ease-out';
    if (cryst1) cryst1.style.transition = 'transform 0.12s ease-out';
    if (cryst2) cryst2.style.transition = 'transform 0.12s ease-out';
  });

  // Also apply subtle tilt and mouse spotlight to Benefit Cards
  const benefitCards = document.querySelectorAll('.benefit-card');
  benefitCards.forEach(bc => {
    bc.addEventListener('mousemove', (e) => {
      const rect = bc.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -6;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 6;
      bc.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;
      bc.style.setProperty('--spotlight-x', `${x}px`);
      bc.style.setProperty('--spotlight-y', `${y}px`);
    });
    bc.addEventListener('mouseleave', () => {
      bc.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
      bc.style.transition = 'transform 0.4s ease';
    });
    bc.addEventListener('mouseenter', () => {
      bc.style.transition = 'transform 0.08s ease-out';
    });
  });
}

function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-counter]');
  if (!counters.length) return;

  function runCounter(el) {
    if (el.dataset.counterStarted) return;
    el.dataset.counterStarted = "true";

    const targetVal = parseInt(el.getAttribute('data-counter'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 1800;
    const startTime = performance.now();

    function updateCount(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(targetVal * ease);

      if (targetVal >= 1000 && suffix.includes('K')) {
        el.textContent = `${prefix}${Math.floor(current / 1000)}${suffix}`;
      } else if (targetVal >= 1000) {
        el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
      } else {
        el.textContent = `${prefix}${current}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    }
    requestAnimationFrame(updateCount);
  }

  // Trigger counters right away on load if hero is visible
  setTimeout(() => {
    counters.forEach(c => {
      const rect = c.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        runCounter(c);
      }
    });
  }, 250);

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  counters.forEach(c => observer.observe(c));
}

function initChargingSimulation() {
  const pctEl = document.getElementById('liveChargePct');
  const circleProgress = document.getElementById('chargeCircleProgress') || document.querySelector('.radar-progress');
  if (!pctEl || !circleProgress) return;

  const targetPct = 72;
  const totalLength = 301.59;
  circleProgress.style.strokeDasharray = totalLength;
  circleProgress.style.strokeDashoffset = totalLength;

  const duration = 2200;
  const startTime = performance.now();

  function animateGauge(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const currentPct = Math.round(targetPct * ease);

    pctEl.textContent = `${currentPct}%`;
    const offset = totalLength - (totalLength * (currentPct / 100));
    circleProgress.style.strokeDashoffset = offset;

    if (progress < 1) {
      requestAnimationFrame(animateGauge);
    }
  }
  setTimeout(() => requestAnimationFrame(animateGauge), 350);
}

function initMouseSpotlight() {
  const cards = document.querySelectorAll('.benefit-card, .station-card, .ev-info-item, .auth-mini-card, .stat-col');
  cards.forEach(card => {
    card.classList.add('card-spotlight');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--spotlight-x', `${x}px`);
      card.style.setProperty('--spotlight-y', `${y}px`);
    });
  });

  const hero = document.getElementById('heroSection');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      hero.style.setProperty('--mouse-x', `${x}px`);
      hero.style.setProperty('--mouse-y', `${y}px`);
    });
  }
}

function initScrollReveal() {
  const targets = document.querySelectorAll('.benefit-card, .hiw-step, .plan-card');
  targets.forEach(el => el.classList.add('reveal-on-scroll'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(el => observer.observe(el));
}

// ════════════════════════════════════════════════
// HOW IT WORKS ANIMATION VIDEO CONTROLS
// ════════════════════════════════════════════════
function toggleHiwVideoPlay() {
  const vid = document.getElementById("hiwAnimationVideo");
  const btn = document.getElementById("hiwPlayPauseBtn");
  if (!vid) return;

  if (vid.paused) {
    vid.play().then(() => {
      if (btn) btn.innerHTML = '<i class="fas fa-pause"></i>';
    }).catch(err => console.warn("Video play prevented:", err));
  } else {
    vid.pause();
    if (btn) btn.innerHTML = '<i class="fas fa-play"></i>';
  }
}

function restartHiwVideo() {
  const vid = document.getElementById("hiwAnimationVideo");
  const btn = document.getElementById("hiwPlayPauseBtn");
  if (!vid) return;
  vid.currentTime = 0;
  vid.play().then(() => {
    if (btn) btn.innerHTML = '<i class="fas fa-pause"></i>';
  }).catch(() => {});
}

function toggleHiwFullscreen() {
  const frame = document.querySelector(".hiw-video-frame") || document.getElementById("hiwAnimationVideo");
  if (!frame) return;
  if (!document.fullscreenElement) {
    if (frame.requestFullscreen) {
      frame.requestFullscreen();
    } else if (frame.webkitRequestFullscreen) {
      frame.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

function initHiwVideo() {
  const vid = document.getElementById("hiwAnimationVideo");
  const btn = document.getElementById("hiwPlayPauseBtn");
  if (!vid) return;

  vid.muted = true;
  vid.setAttribute("muted", "");
  vid.setAttribute("playsinline", "");
  
  // Try autoplay
  vid.play().catch(() => {});

  vid.addEventListener("play", () => {
    if (btn) btn.innerHTML = '<i class="fas fa-pause"></i>';
  });
  vid.addEventListener("pause", () => {
    if (btn) btn.innerHTML = '<i class="fas fa-play"></i>';
  });

  // Pause when scrolled off screen to conserve resources, resume when visible
  if ("IntersectionObserver" in window) {
    const vidObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    }, { threshold: 0.2 });
    vidObserver.observe(vid);
  }
}

// ════════════════════════════════════════════════
// INTERACTIVE ENERGY PARTICLES CANVAS
// ════════════════════════════════════════════════
function initHeroParticleCanvas() {
  const canvas = document.getElementById('heroParticleCanvas');
  const hero = document.getElementById('heroSection');
  if (!canvas || !hero) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  let isRunning = false;
  let width = 0;
  let height = 0;
  const dpr = window.devicePixelRatio || 1;

  let mouse = { x: -9999, y: -9999, radius: 140 };

  const PARTICLE_COUNT = 45;
  const particles = [];
  const colors = [
    { r: 57, g: 139, b: 255 },  // Electric Blue (#398BFF)
    { r: 34, g: 211, b: 238 },  // Electric Cyan (#22D3EE)
    { r: 105, g: 183, b: 255 }  // Radiant Sky Blue (#69B7FF)
  ];

  function resizeCanvas() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const col = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 1.2,
        color: col,
        alpha: Math.random() * 0.35 + 0.35,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseAngle: Math.random() * Math.PI * 2
      });
    }
  }

  function draw() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Subtle breathing pulse
      p.pulseAngle += p.pulseSpeed;
      const currentAlpha = p.alpha + Math.sin(p.pulseAngle) * 0.15;

      // Cursor interaction
      const dxMouse = mouse.x - p.x;
      const dyMouse = mouse.y - p.y;
      const distMouse = Math.hypot(dxMouse, dyMouse);
      if (distMouse < mouse.radius && distMouse > 0) {
        const force = (mouse.radius - distMouse) / mouse.radius;
        const angle = Math.atan2(dyMouse, dxMouse);
        p.x -= Math.cos(angle) * force * 1.4;
        p.y -= Math.sin(angle) * force * 1.4;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around bounds
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Render glowing node
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${Math.max(0.12, currentAlpha)})`;
      ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.5)`;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inter-particle filament connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 105) {
          const lineAlpha = (1 - dist / 105) * 0.22;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(57, 139, 255, ${lineAlpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }

      // Cursor filament connection
      if (distMouse < 110) {
        const cursorLineAlpha = (1 - distMouse / 110) * 0.35;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(34, 211, 238, ${cursorLineAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    animationFrameId = requestAnimationFrame(draw);
  }

  function start() {
    if (!isRunning) {
      isRunning = true;
      animationFrameId = requestAnimationFrame(draw);
    }
  }

  function stop() {
    if (isRunning) {
      isRunning = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    }
  }

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  hero.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  // Pause when hero is scrolled out of view to maintain 60fps & 0% battery waste
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
        }
      });
    }, { threshold: 0.05 });
    observer.observe(hero);
  } else {
    start();
  }

  resizeCanvas();
  createParticles();
  start();
}

// ════════════════════════════════════════════════
// MAGNETIC BUTTON PHYSICS
// ════════════════════════════════════════════════
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.hero-actions .btn, .btn-primary, .btn-outcrowd-primary');

  buttons.forEach(btn => {
    btn.classList.add('btn-magnetic');

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.28;
      const deltaY = (e.clientY - centerY) * 0.28;

      btn.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadState();
  syncDashboardValues();

  // Default to hash or landing page for visitors
  const initialHash = window.location.hash.replace("#", "").toLowerCase();
  if (initialHash === "auth" || initialHash === "login") {
    showPage("auth");
    toggleAuthTab("login");
  } else if (initialHash === "signup") {
    showPage("auth");
    toggleAuthTab("signup");
  } else if (initialHash === "map") {
    window.location.href = "map.html";
  } else if (["overview", "stations", "booking", "rewards", "subscriptions", "profile"].includes(initialHash)) {
    showPage("dashboard");
    showDashboardView(initialHash);
  } else if (initialHash === "dashboard") {
    showPage("dashboard");
    showDashboardView("overview");
  } else {
    showPage("landing");
  }

  // Check if returning from Google OAuth redirect (?auth=google or ?auth_error=...)
  checkUrlAuthStatus();

  // Ask the backend if the user is still logged in
  restoreSession();

  // Initialize Outcrowd Dynamic Animations
  initOutcrowdTilt();
  initCounterAnimation();
  initChargingSimulation();
  initMouseSpotlight();
  initScrollReveal();
  initHiwVideo();
  initHeroParticleCanvas();
  initMagneticButtons();
});