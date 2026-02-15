#!/usr/bin/env node

import { createLogger, createFormatter, MESSAGE_TYPES } from '../tools/src/index.js';

const logger = createLogger({ 
  agentName: 'WorkflowDemo',
  level: 'info'
});

const createAgent = (name, capabilities) => {
  return {
    name,
    capabilities,
    formatter: createFormatter({ agentName: name }),
    logger: logger.child({ agentName: name })
  };
};

const createTask = (agent, taskType, description, input) => {
  return agent.formatter.formatTaskRequest({
    type: taskType,
    description,
    input
  });
};

const handleTask = async (agent, taskMessage) => {
  const { type, description, input } = taskMessage.payload.task;
  
  agent.logger.info('Received task', { type, description });

  await new Promise(resolve => setTimeout(resolve, 100));

  let result;
  switch (type) {
    case 'code-generation':
      result = generateCode(input);
      break;
    case 'code-review':
      result = reviewCode(input);
      break;
    case 'test-generation':
      result = generateTests(input);
      break;
    default:
      result = { error: `Unknown task type: ${type}` };
  }

  return agent.formatter.formatTaskResponse(
    taskMessage.payload.task.id,
    result,
    { status: 'completed' }
  );
};

const generateCode = (input) => {
  const { language, function: funcName } = input;
  
  const templates = {
    javascript: `function ${funcName}() {\n  // Implementation\n  return "Hello from ${funcName}";\n}`,
    python: `def ${funcName}():\n    # Implementation\n    return "Hello from ${funcName}"`,
    typescript: `function ${funcName}(): string {\n  // Implementation\n  return "Hello from ${funcName}";\n}`
  };
  
  return {
    code: templates[language] || templates.javascript,
    language,
    function: funcName
  };
};

const reviewCode = (input) => {
  const { code, language } = input;
  
  const issues = [];
  const suggestions = [];

  if (!code.includes('return')) {
    issues.push('Function does not return a value');
  }

  if (language === 'javascript' && !code.includes')('; && !code.includes('\n')) {
    suggestions.push('Consider adding semicolons for clarity');
  }

  if (code.length > 100) {
    suggestions.push('Consider breaking into smaller functions');
  }

  return {
    issues,
    suggestions,
    score: issues.length === 0 ? 10 - suggestions.length : Math.max(5 - issues.length, 1),
    reviewed: true
  };
};

const generateTests = (input) => {
  const { language, function: funcName } = input;
  
  const templates = {
    javascript: `describe('${funcName}', () => {\n  it('should return hello', () => {\n    expect(${funcName}()).toBe('Hello from ${funcName}');\n  });\n});`,
    python: `def test_${funcName}():\n    assert ${funcName}() == "Hello from ${funcName}"`,
    typescript: `describe('${funcName}', () => {\n  it('should return hello', () => {\n    expect(${funcName}()).toBe('Hello from ${funcName}');\n  });\n});`
  };
  
  return {
    tests: templates[language] || templates.javascript,
    framework: language === 'python' ? 'pytest' : 'jest'
  };
};

async function runWorkflow() {
  console.log('='.repeat(60));
  console.log('Cross-Agent Workflow Demonstration');
  console.log('='.repeat(60));
  console.log();

  const generator = createAgent('CodeGenerator', ['code-generation']);
  const reviewer = createAgent('CodeReviewer', ['code-review']);
  const tester = createAgent('TestGenerator', ['test-generation']);

  console.log('--- Agents Initialized ---\n');
  console.log(`  - ${generator.name}: ${generator.capabilities.join(', ')}`);
  console.log(`  - ${reviewer.name}: ${reviewer.capabilities.join(', ')}`);
  console.log(`  - ${tester.name}: ${tester.capabilities.join(', ')}`);
  console.log();

  console.log('--- Starting Code Review Pipeline ---\n');

  const task1 = createTask(
    generator,
    'code-generation',
    'Generate a simple function',
    { language: 'javascript', function: 'calculateTotal' }
  );

  console.log(`[${generator.name}] Creating task: ${task1.payload.task.description}`);
  console.log(`    Input: ${JSON.stringify(task1.payload.task.input)}`);
  console.log();

  const response1 = await handleTask(generator, task1);
  
  console.log(`[${generator.name}] Task completed`);
  console.log(`    Result: ${response1.payload.result.code.substring(0, 50)}...`);
  console.log();

  const task2 = reviewer.formatter.formatTaskRequest({
    type: 'code-review',
    description: 'Review generated code',
    input: {
      code: response1.payload.result.code,
      language: response1.payload.result.language
    }
  });

  console.log(`[${reviewer.name}] Creating task: ${task2.payload.task.description}`);
  console.log(`    Input: code (${task2.payload.task.input.code.length} chars)`);
  console.log();

  const response2 = await handleTask(reviewer, task2);

  console.log(`[${reviewer.name}] Task completed`);
  console.log(`    Score: ${response2.payload.result.score}/10`);
  console.log(`    Issues: ${response2.payload.result.issues.length}`);
  console.log(`    Suggestions: ${response2.payload.result.suggestions.length}`);
  console.log();

  if (response2.payload.result.score >= 7) {
    const task3 = tester.formatter.formatTaskRequest({
      type: 'test-generation',
      description: 'Generate tests for code',
      input: {
        language: response1.payload.result.language,
        function: response1.payload.result.function
      }
    });

    console.log(`[${tester.name}] Creating task: ${task3.payload.task.description}`);
    console.log();

    const response3 = await handleTask(tester, task3);

    console.log(`[${tester.name}] Task completed`);
    console.log(`    Framework: ${response3.payload.result.framework}`);
    console.log(`    Tests: ${response3.payload.result.tests.substring(0, 50)}...`);
    console.log();
  }

  console.log('='.repeat(60));
  console.log('Pipeline Complete!');
  console.log('='.repeat(60));
}

runWorkflow().catch(error => {
  console.error('Workflow failed:', error);
  process.exit(1);
});
