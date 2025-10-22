export type ParsedDate = {
  year: number;
  month: number;
  day: number;
};

/**
 * Parses a hex color string in #YYMMDD format into its date components.
 * The hex components are treated as decimal numbers.
 * @param hex The hex color string (e.g., "#241225").
 * @returns A ParsedDate object or null if the format is invalid.
 */
export function parseHexToDate(hex: string): ParsedDate | null {
  const match = hex.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/);
  if (!match) {
    return null;
  }

  const [, yyHex, mmHex, ddHex] = match;

  const yy = parseInt(yyHex, 10);
  const mm = parseInt(mmHex, 10);
  const dd = parseInt(ddHex, 10);

  if (isNaN(yy) || isNaN(mm) || isNaN(dd)) {
    // This can happen if the hex string contains non-numeric decimal characters
    // e.g. #ab1010, parseInt('ab', 10) is NaN
    return null;
  }

  return { year: yy, month: mm, day: dd };
}

/**
 * Validates a parsed date.
 * @param parsedDate The object with year, month, and day.
 * @param currentYearDigits The last two digits of the current year.
 * @returns False if invalid, or a ParsedDate object with the full year if valid.
 */
export function isDateValid(
  parsedDate: ParsedDate,
  currentYearDigits: number
): (ParsedDate & { fullYear: number }) | false {
  const { year: yy, month: mm, day: dd } = parsedDate;

  if (mm < 1 || mm > 12) {
    return false;
  }

  // If the 2-digit year is within 30 years in the future, it's 20xx. Otherwise it's 19xx.
  // This handles the turn of the century appropriately.
  const futureYearThreshold = (currentYearDigits + 30) % 100;

  let fullYear: number;
  if (currentYearDigits < 70) {
    // e.g. current year is 2024. currentYearDigits is 24.
    // futureYearThreshold is 54.
    // if yy is 40 (2040), 40 <= 54 is true. fullYear is 2040.
    // if yy is 60 (1960), 60 <= 54 is false. fullYear is 1960.
    fullYear = yy <= futureYearThreshold ? 2000 + yy : 1900 + yy;
  } else {
    // e.g. current year is 1995. currentYearDigits is 95.
    // futureYearThreshold is 25 ( (95+30) % 100 ).
    // if yy is 10 (2010), 10 <= 25 is true. fullYear is 2010.
    // if yy is 98 (1998), 98 <= 25 is false. But 98 > 95, so it's an edge case.
    // if yy is between futureYearThreshold and currentYearDigits, it is 19xx
    if (yy <= futureYearThreshold || yy > currentYearDigits) {
      fullYear = 2000 + yy;
    } else {
      fullYear = 1900 + yy;
    }
  }


  const daysInMonth = new Date(fullYear, mm, 0).getDate();
  if (dd < 1 || dd > daysInMonth) {
    return false;
  }

  return { year: yy, month: mm, day: dd, fullYear };
}
