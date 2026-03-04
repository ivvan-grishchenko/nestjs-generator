import { Module } from '@nestjs/common';

import {
  ChooseTemplateQuestionSetProvider,
  GenerateCommandProvider,
  SimpleGitProvider,
} from './generate.provider';

@Module({
  providers: [
    GenerateCommandProvider,
    ChooseTemplateQuestionSetProvider,
    SimpleGitProvider,
  ],
})
export class GenerateCommandModule {}
