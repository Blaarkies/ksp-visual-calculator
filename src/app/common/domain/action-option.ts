import { Observable } from 'rxjs';

class ActionMeta {

  divider?: true;
  action?: () => void;
  route?: string;
  externalRoute?: string;

}

class UnavailableMeta {

  unavailable$?: Observable<boolean>;
  tooltip?: string;
  action?: () => void;

}

export class ActionOption {

  type: ActionOptionType;
  readNotification: () => void;

  constructor(public label: string,
              public icon: string,
              public actionMeta: ActionMeta,
              public tooltip?: string,
              public unread: boolean = false,
              onRead?: () => void,
              public unavailableMeta?: UnavailableMeta) {
    this.type = ActionOptionType.fromActionMeta(actionMeta);
    this.readNotification = () => {
      this.unread = false;
      onRead && onRead();
    };
  }

}

export class ActionOptionType {

  static Divider = new ActionOptionType('divider');
  static Action = new ActionOptionType('action');
  static Route = new ActionOptionType('route');
  static ExternalRoute = new ActionOptionType('externalRoute');

  // tslint:disable-next-line:no-unused-variable
  constructor(private type: string) {
  }

  static fromActionMeta(actionMeta: ActionMeta): ActionOptionType {
    let typeDetermined =
      actionMeta.divider !== undefined ? ActionOptionType.Divider
        : actionMeta.action !== undefined ? ActionOptionType.Action
        : actionMeta.route !== undefined ? ActionOptionType.Route
        : actionMeta.externalRoute !== undefined ? ActionOptionType.ExternalRoute
          : null;
    if (!typeDetermined) {
      throw new Error(`ActionOptionType for ${JSON.stringify(actionMeta)} could not be determined`);
    }
    return typeDetermined;
  }

}
