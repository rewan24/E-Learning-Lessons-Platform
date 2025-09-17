import api from "./api";

export async function registerUser(data) {
    const res = await api.post("users/register/", data);
    return res.data;
}

export async function loginUser(data) {
    const res = await api.post("users/login/", data);
    const tokens = res.data;
    localStorage.setItem("access", tokens.access);
    localStorage.setItem("refresh", tokens.refresh);
    api.defaults.headers.common["Authorization"] = `Bearer ${tokens.access}`;
    return tokens;
}

export function logoutUser() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    delete api.defaults.headers.common["Authorization"];
}
