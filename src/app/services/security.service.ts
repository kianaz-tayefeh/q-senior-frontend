import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Security } from '../models/security';
import { SECURITIES } from '../mocks/securities-mocks';
import { SecuritiesFilter } from '../models/securities-filter';
import { getLocalCache, setLocalCache } from '../helpers/localStorageHelper';
import { CACHE_KEY_PREFIX, CACHE_TIME_TO_LIVE_MS } from '../constants/form';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  /**
   * Get Securities server request mock
   * */
  getSecurities(
    securityFilter?: SecuritiesFilter
  ): Observable<{ data: Security[]; total: number }> {
    const cacheKey = this._createCacheKey(securityFilter);
    const cached = getLocalCache<Security[]>(cacheKey);

    const skip = securityFilter?.skip ?? 0;
    const limit = securityFilter?.limit ?? 100;

    if (cached) {
      const filteredSecurities = cached.slice(skip, skip + limit);
      return of({ data: filteredSecurities, total: cached.length });
    }

    const filtered = this._filterSecurities(securityFilter);
    setLocalCache(cacheKey, filtered, { timeToLiveMs: CACHE_TIME_TO_LIVE_MS });

    const filteredSecurities = filtered.slice(skip, skip + limit);
    return of({ data: filteredSecurities, total: filtered.length }).pipe(
      delay(1000)
    );
  }

  private _filterSecurities(
    securityFilter: SecuritiesFilter | undefined
  ): Security[] {
    if (!securityFilter) return SECURITIES;

    return SECURITIES.filter(
      (s) =>
        (!securityFilter.name || s.name.includes(securityFilter.name)) &&
        (!securityFilter.types ||
          securityFilter.types.some((type) => s.type === type)) &&
        (!securityFilter.currencies ||
          securityFilter.currencies.some(
            (currency) => s.currency == currency
          )) &&
        (securityFilter.isPrivate === undefined ||
          securityFilter.isPrivate === s.isPrivate)
    );
  }

  private _createCacheKey(filter?: SecuritiesFilter): string {
    const cleaned = { ...filter };
    delete cleaned.skip;
    delete cleaned.limit;

    return CACHE_KEY_PREFIX + JSON.stringify(cleaned);
  }
}
