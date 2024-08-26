import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { memoize } from '../../../shared/memoize/memoize.decorator';
import { ProductMenuItem } from './models/menu/product-menu-item.model';

@Injectable({
  providedIn: 'root'
})
export class ProductMenuService {
  private menuUrl = environment.baseUrl + 'menu';

  // The selected product menu items
  productMenuItems$: BehaviorSubject<{ [key: string]: ProductMenuItem[] } | null> = new BehaviorSubject<{ [key: string]: ProductMenuItem[] } | null>(null);

  constructor(private http: HttpClient) { }

  // Get the menu for the selected product
  getMenu(productId: string): Observable<{ [key: string]: ProductMenuItem[] }> {
    return this.sendGetMenuRequest(productId).pipe(
      tap(x => { this.productMenuItems$.next(x); })
    );
  }

  @memoize({ extractUniqueId: (args) => args?.[0], clearCacheTimeout: environment.memoizeTimeOut })
  private sendGetMenuRequest(productId: string): Observable<{ [key: string]: ProductMenuItem[] }> {
    const url = `${this.menuUrl}/products?productId=${productId}`;
    return this.http.get<{ [key: string]: ProductMenuItem[] }>(url);
  }
}
