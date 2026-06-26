package com.jrfos.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequest {
    @NotNull
    @Min(0)
    @Max(5)
    private Integer quality; 
    // SM-2 Quality scale:
    // 5 - perfect response
    // 4 - correct response after a hesitation
    // 3 - correct response recalled with serious difficulty
    // 2 - incorrect response; where the correct one seemed easy to recall
    // 1 - incorrect response; the correct one remembered
    // 0 - complete blackout.
    
    // For UI mapping:
    // Again: 0
    // Hard: 3
    // Good: 4
    // Easy: 5
}
