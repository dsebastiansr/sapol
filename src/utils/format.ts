export function toTitleCaseEs(value: string) {
  return value
    .toLocaleLowerCase("es-EC")
    .split(" ")
    .filter((part) => part.length > 0)
    .map((word) => word[0].toLocaleUpperCase("es-EC") + word.slice(1))
    .join(" ");
}

export function formatDateDDMMYYYY(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "No disponible";
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return "No disponible";
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();
  return `${day}-${month}-${year}`;
}
