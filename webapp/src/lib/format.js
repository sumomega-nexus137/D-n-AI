const nf = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export const kzt = (value) => (value == null ? "—" : `${nf.format(Math.round(value))} ₸`);

export const pct = (value) => `${value.toFixed(1).replace(".", ",")}%`;

export const plural = (n, one, few, many) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

export const grains = (n) => `${nf.format(n)} ${plural(n, "зерно", "зерна", "зёрен")}`;
