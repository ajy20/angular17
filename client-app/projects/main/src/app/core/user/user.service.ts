import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { BehaviorSubject, filter, Subject, Subscription, takeUntil } from 'rxjs';
import { AuthenticatedUser } from './model/authenticated-user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {
  // Behaviour subject authenticatedUser
  public authenticatedUserSubject$ = new BehaviorSubject<AuthenticatedUser | null>(null);

  // Used for cleaning subscription 
  private subscription!: Subscription;

  // Used for cleaning subscription 
  unsubscribe: Subject<void> = new Subject();

  constructor(private http: HttpClient, private broadcastService: MsalBroadcastService, private msal: MsalService) { }

  // Check if a user is already authenticated
  // Add subscription to msal broadcast service to detect sucessful login
  init() {
    this.msal.handleRedirectObservable().subscribe();

    this.getAuthenticatedUser();

    this.broadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.unsubscribe)
      )
      .subscribe((x) => {
        this.getAuthenticatedUser();
      });
  }

  // Retrieve the authenticated user from the id token
  getAuthenticatedUser() {
    const accounts = this.msal.instance.getAllAccounts();
    if (accounts?.length) {
      const account = accounts[0];
      const user: AuthenticatedUser = {
        id: account.idTokenClaims?.['oid'] as string || '',
        userName: account.username,
        name: account.name || '',
        email: account.idTokenClaims?.['email'] as string ||'',
        givenName: account.idTokenClaims?.['given_name'] as string ||'',
        surname: account.idTokenClaims?.['family_name'] as string ||''
      };
      this.authenticatedUserSubject$.next(user);
    }
  } 

  getUserProfile() {
    const graphMeEndpoint = "https://graph.microsoft.com/v1.0/me";

    this.http.get<AuthenticatedUser>(graphMeEndpoint).subscribe((profile: AuthenticatedUser) => {
      this.authenticatedUserSubject$.next(profile);
    });
  }


  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
