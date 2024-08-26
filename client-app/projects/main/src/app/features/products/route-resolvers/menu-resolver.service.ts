import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, mergeMap, Observable, of, take } from 'rxjs';
import { ProductMenuItem } from '../shared/models/menu/product-menu-item.model';
import { ProductMenuService } from '../shared/product-menu.service';

@Injectable({
  providedIn: 'root'
})
export class MenuResolverService implements Resolve<{ [key: string]: ProductMenuItem[] } | null> {

  constructor(private menuService: ProductMenuService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ [key: string]: ProductMenuItem[] } | null> {
    const id = route.paramMap.get('id') || '';
    return this.menuService.getMenu(id).pipe(
      take(1),
      mergeMap(menu => {
        if (menu) {
          return of(menu);
        } else {
          this.router.navigate(['/home']);
          return EMPTY;
        }
      })
    );
  }
}
