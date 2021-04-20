class ActionMeta {

  action?: () => void;
  route?: string;
  externalRoute?: string;

}

export class ActionOption {

  type: ActionOptionType;
  readNotification: () => void;

  constructor(public label: string,
              public icon: string,
              public actionMeta: ActionMeta,
              public unread: boolean = false,
              onRead?: () => void) {
    this.type = ActionOptionType.fromActionMeta(actionMeta);
    this.readNotification = () => {
      this.unread = false;
      onRead && onRead();
    };
  }

}

export class ActionOptionType {

  static Action = new ActionOptionType('action');
  static Route = new ActionOptionType('route');
  static ExternalRoute = new ActionOptionType('externalRoute');

  constructor(private type: string) {
  }

  static fromActionMeta(actionMeta: ActionMeta): ActionOptionType {
    let typeDetermined =
      actionMeta.action !== undefined ? ActionOptionType.Action
        : actionMeta.route !== undefined ? ActionOptionType.Route
        : actionMeta.externalRoute !== undefined ? ActionOptionType.ExternalRoute
          : null;
    if (!typeDetermined) {
      console.error(`ActionOptionType for ${JSON.stringify(actionMeta)} could not be determined`);
    }
    return typeDetermined;
  }

}
