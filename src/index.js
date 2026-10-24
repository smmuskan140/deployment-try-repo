import http from "node:http";
import { publish, subscribe } from "./eventBus.js";
import { withTimeout } from "./withTimeout.js";

const PORT = Number(process.env.PORT) || 10000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

subscribe("NoticeCreated", async (event) => {
  console.log("[audit] recorded event:", event.id);
});

subscribe("NoticeCreated", async (event) => {
  console.log("[notice] delivered notice:", event.title);
});

subscribe("NoticeCreated", async (event) => {
  try {
    await withTimeout(
      async (signal) => {
        await sleep(100);
        if (signal.aborted) throw new Error("Search indexing aborted");
        console.log("[search] indexed notice:", event.id);
      },
      500,
      "search indexing"
    );
  } catch (error) {
    console.error("[search] indexing failed:", error.message);
    // Production systems should persist failures and use bounded retries.
  }
});

const server = http.createServer(async (req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", message: "Service is healthy" }));
    return;
  }

  if (req.url === "/" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      name: "Event-Driven Architecture Demo",
      status: "running",
      health: "/health"
    }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Your service is live 🎉");

  const event = {
    type: "NoticeCreated",
    id: "notice-001",
    occurredAt: new Date().toISOString(),
    title: "Campus maintenance update"
  };

  const outcomes = await publish(event);
  console.log("Listener outcomes:", outcomes.map(({ eventType, handlerIndex, status }) => ({
    eventType, handlerIndex, status
  })));
});
