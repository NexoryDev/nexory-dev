package de.nexorydev.controller;

import de.nexorydev.model.ContactRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    @PostMapping
    public ResponseEntity<Map<String, String>> sendMessage(@RequestBody ContactRequest request) {

        if (isBlank(request.getName()) || isBlank(request.getEmail()) || isBlank(request.getMessage())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "All fields are required."));
        }

        if (!request.getEmail().contains("@") || !request.getEmail().contains(".")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid email address."));
        }

        log.info("Contact form submission received from: {}", request.getName());

        return ResponseEntity.ok(Map.of("message", "Your message has been received. Thank you!"));
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
