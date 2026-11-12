// ============================================================
// S.I.T.O. GRAFO DE NAVEGACIÓN TÁCTICA DE PERSONAL
// Sistema de Información Táctico Operacional — Planta Concentradora
// Version: 1.0.0 — Coordenadas porcentuales (0–100)
// ============================================================

export const SITO_GRAPH = {
  mapVersion: '1.0.0',
  dimensions: { width: 100, height: 100, unit: 'percentage' },

  // ── CAPA 4: Keypoints calibrados con color único por TAG ──────────────
  // pinColor = color único de identificación del pin en el SVG overlay
  // coords   = posición ancla del pin TIP sobre la imagen base (% 0-100)

  assets: [
    { id: 'CH-01',  name: 'Chancador Primario',                 nodeId: 'node_ch1',  tag: 'CH-01',  altTag: 'CH-PRI-01',  area: 'ÁREA SECA',         pinColor: '#FF2A2A', coords: { x: 37.5, y: 22.0 } },
    { id: 'CH-02',  name: 'Chancador Cónico',                   nodeId: 'node_ch2',  tag: 'CH-02',  altTag: 'ACT-001',    area: 'ÁREA SECA',         pinColor: '#FFE600', coords: { x: 50.8, y: 19.5 } },
    { id: 'MOL-01', name: 'Molino SAG Línea 2',                 nodeId: 'node_mol1', tag: 'MOL-01', altTag: 'ACT-005',    area: 'ÁREA HÚMEDA',       pinColor: '#A855F7', coords: { x: 77.0, y: 23.5 } },
    { id: 'MOL-02', name: 'Molinos de Bolas',                   nodeId: 'node_mol2', tag: 'MOL-02', altTag: 'MOL-BOL-01', area: 'ÁREA HÚMEDA',       pinColor: '#06B6D4', coords: { x: 83.5, y: 35.0 } },
    { id: 'CL-01',  name: 'Celdas de Flotación Rougher',        nodeId: 'node_cl1',  tag: 'CL-01',  altTag: 'CEL-01',     area: 'ÁREA HÚMEDA',       pinColor: '#EC4899', coords: { x: 75.0, y: 44.5 } },
    { id: 'ESP-01', name: 'Espesador de Relaves High-Rate',     nodeId: 'node_esp1', tag: 'ESP-01', altTag: 'ESP-REL-01', area: 'PROCESOS / RELAVES', pinColor: '#84CC16', coords: { x: 56.5, y: 64.0 } },
    { id: 'ESP-02', name: 'Filtro Prensa Larox / Espesador 02', nodeId: 'node_esp2', tag: 'ESP-02', altTag: 'FL-PR-01',   area: 'PROCESOS / RELAVES', pinColor: '#F97316', coords: { x: 66.8, y: 68.5 } },
  ],



  nodes: [
    // ── Asset nodes — sincronizados con assets.coords (bias Y = 0) ──
    { id: 'node_ch1',  type: 'asset', label: 'Chancador 01',    assetId: 'CH-01',  x: 37.5, y: 22.0 },
    { id: 'node_ch2',  type: 'asset', label: 'Chancador 02',    assetId: 'CH-02',  x: 50.8, y: 19.5 },
    { id: 'node_mol1', type: 'asset', label: 'Molino SAG',      assetId: 'MOL-01', x: 77.0, y: 23.5 },
    { id: 'node_mol2', type: 'asset', label: 'Molinos de Bolas',assetId: 'MOL-02', x: 83.5, y: 35.0 },
    { id: 'node_cl1',  type: 'asset', label: 'Celdas Flotación',assetId: 'CL-01',  x: 75.0, y: 44.5 },
    { id: 'node_esp1', type: 'asset', label: 'Espesador 01',    assetId: 'ESP-01', x: 56.5, y: 64.0 },
    { id: 'node_esp2', type: 'asset', label: 'Espesador 02',    assetId: 'ESP-02', x: 66.8, y: 68.5 },
    // ── Waypoints — caminos y bifurcaciones (sin cambios Capa 4) ──────────
    { id: 'wp_01',     type: 'waypoint', label: 'Bifurcación Chancado Superior',           x: 48.0, y: 32.0 },
    { id: 'wp_02',     type: 'waypoint', label: 'Acceso Acopio Mineral',                   x: 13.0, y: 42.5 },
    { id: 'wp_03',     type: 'waypoint', label: 'Cruce Correa Principal',                  x: 32.0, y: 40.0 },
    { id: 'wp_04',     type: 'waypoint', label: 'Camino Intermedio Área Seca',             x: 43.5, y: 42.0 },
    { id: 'wp_05',     type: 'waypoint', label: 'Puente Pasarela Inter-Áreas',             x: 64.5, y: 28.5 },
    { id: 'wp_06',     type: 'waypoint', label: 'Pasarela Acceso Molienda',                x: 77.0, y: 46.0 },
    { id: 'wp_07',     type: 'waypoint', label: 'Cruce Molienda / Flotación',              x: 84.0, y: 62.0 },
    { id: 'wp_08',     type: 'waypoint', label: 'Curva Camino Principal Inferior',         x: 18.5, y: 78.5 },
    { id: 'wp_09',     type: 'waypoint', label: 'Bifurcación Filtro Prensa',               x: 27.5, y: 66.5 },
    { id: 'wp_10',     type: 'waypoint', label: 'Acceso Filtro Prensa',                    x: 35.0, y: 84.5 },
    { id: 'wp_11',     type: 'waypoint', label: 'Cruce Pasarela Espesadores Norte',        x: 66.5, y: 73.0 },
    { id: 'wp_12',     type: 'waypoint', label: 'Salida Sur Espesadores',                  x: 54.0, y: 97.0 },
    { id: 'wp_origin', type: 'waypoint', label: 'Posición Técnico (Acceso Principal)',     x: 13.0, y: 42.5 },
  ],




  edges: [
    // Chancado zone
    { from: 'node_ch1', to: 'node_ch2', distance: 12.5, surface: 'walkway', weight: 1.0 },
    { from: 'node_ch1', to: 'wp_03', distance: 21.5, surface: 'walkway', weight: 1.0 },
    { from: 'node_ch2', to: 'wp_01', distance: 17.5, surface: 'walkway', weight: 1.0 },
    { from: 'wp_01', to: 'wp_04', distance: 13.5, surface: 'walkway', weight: 1.0 },
    { from: 'wp_01', to: 'wp_05', distance: 16.5, surface: 'bridge', weight: 1.3 },
    // Perimeter access
    { from: 'wp_02', to: 'wp_03', distance: 19.0, surface: 'dirt_road', weight: 1.5 },
    { from: 'wp_02', to: 'wp_08', distance: 38.0, surface: 'dirt_road', weight: 1.5 },
    { from: 'wp_02', to: 'wp_origin', distance: 1.0, surface: 'dirt_road', weight: 1.0 },
    // Área Seca internal
    { from: 'wp_03', to: 'wp_04', distance: 12.0, surface: 'walkway', weight: 1.0 },
    { from: 'wp_03', to: 'wp_09', distance: 28.0, surface: 'dirt_road', weight: 1.5 },
    { from: 'wp_04', to: 'wp_11', distance: 39.0, surface: 'walkway', weight: 1.0 },
    // Bridge to Área Húmeda
    { from: 'wp_05', to: 'node_mol1', distance: 16.5, surface: 'bridge', weight: 1.3 },
    // Molienda zone
    { from: 'node_mol1', to: 'node_mol2', distance: 18.0, surface: 'industrial_floor', weight: 1.1 },
    { from: 'node_mol1', to: 'wp_06', distance: 25.0, surface: 'walkway', weight: 1.0 },
    { from: 'node_mol2', to: 'wp_06', distance: 10.5, surface: 'walkway', weight: 1.0 },
    { from: 'wp_06', to: 'node_cl1', distance: 6.5, surface: 'walkway', weight: 1.0 },
    { from: 'node_cl1', to: 'wp_07', distance: 14.0, surface: 'walkway', weight: 1.0 },
    { from: 'wp_07', to: 'wp_11', distance: 22.0, surface: 'walkway', weight: 1.0 },
    // Lower perimeter and relaves
    { from: 'wp_08', to: 'wp_09', distance: 16.0, surface: 'dirt_road', weight: 1.5 },
    { from: 'wp_09', to: 'wp_10', distance: 21.0, surface: 'dirt_road', weight: 1.5 },
    { from: 'wp_10', to: 'node_esp1', distance: 18.5, surface: 'dirt_road', weight: 1.5 },
    { from: 'wp_11', to: 'node_esp1', distance: 15.0, surface: 'walkway', weight: 1.0 },
    { from: 'wp_11', to: 'node_esp2', distance: 13.0, surface: 'walkway', weight: 1.0 },
    { from: 'node_esp1', to: 'node_esp2', distance: 14.0, surface: 'walkway', weight: 1.0 },
    { from: 'node_esp2', to: 'wp_12', distance: 19.0, surface: 'dirt_road', weight: 1.5 },
  ],
};

