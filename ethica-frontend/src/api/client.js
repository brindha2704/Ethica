const API_BASE = "";

export function getAuthToken() {
  return sessionStorage.getItem("token");
}

export async function apiGet(path) {
  return apiRequest(path, "GET");
}

export async function apiPost(path, body) {
  return apiRequest(path, "POST", body);
}

export async function apiPut(path, body) {
  return apiRequest(path, "PUT", body);
}

export async function apiDelete(path) {
  return apiRequest(path, "DELETE");
}

async function apiRequest(path, method, body) {
  const token = getAuthToken();
  if (!token) {
    throw new Error("Missing auth token");
  }

  const headers = {
    Authorization: `Bearer ${token}`
  };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const errData = await response.json();
      if (errData?.message) {
        message = errData.message;
      }
    } catch {
      // ignore parse failures for non-json error bodies
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
