import { BaseVersionComparison } from '../../version-page-template/models/version-comparison.model';
import { FeatureComparison } from './feature-comparison.model';

export interface FeatureListVersionComparison extends BaseVersionComparison {
  featureComparisons: FeatureComparison[];
}
