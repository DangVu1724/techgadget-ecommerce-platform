CREATE TABLE related_products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    related_product_id BIGINT NOT NULL,
    display_order INT DEFAULT 0,
    CONSTRAINT fk_related_products_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_related_products_related_product
        FOREIGN KEY (related_product_id) REFERENCES products(id),
    CONSTRAINT uk_related_products_pair
        UNIQUE (product_id, related_product_id)
);
