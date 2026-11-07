

package com.secdevlab.backend.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/csrf")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class CsrfController {

    private static final String CSRF_SESSION_KEY = "CSRF_TOKEN";
    private static final String USER_EMAIL_SESSION_KEY = "USER_EMAIL";

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestParam(defaultValue = "user@example.com") String email,
                                                     HttpSession session) {
        session.setAttribute(USER_EMAIL_SESSION_KEY, email);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "LOGGED_IN");
        response.put("sessionId", session.getId());
        response.put("currentEmail", email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/token")
    public ResponseEntity<Map<String, String>> getCsrfToken(HttpSession session) {
        String csrfToken = UUID.randomUUID().toString();
        session.setAttribute(CSRF_SESSION_KEY, csrfToken);

        Map<String, String> response = new HashMap<>();
        response.put("csrfToken", csrfToken);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/current-user")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        response.put("email", session.getAttribute(USER_EMAIL_SESSION_KEY));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/vulnerable/change-email")
    public ResponseEntity<Map<String, Object>> vulnerableChangeEmail(@RequestParam String newEmail,
                                                                     HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        String currentEmail = (String) session.getAttribute(USER_EMAIL_SESSION_KEY);
        if (currentEmail == null) {
            response.put("status", "ERROR");
            response.put("message", "User not logged in. Please call /api/csrf/login first.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        session.setAttribute(USER_EMAIL_SESSION_KEY, newEmail);

        response.put("status", "SUCCESS");
        response.put("message", "Email updated successfully (CSRF Vulnerable Endpoint)!");
        response.put("oldEmail", currentEmail);
        response.put("newEmail", newEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/secure/change-email")
    public ResponseEntity<Map<String, Object>> secureChangeEmail(
            @RequestParam String newEmail,
            @RequestHeader(value = "X-CSRF-TOKEN", required = false) String headerToken,
            @RequestParam(value = "csrfToken", required = false) String paramToken,
            HttpSession session) {

        Map<String, Object> response = new HashMap<>();

        String currentEmail = (String) session.getAttribute(USER_EMAIL_SESSION_KEY);
        if (currentEmail == null) {
            response.put("status", "ERROR");
            response.put("message", "User not logged in. Please call /api/csrf/login first.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String sessionToken = (String) session.getAttribute(CSRF_SESSION_KEY);
        String suppliedToken = (headerToken != null && !headerToken.isBlank()) ? headerToken : paramToken;

        if (sessionToken == null || suppliedToken == null || !sessionToken.equals(suppliedToken)) {
            response.put("status", "FORBIDDEN");
            response.put("message", "CSRF Protection: Invalid or missing CSRF token.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        session.setAttribute(USER_EMAIL_SESSION_KEY, newEmail);
        session.removeAttribute(CSRF_SESSION_KEY);

        response.put("status", "SUCCESS");
        response.put("message", "Email updated securely with valid CSRF token verification.");
        response.put("oldEmail", currentEmail);
        response.put("newEmail", newEmail);
        return ResponseEntity.ok(response);
    }
}