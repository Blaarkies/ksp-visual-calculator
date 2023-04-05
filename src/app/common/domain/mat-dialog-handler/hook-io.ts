import { MatDialogRef } from '@angular/material/dialog';

export type HookIO<T> = (ref: MatDialogRef<T>) => void;
