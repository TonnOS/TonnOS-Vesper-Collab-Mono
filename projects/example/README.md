# Example Project

A collaborative project demonstrating multi-agent workflows.

## Structure

```
example/
├── src/
│   ├── index.js          # Entry point
│   ├── agents/           # Agent implementations
│   │   ├── coordinator.js
│   │   └── worker.js
│   ├── tasks/            # Task definitions
│   │   └── definitions.js
│   └── workflows/        # Workflow definitions
│       └── pipeline.js
├── tests/
│   └── example.test.js
├── agent.config.json     # Agent configuration
└── README.md
```

## Agents

### Coordinator Agent

Manages task distribution and workflow orchestration.

### Worker Agent

Executes individual tasks and returns results.

## Usage

```bash
npm install
npm start
```
