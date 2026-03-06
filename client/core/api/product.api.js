const BASE_URL = "http://localhost:8080/api";

export async function getProducts() {
    const res = await fetch(`${BASE_URL}/products`);
    return res.json();
}

export async function getProductById(id) {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    return res.json();
}