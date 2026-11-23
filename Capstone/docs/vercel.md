# Deploy EsportEcho on Vercel and Render

Vercel serves the dashboard. One gateway process on Render owns the shared match, serves WebSocket updates and runs FFmpeg. Each authorized visitor controls the same match. Restarting the gateway clears the session.

1. Import this repository into Vercel and set the project root to `Capstone/client`. Use the Vite preset and set the production branch to `deploy/esportecho-vercel`. The checked-in `vercel.json` sets the install command, build command and output directory. Identify the project's stable production domain under Settings → Domains.
2. In Render, create a Blueprint from the same repository and branch using the root `render.yaml`. For `ESPORTECHO_DASHBOARD_ORIGIN`, enter the exact Vercel production origin including `https://`, with no path or trailing slash. Render generates `ESPORTECHO_ACCESS_KEY`. The Blueprint selects the Free instance type, which can sleep between visits. Choose an always-on instance for deployments requiring continuous availability.
3. Once the gateway is healthy, copy its actual HTTPS origin into the Vercel **Production** environment variable `VITE_GATEWAY_ORIGIN`. Deploy or redeploy the frontend. The hosted build requires this value. For previews, use a separate gateway and a stable preview domain so preview controls cannot affect the production match.
4. Open the Vercel production URL. Enter the generated team key from the Render service's Environment settings. Share it privately with authorized participants. The browser keeps it in memory until the page closes or reloads. Only the gateway URL belongs in Vercel's client environment.

## Check the release

Open the gateway's `/health` endpoint and confirm it returns `healthy`. In a fresh browser tab, verify that a wrong key is rejected. Connect with the team key and step one round. Open a second tab, enter the key and check that the same round appears. Under Broadcast, start the synthetic HUD, wait for an analysis update and stop it. A YouTube HUD run additionally depends on YouTube serving media to the deployed gateway's network.

If the dashboard stays disconnected, check the gateway status in Render and compare the browser address with `ESPORTECHO_DASHBOARD_ORIGIN`. The value must match the domain actually used, including any custom domain. Changing `VITE_GATEWAY_ORIGIN` requires a new Vercel build. Rotate a team key by replacing the Render secret and restarting the gateway.

To roll back, restore a known working Vercel deployment and its compatible gateway revision in Render. Restarting the gateway ends active analysis. Keep one gateway instance and one Uvicorn worker for this version.

The current release uses Vercel CLI for frontend deployments. From the linked `Capstone/client` directory on the release branch, run `npx vercel deploy --prod` after the checks pass. Render follows gateway changes on the release branch automatically.

If YouTube rate-limits HUD extraction, the gateway waits 15 minutes before allowing another YouTube analysis attempt. The start endpoint returns HTTP 503 and a `Retry-After` header during this interval. **Watch only** opens the embedded broadcast. Reference videos can still be attached to the replay, and the synthetic HUD remains available.

Provider references: [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [Render Blueprint fields](https://render.com/docs/blueprint-spec), [Render Free services](https://render.com/docs/free).
