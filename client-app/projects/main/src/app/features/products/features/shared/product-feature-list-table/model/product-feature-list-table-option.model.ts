export interface ProductFeatureListTableOption {
  id: string;
  name: string;
  description: string;
  rank: string;
  isActive: boolean;
  releases: {
    factoryId: string,
    asSQ: boolean,
    sqRules?: { rules: string[][] },
    unavailableRules?: { rules: string[][] },
    contractRules?: { rules: string[][] }
  }[];
  isAutoGenerated: boolean;
  featureId?: string
}
