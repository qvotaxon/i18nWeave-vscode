/**
 * Checks if two arrays are equal.
 * @param arr1 - First array.
 * @param arr2 - Second array.
 * @returns boolean - True if arrays are equal, false otherwise.
 */
export function arraysEqual<T>(arr1: T[], arr2: T[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}
