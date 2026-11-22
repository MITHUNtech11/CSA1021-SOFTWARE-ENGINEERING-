import { useEffect, useRef, useState } from 'react';
import { Film, Upload, Video } from 'lucide-react';

export default function MatchVideoPlayer({ active, isConnected, activeVideo, onAnalyzeYouTube }) {
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const [localVideo, setLocalVideo] = useState(null);
  const [mode, setMode] = useState('youtube');
  const [videoError, setVideoError] = useState(false);
  const fileInput = useRef(null);

  useEffect(() => () => {
    if (localVideo) URL.revokeObjectURL(localVideo.url);
  }, [localVideo]);

  async function loadReference(event) {
    event.preventDefault();
    if (!isConnected || pending || !input.trim()) return;
    setPending(true);
    try {
      const result = await onAnalyzeYouTube(input.trim());
      if (result) setInput('');
    } finally {
      setPending(false);
    }
  }

  function loadFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setVideoError(false);
    setLocalVideo({ name: file.name, url: URL.createObjectURL(file) });
    event.target.value = '';
  }

  return (
    <section className="panel" aria-label="Video reference" aria-busy={pending}>
      <header className="panel-heading">
        <div><h2><Film size={17} aria-hidden="true" /> Reference video</h2><p>Watch footage alongside the replay with independent playback controls.</p></div>
      </header>

      <div className="segmented-control" role="group" aria-label="Video source">
        <button type="button" aria-pressed={mode === 'youtube'} onClick={() => setMode('youtube')}>YouTube</button>
        <button type="button" aria-pressed={mode === 'file'} onClick={() => setMode('file')}>Local file</button>
      </div>

      {mode === 'youtube' ? (
        <form className="source-form" onSubmit={loadReference}>
          <label className="field field-grow">
            <span>YouTube URL or video ID</span>
            <input value={input} onChange={(event) => setInput(event.target.value)} required maxLength={2048} disabled={pending} placeholder="Paste a YouTube link" />
          </label>
          <button type="submit" className="ui-button ui-primary" disabled={!isConnected || pending || !input.trim()}>{pending ? 'Loading…' : 'Load reference'}</button>
          <p className="form-help">Loading a new link resets the simulated replay.</p>
        </form>
      ) : (
        <div className="source-form">
          <input type="file" ref={fileInput} accept="video/*" hidden onChange={loadFile} aria-label="Choose local video" />
          <button type="button" className="ui-button" onClick={() => fileInput.current?.click()}><Upload size={16} aria-hidden="true" /> Choose video</button>
          <p className="form-help">Files stay in your browser.</p>
        </div>
      )}

      {active && (
        <div className="reference-content">
          {mode === 'youtube' && activeVideo ? (
            <>
              <iframe title={activeVideo.title || 'YouTube reference video'} src={`https://www.youtube-nocookie.com/embed/${activeVideo.video_id}`}
                allow="encrypted-media; picture-in-picture" allowFullScreen />
              <p className="reference-caption">{activeVideo.title}
                <a href={`https://www.youtube.com/watch?v=${activeVideo.video_id}`} target="_blank" rel="noreferrer">Open in YouTube</a>
              </p>
            </>
          ) : mode === 'file' && localVideo ? (
            <>
              <video src={localVideo.url} controls preload="metadata" onError={() => setVideoError(true)} />
              <p className="reference-caption">{localVideo.name}</p>
              {videoError && <p role="alert" className="inline-error">This video could not be played. Try an MP4 or WebM file.</p>}
            </>
          ) : (
            <div className="panel-empty">
              <Video size={22} aria-hidden="true" />
              <p>{mode === 'youtube' ? 'Add a YouTube link to load a reference video.' : 'Choose a video to preview it here.'}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
