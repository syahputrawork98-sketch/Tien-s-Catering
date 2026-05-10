export type DevPersonaSeed = {
	code: 'CONSUMER' | 'ADMIN' | 'SUPER_ADMIN';
	label: string;
	description: string;
};

export const devPersonaSeeds: DevPersonaSeed[] = [
	{
		code: 'CONSUMER',
		label: 'Konsumen',
		description: 'Persona untuk simulasi pemesanan menu dan checkout di mode development.'
	},
	{
		code: 'ADMIN',
		label: 'Admin',
		description: 'Persona untuk simulasi operasional menu, stok, dan monitoring pesanan.'
	},
	{
		code: 'SUPER_ADMIN',
		label: 'Super Admin',
		description: 'Persona untuk simulasi kontrol global dan pengaturan bisnis sederhana.'
	}
];
