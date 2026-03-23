export function renderLogin() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="auth-bg">
      <div class="auth-layout">

        <div class="auth-brand">
          <img src="/images/logo.png" alt="Ethica" style="width: 1000px; height: auto;" />
        </div>

        <div class="auth-card">
          <h2>Login</h2>

          <p class="sub">
            New here?
            <span id="goRegister">Create account</span>
          </p>

          <input id="firstName" placeholder="First name" autocomplete="off" />
          <input id="password" type="password" placeholder="Password" autocomplete="off" />

          <button id="loginBtn">Login</button>

          <p id="msg" class="msg"></p>
        </div>

      </div>
    </div>
  `;

  // Go to Register
  document.getElementById("goRegister").onclick = () => {
    window.showRegister();
  };

  // Login Logic
  document.getElementById("loginBtn").onclick = async () => {
    const msg = document.getElementById("msg");
    msg.innerText = "";

    const firstName = document.getElementById("firstName").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!firstName || !password) {
      msg.innerText = "First name and password required";
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, password })
      });

      const data = await response.json();

      if (!response.ok) {
        msg.innerText = data.message || "Login failed";
        return;
      }

      // STRICT AUTH: Only use sessionStorage
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      // Clear any old localStorage to be safe
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      msg.innerText = "Login successful! Redirecting...";

      setTimeout(() => {
        // Redirect based on role
        if (data.user.role === "admin") window.location.hash = "#/admin";
        else if (data.user.role === "hr") window.location.hash = "#/hr";
        else if (data.user.role === "manager") window.location.hash = "#/manager";
        else window.location.hash = "#/employee";

        window.location.reload();
      }, 500);

    } catch (error) {
      console.error("Login Error:", error);
      msg.innerText = "Error: " + error.message;
    }
  };
}
