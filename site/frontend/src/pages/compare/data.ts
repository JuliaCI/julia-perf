import {BenchmarkFilter, StatComparison} from "./types";

export interface Summary {
  count: number;
  geomean: number;
  median: number;
  range: Array<number>;
}

export interface SummaryGroup {
  improvements: Summary;
  regressions: Summary;
  all: Summary;
}

export interface TestCaseComparison<Case> {
  test_case: Case;
  comparison: StatComparison;
  percent: number;
}

export function filterNonRelevant<Case>(
  filter: BenchmarkFilter,
  cases: TestCaseComparison<Case>[]
): TestCaseComparison<Case>[] {
  if (filter.nonRelevant) {
    return cases;
  }
  if (filter.name) {
    return cases.filter((c) => c.comparison.is_relevant);
  } else {
    if (!window.__NON_RELEVANT_NO_NAME_FILTER_CACHE__) {
      window.__NON_RELEVANT_NO_NAME_FILTER_CACHE__ = cases.filter(
        (c) => c.comparison.is_relevant
      );
    }
    return window.__NON_RELEVANT_NO_NAME_FILTER_CACHE__;
  }
}

/**
 * Computes summaries of improvements, regressions and all changes from the
 * given `testCases`.
 */
export function computeSummary<Case extends {benchmark: string}>(
  comparisons: TestCaseComparison<Case>[]
): SummaryGroup {
  const regressionsValues: number[] = [];
  const improvementsValues: number[] = [];
  const allValues: number[] = [];

  for (const testCase of comparisons) {
    allValues.push(testCase.percent);

    if (testCase.percent < 0) {
      improvementsValues.push(testCase.percent);
    } else if (testCase.percent > 0) {
      regressionsValues.push(testCase.percent);
    }
  }

  const toSummary = (values: number[]): Summary => {
    return {
      count: values.length,
      geomean: geometricMeanPercent(values),
      median: medianPercent(values),
      range: computeRange(values),
    };
  };

  const improvements = toSummary(improvementsValues);
  const regressions = toSummary(regressionsValues);
  const all = toSummary(allValues);

  return {
    improvements: improvements,
    regressions: regressions,
    all: all,
  };
}

function geometricMeanPercent(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  let logSum = 0;
  for (const value of values) {
    const ratio = 1 + value / 100;

    if (ratio < 0) {
      return 0;
    }

    if (ratio === 0) {
      return -100;
    }

    logSum += Math.log(ratio);
  }

  return (Math.exp(logSum / values.length) - 1) * 100;
}

function medianPercent(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function computeRange(values: number[]): number[] {
  if (values.length === 0) {
    return [];
  }

  let minimum = values[0];
  let maximum = values[0];
  for (const value of values) {
    minimum = Math.min(minimum, value);
    maximum = Math.max(maximum, value);
  }
  return [minimum, maximum];
}
