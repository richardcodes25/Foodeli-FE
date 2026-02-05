import { Component } from '@angular/core';
import { FooditemService } from '../service/fooditem.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodCatalogue } from '../../shared/models/FoodCatalogue';
import { FoodItem } from '../../shared/models/FoodItem';
import { Title } from '@angular/platform-browser';

import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError, throwError, of } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { RestaurantService } from '../../restaurant-listing/service/restaurant.service';
import { CartSelectionService } from '../../services/cart-selection/cart-selection.service';

@Component({
  selector: 'app-food-catalogue',
  templateUrl: './food-catalogue.component.html',
  styleUrl: './food-catalogue.component.css'
})
export class FoodCatalogueComponent {
  /**
   * Things need to create and get from BE support FE:
   1. onCheckOut() function: Handle function when "Check out" button is clicked
    => navigate to view summary order service page and show list of food items
   2. foodItemResponse: Get restaurant details and FoodItem of that particular restaurant by ID,
    given by (/food-catalogue, id from "Order Now" button of the Restaurant Listing Page)
    Contains of:
    - restaurant details: Restaurant
    - Menu of the restaurant: FoodCatalogue = FoodItem[]
   3. decrement(food) function: Minus quantity of chosen food by 1 => food.quantity --
   4. increment(food) function: Increase quantity of chosen food by 1 => food.quantity ++
   */

  restaurantId: number;
  foodItemResponse: FoodCatalogue = {
    foodItemsList: [],
    restaurant: null
  };

  // List of all dishes we added to the cart (chosen dishes)
  foodItemCart: FoodItem[] = [];
  orderSummary: FoodCatalogue;

  loading = false;
  serverError = false; // <- use this in your HTML
  errorMessage = ''; // optional: show details

  loadingRestaurant = false;
  loadingFoodItems = false;

  serverErrorRestaurant = false;
  serverErrorFoodItems = false;

  errorMessageRestaurant = '';
  errorMessageFoodItems = '';


  // Inject Food Item Service Layer
  // router: to router to Order service page (Order Summary page)
  // route: fetch ID from activatedRoute =>Whoever call you, you will be using the activated route,
  //   which is going to provide you information from where you have been getting routed
  //   Use to get id from function of onOrderNowClicked(): this.router.navigate(['/food-catalogue', id]);
  constructor(
    private foodItemService: FooditemService,
    private restaurantService: RestaurantService,
    private cartSelectionService: CartSelectionService,
    private router:Router,
    private route: ActivatedRoute,
    private titleService: Title
  ) { }

  // Therer are 2 tasks to do: get ID and get all restaurant and foodItem list using this service
  ngOnInit(): void {
    // Set title
    this.titleService.setTitle('Foodeli | Menu');

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.route.paramMap.subscribe(params => {
      // Since type of params.get('id') is string | null => adding if else to make sure that type of it is not null
      //  (type string | null can not assign to type string) => paramID not null => convert to integer (+paramID)
      const paramID = params.get('id');
      if (!paramID) return;

      // if (paramID != null) {
      //   this.restaurantId = +paramID;
      // }

      this.restaurantId = +paramID;
      // console.log("Fetched restaurant ID from route: ", this.restaurantId);
    });

    this.getFoodItemsFromRestaurantID(this.restaurantId);
    this.getRestaurantByRestaurantID(this.restaurantId);
  }

