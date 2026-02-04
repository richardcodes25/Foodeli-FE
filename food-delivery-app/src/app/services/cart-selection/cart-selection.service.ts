import { Injectable } from '@angular/core';

type SelectionMap = Record<number, number>; // foodId -> selectedQty
const KEY_PREFIX = 'foodeli_selection_v1:'; // + restaurantId

@Injectable({
  providedIn: 'root'
})
export class CartSelectionService {

  constructor() { }

  private key(restaurantId: number) {
    return `${KEY_PREFIX}${restaurantId}`;
  }

  load(restaurantId: number): SelectionMap {
    try {
      const raw = localStorage.getItem(this.key(restaurantId));
      return raw ? (JSON.parse(raw) as SelectionMap) : {};
    } catch {
      return {};
    }
  }

  save(restaurantId: number, map: SelectionMap) {
    localStorage.setItem(this.key(restaurantId), JSON.stringify(map));
  }

  setQty(restaurantId: number, foodId: number, qty: number) {
    const map = this.load(restaurantId);
    if (qty <= 0) delete map[foodId];
    else map[foodId] = qty;
    this.save(restaurantId, map);
  }

  clear(restaurantId: number) {
    this.save(restaurantId, {});
  }
}
