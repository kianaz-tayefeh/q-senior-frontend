import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Input,
  QueryList,
  ViewChild,
  inject,
  DestroyRef,
} from '@angular/core';
import {
  MatColumnDef,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormInput } from '../../models/form';
import { FormGeneratorComponent } from '../form-generator/form-generator.component';

@Component({
  selector: 'filterable-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTable,
    MatProgressSpinner,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButton,
    FormGeneratorComponent,
  ],
  templateUrl: './filterable-table.component.html',
  styleUrls: ['./filterable-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterableTableComponent<T>
  implements AfterContentInit, AfterViewInit
{
  private readonly destroyRef = inject(DestroyRef);

  @ContentChildren(MatHeaderRowDef) headerRowDefs?: QueryList<MatHeaderRowDef>;
  @ContentChildren(MatRowDef) rowDefs?: QueryList<MatRowDef<T>>;
  @ContentChildren(MatColumnDef) columnDefs?: QueryList<MatColumnDef>;
  @ContentChild(MatNoDataRow) noDataRow?: MatNoDataRow;

  @ViewChild(MatTable, { static: true }) table?: MatTable<T>;
  @ViewChild(FormGeneratorComponent) formGen!: FormGeneratorComponent;

  @Input() columns: string[] = [];
  @Input() dataSource:
    | readonly T[]
    | DataSource<T>
    | Observable<readonly T[]>
    | null = null;
  @Input() isLoading: boolean | null = false;
  @Input() fields: FormInput[] = [];

  readonly filters$ = new BehaviorSubject<Record<string, any>>({});
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  ngAfterViewInit(): void {
    this.filters$.subscribe(console.log);

    this.formGen.filters$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filters) => {
        this.filters$.next(filters);
      });

    const readyForm = this.formGen.formReady$.getValue();
    if (readyForm) {
      this.form = readyForm;
    }
  }

  ngAfterContentInit(): void {
    this.columnDefs?.forEach((def) => this.table?.addColumnDef(def));
    this.rowDefs?.forEach((def) => this.table?.addRowDef(def));
    this.headerRowDefs?.forEach((def) => this.table?.addHeaderRowDef(def));
    this.table?.setNoDataRow(this.noDataRow ?? null);
  }

  resetFilters(): void {
    if (!this.form) return;

    this.form.reset();
    this.filters$.next({});
  }
}
