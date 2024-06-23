import BetaFeaturesConfiguration from './betaFeaturesConfiguration';
import PathsConfiguration from './pathsConfiguration';

/**
 * Represents the general extension configuration used during the extension's runtime.
 */
export default class GeneralConfiguration {
  pathsConfiguration: PathsConfiguration = new PathsConfiguration();
  betaFeaturesConfiguration: BetaFeaturesConfiguration =
    new BetaFeaturesConfiguration();
}
