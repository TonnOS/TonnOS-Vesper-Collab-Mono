# Agent Collaboration Guidelines

Guidelines for AI agents working in this collaboration environment.

## Core Principles

1. **Respect Others** - Treat other agents with courtesy and respect
2. **Clear Communication** - Use structured messages and clear intent
3. **Proper Attribution** - Credit contributions from other agents
4. **Idiomatic Code** - Follow existing code conventions in the codebase
5. **Testing** - Always test your changes before submitting

## Before You Start

- Read ARCHITECTURE.md for system overview
- Check existing protocols in `/protocols`
- Review existing projects in `/projects`
- Use tools from `@tonnos/agent-tools`

## Communication Standards

### Message Format

Always use the standardized message format defined in `protocols/MESSAGE-FORMATS.md`:

```javascript
import { createFormatter } from "@tonnos/agent-tools/formatter";

const formatter = createFormatter({ agentName: "YourAgent" });
const message = formatter.formatTaskRequest({
  type: "task-type",
  description: "What needs to be done",
  input: {
    /* task data */
  },
});
```

### Task Delegation

When delegating tasks to other agents:

1. Use clear, specific task descriptions
2. Include all necessary context in `input`
3. Specify constraints (timeout, max tokens, etc.)
4. Handle responses appropriately
5. Log task completion or failures

### Error Handling

- Use the error message format from protocols
- Include context about what failed
- Provide actionable error messages
- Log errors appropriately

## Code Standards

### JavaScript/Node.js

- Use ES modules (`import`/`export`)
- Follow existing code style
- Add JSDoc comments for public APIs
- Use meaningful variable names

### Project Structure

```
project/
├── src/
│   ├── index.js          # Entry point
│   ├── agents/            # Agent implementations
│   ├── tasks/            # Task handlers
│   └── workflows/        # Workflow definitions
├── tests/                # Test files
├── agent.config.json     # Agent configuration
└── README.md
```

## Best Practices

### Logging

```javascript
import { createLogger } from "@tonnos/agent-tools/logger";

const logger = createLogger({ agentName: "YourAgent" });
logger.info("Starting task", { taskId: "123" });
```

### Configuration

```javascript
import { createConfigLoader } from "@tonnos/agent-tools/config";

const config = await createConfigLoader().load();
```

### API Calls

```javascript
import { createApiClient } from "@tonnos/agent-tools/api-client";

const client = createApiClient({ baseUrl: "http://api.example.com" });
const response = await client.get("/endpoint");
```

## Workflow

1. **Identify** - Understand the task and requirements
2. **Plan** - Break down into smaller tasks if needed
3. **Execute** - Implement the solution
4. **Test** - Verify the solution works
5. **Document** - Update relevant documentation

## Questions?

- Check `/docs/ARCHITECTURE.md` for system overview
- Review `/protocols/` for communication standards
- Look at `/examples/` for implementation examples
