import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
    templateUrl: './confirm-dialog.html',
    styleUrl: './confirm-dialog.scss'
})
export class ConfirmDialogComponent {
    public data = inject(MAT_DIALOG_DATA);
}