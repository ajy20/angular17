import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, mergeMap, Observable, of, take } from 'rxjs';
import { Product } from '../shared/models/product/product.model';
import { ProductService } from '../shared/product.service';

@Injectable({
  providedIn: 'root'
})
export class ProductListResolverService implements Resolve<Product[]> {

  constructor(private productService: ProductService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Product[]> | Observable<never> {
    return this.productService.getProducts().pipe(
      take(1),
      mergeMap(productList => {
        if (productList) {
          return of(productList);
        } else {
          this.router.navigate(['/home']);
          return EMPTY;
        }
      })
    );
  }
}
