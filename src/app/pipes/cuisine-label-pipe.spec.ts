import { CuisineLabelPipe } from './cuisine-label-pipe';

describe('CuisineLabelPipe', () => {
  it('should turn a cuisine value into a Polish label', () => {
    const pipe = new CuisineLabelPipe();
    expect(pipe.transform('american')).toBe('Amerykańska');
    expect(pipe.transform('polish')).toBe('Polska');
  });

  it('should show an unknown value as it is', () => {
    expect(new CuisineLabelPipe().transform('fusion')).toBe('fusion');
  });
});
