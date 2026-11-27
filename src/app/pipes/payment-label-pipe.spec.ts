import { PaymentLabelPipe } from './payment-label-pipe';

describe('PaymentLabelPipe', () => {
  it('should turn a payment method into a Polish label', () => {
    const pipe = new PaymentLabelPipe();
    expect(pipe.transform('online')).toBe('Płatność online');
    expect(pipe.transform('on-delivery')).toBe('Płatność przy odbiorze');
  });
});
