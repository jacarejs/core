# Jacaré benchmarks

Suite local para medir o caminho **runtime** (`bindText` / `effect`) vs **CPW** (Compile-Time Pulse Wiring: `peek` + `subscribe` inline).

## Cenários

| Script | O que mede |
|--------|------------|
| `pulse-update.mjs` | 1 signal → 1 text node |
| `pulse-fanout.mjs` | 1 signal → 64 text nodes |
| `run.mjs` | Executa todos e grava JSON em `results/` |

## Metodologia

1. **Ambiente:** Node 20+, `happy-dom` como DOM mínimo.
2. **Warmup:** 200 iterações descartadas antes da medição.
3. **Amostras:** 2000 updates por cenário; reportamos min, mean, p50, p95, max.
4. **Comparação:** mesmo fluxo de `signal.set()`; só muda o wiring (runtime helper vs CPW emitido pelo compilador).
5. **Alvos internos (CI regression):**

| KPI | Meta |
|-----|------|
| `pulse-update` p95 (CPW) | < 0.15 ms |
| bundle counter-app gzip | < 12 KB |
| compile `.jcr` app | < 50 ms |
| test suite | < 30 s |

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
```

## CPW em produção

O Vite plugin ativa CPW automaticamente em builds de produção (`cpw: 'auto'`, default). Dev continua com `bindText` / `bindStyleVar` para depuração mais simples.

## Próximos cenários (roadmap)

- `list-toggle` — 1000 itens, toggle 1 campo
- `mount-cold` — first paint
- `hydrate` — HTML → interactive
- `ssr-throughput` — render req/s
- `bundle` — gzip do app counter via `vite build`
