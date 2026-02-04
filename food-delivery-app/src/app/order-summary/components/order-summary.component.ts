import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../service/order.service';
import { OrderDTO } from '../models/OrderDTO';
import { Title } from '@angular/platform-browser';

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

  // route: ActivatedRoute => fetch the complete data and save it to local variable.
  constructor(private route: ActivatedRoute, private router: Router, private orderService: OrderService, private titleService: Title) { }

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
    this.obj.userId = 1;
    this.orderSummary = this.obj;

    // Calculate the total of the bill from the restaurant.
    this.total = this.orderSummary.foodItemsList.reduce((accumulator, currentValue) => {
      // For each food in the cart, quantity of food * price of food
      // accumulator is total price so far (tong cho den hien tai)
      return accumulator + (currentValue.quantity * currentValue.price);
    }, 0)
  }

  saveOrder() {
    this.orderService.saveOrder(this.orderSummary)
      .subscribe(
        response => {
          this.showDialog = true;
          // After setting showDialog to be true, the successful dialog box will be shown
        },
        error => {
          console.error("Failed to save data:", error);
        }
      )
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


}
