export const compare =
  <T>(
    key: keyof T,
    order: 'asc' | 'desc',
    onEqual?: (lhs: T, rhs: T) => number
  ): ((lhs: T, rhs: T) => number) =>
    (lhs: T, rhs: T) => {
      const direction = order === 'asc' ? 1 : -1;
      if (lhs[key] > rhs[key]) {
        return direction;
      } else if (lhs[key] < rhs[key]) {
        return -direction;
      }
      return onEqual !== undefined ? onEqual(lhs, rhs) : 0;
    };
