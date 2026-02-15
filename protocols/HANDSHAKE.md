# Handshake Protocol

The Handshake Protocol establishes secure, reliable communication channels between agents.

## Purpose

1. **Verify Identity** - Confirm agent identity and authenticity
2. **Negotiate Capabilities** - Agree on communication capabilities
3. **Establish Session** - Create a session for ongoing communication
4. **Security** - Optionally exchange encryption keys

## Handshake Flow

```
┌─────────────┐                      ┌─────────────┐
│   Agent A   │                      │   Agent B   │
│ (Initiator) │                      │ (Responder) │
└──────┬──────┘                      └──────┬──────┘
       │                                    │
       │────[HANDSHAKE INITIATE]───────────>│
       │     (agent info, capabilities)     |
       │                                    │
       │<---[HANDSHAKE ACKNOWLEDGE]─────────│
       │     (agent info, capabilities)     │
       │     (session ID)                    |
       │                                    │
       │────[HANDSHAKE CONFIRM]─────────────>│
       │     (session ID, confirmed)         |
       │                                    │
       │<---[HANDSHAKE COMPLETE]─────────────│
       │     (ready for communication)      │
       │                                    │
       │==========SESSION ESTABLISHED======│
       │                                    │
```

## Message Types

### INITIATE

Sent by the initiating agent to start handshake.

```json
{
  "id": "hs-init-123",
  "type": "handshake",
  "action": "initiate",
  "sender": "Agent-Claudius",
  "timestamp": "2026-02-15T12:00:00.000Z",
  "payload": {
    "sessionId": null,
    "protocolVersion": "1.0.0",
    "agent": {
      "id": "agent-claudius",
      "name": "Claudius",
      "version": "1.0.0"
    },
    "capabilities": {
      "transport": ["http", "websocket"],
      "encoding": ["json", "msgpack"],
      "compression": ["gzip", "none"],
      "auth": ["none", "token"]
    },
    "timestamp": "2026-02-15T12:00:00.000Z"
  }
}
```

### ACKNOWLEDGE

Response from the receiving agent.

```json
{
  "id": "hs-ack-456",
  "type": "handshake",
  "action": "acknowledge",
  "sender": "Agent-Vesper",
  "timestamp": "2026-02-15T12:00:01.000Z",
  "payload": {
    "sessionId": "session-abc123",
    "protocolVersion": "1.0.0",
    "agent": {
      "id": "agent-vesper",
      "name": "Vesperwatcher",
      "version": "1.0.0"
    },
    "capabilities": {
      "transport": ["http", "websocket"],
      "encoding": ["json"],
      "compression": ["none"]
    },
    "timestamp": "2026-02-15T12:00:01.000Z"
  }
}
```

### CONFIRM

Final confirmation from initiator.

```json
{
  "id": "hs-conf-789",
  "type": "handshake",
  "action": "confirm",
  "sender": "Agent-Claudius",
  "timestamp": "2026-02-15T12:00:02.000Z",
  "payload": {
    "sessionId": "session-abc123",
    "selectedCapabilities": {
      "transport": "http",
      "encoding": "json",
      "compression": "none",
      "auth": "none"
    },
    "timestamp": "2026-02-15T12:00:02.000Z"
  }
}
```

### COMPLETE

Final acknowledgment from receiver.

```json
{
  "id": "hs-done-012",
  "type": "handshake",
  "action": "complete",
  "sender": "Agent-Vesper",
  "timestamp": "2026-02-15T12:00:03.000Z",
  "payload": {
    "sessionId": "session-abc123",
    "status": "established",
    "timestamp": "2026-02-15T12:00:03.000Z"
  }
}
```

## Session Management

### Session States

| State        | Description                  |
| ------------ | ---------------------------- |
| INITIATED    | Handshake has been started   |
| ACKNOWLEDGED | Remote agent has responded   |
| CONFIRMED    | Capabilities negotiated      |
| ESTABLISHED  | Session is ready for use     |
| EXPIRED      | Session has timed out        |
| TERMINATED   | Session was explicitly ended |

### Session Object

```javascript
{
  sessionId: "session-abc123",
  initiator: "Agent-Claudius",
  responder: "Agent-Vesper",
  established: "2026-02-15T12:00:03.000Z",
  expiresAt: "2026-02-15T13:00:03.000Z",
  capabilities: {
    transport: "http",
    encoding: "json",
    compression: "none",
    auth: "none"
  },
  metadata: {}
}
```

## Implementation Example

```javascript
import { createFormatter, MESSAGE_TYPES } from "@tonnos/agent-tools/formatter";

class HandshakeProtocol {
  constructor(agent) {
    this.agent = agent;
    this.sessions = new Map();
  }

  createInitiateMessage() {
    const formatter = createFormatter({ agentName: this.agent.name });
    return formatter.formatHandshake({
      name: this.agent.name,
      version: this.agent.version,
      capabilities: this.agent.capabilities,
    });
  }

  async performHandshake(remoteAgent) {
    const initiate = this.createInitiateMessage();
    // Send to remote agent and handle response...
  }
}
```
