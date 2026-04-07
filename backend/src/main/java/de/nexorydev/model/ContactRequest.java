package de.nexorydev.model;

/**
 * ContactRequest ist ein DTO (Data Transfer Object).
 *
 * Ein DTO trägt nur Daten — keine Logik.
 * Spring Boot deserialisiert den JSON-Request-Body automatisch in dieses Objekt,
 * weil Jackson (die JSON-Bibliothek) nach Gettern/Settern sucht.
 *
 * Entspricht den $_POST['name'], $_POST['email'], $_POST['message'] Variablen in PHP.
 */
public class ContactRequest {

    private String name;
    private String email;
    private String message;

    // Standardkonstruktor — von Jackson benötigt, um das Objekt zu erstellen
    public ContactRequest() {}

    public ContactRequest(String name, String email, String message) {
        this.name    = name;
        this.email   = email;
        this.message = message;
    }

    // Getter (Lesezugriff) — Jackson nutzt diese zum Serialisieren
    public String getName()    { return name; }
    public String getEmail()   { return email; }
    public String getMessage() { return message; }

    // Setter (Schreibzugriff) — Jackson nutzt diese zum Deserialisieren
    public void setName(String name)       { this.name = name; }
    public void setEmail(String email)     { this.email = email; }
    public void setMessage(String message) { this.message = message; }
}
