export function renderRegister() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="auth-bg">
      <div class="auth-layout">

        <div class="auth-brand">
          <img src="/images/logo.png" alt="Ethica" style="width: 1000px; height: auto;" />
        </div>

        <div class="auth-card">
          <h2>Create Account</h2>

          <input id="regFirstName" placeholder="First name" autocomplete="off" />
          <input id="regLastName" placeholder="Last name" autocomplete="off" />
          <input id="regEmail" placeholder="Email address" autocomplete="off" />
          <input id="regPassword" type="password" placeholder="Password" autocomplete="off" />
          
          <select id="regRole">
            <option value="" disabled selected>Select Role</option>
            <option value="employee">Employee</option>
            <option value="hr">HR</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>

          <button id="registerBtn">Register</button>

          <p id="regMsg" class="msg"></p>

          <p class="sub">
            Already have an account?
            <span id="goLogin">Login here</span>
          </p>
        </div>

      </div>
    </div>
  `;

  // Go to Login
  document.getElementById("goLogin").onclick = () => {
    window.showLogin();
  };

  // Register Logic
  document.getElementById("registerBtn").onclick = async () => {
    const msg = document.getElementById("regMsg");
    msg.innerText = "";
    msg.style.color = "#ef4444"; // Reset to red

    const firstName = document.getElementById("regFirstName").value.trim();
    const lastName = document.getElementById("regLastName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const role = document.getElementById("regRole").value;

    if (!firstName || !lastName || !email || !password || !role) {
      msg.innerText = "All fields are required";
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password, role })
      });

      const data = await response.json();

      if (!response.ok) {
        msg.innerText = data.message || "Registration failed";
        return;
      }

      msg.style.color = "#22c55e"; // Green for success
      msg.innerText = "Registration successful! Redirecting to login...";

      setTimeout(() => {
        window.showLogin();
      }, 1500);

    } catch (error) {
      console.error("Register Error:", error);
      msg.innerText = "Error: " + error.message;
    }
  };
}
