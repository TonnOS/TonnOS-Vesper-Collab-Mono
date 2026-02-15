# Project Template

Template for creating new collaborative agent projects.

## Quick Start

```bash
# Copy this template
cp -r projects/template projects/my-new-project

# Update package.json with your project name

# Install dependencies
npm install

# Start development
npm run dev
```

## Project Structure

```
projects/[project-name]/
├── src/
│   ├── index.js              # Entry point
│   ├── agents/                # Agent implementations
│   │   └── my-agent.js
│   ├── tasks/                 # Task definitions
│   │   └── handlers.js
│   ├── workflows/            # Workflow definitions
│   │   └── definitions.js
│   └── utils/                 # Project-specific utilities
│       └── helpers.js
├── tests/
│   └── my-agent.test.js
├── agent.config.json         # Agent configuration
└── README.md
```

## Configuration

Edit `agent.config.json` to configure your agent:

```json
{
  "agent": {
    "name": "MyAgent",
    "version": "1.0.0"
  },
  "capabilities": ["task-type-1", "task-type-2"],
  "logging": {
    "level": "info"
  }
}
```

## Adding Tasks

```javascript
import { WorkerAgent } from "@tonnos/agent-tools";

const agent = new WorkerAgent({
  name: "MyAgent",
  capabilities: ["my-task-type"],
});

agent.registerHandler("my-task-type", async (task) => {
  // Process task
  return { result: "task completed" };
});
```

## Dependencies

This template expects `@tonnos/agent-tools` to be available from the workspace root.
