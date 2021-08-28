import { LabeledOption } from '../../common/domain/input-fields/labeled-option';

export class DifficultySetting {

  constructor(public label: string,
              public rangeModifier: number,
              public dsnModifier: number) {
  }

  static easy = new DifficultySetting('Easy', 1.5, 1);
  static normal = new DifficultySetting('Normal', 1, 1);
  static moderate = new DifficultySetting('Moderate', .8, 1);
  static hard = new DifficultySetting('Hard', .65, 1);

  static All = [
    DifficultySetting.easy,
    DifficultySetting.normal,
    DifficultySetting.moderate,
    DifficultySetting.hard,
  ];

  static List = DifficultySetting.All.map(ct => new LabeledOption(ct.label, ct));

  static fromObject(difficulty: any): DifficultySetting {
    return new DifficultySetting(difficulty.label, difficulty.rangeModifier, difficulty.dsnModifier);
  }

}
