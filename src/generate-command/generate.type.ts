import { TEMPLATES } from './generate.constant';

export type TemplateConfig = {
  branch: string;
  description: string;
  repo: string;
};

export type TemplateId = keyof typeof TEMPLATES;
