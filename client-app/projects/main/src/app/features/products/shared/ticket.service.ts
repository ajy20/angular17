import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TicketList } from './models/ticket/ticket-list.model';
import { Ticket } from './models/ticket/ticket.model';
import { TicketValidation } from './models/ticket/ticket-validation.model';
import { TicketValidationReport } from './models/ticket/ticket-validation-report.model';
import { TicketDocumentVersion } from './models/ticket/ticket-document-version.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  // Resource url
  private ticketUrl = environment.baseUrl + 'product-tickets';

  // An observable representing the list of tickets for the currently selected product
  ticketList$: BehaviorSubject<TicketList | undefined> = new BehaviorSubject<TicketList | undefined>(undefined);

  // Selected Ticket
  ticket$: BehaviorSubject<Ticket | null> = new BehaviorSubject<Ticket | null>(null);

  // Latest Validation
  ticketValidation$: BehaviorSubject<TicketValidation | null> = new BehaviorSubject<TicketValidation | null>(null);

  // Latest Validation Report
  ticketValidationReport$: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null);

  constructor(private http: HttpClient) { }

  // Get the list of tickets by product
  getTicketList(productId?: string): Observable<TicketList> {
    const url = !!productId ? `${this.ticketUrl}?productId=${productId}` : `${this.ticketUrl}`;
    return this.http.get<TicketList>(url).pipe(
      map(list => ({ ...list, productId: productId || '' })),
      tap(list => { this.ticketList$.next(list); })
    );
  }

  // Get a ticket
  getTicket(ticketId: string): Observable<Ticket> {
    const url = `${this.ticketUrl}/${ticketId}`;
    return this.http.get<Ticket>(url).pipe(tap(x => {
      this.ticket$.next(x);
    }));
  }

  // Get a ticket lite
  getTicketLite(ticketId: string): Observable<Ticket> {
    const url = `${this.ticketUrl}/${ticketId}/lite`;
    return this.http.get<Ticket>(url).pipe(tap(x => {
      this.ticket$.next(x);
    }));
  }

  // Create a ticket
  createTicket(productId: string, title: string, description: string, category: string, ecn: string): Observable<any> {
    const payload = { productId, title, description, category, ecn };
    return this.http.post<string>(this.ticketUrl, payload).pipe(tap(id => {
      const ticketList = this.ticketList$.getValue();
      if (ticketList) {
        ticketList.tickets.push({ id, productId, title, description, category, released: false, validationId: '', createdOn: new Date(), releaseDate: null, ecn });
        this.ticketList$.next(ticketList);
      }
    })
    );
  }

  updateTicketDetails(ticketId: string, title: string, description: string, category: string, ecn: string): Observable<any> {
    const url = `${this.ticketUrl}/${ticketId}/update`;
    const payload = { title, description, category, ecn };
    return this.http.post<TicketList>(url, payload).pipe(tap(id => {
      const ticketList = this.ticketList$.getValue();
      if (ticketList) {
        var ticket = ticketList.tickets.find(t => t.id === ticketId);
        if (ticket) {
          ticket.title = title;
          ticket.description = description;
          ticket.category = category;
          ticket.ecn = ecn;

          this.ticketList$.next(ticketList);
        }
      }
    })
    );
  }

  validateTicket(ticketId: string): Observable<string> {
    const url = `${this.ticketUrl}/${ticketId}/validate`;
    const payload = {};
    return this.http.post<string>(url, payload).pipe(tap(id => {
      const ticket = this.ticket$.getValue();
      if (ticket)
        ticket.validationId = id;
      this.ticket$.next(ticket);
    }));
  }

  getValidationProcess(ticketId: string, validationId: string | undefined): Observable<any[]> {
    const url = `${this.ticketUrl}/${ticketId}/validations/${validationId}`;

    const observables = [
      this.http.get<TicketValidation>(url),
      this.getValidationProcessReport(ticketId, validationId)
    ];

    return combineLatest(...observables).pipe(
      tap(([validation, validationReport]) => {
        this.ticketValidation$.next(validation as TicketValidation);
        this.ticketValidationReport$.next(validationReport);
      }));
  }

  getValidationProcessReport(ticketId: string, validationId: string | undefined): Observable<TicketValidationReport> {
    const url = `${this.ticketUrl}/${ticketId}/validations/${validationId}/report`;
    return this.http.get<TicketValidationReport>(url).pipe(tap(report => {
      this.ticketValidationReport$.next(report);
    }));
  }

  // Release a ticket
  releaseTicket(ticketId: string): Observable<any> {
    const url = `${this.ticketUrl}/${ticketId}/release`;
    const payload = {};
    return this.http.post<TicketList>(url, payload).pipe(tap(id => {
      const ticketList = this.ticketList$.getValue();
      if (ticketList) {
        var ticket = ticketList.tickets.find(t => t.id === ticketId);
        // ticket.released = true;
        this.ticketList$.next(ticketList);
      }
    }));
  }

  getNestedDocuments(ticketId: string, documentId: string, versionId: string, documentType: string): Observable<TicketDocumentVersion[]> {
    const url = `${this.ticketUrl}/${ticketId}/documents/${documentId}/nested-documents`;
    const payload = { versionId, documentType };
    return this.http.post<TicketDocumentVersion[]>(url, payload).pipe(tap(nestedDocuments => {
      if (nestedDocuments.length) {
        const ticket = this.ticket$.getValue();
        if (ticket) {
          const document = ticket.documentVersions.find(x => x.documentId == documentId);
          if (document) {
            document.nestedVersions = nestedDocuments;
            this.ticket$.next(ticket);
          }
        }
      }
    }));
  }
}
