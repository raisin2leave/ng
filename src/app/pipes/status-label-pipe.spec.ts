import { StatusLabelPipe } from './status-label-pipe';

describe('StatusLabelPipe', () => {
  it('should turn an order status into a Polish label', () => {
    const pipe = new StatusLabelPipe();
    expect(pipe.transform('new')).toBe('Nowe');
    expect(pipe.transform('in-delivery')).toBe('W dostawie');
    expect(pipe.transform('cancelled')).toBe('Anulowane');
  });
});
