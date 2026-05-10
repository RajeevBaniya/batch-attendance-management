const escapeCsvCell = (value: string) => {
  const normalizedValue = value.replace(/"/g, "\"\"");
  if (/[",\n]/.test(normalizedValue)) {
    return `"${normalizedValue}"`;
  }
  return normalizedValue;
};

const toCsv = (headers: string[], rows: Array<Record<string, string>>) => {
  const headerLine = headers.map((header) => escapeCsvCell(header)).join(",");
  const rowLines = rows.map((row) => {
    return headers.map((header) => escapeCsvCell(row[header] ?? "")).join(",");
  });

  return [headerLine, ...rowLines].join("\n");
};

export { toCsv };
