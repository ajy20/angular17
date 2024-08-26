import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { memoize } from '../../../shared/memoize/memoize.decorator';
import { DimensionList } from './models/dimensions/dimension-list.model';
import { Dimension } from './models/dimensions/dimension.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class DimensionService {
  // Resource url
  private dimensionUrl = environment.baseUrl + 'dimensions';

  // The list of dimensions
  dimensions$: BehaviorSubject<Dimension[]> = new BehaviorSubject<Dimension[]>([]);

  constructor(private http: HttpClient) { }

  // Get the list of dimensions
  getDimensions(): Observable<DimensionList> {
    return this.sendGetDimensionsRequest().pipe(
      tap(list => { this.dimensions$.next(list?.dimensions); })
    );
  }

  @memoize({ extractUniqueId: (args) => args?.[0], clearCacheTimeout: environment.memoizeTimeOut })
  private sendGetDimensionsRequest(): Observable<DimensionList> {
    return this.http.get<DimensionList>(this.dimensionUrl, httpOptions);
  }
}
