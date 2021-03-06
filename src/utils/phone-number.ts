import { isValidPhoneNumber } from "libphonenumber-js/mobile";

export function containsUKMobileNumber(value: string): boolean {
  return (
    isValidPhoneNumber(value, "GB") && /^([+?44]{2}|[07]{2}).*$/.test(value)
  );
}

export function containsInternationalMobileNumber(value: string): boolean {
  return isValidPhoneNumber(prependInternationalPrefix(value));
}

export function containsLeadingPlusNumbersOrSpacesOnly(value: string): boolean {
  return value ? /^\+?[\d\s]+$/.test(value) : false;
}

export function prependInternationalPrefix(value: string): string {
  return value.startsWith("+") ? value : "+".concat(value);
}

export function lengthInRangeWithoutSpaces(
  value: string,
  min: number,
  max: number
): boolean {
  const length = value.replace(/\s+/g, "").length;
  return length >= min && length <= max;
}
