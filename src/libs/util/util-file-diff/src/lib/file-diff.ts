import deepDiff, { Diff } from 'deep-diff';

export function diffJsonObjects(
  oldObj: object,
  newObj: object
): deepDiff.Diff<object, object>[] | undefined {
  return deepDiff.diff(oldObj, newObj);
}

export function applyChange(target: any, change: any): void {
  deepDiff.applyChange(target, {}, change);
}

