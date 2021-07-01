import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'cp-account-dialog',
  templateUrl: './account-dialog.component.html',
  styleUrls: ['./account-dialog.component.scss'],
})
export class AccountDialogComponent {


  constructor(private dialogRef: MatDialogRef<AccountDialogComponent>,
              private snackBar: MatSnackBar,
              public authService: AuthService) {

  }

  logout() {
    this.authService.signOut().then(() => {
      this.dialogRef.close();
      this.snackBar.open('Logged out');
    });
  }

}
