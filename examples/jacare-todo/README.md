# Jacaré Todo — Example App

[![demo](https://img.shields.io/badge/demo-live-78c018.svg)](https://jacarejs.github.io/core/todo/)
[![Pages](https://github.com/jacarejs/core/actions/workflows/pages.yml/badge.svg)](https://github.com/jacarejs/core/actions/workflows/pages.yml)
[![CI](https://github.com/jacarejs/core/actions/workflows/ci.yml/badge.svg)](https://github.com/jacarejs/core/actions/workflows/ci.yml)
[![core](https://img.shields.io/npm/v/@jacare/core.svg?label=%40jacare%2Fcore&color=189030)](https://www.npmjs.com/package/@jacare/core)
[![devtools](https://img.shields.io/npm/v/@jacare/devtools.svg?label=%40jacare%2Fdevtools&color=189030)](https://www.npmjs.com/package/@jacare/devtools)
[![license](https://img.shields.io/github/license/jacarejs/core.svg?color=189030)](https://github.com/jacarejs/core/blob/main/LICENSE)

Full-featured demo for the Jacaré framework: tasks, tutorial, playground, forms, and DevTools.

Live demo: [jacarejs.github.io/core/todo](https://jacarejs.github.io/core/todo/)

Also see: [Showcase](https://jacarejs.github.io/core/showcase/) · [Scale BMI](https://jacarejs.github.io/core/bmi/) · [Lab (API tutorial)](https://jacarejs.github.io/core/lab/)

## Run locally

From the monorepo root:

```bash
yarn install
yarn build
yarn example:dev
```

Open `http://localhost:3000`

## Build

```bash
yarn example:build
```

For GitHub Pages (subpath `/core/todo/`):

```bash
JACARE_BASE=/core/todo/ yarn build
```

## Project structure

```
src/
  shell.jcr          layout + navigation
  pages/             screens (tasks, about, tutorial, playground)
  components/        Field, LessonNav
  nav.js             route map + createRoute()
  boot.js            entry + DevTools
  app-base.js        appHref() / appRoute() for GH Pages base
```

## What it shows

- Keyed `#for` task lists with immutable updates
- `createForm` + Field validation
- Tutorial routes under `/tutorial/*`
- `connectJacareDevtools()` in DEV (Pulse Graph with live values)
- GitHub Pages `base` via `JACARE_BASE` / `appHref`
