# EsportEcho Predict

CSA1021 Software Engineering capstone from S. Mithun Senthil, Gourav Sharma, and V. C. Bhavan Bairav.

EsportEcho streams an illustrative VALORANT match to a dashboard and estimates how the teams' prospects change as the series unfolds. A separate video mode reads selected elements of a compatible VALORANT broadcast HUD.

## What the application runs

| Mode | Input | Output |
| --- | --- | --- |
| Simulated replay | Built-in 24-round telemetry | Team metrics, win estimates, change points, and phase segments |
| Replay with reference video | A YouTube video ID or link plus generated telemetry | The same simulated analysis alongside an independently controlled video |
| HUD analysis | Synthetic frames, a YouTube stream, or an operator-provided server recording | Player-alive counts, spike state, and tactical estimates |

HUD extraction uses fixed image regions and color heuristics. Results depend on the broadcast layout and video quality. The prediction models use hand-set weights. Interpret them as estimates until they have been calibrated and evaluated on labelled real matches.

## Run locally on Windows

Install Python 3.11, Node.js 22+, and FFmpeg on PATH for real video. YouTube stream resolution uses Node.js with the yt-dlp challenge solver. Then run from this directory.

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
npm.cmd --prefix client ci
.\.venv\Scripts\python.exe -m pytest -q
```

Start each process in its own terminal, or use `run_local.bat` to open both after the tests pass.

```powershell
.\.venv\Scripts\python.exe -m uvicorn services.gateway.app.main:app --host 127.0.0.1 --port 8000
```

```powershell
npm.cmd --prefix client run dev
```

Open the dashboard at `http://127.0.0.1:5173` and the API docs at `http://127.0.0.1:8000/docs`. To enable server recordings, set `ESPORTECHO_VIDEO_DIR` to an operator-controlled directory before starting the gateway. Enter a supported filename relative to it in the dashboard.

## Deploy with Docker Compose

```sh
docker compose up --build --wait
docker compose logs gateway
```

The dashboard listens on loopback port 5173 and proxies REST and WebSocket traffic to the gateway. A gateway health check gates dashboard startup. The gateway image includes FFmpeg, and both containers run as unprivileged users.

For private remote access, put an authenticated TLS reverse proxy in front of the dashboard. Preserve the browser's Host header and forward WebSocket upgrades. Keep the gateway port private. Playback and live controls affect the shared session, so grant access to trusted users. For recordings in Docker, add a read-only video volume, set `ESPORTECHO_VIDEO_DIR` inside the gateway, and ensure the gateway user can read the files.

### Deployed architecture

```text
Browser -> Vite (development) or Nginx (Compose) -> FastAPI gateway
                                                      |-- Replay / FFmpeg video input
                                                      |-- Analytics and prediction
                                                      '-- In-memory state / WebSocket fan-out
```

The gateway runs as a single worker with one shared session. A restart clears session history. Ingestion, analytics, and prediction remain separate Python modules. Redis-backed distribution, durable replay state, and independent sessions are future work.

## Algorithms and verification

- CUSUM accumulates evidence for increases or decreases in telemetry velocity.
- BOCPD updates a probability distribution over run lengths to identify abrupt regime changes.
- PELT finds penalized least-squares segment boundaries with a minimum segment length.
- The replay model updates on every tick. The inflection classifier uses selected changes in the estimate and detector evidence to explain significant moments.

Run `python -m pytest -q` in the configured environment and `npm run build` from `client`. GitHub Actions runs the suite, builds the UI and containers, and checks the Compose deployment. The backend tests cover the full synthetic match, WebSocket updates and reconnects, backward seek, HUD lifecycle, and both schema and algorithm checks.

Latency, coverage, and detection rates require recorded experiments. The slide deck's confusion matrix is a worked example. To evaluate detection, use labelled match windows, report false alarms and detection delay, and keep the evaluation matches separate from threshold tuning.
