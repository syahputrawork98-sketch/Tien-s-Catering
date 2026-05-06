import { mockCatalogItems } from './catalog';

export type MockPackage = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  suitableFor: string[];
  features: string[];
};

export const mockPackages: MockPackage[] = mockCatalogItems
  .filter(item => item.type === 'package')
  .map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    basePrice: item.basePrice,
    suitableFor: item.suitableFor || [],
    features: item.features || []
  }));
