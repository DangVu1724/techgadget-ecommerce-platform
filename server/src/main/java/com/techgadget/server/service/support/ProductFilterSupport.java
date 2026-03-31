package com.techgadget.server.service.support;

import com.techgadget.server.exception.NotFoundException;
import com.techgadget.server.model.dto.product.ProductAttributeFilterResponse;
import com.techgadget.server.model.dto.product.ProductSummaryResponse;
import com.techgadget.server.model.entity.Attribute;
import com.techgadget.server.model.entity.Category;
import com.techgadget.server.model.entity.Product;
import com.techgadget.server.model.entity.ProductVariant;
import com.techgadget.server.model.entity.VariantAttributeValue;
import com.techgadget.server.repository.CategoryRepository;
import com.techgadget.server.repository.ProductFilterAttributeValueView;
import com.techgadget.server.repository.ProductRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class ProductFilterSupport {
    private static final Pattern NUMERIC_PATTERN = Pattern.compile("[-+]?\\d+(?:[.,]\\d+)?");

    @PersistenceContext
    private EntityManager entityManager;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductFilterSupport(
            ProductRepository productRepository,
            CategoryRepository categoryRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    public Page<ProductSummaryResponse> findFilteredProductSummaries(
            Pageable pageable,
            String keyword,
            Long brandId,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Map<String, List<String>> attributeFilters
    ) {
        Map<String, List<String>> resolvedFilters = resolveAttributeFilters(categoryId, brandId, attributeFilters);
        var cb = entityManager.getCriteriaBuilder();

        var query = cb.createQuery(ProductSummaryResponse.class);
        var root = query.from(Product.class);
        var categoryJoin = root.join("category");
        var brandJoin = root.join("brand");
        Join<Product, ProductVariant> variantJoin = root.join("variants");

        query.select(cb.construct(
                ProductSummaryResponse.class,
                root.get("id"),
                root.get("name"),
                root.get("image"),
                cb.min(variantJoin.get("price")),
                cb.sumAsLong(variantJoin.get("stock")),
                categoryJoin.get("name"),
                brandJoin.get("brandName"),
                root.get("createdAt")
        ));

        Predicate[] predicates = buildFilterPredicates(root, query, cb, keyword, brandId, categoryId, minPrice, maxPrice, resolvedFilters);
        query.where(predicates);
        query.groupBy(
                root.get("id"),
                root.get("name"),
                root.get("image"),
                categoryJoin.get("name"),
                brandJoin.get("brandName"),
                root.get("createdAt")
        );
        query.orderBy(buildSummaryOrders(cb, root, variantJoin, pageable.getSort()));

        List<ProductSummaryResponse> content = entityManager.createQuery(query)
                .setFirstResult((int) pageable.getOffset())
                .setMaxResults(pageable.getPageSize())
                .getResultList();

        var countQuery = cb.createQuery(Long.class);
        var countRoot = countQuery.from(Product.class);
        countQuery.select(cb.countDistinct(countRoot.get("id")));
        countQuery.where(buildFilterPredicates(countRoot, countQuery, cb, keyword, brandId, categoryId, minPrice, maxPrice, resolvedFilters));

        Long total = entityManager.createQuery(countQuery).getSingleResult();
        return new PageImpl<>(content, pageable, total);
    }

    public List<ProductAttributeFilterResponse> getAvailableFilters(Long categoryId, Long brandId) {
        List<Attribute> attributes = getCategoryAttributes(categoryId);
        if (attributes.isEmpty()) {
            return List.of();
        }

        Map<Long, Attribute> attributeMap = attributes.stream()
                .collect(Collectors.toMap(Attribute::getAttributeId, attribute -> attribute, (left, right) -> left, LinkedHashMap::new));

        Map<String, Set<Object>> groupedValues = new LinkedHashMap<>();
        attributes.forEach(attribute -> groupedValues.put(normalizeFilterName(attribute.getAttributeName()), new LinkedHashSet<>()));

        List<ProductFilterAttributeValueView> rows = productRepository.findDistinctAttributeValues(
                categoryId,
                brandId,
                attributeMap.keySet()
        );

        rows.forEach(row -> {
            Attribute attribute = attributeMap.get(row.getAttributeId());
            if (attribute == null) {
                return;
            }

            Object normalizedValue = normalizeFilterValue(attribute.getAttributeName(), row.getValue());
            if (normalizedValue != null) {
                groupedValues.computeIfAbsent(normalizeFilterName(attribute.getAttributeName()), ignored -> new LinkedHashSet<>())
                        .add(normalizedValue);
            }
        });

        return groupedValues.entrySet().stream()
                .map(entry -> ProductAttributeFilterResponse.builder()
                        .name(entry.getKey())
                        .values(sortFilterValues(entry.getValue()))
                        .build())
                .toList();
    }

    public Page<ProductSummaryResponse> searchProductsByName(String name, Pageable pageable) {
        Page<ProductSummaryResponse> page = productRepository.findProductSummaryByName(
                name,
                PageRequest.of(pageable.getPageNumber(), pageable.getPageSize())
        );

        List<ProductSummaryResponse> sortedContent = sortProductSummaries(page.getContent(), pageable.getSort());
        return new PageImpl<>(sortedContent, pageable, page.getTotalElements());
    }

    private List<ProductSummaryResponse> sortProductSummaries(List<ProductSummaryResponse> products, Sort sort) {
        if (sort == null || sort.isUnsorted()) {
            return products;
        }

        Comparator<ProductSummaryResponse> comparator = null;

        for (Sort.Order order : sort) {
            Comparator<ProductSummaryResponse> nextComparator = switch (order.getProperty()) {
                case "name" -> Comparator.comparing(
                        ProductSummaryResponse::getName,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
                );
                case "createdAt" -> Comparator.comparing(
                        ProductSummaryResponse::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())
                );
                case "minPrice" -> Comparator.comparing(
                        ProductSummaryResponse::getMinPrice,
                        Comparator.nullsLast(BigDecimal::compareTo)
                );
                default -> null;
            };

            if (nextComparator == null) {
                continue;
            }

            if (order.isDescending()) {
                nextComparator = nextComparator.reversed();
            }

            comparator = comparator == null ? nextComparator : comparator.thenComparing(nextComparator);
        }

        if (comparator == null) {
            return products;
        }

        return products.stream()
                .sorted(comparator.thenComparing(ProductSummaryResponse::getId, Comparator.nullsLast(Long::compareTo)))
                .toList();
    }

    private Predicate[] buildFilterPredicates(
            jakarta.persistence.criteria.Root<Product> root,
            jakarta.persistence.criteria.CommonAbstractCriteria query,
            jakarta.persistence.criteria.CriteriaBuilder cb,
            String keyword,
            Long brandId,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Map<String, List<String>> attributeFilters
    ) {
        List<Predicate> predicates = new ArrayList<>();

        if (keyword != null && !keyword.isBlank()) {
            String pattern = "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("brand").get("brandName")), pattern)
            ));
        }

        if (brandId != null) {
            predicates.add(cb.equal(root.get("brand").get("brandId"), brandId));
        }

        if (categoryId != null) {
            predicates.add(cb.equal(root.get("category").get("id"), categoryId));
        }

        if (minPrice != null || maxPrice != null) {
            var priceSubquery = query.subquery(Long.class);
            var variantRoot = priceSubquery.from(ProductVariant.class);
            List<Predicate> pricePredicates = new ArrayList<>();
            pricePredicates.add(cb.equal(variantRoot.get("product").get("id"), root.get("id")));
            if (minPrice != null) {
                pricePredicates.add(cb.greaterThanOrEqualTo(variantRoot.get("price"), minPrice));
            }
            if (maxPrice != null) {
                pricePredicates.add(cb.lessThanOrEqualTo(variantRoot.get("price"), maxPrice));
            }
            priceSubquery.select(variantRoot.get("product").get("id"))
                    .where(pricePredicates.toArray(Predicate[]::new));
            predicates.add(cb.exists(priceSubquery));
        }

        attributeFilters.forEach((attributeName, values) -> {
            if (values == null || values.isEmpty()) {
                return;
            }

            var attributeSubquery = query.subquery(Long.class);
            var valueRoot = attributeSubquery.from(VariantAttributeValue.class);
            var attributePath = cb.lower(valueRoot.get("attribute").get("attributeName"));
            var valuePath = cb.lower(valueRoot.get("value"));

            attributeSubquery.select(valueRoot.get("variant").get("product").get("id"))
                    .where(
                            cb.equal(valueRoot.get("variant").get("product").get("id"), root.get("id")),
                            cb.equal(attributePath, attributeName.toLowerCase(Locale.ROOT)),
                            valuePath.in(values.stream()
                                    .filter(Objects::nonNull)
                                    .map(value -> value.toLowerCase(Locale.ROOT))
                                    .toList())
                    );

            predicates.add(cb.exists(attributeSubquery));
        });

        return predicates.toArray(Predicate[]::new);
    }

    private List<jakarta.persistence.criteria.Order> buildSummaryOrders(
            jakarta.persistence.criteria.CriteriaBuilder cb,
            jakarta.persistence.criteria.Root<Product> root,
            Join<Product, ProductVariant> variantJoin,
            Sort sort
    ) {
        List<jakarta.persistence.criteria.Order> orders = new ArrayList<>();

        if (sort != null) {
            for (Sort.Order order : sort) {
                boolean ascending = order.isAscending();
                switch (order.getProperty()) {
                    case "name" -> orders.add(ascending ? cb.asc(root.get("name")) : cb.desc(root.get("name")));
                    case "createdAt" -> orders.add(ascending ? cb.asc(root.get("createdAt")) : cb.desc(root.get("createdAt")));
                    case "minPrice" -> orders.add(ascending ? cb.asc(cb.min(variantJoin.get("price"))) : cb.desc(cb.min(variantJoin.get("price"))));
                    default -> {
                    }
                }
            }
        }

        orders.add(cb.desc(root.get("id")));
        return orders;
    }

    private Map<String, List<String>> resolveAttributeFilters(Long categoryId, Long brandId, Map<String, List<String>> attributeFilters) {
        if (attributeFilters == null || attributeFilters.isEmpty()) {
            return Map.of();
        }

        if (categoryId == null) {
            return attributeFilters.entrySet().stream()
                    .filter(entry -> entry.getValue() != null && !entry.getValue().isEmpty())
                    .collect(Collectors.toMap(
                            Map.Entry::getKey,
                            entry -> entry.getValue().stream()
                                    .map(String::trim)
                                    .filter(value -> !value.isBlank())
                                    .toList(),
                            (left, right) -> left,
                            LinkedHashMap::new
                    ));
        }

        List<Attribute> attributes = getCategoryAttributes(categoryId);
        Map<String, Attribute> attributesByKey = attributes.stream()
                .collect(Collectors.toMap(attribute -> normalizeFilterName(attribute.getAttributeName()), attribute -> attribute, (left, right) -> left, LinkedHashMap::new));

        Set<Long> requestedAttributeIds = attributeFilters.keySet().stream()
                .map(attributesByKey::get)
                .filter(Objects::nonNull)
                .map(Attribute::getAttributeId)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Map<String, Map<String, Set<String>>> rawValuesByAttribute = requestedAttributeIds.isEmpty()
                ? Map.of()
                : buildRawValueLookup(categoryId, brandId, requestedAttributeIds, attributesByKey);

        Map<String, List<String>> resolved = new LinkedHashMap<>();
        attributeFilters.forEach((filterKey, selectedValues) -> {
            Attribute attribute = attributesByKey.get(filterKey);
            if (attribute == null || selectedValues == null || selectedValues.isEmpty()) {
                return;
            }

            Map<String, Set<String>> rawValuesByNormalizedValue = rawValuesByAttribute.getOrDefault(attribute.getAttributeName(), Map.of());
            Set<String> rawMatches = new LinkedHashSet<>();

            for (String selectedValue : selectedValues) {
                if (selectedValue == null || selectedValue.isBlank()) {
                    continue;
                }

                String normalizedSelectedValue = normalizeFilterSelection(selectedValue);
                Set<String> matches = rawValuesByNormalizedValue.get(normalizedSelectedValue);
                if (matches != null && !matches.isEmpty()) {
                    rawMatches.addAll(matches);
                } else {
                    rawMatches.add(selectedValue.trim());
                }
            }

            if (!rawMatches.isEmpty()) {
                resolved.put(attribute.getAttributeName(), new ArrayList<>(rawMatches));
            }
        });

        return resolved;
    }

    private Map<String, Map<String, Set<String>>> buildRawValueLookup(
            Long categoryId,
            Long brandId,
            Collection<Long> attributeIds,
            Map<String, Attribute> attributesByKey
    ) {
        Map<Long, String> namesById = attributesByKey.values().stream()
                .collect(Collectors.toMap(Attribute::getAttributeId, Attribute::getAttributeName, (left, right) -> left));

        Map<String, Map<String, Set<String>>> lookup = new LinkedHashMap<>();
        productRepository.findDistinctAttributeValues(categoryId, brandId, attributeIds)
                .forEach(row -> {
                    String attributeName = namesById.get(row.getAttributeId());
                    if (attributeName == null || row.getValue() == null || row.getValue().isBlank()) {
                        return;
                    }

                    String normalizedValue = normalizeFilterSelection(String.valueOf(normalizeFilterValue(attributeName, row.getValue())));
                    lookup.computeIfAbsent(attributeName, ignored -> new LinkedHashMap<>())
                            .computeIfAbsent(normalizedValue, ignored -> new LinkedHashSet<>())
                            .add(row.getValue().trim());
                });

        return lookup;
    }

    private List<Attribute> getCategoryAttributes(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new NotFoundException("Category not found with id: " + categoryId));

        return category.getAttributes().stream()
                .sorted(Comparator.comparing(Attribute::getAttributeName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    private List<Object> sortFilterValues(Set<Object> values) {
        return values.stream()
                .sorted((left, right) -> {
                    boolean leftNumeric = left instanceof Number;
                    boolean rightNumeric = right instanceof Number;
                    if (leftNumeric && rightNumeric) {
                        return new BigDecimal(left.toString()).compareTo(new BigDecimal(right.toString()));
                    }
                    if (leftNumeric) {
                        return -1;
                    }
                    if (rightNumeric) {
                        return 1;
                    }
                    return String.valueOf(left).compareToIgnoreCase(String.valueOf(right));
                })
                .toList();
    }

    private Object normalizeFilterValue(String attributeName, String rawValue) {
        if (rawValue == null) {
            return null;
        }

        String trimmed = rawValue.trim();
        if (trimmed.isBlank()) {
            return null;
        }

        if (!shouldNormalizeAsNumeric(attributeName, trimmed)) {
            return trimmed;
        }

        Matcher matcher = NUMERIC_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            String numericToken = matcher.group().replace(",", ".");
            BigDecimal numericValue = new BigDecimal(numericToken).stripTrailingZeros();
            if (numericValue.scale() <= 0) {
                return numericValue.longValueExact();
            }
            return numericValue.setScale(Math.max(numericValue.scale(), 1), RoundingMode.UNNECESSARY);
        }

        return trimmed;
    }

    private boolean shouldNormalizeAsNumeric(String attributeName, String value) {
        String normalizedName = normalizeFilterName(attributeName);
        if ("5g_or_not".equals(normalizedName)) {
            return false;
        }

        return switch (normalizedName) {
            case "inches",
                 "cpu_frequency_ghz",
                 "ram",
                 "ram_gb",
                 "memory",
                 "weight",
                 "weight_kg",
                 "battery_capacity",
                 "ram_capacity",
                 "internal_memory",
                 "screen_size",
                 "refresh_rate",
                 "num_rear_cameras" -> true;
            default -> value.matches("[-+]?\\d+(?:[.,]\\d+)?(?:\\s*[a-zA-Z%]+.*)?");
        };
    }

    private String normalizeFilterName(String attributeName) {
        if (attributeName == null) {
            return "";
        }

        String withoutUnits = attributeName.replaceAll("\\([^)]*\\)", " ");
        return withoutUnits.trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "");
    }

    private String normalizeFilterSelection(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
