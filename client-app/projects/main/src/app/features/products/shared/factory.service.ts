import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BrowserStorageService } from '../../../core/browser-storage/browser-storage.service';
import { memoize } from '../../../shared/memoize/memoize.decorator';
import { Factory } from './models/factory/factory.model';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class FactoryService {

  // Resource url
  private factoryUrl = environment.baseUrl + 'factories';

  // The local storage key for preferences
  LOCAL_STORAGE_KEY = 'FAVOURITE-FACTORY';

  // The list of factories
  factories$: BehaviorSubject<Factory[]> = new BehaviorSubject<Factory[]>([]);

  constructor(private http: HttpClient, private browserStorageService: BrowserStorageService) { }

  // Get the list of factories
  getFactories(): Observable<Factory[]> {
    // Retrieve the favourite factory
    const favouriteFactoryId = this.getFavouriteFactoryId();
    return this.sendGetFactoriesRequest().pipe(
      map(factories => factories.map(f => ({ ...f, favourite: favouriteFactoryId === f.id }))),
      tap(factories => { this.factories$.next(factories); })
    );
  }

  // Mark the specified factory as the favourite factory
  markFavourite(factory: Factory) {
    // Retrieve the factory from the current list of factories
    const factories = this.factories$.getValue();
    const fact = factories.find(x => x.id === factory.id);

    // Exit if factory is not to be found
    if (!fact)
      return;

    // Update the favourite factory in local storage
    this.browserStorageService.set(this.LOCAL_STORAGE_KEY, JSON.stringify(fact.id));

    // Update the list of factories
    factories.forEach(x => { x.favourite = false; });
    fact.favourite = true;

    // Emit new list of factories
    this.factories$.next(factories);
  }

  // Clear the favourite factory
  clearFavourite() {
    // Retrieve the factory from the current list of factories
    const factories = this.factories$.getValue();

    // Update the favourite factory in local storage
    this.browserStorageService.set(this.LOCAL_STORAGE_KEY, JSON.stringify(''));

    // Update the list of factories
    factories.forEach(x => { x.favourite = false; });

    // Emit new list of factories
    this.factories$.next(factories);
  }

  // Retrieve the favourite factory from the local storage
  private getFavouriteFactoryId(): string {
    const pref = JSON.parse(this.browserStorageService.get(this.LOCAL_STORAGE_KEY) || '""');
    return pref;
  }

  @memoize({ extractUniqueId: (args) => args?.[0], clearCacheTimeout: environment.memoizeTimeOut })
  private sendGetFactoriesRequest(): Observable<Factory[]> {
    return this.http.get<Factory[]>(this.factoryUrl, httpOptions);
  }
}
