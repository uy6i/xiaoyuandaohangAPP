/* Background route calculation for the WebView and browser builds. */
importScripts('./core.js');

let dataset = null;
let version = 0;
let warmState = null;

function startWarm(options = {}) {
  if (!dataset || warmState) return;
  const origins = Math.max(1, Number(options.origins || 4));
  const targets = Math.max(1, Number(options.targets || 24));
  const points = dataset.places.filter(p => p.nodeId);
  const starts = points.filter(p => p.category === '出入口' || p.name === '北入口' || p.name === '南入口').slice(0, origins);
  const selectedStarts = starts.length ? starts : points.slice(0, origins);
  const ends = points.slice(0, targets);
  const tasks = [];
  for (const from of selectedStarts) for (const to of ends) if (from.id !== to.id) for (const mode of ['walk', 'accessible']) tasks.push([from.id, to.id, mode]);
  warmState = {index: 0, count: 0, tasks, version};
  warmStep();
}

// Yield between small batches so a user's first request can run immediately while warm-up continues.
function warmStep() {
  if (!warmState || !dataset || warmState.version !== version) { warmState = null; return; }
  const state = warmState;
  const stop = Math.min(state.index + 4, state.tasks.length);
  for (; state.index < stop; state.index++) {
    const [fromId, toId, mode] = state.tasks[state.index];
    try { CampusCore.route(dataset, fromId, toId, mode); state.count++; } catch {}
  }
  if (state.index < state.tasks.length) { setTimeout(warmStep, 0); return; }
  warmState = null;
  self.postMessage({type: 'warmed', version, count: state.count});
}

self.onmessage = event => {
  const message = event.data || {};
  try {
    if (message.type === 'init') {
      dataset = message.dataset;
      version = Number(message.version || 0);
      warmState = null;
      CampusCore.clearRouteCache(dataset);
      self.postMessage({type: 'ready', version});
      return;
    }
    if (!dataset || Number(message.version || version) !== version) throw Error('路线数据正在更新，请稍后重试。');
    if (message.type === 'warm') { startWarm(message.options || {}); return; }
    if (message.type === 'route') {
      // A route request shares the worker's graph/cache even when background warm-up is still yielding.
      const result = CampusCore.route(dataset, message.fromId, message.toId, message.mode || 'walk');
      self.postMessage({type: 'route', requestId: message.requestId, version, result});
    }
  } catch (error) {
    self.postMessage({type: 'error', requestId: message.requestId, version, error: String(error?.message || error)});
  }
};
