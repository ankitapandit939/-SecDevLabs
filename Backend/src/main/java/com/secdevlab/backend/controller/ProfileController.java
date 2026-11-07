package com.secdevlab.backend.controller;

import com.secdevlab.backend.model.Profile;
import com.secdevlab.backend.repository.ProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private ProfileRepository profileRepository;

    // VULNERABLE - IDOR (Insecure Direct Object Reference)
    // Any user can access any profile ID directly without ownership validation
    @GetMapping("/vulnerable/{id}")
    public ResponseEntity<?> vulnerableGetProfile(@PathVariable Long id) {
        Optional<Profile> profile = profileRepository.findById(id);
        if (profile.isPresent()) {
            return ResponseEntity.ok(profile.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
    }

    // SECURE - Validates that the profile's userId matches the authenticated user's ID
    @GetMapping("/secure/{id}")
    public ResponseEntity<?> secureGetProfile(@PathVariable Long id, @RequestParam Long currentUserId) {
        Optional<Profile> profile = profileRepository.findById(id);

        if (profile.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Profile not found");
        }

        Profile userProfile = profile.get();
        if (userProfile.getUserId() == null || !userProfile.getUserId().equals(currentUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: You do not have permission to view this profile");
        }

        return ResponseEntity.ok(userProfile);
    }
}