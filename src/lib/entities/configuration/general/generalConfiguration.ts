import BetaFeaturesConfiguration from './betaFeaturesConfiguration';

/**
 * Represents the general extension configuration used during the extension's runtime.
 */
export default class GeneralConfiguration {
  betaFeaturesConfiguration: BetaFeaturesConfiguration =
    new BetaFeaturesConfiguration();
}
