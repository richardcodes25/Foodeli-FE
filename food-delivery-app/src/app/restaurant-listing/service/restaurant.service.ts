import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { API_URL_RL } from '../../constants/url';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {

  // URL to Restaurant Listing Microservice
  private apiURL = API_URL_RL + '/restaurant/fetchAllRestaurants';

  // Inject HttpClient to support API Calling
  constructor(private http: HttpClient) { }

  getAllRestaurants() : Observable<any> {
    return this.http.get<any>(`${API_URL_RL}/restaurant/fetchAllRestaurants`) // Call HTTP get method
      .pipe(
        catchError(this.handleError)
      )
  }

  getRestaurantById(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL_RL}/restaurant/fetchById/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error(`An error occured:`, error);
    return throwError(error.message || error);
  }

}
