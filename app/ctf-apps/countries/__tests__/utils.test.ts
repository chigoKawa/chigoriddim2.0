// utils.test.ts
import { chunkArray } from '../utils';

describe('chunkArray', () => {
  it('splits an array into chunks of given size', () => {
    const arr = [1, 2, 3, 4, 5];
    const chunks = chunkArray(arr, 2);
    expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('returns empty array when input is empty', () => {
    expect(chunkArray([], 3)).toEqual([]);
  });
});
