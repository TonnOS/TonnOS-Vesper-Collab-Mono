# System Architecture

Overview of the TonnOS Agent Collaboration system.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    TonnOS-Vesper-Collab-Mono                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    tools/    │  │  protocols/  │  │    docs/     │      │
│  │  @tonnos/    │  │  Communication│  │  Guidelines  │      │
│  │ agent-tools  │  │    Standards  │  │  & Overview  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   projects/   │  │  examples/   │                        │
│  │ Collaborativ  │  │   Demo &     │                        │
│  │   Projects    │  │   Samples    │                        │
│  └──────────────┘  └──────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Components

### Tools (`/tools`)

Shared utilities for agent development:

- **Logger** - Structured logging with levels and formatting
- **Config Loader** - Configuration management with defaults
- **API Client** - HTTP client with retry logic
- **Message Formatter** - Create and parse standardized messages

### Protocols (`/protocols`)

Communication standards:

- **Message Formats** - JSON schemas for all message types
- **Discovery Protocol** - How agents find each other
- **Handshake Protocol** - How agents establish sessions

### Projects (`/projects`)

Collaborative project workspaces:

- **Example Project** - Demonstrates multi-agent workflows
- **Template** - Starting point for new projects

### Examples (`/examples`)

Working demonstrations:

- **demo-agent.js** - Basic agent implementation
- **cross-agent-workflow.js** - Multi-agent collaboration

## Data Flow

### Agent Discovery

```
Agent A                    Registry/Network
   |                             |
   |----[Discovery Announce]---->|
   |                             |
   |<---[Discovery Response]-----|
   |                             |
```

### Task Execution

```
Coordinator                  Worker Agent
     |                             |
     |----[Task Request]---------->|
     |                             |
     |                    [Process]|
     |                             |
     |<---[Task Response]----------|
     |                             |
```

### Multi-Agent Workflow

```
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Agent A  │───>│ Agent B  │───>│ Agent C  │
│(Planning)│    │ (Execute)│    │ (Review) │
└──────────┘    └──────────┘    └──────────┘
```

## Message Protocol

All communication uses JSON messages with this structure:

```json
{
  "id": "unique-message-id",
  "type": "message-type",
  "sender": "agent-name",
  "timestamp": "ISO-8601",
  "payload": { ... },
  "priority": 2
}
```

See `protocols/MESSAGE-FORMATS.md` for full schema.

## Configuration

### Root Workspace

```json
{
  "workspaces": ["tools/*", "projects/*", "examples/*"]
}
```

### Project Configuration

Each project has its own `package.json` and optional `agent.config.json`.

### Tool Configuration

Tools can be configured through options:

```javascript
const logger = createLogger({
  agentName: "MyAgent",
  level: "debug",
  format: "json",
});
```

## Extension Points

### Adding New Capabilities

1. Define the capability in your agent
2. Document in `protocols/CAPABILITIES.md`
3. Add example usage in `examples/`

### Custom Message Types

1. Add schema to `protocols/MESSAGE-FORMATS.md`
2. Add handler in agent implementation
3. Add tests

### New Project Types

1. Copy `projects/template/`
2. Customize for your use case
3. Add to workspace if needed

## Security Considerations

- No sensitive data in messages
- Use authentication for external APIs
- Validate all incoming messages
- Log for audit trail

## Performance

- Agents should handle concurrent tasks
- Use retry logic for network calls
- Implement timeouts on long-running tasks
- Monitor resource usage
