import { ActionOption } from '../../common/domain/action-option';
import { Icons } from '../../common/domain/icons';
import { ActionPanelColors } from '../action-panel/action-panel.component';

export class ActionPanelDetails {
  startTitle?: string;
  color: ActionPanelColors;
  startIcon: Icons;
  options: ActionOption[];
}
