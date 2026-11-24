import { useCallback, useEffect, useRef, useState } from 'react';

const gatewayOrigin = import.meta.env.VITE_GATEWAY_ORIGIN || '';
const socketUrl = new URL('/ws/live', gatewayOrigin || window.location.origin);
socketUrl.protocol = socketUrl.protocol === 'https:' ? 'wss:' : 'ws:';

const INITIAL_REPLAY = {
  ticks: [],
  predictions: [],
  change_points: [],
  pelt_segments: [],
  broadcast_meta: null,
  simulator_status: { is_playing: false, playback_speed: 1, current_index: 0, total_ticks: 24, current_game_time: 0 },
};

const INITIAL_LIVE = { is_running: false, current_live: null, inflection_events: [], source_type: 'NONE', video_id: null };

function appendTick(history, item, key) {
  if (!item || (history.length > 0 && history.at(-1)[key] >= item[key])) return history;
  return [...history, item];
}

export function useEsportWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [replay, setReplay] = useState(INITIAL_REPLAY);
  const [live, setLive] = useState(INITIAL_LIVE);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  const dismissError = useCallback(() => {
    setError(null);
    setLive((previous) => ({ ...previous, error: null }));
  }, []);

  const applyEvent = useCallback((event) => {
    switch (event.type) {
      case 'INITIAL_SNAPSHOT':
        setLive(event.live_status);
        setReplay(event);
        break;
      case 'REPLAY_SNAPSHOT':
        setReplay(event);
        break;
      case 'SIMULATION_STATUS':
        setReplay((prev) => ({ ...prev, simulator_status: event.simulator_status }));
        break;
      case 'TICK_UPDATE':
        setReplay((prev) => ({
          ...prev,
          ticks: appendTick(prev.ticks, event.tick, 'sequence_id'),
          predictions: appendTick(prev.predictions, event.prediction, 'tick_sequence'),
          change_points: appendTick(prev.change_points, event.change_point, 'tick_sequence'),
          simulator_status: event.simulator_status,
          pelt_segments: event.pelt_segments,
        }));
        break;
      case 'LIVE_STARTED':
        setLive({ ...INITIAL_LIVE, is_running: true, source_type: event.source_type, video_id: event.video_id });
        break;
      case 'LIVE_HUD_UPDATE':
        setLive((prev) => ({
          ...prev,
          is_running: true,
          source_type: event.source_type,
          current_live: event,
          inflection_events: [...event.inflection_events.slice().reverse(), ...prev.inflection_events].slice(0, 50),
        }));
        break;
      case 'LIVE_STOPPED':
        // Keep the final reading available for export until the next source starts.
        setLive((prev) => ({ ...prev, is_running: false, error: event.error }));
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    let stopped = false;
    let reconnectTimer;
    let heartbeat;
    let reconnectDelay = 1000;

    function connect() {
      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;
      let lastMessage = Date.now();
      ws.onopen = () => {
        if (stopped) return;
        lastMessage = Date.now();
        heartbeat = setInterval(() => {
          if (Date.now() - lastMessage > 20000) ws.close();
          else if (ws.readyState === WebSocket.OPEN) ws.send('ping');
        }, 8000);
      };

      ws.onmessage = ({ data }) => {
        if (stopped) return;
        lastMessage = Date.now();
        if (data === 'pong') return;
        try {
          const event = JSON.parse(data);
          applyEvent(event);
          if (event.type === 'INITIAL_SNAPSHOT') {
            setIsConnected(true);
            reconnectDelay = 1000;
          }
        } catch (error) {
          console.error('Invalid gateway message', error);
        }
      };

      ws.onclose = () => {
        clearInterval(heartbeat);
        if (stopped) return;
        setIsConnected(false);
        reconnectTimer = setTimeout(connect, reconnectDelay);
        reconnectDelay = Math.min(reconnectDelay * 2, 15000);
      };
    }

    // StrictMode replays effect setup and cleanup before the first task runs.
    const initialConnect = setTimeout(connect, 0);
    return () => {
      stopped = true;
      clearTimeout(initialConnect);
      clearTimeout(reconnectTimer);
      clearInterval(heartbeat);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [applyEvent]);

  const command = useCallback(async (path, body) => {
    setError(null);
    try {
      const response = await fetch(`${gatewayOrigin}/api/v1/${path}`, {
        method: 'POST',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        redirect: 'error',
        signal: AbortSignal.timeout(45000),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(typeof result.detail === 'string' ? result.detail : 'The gateway rejected the request.');
      }
      if (result.status === 'not_found') throw new Error('That round is unavailable.');
      if (wsRef.current?.readyState !== WebSocket.OPEN) {
        if (result.snapshot) applyEvent(result.snapshot);
        else if (result.packet) applyEvent(result.packet);
        else if (result.simulator_status) applyEvent({ type: 'SIMULATION_STATUS', ...result });
      }
      return result;
    } catch (error) {
      setError(error.name === 'TimeoutError' ? 'The gateway took too long to respond.' : error.message);
      return null;
    }
  }, [applyEvent]);

  const step = useCallback(() => command('simulation/step'), [command]);
  const play = useCallback((speed = 1) => command(`simulation/play?speed=${speed}`), [command]);
  const pause = useCallback(() => command('simulation/pause'), [command]);
  const reset = useCallback(() => command('simulation/reset'), [command]);
  const startLiveAnalysis = useCallback((source) => command('live/start', source), [command]);
  const stopLiveAnalysis = useCallback(() => command('live/stop'), [command]);
  const analyzeYouTubeVideo = useCallback((url) => command('simulation/analyze-youtube', { url }), [command]);
  const seekToRound = useCallback((round) => command('simulation/seek', { sequence_id: round }), [command]);

  return {
    isConnected,
    ticks: replay.ticks,
    predictions: replay.predictions,
    changePoints: replay.change_points,
    peltSegments: replay.pelt_segments,
    simulatorStatus: replay.simulator_status,
    activeVideo: replay.broadcast_meta,
    isLiveBroadcasting: live.is_running,
    liveSourceType: live.source_type,
    liveVideoId: live.video_id,
    liveAnalysisSeconds: live.current_live?.analysis_seconds,
    liveHudState: live.current_live?.hud_state,
    liveWinProbability: live.current_live?.win_probability,
    liveInflectionEvents: live.inflection_events,
    error: error || live.error,
    dismissError,
    step,
    play,
    pause,
    reset,
    startLiveAnalysis,
    stopLiveAnalysis,
    analyzeYouTubeVideo,
    seekToRound,
  };
}
