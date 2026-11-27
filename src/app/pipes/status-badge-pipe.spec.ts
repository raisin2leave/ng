import { StatusBadgePipe } from './status-badge-pipe';

describe('StatusBadgePipe', () => {
  it('should give a Bootstrap colour class for each kind of status', () => {
    const pipe = new StatusBadgePipe();
    expect(pipe.transform('new')).toBe('text-bg-primary');
    expect(pipe.transform('preparing')).toBe('text-bg-warning');
    expect(pipe.transform('delivered')).toBe('text-bg-success');
    expect(pipe.transform('cancelled')).toBe('text-bg-secondary');
  });
});
