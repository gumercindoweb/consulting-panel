// Q1 = ene-mar, Q2 = abr-jun, Q3 = jul-sep, Q4 = oct-dic.
export function getQuarterLabel(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const quarter = Math.floor(d.getMonth() / 3) + 1;
  return `Q${quarter} ${d.getFullYear()}`;
}
