package com.secdevlab.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "guestbook_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Guestbook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String author;

    @Column(columnDefinition = "TEXT")
    private String content;
}