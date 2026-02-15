import { createLogger } from "@tonnos/agent-tools/logger.js";

const logger = createLogger({
  agentName: "TemplateAgent",
  level: "debug",
});

class TemplateAgent {
  constructor(options = {}) {
    this.name = options.name || "TemplateAgent";
    this.version = options.version || "1.0.0";
    this.capabilities = options.capabilities || [];
    this.logger = logger.child({ agentName: this.name });
  }

  async initialize() {
    this.logger.info("Initializing agent", {
      name: this.name,
      version: this.version,
    });
  }

  async execute(message) {
    this.logger.info("Executing message", { messageId: message.id });
    return { status: "completed" };
  }
}

export { TemplateAgent };
export default TemplateAgent;
