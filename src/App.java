import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

public class App {

    public static void main(String[] args) throws IOException {
        int port = 8081;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", new StaticFileHandler());
        server.setExecutor(null);
        server.start();

        System.out.println("Server bezi!");
        System.out.println("Otevri v prohlizici: http://localhost:" + port);
    }

    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/")) {
                path = "/index.html";
            }

            File file = findFile(path);

            if (file == null || !file.exists()) {
                String errorMsg = "404 - Soubor " + path + " nebyl nalezen v projektu.";
                System.out.println("Chyba: " + errorMsg);
                exchange.sendResponseHeaders(404, errorMsg.getBytes().length);
                OutputStream os = exchange.getResponseBody();
                os.write(errorMsg.getBytes());
                os.close();
                return;
            }

            String contentType = "text/html; charset=UTF-8";
            if (path.endsWith(".css")) {
                contentType = "text/css";
            } else if (path.endsWith(".js")) {
                contentType = "application/javascript";
            }

            System.out.println("Nacetl se soubor: " + file.getAbsolutePath());
            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.sendResponseHeaders(200, file.length());

            OutputStream os = exchange.getResponseBody();
            FileInputStream fs = new FileInputStream(file);
            byte[] buffer = new byte[1024];
            int count;
            while ((count = fs.read(buffer)) >= 0) {
                os.write(buffer, 0, count);
            }
            fs.close();
            os.close();
        }

        private File findFile(String path) {
            String cleanPath = path.startsWith("/") ? path.substring(1) : path;
            
            String[] possibleLocations = {
                cleanPath,
                "src/" + cleanPath,
                "src/main/resources/" + cleanPath,
                "bin/" + cleanPath,
                "public/" + cleanPath
            };

            for (String loc : possibleLocations) {
                File f = new File(loc);
                if (f.exists() && !f.isDirectory()) {
                    return f;
                }
            }
            return null;
        }
    }
}