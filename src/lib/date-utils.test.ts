import {
  parseHexToDate,
  isDateValid,
  type ParsedDate,
} from './date-utils';

describe('Date Utilities', () => {
  describe('parseHexToDate', () => {
    it('should parse valid hex codes correctly', () => {
      // Test case from user: #101004 -> 2010-10-04
      expect(parseHexToDate('#101004')).toEqual({
        year: 10,
        month: 10,
        day: 4,
      });

      // Test case from user: #700101 -> 1970-01-01
      expect(parseHexToDate('#700101')).toEqual({ year: 70, month: 1, day: 1 });

      // Test case from user: #250101 -> 2025-01-01
      expect(parseHexToDate('#250101')).toEqual({ year: 25, month: 1, day: 1 });

      // Test case from user: #260404 -> 2026-04-04
      expect(parseHexToDate('#260404')).toEqual({ year: 26, month: 4, day: 4 });

      // Another test case for a 20th century date
      expect(parseHexToDate('#991231')).toEqual({
        year: 99,
        month: 12,
        day: 31,
      });

      // Test case for a 21st century date
      expect(parseHexToDate('#000101')).toEqual({ year: 0, month: 1, day: 1 });
    });

    it('should return null for invalid hex codes', () => {
      expect(parseHexToDate('#123')).toBeNull();
      expect(parseHexToDate('not a hex')).toBeNull();
      expect(parseHexToDate('#GGHHII')).toBeNull();
    });
  });

  describe('isDateValid', () => {
    const currentYear = new Date().getFullYear();
    const currentYearDigits = currentYear % 100;

    it('should return true for valid dates', () => {
      expect(isDateValid({ year: 24, month: 2, day: 29 }, currentYearDigits)).toBe(
        true
      ); // Leap year
      expect(isDateValid({ year: 23, month: 2, day: 28 }, currentYearDigits)).toBe(
        true
      );
      expect(isDateValid({ year: 99, month: 12, day: 31 }, currentYearDigits)).toBe(
        true
      );
      expect(isDateValid({ year: 70, month: 1, day: 1 }, currentYearDigits)).toBe(
        true
      );
    });

    it('should return false for invalid months', () => {
      expect(isDateValid({ year: 24, month: 0, day: 1 }, currentYearDigits)).toBe(
        false
      );
      expect(isDateValid({ year: 24, month: 13, day: 1 }, currentYearDigits)).toBe(
        false
      );
    });

    it('should return false for invalid days', () => {
      expect(isDateValid({ year: 24, month: 4, day: 31 }, currentYearDigits)).toBe(
        false
      ); // April has 30 days
      expect(isDateValid({ year: 23, month: 2, day: 29 }, currentYearDigits)).toBe(
        false
      ); // 2023 is not a leap year
    });

    it('should handle fullYear correctly', () => {
      const parsedDate20 = { year: 20, month: 1, day: 1 };
      const parsedDate90 = { year: 90, month: 1, day: 1 };
      
      const { fullYear: fullYear20 } = isDateValid(parsedDate20, currentYearDigits) as ParsedDate & { fullYear: number };
      const { fullYear: fullYear90 } = isDateValid(parsedDate90, currentYearDigits) as ParsedDate & { fullYear: number };

      if (currentYearDigits >= 20) {
        expect(fullYear20).toBe(2020);
      } else {
        expect(fullYear20).toBe(1920);
      }

      if (currentYearDigits >= 90) {
        expect(fullYear90).toBe(2090);
      } else {
        expect(fullYear90).toBe(1990);
      }
    });
  });
});
