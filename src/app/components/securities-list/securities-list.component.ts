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
  switchMap,
  tap,
  map,
  distinctUntilChanged,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { indicate, paramsEqual } from '../../utils';
import { Security } from '../../models/security';
import { SecurityService } from '../../services/security.service';
import { FilterableTableComponent } from '../filterable-table/filterable-table.component';
import { AsyncPipe } from '@angular/common';
import { FormInput } from '../../models/form';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { InputComponentsEnum, PAGE_SIZE } from '../../constants/form';
import { PagingFilter, SecuritiesFilter } from '../../models/securities-filter';

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
  private readonly _securityService = inject(SecurityService);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(FilterableTableComponent)
  tableComponent!: FilterableTableComponent<Security>;

  readonly displayedColumns: string[] = ['name', 'type', 'currency'];
  readonly loadingSecurities$ = new BehaviorSubject<boolean>(false);
  readonly totalResults$ = new BehaviorSubject<number>(0);

  private readonly _params$ = new BehaviorSubject<{
    filters: SecuritiesFilter;
    pagination: PagingFilter;
  }>({
    filters: {},
    pagination: { skip: 0, limit: PAGE_SIZE },
  });

  readonly securities$: Observable<Security[]> = this._params$.pipe(
    distinctUntilChanged(paramsEqual),
    switchMap(({ filters, pagination }) =>
      this._securityService
        .getSecurities({
          ...filters,
          skip: pagination.skip * pagination.limit,
          limit: pagination.limit,
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
      debounced: true,
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
      .subscribe((filters) => this.updateFilters(filters));
  }

  updateFilters(newFilters: SecuritiesFilter) {
    const { pagination } = this._params$.value;
    this._params$.next({
      filters: newFilters,
      pagination: { ...pagination, skip: 0 },
    });
  }

  onPageChange(event: PageEvent) {
    const { filters, pagination } = this._params$.value;
    if (
      pagination.skip !== event.pageIndex ||
      pagination.limit !== event.pageSize
    ) {
      this._params$.next({
        filters,
        pagination: {
          skip: event.pageIndex,
          limit: event.pageSize,
        },
      });
    }
  }
}
