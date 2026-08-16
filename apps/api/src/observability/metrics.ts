type RequestMetric = {
  method: string;
  route: string;
  statusCode: number;
  durationMs: number;
};

type MetricsSnapshot = {
  requestsTotal: number;
  errorsTotal: number;
  durationMsTotal: number;
  byRoute: Record<string, { requests: number; errors: number }>;
};

const metrics = {
  requestsTotal: 0,
  errorsTotal: 0,
  durationMsTotal: 0,
  byRoute: new Map<string, { requests: number; errors: number }>(),
};

export const recordRequest = ({
  method,
  route,
  statusCode,
  durationMs,
}: RequestMetric) => {
  const routeKey = `${method} ${route}`;
  const routeMetrics = metrics.byRoute.get(routeKey) ?? {
    requests: 0,
    errors: 0,
  };

  metrics.requestsTotal += 1;
  metrics.durationMsTotal += durationMs;
  routeMetrics.requests += 1;
  if (statusCode >= 400) {
    metrics.errorsTotal += 1;
    routeMetrics.errors += 1;
  }
  metrics.byRoute.set(routeKey, routeMetrics);
};

export const getMetrics = (): MetricsSnapshot => ({
  requestsTotal: metrics.requestsTotal,
  errorsTotal: metrics.errorsTotal,
  durationMsTotal: metrics.durationMsTotal,
  byRoute: Object.fromEntries(
    [...metrics.byRoute.entries()].map(([route, routeMetrics]) => [
      route,
      { ...routeMetrics },
    ]),
  ),
});
