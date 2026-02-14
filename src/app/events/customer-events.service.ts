import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CustomerEvents } from './models/customer-events.interface';
import { CustomerEvent } from './models/customer-event.interface';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class CustomerEventsService {
  private readonly url = environment.eventsUrl;
  private readonly http = inject(HttpClient);

  public getEvents(): Observable<Array<CustomerEvent>> {
    return this.http.get<CustomerEvents>(this.url).pipe(
        map((response: CustomerEvents) => response.events)
      );
  }
}
