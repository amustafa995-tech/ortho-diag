export function calculateAge(
  dateNaissance: string,
  dateReference?: string
): { years: number; months: number; totalMonths: number; display: string } | null {
  if (!dateNaissance) return null;
  const from = new Date(dateNaissance);
  const to = dateReference ? new Date(dateReference) : new Date();
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return null;

  let totalMonths = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) totalMonths--;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const yStr = years > 0 ? `${years}a ` : '';
  const display = `${yStr}${months}m`;

  return { years, months, totalMonths, display };
}

export function calculateAgeYears(
  dateNaissance: string,
  dateReference?: string
): number | null {
  if (!dateNaissance) return null;
  const from = new Date(dateNaissance);
  const to = dateReference ? new Date(dateReference) : new Date();
  if (isNaN(from.getTime()) || isNaN(to.getTime())) return null;
  return (to.getTime() - from.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
}
