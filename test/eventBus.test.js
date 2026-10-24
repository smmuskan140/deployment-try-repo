import test from "node:test";
import assert from "node:assert/strict";
import { publish, subscribe } from "../src/eventBus.js";
import { withTimeout } from "../src/withTimeout.js";

test("publishes events to subscribed handlers", async () => {
  const eventType = "TestPublished";
  let received = false;
  const unsubscribe = subscribe(eventType, async (event) => {
    received = event.id === "123";
  });

  try {
    const outcomes = await publish({ type: eventType, id: "123" });
    assert.equal(received, true);
    assert.equal(outcomes[0].status, "fulfilled");
  } finally {
    unsubscribe();
  }
});

test("isolates a failing listener from other listeners", async () => {
  const eventType = "TestIsolation";
  let secondListenerRan = false;
  const off1 = subscribe(eventType, async () => { throw new Error("listener failed"); });
  const off2 = subscribe(eventType, async () => { secondListenerRan = true; });

  try {
    const outcomes = await publish({ type: eventType });
    assert.equal(secondListenerRan, true);
    assert.deepEqual(outcomes.map((outcome) => outcome.status), ["rejected", "fulfilled"]);
  } finally {
    off1();
    off2();
  }
});

test("rejects a call that exceeds its timeout", async () => {
  await assert.rejects(
    withTimeout(() => new Promise((resolve) => setTimeout(resolve, 100)), 5, "test"),
    /test timed out/
  );
});
