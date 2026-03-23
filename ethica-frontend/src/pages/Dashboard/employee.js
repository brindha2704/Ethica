import { apiGet, apiPut } from "../../api/client.js";

export function renderEmployeeDashboard() {
  const app = document.getElementById("app");
  const user = JSON.parse(sessionStorage.getItem("user"));
  const username = user?.name || user?.firstName || user?.first_name || "Employee";

  // --- Custom Styles for Premium UI ---
  if (!document.getElementById("dashboardCustomStyles")) {
    const styleBlock = document.createElement("style");
    styleBlock.id = "dashboardCustomStyles";
    styleBlock.innerHTML = `
      .problem-card {
        background: #0a0a0a;
        border: 2px solid #1f2937;
        border-radius: 10px;
        padding: 16px;
        margin-top: 12px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.4);
      }
      .problem-label {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.8rem;
        color: #ff4d4d;
        font-weight: 800;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }
      .problem-textarea {
        width: 100%;
        padding: 12px;
        background: #000000;
        border: 1px solid #334155;
        color: #ffffff;
        border-radius: 8px;
        font-size: 0.95rem;
        min-height: 60px;
        resize: vertical;
        transition: border-color 0.2s;
        line-height: 1.5;
      }
      .problem-textarea:focus {
        outline: none;
        border-color: #ff4d4d;
        box-shadow: 0 0 0 2px rgba(255, 77, 77, 0.1);
      }
      .premium-btn {
        padding: 8px 20px;
        background: #2563eb;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 700;
        font-size: 0.85rem;
        transition: background 0.2s, transform 0.1s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .premium-btn:hover {
        background: #1d4ed8;
      }
      .premium-btn:active {
        transform: scale(0.98);
      }
      .premium-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `;
    document.head.appendChild(styleBlock);
  }

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
      console.log("Employee Audio Unlocked");
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
             <span style="font-weight:800; font-size:1.05rem; color:#f8fafc; letter-spacing:-0.2px;">Employee Portal</span>
             <span style="font-size:0.75rem; color:#93c5fd; font-weight:600; margin-top:4px;">${user.department || "Technical"} Team</span>
          </div>
        </div>
        <ul class="nav-menu">
          <li class="nav-item active" data-page="dashboard">
            <i data-lucide="layout-grid"></i> Dashboard
          </li>
          <li class="nav-item" data-page="tasks">
             <i data-lucide="clipboard-list"></i> My Tasks
          </li>
          <li class="nav-item" data-page="completed">
             <i data-lucide="check-square"></i> Completed Tasks
          </li>
          <li class="nav-item" data-page="deadline">
             <i data-lucide="clock"></i> Deadlines
          </li>
          <li class="nav-item" data-page="profile">
             <i data-lucide="user"></i> My Profile
          </li>
        </ul>

        <!-- Assigned HR Card -->
        <div id="assignedHrContainer" style="margin: 20px 16px; padding: 16px; background: rgba(30, 64, 175, 0.15); border: 1px solid rgba(30, 64, 175, 0.3); border-radius: 12px; display:none;">
           <div style="font-size: 0.7rem; color: #60a5fa; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">Your assigned HR</div>
           <div id="assignedHrName" style="color: white; font-weight: 700; font-size: 0.9rem;">Loading...</div>
           <div id="assignedHrDept" style="color: rgba(255,255,255,0.5); font-size: 0.75rem; margin-top: 2px;"></div>
        </div>

        <div style="margin-top: auto;">
          <button id="employeeLogoutBtn" class="nav-item" style="width:100%; border:none; background:none; font-size:1rem; cursor:pointer;">
            <i data-lucide="log-out"></i> Logout
          </button>
        </div>
      </aside>

      <main class="main-content">
        <header class="top-bar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; padding:12px 24px; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.2);">
          <h1 class="page-title" id="pageTitle" style="font-size:1.5rem; font-weight:800; color:#ffffff; margin:0; letter-spacing:-0.5px;">Dashboard Overview</h1>
          <div style="display:flex; align-items:center; gap:20px;">
             <div id="empNotifyBtn" class="notification-btn" style="position:relative; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); cursor:pointer; width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:12px; transition:all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">
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
                   <span style="font-size:0.7rem; color:#60a5fa; font-weight:800; letter-spacing:0.5px;">EMPLOYEE</span>
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
 
     <!-- Report Issue Modal -->
     <div id="issueModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:2000; align-items:center; justify-content:center; backdrop-filter:blur(8px);">
        <div style="background:#0f172a; border:1px solid rgba(30, 64, 175, 0.5); width:90%; max-width:550px; border-radius:16px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); overflow:hidden; animation: modalFadeIn 0.3s ease-out;">
           <div style="padding:20px 24px; border-bottom:1px solid rgba(30, 64, 175, 0.2); display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; align-items:center; gap:12px;">
                 <div style="padding:8px; background:rgba(239, 68, 68, 0.1); border-radius:8px;">
                    <i data-lucide="alert-triangle" style="width:20px; height:20px; color:#ef4444;"></i>
                 </div>
                 <h3 style="margin:0; color:white; font-size:1.25rem;">Report an Issue</h3>
              </div>
              <button id="closeIssueModal" style="background:none; border:none; color:rgba(255,255,255,0.4); cursor:pointer; padding:4px; hover:color:white; transition:color 0.2s;">
                 <i data-lucide="x" style="width:24px; height:24px;"></i>
              </button>
           </div>
           <div style="padding:24px;">
              <input type="hidden" id="modalTaskId">
              <div style="margin-bottom:20px;">
                 <label style="display:block; color:rgba(255,255,255,0.5); font-size:0.75rem; font-weight:700; text-transform:uppercase; margin-bottom:8px;">Issue Type</label>
                 <select id="modalIssueType" style="width:100%; background:rgba(0,0,0,0.3); border:1px solid rgba(30, 64, 175, 0.3); color:white; padding:12px; border-radius:8px; font-size:0.9rem; outline:none; cursor:pointer;">
                    <option value="Technical Problem">Technical Problem</option>
                    <option value="Client Coordination">Client Coordination</option>
                    <option value="Resource Missing">Resource Missing</option>
                    <option value="Health/Personal">Health/Personal Issue</option>
                    <option value="Other">Other</option>
                 </select>
              </div>
              <div style="margin-bottom:20px;">
                 <label style="display:block; color:rgba(255,255,255,0.5); font-size:0.75rem; font-weight:700; text-transform:uppercase; margin-bottom:8px;">Description</label>
                 <textarea id="modalIssueDesc" placeholder="I'm unable to connect to the API service..." style="width:100%; background:rgba(0,0,0,0.3); border:1px solid rgba(30, 64, 175, 0.3); color:white; padding:12px; border-radius:8px; font-size:0.9rem; min-height:120px; outline:none; resize:none;"></textarea>
                 <div style="display:flex; justify-content:flex-end; margin-top:8px;">
                    <span id="charCount" style="font-size:0.7rem; color:rgba(255,255,255,0.3);">0 / 500</span>
                 </div>
              </div>
              <button id="submitIssueModal" class="premium-btn" style="width:100%; padding:14px; display:flex; align-items:center; justify-content:center; gap:8px; background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);">
                 <i data-lucide="check" style="width:18px; height:18px;"></i>
                 Update Report
              </button>
           </div>
        </div>
     </div>
 
     <style>
        @keyframes modalFadeIn {
           from { opacity:0; transform: translateY(20px); }
           to { opacity:1; transform: translateY(0); }
        }
     </style>
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
  document.getElementById("employeeLogoutBtn")?.addEventListener("click", () => {
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
      titleEl.textContent = "Employee Dashboard";
      renderDashboardView(contentArea);
    } else if (page === "tasks") {
      titleEl.textContent = "My Tasks";
      renderMyTasksView(contentArea);
    } else if (page === "completed") {
      titleEl.textContent = "Completed Tasks";
      renderCompletedView(contentArea);
    } else if (page === "deadline") {
      titleEl.textContent = "Missed Deadlines & Violations";
      renderDeadlinesView(contentArea);
    } else if (page === "profile") {
      titleEl.textContent = "My Profile";
      renderProfileView(contentArea);
    }

    // Re-init icons
    if (window.lucide && window.lucide.createIcons) {
      setTimeout(() => window.lucide.createIcons(), 100);
    }
  }

  // --- Shared Logic ---
  function attachTaskListeners() {
    // Complete Listeners
    document.querySelectorAll(".complete-btn").forEach(btn => {
      btn.onclick = async (e) => {
        const taskId = e.target.getAttribute("data-id");
        if (confirm("Mark task as completed?")) {
          try {
            await apiPut(`/api/employee/tasks/${taskId}/status`, { status: "completed" });
            loadPage(currentPage);
          } catch (err) {
            alert("Failed to update status");
          }
        }
      };
    });

    // Modal Trigger Listeners
    document.querySelectorAll(".report-issue-btn").forEach(btn => {
      btn.onclick = (e) => {
        const target = e.currentTarget;
        const taskId = target.getAttribute("data-id");
        const taskTitle = target.getAttribute("data-title");
        const existingReport = target.getAttribute("data-report");

        openIssueModal(taskId, taskTitle, existingReport);
      };
    });
  }

  // --- Modal Logic ---
  function openIssueModal(taskId, taskTitle, existingReport) {
    const modal = document.getElementById("issueModal");
    const taskIdField = document.getElementById("modalTaskId");
    const descField = document.getElementById("modalIssueDesc");
    const charCount = document.getElementById("charCount");

    if (modal && taskIdField && descField) {
      taskIdField.value = taskId;
      descField.value = existingReport || "";
      charCount.textContent = `${descField.value.length} / 500`;
      modal.style.display = "flex";

      // Auto-focus textarea
      setTimeout(() => descField.focus(), 100);
    }
  }

  function closeIssueModal() {
    const modal = document.getElementById("issueModal");
    if (modal) modal.style.display = "none";
  }

  // Add Modal Global Listeners
  document.getElementById("closeIssueModal")?.addEventListener("click", closeIssueModal);

  window.addEventListener("click", (e) => {
    const modal = document.getElementById("issueModal");
    if (e.target === modal) closeIssueModal();
  });

  const modalDesc = document.getElementById("modalIssueDesc");
  modalDesc?.addEventListener("input", (e) => {
    const count = e.target.value.length;
    const charCount = document.getElementById("charCount");
    if (charCount) {
      charCount.textContent = `${count} / 500`;
      charCount.style.color = count > 500 ? "#ef4444" : "rgba(255,255,255,0.3)";
    }
  });

  document.getElementById("submitIssueModal")?.addEventListener("click", async () => {
    const taskId = document.getElementById("modalTaskId").value;
    const issueType = document.getElementById("modalIssueType").value;
    const description = document.getElementById("modalIssueDesc").value;
    const btn = document.getElementById("submitIssueModal");

    if (!description.trim()) {
      alert("Please provide a description of the issue.");
      return;
    }

    try {
      btn.disabled = true;
      btn.innerHTML = `<i data-lucide="loader-2" class="animate-spin" style="width:18px; height:18px;"></i> Saving...`;
      if (window.lucide) window.lucide.createIcons();

      // We combine Issue Type and Description for the backend report field
      const fullReport = `[${issueType}] ${description}`;

      await apiPut(`/api/employee/tasks/${taskId}/problem`, { problem: fullReport });

      closeIssueModal();
      loadPage(currentPage); // Refresh to update data attributes
    } catch (err) {
      console.error("Save Problem Error:", err);
      alert("Failed to save explanation: " + err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="check" style="width:18px; height:18px;"></i> Update Report`;
      if (window.lucide) window.lucide.createIcons();
    }
  });

  // --- Views ---

  // 1. Dashboard View
  async function renderDashboardView(container) {
    container.innerHTML = `
      <section class="stats-grid" style="display:grid; grid-template-columns:repeat(4, 1fr); gap:24px; margin-bottom:32px;">
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
              <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statAssigned">0</div>
              <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Total Assigned</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
              <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statCompleted">0</div>
              <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Completed</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
              <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statDelayed">0</div>
              <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Overdue</div>
           </div>
           <div class="stat-card" style="background:rgba(30, 64, 175, 0.2); border:1px solid #1e40af; padding:24px; border-radius:12px; text-align:center; box-shadow:0 8px 32px rgba(0,0,0,0.3);">
              <div style="font-size:2.2rem; font-weight:800; color:#3b82f6; text-shadow:0 0 10px rgba(59,130,246,0.3);" id="statActive">0</div>
              <div style="color:#93c5fd; font-size:0.9rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; margin-top:8px;">Active</div>
           </div>
      </section>

      <section class="content-grid" style="grid-template-columns:1fr;">
         <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden; padding:0;">
            <div style="padding:20px 24px; border-bottom:1px solid rgba(30, 64, 175, 0.2);">
                <h3 style="margin:0; color:#3b82f6;">My Current Task Focus</h3>
            </div>
            <table class="data-table" style="width:100%; border-collapse:collapse;">
               <thead>
                  <tr style="background:rgba(30, 64, 175, 0.1);">
                     <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Task Details</th>
                     <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Due Date</th>
                     <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Status</th>
                     <th style="padding:12px 24px; text-align:right; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Actions</th>
                  </tr>
               </thead>
               <tbody id="dashboardTaskTableBody">
                  <tr><td colspan="4" style="text-align:center; padding:32px; color:rgba(255,255,255,0.4);">Loading tasks...</td></tr>
               </tbody>
            </table>
         </div>
      </section>
    `;

    try {
      const data = await apiGet("/api/employee/overview");
      const summary = data?.summary || {};
      const statAssigned = document.getElementById("statAssigned");
      const statCompleted = document.getElementById("statCompleted");
      const statDelayed = document.getElementById("statDelayed");
      const statActive = document.getElementById("statActive");

      if (statAssigned) statAssigned.textContent = summary.total || 0;
      if (statCompleted) statCompleted.textContent = summary.completed || 0;
      if (statDelayed) statDelayed.textContent = summary.overdue || 0;
      if (statActive) statActive.textContent = summary.pending || 0;

      const tasks = data?.tasks || [];
      const tbody = document.getElementById("dashboardTaskTableBody");
      const todayStr = new Date().toISOString().split('T')[0];

      if (tbody) {
        if (tasks.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding: 40px;">No tasks assigned yet.</td></tr>';
        } else {
          tbody.innerHTML = tasks.map(task => {
            const isLate = task.status?.toLowerCase() === 'overdue' || (task.status?.toLowerCase() !== 'completed' && task.dueDate <= todayStr);

            return `
             <tr style="border-bottom:1px solid rgba(30, 64, 175, 0.1);">
               <td style="padding:16px 24px; width:55%;">
                 <div style="font-weight:600; color:#ffffff; font-size:1rem;">${task.title}</div>
                 <div style="font-size:0.75rem; color:rgba(255,255,255,0.5); margin-bottom:8px;">${task.clientName || ""}</div>
                 
                 ${isLate ? `
                   <div style="margin-top:8px;">
                      <button class="report-issue-btn" data-id="${task.id}" data-title="${task.title}" data-report="${task.employeeReport || ''}" style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); color:#ef4444; padding:6px 12px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px;">
                         <i data-lucide="alert-triangle" style="width:14px; height:14px;"></i>
                         Report Issue
                      </button>
                   </div>
                 ` : ''}
               </td>
               <td style="padding:16px 24px; color:${isLate ? '#ef4444' : 'rgba(255,255,255,0.7)'}; font-weight:${isLate ? '700' : '500'};">${task.dueDate}</td>
               <td style="padding:16px 24px;">
                  <span style="display:inline-flex; align-items:center; gap:6px; background:${isLate ? 'rgba(239, 68, 68, 0.1)' : (task.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)')}; color:${isLate ? '#ef4444' : (task.status === 'completed' ? '#10b981' : '#f59e0b')}; padding:4px 10px; border-radius:6px; font-size:0.7rem; font-weight:700; border:1px solid ${isLate ? 'rgba(239, 68, 68, 0.2)' : (task.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)')};">
                    ${isLate ? "OVERDUE" : (task.status || "PENDING").toUpperCase()}
                  </span>
               </td>
               <td style="padding:16px 24px; text-align:right;">
                 ${task.status !== 'completed' ? `
                   <button class="complete-btn" data-id="${task.id}" style="background:#10b981; border:none; color:white; padding:6px 14px; border-radius:6px; cursor:pointer; font-weight:700; font-size:0.75rem;">
                     Complete
                   </button>
                 ` : '<span style="color:#10b981; font-weight:700; font-size:0.8rem;">Completed</span>'}
               </td>
             </tr>
           `}).join("");
          attachTaskListeners();
        }
      }

      // Sidebar HR Info
      const assignedHr = data?.assignedHr;
      if (assignedHr) {
        const hrName = document.getElementById("assignedHrName");
        const hrDept = document.getElementById("assignedHrDept");
        if (hrName) hrName.textContent = assignedHr.name;
        if (hrDept) hrDept.textContent = `${assignedHr.department} HR`;
      }
      updateNotificationUi(data?.notifications || []);
    } catch (e) {
      console.error("Dashboard Render Error", e);
    }
  }

  // 2. My Tasks View
  async function renderMyTasksView(container) {
    container.innerHTML = `
      <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden; padding:0;">
        <div style="padding:20px 24px; border-bottom:1px solid rgba(30, 64, 175, 0.2);">
           <h3 style="margin:0; color:#3b82f6;">My Full Task List</h3>
        </div>
        <table class="data-table" style="width:100%; border-collapse:collapse;">
           <thead>
             <tr style="background:rgba(30, 64, 175, 0.1);">
               <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Task Details</th>
               <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Due Date</th>
               <th style="padding:12px 24px; text-align:left; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Status</th>
               <th style="padding:12px 24px; text-align:right; color:#60a5fa; font-size:0.7rem; text-transform:uppercase;">Actions</th>
             </tr>
           </thead>
           <tbody id="myTasksTableBody">
             <tr><td colspan="4" style="text-align:center; padding:32px; color:rgba(255,255,255,0.4);">Loading full list...</td></tr>
           </tbody>
        </table>
      </div>
    `;

    try {
      const data = await apiGet("/api/employee/overview");
      const tasks = data?.tasks || [];
      const tbody = document.getElementById("myTasksTableBody");
      const todayStr = new Date().toISOString().split('T')[0];

      if (tbody) {
        if (tasks.length === 0) {
          tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:40px;">No tasks found. Keep it up!</td></tr>';
        } else {
          tbody.innerHTML = tasks.map(task => {
            const isLate = task.status?.toLowerCase() === 'overdue' || (task.status?.toLowerCase() !== 'completed' && task.dueDate <= todayStr);

            return `
                <tr style="border-bottom:1px solid rgba(30, 64, 175, 0.1);">
                  <td style="padding:16px 24px; width:60%;">
                     <div style="font-weight:600; color:#ffffff; font-size:1rem;">${task.title}</div>
                     <div style="font-size:0.75rem; color:rgba(255,255,255,0.5); margin-bottom:8px;">${task.projectName ? `Project: ${task.projectName}` : ''}</div>
                     
                     ${isLate ? `
                       <div style="margin-top:8px;">
                          <button class="report-issue-btn" data-id="${task.id}" data-title="${task.title}" data-report="${task.employeeReport || ''}" style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); color:#ef4444; padding:6px 12px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px;">
                             <i data-lucide="alert-triangle" style="width:14px; height:14px;"></i>
                             Report Issue
                          </button>
                       </div>
                     ` : ''}
                  </td>
                  <td style="padding:16px 24px; color:${isLate ? '#ef4444' : 'rgba(255,255,255,0.7)'}; font-weight:${isLate ? '700' : '500'};">${task.dueDate}</td>
                  <td style="padding:16px 24px;">
                    <span style="display:inline-flex; align-items:center; gap:6px; background:${isLate ? 'rgba(239, 68, 68, 0.1)' : (task.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)')}; color:${isLate ? '#ef4444' : (task.status === 'completed' ? '#10b981' : '#f59e0b')}; padding:4px 10px; border-radius:6px; font-size:0.7rem; font-weight:700; border:1px solid ${isLate ? 'rgba(239, 68, 68, 0.2)' : (task.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)')};">
                      ${isLate ? "OVERDUE" : (task.status || "PENDING").toUpperCase()}
                    </span>
                  </td>
                  <td style="padding:16px 24px; text-align:right;">
                    ${task.status !== 'completed' ? `
                      <button class="complete-btn" data-id="${task.id}" style="background:#10b981; border:none; color:white; padding:6px 14px; border-radius:6px; cursor:pointer; font-weight:700; font-size:0.75rem;">
                        Complete
                      </button>
                    ` : '<span style="color:#10b981; font-weight:700; font-size:0.8rem;">Completed</span>'}
                  </td>
                </tr>
              `}).join("");
          attachTaskListeners();
        }
      }
    } catch (e) {
      console.error("MyTasks Render Error", e);
    }
  }

  // 3. Completed Tasks View
  async function renderCompletedView(container) {
    container.innerHTML = `
        <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden; padding:0;">
            <div style="padding:20px 24px; border-bottom:1px solid rgba(30, 64, 175, 0.2);">
                <h3 style="margin:0; color:#10b981;">Completed Tasks History</h3>
            </div>
            <table class="data-table" style="width:100%; border-collapse:collapse;">
                <thead>
                    <tr style="background:rgba(16, 185, 129, 0.05);">
                        <th style="padding:12px 24px; text-align:left; color:#6ee7b7; font-size:0.7rem; text-transform:uppercase;">Task</th>
                        <th style="padding:12px 24px; text-align:left; color:#6ee7b7; font-size:0.7rem; text-transform:uppercase;">Due Date</th>
                        <th style="padding:12px 24px; text-align:left; color:#6ee7b7; font-size:0.7rem; text-transform:uppercase;">Reported Problem</th>
                        <th style="padding:12px 24px; text-align:right; color:#6ee7b7; font-size:0.7rem; text-transform:uppercase;">Status</th>
                    </tr>
                </thead>
                <tbody id="completedTasksTableBody">
                    <tr><td colspan="4" style="text-align:center; padding:32px; color:rgba(255,255,255,0.4);">Loading history...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    try {
      const data = await apiGet("/api/employee/overview");
      const allTasks = data?.tasks || [];
      const completedTasks = allTasks.filter(t => t.status === 'completed');

      const tbody = document.getElementById("completedTasksTableBody");
      if (tbody) {
        if (completedTasks.length === 0) {
          tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:40px;">No completed tasks found yet.</td></tr>`;
        } else {
          tbody.innerHTML = completedTasks.map(task => `
                  <tr>
                     <td>${task.title}</td>
                     <td>${task.dueDate}</td>
                     <td style="font-size:0.85rem; color:var(--text-muted); max-width:250px;">${task.employeeReport || '-'}</td>
                     <td><span class="status-badge success">Completed</span></td>
                  </tr>
               `).join("");
        }
      }
    } catch (e) {
      console.error("Completed View Error", e);
    }
  }

  // 4. Deadlines View
  async function renderDeadlinesView(container) {
    container.innerHTML = `
        <div class="table-card" style="background:rgba(15, 23, 42, 0.4); border:1px solid rgba(30, 64, 175, 0.3); border-radius:12px; overflow:hidden; padding:0;">
          <div style="padding:20px 24px; border-bottom:1px solid rgba(30, 64, 175, 0.2);">
            <h3 style="margin:0; color:#ef4444; font-size:1.1rem; text-transform:uppercase; letter-spacing:1px;">My Deadline Violations Report</h3>
          </div>
          <p style="padding:16px 24px; color:rgba(255,255,255,0.6); font-size:0.85rem; margin:0; background:rgba(239, 68, 68, 0.02);">
            Please provide explanations for any tasks that have passed their set deadlines. 
          </p>
          <table class="data-table" style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="background:rgba(239, 68, 68, 0.05);">
                <th style="padding:12px 24px; text-align:left; color:#fca5a5; font-size:0.7rem; text-transform:uppercase;">Violation Details</th>
                <th style="padding:12px 24px; text-align:left; color:#fca5a5; font-size:0.7rem; text-transform:uppercase;">Deadline</th>
                <th style="padding:12px 24px; text-align:left; color:#fca5a5; font-size:0.7rem; text-transform:uppercase;">Status</th>
              </tr>
            </thead>
            <tbody id="employeeDeadlinesBody">
              <tr><td colspan="3" style="text-align:center; padding:32px; color:rgba(255,255,255,0.4);">Generating report...</td></tr>
            </tbody>
          </table>
        </div>
      `;

    try {
      const data = await apiGet("/api/reports/deadline-violations");
      const violations = data.violations || [];
      const tbody = document.getElementById("employeeDeadlinesBody");

      if (tbody) {
        if (violations.length === 0) {
          tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding:40px;">No deadline violations reported. Good job!</td></tr>`;
        } else {
          tbody.innerHTML = violations.map(r => `
             <tr style="border-bottom:1px solid rgba(30, 64, 175, 0.1);">
               <td style="padding:16px 24px; width:60%;">
                 <div style="font-weight:600; color:#ffffff; font-size:1rem; margin-bottom:12px;">${r.task}</div>
                 
                 <div style="margin-top:12px;">
                    <button class="report-issue-btn" data-id="${r.id}" data-title="${r.task}" data-report="${r.problem || ''}" style="background:rgba(239, 68, 68, 0.1); border:1px solid rgba(239, 68, 68, 0.3); color:#ef4444; padding:6px 12px; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px;">
                       <i data-lucide="alert-triangle" style="width:14px; height:14px;"></i>
                       Update Report
                    </button>
                 </div>
               </td>
               <td style="padding:24px; vertical-align:top; color:#ef4444; font-weight:700;">${r.dueDate}</td>
               <td style="padding:24px; vertical-align:top;">
                  <div style="color:#ef4444; font-weight:800; font-size:1.1rem; margin-bottom:8px;">${r.delay}</div>
                  <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(239, 68, 68, 0.1); color:#ef4444; padding:4px 10px; border-radius:6px; font-size:0.7rem; font-weight:700; border:1px solid rgba(239, 68, 68, 0.2);">
                    ${r.level}
                  </span>
               </td>
             </tr>
           `).join("");
          attachTaskListeners();
        }
      }
    } catch (e) {
      console.error("Deadlines View Error", e);
      const tbody = document.getElementById("employeeDeadlinesBody");
      if (tbody) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#ef4444; padding:40px;">
          <i data-lucide="alert-circle" style="width:24px; height:24px; margin-bottom:8px; display:block; margin-inline:auto;"></i>
          Failed to load report: ${e.message}
        </td></tr>`;
        if (window.lucide) window.lucide.createIcons();
      }
    }
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
                ${user.department || 'Technical'}
                <span class="set-badge" style="margin-left: 12px;">Active</span>
              </p>
            </div>
          </div>
          
          <div class="set-section">
            <h3 class="set-title">Personal Information</h3>
            <div class="form-grid">
              <div class="form-group"><label>Full Name</label><div class="form-control">${username} <i data-lucide="lock" style="width:14px; height:14px; color:#64748b;"></i></div></div>
              <div class="form-group"><label>Email Address</label><div class="form-control">${user.email || 'employee@ethica.com'} <i data-lucide="lock" style="width:14px; height:14px; color:#64748b;"></i></div></div>
              <div class="form-group"><label>Role</label><div class="form-control">${user.role.toUpperCase()} <i data-lucide="lock" style="width:14px; height:14px; color:#64748b;"></i></div></div>
              <div class="form-group"><label>Department</label><div class="form-control">${user.department || 'Technical'} <i data-lucide="lock" style="width:14px; height:14px; color:#64748b;"></i></div></div>
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

  // --- Helper Functions ---
  function updateNotificationUi(notifs) {
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
            <div style="padding:12px 15px; border-bottom:1px solid var(--border-color);">
              <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="font-size:0.7rem; font-weight:700; color:var(--accent-${n.type === 'escalation' ? 'red' : 'blue'});">${n.type?.toUpperCase()}</span>
                <span style="font-size:0.7rem; color:var(--text-muted);">${n.date?.split('T')[0] || ''}</span>
              </div>
              <div style="font-size:0.85rem;">${n.message}</div>
            </div>
          `).join("");
      } else {
        notifList.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-muted); font-size:0.85rem;">No new notifications</div>';
      }
    }
  }

  function initNotificationUi() {
    const btn = document.getElementById("empNotifyBtn");
    const dropdown = document.getElementById("notifDropdown");
    const closeBtn = document.getElementById("closeNotifs");
    if (btn && dropdown) {
      btn.onclick = (e) => {
        e.stopPropagation();
        const isVisible = dropdown.style.display === "block";
        dropdown.style.display = isVisible ? "none" : "block";
      };
      document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && e.target !== btn) dropdown.style.display = "none";
      });
      if (closeBtn) closeBtn.onclick = () => dropdown.style.display = "none";
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
      audio.play().catch(e => console.warn("Employee Audio Playback failed:", e));
    } catch (e) {
      console.error("Employee Audio Error:", e);
    }

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  async function fetchHrInfo() {
    try {
      const data = await apiGet("/api/employee/overview");
      const assignedHr = data?.assignedHr;
      if (assignedHr) {
        const hrNameEl = document.getElementById("assignedHrName");
        const hrDeptEl = document.getElementById("assignedHrDept");
        if (hrNameEl) hrNameEl.textContent = assignedHr.name;
        if (hrDeptEl) hrDeptEl.textContent = `${assignedHr.department} HR`;
      }
    } catch (e) { }
  }

  // --- Initial Load ---
  loadPage("dashboard");
  fetchHrInfo();
  initNotificationUi();

  let lastNotificationId = 0;

  const pollInterval = setInterval(async () => {
    try {
      const data = await apiGet("/api/employee/overview");
      const notifs = data?.notifications || [];
      updateNotificationUi(notifs);

      if (notifs.length > 0) {
        const latestId = notifs[0].id;

        if (lastNotificationId === 0) {
          lastNotificationId = latestId;
          // Show the latest 2 or 3 notifications right away if we just logged in
          notifs.slice(0, 2).reverse().forEach((n, i) => {
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
    } catch (e) { }
  }, 5000);

  window.addEventListener("beforeunload", () => clearInterval(pollInterval));
}
