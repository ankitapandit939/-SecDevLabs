package com.secdevlab.backend.controller;

import com.secdevlab.backend.model.User;
import com.secdevlab.backend.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    // VULNERABLE - String concatenation enables SQL Injection
    // Payload: ' OR '1'='1' --
    @GetMapping("/vulnerable/search")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> vulnerableSearch(@RequestParam String username) {
        String sql = "SELECT * FROM app_users WHERE username = '" + username + "'";
        List<User> results = entityManager.createNativeQuery(sql, User.class).getResultList();
        return ResponseEntity.ok(results);
    }

    // SECURE - Spring Data JPA generates parameterized queries automatically
    @GetMapping("/secure/search")
    public ResponseEntity<List<User>> secureSearch(@RequestParam String username) {
        List<User> results = userRepository.findByUsername(username);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/add")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        return ResponseEntity.ok(userRepository.save(user));
    }
}