import { TestingModule } from '@nestjs/testing';
import fs from 'fs-extra';
import { CommandTestFactory } from 'nest-commander-testing';
import { execSync } from 'node:child_process';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppModule } from '../src/app.module';
import { TEMPLATES } from '../src/generate-command/generate.constant';
import { GenerateInject } from '../src/generate-command/generate.enum';

vi.mock('fs-extra', () => ({
  default: {
    copy: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('node:child_process', () => ({
  execSync: vi.fn().mockReturnValue(undefined),
}));

describe('Generate Command (e2e)', () => {
  let commandInstance: TestingModule;
  let mockGit: { clone: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockGit = {
      clone: vi.fn().mockResolvedValue(undefined),
    };

    commandInstance = await CommandTestFactory.createTestingCommand({
      imports: [AppModule],
    })
      .overrideProvider(GenerateInject.SIMPLE_GIT)
      .useValue(mockGit)
      .compile();
  });

  describe('command registration', () => {
    it('should run the generate command', async () => {
      CommandTestFactory.setAnswers(['nestjs-scaffold']);

      await expect(
        CommandTestFactory.run(commandInstance, ['generate']),
      ).resolves.toBeUndefined();
    });

    it('should run the generate command via alias "gen"', async () => {
      CommandTestFactory.setAnswers(['nestjs-scaffold']);

      await expect(
        CommandTestFactory.run(commandInstance, ['gen']),
      ).resolves.toBeUndefined();
    });
  });

  describe('successful generation flow', () => {
    it('should clone repo, copy files, run npm install and log success when template is selected', async () => {
      const templateId = Object.keys(TEMPLATES)[0] ?? 'nestjs-scaffold';
      const config = TEMPLATES[templateId];
      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      CommandTestFactory.setAnswers([templateId]);

      await CommandTestFactory.run(commandInstance, ['generate']);

      expect(mockGit.clone).toHaveBeenCalledWith(
        config?.repo,
        expect.stringContaining('.temp-template-clone'),
        ['--branch', config?.branch, '--depth=1'],
      );
      expect(fs.copy).toHaveBeenCalledWith(
        expect.stringContaining('.temp-template-clone'),
        process.cwd(),
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          filter: expect.any(Function),
          overwrite: true,
        }),
      );
      expect(execSync).toHaveBeenCalledWith('npm install', {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Project generated successfully.'),
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should log error when selected template does not exist', async () => {
      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      CommandTestFactory.setAnswers(['non-existent-template']);

      await CommandTestFactory.run(commandInstance, ['generate']);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Failed to generate template'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Template does not exist'),
      );
      expect(mockGit.clone).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
    });

    it('should log error when git clone fails', async () => {
      const cloneError = new Error('Network error');
      mockGit.clone.mockRejectedValueOnce(cloneError);
      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      CommandTestFactory.setAnswers(['nestjs-scaffold']);

      await CommandTestFactory.run(commandInstance, ['generate']);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Failed to generate template'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(cloneError.message),
      );

      consoleLogSpy.mockRestore();
    });

    it('should log error when fs.copy fails', async () => {
      const copyError = new Error('Copy failed');
      vi.mocked(fs.remove).mockResolvedValue(undefined);
      vi.mocked(fs.copy).mockRejectedValueOnce(copyError);
      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      CommandTestFactory.setAnswers(['nestjs-scaffold']);

      await CommandTestFactory.run(commandInstance, ['generate']);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Failed to generate template'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(copyError.message),
      );

      consoleLogSpy.mockRestore();
    });

    it('should log error when npm install fails', async () => {
      const execError = new Error('npm install failed');
      vi.mocked(execSync).mockImplementationOnce(() => {
        throw execError;
      });
      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      CommandTestFactory.setAnswers(['nestjs-scaffold']);

      await CommandTestFactory.run(commandInstance, ['generate']);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ Failed to generate template'),
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining(execError.message),
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe('cleanup', () => {
    it('should attempt to remove temp dir in finally block after success', async () => {
      CommandTestFactory.setAnswers(['nestjs-scaffold']);

      await CommandTestFactory.run(commandInstance, ['generate']);

      expect(fs.remove).toHaveBeenCalledWith(
        expect.stringContaining('.temp-template-clone'),
      );
    });

    it('should attempt to remove temp dir in finally block after clone failure', async () => {
      mockGit.clone.mockRejectedValueOnce(new Error('Clone failed'));
      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => {});

      CommandTestFactory.setAnswers(['nestjs-scaffold']);

      await CommandTestFactory.run(commandInstance, ['generate']);

      expect(fs.remove).toHaveBeenCalledWith(
        expect.stringContaining('.temp-template-clone'),
      );

      consoleLogSpy.mockRestore();
    });
  });
});
