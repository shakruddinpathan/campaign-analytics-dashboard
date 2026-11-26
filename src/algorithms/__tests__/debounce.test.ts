import { debounce } from '../debounce';

describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('calls the function once, with the last arguments, after the delay', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);

    debounced('f');
    debounced('fa');
    debounced('fac');
    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('fac');
  });

  it('cancel stops a pending call', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 300);
    debounced();
    debounced.cancel();
    jest.advanceTimersByTime(300);
    expect(fn).not.toHaveBeenCalled();
  });
});
