import { BetaFeaturesConfiguration } from './beta-features-configuration';
import { FormatConfiguration } from './format-configuration';

/**
 * Represents the general extension configuration used during the extension's runtime.
 */
export class GeneralConfiguration {
  betaFeaturesConfiguration: BetaFeaturesConfiguration =
    new BetaFeaturesConfiguration();
  format: FormatConfiguration = new FormatConfiguration();
  relativePathToProjectRoot: string = '';
}
