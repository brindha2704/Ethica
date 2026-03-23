import { apiGet, apiPost, apiPut, apiDelete } from "../../api/client.js";
import { createTeamPerformanceChart, createDepartmentDistributionChart } from "../../components/Admin/TeamCharts.js";

export function renderAdminDashboard() {
  const app = document.getElementById("app");
  const user = JSON.parse(sessionStorage.getItem("user"));
  const username = user?.name || user?.firstName || user?.first_name || "Admin";

  // Navigation State
  let currentPage = "dashboard";
  let lastNotificationId = 0;
  let audioUnlocked = false;

  const unlockAudio = () => {
    if (audioUnlocked) return;
    const audio = new Audio("/sounds/mild_sound.mp3");
    audio.volume = 0;
    audio.play().then(() => {
      audioUnlocked = true;
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
      console.log("Admin Audio Unlocked");
    }).catch(() => { });
  };
  document.addEventListener("click", unlockAudio);
  document.addEventListener("touchstart", unlockAudio);

  // --- Main Layout ---
  app.innerHTML = `
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="brand" style="display:flex; flex-direction:column; gap:16px; padding:20px 16px; margin: 12px 12px 32px 12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:12px; transition:0.2s; cursor:default;" onmouseover="this.style.background='rgba(255,255,255,0.04)';" onmouseout="this.style.background='rgba(255,255,255,0.02)';">
          <div style="display:flex; align-items:center; justify-content:center;">
             <img src="/images/logo.png" alt="Ethica" style="width: 100%; max-width: 140px; height: auto; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));" />
          </div>
          <div style="display:flex; flex-direction:column; border-top: 1px solid rgba(255,255,255,0.06); padding-top:14px; text-align:center;">
             <span style="font-weight:800; font-size:1.05rem; color:#f8fafc; letter-spacing:-0.2px;">Administrator</span>
             <span style="font-size:0.75rem; color:#93c5fd; font-weight:600; margin-top:4px;">System Control</span>
          </div>
        </div>
        <ul class="nav-menu">
          <li class="nav-item active" data-page="dashboard">
            <i data-lucide="layout-grid"></i> Dashboard
          </li>
          <li class="nav-item" data-page="users">
             <i data-lucide="users"></i> Team Users
          </li>
          <li class="nav-item" data-page="tasks">
             <i data-lucide="clipboard-list"></i> Overdue Tasks
          </li>
          <li class="nav-item" data-page="reports">
             <i data-lucide="file-bar-chart"></i> Reports
          </li>
          <li class="nav-item" data-page="settings">
             <i data-lucide="settings"></i> Settings
          </li>
        </ul>
        
        <div style="margin-top: auto;">
          <button id="adminLogoutBtn" class="nav-item" style="width:100%; border:none; background:none; font-size:1rem; cursor:pointer;">
            <i data-lucide="log-out"></i> Logout
          </button>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; padding:12px 24px; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.2);">
          <h1 class="page-title" id="pageTitle" style="font-size:1.5rem; font-weight:800; color:#ffffff; margin:0; letter-spacing:-0.5px;">Admin Dashboard</h1>
          <div style="display:flex; align-items:center; gap:20px;">
             <div id="adminNotifyBtn" class="notification-btn" style="position:relative; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); cursor:pointer; width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:12px; transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
               <i data-lucide="bell" style="color:#ffffff; width:20px; height:20px;"></i>
               <span id="notifBadge" style="display:none; position:absolute; top:-6px; right:-6px; background:#ef4444; width:20px; height:20px; border-radius:50%; border:2px solid #0f172a; color:white; font-size:10px; font-weight:800; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(239, 68, 68, 0.4);"></span>
               <!-- Dropdown -->
               <div id="notifDropdown" style="display:none; position:absolute; top:54px; right:0; width:320px; background:rgba(15, 23, 42, 0.95); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.1); border-radius:16px; box-shadow:0 20px 40px rgba(0,0,0,0.5); z-index:1000; overflow:hidden;">
                  <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02);">
                    <span style="font-weight:700; color:#ffffff; font-size:0.95rem;">Notifications</span>
                  </div>
                  <div id="notifList" style="max-height:350px; overflow-y:auto; padding:8px;">
                    <div style="padding:32px 20px; text-align:center; color:rgba(255,255,255,0.4); font-size:0.9rem;">No new notifications</div>
                  </div>
               </div>
             </div>
             <div style="height:32px; width:1px; background:rgba(255,255,255,0.1);"></div>
             <div style="display:flex; align-items:center; gap:12px; cursor:pointer;">
                <div style="display:flex; flex-direction:column; align-items:flex-end;">
                   <span style="font-weight:700; font-size:0.9rem; color:#ffffff; line-height:1.2;">${username}</span>
                   <span style="font-size:0.7rem; color:#60a5fa; font-weight:800; letter-spacing:0.5px;">ADMINISTRATOR</span>
                </div>
                <div class="avatar" style="width:40px; height:40px; background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); border-radius:12px; display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:1.1rem; border:2px solid rgba(255,255,255,0.2); box-shadow:0 4px 12px rgba(37,99,235,0.3);">
                   ${username.charAt(0)}
                </div>
             </div>
          </div>
        </header>

        <div id="contentArea"></div>
      </main>
    </div>
  `;

  // --- Sidebar Listeners ---
  document.querySelectorAll(".nav-menu .nav-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-menu .nav-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      const page = item.getAttribute("data-page");
      loadPage(page);
    });
  });

  // Logout Listener
  document.getElementById("adminLogoutBtn")?.addEventListener("click", () => {
    sessionStorage.clear();
    localStorage.clear();
    location.reload();
  });

  // --- Router ---
  function loadPage(page) {
    currentPage = page;
    const contentArea = document.getElementById("contentArea");
    const titleEl = document.getElementById("pageTitle");

    contentArea.innerHTML = '<div style="padding:20px; text-align:center;">Loading...</div>';
    isLoadingDashboard = (page === "dashboard");

    if (page === "dashboard") {
      titleEl.textContent = "Admin Dashboard";
      renderOverview(contentArea);
    } else if (page === "users") {
      titleEl.textContent = "Team Users";
      renderUsers(contentArea);
    } else if (page === "tasks") {
      titleEl.textContent = "Overdue Tasks";
      renderTasks(contentArea);
    } else if (page === "reports") {
      titleEl.textContent = "Reports";
      renderReports(contentArea);
    } else if (page === "settings") {
      titleEl.textContent = "Settings";
      renderSettings(contentArea);
    }

    if (window.lucide && window.lucide.createIcons) {
      setTimeout(() => window.lucide.createIcons(), 100);
    }
  }

  // --- Views ---

  async function renderOverview(container) {
    container.innerHTML = `
        <section class="stats-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:24px; margin-bottom:32px;">
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
              <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statUsers">0</div>
              <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Team Users</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
              <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statEmployees">0</div>
              <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Employees</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
              <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statManagers">0</div>
              <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">HR Teams</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
              <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statDelays">0</div>
              <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Delays</div>
           </div>
        </section>

        <section class="charts-section" style="display:grid; grid-template-columns:1.5fr 1fr; gap:24px; margin-bottom:32px;">
           <div class="chart-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; padding:20px; height:350px;">
              <canvas id="teamPerformanceChart"></canvas>
           </div>
           <div class="chart-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; padding:20px; height:350px;">
              <canvas id="deptDistributionChart"></canvas>
           </div>
        </section>

        <section style="display:grid; grid-template-columns:1.5fr 1fr; gap:32px;">
          <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden; padding:0;">
            <h3 style="margin:20px 24px; color:#3b82f6;">Overdue Tasks</h3>
            <table class="data-table" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:rgba(30, 64, 175, 0.1);">
                  <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Assignee / Task</th>
                  <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Delay</th>
                  <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Status</th>
                </tr>
              </thead>
              <tbody id="adminOverdueTableBody">
                <tr><td colspan="3" style="text-align:center; padding:20px; color:rgba(255,255,255,0.5);">Loading...</td></tr>
              </tbody>
            </table>
          </div>

          <div class="table-card" style="padding:24px;">
            <ul id="adminActivityList" style="padding-left:20px; color:var(--text-muted); line-height:2;">
               <li>Loading activity...</li>
            </ul>
          </div>
        </section>
    `;
    hydrateOverview();
  }

  async function renderUsers(container) {
    container.innerHTML = `
        <div class="user-filter-bar" style="display:flex; gap:16px; margin-bottom:24px; align-items:center;">
           <div class="search-input-wrap" style="flex:1; position:relative;">
              <i data-lucide="search" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#3b82f6;"></i>
              <input type="text" class="search-input" id="userSearch" placeholder="Search team members..." 
                style="width:100%; padding-left:45px; background:#0f172a; border:2px solid #1e40af; color:white; border-radius:10px; height:48px; font-size:1rem; box-shadow:0 4px 20px rgba(0,0,0,0.4);">
           </div>
           <select class="filter-select" id="roleFilter" style="background:#0f172a; border:2px solid #1e40af; color:white; border-radius:10px; padding:0 15px; height:48px; font-weight:600; cursor:pointer;">
              <option value="all">Filters: All</option>
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="employee">Employee</option>
           </select>
           <button class="add-user-btn" onclick="window.showUserModal()" 
            style="background:linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color:white; border:none; padding:10px 24px; border-radius:8px; font-weight:600; cursor:pointer;">Add User</button>
        </div>

        <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden;">
           <table class="data-table" style="width:100%; border-collapse:collapse;">
              <thead>
                 <tr style="background:rgba(30, 64, 175, 0.1);">
                    <th style="padding:16px 24px; text-align:left; color:#60a5fa; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid rgba(30,64,175,0.3);">Name</th>
                    <th style="padding:16px 24px; text-align:left; color:#60a5fa; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid rgba(30,64,175,0.3);">Email</th>
                    <th style="padding:16px 24px; text-align:left; color:#60a5fa; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid rgba(30,64,175,0.3);">Role</th>
                    <th style="padding:16px 24px; text-align:left; color:#60a5fa; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid rgba(30,64,175,0.3);">Status</th>
                    <th style="padding:16px 24px; text-align:left; color:#60a5fa; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid rgba(30,64,175,0.3);">Actions</th>
                 </tr>
              </thead>
              <tbody id="usersTableBody">
                 <tr><td colspan="5" style="text-align:center; padding:40px; color:rgba(255,255,255,0.5);">Loading users...</td></tr>
              </tbody>
           </table>
        </div>

        <!-- User Modal -->
        <div id="userModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:2000; align-items:center; justify-content:center; backdrop-filter: blur(8px);">
           <div style="background:#0a0a0a; border:1px solid rgba(255,255,255,0.1); border-radius:16px; width:480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); overflow:hidden; display:flex; flex-direction:column;">
              <div style="padding: 24px 24px 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02);">
                 <h3 id="userModalTitle" style="margin:0; font-size:1.25rem; font-weight:700; color:#f8fafc; letter-spacing:-0.4px;">Add User</h3>
              </div>
              <form id="userForm" style="padding:24px; display:flex; flex-direction:column; gap:16px;">
                 <input type="hidden" id="userId">
                 
                 <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                    <div>
                       <label style="display:block; font-size:0.75rem; color:#94a3b8; font-weight:600; margin-bottom:6px; letter-spacing:0.3px;">First Name</label>
                       <input type="text" id="userFirstName" placeholder="Sarah" required style="width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px; padding:10px 14px; font-size:0.9rem; transition:0.2s; outline:none;" onfocus="this.style.borderColor='#3b82f6'; this.style.background='rgba(59,130,246,0.05)';" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(255,255,255,0.03)';">
                    </div>
                    <div>
                       <label style="display:block; font-size:0.75rem; color:#94a3b8; font-weight:600; margin-bottom:6px; letter-spacing:0.3px;">Last Name</label>
                       <input type="text" id="userLastName" placeholder="Williams" required style="width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px; padding:10px 14px; font-size:0.9rem; transition:0.2s; outline:none;" onfocus="this.style.borderColor='#3b82f6'; this.style.background='rgba(59,130,246,0.05)';" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(255,255,255,0.03)';">
                    </div>
                 </div>

                 <div>
                    <label style="display:block; font-size:0.75rem; color:#94a3b8; font-weight:600; margin-bottom:6px; letter-spacing:0.3px;">Email Address</label>
                    <input type="email" id="userEmail" placeholder="sarah.w@ethica.com" required style="width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px; padding:10px 14px; font-size:0.9rem; transition:0.2s; outline:none;" onfocus="this.style.borderColor='#3b82f6'; this.style.background='rgba(59,130,246,0.05)';" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(255,255,255,0.03)';">
                 </div>

                 <div>
                    <label style="display:block; font-size:0.75rem; color:#94a3b8; font-weight:600; margin-bottom:6px; letter-spacing:0.3px;">Reset User Password (Admin Only)</label>
                    <input type="password" id="userPassword" placeholder="New Password (leave blank to keep current)" style="width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px; padding:10px 14px; font-size:0.9rem; transition:0.2s; outline:none;" onfocus="this.style.borderColor='#3b82f6'; this.style.background='rgba(59,130,246,0.05)';" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(255,255,255,0.03)';">
                 </div>

                 <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
                    <div>
                       <label style="display:block; font-size:0.75rem; color:#94a3b8; font-weight:600; margin-bottom:6px; letter-spacing:0.3px;">Role</label>
                       <select id="userRole" style="width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px; padding:10px 14px; font-size:0.9rem; outline:none; cursor:pointer;" onfocus="this.style.borderColor='#3b82f6'; this.style.background='rgba(59,130,246,0.05)';" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(255,255,255,0.03)';">
                          <option value="employee" style="background:#0f172a;">Employee</option>
                          <option value="hr" style="background:#0f172a;">HR</option>
                          <option value="admin" style="background:#0f172a;">Admin</option>
                       </select>
                    </div>
                    <div>
                       <label style="display:block; font-size:0.75rem; color:#94a3b8; font-weight:600; margin-bottom:6px; letter-spacing:0.3px;">Department</label>
                       <input type="text" id="userDept" placeholder="e.g. Technical" style="width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px; padding:10px 14px; font-size:0.9rem; transition:0.2s; outline:none;" onfocus="this.style.borderColor='#3b82f6'; this.style.background='rgba(59,130,246,0.05)';" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(255,255,255,0.03)';">
                    </div>
                 </div>

                 <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.05);">
                    <button type="button" onclick="window.closeUserModal()" style="padding:10px 20px; background:rgba(255,255,255,0.05); color:#f8fafc; border:1px solid rgba(255,255,255,0.1); border-radius:8px; font-weight:600; font-size:0.9rem; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">Cancel</button>
                    <button type="submit" style="padding:10px 24px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:white; border:none; border-radius:8px; font-weight:600; font-size:0.9rem; cursor:pointer; box-shadow:0 4px 12px rgba(37,99,235,0.2); transition:0.2s;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(37,99,235,0.3)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 12px rgba(37,99,235,0.2)'">Save</button>
                 </div>
              </form>
           </div>
        </div>
    `;

    document.getElementById("userSearch").addEventListener("input", (e) => {
      fetchAndRenderUsersList(e.target.value.toLowerCase(), document.getElementById("roleFilter").value);
    });
    document.getElementById("roleFilter").addEventListener("change", (e) => {
      fetchAndRenderUsersList(document.getElementById("userSearch").value.toLowerCase(), e.target.value);
    });

    await fetchAndRenderUsersList();
    attachUserFormHandler();
  }

  async function fetchAndRenderUsersList(searchTerm = "", roleFilter = "all") {
    try {
      const data = await apiGet("/api/users");
      const usersRaw = data?.users || [];
      const tbody = document.getElementById("usersTableBody");
      if (!tbody) return;

      const users = usersRaw.filter(u => {
        const name = (u.name || (u.firstName + ' ' + u.lastName)).toLowerCase();
        const matchesSearch = name.includes(searchTerm) || u.email.toLowerCase().includes(searchTerm);
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        return matchesSearch && matchesRole;
      });

      if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:40px;">No users found.</td></tr>`;
        return;
      }

      window.__usersList = users;
      const hrs = users.filter(u => u.role === 'hr');
      const employees = users.filter(u => u.role === 'employee');

      let html = "";
      const renderRow = (u, isChild = false) => `
        <tr style="border-bottom: 1px solid rgba(30, 64, 175, 0.1);">
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              ${isChild ? '<div style="width:20px; height:20px; border-left:1px solid rgba(30, 64, 175, 0.2); border-bottom:1px solid rgba(30, 64, 175, 0.2); margin-top:-10px;"></div>' : ''}
              <span style="font-weight:500;">${u.name || (u.firstName + ' ' + u.lastName)}</span>
            </div>
          </td>
          <td style="color:rgba(255,255,255,0.7);">${u.email}</td>
          <td><span class="role-badge ${u.role}">${u.role.toUpperCase()}</span></td>
          <td>
            <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(30, 64, 175, 0.15); color:#3b82f6; padding:4px 12px; border-radius:20px; font-size:0.75rem; font-weight:700; border:1px solid rgba(30,64,175,0.3);">
              <span style="width:6px; height:6px; background:#3b82f6; border-radius:50%; box-shadow:0 0 6px #3b82f6;"></span>
              Active
            </span>
          </td>
          <td>
            <div style="display:flex; gap:8px;">
              <button onclick="window.editUser(${u.id})" style="background:#1e40af; color:white; border:none; padding:6px 14px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer; transition:0.2s;">Edit</button>
              <button onclick="window.deleteUser(${u.id})" style="background:rgba(30, 64, 175, 0.4); color:#93c5fd; border:1px solid #1e40af; padding:6px 14px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer; transition:0.2s;">Delete</button>
            </div>
          </td>
        </tr>
      `;

      hrs.forEach(hr => {
        html += renderRow(hr);
        employees.filter(e => e.department === hr.department).forEach(emp => html += renderRow(emp, true));
      });
      employees.filter(e => !hrs.some(h => h.department === e.department)).forEach(emp => html += renderRow(emp));
      users.filter(u => u.role !== 'hr' && u.role !== 'employee').forEach(u => html += renderRow(u));

      tbody.innerHTML = html;
      if (window.lucide) window.lucide.createIcons();
    } catch (e) {
      console.error(e);
    }
  }

  function attachUserFormHandler() {
    document.getElementById("userForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("userId").value;
      const payload = {
        firstName: document.getElementById("userFirstName").value,
        lastName: document.getElementById("userLastName").value,
        email: document.getElementById("userEmail").value,
        role: document.getElementById("userRole").value,
        department: document.getElementById("userDept").value
      };
      if (document.getElementById("userPassword").value) payload.password = document.getElementById("userPassword").value;

      try {
        if (id) await apiPut(`/api/users/${id}`, payload);
        else await apiPost("/api/users", payload);
        window.closeUserModal();
        fetchAndRenderUsersList();
      } catch (err) { alert(err.message); }
    });
  }

  window.editUser = (id) => {
    const user = window.__usersList.find(u => u.id === id);
    if (!user) return;
    document.getElementById("userId").value = user.id;
    document.getElementById("userFirstName").value = user.firstName || "";
    document.getElementById("userLastName").value = user.lastName || "";
    document.getElementById("userEmail").value = user.email || "";
    document.getElementById("userRole").value = user.role;
    document.getElementById("userDept").value = user.department || "";
    document.getElementById("userModalTitle").textContent = "Edit User";
    document.getElementById("userModal").style.display = "flex";
  };

  window.deleteUser = async (id) => {
    if (confirm("Are you sure you want to permanently delete this user?")) {
      try {
        await apiDelete(`/api/users/${id}`);
        if (window.showToast) window.showToast("User successfully deleted.");
        fetchAndRenderUsersList();
      } catch (err) {
        if (window.showToast) window.showToast("Failed to delete: " + err.message, "error");
        else alert("Failed to delete user: " + err.message);
      }
    }
  };

  window.showUserModal = () => {
    document.getElementById("userForm").reset();
    document.getElementById("userId").value = "";
    document.getElementById("userModalTitle").textContent = "Add User";
    document.getElementById("userModal").style.display = "flex";
  };
  window.closeUserModal = () => document.getElementById("userModal").style.display = "none";

  window.openPasswordModal = () => {
    const input = document.getElementById("newPasswordInput");
    if (input) input.value = "";
    document.getElementById("passwordModal").style.display = "flex";
  };
  window.closePasswordModal = () => {
    document.getElementById("passwordModal").style.display = "none";
  };
  window.submitPasswordUpdate = async (e) => {
    e.preventDefault();
    const newPass = document.getElementById("newPasswordInput").value;
    if (!newPass) return;
    try {
      const user = JSON.parse(sessionStorage.getItem("user"));
      // Use PUT /api/users/:id to update the password securely
      await apiPut(`/api/users/${user.id}`, { password: newPass });
      window.closePasswordModal();
      if (window.showToast) window.showToast("Password successfully updated!");
      else alert("Password successfully updated!");
    } catch (err) {
      if (window.showToast) window.showToast("Failed to update password", "error");
      else alert("Failed to update password");
    }
  };
  window.handleTwoFactorAuth = () => {
    if (window.showToast) window.showToast("Two-Factor Authentication instructions sent to your email!");
    else alert("2FA instructions sent!");
  };

  async function renderTasks(container) {
    container.innerHTML = `
      <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden;">
        <table class="data-table" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:rgba(30, 64, 175, 0.1);">
              <th style="padding:16px 24px; text-align:left; color:#60a5fa; font-size:0.75rem; text-transform:uppercase;">Task</th>
              <th style="padding:16px 24px; text-align:left; color:#60a5fa; font-size:0.75rem; text-transform:uppercase;">Assignee</th>
              <th style="padding:16px 24px; text-align:left; color:#60a5fa; font-size:0.75rem; text-transform:uppercase;">Due Date</th>
              <th style="padding:16px 24px; text-align:left; color:#60a5fa; font-size:0.75rem; text-transform:uppercase;">Status</th>
            </tr>
          </thead>
          <tbody id="adminTasksBody">
            <tr><td colspan="4" style="text-align:center; padding:40px; color:rgba(255,255,255,0.5);">Loading tasks...</td></tr>
          </tbody>
        </table>
      </div>`;
    try {
      const data = await apiGet("/api/tasks");
      const tbody = document.getElementById("adminTasksBody");
      if (tbody) {
        tbody.innerHTML = (data.tasks || []).map(t => `
          <tr style="border-bottom: 1px solid rgba(30, 64, 175, 0.1);">
            <td style="padding:16px 24px; font-weight:500;">${t.title}</td>
            <td style="padding:16px 24px; color:rgba(255,255,255,0.7);">${t.assigneeName}</td>
            <td style="padding:16px 24px; color:rgba(255,255,255,0.7);">${t.dueDate}</td>
            <td style="padding:16px 24px;">
              <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(30, 64, 175, 0.15); color:#3b82f6; padding:4px 12px; border-radius:20px; font-size:0.75rem; font-weight:700; border:1px solid rgba(30,64,175,0.3);">
                ${t.status}
              </span>
            </td>
          </tr>`).join("");
      }
    } catch (e) { }
  }

  async function renderReports(container) {
    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:24px;">
        <section class="stats-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px;">
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.15); border:1px solid #1e40af; padding:20px; border-radius:12px; text-align:center;">
              <h4 style="color:#93c5fd; margin-bottom:8px; font-size:1.4rem;">98%</h4>
              <div style="color:rgba(255,255,255,0.6); font-size:0.8rem;">System Uptime</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.15); border:1px solid #1e40af; padding:20px; border-radius:12px; text-align:center;">
              <h4 style="color:#3b82f6; margin-bottom:8px; font-size:1.4rem;">${(window.__usersList || []).length}</h4>
              <div style="color:rgba(255,255,255,0.6); font-size:0.8rem;">Total Active Accounts</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.15); border:1px solid #1e40af; padding:20px; border-radius:12px; text-align:center;">
              <h4 style="color:#ef4444; margin-bottom:8px; font-size:1.4rem;">High</h4>
              <div style="color:rgba(255,255,255,0.6); font-size:0.8rem;">Engagement Score</div>
           </div>
        </section>

        <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden;">
           <div style="padding:16px 24px; border-bottom:1px solid rgba(30, 64, 175, 0.3); background:rgba(30, 64, 175, 0.1);">
              <h3 style="margin:0; font-size:1.1rem; color:#3b82f6;">System Escalation Report</h3>
           </div>
           <table class="data-table" style="width:100%; border-collapse:collapse;">
              <thead>
                 <tr style="background:rgba(30, 64, 175, 0.05);">
                    <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.75rem; text-transform:uppercase;">Activity</th>
                    <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.75rem; text-transform:uppercase;">User / Dept</th>
                    <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.75rem; text-transform:uppercase;">Priority</th>
                 </tr>
              </thead>
              <tbody id="adminReportsBody">
                 <tr><td colspan="3" style="text-align:center; padding:40px; color:rgba(255,255,255,0.5);">Generating detailed report...</td></tr>
              </tbody>
           </table>
        </div>
      </div>
    `;

    try {
      const data = await apiGet("/api/admin/stats/overview");
      const overdue = data.overdueSummary || [];
      const tbody = document.getElementById("adminReportsBody");
      if (tbody) {
        tbody.innerHTML = overdue.length > 0
          ? overdue.map(t => `
            <tr style="border-bottom: 1px solid rgba(30, 64, 175, 0.1);">
              <td style="padding:16px 24px;">Project Delay: <span style="font-weight:600; color:#3b82f6;">${t.task}</span></td>
              <td style="padding:16px 24px; color:rgba(255,255,255,0.7);">${t.owner}</td>
              <td style="padding:16px 24px;"><span style="color:#ef4444; font-weight:700;">HIGH</span></td>
            </tr>`).join("")
          : `<tr><td colspan="3" style="text-align:center; padding:40px; color:rgba(255,255,255,0.5);">No recent escalations found.</td></tr>`;
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function renderSettings(container) {
    container.innerHTML = `
      <style>
        .set-card { background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); animation: fadeIn 0.4s ease-out; }
        .set-header { padding: 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); display: flex; align-items: center; gap: 24px; background: rgba(255, 255, 255, 0.02); }
        .set-avatar { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #2563eb); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 700; color: white; box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2); }
        .set-info h2 { margin: 0 0 4px 0; font-size: 1.75rem; font-weight: 700; color: #f8fafc; letter-spacing: -0.5px; }
        .set-info p { margin: 0; color: #94a3b8; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; }
        .set-badge { font-size: 0.7rem; font-weight: 600; padding: 4px 10px; border-radius: 20px; background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); text-transform: uppercase; letter-spacing: 0.5px; }
        .set-section { padding: 32px; }
        .set-title { font-size: 1.1rem; font-weight: 600; color: #f8fafc; margin: 0 0 24px 0; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 500; color: #94a3b8; margin-bottom: 8px; }
        .form-control { width: 100%; padding: 12px 16px; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #f8fafc; font-size: 0.95rem; cursor: not-allowed; display: flex; justify-content: space-between; align-items: center; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      </style>

      <div style="max-width:800px; margin:0 auto;">
        <div class="set-card">
          <div class="set-header">
            <div class="set-avatar">${username.charAt(0)}</div>
            <div class="set-info">
              <h2>${username}</h2>
              <p>
                <i data-lucide="shield" style="width:16px; height:16px;"></i> SUPER ADMIN 
                <span class="set-badge" style="margin-left: 12px;">System Online</span>
              </p>
            </div>
          </div>
          
          <div class="set-section">
            <h3 class="set-title">Personal Information</h3>
            <div class="form-grid">
              <div class="form-group"><label>Full Name</label><div class="form-control">${username} <i data-lucide="shield-check" style="width:14px; height:14px; color:#10b981;"></i></div></div>
              <div class="form-group"><label>Email Address</label><div class="form-control">${user.email || 'admin@ethica.com'} <i data-lucide="shield-check" style="width:14px; height:14px; color:#10b981;"></i></div></div>
              <div class="form-group"><label>Role</label><div class="form-control">SUPER_ADMIN <i data-lucide="shield-check" style="width:14px; height:14px; color:#10b981;"></i></div></div>
              <div class="form-group"><label>Department</label><div class="form-control">System Administrator <i data-lucide="shield-check" style="width:14px; height:14px; color:#10b981;"></i></div></div>
            </div>
          </div>

          <div class="set-section" style="border-top:1px solid rgba(255,255,255,0.08);">
            <h3 class="set-title">Security Actions</h3>
            <div style="display:flex; gap:16px;">
              <button onclick="window.openPasswordModal()" style="background:#3b82f6; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; transition:0.2s;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                <i data-lucide="key" style="width:16px; height:16px;"></i> Update Password
              </button>
              <button onclick="window.handleTwoFactorAuth()" style="background:transparent; color:#f8fafc; border:1px solid rgba(255,255,255,0.2); padding:10px 20px; border-radius:8px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='transparent'">
                <i data-lucide="smartphone" style="width:16px; height:16px;"></i> Two-Factor Auth
              </button>
            </div>
          </div>
        </div>

        <!-- Password Modal Injection -->
        <div id="passwordModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:2000; align-items:center; justify-content:center; backdrop-filter: blur(8px);">
           <div style="background:#0a0a0a; border:1px solid rgba(255,255,255,0.1); border-radius:16px; width:400px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); overflow:hidden; display:flex; flex-direction:column;">
              <div style="padding: 24px 24px 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02);">
                 <h2 style="font-size:1.25rem; font-weight:700; color:#f8fafc; margin-bottom:0.5rem;">Admin Profile Password</h2>
            <p style="color:#94a3b8; font-size:0.875rem; margin-bottom:1.5rem;">Update your administrator credentials below.</p>
              </div>
              <form id="passwordForm" style="padding:24px; display:flex; flex-direction:column; gap:16px;" onsubmit="window.submitPasswordUpdate(event)">
                 <div>
                    <label style="display:block; font-size:0.75rem; color:#94a3b8; font-weight:600; margin-bottom:6px; letter-spacing:0.3px; text-transform:uppercase;">New Password</label>
                    <input type="password" id="newPasswordInput" placeholder="Enter new password" required style="width:100%; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); color:white; border-radius:8px; padding:10px 14px; font-size:0.9rem; transition:0.2s; outline:none;" onfocus="this.style.borderColor='#3b82f6'; this.style.background='rgba(59,130,246,0.05)';" onblur="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.background='rgba(255,255,255,0.03)';">
                 </div>
                 
                 <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:16px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.05);">
                    <button type="button" onclick="window.closePasswordModal()" style="padding:10px 20px; background:rgba(255,255,255,0.05); color:#f8fafc; border:1px solid rgba(255,255,255,0.1); border-radius:8px; font-weight:600; font-size:0.9rem; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">Cancel</button>
                    <button type="submit" style="padding:10px 24px; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color:white; border:none; border-radius:8px; font-weight:600; font-size:0.9rem; cursor:pointer; box-shadow:0 4px 12px rgba(37,99,235,0.2); transition:0.2s;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(37,99,235,0.3)';" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 12px rgba(37,99,235,0.2)'">Update</button>
                 </div>
              </form>
           </div>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  async function hydrateOverview() {
    try {
      const data = await apiGet("/api/admin/stats/overview");
      const m = data.metrics || {};
      if (document.getElementById("statUsers")) document.getElementById("statUsers").textContent = m.users || 0;
      if (document.getElementById("statEmployees")) document.getElementById("statEmployees").textContent = m.employees || 0;
      if (document.getElementById("statManagers")) document.getElementById("statManagers").textContent = (m.hr || 0) + (m.managers || 0);
      if (document.getElementById("statDelays")) document.getElementById("statDelays").textContent = m.overdue || 0;

      const tbody = document.getElementById("adminOverdueTableBody");
      if (tbody) tbody.innerHTML = (data.overdueSummary || []).slice(0, 5).map(t => `
        <tr style="border-bottom: 1px solid rgba(30, 64, 175, 0.1);">
          <td style="padding:12px 24px; color:rgba(255,255,255,0.8);">${t.owner}<br><small style="color:rgba(255,255,255,0.5);">${t.task}</small></td>
          <td style="padding:12px 24px; color:#3b82f6; font-weight:600;">${t.delay} Days</td>
          <td style="padding:12px 24px;">
            <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(239, 68, 68, 0.1); color:#ef4444; padding:4px 10px; border-radius:6px; font-size:0.7rem; font-weight:700; border:1px solid rgba(239, 68, 68, 0.2);">Warning</span>
          </td>
        </tr>`).join("");

      const teamData = await apiGet("/api/admin/stats/teams");
      if (teamData && teamData.teamStats) {
        createTeamPerformanceChart("teamPerformanceChart", teamData.teamStats);
        createDepartmentDistributionChart("deptDistributionChart", teamData.teamStats);
      }

      const badge = document.getElementById("notifBadge");
      const notifs = data.notifications || [];
      if (badge) {
        badge.textContent = notifs.length;
        badge.style.display = notifs.length > 0 ? "flex" : "none";
      }
      const list = document.getElementById("notifList");
      if (list) {
        if (notifs.length > 0) {
          list.innerHTML = notifs.map(n => `
            <div style="padding:12px 15px; border-bottom:1px solid rgba(255,255,255,0.05);">
              <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:4px;">
                <span style="font-size:0.7rem; font-weight:800; color:#3b82f6; text-transform:uppercase; letter-spacing:0.5px;">${n.type || 'System'}</span>
                <span style="font-size:0.65rem; color:rgba(255,255,255,0.4);">${n.created_at ? n.created_at.split(' ')[0] : ''}</span>
              </div>
              <div style="font-size:0.85rem; line-height:1.4; color:rgba(255,255,255,0.9);">${n.message}</div>
            </div>
          `).join("");
        } else {
          list.innerHTML = '<div style="padding:32px 20px; text-align:center; color:rgba(255,255,255,0.4); font-size:0.9rem;">No new notifications</div>';
        }
      }

      const activityList = document.getElementById("adminActivityList");
      if (activityList) {
        if (notifs.length > 0) {
          activityList.innerHTML = notifs.slice(0, 4).map(n => `<li>${n.message}</li>`).join("");
        } else {
          activityList.innerHTML = "<li>No recent activity logged.</li>";
        }
      }
    } catch (e) { }
  }

  function initNotificationUi() {
    const btn = document.getElementById("adminNotifyBtn");
    const dropdown = document.getElementById("notifDropdown");
    if (btn && dropdown) {
      btn.onclick = (e) => { 
        e.stopPropagation(); 
        dropdown.style.display = dropdown.style.display === "block" ? "none" : "block"; 
      };
      document.addEventListener("click", () => dropdown.style.display = "none");
    }
  }

  function showToast(message) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.cssText = "position:fixed; bottom:24px; right:24px; z-index:9999; display:flex; flex-direction:column; gap:12px;";
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.innerHTML = `
      <div style="display:flex; gap:12px; align-items:start;">
        <i data-lucide="bell-ring" style="width:18px; height:18px; color:#60a5fa; margin-top:2px;"></i>
        <div>
          <strong>System Alert</strong>
          <div style="font-size:0.9rem; line-height:1.4; color:rgba(255,255,255,0.9);">${message}</div>
        </div>
      </div>
    `;
    container.appendChild(toast);
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
    
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateX(0)";
    });

    try {
      const audio = new Audio("/sounds/mild_sound.mp3");
      audio.volume = 0.7;
      audio.play().catch(e => console.warn("Admin Audio Playback failed:", e));
    } catch (e) {
      console.error("Admin Audio Error:", e);
    }

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(40px)";
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  const pollInterval = setInterval(async () => {
    try {
      const data = await apiGet("/api/admin/stats/overview");
      const notifs = data?.notifications || [];
      if (notifs.length > 0) {
        const latestId = notifs[0].id;
        
        if (lastNotificationId === 0) {
          lastNotificationId = latestId;
          notifs.slice(0, 3).reverse().forEach((n, i) => {
            setTimeout(() => showToast(n.message), i * 800);
          });
        } else if (latestId > lastNotificationId) {
          const newOnes = notifs.filter(n => n.id > lastNotificationId);
          newOnes.reverse().forEach((n, i) => {
             setTimeout(() => showToast(n.message), i * 800);
          });
          lastNotificationId = latestId;
        }
        
        if (isLoadingDashboard) hydrateOverview();
      }
    } catch (e) { }
  }, 5000);

  let isLoadingDashboard = true;
  window.addEventListener("beforeunload", () => clearInterval(pollInterval));

  loadPage("dashboard");
  initNotificationUi();
}
