import { BetaFeaturesConfiguration } from './beta-features-configuration';

/**
 * Represents the general extension configuration used during the extension's runtime.
 */
export class GeneralConfiguration {
  betaFeaturesConfiguration: BetaFeaturesConfiguration =
    new BetaFeaturesConfiguration();
}
