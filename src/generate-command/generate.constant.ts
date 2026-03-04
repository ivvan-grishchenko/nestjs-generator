import type { TemplateConfig } from './generate.type';

export const TEMPLATES: Record<string, TemplateConfig> = {
  'nestjs-scaffold': {
    branch: 'main',
    description: 'Basic NestJS scaffold',
    repo: 'https://github.com/ivvan-grishchenko/nestjs-scaffold.git',
  },
} as const;
