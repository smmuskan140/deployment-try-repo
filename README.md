# Event-Driven Architecture Demo

This small Node.js example demonstrates decoupled event publishing, independent listeners, and resilient external-service calls.

## What it demonstrates

- A publisher emits past-tense domain events (for example, `NoticeCreated`) without importing listener implementations.
- Audit, notice, and search handlers subscribe independently.
- A slow search service is bounded by a timeout. The example does not blindly retry every failure.
- A listener failure is isolated so it does not stop other listeners from receiving the event.

## Run

Requires Node.js 18 or newer.

```bash
npm start
```

No external services or packages are required.
