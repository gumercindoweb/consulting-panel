// Q1 = ene-mar, Q2 = abr-jun, Q3 = jul-sep, Q4 = oct-dic.
export function getQuarterLabel(date: string | Date | null | undefined): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const quarter = Math.floor(d.getMonth() / 3) + 1;
  return `Q${quarter} ${d.getFullYear()}`;
}

// Si la etapa arranca y termina en el mismo trimestre (o no tiene fecha de
// fin), muestra un solo Q. Si cruza trimestres, muestra el rango completo
// (ej. "Q4 2025 → Q2 2026") — siempre calculado a partir de las fechas
// reales, nunca fijo por cliente.
export function getQuarterRangeLabel(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): string | null {
  const start = getQuarterLabel(startDate);
  const end = getQuarterLabel(endDate);
  if (!start) return null;
  if (!end || end === start) return start;
  return `${start} → ${end}`;
}
