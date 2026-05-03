export function formatEuro(
  amount: number,
  options: Intl.NumberFormatOptions = {}
) {
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: 'EUR',
    ...options,
  }).format(amount);
}
