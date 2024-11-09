import deepDiff from 'deep-diff';

export function diffJsonObjects(
  oldObj: object,
  newObj: object
): { additions: any[]; deletions: any[]; updates: any[] } {
  const differences = deepDiff.diff(oldObj, newObj);

  const additions = differences?.filter(d => d.kind === 'N') || [];
  const deletions = differences?.filter(d => d.kind === 'D') || [];
  const updates = differences?.filter(d => d.kind === 'E') || [];

  return {
    additions,
    deletions,
    updates,
  };
}
