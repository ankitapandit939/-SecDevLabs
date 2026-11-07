package com.secdevlab.backend.controller;

import com.secdevlab.backend.model.Guestbook;
import com.secdevlab.backend.repository.GuestbookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.HtmlUtils;

import java.util.List;

@RestController
@RequestMapping("/api/guestbook")
@CrossOrigin(origins = "*")
public class GuestbookController {

    @Autowired
    private GuestbookRepository guestbookRepository;

    // VULNERABLE - Raw HTML/JS saved directly to DB (Stored XSS)
    @PostMapping("/vulnerable/post")
    public ResponseEntity<Guestbook> vulnerablePost(@RequestBody Guestbook post) {
        Guestbook saved = guestbookRepository.save(post);
        return ResponseEntity.ok(saved);
    }

    // SECURE - Encodes HTML special characters (<, >, &, ", ') using Spring HtmlUtils
    @PostMapping("/secure/post")
    public ResponseEntity<Guestbook> securePost(@RequestBody Guestbook post) {
        if (post.getContent() != null) {
            post.setContent(HtmlUtils.htmlEscape(post.getContent()));
        }
        if (post.getAuthor() != null) {
            post.setAuthor(HtmlUtils.htmlEscape(post.getAuthor()));
        }
        Guestbook saved = guestbookRepository.save(post);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/posts")
    public ResponseEntity<List<Guestbook>> getAllPosts() {
        return ResponseEntity.ok(guestbookRepository.findAll());
    }
}