import type { SimpleGit } from 'simple-git';

import { Mocked, TestBed } from '@suites/unit';
import fs from 'fs-extra';
import { InquirerService } from 'nest-commander';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { Mock } from 'vitest';

import { TEMPLATES } from '../generate.constant';
import { GenerateInject, GenerateQuestionSet } from '../generate.enum';
import { GenerateCommand } from './generate.command';

vi.mock('fs-extra', () => ({
  default: {
    copy: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
}));

describe('GenerateCommand', () => {
  let command: GenerateCommand;
  let inquirer: Mocked<InquirerService>;
  let git: Mocked<SimpleGit>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(GenerateCommand).compile();

    command = unit;
    inquirer = unitRef.get(InquirerService);
    git = unitRef.get<SimpleGit>(GenerateInject.SIMPLE_GIT);
  });

  describe('run()', () => {
    let consoleLogSpy: Mock<{ (...data: any[]): void }>;

    beforeEach(() => {
      consoleLogSpy = vi.spyOn(console, 'log');
    });

    describe('failed to ask a prompt', () => {
      it('should catch an error when inquirer throws an error', async () => {
        const errorMessage = 'Failed to ask a prompt';

        await inquirer.ask.mockRejectedValue(new Error(errorMessage));

        await command.run([]);

        expect(inquirer.ask).toHaveBeenCalledWith(
          GenerateQuestionSet.CHOOSE_TEMPLATE,
          undefined,
        );
        expect(inquirer.ask).toHaveBeenCalledOnce();
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            `❌ Failed to generate template, ${errorMessage}`,
          ),
        );
      });

      it('should log error message when rejection is not an Error instance', async () => {
        await inquirer.ask.mockRejectedValue('non-Error rejection');

        await command.run([]);

        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('❌ Failed to generate template,'),
        );
      });

      it('should catch an error when returning not existing template', async () => {
        await inquirer.ask.mockResolvedValue({ template: 'unknown' });

        await command.run([]);

        expect(inquirer.ask).toHaveBeenCalledWith(
          GenerateQuestionSet.CHOOSE_TEMPLATE,
          undefined,
        );
        expect(inquirer.ask).toHaveBeenCalledOnce();
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            '❌ Failed to generate template, Template does not exist',
          ),
        );
      });
    });

    describe('successfully answered question', () => {
      const templateKeys = Object.keys(TEMPLATES);
      const validTemplate = templateKeys[0] ?? 'nestjs-scaffold';

      beforeEach(async () => {
        await inquirer.ask.mockResolvedValue({ template: validTemplate });
      });

      describe('failed to remove temporary folder', () => {
        it('should catch an error and log when fs.remove rejects in try', async () => {
          const removeError = new Error('Permission denied');
          vi.mocked(fs.remove).mockRejectedValueOnce(removeError);

          await command.run([]);

          expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining(
              `❌ Failed to generate template, ${removeError.message}`,
            ),
          );
          expect(git.clone).not.toHaveBeenCalled();
        });
      });

      describe('successfully remove temporary folder', () => {
        beforeEach(() => {
          vi.mocked(fs.remove).mockResolvedValue();
        });

        describe('failed to clone repository', () => {
          it('should catch an error and log when git.clone rejects', async () => {
            const cloneError = new Error('Clone failed');
            await git.clone.mockRejectedValueOnce(cloneError);

            await command.run([]);

            expect(consoleLogSpy).toHaveBeenCalledWith(
              expect.stringContaining(
                `❌ Failed to generate template, ${cloneError.message}`,
              ),
            );
          });
        });

        describe('successfully cloned repository', () => {
          beforeEach(async () => {
            await git.clone.mockResolvedValue('success');
          });

          describe('failed to copy files', () => {
            it('should catch an error and log when fs.copy rejects', async () => {
              const copyError = new Error('Copy failed');
              vi.mocked(fs.copy).mockRejectedValueOnce(copyError);

              await command.run([]);

              expect(consoleLogSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                  `❌ Failed to generate template, ${copyError.message}`,
                ),
              );
            });
          });

          describe('successfully copied files', () => {
            beforeEach(() => {
              vi.mocked(fs.copy).mockResolvedValue();
            });

            describe('failed to run npm install', () => {
              it('should catch an error and log when execSync throws', async () => {
                const execError = new Error('npm install failed');
                vi.mocked(execSync).mockImplementationOnce(() => {
                  throw execError;
                });

                await command.run([]);

                expect(consoleLogSpy).toHaveBeenCalledWith(
                  expect.stringContaining(
                    `❌ Failed to generate template, ${execError.message}`,
                  ),
                );
              });
            });

            describe('successfully run npm install', () => {
              beforeEach(() => {
                vi.mocked(execSync).mockReturnValue('');
              });

              it('should clone, copy, run npm install and log success', async () => {
                const config = TEMPLATES[validTemplate];
                const expectedTempDir = path.join(
                  process.cwd(),
                  '.temp-template-clone',
                );

                await command.run([]);

                expect(fs.remove).toHaveBeenCalledWith(expectedTempDir);
                expect(git.clone).toHaveBeenCalledWith(
                  config?.repo,
                  expectedTempDir,
                  ['--branch', config?.branch, '--depth=1'],
                );
                expect(fs.copy).toHaveBeenCalledWith(
                  expectedTempDir,
                  process.cwd(),
                  expect.objectContaining({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    filter: expect.any(Function),
                    overwrite: true,
                  }),
                );
                const copyOptions = vi.mocked(fs.copy).mock.calls[0]?.[2] as
                  | { filter: (src: string) => boolean }
                  | undefined;
                if (copyOptions?.filter) {
                  expect(copyOptions.filter('/path/.git')).toBe(false);
                  expect(copyOptions.filter('/path/src/file.ts')).toBe(true);
                }
                expect(execSync).toHaveBeenCalledWith('npm install', {
                  cwd: process.cwd(),
                  stdio: 'inherit',
                });
                expect(consoleLogSpy).toHaveBeenCalledWith(
                  expect.stringContaining('✅ Project generated successfully.'),
                );
              });
            });
          });
        });
      });
    });
  });
});
