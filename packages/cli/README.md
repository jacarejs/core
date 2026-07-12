# @jacare/cli

Command-line tool to create, develop, and build Jacaré applications.

## Install

```bash
npm install -g @jacare/cli
```

Or use without installing globally:

```bash
npx @jacare/cli new my-app
```

## Commands

```bash
jacare new <name> [--template=minimal|nav|todo]
jacare dev [--port=3000] [--open=false]
jacare build
jacare compile <file.jcr> [output.js] [--watch]
jacare check
```

## Create a project

```bash
jacare new my-shop --template=todo
cd my-shop
jacare dev
```

## Project layout

```
my-app/
  src/
    app.jcr
    boot.js
  index.html
  public/
  jacare.config.js
  jacare.d.ts
```

## Config

`jacare.config.js`:

```javascript
export default {
  title: 'My App',
  port: 3000,
  base: '/',
}
```

## Links

- [Repository](https://github.com/jacarejs/core)
- [Live demo](https://jacarejs.github.io/core/)

## License

MIT
