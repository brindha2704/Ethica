import { renderLogin } from "./login.js";
import { renderRegister } from "./register.js";

// Make functions global so other files can call them
window.showLogin = renderLogin;
window.showRegister = renderRegister;

// Start app with Login page
renderLogin();
