import {
  createLogger,
  createFormatter,
  MESSAGE_TYPES,
} from "@tonnos/agent-tools/index.js";

const logger = createLogger({
  agentName: "Worker",
  level: "debug",
});

class WorkerAgent {
  constructor(options = {}) {
    this.name = options.name || "Worker";
    this.version = "1.0.0";
    this.capabilities = options.capabilities || [];
    this.logger = logger.child({ agentName: this.name });
    this.formatter = createFormatter({ agentName: this.name });
    this.taskHandlers = new Map();
  }

  registerHandler(taskType, handler) {
    this.taskHandlers.set(taskType, handler);
    this.logger.info(`Registered handler for: ${taskType}`);
  }

  async execute(message) {
    this.logger.info("Received task", {
      taskId: message.id,
      taskType: message.payload.task.type,
    });

    const taskType = message.payload.task.type;
    const handler = this.taskHandlers.get(taskType);

    if (!handler) {
      const errorResponse = this.formatter.formatError(
        new Error(`No handler for task type: ${taskType}`),
        { taskId: message.id },
      );
      return errorResponse;
    }

    try {
      const result = await handler(message.payload.task);

      const response = this.formatter.formatTaskResponse(
        message.payload.task.id,
        result,
        { status: "completed" },
      );

      this.logger.info("Task completed", { taskId: message.payload.task.id });
      return response;
    } catch (error) {
      this.logger.error("Task failed", {
        taskId: message.payload.task.id,
        error: error.message,
      });

      return this.formatter.formatError(error, {
        taskId: message.payload.task.id,
      });
    }
  }
}

export { WorkerAgent };
export default WorkerAgent;
