package com.nergal.docseq.config;

import java.io.IOException;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.nergal.docseq.services.RateLimitingService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    @Autowired
    private RateLimitingService rateLimitingService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String ip = request.getRemoteAddr();

        // Rate limit for auth endpoints
        if (isAuthEndpoint(path)) {
            // 5 requests per minute for login/reset password
            if (!rateLimitingService.tryConsume("auth-" + ip, 5, 5, Duration.ofMinutes(1))) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many attempts. Please try again later.");
                return;
            }
        } else {
            // General rate limit for other endpoints
            // 100 requests per minute
            if (!rateLimitingService.tryConsume("gen-" + ip, 100, 100, Duration.ofMinutes(1))) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.getWriter().write("Too many requests. Please try again later.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAuthEndpoint(String path) {
        return path.contains("/login") || 
               path.contains("/forgot-password") || 
               path.contains("/reset-password");
    }
}
