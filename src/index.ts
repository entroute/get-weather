/**
 * get-weather
 *
 * Inspect the top-ranked, fulfillment-verified x402 endpoints for current
 * weather via EntRoute. Discovery only — no wallet required.
 *
 * To pay and call automatically, pass a Base wallet to
 * client.discoverAndCall(). See https://entroute.com/docs/sdk.
 *
 * Run: pnpm start
 */

import { EntRouteClient } from '@entroute/sdk-agent-ts';

const LOCATION = process.env.LOCATION ?? 'San Francisco, CA';

async function main() {
  const client = new EntRouteClient({
    baseUrl: process.env.ENTROUTE_BASE_URL ?? 'https://api.entroute.com',
  });

  // --- Option 1: discover and inspect -------------------------------------
  const discovery = await client.discover({
    capability_id: 'weather.current',
    constraints: {
      max_price: 0.01,
      network: 'base',
      verified_only: true,
    },
    preferences: { ranking_preset: 'balanced' },
  });

  console.log(`\nResolved capability: ${discovery.resolved.capability_id}`);
  console.log(`Top ${discovery.ranked_endpoints.length} endpoints:\n`);

  for (const ep of discovery.ranked_endpoints.slice(0, 3)) {
    console.log(`  ${ep.provider_name.padEnd(20)} ${ep.url}`);
    console.log(
      `    score=${ep.score.toFixed(3)}  ` +
        `p95=${ep.observed?.p95_latency_ms ?? '?'}ms  ` +
        `$${ep.payment.price_per_call}/call  ` +
        `success=${((ep.observed?.success_rate_7d ?? 0) * 100).toFixed(1)}%`
    );
    if (ep.sample_request) {
      console.log(`    sample_request: ${JSON.stringify(ep.sample_request)}`);
    }
  }

  // --- Option 2: discover and call, with automatic x402 payment -----------
  //
  // const result = await client.discoverAndCall(
  //   { capability_id: 'weather.current' },
  //   {
  //     buildRequest: (endpoint) => ({
  //       method: endpoint.method,
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ location: LOCATION }),
  //     }),
  //     wallet: yourBaseWallet,
  //     maxSpend: 0.01,
  //   }
  // );
  // console.log('\nWeather:', result.data);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
