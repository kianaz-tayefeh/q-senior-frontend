import { Type } from '@angular/core';
import { TextInputComponent } from '../components/inputs/text-input.component';
import { SelectInputComponent } from '../components/inputs/select-input.component';
import { CheckboxInputComponent } from '../components/inputs/checkbox-input.component';
import { debounceTime, distinctUntilChanged, Observable, tap } from 'rxjs';
import { AbstractControl, FormControl } from '@angular/forms';
import { DEBOUNCE_TIME, InputComponentsEnum } from '../constants/form';

export function getInputComponent(type?: InputComponentsEnum): Type<any> {
  const mapping = {
    [InputComponentsEnum.Text]: TextInputComponent,
    [InputComponentsEnum.Select]: SelectInputComponent,
    [InputComponentsEnum.Checkbox]: CheckboxInputComponent,
  };

  return type && mapping[type] ? mapping[type] : TextInputComponent;
}

export function createFieldStreams(
  controls: Record<string, AbstractControl>,
  debouncedFields: string[]
): {
  debounced$: Observable<any>[];
  immediate$: Observable<any>[];
} {
  const debounced$ = debouncedFields
    .map((field) => ({ field, control: controls[field] }))
    .filter(
      (pair): pair is { field: string; control: FormControl } => !!pair.control
    )
    .map(({ field, control }) =>
      control.valueChanges.pipe(
        debounceTime(DEBOUNCE_TIME),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap(() => console.log(`[DEBOUNCED] Field: ${field}`))
      )
    );

  const immediate$ = Object.keys(controls)
    .filter((name) => !debouncedFields.includes(name))
    .map((field) => ({ field, control: controls[field] }))
    .filter(
      (pair): pair is { field: string; control: FormControl } => !!pair.control
    )
    .map(({ field, control }) =>
      control.valueChanges.pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        tap(() => console.log(`[IMMEDIATE] Field: ${field}`))
      )
    );

  return { debounced$, immediate$ };
}
