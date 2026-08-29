export type Vars = Record<string, string | number>;

/**
 * Replaces {name} placeholders in a translated string from `vars`.
 *
 * Kept free of any store or hook import so it stays a plain function the test
 * runner can load directly. A placeholder with no matching value is left as
 * written rather than blanked, so a missing variable is visible instead of
 * silently leaving a gap in the sentence.
 */
export const interpolate = (template: string, vars?: Vars): string => {
  if (!vars) return template;
  return template.replace(/{(\w+)}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
};
