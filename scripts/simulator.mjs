// Pretends to be one or more servers and sends metrics to Pulse.
// Usage: node scripts/simulator.mjs <apiKey1> [apiKey2] [apiKey3]

const API_URL = process.env.PULSE_URL ?? 'http://localhost:3000/ingest';
const INTERVAL_MS = 5000;

const keys = process.argv.slice(2);
if (keys.length === 0) {
  console.error('Usage: node scripts/simulator.mjs <apiKey> [apiKey...]');
  process.exit(1);
}

const random = (min, max) =>
  Math.round((min + Math.random() * (max - min)) * 10) / 10;

// one pretend server per key
const servers = keys.map((apiKey, i) => ({
  name: `sim-${i + 1}`,
  apiKey,
  spikeTicksLeft: 0,
}));

function readMetrics(server) {
  // 10% chance per reading to start a spike that lasts 4 readings
  if (server.spikeTicksLeft === 0 && Math.random() < 0.1) {
    server.spikeTicksLeft = 4;
  }
  const spiking = server.spikeTicksLeft > 0;
  if (spiking) server.spikeTicksLeft -= 1;

  return [
    { name: 'cpu', value: spiking ? random(92, 99) : random(20, 50) },
    { name: 'memory', value: spiking ? random(80, 90) : random(40, 65) },
    { name: 'temperature', value: spiking ? random(80, 90) : random(40, 60) },
  ];
}

async function send(server) {
  const metrics = readMetrics(server);
  const summary = metrics.map((m) => `${m.name}=${m.value}`).join(' ');

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': server.apiKey,
      },
      body: JSON.stringify({ metrics }),
    });
    console.log(`[${server.name}] ${res.status} ${summary}`);
    if (!res.ok) console.log(await res.text());
  } catch (err) {
    console.error(`[${server.name}] cannot reach Pulse: ${err.message}`);
  }
}

function tick() {
  servers.forEach(send);
}

console.log(`Simulating ${servers.length} server(s) every ${INTERVAL_MS / 1000}s`);
tick();
setInterval(tick, INTERVAL_MS);