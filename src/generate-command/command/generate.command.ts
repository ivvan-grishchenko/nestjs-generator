import type { SimpleGit } from 'simple-git';

import { Inject } from '@nestjs/common';
import chalk from 'chalk';
import fs from 'fs-extra';
import { Command, CommandRunner, InquirerService } from 'nest-commander';
import { execSync } from 'node:child_process';
import path from 'node:path';

import type { TemplateId } from '../generate.type';

import { TEMPLATES } from '../generate.constant';
import { GenerateInject, GenerateQuestionSet } from '../generate.enum';

@Command({
  aliases: ['gen'],
  description: 'Generate project from templates',
  name: 'generate',
})
export class GenerateCommand extends CommandRunner {
  constructor(
    private readonly inquirer: InquirerService,
    @Inject(GenerateInject.SIMPLE_GIT) private readonly git: SimpleGit,
  ) {
    super();
  }

  override async run(_passedParams: string[]): Promise<void> {
    const tempDir = path.join(process.cwd(), '.temp-template-clone');

    try {
      const { template } = await this.inquirer.ask<{ template: TemplateId }>(
        GenerateQuestionSet.CHOOSE_TEMPLATE,
        undefined,
      );

      const config = TEMPLATES[template];

      if (!config) throw new Error('Template does not exist');

      // Clean previous temp dir if exists
      await fs.remove(tempDir);

      // Clone repository
      console.log(chalk.blue(`📥 Cloning ${template}...`));
      const taskOptions = ['--branch', config.branch, '--depth=1'];
      await this.git.clone(config.repo, tempDir, taskOptions);

      // Copy all files from cloned repo to current directory
      console.log(chalk.blue('📋 Copying files...'));
      await fs.copy(tempDir, process.cwd(), {
        filter: (src) => !src.includes('.git'), // Skip .git folder
        overwrite: true, // Overwrite existing files
      });

      // Install dependencies
      console.log(chalk.blue('📦 Running npm install...'));
      execSync('npm install', {
        cwd: process.cwd(),
        stdio: 'inherit',
      });

      console.log(chalk.green('✅ Project generated successfully.'));
    } catch (error: unknown) {
      const additionalMessage = error instanceof Error ? error.message : '';

      console.log(
        chalk.red(`❌ Failed to generate template, ${additionalMessage}`),
      );
    } finally {
      await fs.remove(tempDir).catch(() => {});
    }
  }
}