// ─── Surface color config ─────────────────────────────────────────────────────
export const SURFACE_STYLES = {
  walkway: { stroke: '#00E5FF', strokeWidth: 0.6, dash: '1.5,0.8' },
  bridge: { stroke: '#FFB800', strokeWidth: 0.7, dash: '2,1' },
  dirt_road: { stroke: '#A0784A', strokeWidth: 0.8, dash: '1,1' },
  industrial_floor: { stroke: '#8B5CF6', strokeWidth: 0.6, dash: '0' },
  stairs: { stroke: '#FF6B6B', strokeWidth: 0.6, dash: '0.8,0.8' },
};

// ─── DIJKSTRA PATHFINDING ─────────────────────────────────────────────────────
/**
 * Compute shortest path between two node IDs using weighted Dijkstra.
 * @param {string} startId - origin node id
 * @param {string} endId   - destination node id
 * @returns {{ path: string[], totalDistance: number, totalWeight: number } | null}
 */
export function dijkstra(startId, endId) {
  const { nodes, edges } = SITO_GRAPH;

  // Build bidirectional adjacency list
  const adj = {};
  for (const n of nodes) adj[n.id] = [];
  for (const e of edges) {
    const cost = e.distance * (e.weight || 1.0);
    adj[e.from]?.push({ to: e.to, cost, distance: e.distance, surface: e.surface });
    adj[e.to]?.push({ to: e.from, cost, distance: e.distance, surface: e.surface });
  }

  // Priority queue (min-heap via sorted array for small graphs)
  const dist = {};
  const prev = {};
  const visited = new Set();
  for (const n of nodes) dist[n.id] = Infinity;
  dist[startId] = 0;

  const queue = [{ id: startId, cost: 0 }];

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const { id: cur } = queue.shift();

    if (visited.has(cur)) continue;
    visited.add(cur);

    if (cur === endId) break;

    for (const neighbor of (adj[cur] || [])) {
      const newCost = dist[cur] + neighbor.cost;
      if (newCost < dist[neighbor.to]) {
        dist[neighbor.to] = newCost;
        prev[neighbor.to] = cur;
        queue.push({ id: neighbor.to, cost: newCost });
      }
    }
  }

  if (dist[endId] === Infinity) return null; // No path found

  // Reconstruct path
  const path = [];
  let cur = endId;
  while (cur !== undefined) {
    path.unshift(cur);
    cur = prev[cur];
  }

  // Calculate total straight-line distance in plant meters
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = edges.find(
      (e) =>
        (e.from === path[i] && e.to === path[i + 1]) ||
        (e.to === path[i] && e.from === path[i + 1])
    );
    if (edge) totalDistance += edge.distance;
  }

  return {
    path,
    totalDistance: Math.round(totalDistance),
    totalWeight: dist[endId],
  };
}

// ─── NODE LOOKUP HELPER ───────────────────────────────────────────────────────
export function getNodeById(id) {
  return SITO_GRAPH.nodes.find((n) => n.id === id) || null;
}

export function getAssetByNodeId(nodeId) {
  return SITO_GRAPH.assets.find((a) => a.nodeId === nodeId) || null;
}

// ─── MINUTES ESTIMATE ─────────────────────────────────────────────────────────
// Based on average industrial walking speed ~60m/min on flat surfaces
export function estimateMinutes(distanceMeters) {
  return Math.max(1, Math.round(distanceMeters / 60));
}
