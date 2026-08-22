// Returns the URL to a measureme self-profile data, processed into the
// Chrome profiler format.
export function chromeProfileUrl(
  commit: string,
  benchmarkAndProfile: string,
  scenario: string
): string {
  const relativeUrl = processedSelfProfileRelativeUrl(
    commit,
    benchmarkAndProfile,
    scenario,
    "crox"
  );
  return window.location.origin + relativeUrl;
}

export function processedSelfProfileRelativeUrl(
  commit: string,
  benchmarkAndProfile: string,
  scenario: string,
  type: string
): string {
  const params = new URLSearchParams({
    commit,
    benchmark: benchmarkAndProfile,
    scenario,
    type,
  });
  return `/perf/processed-self-profile?${params}`;
}
