import { TestBed } from '@angular/core/testing';

import { CartSelectionService } from './cart-selection.service';

describe('CartSelectionService', () => {
  let service: CartSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
