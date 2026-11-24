import { useState } from 'react';
import { Download } from 'lucide-react';

export default function DownloadAnalytics({ kind, data, disabled = false }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function download() {
    setPending(true);
    setError('');
    try {
      const { downloadReplayPdf, downloadHudPdf } = await import('../analyticsPdf');
      if (kind === 'replay') downloadReplayPdf(data);
      else downloadHudPdf(data);
    } catch {
      setError('Could not create the PDF. Please try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button type="button" className="ui-button" disabled={disabled || pending} onClick={download}
        title={disabled ? 'Play a replay round to enable the download' : undefined}>
        <Download size={16} aria-hidden="true" />{pending ? 'Preparing PDF…' : 'Download PDF'}
      </button>
      {error && <p className="inline-error" role="alert">{error}</p>}
    </div>
  );
}
