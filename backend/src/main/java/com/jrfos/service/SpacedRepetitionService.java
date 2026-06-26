package com.jrfos.service;

import com.jrfos.entity.Flashcard;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class SpacedRepetitionService {

    /**
     * Calculates the next review date based on the SuperMemo-2 (SM-2) algorithm.
     * 
     * Quality:
     * 5 - perfect response
     * 4 - correct response after a hesitation
     * 3 - correct response recalled with serious difficulty
     * 2 - incorrect response; where the correct one seemed easy to recall
     * 1 - incorrect response; the correct one remembered
     * 0 - complete blackout.
     */
    public void calculateNextReview(Flashcard flashcard, int quality) {
        if (quality < 0 || quality > 5) {
            throw new IllegalArgumentException("Quality must be between 0 and 5");
        }

        int repetitions = flashcard.getRepetitionCount();
        double easeFactor = flashcard.getEaseFactor();
        int interval = flashcard.getIntervalDays();

        if (quality >= 3) {
            // Correct response
            if (repetitions == 0) {
                interval = 1;
            } else if (repetitions == 1) {
                interval = 6;
            } else {
                interval = (int) Math.round(interval * easeFactor);
            }
            repetitions++;
        } else {
            // Incorrect response
            repetitions = 0;
            interval = 1;
        }

        // Calculate new ease factor
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (easeFactor < 1.3) {
            easeFactor = 1.3;
        }

        flashcard.setRepetitionCount(repetitions);
        flashcard.setEaseFactor(easeFactor);
        flashcard.setIntervalDays(interval);
        flashcard.setLastReviewedAt(LocalDateTime.now());
        
        // Ensure interval is at least 0 (if due today)
        int daysToAdd = Math.max(0, interval);
        flashcard.setNextReviewDate(LocalDateTime.now().plusDays(daysToAdd));
    }
}
