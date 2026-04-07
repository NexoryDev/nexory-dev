package de.nexorydev.controller;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/language")
public class LanguageController {

    private static final List<String> SUPPORTED = List.of("de", "en");
    private static final String DEFAULT = "de";

    @GetMapping
    public Map<String, String> getLanguage(HttpSession session) {
        String lang = (String) session.getAttribute("language");
        if (lang == null || !SUPPORTED.contains(lang)) {
            lang = DEFAULT;
        }
        return Map.of("language", lang);
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> setLanguage(
            @RequestBody Map<String, String> body,
            HttpSession session
    ) {
        String lang = body.getOrDefault("language", "").toLowerCase().trim();

        if (!SUPPORTED.contains(lang)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Unsupported language: " + lang));
        }

        session.setAttribute("language", lang);
        return ResponseEntity.ok(Map.of("language", lang));
    }
}
