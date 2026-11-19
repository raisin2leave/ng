export type DiscountCode = {
  code: string;
  description: string;
  kind: 'percent-off-products' | 'free-delivery' | 'amount-off';
  value: number;
  minimumSubtotal: number;
};

export const discountCodes: DiscountCode[] = [
  {
    code: 'WITAJ10',
    description: '10% zniżki na produkty',
    kind: 'percent-off-products',
    value: 10,
    minimumSubtotal: 0,
  },
  {
    code: 'DARMOWADOSTAWA',
    description: 'darmowa dostawa',
    kind: 'free-delivery',
    value: 0,
    minimumSubtotal: 0,
  },
  {
    code: 'MINUS20',
    description: '20 zł zniżki przy zamówieniu od 80 zł',
    kind: 'amount-off',
    value: 20,
    minimumSubtotal: 80,
  },
];

export function findDiscountCode(text: string) {
  const wanted = text.trim().toUpperCase();

  for (const discount of discountCodes) {
    if (discount.code === wanted) {
      return discount;
    }
  }

  return undefined;
}
