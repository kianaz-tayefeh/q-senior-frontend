import { debounceTime, distinctUntilChanged, Observable } from 'rxjs';

export function createTrigger<T extends unknown[]>(
  inputs: Observable<T>,
  debounce = 0
): Observable<T> {
  return inputs.pipe(debounceTime(debounce), distinctUntilChanged());
}
