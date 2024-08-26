import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { FeatureListService } from '../shared/feature-list.service';
import { FeatureRuleSet } from '../shared/models/feature-ruleset.model';

@Injectable({
  providedIn: 'root'
})

export abstract class FeatureListRuleSetResolverService implements Resolve<FeatureRuleSet | null> {

  constructor(private featureListService: FeatureListService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot): Observable<FeatureRuleSet | null> {
    const versionId = route.paramMap.get('versionId') || '';

    return this.featureListService.getRuleSet(versionId).pipe(
      take(1),
      mergeMap(version => {
        return of(version);
      })
    );
  }
}
