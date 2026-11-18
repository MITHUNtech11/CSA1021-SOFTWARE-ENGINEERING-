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

  const wsRef = useRef(null);
  const heartbeatRef = useRef(null);
  const playbackTimerRef = useRef(null);
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

  // Fetch initial match state snapshot via same-origin REST
  const fetchInitialState = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/matches/current');
      if (res.ok) {
        const data = await res.json();
        setTicks(data.ticks || []);
        setPredictions(data.predictions || []);
        setChangePoints(data.change_points || []);
        if (data.status) setSimulatorStatus(data.status);
      }
    } catch (e) {
      console.warn("Initial state fetch error:", e);
    }
  }, []);

  // Connect to WebSocket with resilient fallback
  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    try {
      // Connect to same-host /ws/live
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
          } else if (data.type === 'TICK_UPDATE') {
            applyTickPacket(data);
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
        // Retry connection gracefully
        setTimeout(() => {
          if (isMountedRef.current) connect();
        }, 4000);
      };

      ws.onerror = (err) => {
        // Will trigger onclose and retry
      };
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
      clearInterval(playbackTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect, fetchInitialState]);

  // Step 1 minute forward (called manually or by reactive player interval)
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

  // Reactive playback loop: when is_playing is true, advance ticks at variable speed
  useEffect(() => {
    if (simulatorStatus.is_playing) {
      const intervalMs = Math.max(200, 1500 / Math.max(0.5, simulatorStatus.playback_speed));
      playbackTimerRef.current = setInterval(() => {
        step();
      }, intervalMs);
    } else {
      clearInterval(playbackTimerRef.current);
    }

    return () => clearInterval(playbackTimerRef.current);
  }, [simulatorStatus.is_playing, simulatorStatus.playback_speed, step]);

  const play = useCallback((speed = 1.0) => {
    setSimulatorStatus((prev) => ({ ...prev, is_playing: true, playback_speed: speed }));
    // Also notify backend
    fetch(`/api/v1/simulation/play?speed=${speed}`, { method: 'POST' }).catch(() => {});
  }, []);

  const pause = useCallback(() => {
    setSimulatorStatus((prev) => ({ ...prev, is_playing: false }));
    clearInterval(playbackTimerRef.current);
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
        const data = await res.json();
        if (data.packet) applyTickPacket(data.packet);
      }
    } catch (e) {
      console.warn("Seek request failed:", e);
    }
  }, [applyTickPacket]);

  return {
    isConnected,
    ticks,
    predictions,
    changePoints,
    simulatorStatus,
    step,
    play,
    pause,
    reset,
    analyzeYouTubeVideo,
    seekToRound
  };
}
