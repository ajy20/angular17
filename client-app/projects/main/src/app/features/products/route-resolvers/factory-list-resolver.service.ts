import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, mergeMap, Observable, of, take } from 'rxjs';
import { FactoryService } from '../shared/factory.service';
import { Factory } from '../shared/models/factory/factory.model';

@Injectable({
  providedIn: 'root'
})
export class FactoryListResolverService implements Resolve<Factory[]> {

  constructor(private factoryService: FactoryService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Factory[]> | Observable<never> {
    return this.factoryService.getFactories().pipe(
      take(1),
      mergeMap(factoryList => {
        if (factoryList) {
          return of(factoryList);
        } else {
          this.router.navigate(['/home']);
          return EMPTY;
        }
      })
    );
  }
}
