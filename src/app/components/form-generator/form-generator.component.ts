import {
  Component,
  Input,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { BehaviorSubject, merge } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormInput } from '../../models/form';
import {
  createFieldStreams,
  getInputComponent,
} from '../../helpers/formHelper';
import { InputComponentsEnum } from '../../constants/form';

@Component({
  selector: 'form-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-generator.component.html',
  styleUrls: ['./form-generator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormGeneratorComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @Input() inputs: FormInput[] = [];

  readonly filters$ = new BehaviorSubject<Record<string, any>>({});
  readonly formReady$ = new BehaviorSubject<FormGroup | null>(null);

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.initWatchers();
    this.formReady$.next(this.form);
  }

  private initForm(): void {
    const controls = this.inputs.reduce((acc, input) => {
      acc[input.name] = new FormControl(null);
      return acc;
    }, {} as Record<string, FormControl>);
    this.form = this.fb.group(controls);
  }

  private initWatchers(): void {
    const debouncedFields = this.inputs
      .filter(
        (i) => i.debounced === true || i.component === InputComponentsEnum.Text
      )
      .map((i) => i.name);

    const { debounced$, immediate$ } = createFieldStreams(
      this.form.controls,
      debouncedFields
    );

    merge(...debounced$, ...immediate$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const cleaned = this.cleanEmpty(this.form.getRawValue());
        this.filters$.next(cleaned);
      });
  }

  getForm(): FormGroup | null {
    return this.formReady$.getValue();
  }

  private isEmpty(val: any): boolean {
    return (
      val === null || val === '' || (Array.isArray(val) && val.length === 0)
    );
  }

  private cleanEmpty(value: Record<string, any>): Record<string, any> {
    return Object.entries(value).reduce((acc, [key, val]) => {
      if (!this.isEmpty(val)) acc[key] = val;
      return acc;
    }, {} as Record<string, any>);
  }

  getInputComponent(type?: InputComponentsEnum) {
    return getInputComponent(type);
  }

  createInputs(input: FormInput): Record<string, any> {
    return {
      control: this.form.get(input.name),
      label: input.label,
      ...(input.props || {}),
    };
  }
}
