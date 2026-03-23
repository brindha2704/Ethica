import { apiGet } from "../../api/client.js";

export function renderManagerDashboard() {
  const app = document.getElementById("app");
  const user = JSON.parse(sessionStorage.getItem("user"));
  const username = user?.name || user?.firstName || user?.first_name || "Manager";

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
      console.log("Manager Audio Unlocked");
    }).catch(() => { });
  };
  document.addEventListener("click", unlockAudio);
  document.addEventListener("touchstart", unlockAudio);

  app.innerHTML = `
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="brand" style="display:flex; flex-direction:column; gap:16px; padding:20px 16px; margin: 12px 12px 32px 12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:12px; transition:0.2s; cursor:default;" onmouseover="this.style.background='rgba(255,255,255,0.04)';" onmouseout="this.style.background='rgba(255,255,255,0.02)';">
          <div style="display:flex; align-items:center; justify-content:center;">
             <img src="/images/logo.png" alt="Ethica" style="width: 100%; max-width: 140px; height: auto; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));" />
          </div>
          <div style="display:flex; flex-direction:column; border-top: 1px solid rgba(255,255,255,0.06); padding-top:14px; text-align:center;">
             <span style="font-weight:800; font-size:1.05rem; color:#f8fafc; letter-spacing:-0.2px;">Manager Portal</span>
             <span style="font-size:0.75rem; color:#93c5fd; font-weight:600; margin-top:4px;">${user.department === 'Management' || !user.department ? 'General Ops' : user.department}</span>
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
          <li class="nav-item" data-page="reports">
             <i data-lucide="file-bar-chart"></i> Reports
          </li>
          <li class="nav-item" data-page="profile">
             <i data-lucide="user"></i> My Profile
          </li>
        </ul>
        <div style="margin-top: auto;">
          <button id="managerLogoutBtn" class="nav-item" style="width:100%; border:none; background:none; font-size:1rem; cursor:pointer;">
            <i data-lucide="log-out"></i> Logout
          </button>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; padding:16px 24px; background:rgba(15, 23, 42, 0.4); border:1px solid rgba(255,255,255,0.05); border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.2);">
          <h1 class="page-title" id="pageTitle" style="font-size:1.5rem; font-weight:800; color:#ffffff; margin:0; letter-spacing:-0.5px;">Manager Dashboard</h1>
          <div style="display:flex; align-items:center; gap:24px; position:relative;">
             <div id="managerNotifyBtn" class="notification-btn" style="position:relative; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); cursor:pointer; width:42px; height:42px; display:flex; align-items:center; justify-content:center; border-radius:50%; transition:all 0.2s;" onmouseover="this.style.background='rgba(59, 130, 246, 0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
               <i data-lucide="bell" style="color:#cbd5e1; width:20px; height:20px;"></i>
               <span id="notifBadge" style="display:none; position:absolute; top:-2px; right:-2px; background:#ef4444; width:18px; height:18px; border-radius:50%; border:2px solid #0f172a; color:white; font-size:10px; font-weight:800; display:flex; align-items:center; justify-content:center; box-shadow:0 0 10px rgba(239, 68, 68, 0.5);"></span>
             </div>
             
             <!-- Notification Dropdown -->
             <div id="notifDropdown" style="display:none; position:absolute; top:60px; right:0px; width:320px; background:rgba(15, 23, 42, 0.95); backdrop-filter:blur(10px); border:1px solid rgba(59, 130, 246, 0.3); border-radius:12px; box-shadow:0 20px 40px rgba(0,0,0,0.5); z-index:1000; overflow:hidden;">
                <div style="padding:16px 20px; border-bottom:1px solid rgba(255,255,255,0.05); font-weight:700; color:white; display:flex; justify-content:space-between; align-items:center;">
                   <span>Notifications</span>
                   <span style="font-size:0.75rem; background:rgba(59, 130, 246, 0.2); color:#60a5fa; padding:2px 8px; border-radius:12px;">Updates</span>
                </div>
                <div id="notifList" style="max-height:300px; overflow-y:auto; scrollbar-width:thin;">
                    <div style="padding:30px 20px; text-align:center; color:#64748b; font-size:0.85rem;">
                       <i data-lucide="bell-off" style="width:32px; height:32px; margin-bottom:12px; opacity:0.5;"></i><br>
                       No new notifications
                    </div>
                </div>
             </div>

             <div style="display:flex; align-items:center; gap:12px; padding-left:24px; border-left:1px solid rgba(255,255,255,0.1);">
                <div style="display:flex; flex-direction:column; align-items:flex-end;">
                   <span style="font-weight:700; color:#f8fafc; font-size:0.9rem;">${username}</span>
                   <span style="font-size:0.75rem; color:#64748b; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Manager</span>
                </div>
                <div class="avatar" style="width:40px; height:40px; background:linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:1.1rem; border:2px solid rgba(59, 130, 246, 0.5); box-shadow:0 4px 10px rgba(59, 130, 246, 0.3);">
                  ${username.charAt(0)}
                </div>
             </div>
          </div>
        </header>

        <div id="contentArea"></div>
      </main>
    </div>
  `;

  // Toggle Notification Dropdown
  document.getElementById("managerNotifyBtn")?.addEventListener("click", () => {
    const dd = document.getElementById("notifDropdown");
    if (dd.style.display === "none") {
      dd.style.display = "block";
      // We can re-fetch or just let the poll populate it. 
      // For now, let's just show what we have.
    } else {
      dd.style.display = "none";
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    const dd = document.getElementById("notifDropdown");
    const btn = document.getElementById("managerNotifyBtn");
    if (dd && dd.style.display === "block" && !dd.contains(e.target) && !btn.contains(e.target)) {
      dd.style.display = "none";
    }
  });

  // --- Sidebar Listeners ---
  document.querySelectorAll(".nav-menu .nav-item").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-menu .nav-item").forEach(el => el.classList.remove("active"));
      item.classList.add("active");
      const page = item.getAttribute("data-page");
      loadPage(page);
    });
  });

  document.getElementById("managerLogoutBtn")?.addEventListener("click", () => {
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

    if (page === "dashboard") {
      titleEl.textContent = "Manager Dashboard";
      renderDashboardView(contentArea);
    } else if (page === "tasks") {
      titleEl.textContent = "Team Tasks";
      renderTasksView(contentArea);
    } else if (page === "employees") {
      titleEl.textContent = "My Team";
      renderEmployeesView(contentArea);
    } else if (page === "reports") {
      titleEl.textContent = "Performance Reports";
      renderReportsView(contentArea);
    } else if (page === "profile") {
      titleEl.textContent = "My Profile";
      renderProfileView(contentArea);
    }

    if (window.lucide && window.lucide.createIcons) {
      setTimeout(() => window.lucide.createIcons(), 100);
    }
  }

  // --- Views ---

  // 1. Dashboard View
  async function renderDashboardView(container) {
    // Structure matches previous implementation
    container.innerHTML = `
        <section class="stats-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:24px; margin-bottom:32px;">
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
             <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statEmployees">0</div>
             <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Total Employees</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
             <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statCompleted">0</div>
             <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Tasks Completed</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
             <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statOverdue">0</div>
             <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Overdue Tasks</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
             <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statActive">0</div>
             <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Active Tasks</div>
           </div>
        </section>

        <section class="content-grid">
          <!-- Left Col: Escalation Status -->
          <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden; padding:0;">
            <div style="padding:20px 24px; border-bottom:1px solid rgba(30, 64, 175, 0.2); display:flex; justify-content:space-between; align-items:center;">
              <h3 style="margin:0; color:#3b82f6; font-size:1.1rem;">Escalation Status</h3>
              <button style="background:rgba(59, 130, 246, 0.1); border:1px solid rgba(59, 130, 246, 0.2); color:#3b82f6; padding:6px 12px; border-radius:6px; font-size:0.75rem; font-weight:600; cursor:pointer;">Export Report</button>
            </div>
            <table class="data-table" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:rgba(30, 64, 175, 0.1);">
                  <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase; letter-spacing:1px;">Assignee / Task</th>
                  <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase; letter-spacing:1px;">Delay</th>
                  <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase; letter-spacing:1px;">Escalation Level</th>
                  <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase; letter-spacing:1px;">Reason for Delay</th>
                </tr>
              </thead>
              <tbody id="overdueTableBody">
                <tr><td colspan="4" style="text-align:center; padding:32px; color:rgba(255,255,255,0.4);">Loading escalation data...</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Right Col: Team Performance -->
          <div class="panel">
            <div class="panel-header">
              <h3 class="panel-title">Team Completion Rate</h3>
            </div>
            <div style="padding: 20px 0;">
               <!-- Stacked Bar Chart -->
               <div style="margin-bottom: 8px; display:flex; justify-content:space-between; color:var(--text-muted); font-size:0.875rem;">
                 <span>Completed</span>
                 <span>In Progress / Other</span>
               </div>
               <div style="height: 24px; width: 100%; display: flex; border-radius: 12px; overflow: hidden; background: var(--bg-sidebar);">
                  <div id="completionBar" style="width: 0%; background: var(--accent-green); display:flex; align-items:center; justify-content:center; color:white; font-size:0.75rem; font-weight:bold; transition: width 0.5s ease;">0%</div>
                  <div id="remainingBar" style="width: 100%; background: var(--accent-blue); display:flex; align-items:center; justify-content:center; color:white; font-size:0.75rem; font-weight:bold; transition: width 0.5s ease;">0%</div>
               </div>
            </div>
            
            <div class="panel-header" style="margin-top: 32px;">
              <h3 class="panel-title">Productivity Trend</h3>
            </div>
             <div style="height: 220px; width: 100%; position: relative;" id="analyticsChart"></div>
          </div>
        </section>
      `;

    try {
      const data = await apiGet("/api/manager/overview");

      // Metrics
      const metrics = data?.metrics || {};
      document.getElementById("statEmployees").textContent = metrics.employees || 0;
      document.getElementById("statCompleted").textContent = metrics.completed || 0;
      document.getElementById("statOverdue").textContent = metrics.overdue || 0;
      document.getElementById("statActive").textContent = metrics.inProgress || 0;
      
      // Progress Bars
      const completionRate = metrics.completionRate || 0;
      const completionBar = document.getElementById("completionBar");
      const remainingBar = document.getElementById("remainingBar");
      if (completionBar && remainingBar) {
        completionBar.style.width = `${completionRate}%`;
        completionBar.textContent = `${completionRate}%`;
        remainingBar.style.width = `${100 - completionRate}%`;
        remainingBar.textContent = `${100 - completionRate}%`;
      }

      // Overdue Table (Real Data)
      const summary = data?.overdueSummary || [];
      const tbody = document.getElementById("overdueTableBody");
      if (tbody) {
        if (summary.length === 0) {
          tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No overdue tasks</td></tr>`;
        } else {
          tbody.innerHTML = summary.map(row => `
                <tr style="border-bottom:1px solid rgba(30, 64, 175, 0.1);">
                  <td style="padding:16px 24px;">
                    <div style="font-weight:600; color:#ffffff;">${row.owner}</div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">${row.task}</div>
                  </td>
                  <td style="padding:16px 24px; color:#ef4444; font-weight:700;">${row.delay} Days</td>
                  <td style="padding:16px 24px;">
                    <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(239, 68, 68, 0.1); color:#ef4444; padding:4px 10px; border-radius:6px; font-size:0.7rem; font-weight:700; border:1px solid rgba(239, 68, 68, 0.2);">
                      ${row.level || 'Escalated'}
                    </span>
                  </td>
                  <td style="padding:16px 24px;">
                    <div style="background:rgba(30, 64, 175, 0.1); border:1px solid rgba(30, 64, 175, 0.2); border-radius:6px; padding:10px; font-size:0.8rem; color:rgba(255,255,255,0.7); max-width:250px; line-height:1.4;">
                      <strong style="color:#3b82f6; font-size:0.7rem; display:block; margin-bottom:4px; text-transform:uppercase;">Delayed Reason:</strong>
                      ${row.problem || 'No explanation provided yet.'}
                    </div>
                  </td>
                </tr>
              `).join("");
        }
      }

      // Render Chart
      setTimeout(() => renderChart(data.chartData), 100);

    } catch (e) { console.error("Manager Hydrate Error", e); }
  }

  // 2. Tasks View
  function renderTasksView(container) {
    container.innerHTML = `
        <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden; padding:0;">
            <div style="padding:20px 24px; border-bottom:1px solid rgba(30, 64, 175, 0.2);">
                <h3 style="margin:0; color:#3b82f6;">All Team Tasks</h3>
            </div>
            <table class="data-table" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:rgba(30, 64, 175, 0.1);">
                        <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Task Title</th>
                        <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Assignee</th>
                        <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Status</th>
                        <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Due Date</th>
                        <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Delay Reason</th>
                    </tr>
                </thead>
                <tbody id="managerAllTasksTable">
                    <tr><td colspan="4" style="text-align:center; padding:32px; color:rgba(255,255,255,0.4);">Loading team tasks...</td></tr>
                </tbody>
            </table>
        </div>
      `;
    // Mocking fetch as we don't have a specific manager-all-tasks endpoint implemented yet in plan description
    // or we reuse existing overview data? 
    // For now, let's use a placeholder or assume overview has it.
    // Based on previous files, we can use /api/manager/overview but it might not have all tasks.
    // Let's assume we can fetch it or show construction state if strictly following plan.
    // However, for "Activate Sidebar", showing something is better.

    const tbody = document.getElementById("managerAllTasksTable");
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Loading tasks...</td></tr>';

    try {
      apiGet("/api/manager/tasks").then(tasks => {
        if (tasks.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No tasks found.</td></tr>';
          return;
        }

        tbody.innerHTML = tasks.map(t => {
          let statusColor = "blue";
          if (t.status === 'completed') statusColor = "green";
          if (t.status === 'overdue') statusColor = "red";
          if (t.status === 'in_progress') statusColor = "orange"; // fixed typo

          return `
                <tr>
                    <td><div style="font-weight:600;">${t.title}</div>
                        ${t.level && t.level !== 'Normal' ? `<span style="font-size:0.75em; color:var(--accent-red);">${t.level}</span>` : ''}
                    </td>
                    <td>${t.assignee || 'Unassigned'}</td>
                    <td><span class="status-badge ${statusColor}">${t.status.replace('_', ' ')}</span></td>
                    <td>${t.dueDate}</td>
                    <td>
                      <div style="background:rgba(255, 255, 255, 0.03); border:1px solid var(--border-color); border-radius:6px; padding:6px 10px; font-size:0.8rem; color:var(--text-muted); max-width:300px;">
                         ${t.employeeReport || '-'}
                      </div>
                    </td>
                </tr>
                `;
        }).join("");
      }).catch(err => {
        console.error(err);
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Failed to load tasks.</td></tr>';
      });
    } catch (e) {
      console.error(e);
    }
  }

  // 3. Employees View
  function renderEmployeesView(container) {
    container.innerHTML = `
        <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden; padding:0;">
            <div style="padding:20px 24px; border-bottom:1px solid rgba(30, 64, 175, 0.2);">
                <h3 style="margin:0; color:#3b82f6;">My Team Members</h3>
            </div>
            <table class="data-table" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:rgba(30, 64, 175, 0.1);">
                        <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Name / Dept</th>
                        <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Role</th>
                        <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Status</th>
                    </tr>
                </thead>
                <tbody id="managerEmployeesTable">
                   <tr><td colspan="3" style="text-align:center; padding:32px; color:rgba(255,255,255,0.4);">Loading team members...</td></tr>
                </tbody>
            </table>
        </div>
      `;
    // Placeholder
    // Fetch Employees
    const tbody = document.getElementById("managerEmployeesTable");
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Loading employees...</td></tr>';

    apiGet("/api/manager/employees").then(emps => {
      if (emps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No employees found.</td></tr>';
        return;
      }

      tbody.innerHTML = emps.map(e => {
        let badgeClass = "rgba(16, 185, 129, 0.1)";
        let badgeColor = "#10b981";
        if (e.status === "Has Delays") {
          badgeClass = "rgba(239, 68, 68, 0.1)";
          badgeColor = "#ef4444";
        }

        return `
            <tr style="border-bottom:1px solid rgba(30, 64, 175, 0.1);">
                <td style="padding:16px 24px;">
                    <div style="font-weight:600; color:#ffffff;">${e.name}</div>
                    <div style="font-size:0.75rem; color:rgba(255,255,255,0.5);">${e.department}</div>
                </td>
                <td style="padding:16px 24px; color:rgba(255,255,255,0.7);">${e.role}</td>
                <td style="padding:16px 24px;">
                    <span style="display:inline-flex; align-items:center; gap:6px; background:${badgeClass}; color:${badgeColor}; padding:4px 10px; border-radius:6px; font-size:0.7rem; font-weight:700; border:1px solid ${badgeColor}33;">
                      ${e.status}
                    </span>
                </td>
            </tr>
            `;
      }).join("");
    }).catch(err => {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">Failed to load employees.</td></tr>';
    });
  }

  // 4. Reports View
  function renderReportsView(container) {
    container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:32px;">
            <!-- Overdue Report -->
            <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden; padding:0;">
                <div style="padding:20px 24px; border-bottom:1px solid rgba(30, 64, 175, 0.2); display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; color:#ef4444; font-size:1.1rem; text-transform:uppercase; letter-spacing:1px;">Escalation Report (Overdue)</h3>
                    <button style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.2); color:#ef4444; padding:6px 12px; border-radius:6px; font-size:0.75rem; font-weight:600; cursor:pointer;">Download PDF</button>
                </div>
                <table class="data-table" style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="background:rgba(239, 68, 68, 0.05);">
                            <th style="padding:12px 24px; text-align:left; color:#fca5a5; font-size:0.7rem; text-transform:uppercase;">Assignee</th>
                            <th style="padding:12px 24px; text-align:left; color:#fca5a5; font-size:0.7rem; text-transform:uppercase;">Task</th>
                            <th style="padding:12px 24px; text-align:left; color:#fca5a5; font-size:0.7rem; text-transform:uppercase;">Delay</th>
                            <th style="padding:12px 24px; text-align:left; color:#fca5a5; font-size:0.7rem; text-transform:uppercase;">Status / Level</th>
                            <th style="padding:12px 24px; text-align:left; color:#fca5a5; font-size:0.7rem; text-transform:uppercase;">Reason for Delay</th>
                        </tr>
                    </thead>
                    <tbody id="reportOverdueBody">
                       <tr><td colspan="5" style="text-align:center; padding:32px; color:rgba(255,255,255,0.4);">Loading overdue report...</td></tr>
                    </tbody>
                </table>
            </div>

            <!-- Completed Report -->
            <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden; padding:0;">
                <div style="padding:20px 24px; border-bottom:1px solid rgba(30, 64, 175, 0.2); display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0; color:#10b981; font-size:1.1rem; text-transform:uppercase; letter-spacing:1px;">Completion Report</h3>
                    <button style="background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.2); color:#10b981; padding:6px 12px; border-radius:6px; font-size:0.75rem; font-weight:600; cursor:pointer;">Export CSV</button>
                </div>
                <table class="data-table" style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="background:rgba(16, 185, 129, 0.05);">
                            <th style="padding:12px 24px; text-align:left; color:#6ee7b7; font-size:0.7rem; text-transform:uppercase;">Assignee</th>
                            <th style="padding:12px 24px; text-align:left; color:#6ee7b7; font-size:0.7rem; text-transform:uppercase;">Task</th>
                            <th style="padding:12px 24px; text-align:left; color:#6ee7b7; font-size:0.7rem; text-transform:uppercase;">Completed Date</th>
                            <th style="padding:12px 24px; text-align:left; color:#6ee7b7; font-size:0.7rem; text-transform:uppercase;">Status</th>
                        </tr>
                    </thead>
                    <tbody id="reportCompletedBody">
                       <tr><td colspan="4" style="text-align:center; padding:32px; color:rgba(255,255,255,0.4);">Loading completion report...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
      `;

    Promise.all([
      apiGet("/api/manager/overview"),
      apiGet("/api/manager/reports") // Reusing for completed tasks
    ]).then(([vData, rData]) => {
      // Overdue / Violations
      const overdueBody = document.getElementById("reportOverdueBody");
      const violations = vData.overdueSummary || [];
      if (violations.length === 0) {
        overdueBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No overdue tasks.</td></tr>';
      } else {
        overdueBody.innerHTML = violations.map(r => `
                <tr style="border-bottom:1px solid rgba(30, 64, 175, 0.1);">
                    <td style="padding:16px 24px;"><div style="font-weight:600; color:#ffffff;">${r.assignee}</div></td>
                    <td style="padding:16px 24px; color:rgba(255,255,255,0.7);">${r.task}</td>
                    <td style="padding:16px 24px; color:#ef4444; font-weight:800;">${r.delay}</td>
                    <td style="padding:16px 24px;">
                        <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(239, 68, 68, 0.1); color:#ef4444; padding:4px 10px; border-radius:6px; font-size:0.7rem; font-weight:700; border:1px solid rgba(239, 68, 68, 0.2);">
                          ${r.level}
                        </span>
                    </td>
                    <td style="padding:16px 24px;">
                      <div style="background:rgba(30, 64, 175, 0.1); border:1px solid rgba(30, 64, 175, 0.2); border-radius:6px; padding:10px; font-size:0.8rem; color:rgba(255,255,255,0.7); max-width:300px; line-height:1.4;">
                        <strong style="color:#ef4444; font-size:0.7rem; display:block; margin-bottom:4px; text-transform:uppercase;">Delayed Reason:</strong>
                        ${r.problem || 'No explanation provided yet.'}
                      </div>
                    </td>
                </tr>
              `).join("");
      }

      // Completed
      const completedBody = document.getElementById("reportCompletedBody");
      const completed = rData.completed || [];
      if (completed.length === 0) {
        completedBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No completed tasks recently.</td></tr>';
      } else {
        completedBody.innerHTML = completed.map(r => `
                <tr style="border-bottom:1px solid rgba(30, 64, 175, 0.1);">
                    <td style="padding:16px 24px;"><div style="font-weight:600; color:#ffffff;">${r.assignee}</div></td>
                    <td style="padding:16px 24px; color:rgba(255,255,255,0.7);">${r.task}</td>
                    <td style="padding:16px 24px; color:rgba(255,255,255,0.5);">${r.completedDate}</td>
                    <td style="padding:16px 24px;">
                        <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(16, 185, 129, 0.1); color:#10b981; padding:4px 10px; border-radius:6px; font-size:0.7rem; font-weight:700; border:1px solid rgba(16, 185, 129, 0.2);">
                          ${r.status}
                        </span>
                    </td>
                </tr>
              `).join("");
      }
    }).catch(err => console.error(err));
  }

  // 5. Profile View (Read Only)
  function renderProfileView(container) {
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
        .sec-notice { margin: 0 32px 32px 32px; padding: 20px 24px; background: rgba(59, 130, 246, 0.05); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; display: flex; gap: 16px; align-items: flex-start; }
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
                ${user.department || 'Operations'}
                <span class="set-badge" style="margin-left: 12px;">Active</span>
              </p>
            </div>
          </div>
          
          <div class="set-section">
            <h3 class="set-title">Personal Information</h3>
            <div class="form-grid">
              <div class="form-group"><label>Full Name</label><div class="form-control">${username} <i data-lucide="lock" style="width:14px; height:14px; color:#64748b;"></i></div></div>
              <div class="form-group"><label>Email Address</label><div class="form-control">${user.email || 'manager@ethica.com'} <i data-lucide="lock" style="width:14px; height:14px; color:#64748b;"></i></div></div>
              <div class="form-group"><label>Role</label><div class="form-control">${user.role.toUpperCase()} <i data-lucide="lock" style="width:14px; height:14px; color:#64748b;"></i></div></div>
              <div class="form-group"><label>Department</label><div class="form-control">${user.department || 'Operations'} <i data-lucide="lock" style="width:14px; height:14px; color:#64748b;"></i></div></div>
            </div>
          </div>

          <div class="sec-notice">
            <div class="sec-icon"><i data-lucide="shield-check" style="width:24px; height:24px;"></i></div>
            <div class="sec-content">
              <h4>Managed by System Administrator</h4>
              <p>For security and compliance reasons, essential identifying details such as your Legal Name, Email Address, and Role are securely locked. To request modifications to your profile, please contact the <span style="color:#60a5fa; cursor:pointer; text-decoration:underline;">IT Department</span>.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }

  // Helper for Chart (High Fidelity)
  function renderChart(chartData) {
    const container = document.getElementById("analyticsChart");
    if (!container) return;

    // Default Data
    const labels = chartData?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const data = chartData?.data || [0, 0, 0, 0, 0, 0, 0];

    // Layout
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 200;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Scales
    const maxVal = Math.max(...data, 5); // Ensure at least 5
    const getX = (i) => padding.left + (i * chartWidth / (labels.length - 1));
    const getY = (val) => padding.top + chartHeight - (val * chartHeight / maxVal);

    // Bezier Control Points Logic (Smoothing)
    const controlPoint = (current, previous, next, reverse) => {
      const p = previous || current;
      const n = next || current;
      const smoothing = 0.2;
      const o = {
        x: n[0] - p[0],
        y: n[1] - p[1]
      };
      const angle = Math.atan2(o.y, o.x) + (reverse ? Math.PI : 0);
      const length = Math.sqrt(Math.pow(o.x, 2) + Math.pow(o.y, 2)) * smoothing;
      const x = current[0] + Math.cos(angle) * length;
      const y = current[1] + Math.sin(angle) * length;
      return [x, y];
    };

    const points = data.map((d, i) => [getX(i), getY(d)]);

    let dPath = `M ${points[0][0]},${points[0][1]}`;
    for (let i = 1; i < points.length; i++) {
      const cp1 = controlPoint(points[i - 1], points[i - 2], points[i]);
      const cp2 = controlPoint(points[i], points[i - 1], points[i + 1], true);
      dPath += ` C ${cp1[0]},${cp1[1]} ${cp2[0]},${cp2[1]} ${points[i][0]},${points[i][1]}`;
    }

    const areaPath = `${dPath} L ${points[points.length - 1][0]},${height - padding.bottom} L ${points[0][0]},${height - padding.bottom} Z`;

    // Tooltip Logic
    window.showTooltip = (evt, label, value) => {
      const tt = document.getElementById("chartTooltip");
      if (tt) {
        tt.style.display = "block";
        tt.style.left = evt.pageX + 10 + "px";
        tt.style.top = evt.pageY - 20 + "px";
        tt.innerHTML = `<strong>${label}</strong>: ${value} Tasks`;
      }
    };
    window.hideTooltip = () => {
      const tt = document.getElementById("chartTooltip");
      if (tt) tt.style.display = "none";
    };

    // Create Tooltip Element if missing
    if (!document.getElementById("chartTooltip")) {
      const tt = document.createElement("div");
      tt.id = "chartTooltip";
      tt.style.cssText = "position:absolute; background:var(--bg-card); border:1px solid var(--border-color); padding:8px; border-radius:4px; font-size:12px; pointer-events:none; display:none; z-index:100; box-shadow:0 4px 6px rgba(0,0,0,0.1);";
      document.body.appendChild(tt);
    }

    container.innerHTML = `
        <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:100%; overflow:visible;">
            <defs>
              <linearGradient id="gradBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.5" />
                <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
              </linearGradient>
            </defs>
            
            <!-- Grid Lines & Y-Axis Labels -->
            ${[0, 0.25, 0.5, 0.75, 1].map(p => {
      const y = getY(maxVal * p);
      return `
                 <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="var(--border-color)" stroke-dasharray="0" stroke-opacity="0.5" />
                 <text x="${padding.left - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">${Math.round(maxVal * p)}</text>
               `;
    }).join("")}
            
            <!-- X-Axis Labels -->
            ${labels.map((l, i) => `
               <text x="${getX(i)}" y="${height - 5}" text-anchor="middle" font-size="10" fill="var(--text-muted)">${l}</text>
            `).join("")}
            
            <!-- Area & Line -->
            <path d="${areaPath}" fill="url(#gradBlue)" />
            <path d="${dPath}" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
            
            <!-- Interactive Points -->
            ${points.map((p, i) => `
                <circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#3b82f6" stroke="var(--bg-card)" stroke-width="2" 
                    style="cursor:pointer; transition: r 0.2s;"
                    onmouseover="this.setAttribute('r', 7); window.showTooltip(evt, '${labels[i]}', ${data[i]})"
                    onmouseout="this.setAttribute('r', 5); window.hideTooltip()"
                />
            `).join("")}
        </svg>
     `;
  }

  // Initial Load
  loadPage("dashboard");

  // Real-time Poll (Every 5 seconds)
  let lastNotificationId = 0; // Track last seen notification

  const loadDashboardData = () => {
    if (currentPage === 'dashboard') {
      // Silent refresh for chart
      apiGet("/api/manager/overview").then(data => {
        if (data.chartData) renderChart(data.chartData);

        // Stats
        const metrics = data?.metrics || {};
        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        setText("statEmployees", metrics.employees || 0);
        setText("statCompleted", metrics.completed || 0);
        setText("statOverdue", metrics.overdue || 0);
        setText("statActive", metrics.inProgress || 0);

        // Update Bars
        const rate = metrics.completionRate || 0;
        const inverse = 100 - rate;
        const compBar = document.getElementById("completionBar");
        const remBar = document.getElementById("remainingBar");
        if (compBar) { compBar.style.width = `${rate}%`; compBar.innerText = `${rate}%`; }
        if (remBar) { remBar.style.width = `${inverse}%`; remBar.innerText = `${inverse}%`; }

        // Check for new notifications
        const notifs = data.notifications || [];

        // Populate Dropdown List
        const notifList = document.getElementById("notifList");
        if (notifList && notifs.length > 0) {
          notifList.innerHTML = notifs.map(n => `
                <div style="padding:10px 15px; border-bottom:1px solid var(--border-color); font-size:0.85rem;">
                    <div style="font-weight:600; margin-bottom:2px;">${(n.type || 'info').toUpperCase()}</div>
                    <div style="color:var(--text-muted);">${n.message}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">${(n.created_at || n.date || "").split('T')[0]}</div>
                </div>
             `).join("");
        } else if (notifList) {
          notifList.innerHTML = '<div style="padding:15px; text-align:center; color:var(--text-muted); font-size:0.85rem;">No new notifications</div>';
        }

        if (notifs.length > 0) {
          const latestId = notifs[0].id;

          // Show red badge if we have notifs
          const bell = document.getElementById("notifBadge");
          if (bell) bell.style.display = "block";

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
        }

      }).catch(e => console.error("Poll Error", e));
    }
  };

  const pollInterval = setInterval(loadDashboardData, 5000);
  setTimeout(loadDashboardData, 500);

  // Toast Helper
  function showToast(message) {
    // Create container if missing
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      toastContainer.style.cssText = "position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;";
      document.body.appendChild(toastContainer);
    }

    // Create Toast
    const toast = document.createElement("div");
    toast.style.cssText = `
          background: #1e293b; 
          color: #fff; 
          padding: 15px 20px; 
          border-radius: 8px; 
          box-shadow: 0 4px 12px rgba(0,0,0,0.5); 
          border-left: 4px solid #ef4444; 
          font-size: 14px; 
          min-width: 300px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
      `;
    toast.innerHTML = `
        <div style="font-weight:bold; margin-bottom:5px;">Check Dashboard</div>
        <div>${message}</div>
      `;

    toastContainer.appendChild(toast);

    // Animate In
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    // Sound (Optional "pop")
    try {
      const audio = new Audio("/sounds/mild_sound.mp3");
      audio.volume = 0.7;
      audio.play().catch(e => console.warn("Manager Audio Playback failed:", e));
    } catch (e) {
      console.error("Manager Audio Playback failed:", e); // Changed to match the catch block's purpose
    }

    // Remove after 5s
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // Cleanup on logout or page unload (basic cleanup)
  window.addEventListener("beforeunload", () => clearInterval(pollInterval));

  window.addEventListener("resize", renderChart);

  // New Project Modal Helpers
  window.showNewProjectModal = () => {
    const modal = document.getElementById("newProjectModal");
    if (modal) {
      document.getElementById("newProjectForm").reset();
      modal.style.display = "flex";
    }
  };

  window.closeNewProjectModal = () => {
    const modal = document.getElementById("newProjectModal");
    if (modal) modal.style.display = "none";
  };

  // Delegate for New Project Form submission
  document.addEventListener("submit", async (e) => {
    if (e.target.id === "newProjectForm") {
      e.preventDefault();
      const payload = {
        projectName: document.getElementById("projName").value,
        title: document.getElementById("projTaskTitle").value,
        clientName: document.getElementById("projClient").value,
        dueDate: document.getElementById("projDueDate").value
      };

      try {
        const res = await apiPost("/api/manager/projects", payload);
        alert(res.message || "Project created successfully!");
        window.closeNewProjectModal();
        if (currentPage === "tasks") loadPage("tasks"); // Refresh tasks
      } catch (err) {
        alert(err.message || "Failed to create project");
      }
    }
  });

  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
}
