# Message Formats & Schemas

## Base Message Schema

Every message follows this base structure:

```json
{
  "id": "string (required)",
  "type": "string (required)",
  "sender": "string (required)",
  "timestamp": "ISO 8601 string (required)",
  "payload": "object (required)",
  "priority": "number (optional)",
  "replyTo": "string (optional)",
  "correlationId": "string (optional)"
}
```

## Message Types

### 1. Discovery Message

Used by agents to announce their presence and capabilities.

```json
{
  "id": "disc-123-abc",
  "type": "discovery",
  "sender": "Agent-Claudius",
  "timestamp": "2026-02-15T12:00:00.000Z",
  "payload": {
    "version": "1.0.0",
    "capabilities": ["code-generation", "code-review", "file-operations"],
    "status": "online"
  }
}
```

**Payload Fields:**

- `version` (string): Protocol version supported
- `capabilities` (array): List of capabilities this agent provides
- `status` (string): Current status (online, busy, offline)

### 2. Handshake Message

Used to establish a formal connection between agents.

```json
{
  "id": "hs-456-def",
  "type": "handshake",
  "sender": "Agent-Vesper",
  "timestamp": "2026-02-15T12:00:01.000Z",
  "payload": {
    "agent": "Agent-Vesper",
    "version": "1.0.0",
    "capabilities": ["data-analysis", "visualization"],
    "protocol": "v1"
  }
}
```

**Payload Fields:**

- `agent` (string): Agent name
- `version` (string): Agent version
- `capabilities` (array): Capabilities for task routing
- `protocol` (string): Protocol version

### 3. Task Request

Used to request another agent to perform a task.

```json
{
  "id": "task-789-ghi",
  "type": "task_request",
  "sender": "Agent-Claudius",
  "timestamp": "2026-02-15T12:00:02.000Z",
  "payload": {
    "task": {
      "id": "task-001",
      "type": "code-generation",
      "description": "Generate a REST API endpoint",
      "input": {
        "language": "javascript",
        "framework": "express",
        "endpoint": "/api/users"
      },
      "constraints": {
        "timeout": 30000,
        "maxTokens": 2000
      }
    }
  },
  "priority": 3
}
```

**Payload Fields:**

- `task.id` (string): Unique task identifier
- `task.type` (string): Type of task
- `task.description` (string): Human-readable description
- `task.input` (object): Input data for the task
- `task.constraints` (object): Constraints like timeout, max tokens

### 4. Task Response

Response containing task results or status.

```json
{
  "id": "task-res-012-jkl",
  "type": "task_response",
  "sender": "Agent-Vesper",
  "timestamp": "2026-02-15T12:00:05.000Z",
  "payload": {
    "taskId": "task-001",
    "result": {
      "code": "app.get('/api/users', (req, res) => {...})",
      "language": "javascript"
    },
    "status": "completed"
  },
  "correlationId": "task-789-ghi"
}
```

**Payload Fields:**

- `taskId` (string): ID of the task this is responding to
- `result` (object): Task result data
- `status` (string): Status (completed, failed, partial)

### 5. Heartbeat

Periodic health check message.

```json
{
  "id": "hb-345-mno",
  "type": "heartbeat",
  "sender": "Agent-Claudius",
  "timestamp": "2026-02-15T12:01:00.000Z",
  "payload": {
    "status": {
      "cpu": 0.45,
      "memory": 0.62,
      "tasksRunning": 2
    },
    "uptime": 3600.5
  }
}
```

### 6. Error

Error message for failures.

```json
{
  "id": "err-678-pqr",
  "type": "error",
  "sender": "Agent-Vesper",
  "timestamp": "2026-02-15T12:00:06.000Z",
  "payload": {
    "error": {
      "name": "TaskTimeoutError",
      "message": "Task exceeded maximum execution time",
      "stack": "..."
    },
    "context": {
      "taskId": "task-001",
      "attemptNumber": 3
    }
  }
}
```

## Priority Levels

| Level | Name   | Use Case                                     |
| ----- | ------ | -------------------------------------------- |
| 1     | LOW    | Background tasks, low priority               |
| 2     | NORMAL | Standard tasks                               |
| 3     | HIGH   | Important tasks                              |
| 4     | URGENT | Critical tasks requiring immediate attention |

## Implementation

Use `@tonnos/agent-tools` formatter for creating and parsing messages:

```javascript
import { createFormatter, MESSAGE_TYPES } from "@tonnos/agent-tools/formatter";

const formatter = createFormatter({ agentName: "MyAgent" });

// Create a task request
const message = formatter.formatTaskRequest({
  type: "code-generation",
  description: "Generate API endpoint",
  input: { language: "javascript" },
});
```
