package com.techgadget.server.service.support;

import com.techgadget.server.exception.BadRequestException;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.Locale;

@Component
public class ShippingCalculator {

    private static final BigDecimal HANOI_INNER_FEE = BigDecimal.valueOf(20_000);
    private static final BigDecimal HANOI_OUTER_FEE = BigDecimal.valueOf(35_000);
    private static final BigDecimal OTHER_PROVINCE_FEE = BigDecimal.valueOf(50_000);

    public BigDecimal calculate(String shippingCity, String shippingWard) {
        if (isBlank(shippingCity) || isBlank(shippingWard)) {
            throw new BadRequestException("Shipping city and ward are required.");
        }

        String normalizedCity = normalizeCity(shippingCity);
        String normalizedWard = normalizeRaw(shippingWard);

        if (!"ha noi".equals(normalizedCity)) {
            return OTHER_PROVINCE_FEE;
        }

        if (normalizedWard.startsWith("phuong ")) {
            return HANOI_INNER_FEE;
        }

        if (normalizedWard.startsWith("xa ") || normalizedWard.startsWith("thi tran ")) {
            return HANOI_OUTER_FEE;
        }

        return HANOI_OUTER_FEE;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String normalizeCity(String value) {
        return normalizeRaw(value)
                .replaceFirst("^thanh pho\\s+", "")
                .replaceFirst("^tp\\s*", "")
                .trim();
    }

    private String normalizeRaw(String value) {
        return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replace('Đ', 'D')
                .replaceAll("\\s+", " ")
                .trim()
                .toLowerCase(Locale.ROOT);
    }
}
