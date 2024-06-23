export type I18nextScannerOptions = {
  compatibilityJSON: string;
  debug: boolean;
  removeUnusedKeys: boolean;
  sort: boolean;
  func: {
    list: string[];
    extensions: string[];
  };
  lngs: string[];
  ns: string[];
  defaultLng: string;
  defaultNs: string;
  defaultValue: string;
  resource: {
    loadPath: string;
    savePath: string;
    jsonIndent: number;
    lineEnding: string;
  };
  nsSeparator: string;
  keySeparator: string;
  pluralSeparator: string;
  contextSeparator: string;
  contextDefaultValues: any[];
  interpolation: {
    prefix: string;
    suffix: string;
  };
  metadata: any;
  allowDynamicKeys: boolean;
  trans: {
    component: string;
    i18nKey: string;
    defaultsKey: string;
    extensions: string[];
    fallbackKey: boolean;
    supportBasicHtmlNodes: boolean;
    keepBasicHtmlNodesFor: string[];
    acorn: {
      ecmaVersion: number;
      sourceType: string;
    };
  };
};
