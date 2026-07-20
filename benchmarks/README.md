# Jacaré benchmarks

Suite local para medir o caminho **runtime** (`bindText` / `effect`) vs **CPW** (Compile-Time Pulse Wiring: `peek` + `subscribe` inline), além de listas, mount, SSR e bundle.

## Cenários

| Script | O que mede |
|--------|------------|
| `pulse-update.mjs` | 1 signal → 1 text node |
| `pulse-fanout.mjs` | 1 signal → 64 text nodes |
| `list-toggle.mjs` | 1000 keyed items, toggle 1 campo |
| `mount-cold.mjs` | Cold mount de um counter compilado |
| `hydrate.mjs` | HTML SSR → `resumeBindings` (text) |
| `ssr-throughput.mjs` | Render de lista (ops/s) |
| `compile-app.mjs` | `compile()` de um `.jcr` counter-style |
| `bundle.mjs` | gzip do counter fixture via `vite build` |
| `run.mjs` | Executa todos e grava JSON em `results/` |

## Metodologia

1. **Ambiente:** Node 20+, `happy-dom` como DOM mínimo.
2. **Warmup:** descartado antes da medição (varia por cenário).
3. **Amostras:** tipicamente 300–2000 updates; reportamos min, mean, p50, p95, max.
4. **Comparação (pulse):** mesmo fluxo de `signal.set()`; só muda o wiring (runtime helper vs CPW).
5. **Alvos internos:**

| KPI | Meta |
|-----|------|
| `pulse-update` p95 (CPW) | < 0.15 ms |
| `pulse-fanout` p95 (CPW) | < 0.5 ms |
| `list-toggle` p95 | < 8 ms |
| `mount-cold` p95 | < 2 ms |
| `hydrate` p95 | < 1 ms |
| `ssr-throughput` | ≥ 2000 ops/s |
| `compile-app` p95 | < 50 ms |
| bundle counter gzip | < 12 KB |

*Metas vs React/Vue/Solid são aspiracionais — validar com cenários reais antes de publicar números de marketing.*

## Uso

```bash
yarn build
yarn bench
```

Cenário individual:

```bash
node benchmarks/pulse-update.mjs
node benchmarks/pulse-fanout.mjs
node benchmarks/list-toggle.mjs
node benchmarks/mount-cold.mjs
node benchmarks/hydrate.mjs
node benchmarks/ssr-throughput.mjs
node benchmarks/compile-app.mjs
node benchmarks/bundle.mjs
```

## CPW em produção

O Vite plugin ativa CPW automaticamente em builds de produção (`cpw: 'auto'`, default). Dev continua com `bindText` / `bindStyleVar` para depuração mais simples.

## Fixture de bundle

`benchmarks/fixtures/counter` — counter mínimo compilado com `@jacare/vite-plugin` (CPW on). O script `bundle.mjs` roda `vite build` e soma o gzip de `js` / `css` / `html`.
