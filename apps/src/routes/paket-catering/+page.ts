import { mockCatalogPackages } from '$lib/mock/catalog';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
    return {
        packages: mockCatalogPackages.filter((pkg) => pkg.isActive && pkg.isAvailable)
    };
};
