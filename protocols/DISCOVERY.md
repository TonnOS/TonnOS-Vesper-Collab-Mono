# Discovery Protocol

The Discovery Protocol enables agents to find and identify other agents in the collaboration network.

## Overview

Agents can discover each other through:

1. **Broadcast Discovery** - Announcing presence to a multicast group
2. **Registry Discovery** - Querying a central registry service
3. **Static Configuration** - Pre-configured list of known agents

## Discovery Flow

```
┌─────────────┐         ┌─────────────┐
│   Agent A   │         │   Agent B   │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │───[Discovery]────────>│
       │    ANNOUNCE           │
       │                       │
       │<───[Discovery]────────│
       │    RESPONSE          │
       │                       │
       │<───[Handshake]────────│
       │    INITIATE           │
       │                       │
       │───[Handshake]────────>│
       │    CONFIRM            │
       │                       │
```

## Discovery Message Types

### ANNOUNCE

Broadcast by an agent to announce presence.

```json
{
  "type": "discovery",
  "action": "announce",
  "payload": {
    "agentId": "agent-claudius",
    "agentName": "Claudius",
    "version": "1.0.0",
    "capabilities": ["code-generation", "code-review"],
    "endpoints": {
      "http": "http://localhost:3001",
      "ws": "ws://localhost:3002"
    },
    "metadata": {
      "author": "@tonnos",
      "description": "Primary assistant agent"
    }
  }
}
```

### QUERY

Request for agents matching criteria.

```json
{
  "type": "discovery",
  "action": "query",
  "payload": {
    "capabilities": ["code-generation"],
    "status": "online"
  }
}
```

### RESPONSE

Response to a discovery query.

```json
{
  "type": "discovery",
  "action": "response",
  "payload": {
    "agents": [
      {
        "agentId": "agent-vesper",
        "agentName": "Vesperwatcher",
        "version": "1.0.0",
        "capabilities": ["data-analysis", "visualization"],
        "status": "online"
      }
    ]
  }
}
```

## Registry-Based Discovery

For centralized discovery, agents register with a registry service.

### Registration

```javascript
{
  "type": "registry",
  "action": "register",
  "payload": {
    "agentId": "agent-claudius",
    "agentName": "Claudius",
    "endpoints": {
      "http": "http://localhost:3001"
    },
    "capabilities": ["code-generation", "code-review"],
    "ttl": 60
  }
}
```

### Query Registry

```javascript
{
  "type": "registry",
  "action": "query",
  "payload": {
    "capabilities": ["visualization"],
    "limit": 10
  }
}
```

## Implementation Example

```javascript
import { createFormatter, MESSAGE_TYPES } from "@tonnos/agent-tools/formatter";

class DiscoveryProtocol {
  constructor(agent, options = {}) {
    this.agent = agent;
    this.discoveryInterval = options.discoveryInterval || 30000;
    this.registryUrl = options.registryUrl || null;
    this.knownAgents = new Map();
  }

  createAnnounceMessage() {
    const formatter = createFormatter({ agentName: this.agent.name });
    return formatter.formatDiscovery(this.agent.capabilities);
  }

  parseDiscoveryMessage(message) {
    return message.payload;
  }
}
```
