type NestedObject = { [key: string]: any };

/**
 * Recursively collects all leaf values from a nested object along with their paths.
 *
 * @param obj - The nested object to collect leaf values from.
 * @param path - The current path being traversed (used internally during recursion).
 * @returns An array of objects, each containing a path (as an array of strings) and a value.
 */
export function collectLeafValues(
  obj: NestedObject,
  path: string[] = []
): { path: string[]; value: any }[] {
  let leaves: { path: string[]; value: any }[] = [];

  for (const key in obj) {
    const value = obj[key];
    const currentPath = [...path, key];

    if (typeof value === 'object' && value !== null) {
      leaves = leaves.concat(collectLeafValues(value, currentPath));
    } else {
      leaves.push({ path: currentPath, value });
    }
  }

  return leaves;
}

/**
 * Reconstructs an object with updated values at specified paths.
 *
 * @param obj - The original nested object.
 * @param updatedLeaves - An array of objects containing the path to the leaf and the new value.
 * @returns A new object with the updated values.
 *
 * @example
 * ```typescript
 * const obj = {
 *   a: {
 *     b: {
 *       c: 1
 *     }
 *   }
 * };
 * const updatedLeaves = [
 *   { path: ['a', 'b', 'c'], value: 2 }
 * ];
 * const result = reconstructObjectWithUpdatedValues(obj, updatedLeaves);
 * // result is { a: { b: { c: 2 } } }
 * ```
 */
export function reconstructObjectWithUpdatedValues(
  obj: NestedObject,
  updatedLeaves: { path: string[]; value: any }[]
): NestedObject {
  let result = { ...obj };

  updatedLeaves.forEach(({ path, value }) => {
    const lastKey = path.pop()!;
    let current = result;

    path.forEach(key => {
      current = current[key];
    });

    current[lastKey] = value;
  });

  return result;
}

