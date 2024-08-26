import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, EMPTY, of } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { FeatureListService } from '../shared/feature-list.service';
import { BaseDocument } from '../../shared/components/version-page-template/models/document.model';

@Injectable({
  providedIn: 'root'
})
export class FeatureListDocumentResolverService implements Resolve<BaseDocument> {

  constructor(private featureListService: FeatureListService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<BaseDocument> | Observable<never> {
    const productId = route.parent?.parent?.paramMap.get("id") || '';

    return this.featureListService.getFeatureListDocumentByProductId(productId).pipe(
      take(1),
      mergeMap(document => {
        if (document) {
          return of(document);
        } else {
          this.router.navigate(['/products', productId]);
          return EMPTY;
        }
      })
    );
  }
}
