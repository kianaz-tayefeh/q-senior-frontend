import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'checkbox-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule],
  template: `
    <mat-checkbox [formControl]="control">
      {{ label }}
    </mat-checkbox>
  `,
})
export class CheckboxInputComponent {
  @Input() control!: FormControl;
  @Input() label!: string;
}
