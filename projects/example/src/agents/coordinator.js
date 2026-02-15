import {
  createLogger,
  createFormatter,
  MESSAGE_TYPES,
} from "@tonnos/agent-tools/index.js";

const logger = createLogger({
  agentName: "Coordinator",
  level: "debug",
});

class CoordinatorAgent {
  constructor(options = {}) {
    this.name = options.name || "Coordinator";
    this.version = "1.0.0";
    this.capabilities = ["task-coordination", "workflow-management"];
    this.logger = logger.child({ agentName: this.name });
    this.formatter = createFormatter({ agentName: this.name });
    this.workers = new Map();
  }

  registerWorker(worker) {
    this.workers.set(worker.name, worker);
    this.logger.info(`Registered worker: ${worker.name}`, {
      capabilities: worker.capabilities,
    });
  }

  async distributeTask(task) {
    this.logger.info("Distributing task", { task: task.type });

    const suitableWorkers = Array.from(this.workers.values()).filter((w) =>
      w.capabilities.includes(task.type),
    );

    if (suitableWorkers.length === 0) {
      throw new Error(`No worker available for task type: ${task.type}`);
    }

    const worker = suitableWorkers[0];
    this.logger.debug(`Selected worker: ${worker.name}`);

    const message = this.formatter.formatTaskRequest({
      type: task.type,
      description: task.description,
      input: task.input,
    });

    return worker.execute(message);
  }

  async executeWorkflow(workflow) {
    this.logger.info("Starting workflow", { workflow: workflow.name });
    const results = [];

    for (const task of workflow.tasks) {
      const result = await this.distributeTask(task);
      results.push(result);
    }

    this.logger.info("Workflow completed", {
      tasksCompleted: results.length,
    });

    return results;
  }
}

export { CoordinatorAgent };
export default CoordinatorAgent;
