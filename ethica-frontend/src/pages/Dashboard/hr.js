import { apiGet, apiPost } from "../../api/client.js";


export function renderHrDashboard() {
  const app = document.getElementById("app");
  const user = JSON.parse(sessionStorage.getItem("user")) || {};
  const username = user.name || user.firstName || user.first_name || "HR User";

  // Navigation State
  let currentPage = "dashboard";
  let audioUnlocked = false;

  const unlockAudio = () => {
    if (audioUnlocked) return;
    const audio = new Audio("/sounds/mild_sound.mp3");
    audio.volume = 0;
    audio.play().then(() => {
      audioUnlocked = true;
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
      console.log("HR Audio Unlocked");
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
             <span style="font-weight:800; font-size:1.05rem; color:#f8fafc; letter-spacing:-0.2px;">HR Manager</span>
             <span style="font-size:0.75rem; color:#93c5fd; font-weight:600; margin-top:4px;">${user.department || "Human Resources"}</span>
          </div>
        </div>
        <ul class="nav-menu">
          <li class="nav-item active" data-page="dashboard">
            <i data-lucide="layout-grid"></i> Dashboard
          </li>
          <li class="nav-item" data-page="tasks">
             <i data-lucide="clipboard-list"></i> Tasks
          </li>
          <li class="nav-item" data-page="employees">
             <i data-lucide="users"></i> Employees
          </li>
          <li class="nav-item" data-page="settings">
             <i data-lucide="settings"></i> Settings
          </li>
        </ul>
        
        

        <div style="margin-top: auto;">

          <button id="hrLogoutBtn" class="nav-item" style="width:100%; border:none; background:none; font-size:1rem;">
            <i data-lucide="log-out"></i> Logout
          </button>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; padding:12px 24px; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.2);">
          <h1 class="page-title" id="pageTitle" style="font-size:1.5rem; font-weight:800; color:#ffffff; margin:0; letter-spacing:-0.5px;">HR Dashboard</h1>
          <div style="display:flex; align-items:center; gap:20px;">
             <div id="hrNotifyBtn" class="notification-btn" style="position:relative; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); cursor:pointer; width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:12px; transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
               <i data-lucide="bell" style="color:#ffffff; width:20px; height:20px;"></i>
               <span id="notifBadge" style="display:none; position:absolute; top:-6px; right:-6px; background:#ef4444; width:20px; height:20px; border-radius:50%; border:2px solid #0f172a; color:white; font-size:10px; font-weight:800; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(239, 68, 68, 0.4);"></span>
               <!-- Dropdown -->
               <div id="notifDropdown" style="display:none; position:absolute; top:54px; right:0; width:320px; background:rgba(15, 23, 42, 0.95); backdrop-filter:blur(16px); border:1px solid rgba(255,255,255,0.1); border-radius:16px; box-shadow:0 20px 40px rgba(0,0,0,0.5); z-index:1000; overflow:hidden;">
                  <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02);">
                    <span style="font-weight:700; color:#ffffff; font-size:0.95rem;">Notifications</span>
                    <button id="closeNotifs" style="background:none; border:none; color:rgba(255,255,255,0.4); cursor:pointer; padding:4px; border-radius:6px; transition:0.2s;" onmouseover="this.style.color='#ffffff'; this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.color='rgba(255,255,255,0.4)'; this.style.background='none'"><i data-lucide="x" style="width:16px; height:16px;"></i></button>
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
                   <span style="font-size:0.7rem; color:#60a5fa; font-weight:800; letter-spacing:0.5px;">HR TEAM</span>
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
      // Update Active State
      document.querySelectorAll(".nav-menu .nav-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");

      // Load Page
      const page = item.getAttribute("data-page");
      loadPage(page);
    });
  });

  // Logout Listener
  document.getElementById("hrLogoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    sessionStorage.clear();
    location.reload();
  });

  // Load Page Router
  function loadPage(page) {
    currentPage = page;
    const contentArea = document.getElementById("contentArea");
    const titleEl = document.getElementById("pageTitle");

    // Clear previous content
    contentArea.innerHTML = '<div style="padding:20px; text-align:center;">Loading...</div>';

    if (page === "dashboard") {
      titleEl.textContent = "HR Dashboard";
      renderDashboardView(contentArea);
    } else if (page === "tasks") {
      titleEl.textContent = "Assign Tasks";
      renderTasksView(contentArea);
    } else if (page === "employees") {
      titleEl.textContent = "Employee Management";
      renderEmployeesView(contentArea);
    } else if (page === "settings") {
      titleEl.textContent = "Settings";
      renderSettingsView(contentArea);
    }

    // Re-initialize Lucide Icons
    if (window.lucide && window.lucide.createIcons) {
      setTimeout(() => window.lucide.createIcons(), 100);
    }
  }

  // --- Views ---

  // 1. Dashboard View (Existing Logic)
  async function renderDashboardView(container) {
    const stats = [
      { id: "statTotal", value: 0, label: "Total Employees", color: "blue" },
      { id: "statDelays", value: 0, label: "Employees with Delays", color: "green" },
      { id: "statWarnings", value: 0, label: "Total Warnings Issued", color: "orange" },
      { id: "statEscalated", value: 0, label: "Escalated Cases", color: "red" }
    ];

    container.innerHTML = `
      <section class="stats-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:24px; margin-bottom:32px;">
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
              <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statTotal">0</div>
              <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Total Employees</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
              <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statDelays">0</div>
              <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Employees with Delays</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
              <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statWarnings">0</div>
              <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Total Warnings</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
              <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statEscalated">0</div>
              <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Escalated Cases</div>
           </div>
      </section>

      <section class="content-grid">
        <!-- Left Col: Overdue Employees -->
        <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden; padding:0;">
          <div style="padding:20px 24px; border-bottom:1px solid rgba(30, 64, 175, 0.2); display:flex; justify-content:space-between; align-items:center;">
             <h3 style="margin:0; color:#3b82f6;">Overdue Employees</h3>
             <button id="refreshOverviewBtn" style="background:rgba(59, 130, 246, 0.1); border:1px solid rgba(59, 130, 246, 0.2); color:#3b82f6; padding:6px 12px; border-radius:6px; font-size:0.75rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px;">
                <i data-lucide="rotate-cw" style="width:14px; height:14px;"></i> Refresh
             </button>
          </div>
          <table class="data-table" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:rgba(30, 64, 175, 0.1);">
                <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Employee / Task</th>
                <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Delay</th>
                <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Status</th>
                <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Reason for Delay</th>
              </tr>
            </thead>
            <tbody id="hrOverdueTableBody">
              <tr><td colspan="4" style="text-align:center; padding:20px; color:rgba(255,255,255,0.5);">Loading...</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Right Col: System Stats -->
        <div class="table-card" style="padding:24px; background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px;">
          <h3 style="margin-bottom:20px; color:#3b82f6;">System Activity</h3>
          <div style="display:flex; flex-direction:column; gap:16px; margin-bottom:24px;">
             <div style="background:rgba(30, 64, 175, 0.1); padding:16px; border-radius:8px; border-left:4px solid #f59e0b;">
                <div style="font-size:0.875rem; color:var(--text-muted);">Status: Active Monitoring</div>
                <div id="hrActivityOverdueCount" style="font-weight:600; margin-top:4px;">0 Overdue Tasks</div>
             </div>
             <div style="background:rgba(239, 68, 68, 0.1); padding:16px; border-radius:8px; border-left:4px solid #ef4444;">
                <div style="font-size:0.875rem; color:var(--text-muted);">Escalation: Required Actions</div>
                <div id="hrActivityEscalatedCount" style="font-weight:600; margin-top:4px;">0 Critical Cases</div>
             </div>
          </div>

          <h3 style="margin-bottom:16px; color:#3b82f6; font-size:1.1rem;">Recent Activity</h3>
           <ul id="hrActivityList" style="padding-left:20px; color:var(--text-muted); font-size:0.9rem; line-height:2;">
              <li>Loading activity...</li>
           </ul>
        </div>
      </section>
    `;

    // Fetch Data
    try {
      const data = await apiGet("/api/hr/overview");

      // Metrics
      const overdueTasks = data?.overdueSummary || [];
      const totalEmployees = (data?.employees || []).length;
      document.getElementById("statTotal").textContent = totalEmployees;

      document.getElementById("statDelays").textContent = overdueTasks.length;
      document.getElementById("statWarnings").textContent = Math.floor(overdueTasks.length * 0.7);
      document.getElementById("statEscalated").textContent = overdueTasks.filter(t => t.level === 'Critical' || t.level === 'Escalated').length;

      // Update Activity Cards
      document.getElementById("hrActivityOverdueCount").textContent = `${overdueTasks.length} Overdue Tasks`;
      document.getElementById("hrActivityEscalatedCount").textContent = `${overdueTasks.filter(t => t.level === 'Critical' || t.level === 'Escalated').length} Critical Cases`;

      // Table
      const tbody = document.getElementById("hrOverdueTableBody");

      if (tbody) {
        if (overdueTasks.length === 0) {
          tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted);">No overdue employees</td></tr>`;
        } else {
          tbody.innerHTML = overdueTasks.slice(0, 5).map(task => `
             <tr style="border-bottom: 1px solid rgba(30, 64, 175, 0.1);">
               <td style="padding:12px 24px;">
                 <div style="font-weight:600; color:#ffffff;">${task.owner}</div> 
                 <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">${task.task}</div>
               </td>
               <td style="padding:12px 24px;"><span style="color:#ef4444; font-weight:700;">${task.delay} Days</span></td>
               <td style="padding:12px 24px;">
                 <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(239, 68, 68, 0.1); color:#ef4444; padding:4px 10px; border-radius:6px; font-size:0.7rem; font-weight:700; border:1px solid rgba(239, 68, 68, 0.2);">
                   ${task.level || 'Escalated'}
                 </span>
               </td>
               <td style="padding:12px 24px;">
                 <div style="background:rgba(30, 64, 175, 0.1); border:1px solid rgba(30, 64, 175, 0.2); border-radius:6px; padding:10px; font-size:0.8rem; color:rgba(255,255,255,0.7); max-width:250px; line-height:1.4;">
                   <strong style="color:#3b82f6; font-size:0.7rem; display:block; margin-bottom:4px; text-transform:uppercase;">Delayed Reason:</strong>
                   ${task.problem || 'No explanation provided yet.'}
                 </div>
               </td>
             </tr>
           `).join("");
        }
      }

      // Notifications
      const totalOverdue = (data?.notifications || []).length;
      // Update Notifications
      const notifs = data.notifications || [];
      const badge = document.getElementById("notifBadge");
      if (badge) {
        if (notifs.length > 0) {
          badge.style.display = "flex";
          badge.textContent = notifs.length;
        } else {
          badge.style.display = "none";
        }
      }

      const notifList = document.getElementById("notifList");
      if (notifList) {
        if (notifs.length > 0) {
          notifList.innerHTML = notifs.map(n => `
            <div style="padding:12px 15px; border-bottom:1px solid var(--border-color); cursor:default; transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
              <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:4px;">
                <span style="font-size:0.75rem; font-weight:700; color:var(--accent-${n.type === 'escalation' ? 'red' : 'blue'}); text-transform:uppercase;">${n.type || 'INFO'}</span>
                <span style="font-size:0.7rem; color:var(--text-muted);">${n.date ? n.date.split('T')[0] : ''}</span>
              </div>
              <div style="font-size:0.85rem; line-height:1.4;">${n.message}</div>
            </div>
          `).join("");
        } else {
          notifList.innerHTML = `<div style="padding:20px; text-align:center; color:var(--text-muted); font-size:0.85rem;">No new notifications</div>`;
        }
      }

      // Update Activity List
      const activityList = document.getElementById("hrActivityList");
      if (activityList) {
        if (notifs.length > 0) {
          activityList.innerHTML = notifs.slice(0, 3).map(n => `<li>${n.message}</li>`).join("");
        } else {
          activityList.innerHTML = "<li>No system activity recorded to your department yet.</li>";
        }
      }

      // Initial Setup for Dropdown Toggles (only once)
      if (!window.__hrNotifInited) {
        initNotificationUi();
        window.__hrNotifInited = true;
      }

      // Wire Refresh Button
      const refreshBtn = document.getElementById("refreshOverviewBtn");
      if (refreshBtn) {
        refreshBtn.onclick = () => renderDashboardView(container);
      }
      
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
      }

    } catch (e) {
      console.error("HR Hydrate Failed", e);
    }
  }

  // 2. Tasks View (Assign & Monitor)
  async function renderTasksView(container) {
    container.innerHTML = `
      <div style="display:grid; grid-template-columns: 350px 1fr; gap:24px; align-items: start;">
        <!-- Left: Create Task Form -->
        <div class="panel" style="position:sticky; top:20px;">
           <div class="panel-header">
             <h3 class="panel-title">Assign New Task</h3>
           </div>
           <form id="assignTaskForm" style="display:flex; flex-direction:column; gap:16px;">
              <div>
                 <label style="display:block; margin-bottom:8px; font-weight:600; font-size:0.9rem;">Task Title</label>
                 <input id="taskTitle" type="text" placeholder="e.g. Q1 Financial Report" style="width:100%; padding:10px; background:var(--bg-sidebar); border:1px solid var(--border-color); color:var(--text-primary); border-radius:6px; font-size:0.9rem;" required />
              </div>
              
              <div>
                 <label style="display:block; margin-bottom:8px; font-weight:600; font-size:0.9rem;">Assign To</label>
                 <select id="taskAssignee" style="width:100%; padding:10px; background:var(--bg-sidebar); border:1px solid var(--border-color); color:var(--text-primary); border-radius:6px; font-size:0.9rem;" required>
                   <option value="" disabled selected>Select Employee</option>
                   <option>Loading...</option>
                 </select>
              </div>

              <div>
                 <label style="display:block; margin-bottom:8px; font-weight:600; font-size:0.9rem;">Due Date</label>
                 <input id="taskDueDate" type="date" style="width:100%; padding:10px; background:var(--bg-sidebar); border:1px solid var(--border-color); color:var(--text-primary); border-radius:6px; font-size:0.9rem;" required />
              </div>

              <div>
                 <label style="display:block; margin-bottom:8px; font-weight:600; font-size:0.9rem;">Project Name</label>
                 <input id="taskProject" type="text" placeholder="e.g. Internal Audit" style="width:100%; padding:10px; background:var(--bg-sidebar); border:1px solid var(--border-color); color:var(--text-primary); border-radius:6px; font-size:0.9rem;" />
              </div>

              <button type="submit" id="submitTaskBtn" style="margin-top:16px; padding:12px; background:var(--accent-blue); color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold; transition: filter 0.2s;" onmouseover="this.style.filter='brightness(1.1)'" onmouseout="this.style.filter='brightness(1)'">
                 Assign Task
              </button>
              <p id="taskMsg" class="msg" style="text-align:center; font-size:0.85rem; padding-top:10px;"></p>
           </form>
        </div>

        <!-- Right: Tasks Table -->
        <div class="panel">
           <div class="panel-header" style="justify-content: space-between;">
             <h3 class="panel-title">Assigned Employee Tasks</h3>
             <button id="refreshTasksBtn" class="status-badge" style="background:var(--bg-sidebar); border:1px solid var(--border-color); color:var(--text-muted); cursor:pointer; font-size:0.75rem; padding:4px 8px;">Refresh</button>
           </div>
           <table class="data-table">
             <thead>
               <tr>
                 <th>Task / Project</th>
                 <th>Assignee</th>
                 <th>Due Date</th>
                 <th>Status</th>
                 <th>Delay Reason</th>
               </tr>
             </thead>
             <tbody id="hrTasksTableBody">
               <tr><td colspan="5" style="text-align:center;">Loading tasks...</td></tr>
             </tbody>
           </table>
        </div>
      </div>
    `;

    // Internal function to load the task list only
    const loadTaskList = async () => {
      const tbody = document.getElementById("hrTasksTableBody");
      try {
        const res = await apiGet("/api/tasks");
        const tasks = res.tasks || [];
        if (tasks.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No tasks assigned yet</td></tr>';
        } else {
          tbody.innerHTML = tasks.map(task => `
            <tr>
              <td>
                <div style="font-weight:600; color:var(--text-primary);">${task.title}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${task.projectName || 'General'}</div>
              </td>
              <td style="font-size:0.9rem;">${task.assigneeName}</td>
              <td style="font-size:0.85rem;">${task.dueDate}</td>
              <td><span class="status-badge ${task.status === 'completed' ? 'success' : task.status === 'overdue' ? 'error' : 'warning'}">${task.status.replace('_', ' ').toUpperCase()}</span></td>
              <td>
                <div style="background:rgba(255, 255, 255, 0.03); border:1px solid var(--border-color); border-radius:6px; padding:6px 10px; font-size:0.8rem; color:var(--text-muted); max-width:300px;">
                   ${task.employeeReport || task.problem || '-'}
                </div>
              </td>
            </tr>
          `).join("");
        }
      } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--accent-red);">Error loading tasks</td></tr>';
      }
    };

    // Initial table load
    loadTaskList();

    // Refresh listener
    document.getElementById("refreshTasksBtn").onclick = loadTaskList;

    // Load Employees for Dropdown
    try {
      const res = await apiGet("/api/hr/employees");
      const select = document.getElementById("taskAssignee");
      select.innerHTML = '<option value="" disabled selected>Select Employee</option>' +
        (res.employees || []).map(emp => `<option value="${emp.id}">${emp.firstName} ${emp.lastName}</option>`).join("");
    } catch (e) {
      console.error("Failed to load employees", e);
    }

    // Handle Submit
    document.getElementById("assignTaskForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = document.getElementById("taskMsg");
      const btn = document.getElementById("submitTaskBtn");

      msg.textContent = "Assigning...";
      msg.style.color = "var(--text-muted)";
      btn.disabled = true;

      const payload = {
        title: document.getElementById("taskTitle").value,
        assigneeUserId: document.getElementById("taskAssignee").value,
        dueDate: document.getElementById("taskDueDate").value,
        projectName: document.getElementById("taskProject").value
      };

      try {
        await apiPost("/api/hr/tasks", payload);
        msg.textContent = "Task Assigned Successfully!";
        msg.style.color = "var(--accent-green)";
        e.target.reset();
        // Refresh the list immediately
        loadTaskList();
      } catch (err) {
        msg.textContent = "Error: " + err.message;
        msg.style.color = "var(--accent-red)";
      } finally {
        btn.disabled = false;
        setTimeout(() => { if (msg) msg.textContent = ""; }, 3000);
      }
    });
  }

  // 3. Employees View
  async function renderEmployeesView(container) {
    container.innerHTML = `
       <div class="panel">
         <div class="panel-header">
           <h3 class="panel-title">All Employees</h3>
           <div style="display:flex; gap:10px;">
              <input type="text" placeholder="Search..." style="padding:8px; border-radius:6px; border:1px solid var(--border-color); background:var(--bg-sidebar); color:var(--text-primary);" />
              <button class="status-badge success" style="background:none; border:none; cursor:pointer;">Export CSV</button>
           </div>
         </div>
         <table class="data-table">
           <thead>
             <tr>
               <th>Name</th>
               <th>Email</th>
               <th>Role</th>
               <th>Status</th>
             </tr>
           </thead>
           <tbody id="employeesListBody">
             <tr><td colspan="4">Loading...</td></tr>
           </tbody>
         </table>
       </div>
     `;

    try {
      const res = await apiGet("/api/hr/employees");
      const tbody = document.getElementById("employeesListBody");
      if ((res.employees || []).length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No employees found</td></tr>';
      } else {
        tbody.innerHTML = res.employees.map(emp => `
             <tr>
               <td style="font-weight:600;">${emp.firstName} ${emp.lastName}</td>
               <td>${emp.email}</td>
               <td>${emp.role.toUpperCase()}</td>
               <td><span class="status-badge success">Active</span></td>
             </tr>
           `).join("");
      }
    } catch (e) {
      console.error("Failed to load employees list", e);
    }
  }

  // 4. Settings View
  function renderSettingsView(container) {
    container.innerHTML = `
      <style>
        .set-card {
          background: rgba(30, 41, 59, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          animation: fadeIn 0.4s ease-out;
        }
        .set-header {
          padding: 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          gap: 24px;
          background: rgba(255, 255, 255, 0.02);
        }
        .set-avatar {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
          box-shadow: 0 8px 16px rgba(37, 99, 235, 0.2);
        }
        .set-info h2 {
          margin: 0 0 4px 0;
          font-size: 1.75rem;
          font-weight: 700;
          color: #f8fafc;
          letter-spacing: -0.5px;
        }
        .set-info p {
          margin: 0;
          color: #94a3b8;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .set-badge {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .set-section { padding: 32px; }
        .set-title { font-size: 1.1rem; font-weight: 600; color: #f8fafc; margin: 0 0 24px 0; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 500; color: #94a3b8; margin-bottom: 8px; }
        .form-control {
          width: 100%;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #f8fafc;
          font-size: 0.95rem;
          cursor: not-allowed;
          display: flex; 
          justify-content: space-between; 
          align-items: center;
        }
        .sec-notice {
          margin: 0 32px 32px 32px;
          padding: 20px 24px;
          background: rgba(59, 130, 246, 0.05);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 12px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .sec-icon { color: #3b82f6; background: rgba(59, 130, 246, 0.1); padding: 10px; border-radius: 10px; display: flex; }
        .sec-content h4 { margin: 0 0 6px 0; color: #e2e8f0; font-size: 1rem; font-weight: 600; }
        .sec-content p { margin: 0; color: #94a3b8; font-size: 0.9rem; line-height: 1.5; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      </style>

      <div style="max-width:800px; margin:0 auto;">
        <div class="set-card">
          <div class="set-header">
            <div class="set-avatar">${username.charAt(0)}</div>
            <div class="set-info">
              <h2>${username}</h2>
              <p>
                <i data-lucide="briefcase" style="width:16px; height:16px;"></i> ${user.role.toUpperCase()} 
                <span style="color:rgba(255,255,255,0.2)">|</span> 
                ${user.department || 'Human Resources'}
                <span class="set-badge" style="margin-left: 12px;">Active</span>
              </p>
            </div>
          </div>
          
          <div class="set-section">
            <h3 class="set-title">Personal Information</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Full Name</label>
                <div class="form-control">
                  ${username} <i data-lucide="lock" style="width:14px; height:14px; color:#64748b;"></i>
                </div>
              </div>
              <div class="form-group">
                <label>Email Address</label>
                 <div class="form-control">
                   ${user.email || 'employee@ethica.com'} <i data-lucide="lock" style="width:14px; height:14px; color:#64748b;"></i>
                </div>
              </div>
              <div class="form-group">
                <label>Role</label>
                 <div class="form-control">
                   ${user.role} <i data-lucide="lock" style="width:14px; height:14px; color:#64748b;"></i>
                </div>
              </div>
              <div class="form-group">
                <label>Department</label>
                 <div class="form-control">
                   ${user.department || 'Human Resources'} <i data-lucide="lock" style="width:14px; height:14px; color:#64748b;"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="sec-notice">
            <div class="sec-icon">
              <i data-lucide="shield-check" style="width:24px; height:24px;"></i>
            </div>
            <div class="sec-content">
              <h4>Managed by System Administrator</h4>
              <p>
                For security and compliance reasons, essential identifying details such as your Legal Name, Email Address, and Role are securely locked. To request modifications to your profile, please contact the <span style="color:#60a5fa; cursor:pointer; text-decoration:underline;">IT Department</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  // Initial Load
  loadPage("dashboard");

  // Initial Icon Load
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }

  // --- Real-time Notifications ---
  let lastNotificationId = 0;

  function initNotificationUi() {
    const btn = document.getElementById("hrNotifyBtn");
    const dropdown = document.getElementById("notifDropdown");
    const closeBtn = document.getElementById("closeNotifs");

    if (btn && dropdown) {
      btn.onclick = (e) => {
        e.stopPropagation();
        const isVisible = dropdown.style.display === "block";
        dropdown.style.display = isVisible ? "none" : "block";
      };

      document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && e.target !== btn) {
          dropdown.style.display = "none";
        }
      });

      closeBtn.onclick = (e) => {
        e.stopPropagation();
        dropdown.style.display = "none";
      };
    }
  }

  function showToast(message) {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.style.cssText = `
      background: #1e293b; color: #fff; padding: 15px 20px; border-radius: 8px; 
      box-shadow: 0 10px 25px rgba(0,0,0,0.5); border-left: 4px solid var(--accent-blue); 
      font-size: 0.9rem; min-width: 300px; opacity: 0; transform: translateY(20px); 
      transition: all 0.3s ease;
    `;
    toast.innerHTML = `
      <div style="font-weight:700; margin-bottom:4px; font-size:0.75rem; text-transform:uppercase; color:var(--accent-blue);">System Alert</div>
      <div>${message}</div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    try {
      const audio = new Audio("/sounds/mild_sound.mp3");
      audio.volume = 0.7;
      audio.play().catch(e => console.warn("HR Audio Playback failed:", e));
    } catch (e) {
      console.error("HR Audio Error:", e);
    }

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  const checkNotifications = async () => {
    if (currentPage !== "dashboard") return;
    try {
      const data = await apiGet("/api/hr/overview");
      const notifs = data?.notifications || [];

      if (notifs.length > 0) {
        const latestId = notifs[0].id;

        if (lastNotificationId === 0) {
          // Immediate Pop-up after login as requested
          lastNotificationId = latestId;
          // Show the latest 3 notifications right away
          notifs.slice(0, 3).reverse().forEach((n, i) => {
            setTimeout(() => showToast(n.message), i * 800);
          });
        } else if (latestId > lastNotificationId) {
          // New notifications found
          const newOnes = notifs.filter(n => n.id > lastNotificationId);
          newOnes.reverse().forEach((n, i) => {
            setTimeout(() => showToast(n.message), i * 800);
          });
          lastNotificationId = latestId;
        }

        // Ensure UI stays in sync (badge/list)
        const contentArea = document.getElementById("contentArea");
        if (contentArea && currentPage === "dashboard") {
          // This will trigger the badge/list update logic inside renderDashboardView indirectly 
          // but we can just update the badge/list elements if they exist
          updateNotificationBadge(notifs);
        }
      }
    } catch (e) { }
  };

  function updateNotificationBadge(notifs) {
    const badge = document.getElementById("notifBadge");
    if (badge) {
      if (notifs.length > 0) {
        badge.style.display = "flex";
        badge.textContent = notifs.length;
      } else {
        badge.style.display = "none";
      }
    }
    const notifList = document.getElementById("notifList");
    if (notifList && notifs.length > 0) {
      notifList.innerHTML = notifs.map(n => `
        <div style="padding:12px 15px; border-bottom:1px solid var(--border-color); cursor:default; transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
          <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:4px;">
            <span style="font-size:0.75rem; font-weight:700; color:var(--accent-${n.type === 'escalation' ? 'red' : 'blue'}); text-transform:uppercase;">${n.type || 'INFO'}</span>
            <span style="font-size:0.7rem; color:var(--text-muted);">${n.date ? n.date.split('T')[0] : ''}</span>
          </div>
          <div style="font-size:0.85rem; line-height:1.4;">${n.message}</div>
        </div>
      `).join("");
    }
  }

  const pollInterval = setInterval(checkNotifications, 5000);

  // Trigger immediate check on login
  setTimeout(checkNotifications, 1000);

  window.addEventListener("beforeunload", () => clearInterval(pollInterval));
}
