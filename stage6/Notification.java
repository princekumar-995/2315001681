package stage6;

import java.time.Instant;

public class Notification {
    private String id;
    private String title;
    private String body;
    private String category;
    private boolean isRead;
    private Instant createdAt;

    // Constructors
    public Notification() {}

    public Notification(String id, String title, String body, String category, boolean isRead, String createdAtStr) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.category = category;
        this.isRead = isRead;
        try {
            this.createdAt = Instant.parse(createdAtStr);
        } catch (Exception e) {
            this.createdAt = Instant.now();
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    
    public void setCreatedAtStr(String createdAtStr) {
        try {
            this.createdAt = Instant.parse(createdAtStr);
        } catch (Exception e) {
            this.createdAt = Instant.now();
        }
    }

    @Override
    public String toString() {
        return String.format(
            "Notification[ID=%s, Category=%s, Title='%s', IsRead=%b, CreatedAt=%s]",
            id, category, title, isRead, createdAt
        );
    }
}
