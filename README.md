# nest-generator

A CLI tool that scaffolds NestJS projects from configurable Git-based templates. Choose a template, and the generator clones it, copies files into your current directory, and runs `npm install`.

[![npm version](https://img.shields.io/npm/v/@benrasha/nest-generator.svg)](https://www.npmjs.com/package/@benrasha/nest-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
- [How it works](#how-it-works)
- [Available templates](#available-templates)
- [Requirements](#requirements)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

### Global install (recommended)

```bash
npm install -g @benrasha/nest-generator
```

Then run from any directory:

```bash
nest-generator
```

### Run without installing (npx)

```bash
npx @benrasha/nest-generator
```

Or run the `generate` command explicitly:

```bash
npx @benrasha/nest-generator generate
```

### From source

```bash
git clone https://github.com/ivvan-grishchenko/nestjs-generator.git
cd nestjs-generator
npm ci
npm run build
node dist/main.js
# or link globally: npm link
```

---

## Usage

### Commands

| Command     | Alias | Description                    |
| ----------- | ----- | ------------------------------ |
| `generate`  | `gen` | Generate project from a template |

### Basic flow

1. **Go to the folder** where you want the project (can be an empty directory or an existing one; existing files may be overwritten).

   ```bash
   mkdir my-app && cd my-app
   ```

2. **Run the CLI.**

   ```bash
   nest-generator
   # or
   nest-generator generate
   # or
   nest-generator gen
   ```

3. **Choose a template** from the interactive list (arrow keys + Enter).

4. The CLI will:
   - Clone the template repository (shallow clone, single branch)
   - Copy all files into the current directory (excluding `.git`)
   - Run `npm install`

5. When it finishes, you get a ready-to-use project in the current directory.

### Example

```bash
mkdir my-nest-app
cd my-nest-app
nest-generator
# Select "nestjs-scaffold" (or another template)
# Wait for clone, copy, and npm install
# Start coding
npm run start:dev
```

### Important notes

- **Current directory**  
  The tool always uses the **current working directory**. It does not create a new subfolder; it writes into `.` (overwriting existing files when names conflict).

- **Overwrite behavior**  
  Files from the template are copied with `overwrite: true`. Existing files in the same paths will be replaced. Use an empty directory if you want a clean scaffold.

- **Network and Git**  
  Cloning requires network access and a reachable template Git URL. The template repo is cloned with `--depth=1` and a specific branch.

- **npm install**  
  After copying, the CLI runs `npm install` in the current directory. Ensure Node.js and npm are available and that you have no lockfile/registry issues.

---

## How it works

1. **Prompt** — You are asked to select a template from a list (names come from the built-in template config).
2. **Clone** — The template repo is cloned into a temporary directory (`.temp-template-clone`) with a shallow clone of the configured branch.
3. **Copy** — All files from that temp directory are copied into `process.cwd()`, excluding `.git`.
4. **Install** — `npm install` is executed in the current directory.
5. **Cleanup** — The temporary directory is removed. On failure, cleanup is still attempted.

The temporary directory is created under the current working directory and is removed when the command exits (success or failure).

---

## Available templates

Templates are defined in the CLI and point to Git repositories and branches.

| Template ID       | Description           | Repository |
| ----------------- | --------------------- | ---------- |
| `nestjs-scaffold` | Basic NestJS scaffold | [nestjs-scaffold](https://github.com/ivvan-grishchenko/nestjs-scaffold) |

More templates can be added in future releases. The list is fixed at runtime (no config file for end users).

---

## Requirements

- **Node.js** — Compatible with the version used by the template (e.g. LTS). The project uses Node 24 in development (see `.nvmrc`).
- **npm** — Used to run `npm install` after copying files.
- **Git** — Used internally to clone template repositories.
- **Network** — Required to clone the template and install dependencies.

---

## Development

### Setup

```bash
git clone https://github.com/ivvan-grishchenko/nestjs-generator.git
cd nestjs-generator
npm ci
```

### Scripts

| Script           | Description                          |
| ---------------- | ------------------------------------ |
| `npm run build`  | Build the CLI (output in `dist/`)    |
| `npm run start`  | Run the built CLI                    |
| `npm run start:dev` | Run in watch mode                  |
| `npm run lint`   | Run ESLint                           |
| `npm run format` | Format with Prettier                 |
| `npm run test`   | Run unit tests (Vitest)              |
| `npm run test:e2e` | Run e2e tests (Vitest)            |
| `npm run test:cov` | Run tests with coverage            |

### Adding a new template

Templates are defined in `src/generate-command/generate.constant.ts`. Each entry has:

- **Key** — Template ID shown in the list (e.g. `nestjs-scaffold`).
- **repo** — Git clone URL.
- **branch** — Branch to clone (e.g. `main`).
- **description** — Short description (used in the codebase; the list currently shows template IDs).

Example:

```ts
export const TEMPLATES: Record<string, TemplateConfig> = {
  'nestjs-scaffold': {
    branch: 'main',
    description: 'Basic NestJS scaffold',
    repo: 'https://github.com/ivvan-grishchenko/nestjs-scaffold.git',
  },
  'my-new-template': {
    branch: 'main',
    description: 'My custom NestJS template',
    repo: 'https://github.com/username/my-nest-template.git',
  },
};
```

After adding a template, rebuild and run the CLI to see it in the list.

### Project structure (high level)

```
src/
  app.module.ts              # Root Nest module
  main.ts                    # CLI entry (nest-commander bootstrap)
  generate-command/
    command/
      generate.command.ts    # generate / gen command implementation
    question-set/
      choose-template.question-set.ts  # Interactive template choice
    generate.constant.ts     # TEMPLATES config
    generate.enum.ts        # Enums for DI and question set names
    generate.type.ts        # TemplateConfig, TemplateId
    generate.module.ts      # Module wiring (command, inquirer, simple-git)
```

### Code quality

- **ESLint** — Linting (including lint-staged on commit).
- **Prettier** — Formatting.
- **Husky** — Pre-commit (lint-staged + tests) and commit-msg (Commitlint).
- **Commitlint** — Conventional commits (e.g. `feat:`, `fix:`).

Commits should follow the configured conventional format so the commit-msg hook passes.

---

## Contributing

1. Open an issue or pick an existing one.
2. Fork the repo, create a branch, make your changes.
3. Run `npm run lint`, `npm run test`, and `npm run test:e2e`.
4. Commit using conventional commits (Commitlint is enforced).
5. Push and open a pull request.

Bug reports and feature ideas are welcome via [GitHub Issues](https://github.com/ivvan-grishchenko/nestjs-generator/issues).

---

## License

[MIT](https://opensource.org/licenses/MIT)
