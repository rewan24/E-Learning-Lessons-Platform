const API_URL = "http://127.0.0.1:8000/api";

export async function apiFetch(endpoint, options = {}) {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    let headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (access) {
        headers["Authorization"] = `Bearer ${access}`;
    }

    let response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401 && refresh) {
        const refreshResponse = await fetch(`${API_URL}/users/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });

        if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem("access", data.access);

            headers["Authorization"] = `Bearer ${data.access}`;
            response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });
        } else {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            window.location.href = "/login";
        }
    }

    return response;
}
