export interface FoodItem {
  // Have to match FoodItemDTO
  // Information of a dish
  id: number;
  itemName?: string;
  itemDescription?: string;
  isVeg?: boolean;
  price?: number;
  restaurantId?: number;
  quantity?: number;
  selectedQty?: number;

}
