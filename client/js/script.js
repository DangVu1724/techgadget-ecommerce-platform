function loadProducts() {
    fetch("http://localhost:8080/api/products")
        .then(res => res.json())
        .then(data => console.log(data));
}