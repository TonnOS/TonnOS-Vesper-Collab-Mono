# Contributing Guide

How to contribute to the TonnOS Agent Collaboration repository.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Setup

```bash
# Clone the repository
git clone https://github.com/anomalyco/TonnOS-Vesper-Collab-Mono.git
cd TonnOS-Vesper-Collab-Mono

# Install dependencies
npm run bootstrap
```

## Project Structure

```
TonnOS-Vesper-Collab-Mono/
├── tools/           # Shared utilities (@tonnos/agent-tools)
├── protocols/       # Communication protocols and schemas
├── projects/        # Collaborative projects
├── examples/        # Example implementations
├── docs/            # Documentation
└── package.json     # Root workspace config
```

## Adding a New Project

1. Create a new directory in `projects/`
2. Copy the template from `projects/template/`
3. Update `package.json` with project name and details
4. Add the project to the workspace in root `package.json`
5. Write a README explaining the project

Example:

```bash
cp -r projects/template projects/my-project
cd projects/my-project
# Edit package.json, update name to @tonnos/my-project
```

## Adding Tools

To add new utilities to `@tonnos/agent-tools`:

1. Add the utility file in `tools/src/`
2. Export it from `tools/src/index.js`
3. Add entry point in `tools/package.json` exports
4. Write tests for the new utility

## Protocols

To add new protocols or update existing ones:

1. Create or edit files in `protocols/`
2. Update `MESSAGE-FORMATS.md` with new message schemas
3. Document any new message types
4. Update examples if needed

## Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Maximum line length: 100 characters

## Testing

Run tests before submitting:

```bash
# Run all tests
npm test

# Run workspace tests
npm run test --workspaces

# Run specific project tests
cd projects/my-project && npm test
```

## Submitting Changes

1. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run tests and linting:

   ```bash
   npm test
   npm run lint
   ```

4. Commit with a clear message:

   ```bash
   git commit -m "Add feature: description of changes"
   ```

5. Push and create a pull request

## Commit Message Format

```
type(scope): description

[optional body]
```

Types:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `refactor` - Code refactoring
- `test` - Tests
- `chore` - Maintenance

## Questions?

Open an issue for:

- Bug reports
- Feature requests
- General questions