  getFoodItemsFromRestaurantID(restaurantId: number) {
    this.loadingFoodItems = true;
    this.serverErrorFoodItems = false;
    this.errorMessageFoodItems = '';

    // console.log("Fetching food items for restaurant ID: ", restaurantId);

    this.foodItemService.getFoodItemsByRestaurantId(restaurantId)
      .pipe(
        timeout(9000),
        catchError((err: unknown) => {
          const http = err as HttpErrorResponse;
          const isTimeout = err instanceof TimeoutError || (err as any)?.name === 'TimeoutError';
          const isServerDown =
            isTimeout || http?.status === 0 || (http?.status >= 500 && http?.status < 600);

          this.serverErrorFoodItems = true;
          if (isServerDown) {                     // <- toggle the flag
            this.errorMessageFoodItems = isTimeout ? 'Request timed out.' :
            http?.message || 'Network/Server error.';
            return [];
          }

          return throwError(() => err);
        }),
        finalize(() => this.loadingFoodItems = false)
      ).subscribe((data) => {
        // console.log("Getting restaurant and food item list by restaurant ID successful", data.foodItemsList);
        // this.foodItemResponse.foodItemsList = data.foodItemsList;
          const map = this.cartSelectionService.load(this.restaurantId);

          this.foodItemResponse.foodItemsList = (data.foodItemsList ?? []).map((f: any) => ({
            ...f,
            selectedQty: map[f.id] ?? 0
          }));

          this.rebuildCartFromSelections();
        // console.log("Food Item Response after fetching restaurant", this.foodItemResponse);
      }
    );
  }

  getRestaurantByRestaurantID(restaurantId: number) {
    this.loadingRestaurant = true;
    this.serverErrorRestaurant = false;
    this.errorMessageRestaurant = '';

    this.restaurantService.getRestaurantById(restaurantId)
      .pipe(
        timeout(5000),
        catchError((err: unknown) => {
          const http = err as HttpErrorResponse;
          const isTimeout = err instanceof TimeoutError || (err as any)?.name === 'TimeoutError';
          const isServerDown =
            isTimeout || http?.status === 0 || (http?.status >= 500 && http?.status < 600);

          if (isServerDown) {
            this.serverErrorRestaurant = true;
            this.errorMessageRestaurant = isTimeout
              ? 'Restaurant request timed out.'
              : (http?.message || 'Network/Server error while loading restaurant.');

            // ✅ fallback observable
            return of({ data: null } as any);
          }

          return throwError(() => err);
        }),
        finalize(() => (this.loadingRestaurant = false))
      )
      .subscribe((data) => {
        // console.log("Getting restaurant details by restaurant ID successful", data.data);
        this.foodItemResponse.restaurant = data.data;
        // console.log("Food Item Response after fetching restaurant", this.foodItemResponse);
      });
  }

  onCheckOut() {
    // this.router.navigate(['/order', this.restaurantId]);

    // On checkout, we need to send the complete list of foodItem that we have incremented or decremented added to the food cart
    //  We also need to send restaurant Details to order service
    this.foodItemCart;
    this.orderSummary = {
      foodItemsList: [],
      restaurant: null
    }

    this.orderSummary.foodItemsList = this.foodItemCart;
    if (this.foodItemResponse.restaurant != null) this.orderSummary.restaurant = this.foodItemResponse.restaurant;
    console.log("The Order to checkout", JSON.stringify(this.orderSummary));
    this.router.navigate(['/orderSummary'], { queryParams: { data: JSON.stringify(this.orderSummary) } });
  }

  clearCart() {
    this.cartSelectionService.clear(this.restaurantId);

    this.foodItemResponse?.foodItemsList?.forEach((f: any) => (f.selectedQty = 0));
    this.foodItemCart = [];
  }


  increment(food: any) {
    food.selectedQty = (food.selectedQty ?? 0) + 1;

    this.cartSelectionService.setQty(this.restaurantId, food.id, food.selectedQty);
    this.rebuildCartFromSelections();
  }

  decrement(food: any) {
    food.selectedQty = Math.max(0, (food.selectedQty ?? 0) - 1);

    this.cartSelectionService.setQty(this.restaurantId, food.id, food.selectedQty);
    this.rebuildCartFromSelections();
  }

  private rebuildCartFromSelections() {
    const items = this.foodItemResponse?.foodItemsList ?? [];

    this.foodItemCart = items
      .filter((f: any) => (f.selectedQty ?? 0) > 0)
      .map((f: any) => ({
        ...f,
        quantity: f.selectedQty // checkout expects `quantity` as chosen amount
      }));
  }


}
