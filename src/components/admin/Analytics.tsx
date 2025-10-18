import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function Analytics() {
  const posthogDashboardUrl = "https://eu.i.posthog.com/embedded/...";

  return (
    <Card className="bg-gray-800 border-gray-700 mt-8">
      <CardHeader>
        <CardTitle>Analíticas de PostHog</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-gray-400">
          A continuación se muestra el dashboard de PostHog. Puede que necesites iniciar sesión en tu cuenta de PostHog en este navegador para poder verlo.
        </p>
        <iframe
          src={posthogDashboardUrl}
          frameBorder="0"
          width="100%"
          height="600"
          allowFullScreen
          className="rounded-md"
        ></iframe>
      </CardContent>
    </Card>
  );
}