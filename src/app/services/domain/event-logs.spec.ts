import { EventLogs } from './event-logs';

describe('EventLogs class', () => {

  it('Sanitize.anonymize censors anything that is not a stock KSP name', () => {
    let personalName = EventLogs.Sanitize.anonymize('blaarkies');
    expect(personalName).not.toBe('blaarkies');
  });

  it('Sanitize.anonymize ignores stock KSP names', () => {
    let publicName = EventLogs.Sanitize.anonymize('kerbin');
    expect(publicName).toBe('kerbin');
  });
});
