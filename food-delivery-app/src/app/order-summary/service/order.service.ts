import { Injectable } from '@angular/core';
import { API_URL_Order } from '../../constants/url';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = API_URL_Order + '/order/saveOrder';

  constructor(private http: HttpClient) { }

  httpOptions = {
    header: new HttpHeaders({
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': 'http://localhost:4200' // Replace with your Angular app URL
    })
  };

  // Save order to DB
  saveOrder(data: any): Observable<any> {
    console.log("OrderService: Saving order", data);
    return this.http.post<any>(this.apiUrl, data);
  }

  private handleError(error: any) {
    console.error("An error occured:", error);
    return throwError(error.message || error);
  }
}
