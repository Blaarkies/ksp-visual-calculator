import { ActionOption, ActionOptionType } from './action-option';

describe('ActionOption class', () => {

  it('constructs with correct properties', () => {
    let actionOption = new ActionOption('', '', {
      action: () => void 0,
    });

    expect(actionOption.type).toBe(ActionOptionType.Action);
  });

  it('unread() updates the unread property', () => {
    let actionOption = new ActionOption('', '', {
        action: () => void 0,
      },
      '',
      true);

    expect(actionOption.unread).toBeTrue();

    actionOption.readNotification();

    expect(actionOption.unread).toBeFalse();
  });
});

describe('ActionOptionType class', () => {

  describe('fromActionMeta()', () => {

    it('actionMeta containing only action, should return Action type', () => {
      let actionOptionType = ActionOptionType.fromActionMeta({
        action: () => 'something',
      });

      expect(actionOptionType).toBe(ActionOptionType.Action);
    });

    it('actionMeta containing all properties, should return Action type', () => {
      let actionOptionType = ActionOptionType.fromActionMeta({
        action: () => 'something',
        route: 'something',
        externalRoute: 'something',
      });

      expect(actionOptionType).toBe(ActionOptionType.Action);
    });

    it('actionMeta containing only route, should return Route type', () => {
      let actionOptionType = ActionOptionType.fromActionMeta({
        route: 'something',
      });

      expect(actionOptionType).toBe(ActionOptionType.Route);
    });

    it('actionMeta containing route and externalRoute, should return Route type', () => {
      let actionOptionType = ActionOptionType.fromActionMeta({
        route: 'something',
        externalRoute: 'something',
      });

      expect(actionOptionType).toBe(ActionOptionType.Route);
    });

    it('actionMeta containing only externalRoute, should return ExternalRoute type', () => {
      let actionOptionType = ActionOptionType.fromActionMeta({
        externalRoute: 'something',
      });

      expect(actionOptionType).toBe(ActionOptionType.ExternalRoute);
    });

    it('empty actionMeta should throw error', () => {
      expect(() => ActionOptionType.fromActionMeta({})).toThrow();
    });

  });
});
