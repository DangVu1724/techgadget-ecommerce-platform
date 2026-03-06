const BASE_URL = "http://localhost:8080/api";

export async function getBrands() {
    const res = await fetch(`${BASE_URL}/brands`);
    return res.json();
}

export async function getBrandById(id) {
    const res = await fetch(`${BASE_URL}/brands/${id}`);
    return res.json();
}