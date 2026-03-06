import http from "http";
import { config } from "./config/env.js";
import { connectDB } from "./db/mongo.js";
import { app } from "./app.js"

// create HTTP server using Expres app
const server = http.createServer(app);
const port = config.port || 4000;


// start function
async function start() {
    try {
        // connect to MongoDB
        await connectDB();

        server.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
            });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
}

// graceful shutdown (Ctrl+C, kills signals)
function shutdown() {
    console.log("\n 🔻Shutting down...");
    server.close(() => {
        console.log("🔴 Server closed.");
        process.exit(0);
    });
}

process.on('SIGINT', shutdown);  // SIGINT -> signal interrupt / keyboard interrupt (Ctrl+c)
process.on("SIGTERM", shutdown);

start();