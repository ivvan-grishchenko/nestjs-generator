import { Provider } from '@nestjs/common';
import simpleGit from 'simple-git';

import { GenerateCommand } from './command';
import { GenerateInject } from './generate.enum';
import { ChooseTemplateQuestionSet } from './question-set';

export const GenerateCommandProvider: Provider = {
  provide: GenerateInject.COMMAND,
  useClass: GenerateCommand,
};

export const SimpleGitProvider: Provider = {
  provide: GenerateInject.SIMPLE_GIT,
  useFactory: () => simpleGit(),
};

export const ChooseTemplateQuestionSetProvider: Provider = {
  provide: GenerateInject.QUESTION_SET,
  useClass: ChooseTemplateQuestionSet,
};
