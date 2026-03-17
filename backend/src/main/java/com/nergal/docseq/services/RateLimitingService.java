package com.nergal.docseq.services;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import io.github.bucket4j.Bucket;

@Service
public class RateLimitingService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String key, int capacity, int refillTokens, Duration refillDuration) {
        return buckets.computeIfAbsent(key, k -> Bucket.builder()
                .addLimit(limit -> limit.capacity(capacity).refillGreedy(refillTokens, refillDuration))
                .build());
    }

    public boolean tryConsume(String key, int capacity, int refillTokens, Duration refillDuration) {
        Bucket bucket = resolveBucket(key, capacity, refillTokens, refillDuration);
        return bucket.tryConsume(1);
    }
}
