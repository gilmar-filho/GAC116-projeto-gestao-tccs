import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmData, ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private dialog = inject(MatDialog);

  confirmar(data: ConfirmData): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialogComponent, { data, width: '400px' })
      .afterClosed()
      .pipe(map((result) => result === true));
  }
}
