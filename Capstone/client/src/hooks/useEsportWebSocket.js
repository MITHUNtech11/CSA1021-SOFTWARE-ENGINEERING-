import { useState, useEffect, useRef, useCallback } from 'react';

export function useEsportWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [ticks, setTicks] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [changePoints, setChangePoints] = useState([]);
  const [simulatorStatus, setSimulatorStatus] = useState({
    is_playing: false,
    playback_speed: 1.0,
    current_index: 0,
    total_ticks: 24,
    current_game_time: 0.0
  });

  // Live Broadcast HUD Analytics State
  const [activeVideo, setActiveVideo] = useState(null);
  const [isLiveBroadcasting, setIsLiveBroadcasting] = useState(false);
  const [liveHudState, setLiveHudState] = useState(null);
  const [liveWinProbability, setLiveWinProbability] = useState({
    round_blue: 0.50,
    round_red: 0.50,
    match_blue: 0.50,
    match_red: 0.50
  });
  const [liveInflectionEvents, setLiveInflectionEvents] = useState([]);

  const wsRef = useRef(null);
  const heartbeatRef = useRef(null);
  const isMountedRef = useRef(true);

  // Helper to deduplicate ticks by sequence_id
  const applyTickPacket = useCallback((packet) => {
    if (!packet) return;
    
    if (packet.tick) {
      setTicks((prev) => {
        const exists = prev.some((t) => t.sequence_id === packet.tick.sequence_id);
        return exists ? prev : [...prev, packet.tick];
      });
    }

    if (packet.prediction) {
      setPredictions((prev) => {
        const exists = prev.some((p) => p.tick_sequence === packet.prediction.tick_sequence);
        return exists ? prev : [...prev, packet.prediction];
      });
    }

    if (packet.change_point) {
      setChangePoints((prev) => {
        const exists = prev.some((cp) => cp.tick_sequence === packet.change_point.tick_sequence);
        return exists ? prev : [...prev, packet.change_point];
      });
    }

    if (packet.simulator_status) {
      setSimulatorStatus(packet.simulator_status);
    }
  }, []);

  // Fetch initial match state snapshot via REST
  const fetchInitialState = useCallback(async () => {
    try {
      const [matchRes, broadcastRes] = await Promise.all([
        fetch('/api/v1/matches/current'),
        fetch('/api/v1/broadcast/current')
      ]);
      if (matchRes.ok) {
        const data = await matchRes.json();
        setTicks(data.ticks || []);
        setPredictions(data.predictions || []);
        setChangePoints(data.change_points || []);
        if (data.status) setSimulatorStatus(data.status);
      }
      if (broadcastRes.ok) {
        const bData = await broadcastRes.json();
        if (bData.is_initialized) {
          setActiveVideo({
            videoId: bData.video_id,
            title: bData.title,
            author: bData.author,
            thumbnailUrl: bData.thumbnail_url,
            matchId: bData.match_id,
            totalRounds: bData.total_rounds,
            isLive: bData.is_live
          });
        }
      }
    } catch (e) {
      console.warn("Initial state fetch error:", e);
    }
  }, []);

  // Connect to WebSocket with resilient reconnection
  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        setIsConnected(true);
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 8000);
      };

      ws.onmessage = (event) => {
        if (event.data === 'pong' || !isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'INITIAL_SNAPSHOT') {
            setTicks(data.ticks || []);
            setPredictions(data.predictions || []);
            setChangePoints(data.change_points || []);
            if (data.simulator_status) setSimulatorStatus(data.simulator_status);
            if (data.broadcast_meta && data.broadcast_meta.video_id) {
              setActiveVideo({
                videoId: data.broadcast_meta.video_id,
                title: data.broadcast_meta.title,
                author: data.broadcast_meta.author,
                thumbnailUrl: data.broadcast_meta.thumbnail_url,
                matchId: data.broadcast_meta.match_id,
                totalRounds: data.broadcast_meta.total_rounds,
                isLive: data.broadcast_meta.is_live
              });
            }
            if (data.live_status && data.live_status.is_running) {
              setIsLiveBroadcasting(true);
              if (data.live_status.current_live) {
                setLiveHudState(data.live_status.current_live.hud_state);
                setLiveWinProbability(data.live_status.current_live.win_probability);
              }
            }
          } else if (data.type === 'YOUTUBE_ANALYZED') {
            setActiveVideo({
              videoId: data.video_id,
              title: data.title,
              author: data.author,
              thumbnailUrl: data.thumbnail_url,
              matchId: data.match_id,
              totalRounds: data.total_rounds,
              isLive: data.is_live
            });
            setTicks([]);
            setPredictions([]);
            setChangePoints([]);
            if (data.simulator_status) setSimulatorStatus(data.simulator_status);
          } else if (data.type === 'TICK_UPDATE') {
            applyTickPacket(data);
          } else if (data.type === 'LIVE_HUD_UPDATE') {
            setIsLiveBroadcasting(true);
            setLiveHudState(data.hud_state);
            setLiveWinProbability(data.win_probability);
            if (data.inflection_events && data.inflection_events.length > 0) {
              setLiveInflectionEvents((prev) => [...data.inflection_events, ...prev].slice(0, 50));
            }
          } else if (data.type === 'LIVE_STOPPED') {
            setIsLiveBroadcasting(false);
          } else if (data.type === 'SIMULATION_RESET') {
            setTicks([]);
            setPredictions([]);
            setChangePoints([]);
            setSimulatorStatus({
              is_playing: false,
              playback_speed: 1.0,
              current_index: 0,
              total_ticks: 24,
              current_game_time: 0.0
            });
          } else if (data.type === 'SIMULATION_FINISHED') {
            setSimulatorStatus((prev) => ({ ...prev, is_playing: false }));
          }
        } catch (err) {
          console.error("WebSocket message parse error:", err);
        }
      };

      ws.onclose = () => {
        if (!isMountedRef.current) return;
        setIsConnected(false);
        clearInterval(heartbeatRef.current);
        setTimeout(() => {
          if (isMountedRef.current) connect();
        }, 4000);
      };

      ws.onerror = () => {};
    } catch (e) {
      console.warn("WebSocket init failed:", e);
    }
  }, [applyTickPacket]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchInitialState();
    connect();

    return () => {
      isMountedRef.current = false;
      clearInterval(heartbeatRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect, fetchInitialState]);

  // Step 1 round forward
  const step = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/simulation/step', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.packet) {
          applyTickPacket(data.packet);
        } else if (data.status === 'finished') {
          setSimulatorStatus((prev) => ({ ...prev, is_playing: false }));
        }
      }
    } catch (e) {
      console.warn("Step request failed:", e);
    }
  }, [applyTickPacket]);

  const play = useCallback((speed = 1.0) => {
    setSimulatorStatus((prev) => ({ ...prev, is_playing: true, playback_speed: speed }));
    fetch(`/api/v1/simulation/play?speed=${speed}`, { method: 'POST' }).catch(() => {});
  }, []);

  const pause = useCallback(() => {
    setSimulatorStatus((prev) => ({ ...prev, is_playing: false }));
    fetch('/api/v1/simulation/pause', { method: 'POST' }).catch(() => {});
  }, []);

  const reset = useCallback(async () => {
    pause();
    try {
      await fetch('/api/v1/simulation/reset', { method: 'POST' });
    } catch (e) {}
    setTicks([]);
    setPredictions([]);
    setChangePoints([]);
    setSimulatorStatus({
      is_playing: false,
      playback_speed: 1.0,
      current_index: 0,
      total_ticks: 24,
      current_game_time: 0.0
    });
  }, [pause]);

  const startLiveAnalysis = useCallback(async ({ source = "SYNTHETIC", source_type = "SYNTHETIC", fps = 1.0 } = {}) => {
    pause();
    try {
      const res = await fetch('/api/v1/live/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, source_type, fps })
      });
      if (res.ok) {
        setIsLiveBroadcasting(true);
        return await res.json();
      }
    } catch (e) {
      console.error("Start live analysis error:", e);
    }
  }, [pause]);

  const stopLiveAnalysis = useCallback(async () => {
    try {
      await fetch('/api/v1/live/stop', { method: 'POST' });
      setIsLiveBroadcasting(false);
    } catch (e) {
      console.error("Stop live analysis error:", e);
    }
  }, []);

  const analyzeYouTubeVideo = useCallback(async (url) => {
    pause();
    try {
      const res = await fetch('/api/v1/simulation/analyze-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        const data = await res.json();
        setTicks([]);
        setPredictions([]);
        setChangePoints([]);
        setSimulatorStatus((prev) => ({
          ...prev,
          is_playing: false,
          current_index: 0,
          total_ticks: data.total_rounds || 24,
          current_game_time: 0.0
        }));
        return data;
      }
    } catch (e) {
      console.error("YouTube analysis request failed:", e);
    }
  }, [pause]);

  const seekToRound = useCallback(async (roundIndex) => {
    try {
      const res = await fetch('/api/v1/simulation/seek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence_id: roundIndex })
      });
      if (res.ok) {
        await fetchInitialState();
      }
    } catch (e) {
      console.warn("Seek request failed:", e);
    }
  }, [fetchInitialState]);

  return {
    isConnected,
    ticks,
    predictions,
    changePoints,
    simulatorStatus,
    isLiveBroadcasting,
    liveHudState,
    liveWinProbability,
    liveInflectionEvents,
    step,
    play,
    pause,
    reset,
    startLiveAnalysis,
    stopLiveAnalysis,
    analyzeYouTubeVideo,
    seekToRound
  };
}
