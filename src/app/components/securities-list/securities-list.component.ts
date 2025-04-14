import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewChild,
  inject,
} from '@angular/core';
import {
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatCell,
  MatCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRowDef,
  MatRow,
  MatNoDataRow,
} from '@angular/material/table';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  switchMap,
  tap,
  map,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { indicate } from '../../utils';
import { Security } from '../../models/security';
import { SecurityService } from '../../services/security.service';
import { FilterableTableComponent } from '../filterable-table/filterable-table.component';
import { AsyncPipe } from '@angular/common';
import { FormInput } from '../../models/form';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { InputComponentsEnum, PAGE_SIZE } from '../../constants/form';
import { createTrigger } from '../../helpers/sequritiesListHelper';

@Component({
  selector: 'securities-list',
  standalone: true,
  imports: [
    FilterableTableComponent,
    AsyncPipe,
    MatPaginatorModule,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatNoDataRow,
    MatRowDef,
    MatRow,
  ],
  templateUrl: './securities-list.component.html',
  styleUrl: './securities-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecuritiesListComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly _securityService = inject(SecurityService);

  @ViewChild(FilterableTableComponent)
  tableComponent!: FilterableTableComponent<Security>;

  readonly displayedColumns: string[] = ['name', 'type', 'currency'];
  readonly loadingSecurities$ = new BehaviorSubject<boolean>(false);
  readonly totalResults$ = new BehaviorSubject<number>(0);

  private readonly _filters$ = new BehaviorSubject<Record<string, any>>({});
  private readonly _pagination$ = new BehaviorSubject({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  private readonly _trigger$ = createTrigger(
    combineLatest([this._filters$, this._pagination$])
  );

  readonly securities$: Observable<Security[]> = this._trigger$.pipe(
    switchMap(([filters, pagination]) =>
      this._securityService
        .getSecurities({
          ...filters,
          skip: pagination.pageIndex * pagination.pageSize,
          limit: pagination.pageSize,
        })
        .pipe(
          indicate(this.loadingSecurities$),
          tap((res) => this.totalResults$.next(res.total)),
          map((res) => res.data)
        )
    ),
    takeUntilDestroyed(this.destroyRef)
  );

  readonly filterFields: FormInput[] = [
    {
      name: 'name',
      label: 'Name',
      component: InputComponentsEnum.Text,
      columns: 2,
      props: { placeholder: 'Search by name' },
    },
    {
      name: 'types',
      label: 'Type',
      component: InputComponentsEnum.Select,
      columns: 2,
      props: {
        options: ['Equity', 'Closed-endFund', 'BankAccount', 'Loan', 'Generic'],
        multiple: true,
      },
    },
    {
      name: 'currencies',
      label: 'Currency',
      component: InputComponentsEnum.Select,
      columns: 2,
      props: { options: ['USD', 'EUR', 'GBP'], multiple: true },
    },
    {
      name: 'isPrivate',
      label: 'Private',
      component: InputComponentsEnum.Checkbox,
      columns: 4,
    },
  ];

  ngAfterViewInit(): void {
    this.tableComponent.filters$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filters: Record<string, any>) => {
        this._filters$.next(filters);
        this._pagination$.next({
          ...this._pagination$.value,
          pageIndex: 0,
        });
      });
  }

  onPageChange(event: PageEvent) {
    this._pagination$.next({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });
  }
}
