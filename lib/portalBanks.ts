export const PORTAL_BANKS = [
  {
    value: 'BCA',
    label: 'Bank BCA',
    logo: '/bank-logos/bca.svg',
    aliases: ['bca', 'bank bca', 'bank central asia'],
  },
  {
    value: 'Mandiri',
    label: 'Bank Mandiri',
    logo: '/bank-logos/mandiri.svg',
    aliases: ['mandiri', 'bank mandiri'],
  },
  {
    value: 'BNI',
    label: 'Bank BNI',
    logo: '/bank-logos/bni.svg',
    aliases: ['bni', 'bank bni', 'bank negara indonesia'],
  },
  {
    value: 'BRI',
    label: 'Bank BRI',
    logo: '/bank-logos/bri.svg',
    aliases: ['bri', 'bank bri', 'bank rakyat indonesia'],
  },
] as const;

export type PortalBankCode = typeof PORTAL_BANKS[number]['value'];

export function findPortalBank(bankName: string | null | undefined) {
  const normalizedName = bankName?.trim().toLowerCase();
  return PORTAL_BANKS.find((bank) => bank.aliases.some((alias) => alias === normalizedName)) ?? null;
}
