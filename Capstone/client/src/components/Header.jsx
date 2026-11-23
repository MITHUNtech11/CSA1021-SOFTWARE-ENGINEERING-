import { Activity, ArrowUpRight, ChartNoAxesCombined, LayoutDashboard, Radio } from 'lucide-react';

const links = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'broadcast', label: 'Broadcast', Icon: Radio },
  { id: 'analysis', label: 'Analysis', Icon: ChartNoAxesCombined },
];

export default function Header({ view, isConnected, needsAccessKey, isLiveBroadcasting }) {
  const connectionLabel = needsAccessKey ? 'Team key required' : isConnected ? 'Gateway connected' : 'Connecting to gateway';
  return (
    <header className="workspace-sidebar">
      <a className="workspace-brand" href="#overview" aria-label="EsportEcho overview">
        <span className="brand-mark"><Activity size={21} aria-hidden="true" /></span>
        <span>EsportEcho<small>Predict</small></span>
      </a>

      <nav aria-label="Workspace" className="workspace-nav">
        <span className="nav-label">Workspace</span>
        {links.map(({ id, label, Icon }) => (
          <a key={id} href={`#${id}`} aria-current={view === id ? 'page' : undefined} className="workspace-link">
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
            {id === 'broadcast' && isLiveBroadcasting && <span className="nav-live"><span className="sr-only">Analysis running</span></span>}
            <ArrowUpRight className="workspace-link-arrow" size={14} aria-hidden="true" />
          </a>
        ))}
      </nav>

      <div role="status" className={`connection-status ${isConnected ? 'is-connected' : ''}`}>
        <span className="connection-dot" aria-hidden="true" />
        <span>{connectionLabel}</span>
      </div>
    </header>
  );
}
