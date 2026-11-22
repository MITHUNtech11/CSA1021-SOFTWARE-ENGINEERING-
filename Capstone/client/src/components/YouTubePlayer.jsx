import { ExternalLink } from 'lucide-react';

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeVideoId(value) {
  const input = value.trim();
  if (YOUTUBE_ID.test(input)) return input;
  try {
    const url = new URL(input);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.port) return null;
    let id;
    if (url.hostname === 'youtu.be') id = url.pathname.replace(/^\/+|\/+$/g, '');
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
      id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:embed|live|shorts)\/([^/]+)$/)?.[1];
    }
    return typeof id === 'string' && YOUTUBE_ID.test(id) ? id : null;
  } catch {
    return null;
  }
}

export default function YouTubePlayer({ videoId, title, autoplay = false }) {
  if (!YOUTUBE_ID.test(videoId ?? '')) return null;
  const params = new URLSearchParams({ controls: '1', playsinline: '1' });
  if (autoplay) {
    params.set('autoplay', '1');
    params.set('mute', '1');
  }

  return (
    <div className="youtube-player">
      <iframe title={title} src={`https://www.youtube-nocookie.com/embed/${videoId}?${params}`}
        referrerPolicy="strict-origin-when-cross-origin"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
      <p className="reference-caption">
        <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer">
          Open in YouTube <ExternalLink size={13} aria-hidden="true" />
        </a>
      </p>
    </div>
  );
}
