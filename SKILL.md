---
name: get-weather
description: Get current weather conditions for any location via a verified x402 pay-per-request endpoint. Use when the user asks for the weather in a city, at coordinates, or at a zip/postal code — without requiring an OpenWeather, AccuWeather, or WeatherAPI key.
---

# Getting weather via EntRoute

When the user asks for current weather, use this skill to fetch it from a ranked, fulfillment-verified x402 endpoint.

## Steps

1. **Parse the location.** The user may specify a city ("Tokyo"), coordinates ("37.7749,-122.4194"), a zip/postal code ("94102"), or a more detailed string ("San Francisco, CA, USA"). Identify the most unambiguous form.

2. **Discover the best endpoint.** Call EntRoute's `/discover`:

   ```bash
   curl -s -X POST https://api.entroute.com/discover \
     -H "Content-Type: application/json" \
     -d '{
       "capability_id": "weather.current",
       "constraints": {"network": "base", "verified_only": true},
       "preferences": {"ranking_preset": "balanced"}
     }'
   ```

   Take `ranked_endpoints[0]`. Check `sample_request` for exact param names. Common shapes: `{ location }`, `{ city }`, or `{ lat, lng }`. Some endpoints expect `q` as a generic location string.

3. **Build the request matching `sample_request`.** If the endpoint expects lat/lng and the user gave a city name, consider resolving with the `geo.geocode` capability first — or pick an endpoint that accepts a string location.

4. **Pay with x402.** With `@entroute/mcp-server` or `@entroute/sdk-agent-ts` installed, `call_paid_api` / `discoverAndCall` handles payment automatically.

5. **Parse and return.** Typical fields: `temperature`, `condition` / `description`, `humidity`, `wind_speed`. Use `sample_response` to map to what the user wants. Units vary — some endpoints return Celsius, others Fahrenheit; look for a `units` field or request `units: metric`/`imperial` if `sample_request` shows support.

## Preferred approach

With Claude Code + `@entroute/mcp-server`, use the MCP tools `discover_paid_api` and `call_paid_api` directly.

## Notes

- Default network is Base; pricing is USDC. Weather endpoints typically cost $0.0005–$0.005 per call.
- If the user asks for *forecasts* (not current conditions), that may be a different capability — check `weather.forecast` via `/capabilities`.
- Full docs: https://entroute.com/docs/quickstart
