
export const debounce = (callback: Function, wait: number) => {
    let timeoutId: number | null = null;
    return (...args: any[]) => 
    {
        if (timeoutId)
            window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
        callback.apply(null, args);
      }, wait);
    };
  }