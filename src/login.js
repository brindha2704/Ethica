export function renderLogin() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="auth-page">
      <div class="auth-left"></div>
      <div class="auth-right">
        <div class="auth-card">
          <h3>Ethica Login</h3>

          <input id="loginEmail" class="auth-input" placeholder="Email" />
          <input id="loginPassword" type="password" class="auth-input" placeholder="Password" />

          <button id="loginBtn" class="btn-primary">Login</button>

          <p>New here? <span class="auth-link" id="goRegister">Create account</span></p>

          <p id="msg"></p>
        </div>
      </div>
    </div>
  `;

  // Go to register page
  document.getElementById("goRegister").onclick = () => {
    window.showRegister();
  };

  // Handle login
  document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const msg = document.getElementById("msg");

    if (!email || !password) {
      msg.className = "text-danger";
      msg.innerText = "Please enter email and password";
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE:", data);

      if (!res.ok) {
        msg.className = "text-danger";
        msg.innerText = data.message || "Login failed";
        return;
      }

      // ✅ Save token
      localStorage.setItem("token", data.token);

      msg.className = "text-success";
      msg.innerText = "Login successful! Token saved.";

      // Later you can redirect to dashboard
      // window.location.href = "/dashboard.html";

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      msg.className = "text-danger";
      msg.innerText = "Cannot connect to server!";
    }
  };
}
