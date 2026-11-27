import { DeliveryTimePipe } from './delivery-time-pipe';

describe('DeliveryTimePipe', () => {
  it('should show the delivery time as a range', () => {
    expect(new DeliveryTimePipe().transform({ deliveryTimeMin: 20, deliveryTimeMax: 35 })).toBe('20–35 min');
  });

  it('should show one number when both ends are the same', () => {
    expect(new DeliveryTimePipe().transform({ deliveryTimeMin: 30, deliveryTimeMax: 30 })).toBe('30 min');
  });
});
