package com.nergal.docseq.helpers;

import java.time.LocalDateTime;
import java.time.Month;

public class DateRange {

    public DateRange(Integer year) {
        LocalDateTime now = LocalDateTime.now();

        if (year == null) {
            year = now.getYear();
        }

        this.initialDateTime = LocalDateTime.of(year, Month.JANUARY, 1, 0, 0, 0);

        this.endDateTime = LocalDateTime.of(year, Month.DECEMBER, 31, 23, 59, 59);
    }
    
    LocalDateTime initialDateTime;
    LocalDateTime endDateTime;

    public LocalDateTime getInitialDateTime() {
        return initialDateTime;
    }
    
    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }
}
