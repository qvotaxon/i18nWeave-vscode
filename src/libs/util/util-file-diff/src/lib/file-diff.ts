import deepDiff, { Diff } from 'deep-diff';

export function diffJsonObjects(
  oldObj: object,
  newObj: object
): deepDiff.Diff<object, object>[] | undefined {
  return deepDiff.diff(oldObj, newObj);
}

export function applyChange(jsonObj: JSON, diffs: Diff<any, any>[]): JSON {
  diffs.forEach(diff => {
    deepDiff.applyChange(jsonObj, {}, diff);
    var test = jsonObj;
  });

  return jsonObj;
}

