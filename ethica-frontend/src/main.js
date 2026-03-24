import { createIcons, 
  Menu, X, LogOut, LayoutDashboard, Users, FileText, CheckSquare, Settings 
} from 'https://esm.sh/lucide';
import { renderLogin } from "./pages/Auth/login.js";
import { renderRegister } from "./pages/Auth/register.js";
import { renderAdminDashboard } from "./pages/Dashboard/admin.js";
import { renderEmployeeDashboard } from "./pages/Dashboard/employee.js";
import { renderHrDashboard } from "./pages/Dashboard/hr.js";
import { renderManagerDashboard } from "./pages/Dashboard/manager.js";
import "./styles/global.css";
import "./styles/dashboard.css";
import "./styles/admin.css";

// Expose to window for any other components that might still use the global
window.lucide = {
  createIcons,
  icons: {
    Menu, X, LogOut, LayoutDashboard, Users, FileText, CheckSquare, Settings
  }
};


window.showLogin = renderLogin;
window.showRegister = renderRegister;
window.showAdminDashboard = renderAdminDashboard;
window.showEmployeeDashboard = renderEmployeeDashboard;
window.showHrDashboard = renderHrDashboard;
window.showManagerDashboard = renderManagerDashboard;

const API_BASE = "";

function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  window.location.hash = "";
}

function routeByRole(user) {
  if (!user || !user.role) {
    renderLogin();
    return;
  }

  // Update hash based on role
  const role = user.role;
  if (role === "admin") {
    window.location.hash = "#/admin";
    renderAdminDashboard();
  } else if (role === "hr") {
    window.location.hash = "#/hr";
    renderHrDashboard();
  } else if (role === "manager") {
    window.location.hash = "#/manager";
    renderManagerDashboard();
  } else {
    window.location.hash = "#/employee";
    renderEmployeeDashboard();
  }
}

// Handle browser back/forward buttons and initial load
function handleHashChange() {
  const hash = window.location.hash;
  const userStr = sessionStorage.getItem("user");

  if (!userStr) {
    if (!hash || hash === "#/login") {
      renderLogin();
    } else {
      // Trying to access protected route -> redirect to login
      renderLogin();
    }
    return;
  }

  const user = JSON.parse(userStr);

  // Simple router based on hash
  if (hash === "#/admin" && user.role === "admin") {
    renderAdminDashboard();
  } else if (hash === "#/hr" && user.role === "hr") {
    renderHrDashboard();
  } else if (hash === "#/manager" && user.role === "manager") {
    renderManagerDashboard();
  } else if (hash === "#/employee" && user.role === "employee") {
    renderEmployeeDashboard();
  } else if (hash === "#/login" || hash === "") {
    // If logged in but at login page, redirect to role dashboard
    routeByRole(user);
  } else {
    // Unknown or unauthorized route, fallback to role default
    routeByRole(user);
  }
}

async function bootstrapApp() {
  // STRICT AUTH: Only check sessionStorage. 
  // If user opens a new tab, sessionStorage is empty -> force login.
  const token = sessionStorage.getItem("token");

  if (!token) {
    clearAuth();
    renderLogin();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      clearAuth();
      renderLogin();
      return;
    }

    const data = await response.json();
    const user = data?.user || null;

    if (!user) {
      clearAuth();
      renderLogin();
      return;
    }

    // Update storage with fresh data
    sessionStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("token", token);

    // Initial routing
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);

  } catch (e) {
    console.error("Bootstrap error:", e);
    clearAuth();
    renderLogin();
  }
}

bootstrapApp();
