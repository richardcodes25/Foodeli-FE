import { Component, OnInit } from '@angular/core';
import { Restaurant } from '../../shared/models/restaurant';
import { Router } from '@angular/router';
import { RestaurantService } from '../service/restaurant.service';
import { Title } from '@angular/platform-browser';
import { TimeoutError, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { timeout, catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-restaurant-listing',
  templateUrl: './restaurant-listing.component.html',
  styleUrl: './restaurant-listing.component.css',
})
export class RestaurantListingComponent implements OnInit {
  /**
   * Need to get:
      1. restaurantList: list of all available restaurants.
      2. getRandomImage(): Generate random number of images.
      3. onOrderNowClick(restaurant.id): go to specific restaurant's food catalogue page.
   */

  // In here, in order to avoid having error when defining a variable without initialize value to it:
  //  go to tsconfig.json, add line: "strictPropertyInitialization": false,
  public restaurantList: Restaurant[];

  // For Loading and Error handling
  loading = false;
  serverError = false; // <- use this in your HTML
  errorMessage = ''; // optional: show details
  // private sub?: Subscription;

  // We need 2 services here:
  //  - route: when clicking on OrderNow, forward to foodCatalogue page => need router
  //  - restaurantService: to call to defined services in restaurant.service.ts (getAllRestaurants())
  //  - title: to set page title each time rendering this component
  constructor(
    private router: Router,
    private restaurantService: RestaurantService,
    private titleService: Title
  ) {}

  // When restaurant listing component gets loaded, we need all data to be loaded
  //  => In this method, call to service and get list of all restaurants and populate it here
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getAllRestaurants();
    this.titleService.setTitle('Foodeli | Restaurants');

    // console.log("Restaurant fetched: ", this.restaurantList);
  }

  // Call on ngOnInit
  getAllRestaurants() {
    this.loading = true;
    this.serverError = false;
    this.errorMessage = '';

    // Since the return type of getAllRestaurants() method is Observable => you have to subscribe it
    //  => Subscribe her: for all data that I am getting here on subscription to this method (a GET call to localhost:9091 to RestaurantList MS)
    //    whenever get the data, add it to restaurantList
    this.restaurantService
      .getAllRestaurants()
      .pipe(
        timeout(9000),
        catchError((err: unknown) => {
          const http = err as HttpErrorResponse;
          const isTimeout = err instanceof TimeoutError || (err as any)?.name === 'TimeoutError';
          const isServerDown =
            isTimeout || http?.status === 0 || (http?.status >= 500 && http?.status < 600);

          this.serverError = true;
          if (isServerDown) {                     // <- toggle the flag
            this.errorMessage = isTimeout ? 'Request timed out.' :
            http?.message || 'Network/Server error.';
            return [];
          }

          return throwError(() => err);
        }),
        finalize(() => this.loading = false)
      ).subscribe((data) => {
        // console.log('Restaurant List: ', data);
        this.restaurantList = data.data;
      });
  }

  retry(): void {
    this.getAllRestaurants();
  }

  getRandomImage(): string {
    const imageCount = 9; // Adjust this number based on the number of iamges in your assets folder
    const randomIndex = this.getRandomNumber(1, imageCount);
    return `${randomIndex}.jpg`; // Replace with your image file name pattern
  }

  getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  onOrderNowClick(id: number) {
    // console.log('Order Now clicked for restaurant ID:', id);
    this.router.navigate(['/food-catalogue', id]);
    // this.router.navigate(`${'/food-catalogue/' + id}`);
  }
}
