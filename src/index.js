import { publish, subscribe } from "./eventBus.js";
import { withTimeout } from "./withTimeout.js";

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
        // Simulates an external search indexing request. Real clients should
        // pass signal to fetch() so the request can be aborted on timeout.
        await sleep(100);
        if (signal.aborted) throw new Error("Search indexing aborted");
        console.log("[search] indexed notice:", event.id);
      },
      500,
      "search indexing"
    );
  } catch (error) {
    console.error("[search] indexing failed:", error.message);
    // In production, persist the failed event for a dead-letter/replay workflow.
    // Do not retry indefinitely; use bounded retries with exponential backoff+jitter.
  }
});

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
