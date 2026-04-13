package com.techgadget.server.model.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewPageResponse {
    private List<ReviewResponse> items;
    private int page;
    private int size;
    private long totalItems;
    private int totalPages;
    private ReviewSummaryResponse summary;
}
