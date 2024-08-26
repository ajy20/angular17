import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, EMPTY, of } from 'rxjs';
import { take, mergeMap } from 'rxjs/operators';

import { FeatureListService } from '../shared/feature-list.service';
import { FeatureListVersion } from '../shared/models/feature-list-version.model';

@Injectable({
  providedIn: 'root'
})
export class FeatureListVersionResolverService implements Resolve<FeatureListVersion | null> {

  constructor(private featureListService: FeatureListService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<FeatureListVersion | null> | Observable<never> {
    const productId = route.parent?.parent?.parent?.paramMap.get("id") || '';
    const versionId = route.paramMap.get('versionId') || '';

    return this.featureListService.getFeatureListVersion(versionId).pipe(
      take(1),
      mergeMap(version => {
          return of(version);
      })
    );
  }
}
