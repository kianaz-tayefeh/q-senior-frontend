import { defer, finalize, Observable, Subject } from 'rxjs';

export function prepare<T>(
  callback: () => void
): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>): Observable<T> =>
    defer(() => {
      callback();
      return source;
    });
}

export function indicate<T>(
  indicator: Subject<boolean>
): (source: Observable<T>) => Observable<T> {
  return (source: Observable<T>): Observable<T> =>
    source.pipe(
      prepare(() => {
        console.log('prepare');
        indicator.next(true);
      }),
      finalize(() => {
        console.log('finalize');
        indicator.next(false);
      })
    );
}

function shallowEqual(obj1: any, obj2: any): boolean {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => obj1[key] === obj2[key]);
}

export function paramsEqual(
  a: { filters: any; pagination: any },
  b: { filters: any; pagination: any }
): boolean {
  return (
    shallowEqual(a.filters, b.filters) &&
    shallowEqual(a.pagination, b.pagination)
  );
}
