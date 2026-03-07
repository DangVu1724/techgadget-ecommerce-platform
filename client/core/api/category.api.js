const BASE_URL = "http://localhost:8080/api";

export async function getCategories() {
    const res = await fetch(`${BASE_URL}/category`);
    return res.json();
}

export async function getCategoryById(id) {
    const res = await fetch(`${BASE_URL}/category/${id}`);
    return res.json();
}