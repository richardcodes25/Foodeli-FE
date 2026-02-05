import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../service/order.service';
import { OrderDTO } from '../models/OrderDTO';
import { Title } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session/session.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent {
  /**
   * Things need to prepare for Front-end displaying
   1. total: total price have to pay for order
   2. saveOrder(): When you place an order, the same order should have everything that you have here.
   3. showDialog: a boolean variable: if true, then place order successfully; false, then order fail
      => now showing Successful dialog box
   4. closeDialog(): close successful dialog box
   5. foodItemList: getting from foodCatalogueComponent sends you the complete foodItemList and restaurant details.
    => Get all of them our from route
   */

  orderSummary?: OrderDTO;
  obj: any;
  total: any;
  showDialog: boolean = false;
  private readonly PENDING_ORDER_KEY = 'foodeli_pending_order_v1';


  // route: ActivatedRoute => fetch the complete data and save it to local variable.
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private titleService: Title,
    private authService: AuthService,
    private session: SessionService
  ) { }

  ngOnInit(): void {
    // Set title
    this.titleService.setTitle('Foodeli | Order Summary');

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // console.log(this.route.snapshot);
    const data = this.route.snapshot.queryParams['data'];
    // console.log(data);
    // data consists of foodItemList and restaurant details
    // Parse this data and save in obj variable, set userID as 1, add it to order
    this.obj = JSON.parse(data);
    this.obj.userId = null;
    this.orderSummary = this.obj;

    // Calculate the total of the bill from the restaurant.
    this.total = this.orderSummary.foodItemsList.reduce((accumulator, currentValue) => {
      // For each food in the cart, quantity of food * price of food
      // accumulator is total price so far (tong cho den hien tai)
      return accumulator + (currentValue.quantity * currentValue.price);
    }, 0)
  }

  async saveOrder() {
    // console.log("Order to be placed:", this.orderSummary);
    // this.orderService.saveOrder(this.orderSummary)
    //   .subscribe(
    //     response => {
    //       localStorage.removeItem(this.PENDING_ORDER_KEY);
    //       this.showDialog = true;
    //       // After setting showDialog to be true, the successful dialog box will be shown
    //     },
    //     error => {
    //       console.error("Failed to save data:", error);
    //     }
    //   )

    // const user$ = this.session.user$;
    // const loggedIn  = user$.pipe(map(u => !!u));
    // const loggedIn = this.session.isLoggedIn();
    // console.log("Logged in?", loggedIn);


    if (this.session.isLoggedIn) {
      const userId = this.session.currentUser?.id || null;
      console.log("Current user ID:", userId);
      this.orderSummary!.userId = userId;

      this.orderService.saveOrder(this.orderSummary)
        .subscribe(
          response => {
            localStorage.removeItem(this.PENDING_ORDER_KEY);
            this.showDialog = true;
            // After setting showDialog to be true, the successful dialog box will be shown
          },
          error => {
            console.error("Failed to save data:", error);
          }
        )
      return;
    }

    const result = await Swal.fire({
      title: 'Log in required',
      text: 'Please log in to place your order.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Log in',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: 'rgba(255,255,255,0.10)',
      color: '#f8fafc',
      backdrop: 'rgba(0,0,0,0.55)',
    });

    if (result.isConfirmed) {
      // Save order so user doesn’t lose it
      this.savePendingOrderToLocalStorage();

      // Go to login
      this.router.navigate(['/auth/login'], {
        queryParams: { redirect: 'orderSummary' } // optional
      });
    }
  }

  closeDialog() {
    this.showDialog = false;
    this.router.navigate(['/']); // Back to home page
  }

  goBackToMenu() {
      const restaurantId = this.obj?.restaurant?.id;
      if (!restaurantId) return;

      this.router.navigate(['/food-catalogue', restaurantId]);
    }

    private savePendingOrderToLocalStorage() {
    localStorage.setItem(this.PENDING_ORDER_KEY, JSON.stringify(this.obj));
  }

  private loadPendingOrderFromLocalStorage() {
    const raw = localStorage.getItem(this.PENDING_ORDER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private clearPendingOrderFromLocalStorage() {
    localStorage.removeItem(this.PENDING_ORDER_KEY);
  }



}
