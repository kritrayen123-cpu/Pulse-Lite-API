import { RuleOperator } from '../rules/rule-operator.enum';

// true only if EVERY value breaks the rule (that's what "in a row" means)
export function isBreached(
  operator: RuleOperator,
  threshold: number,
  values: number[],
): boolean {
  if (values.length === 0) return false;
  return values.every((v) =>
    operator === RuleOperator.GREATER_THAN ? v > threshold : v < threshold,
  );
}