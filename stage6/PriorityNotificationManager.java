package stage6;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class PriorityNotificationManager {

    private static final String AUTH_URL = "http://4.224.186.213/evaluation-service/auth";
    private static final String NOTIFICATIONS_URL = "http://4.224.186.213/evaluation-service/notifications";

    // Base priority hierarchy: Placement (3) > Result (2) > Event (1) > Default (0)
    private static int getCategoryPriority(String category) {
        if (category == null) return 0;
        switch (category.trim().toLowerCase()) {
            case "placement": return 3;
            case "result": return 2;
            case "event": return 1;
            default: return 0;
        }
    }

    // Min-Heap Comparator: Weakest element is placed at the head (root) for easy eviction.
    // Order: lower priority first; if priorities match, older timestamp first.
    private static final Comparator<Notification> MIN_HEAP_COMPARATOR = (a, b) -> {
        int priorityA = getCategoryPriority(a.getCategory());
        int priorityB = getCategoryPriority(b.getCategory());

        if (priorityA != priorityB) {
            return Integer.compare(priorityA, priorityB);
        }
        return a.getCreatedAt().compareTo(b.getCreatedAt());
    };

    /**
     * Authenticate with evaluation service and obtain JWT access token
     */
    private static String obtainAuthToken() throws Exception {
        String email = System.getenv("EMAIL") != null ? System.getenv("EMAIL") : "bpragati21@gmail.com";
        String name = System.getenv("NAME") != null ? System.getenv("NAME") : "Pragati Bansal";
        String rollNo = System.getenv("ROLL_NO") != null ? System.getenv("ROLL_NO") : "2315001681";
        String accessCode = System.getenv("ACCESS_CODE") != null ? System.getenv("ACCESS_CODE") : "access123";
        String clientID = System.getenv("CLIENT_ID") != null ? System.getenv("CLIENT_ID") : "client-id";
        String clientSecret = System.getenv("CLIENT_SECRET") != null ? System.getenv("CLIENT_SECRET") : "client-secret";

        URL url = new URL(AUTH_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);

        String jsonPayload = String.format(
            "{\"email\":\"%s\",\"name\":\"%s\",\"rollNo\":\"%s\",\"accessCode\":\"%s\",\"clientID\":\"%s\",\"clientSecret\":\"%s\"}",
            email, name, rollNo, accessCode, clientID, clientSecret
        );

        try (OutputStream os = conn.getOutputStream()) {
            byte[] input = jsonPayload.getBytes("utf-8");
            os.write(input, 0, input.length);
        }

        int code = conn.getResponseCode();
        if (code != 200) {
            throw new RuntimeException("Auth POST failed with code: " + code);
        }

        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
            String line;
            while ((line = br.readLine()) != null) {
                response.append(line.trim());
            }
        }

        // Extract token using basic regex matcher
        Pattern pattern = Pattern.compile("\"(?:token|accessToken)\"\\s*:\\s*\"([^\"]+)\"");
        Matcher matcher = pattern.matcher(response.toString());
        if (matcher.find()) {
            return matcher.group(1);
        }
        
        // Secondary extraction fallback
        if (response.toString().startsWith("\"") && response.toString().endsWith("\"")) {
            return response.toString().substring(1, response.length() - 1);
        }
        
        return response.toString();
    }

    /**
     * Fetch raw notifications list from the remote server
     */
    private static List<Notification> fetchNotifications(String token) throws Exception {
        URL url = new URL(NOTIFICATIONS_URL);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setRequestProperty("Authorization", "Bearer " + token);
        conn.setRequestProperty("Accept", "application/json");
        conn.setConnectTimeout(5000);
        conn.setReadTimeout(5000);

        int code = conn.getResponseCode();
        if (code != 200) {
            throw new RuntimeException("Notifications GET failed with code: " + code);
        }

        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
            String line;
            while ((line = br.readLine()) != null) {
                response.append(line.trim());
            }
        }

        return parseNotificationsJson(response.toString());
    }

    /**
     * Lightweight custom JSON parser to map JSON string to Notification List
     */
    private static List<Notification> parseNotificationsJson(String json) {
        List<Notification> list = new ArrayList<>();
        if (json == null || !json.contains("[")) return list;

        // Strip outer array brackets
        String content = json.trim();
        if (content.startsWith("[")) content = content.substring(1);
        if (content.endsWith("]")) content = content.substring(0, content.length() - 1);

        // Split by JSON object curly braces
        // Note: Simple JSON object split regex (handles basic flat JSON objects)
        String[] objects = content.split("\\},\\s*\\{");
        for (String obj : objects) {
            // Re-normalize curly braces
            if (!obj.startsWith("{")) obj = "{" + obj;
            if (!obj.endsWith("}")) obj = obj + "}";

            String id = extractJsonField(obj, "id");
            String title = extractJsonField(obj, "title");
            String body = extractJsonField(obj, "body");
            String category = extractJsonField(obj, "category");
            String isReadStr = extractJsonField(obj, "isRead");
            String createdAt = extractJsonField(obj, "createdAt");

            boolean isRead = "true".equalsIgnoreCase(isReadStr);

            Notification notif = new Notification(id, title, body, category, isRead, createdAt);
            list.add(notif);
        }
        return list;
    }

    private static String extractJsonField(String json, String fieldName) {
        Pattern pattern = Pattern.compile("\"" + fieldName + "\"\\s*:\\s*(?:\"([^\"]*)\"|([^,}\\s]+))");
        Matcher matcher = pattern.matcher(json);
        if (matcher.find()) {
            if (matcher.group(1) != null) {
                return matcher.group(1);
            }
            return matcher.group(2);
        }
        return "";
    }

    /**
     * Processes a stream/list of notifications, retaining top 10 unread notifications in a Min-Heap
     */
    public static List<Notification> getTopTenUnread(List<Notification> allNotifications) {
        // Priority Queue behaving as a Min-Heap of size 10
        PriorityQueue<Notification> minHeap = new PriorityQueue<>(10, MIN_HEAP_COMPARATOR);

        for (Notification n : allNotifications) {
            // Process unread notifications only
            if (n.isRead()) {
                continue;
            }

            if (minHeap.size() < 10) {
                minHeap.add(n);
            } else {
                // If the incoming notification is stronger than the weakest in our heap, evict root and insert new
                Notification weakest = minHeap.peek();
                if (MIN_HEAP_COMPARATOR.compare(n, weakest) > 0) {
                    minHeap.poll(); // Evict weakest
                    minHeap.add(n);  // Add stronger
                }
            }
        }

        // Extract elements from min-heap. Result is sorted weakest to strongest.
        List<Notification> sortedResult = new ArrayList<>();
        while (!minHeap.isEmpty()) {
            sortedResult.add(minHeap.poll());
        }

        // Reverse to display strongest notifications first (Placement > Result > Event, newest first)
        Collections.reverse(sortedResult);
        return sortedResult;
    }

    public static void main(String[] args) {
        System.out.println("=== Starting Priority Notification Manager ===");
        try {
            // Obtain token and fetch notifications
            String token = obtainAuthToken();
            System.out.println("Token acquired successfully.");
            
            List<Notification> rawList = fetchNotifications(token);
            System.out.println("Successfully fetched " + rawList.size() + " total notifications.");

            // Processing stream
            long startTime = System.nanoTime();
            List<Notification> topTen = getTopTenUnread(rawList);
            long endTime = System.nanoTime();

            System.out.println("\n=== TOP 10 UNREAD NOTIFICATIONS (Ranked) ===");
            for (int i = 0; i < topTen.size(); i++) {
                System.out.printf("%2d. %s\n", (i + 1), topTen.get(i));
            }

            // Print Time Complexity Explanation
            System.out.println("\n=== Computational Complexity & Performance Report ===");
            System.out.println("1. Time Complexity for Ranking: O(N log K) where N = number of unread notifications, K = size of heap (10).");
            System.out.println("   - Inserting and evicting from a binary heap of size 10 takes O(log 10) = O(1) constant time.");
            System.out.println("   - Processing N notifications sequentially takes O(N) operations.");
            System.out.println("   - Total execution time of ranking algorithm: " + (endTime - startTime) / 1000 + " microseconds.");
            System.out.println("2. Space Complexity: O(K) where K = 10.");
            System.out.println("   - The Priority Queue consumes space relative only to the cap (10 items), preserving memory even for millions of streams.");
            System.out.println("3. Continuous Streams Handling: In a stream-based context, new events are processed in real-time in O(log K) time per event, ensuring instant reactivity.");

        } catch (Exception e) {
            System.err.println("Execution Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
