import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product } from './models/product/product.model';
import { memoize } from '../../../shared/memoize/memoize.decorator';
import { BrowserStorageService } from '../../../core/browser-storage/browser-storage.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  // Resource url
  private productUrl = environment.baseUrl + 'products';

  // The local storage key for preferences
  LOCAL_STORAGE_KEY = 'FAVOURITE-PRODUCTS';

  // The list of products
  products$: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>([]);

  // The selected product
  product$: BehaviorSubject<Product | null> = new BehaviorSubject<Product | null>(null);

  constructor(private http: HttpClient, private browserStorageService: BrowserStorageService) { }

  // Get the list of products
  getProducts(): Observable<Product[]> {
    // Retrieve the favourite products
    const favouriteProductIds = this.getFavouriteProductIds();
    return this.sendGetProductsRequest().pipe(
      map(products => products.map(p => ({ ...p, favourite: favouriteProductIds.includes(p.id), defaultPictureUrl: `${this.productUrl}/${p.id}/pictures/default` }))),
      tap(products => { this.products$.next(products); })
    );
  }

  // Get a single product
  getProduct(id: string): Observable<Product> {
    return this.sendGetProductRequest(id).pipe(
      map(product => ({ ...product, defaultPictureUrl: `${this.productUrl}/${product.id}/pictures/default` })),
      tap(product => { this.product$.next(product); })
    );
  }

  // Add style
  addProductStyle(id: string, name: string) {
    const url = `${this.productUrl}/${id}/styles`;
    const payload = { name };
    return this.http.post<string>(url, payload, httpOptions).pipe(tap(x => {
      const product = this.product$.getValue();
      if (product) {
        product.styles.push({ id: x, name: name, modLevels: [] });
        this.product$.next(product);
      }
    }));
  }

  // Rename style
  renameProductStyle(id: string, styleId: string, name: string) {
    const url = `${this.productUrl}/${id}/styles/${styleId}/change-name`;
    const payload = { name };
    return this.http.post(url, payload, httpOptions).pipe(tap(x => {
      const product = this.product$.getValue();
      if (product) {
        const style = product.styles.find(y => y.id === styleId);
        if (style) {
          style.name = name;
          this.product$.next(product);
        }
      }
    }));
  }

  // Delete style
  deleteProductStyle(id: string, styleId: string) {
    const url = `${this.productUrl}/${id}/styles/${styleId}`;
    return this.http.delete<string>(url).pipe(tap(x => {
      const product = this.product$.getValue();
      if (product) {
        const idx = product.styles.findIndex(y => y.id === styleId);
        if (idx > -1) {
          product.styles.splice(idx, 1);
          this.product$.next(product);
        }
      }
    }));
  }

  // Add mod level
  addProductModLevel(id: string, styleId: string, name: string) {
    const url = `${this.productUrl}/${id}/styles/${styleId}/mod-levels`;
    const payload = { name };
    return this.http.post<string>(url, payload, httpOptions).pipe(tap(x => {
      const product = this.product$.getValue();
      const style = product?.styles.find(s => s.id === styleId);

      if (style) {
        style.modLevels.push({ id: x, name: name, styleId });
        this.product$.next(product);
      }
    }));
  }

  // Rename mod level
  renameProductModLevel(id: string, styleId: string, modLevelId: string, name: string) {
    const url = `${this.productUrl}/${id}/styles/${styleId}/mod-levels/${modLevelId}/change-name`;
    const payload = { name };
    return this.http.post(url, payload, httpOptions).pipe(tap(x => {
      const product = this.product$.getValue();
      const style = product?.styles.find(s => s.id === styleId);
      const modLevel = style?.modLevels.find(m => m.id === modLevelId);
      if (modLevel) {
        modLevel.name = name;
        this.product$.next(product);
      }
    }));
  }

  // Delete mod level
  deleteProductModLevel(id: string, styleId: string, modLevelId: string) {
    const url = `${this.productUrl}/${id}/styles/${styleId}/mod-levels/${modLevelId}`;
    return this.http.delete<string>(url).pipe(tap(x => {
      const product = this.product$.getValue();
      const style = product?.styles.find(s => s.id === styleId);
      if (style) {
        const idx = style?.modLevels.findIndex(m => m.id === modLevelId);
        if (idx > -1) {
          style.modLevels.splice(idx, 1);
          this.product$.next(product);
        }
      }
    }));
  }

  // Mark the specified product as a favourite product
  markFavourite(product: Product) {
    // Retrieve the product from the current list of products
    const products = this.products$.getValue();
    const prod = products.find(x => x.id === product.id);

    // Exit if product is not to be found
    if (!prod)
      return;

    // Retrieve the favourite products
    const favouriteProductIds = this.getFavouriteProductIds();

    // Add id to the list
    favouriteProductIds.push(product.id);

    // Store in local storage
    this.browserStorageService.set(this.LOCAL_STORAGE_KEY, JSON.stringify(favouriteProductIds));

    // Update the list of products
    prod.favourite = true;

    // Emit new list of products
    this.products$.next(products);
  }

  // Unmark the specified product from the list of favourite products
  unmarkFavourite(product: Product) {
    // Retrieve the product from the current list of products
    const products = this.products$.getValue();
    const prod = products.find(x => x.id === product.id);

    // Exit if product is not to be found
    if (!prod)
      return;

    // Retrieve the favourite products
    const favouriteProductIds = this.getFavouriteProductIds();

    // Remove the product from the list of favourite products
    const idx = favouriteProductIds.findIndex(x => x === product.id);
    favouriteProductIds.splice(idx, 1);

    // Store in local storage
    this.browserStorageService.set(this.LOCAL_STORAGE_KEY, JSON.stringify(favouriteProductIds));

    // Update the list of products
    prod.favourite = false;

    // Emit new list of products
    this.products$.next(products);
  }

  // Retrieve the list of favourite products from the local storage
  private getFavouriteProductIds(): string[] {
    const pref = JSON.parse(this.browserStorageService.get(this.LOCAL_STORAGE_KEY) || '[]');
    return pref;
  }

  @memoize({ extractUniqueId: (args) => args?.[0], clearCacheTimeout: environment.memoizeTimeOut })
  private sendGetProductsRequest(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productUrl, httpOptions)
  }

  @memoize({ extractUniqueId: (args) => args?.[0], clearCacheTimeout: environment.memoizeTimeOut })
  private sendGetProductRequest(id: string): Observable<Product> {
    const url = `${this.productUrl}/${id}`;
    return this.http.get<Product>(url, httpOptions);
  }
}
