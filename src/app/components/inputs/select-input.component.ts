import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'select-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  template: `
    <mat-form-field appearance="fill">
      <mat-label>{{ label }}</mat-label>
      <mat-select [formControl]="control" [multiple]="multiple">
        <mat-option *ngFor="let opt of options" [value]="opt">
          {{ opt }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
})
export class SelectInputComponent {
  @Input() control!: FormControl;
  @Input() label!: string;
  @Input() options: string[] = [];
  @Input() multiple: boolean = false;
}
