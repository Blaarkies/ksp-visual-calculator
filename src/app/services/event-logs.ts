class Category {
  static Tutorial = 'tutorial';
  static Craft = 'craft';
  static CelestialBody = 'celestialbody';
  static Privacy = 'privacy';
  static Account = 'account';
  static Credits = 'credits';
  static Coffee = 'coffee';
  static Feedback = 'feedback';
  static Difficulty = 'difficulty';
  static Route = 'route';
  static Help = 'help';
  static Camera = 'camera';
  static State = 'state';
}

class Sanitize {

  static Anonymized = '** anonymized **';

  // todo: consider global replace instead of specific cases
  static anonymize(label: string): string {
    return Sanitize.stockWords.some(w => w.like(label))
      ? label
      : EventLogs.Sanitize.Anonymized;
  }

  private static stockWords = ['Kerbol', 'Moho', 'Eve', 'Gilly', 'Kerbin', 'Mun', 'Minmus', 'Duna', 'Ike', 'Dres', 'Jool', 'Laythe', 'Vall',
    'Tylo', 'Bop', 'Pol', 'Eeloo',
    'Communotron 16', 'Communotron 16-S', 'Communotron DTS-M1', 'Communotron HG-55', 'Communotron 88-88', 'HG-5 High Gain Antenna',
    'RA-2 Relay Antenna', 'RA-15 Relay Antenna', 'RA-100 Relay Antenna', 'Tracking Station 1', 'Tracking Station 2', 'Tracking Station 3',
    'Internal', 'Probodobodyne Experiment Control Station', 'Communotron Ground HG-48',
    'Untitled Space Craft',
  ];

}

export class EventLogs {
  static Category = Category;
  static Sanitize = Sanitize;
}
