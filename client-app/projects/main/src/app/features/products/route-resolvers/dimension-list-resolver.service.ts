import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, mergeMap, Observable, of, take } from 'rxjs';
import { DimensionService } from '../shared/dimension.service';
import { DimensionList } from '../shared/models/dimensions/dimension-list.model';

@Injectable({
  providedIn: 'root'
})
export class DimensionListResolverService implements Resolve<DimensionList> {

  constructor(private dimensionService: DimensionService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<DimensionList> | Observable<never> {
    return this.dimensionService.getDimensions().pipe(
      take(1),
      mergeMap(dimensionList => {
        if (dimensionList) {
          return of(dimensionList);
        } else {
          this.router.navigate(['/home']);
          return EMPTY;
        }
      })
    );
  }
}
