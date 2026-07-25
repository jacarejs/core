# vite-todo

Todo starter with navigation, `pulse` state, lists (`#for`), and lazy About.

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
  shell.jcr
  nav.js             createNav + createRoute (canonical { use, title })
  boot.js            import './app.css' + attach
  app.css            global styles
  pages/
    tasks.jcr        pulse list + bind-value
    about.jcr
    not-found.jcr
```

Docs: [api.md §11](https://github.com/jacarejs/core/blob/main/docs/api.md#11-navigation) · Lab [`/nav`](https://jacarejs.github.io/core/lab/#/nav) · Lab [`/for`](https://jacarejs.github.io/core/lab/#/for)
