const BASE_URL = "/api";

export async function apiRequest(endpoint, method, body = null) {
    const response = await fetch(BASE_URL + endpoint, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: body ? JSON.stringify(body) : null
    });

    return response.json();
}
