export const TASK_TYPES = {
  CODE_GENERATION: "code-generation",
  CODE_REVIEW: "code-review",
  DATA_ANALYSIS: "data-analysis",
  DOCUMENTATION: "documentation",
  TEST_GENERATION: "test-generation",
};

export const createWorkflow = (name, tasks) => ({
  id: `workflow-${Date.now()}`,
  name,
  tasks,
  createdAt: new Date().toISOString(),
});

export const createTask = (type, description, input = {}) => ({
  id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type,
  description,
  input,
  constraints: {},
});

export const PIPELINES = {
  CODE_REVIEW_PIPELINE: (code, language) =>
    createWorkflow("code-review-pipeline", [
      createTask(TASK_TYPES.CODE_GENERATION, "Generate code", {
        code,
        language,
      }),
      createTask(TASK_TYPES.CODE_REVIEW, "Review generated code", {
        code,
        language,
      }),
      createTask(TASK_TYPES.TEST_GENERATION, "Generate tests", {
        code,
        language,
      }),
    ]),

  DATA_ANALYSIS_PIPELINE: (data, analysisType) =>
    createWorkflow("data-analysis-pipeline", [
      createTask(TASK_TYPES.DATA_ANALYSIS, "Analyze data", {
        data,
        analysisType,
      }),
      createTask(TASK_TYPES.DOCUMENTATION, "Document findings", {
        analysisType,
      }),
    ]),
};

export default { TASK_TYPES, createWorkflow, createTask, PIPELINES };
