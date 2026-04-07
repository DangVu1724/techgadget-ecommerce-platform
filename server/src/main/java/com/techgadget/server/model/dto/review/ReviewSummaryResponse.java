package com.techgadget.server.model.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSummaryResponse {
    private double averageRating;
    private long totalReviews;
    private long count1;
    private long count2;
    private long count3;
    private long count4;
    private long count5;
}
