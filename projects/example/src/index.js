import { CoordinatorAgent } from "./agents/coordinator.js";
import { WorkerAgent } from "./agents/worker.js";
import { PIPELINES, TASK_TYPES } from "./workflows/pipeline.js";

const worker = new WorkerAgent({
  name: "CodeWorker",
  capabilities: [
    TASK_TYPES.CODE_GENERATION,
    TASK_TYPES.CODE_REVIEW,
    TASK_TYPES.TEST_GENERATION,
  ],
});

worker.registerHandler(TASK_TYPES.CODE_GENERATION, async (task) => {
  return {
    generatedCode: `// Generated ${task.input.language} code\nconsole.log('Hello, World!');`,
    language: task.input.language,
  };
});

worker.registerHandler(TASK_TYPES.CODE_REVIEW, async (task) => {
  return {
    issues: [],
    suggestions: ["Consider adding type hints"],
    score: 9,
  };
});

worker.registerHandler(TASK_TYPES.TEST_GENERATION, async (task) => {
  return {
    tests: 'describe("Example", () => { it("works", () => {}); });',
    framework: "jest",
  };
});

const coordinator = new CoordinatorAgent({ name: "MainCoordinator" });
coordinator.registerWorker(worker);

const pipeline = PIPELINES.CODE_REVIEW_PIPELINE(
  "function add(a, b) { return a + b; }",
  "javascript",
);

console.log("Starting workflow:", pipeline.name);

const results = await coordinator.executeWorkflow(pipeline);

console.log("\n=== Workflow Results ===");
results.forEach((result, index) => {
  console.log(`\nTask ${index + 1}:`);
  console.log(JSON.stringify(result, null, 2));
});
