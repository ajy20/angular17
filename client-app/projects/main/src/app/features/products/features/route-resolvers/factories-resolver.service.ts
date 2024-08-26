import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, EMPTY, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';

import { FeatureListService } from '../shared/feature-list.service';
import { FeatureFactoryList } from '../shared/models/feature-factory-list.model';

@Injectable({
  providedIn: 'root'
})
export class FactoriesResolverService implements Resolve<FeatureFactoryList | null> {

  constructor(private featureListService: FeatureListService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FeatureFactoryList | null> | Observable<never> {
    const versionId = route.paramMap.get('versionId') || '';

    return this.featureListService.getFactories(versionId).pipe(
      take(1),
      mergeMap(factories => {
          return of(factories);
      })
    );
  }
}
