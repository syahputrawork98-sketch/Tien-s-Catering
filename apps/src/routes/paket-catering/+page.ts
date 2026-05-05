import { mockPackages } from '$lib/mock/packages';
import type { PageLoad } from './$types';

export const load: PageLoad = () => {
    return {
        packages: mockPackages
    };
};
