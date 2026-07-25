# vite-nav

Multi-page Jacaré starter: layout shell, lazy screens, route titles, and `createRoute`.

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run check
```

## Layout

```
src/
  shell.jcr          layout + jacare-frame + jacare-go links
  nav.js             createNav({ screens: { use, title } }) + createRoute
  boot.js            nav.attach(#app)
  pages/
    home.jcr         eager (screen())
    about.jcr        lazy
    not-found.jcr    missing
```

## Canonical nav pattern

```js
export const nav = createNav({
  layout: Shell,
  screens: {
    '/': { use: screen(Home), title: 'Home · Jacaré' },
    '/about': { use: lazy(() => import('./pages/about.jcr')), title: 'About · Jacaré' },
  },
  missing: NotFound,
})
export const route = createRoute(nav.where)
```

Docs: [api.md §11](https://github.com/jacarejs/core/blob/main/docs/api.md#11-navigation) · Lab [`/nav`](https://jacarejs.github.io/core/lab/#/nav)
