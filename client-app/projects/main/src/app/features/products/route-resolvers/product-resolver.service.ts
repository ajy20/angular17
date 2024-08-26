import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, mergeMap, Observable, of, take } from 'rxjs';
import { Product } from '../shared/models/product/product.model';
import { ProductService } from '../shared/product.service';

@Injectable({
  providedIn: 'root'
})
export class ProductResolverService implements Resolve<Product> {

  constructor(private productService: ProductService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Product> | Observable<never> {
    const id = route.paramMap.get('id') || '';
    return this.productService.getProduct(id).pipe(
      take(1),
      mergeMap(product => {
        if (product) {
          return of(product);
        } else {
          this.router.navigate(['/home']);
          return EMPTY;
        }
      })
    );
  }
}

