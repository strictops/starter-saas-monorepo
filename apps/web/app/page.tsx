export const dynamic = 'force-dynamic';

type ApiStatus = {
  service: string;
  environment: string;
  project: string;
  region: string;
  database: {
    connected: boolean;
    eventCount?: number;
    message?: string;
  };
};

const getApiStatus = async (): Promise<ApiStatus | null> => {
  const apiUrl = process.env.API_URL || 'http://localhost:3001';
  try {
    const response = await fetch(`${apiUrl}/status`, { cache: 'no-store' });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch {
    return null;
  }
};

export default async function HomePage() {
  const serviceName = process.env.STRICTOPS_SERVICE_NAME || 'web';
  const envName = process.env.STRICTOPS_ENV_NAME || 'local';
  const projectName = process.env.STRICTOPS_PROJECT_NAME || 'starter';
  const region = process.env.STRICTOPS_REGION || 'local';
  const strictopsHomeUrl = process.env.STRICTOPS_HOME_URL || 'https://strictops.dev/';
  const strictopsDocsUrl = process.env.STRICTOPS_APP_URL
    ? `${process.env.STRICTOPS_APP_URL}/docs/getting-started`
    : 'https://strictops.dev/docs/getting-started';
  const apiStatus = await getApiStatus();
  const database = apiStatus?.database;

  return (
    <main className="page">
      <div className="shell">
        <header className="topbar">
          <a className="brand" href={strictopsHomeUrl}>
            <StrictOpsLogo />
            <span>
              <span className="brand-name">StrictOps</span>
            </span>
          </a>
          <nav className="nav" aria-label="StrictOps links">
            <a href={strictopsHomeUrl}>Home</a>
            <a href={strictopsDocsUrl}>Docs</a>
          </nav>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">StrictOps SaaS monorepo starter</p>
            <h1>You vibe code. We handle production.</h1>
            <p className="lede">
              This sample includes a Next.js web service, a NestJS API service, PostgreSQL wiring, GitHub Actions,
              and dev/prod environment metadata for your AWS account.
            </p>
            <div className="actions">
              <a className="button primary" href={strictopsDocsUrl}>Read the docs</a>
              <a className="button secondary" href={strictopsHomeUrl}>Visit StrictOps</a>
            </div>
          </div>

          <div className="status-card">
            <p className="status-title">Deploy signal</p>
            <p className="status-body">
              Prompt, code, push, and let StrictOps keep the deployment path visible.
            </p>
            <div className="workflow">
              <span className="prompt">Prompt</span>
              <span>Code</span>
              <span>Push</span>
              <span className="live">Live</span>
            </div>
          </div>
        </section>

        <section className="grid" aria-label="Environment details">
          <InfoCard label="Service" value={serviceName} />
          <InfoCard label="Environment" value={envName} />
          <InfoCard label="Project" value={projectName} />
          <InfoCard label="Region" value={region} />
        </section>

        <section className="status">
          <div className="panel">
            <h2>API service</h2>
            <div className="rows">
              <StatusRow label="Connection" value={apiStatus ? 'reachable' : 'unreachable'} />
              <StatusRow label="Service" value={apiStatus?.service ?? 'api'} />
              <StatusRow label="Environment" value={apiStatus?.environment ?? envName} />
            </div>
          </div>

          <div className="panel">
            <h2>PostgreSQL</h2>
            <div className="rows">
              <span className="pill">{database?.connected ? 'connected' : 'not connected'}</span>
              <StatusRow label="Sample rows" value={String(database?.eventCount ?? 0)} />
              {database?.message && <p className="muted">{database.message}</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel">
      <p className="label">{label}</p>
      <p className="value">{value}</p>
    </div>
  );
}

function StrictOpsLogo() {
  const darkSquares = [
    [10.374149659863939, 0],
    [31.122448979591834, 0],
    [51.87074829931973, 0],
    [10.374149659863939, 20.748299319727888],
    [10.374149659863939, 41.49659863945578],
    [31.122448979591834, 41.49659863945578],
    [51.87074829931973, 41.49659863945578],
    [72.61904761904762, 41.49659863945578],
    [72.61904761904762, 62.24489795918368],
    [10.374149659863939, 82.99319727891157],
    [31.122448979591834, 82.99319727891157],
    [51.87074829931973, 82.99319727891157],
    [72.61904761904762, 82.99319727891157],
  ];

  return (
    <svg width="26" height="26" viewBox="0 0 100 100" fill="none" role="img" aria-label="StrictOps" className="brand-logo">
      <title>StrictOps</title>
      {darkSquares.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="17.006802721088437" height="17.006802721088437" rx="2.5510204081632657" fill="currentColor" />
      ))}
      <rect x="72.61904761904762" y="0" width="17.006802721088437" height="17.006802721088437" rx="2.5510204081632657" fill="var(--accent)" />
    </svg>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="row">
      <span className="muted">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
