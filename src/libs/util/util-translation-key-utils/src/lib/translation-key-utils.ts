export function extractTranslationKeys(
  text: string,
  translationFunctionNames: string[]
): RegExpExecArray | null {
  const translationCallRegex = new RegExp(
    `(${translationFunctionNames.join('|')})\\s*\\(\\s*['"]([^'"]*)$`,
    's'
  );

  return translationCallRegex.exec(text);
}

export function extractNamespaceFromTranslationKey(
  keyPrefix: string,
  namespaceSeparator: string,
  defaultNamespace: string
): [string, string] {
  if (keyPrefix.includes(namespaceSeparator)) {
    const [namespace, keyWithoutNamespace] =
      keyPrefix.split(namespaceSeparator);
    return [namespace, keyWithoutNamespace];
  } else {
    return [defaultNamespace, keyPrefix];
  }
}
