import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar as faStarEmpty } from '@fortawesome/free-regular-svg-icons';
import { faFileArchive, faSearch, faStar, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { DefaultImageDirective } from '../../../shared/default-image/default-image.directive';
import { PageTemplateComponent } from '../../../shared/page-template/page-template.component';
import { PageWrapperComponent } from '../../../shared/page-wrapper/page-wrapper.component';
import { SecurePipe } from '../../../shared/secure-pipe/secure.pipe';
import { Product } from '../shared/models/product/product.model';
import { ProductService } from '../shared/product.service';

@Component({
  selector: 'csps-products',
  standalone: true,
  imports: [CommonModule, TranslateModule, FontAwesomeModule, RouterModule, SecurePipe, DefaultImageDirective, PageWrapperComponent, PageTemplateComponent],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit, OnDestroy {
  // Icons
  faSearch: IconDefinition = faSearch;
  faStar: IconDefinition = faStar;
  faStarEmpty: IconDefinition = faStarEmpty;
  faFileArchive: IconDefinition = faFileArchive;

  // The list of products
  products!: Product[];

  // The list of products grouped by product type
  productTypes!: { type: string, products: Product[] }[];

  // The list of favourite products
  favouriteProducts!: Product[];

  // Holds filter text
  filterSubject$: Subject<string> = new Subject<string>();

  // Used for cleaning subscription 
  private unsubscribe: Subject<void> = new Subject();

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.productService.products$
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(x => {
        this.products = x;
        this.favouriteProducts = x.filter(y => y.favourite)
        this.filterProducts('');
      });

    this.filterSubject$
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        takeUntil(this.unsubscribe)
      )
      .subscribe(x => this.filterProducts(x));
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  filterProducts(filterText: string) {
    // Prepare filterText
    filterText = (filterText || '').toLowerCase();

    // Build filter predicate
    const predicate = (x: Product) =>
      (x.name || '').toLowerCase().includes(filterText);

    // Filter list of products
    const filteredProducts = this.products.filter(predicate);

    // Group by product type
    this.productTypes = [...filteredProducts.reduce((acc, x) => {
      // Retrieve the product type if it exists, otherwise create it
      const item = acc.get(x.type.name) || { type: x.type.name, products: [] };

      // Add current product as child
      item.products.push(x);

      // Return
      return acc.set(x.type.name, item);
    }, new Map).values()];
  }


  markFavourite(product: Product) {
    this.productService.markFavourite(product);
  }

  unmarkFavourite(product: Product) {
    this.productService.unmarkFavourite(product);
  }
}
