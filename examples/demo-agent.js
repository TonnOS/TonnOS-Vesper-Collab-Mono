#!/usr/bin/env node

import {
  createLogger,
  createFormatter,
  createConfigLoader,
  MESSAGE_TYPES,
} from "../tools/src/index.js";

const logger = createLogger({
  agentName: "DemoAgent",
  level: "debug",
});

const formatter = createFormatter({
  agentName: "DemoAgent",
});

const configLoader = createConfigLoader({
  configName: "agent.config.json",
});

class DemoAgent {
  constructor(options = {}) {
    this.name = options.name || "DemoAgent";
    this.version = "1.0.0";
    this.capabilities = options.capabilities || [];
    this.logger = logger.child({ agentName: this.name });
    this.formatter = createFormatter({ agentName: this.name });
    this.config = null;
  }

  async initialize() {
    this.logger.info("Initializing DemoAgent");

    try {
      this.config = await configLoader.loadWithDefaults({
        agent: { name: this.name, version: this.version },
        logging: { level: "info" },
      });

      this.logger.info("Agent initialized", {
        config: this.config.agent,
      });
    } catch (error) {
      this.logger.warn("Using default config", {
        error: error.message,
      });
      this.config = {
        agent: { name: this.name, version: this.version },
      };
    }
  }

  createDiscoveryMessage() {
    const message = this.formatter.formatDiscovery(this.capabilities);
    this.logger.info("Created discovery message", { messageId: message.id });
    return message;
  }

  createTaskRequest(taskType, description, input) {
    const message = this.formatter.formatTaskRequest({
      type: taskType,
      description,
      input,
    });
    this.logger.info("Created task request", {
      taskType,
      messageId: message.id,
    });
    return message;
  }

  parseResponse(responseMessage) {
    const parsed = this.formatter.parse(responseMessage);

    if (!parsed.valid) {
      this.logger.error("Failed to parse message", {
        error: parsed.error,
      });
      return null;
    }

    this.logger.info("Parsed message", {
      type: parsed.message.type,
      sender: parsed.message.sender,
    });

    return parsed.message;
  }

  formatForOutput(message) {
    return this.formatter.formatForHuman(message);
  }

  demonstrateLogging() {
    this.logger.trace("This is a trace message");
    this.logger.debug("This is a debug message");
    this.logger.info("This is an info message");
    this.logger.warn("This is a warning message");
    this.logger.error("This is an error message");
  }

  demonstrateMessageTypes() {
    const messages = [];

    messages.push(this.createDiscoveryMessage());

    messages.push(
      this.formatter.formatHandshake({
        name: this.name,
        version: this.version,
        capabilities: this.capabilities,
      }),
    );

    messages.push(
      this.createTaskRequest("code-generation", "Generate a simple function", {
        language: "javascript",
        function: "helloWorld",
      }),
    );

    messages.push(
      this.formatter.formatTaskResponse(
        "task-123",
        { result: 'function helloWorld() { return "Hello"; }' },
        { status: "completed" },
      ),
    );

    messages.push(
      this.formatter.formatHeartbeat({
        status: { tasksRunning: 0, cpu: 0.5 },
      }),
    );

    messages.push(
      this.formatter.formatError(new Error("Demo error"), {
        context: "demonstration",
      }),
    );

    return messages;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("Demo Agent - Agent Tools Demonstration");
  console.log("=".repeat(60));
  console.log();

  const agent = new DemoAgent({
    name: "DemoAgent",
    capabilities: ["code-generation", "code-review", "documentation"],
  });

  await agent.initialize();

  console.log("\n--- Demonstrating Logging Levels ---\n");
  agent.demonstrateLogging();

  console.log("\n--- Demonstrating Message Types ---\n");
  const messages = agent.demonstrateMessageTypes();

  messages.forEach((msg, index) => {
    console.log(`Message ${index + 1}:`);
    console.log(JSON.stringify(msg, null, 2));
    console.log();
  });

  console.log("\n--- Human-Readable Format ---\n");
  const formatted = agent.formatForOutput(messages[2]);
  console.log(formatted);

  console.log("\n--- Message Parsing ---\n");
  const testMessage = JSON.stringify(messages[0]);
  const parsed = agent.parseResponse(testMessage);
  console.log("Parsed successfully:", parsed?.type === "discovery");

  console.log("\n" + "=".repeat(60));
  console.log("Demo complete!");
  console.log("=".repeat(60));
}

main().catch((error) => {
  console.error("Demo failed:", error);
  process.exit(1);
});
