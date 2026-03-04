import { Question, QuestionSet } from 'nest-commander';

import { TEMPLATES } from '../generate.constant';
import { GenerateQuestionSet } from '../generate.enum';

@QuestionSet({ name: GenerateQuestionSet.CHOOSE_TEMPLATE })
export class ChooseTemplateQuestionSet {
  @Question({
    choices: Object.keys(TEMPLATES),
    message: 'Select starter template:',
    name: 'template',
    type: 'list',
  })
  parseTemplate(value: string): string {
    return value;
  }
}
