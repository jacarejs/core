export default {
  shell: {
    brandTag: 'Complete API tutorial',
    lessonsNav: 'Lessons',
    menuClose: 'Close',
    menuOpen: 'Lessons',
    topbarHint: 'Live demos · View code opens the source for each example',
    viewCode: 'View code',
    devtoolsOn: 'DevTools on',
    devtoolsOff: 'DevTools off',
    devtoolsTitle: 'Toggle Jacaré DevTools overlay',
    footer: 'Made in Brazil',
    localeLabel: 'Language',
    close: 'Close',
    copy: 'Copy',
    copied: 'Copied',
    copyFailed: 'Failed',
    copyCode: 'Copy code',
    reset: 'Reset',
    clicks: 'Clicks',
  },
  bagTree: {
    parentLabel: 'Parent · reads cart.count',
    parentNote: 'Items in bag:',
    childLabel: 'Child · reads cart.money',
    childNote: 'Total:',
    grandLabel: 'Grandchild · no bag import (pass-through)',
    grandNote: 'This level only nests — it never touches the bag.',
    leafLabel: 'Great-grandchild · writes cart.add',
    leafNote: 'Deep leaf imports the same bag — no props from ancestors.',
    leafAdd: 'Add from leaf',
    leafCount: 'count',
  },
  lesson: {
    start: {
      title: 'Start',
      blurb: 'Lab overview, install notes, and lesson index',
    },
    'quick-start': {
      title: 'Quick start',
      blurb: 'API §1 — scaffold, app.jcr, boot.js, HTML shell',
    },
    module: {
      title: 'Module format',
      blurb: 'API §2 — .jcr layout, view/style syntax, compiled exports',
    },
    typescript: {
      title: 'TypeScript',
      blurb: '// @jacare-ts · sibling *.jcr.ts · jacare.d.ts — optional types',
    },
    language: {
      title: 'Language reference',
      blurb: 'Reserved words, @route, jacare-when, runtime map, CLI',
    },
    'binding-ir': {
      title: 'Binding IR',
      blurb: 'MountPlan · check --bindings · one forest for client/SSR/CPW',
    },
    reactivity: {
      title: 'Reactivity',
      blurb: 'signal, computed, effect, batch, Patience, untrack, aliases',
    },
    bag: {
      title: 'Pulse bags',
      blurb: 'Shared mesh, Mesh Ports, lazy publish — native & light',
    },
    templates: {
      title: 'Templates',
      blurb: 'Text, attributes, style--- CSS variables',
    },
    bindings: {
      title: 'Bindings',
      blurb: 'bind-value, class-*, style vars, Binding IR + CPW',
    },
    events: {
      title: 'Events',
      blurb: 'on-*, @*, keyboard, pointer, stopPropagation',
    },
    debug: {
      title: 'Debug',
      blurb: '<debug> syntax — JSON panels, label, copy, shorthand',
    },
    why: {
      title: 'Why',
      blurb: '$why · Why card · ReactiveCycleError · jacare why file:line',
    },
    if: {
      title: '#if',
      blurb: 'Branches, jacare-when, nested conditions, empty states',
    },
    case: {
      title: '#case',
      blurb: 'Match one value — #when arms, #else fallback',
    },
    for: {
      title: '#for',
      blurb: 'Keyed lists, reorder, fragments, stable parents',
    },
    components: {
      title: 'Components',
      blurb: 'Props, slots, contracts, emit, model bind-',
    },
    css: {
      title: 'Scoped CSS',
      blurb: 'export <style>, isolation, :global, reactive if/for/case',
    },
    nav: {
      title: 'Navigation',
      blurb: 'createNav, createRoute, @route, focus grip, guards',
    },
    forms: {
      title: 'Forms',
      blurb: 'createForm, Field, validate, submit, reset',
    },
    lifecycle: {
      title: 'Lifecycle',
      blurb: 'onMount, onActivate, dispose, registerScope',
    },
    cookbook: {
      title: 'Cookbook',
      blurb: 'Tasks screen combining if + for + events + props',
    },
    playground: {
      title: 'Playground',
      blurb: 'Type .jcr source and see a live mount',
    },
    ssr: {
      title: 'SSR',
      blurb: 'render, resume, streaming — reference cards',
    },
    island: {
      title: 'Islands',
      blurb: 'API §14b — mountIsland, shadow, React/Vue/Angular hosts',
    },
    tooling: {
      title: 'Tooling',
      blurb: 'CLI, check --bindings/--routes, why file:line, Binding IR, DevTools',
    },
    helpers: {
      title: 'Import catalog',
      blurb: 'Every import — summary, explanation, import line, example',
    },
    i18n: {
      title: 'i18n',
      blurb: 'createI18n, t({name}), <select>, te() — en / pt-BR / es',
    },
    ui: {
      title: 'Jacaré UI',
      blurb: '@jacare/ui — official components, theme, live demos',
    },
  },
  home: {
    title: 'Jacaré Lab',
    lead:
      'A complete, live tour of the API — every lesson pairs a short explanation with a running demo. Open View code to see the source.',
    github: 'GitHub repository',
    tip: 'Every Demo card below has a "View code" button in its header — it opens the exact source for that example in a modal.',
    whatTitle: 'What is Jacaré?',
    whatBody1:
      'Jacaré is a compile-time front-end framework for building fast, reactive web apps with plain JavaScript. You write .jcr modules — normal JS plus an HTML-like view — and the compiler turns them into direct DOM updates. No virtual DOM, no whole-tree re-renders: when state changes, only the nodes that depend on it update.',
    whatBody2:
      'This lab is a guided tour of that API. Each lesson ships a live demo and a View code button so you can read the exact source that is running.',
    installTitle: 'Install',
    installBody1: 'Scaffold a new app with the official create package (npm, pnpm, or yarn all work):',
    installBody2: 'Or install the CLI globally and scaffold with jacare new:',
    startTitle: 'Start a project',
    startBody1:
      'From the project folder, start the dev server with npm run dev (create-jacare) or jacare dev (CLI scaffold). Create-jacare and jacare new apps default to http://localhost:3000.',
    startBody2:
      'Edit src/app.jcr (or the screens under src/pages/ if you picked a nav template) and the page hot-reloads. When you are ready to explore the full API, walk the lessons in the sidebar — or jump into the Playground and type.',
    hello: 'Hello, {name}!',
    namePlaceholder: 'Your name',
    demo: {
      quick: {
        title: 'Quick start',
        lead: 'A pulse, a button, one line of reactive text — the smallest possible Jacaré app.',
        note: 'This is the whole counter shown in the code panel — no extra wiring.',
      },
      boot: {
        title: 'App boot pattern',
        lead: 'How boot.js wires app.css, the nav, and hot reload together in this lab.',
        note: 'Jacaré Lab boots through nav.attach(root) — the same pattern every navigation lesson builds on.',
      },
      greeting: {
        title: 'A signal and a derive, together',
        lead: 'Every lesson in this lab is a variation on these two calls.',
      },
      highlight: {
        title: 'A class toggled from a signal',
        lead: 'The bindings and CSS lessons build entirely on this one idea.',
        badge: 'Lesson preview',
        toggle: 'Toggle class',
      },
    },
  },
  i18nPage: {
    kicker: '@jacare/ui · i18n',
    title: 'Internationalization',
    lead:
      'Wire createI18n once, keep strings in locale files, and call t() / translate() inside views so every label updates when the locale changes — no remount, no virtual DOM.',
    tip:
      'Call t() inside the template (or inside a derive that reads locale). Do not store t() results in module-level consts or arrays — keep keys and translate when rendering. The Lab’s t() returns a string so :title=${t(...)} and placeholders stay reactive.',
    yes: 'yes',
    no: 'no',
    hello: 'Hello, {name}!',
    helloFallback: 'friend',
    nameLabel: 'Your name',
    namePlaceholder: 'Type a name…',
    sampleTitle: 'Welcome',
    sampleBody: 'This Card / Button pair is plain @jacare/ui — titles and copy come from locale files and update with the top-bar language.',
    sampleAction: 'Try another language',
    links: {
      docs: 'Jacaré UI docs',
      components: 'Components',
      github: 'GitHub · @jacare/ui',
    },
    api: {
      title: 'API surface · @jacare/ui/i18n',
      lead: 'One active instance from createI18n. Lab re-exports helpers from src/i18n.js.',
      createI18n: 'Boot the store: locale, fallbackLocale, messages, persist (localStorage j-locale).',
      t: 'Lab: immediate string. Package default returns a derive — wrap or call () if you use it raw.',
      translate: 'Immediate string (package: t(key)()). Prefer in scripts / derive bodies.',
      setLocale: 'Switch locale, update <html lang>, persist when enabled.',
      locale: 'Current locale signal — bind with :value=${locale} on a <select>.',
      te: 'true when the key exists in the active locale or fallback.',
      availableLocales: 'Locale ids present in the messages object.',
      addMessages: 'Merge more keys into a locale at runtime (bumps a revision signal).',
    },
    demo: {
      live: {
        title: 'Live UI strings',
        lead: 't() in text and :title props — change the language and this card updates in place.',
      },
      params: {
        title: 'Interpolation · {name}',
        lead: 'Pass a params object. Placeholders use {word} syntax and update with both locale and input.',
        note: 'Empty input falls back to a translated default (“friend” / “amigo” / …).',
      },
      select: {
        title: '@jacare/ui Select',
        lead: 'Same pattern as the Lab top bar: bind-value on the locale pulse + setLocale on change (persists j-locale).',
        label: 'Locale on this page',
        note: 'Selection persists across reloads via localStorage (key j-locale). After F5 the Select shows the saved locale.',
      },
      inspect: {
        title: 'Inspect locale helpers',
        lead: 'locale(), te(), and availableLocales() are reactive — switch language and watch the rows.',
      },
      messages: {
        title: 'Message catalogs',
        lead: 'Nest keys by feature. Keep the same tree in every locale file.',
        note: 'This Lab merges en / pt-BR / es bases with fragment files under src/locales/fragments/.',
      },
      pitfalls: {
        title: 'Pitfalls',
        lead: 'These are the mistakes that make translations look “stuck” or half-translated.',
      },
    },
    inspect: {
      locale: 'Active: {locale}',
      teKnown: 'exists → {value}',
      teMissing: 'exists → {value}',
      available: '{list}',
    },
    pitfalls: {
      badTop: '❌ const title = t("…") at module top',
      goodTop: '✅ ${t("…")} inside the view',
      badArray: '❌ { label: t("…") } in a static array',
      goodArray: '✅ { labelKey: "…" } then t(row.labelKey)',
      badDerive: '❌ Pass package derive into bindProp without ()',
      goodDerive: '✅ Lab string t() — or call derive() yourself',
    },
    uiKit: {
      title: 'Jacaré UI — official component library',
      body:
        '@jacare/ui is the official component kit for Jacaré: accessible, themeable controls powered by signals, with no virtual DOM. Install alongside @jacare/core and import Button, Field, Card, Dialog, and theme helpers.',
      item1: 'Buttons, fields, forms, dialogs, selects, date/time pickers, and more',
      item2: 'Theme, density, and motion tokens via @jacare/ui/theme',
      item3: 'Built-in i18n module at @jacare/ui/i18n (createI18n / t / setLocale)',
      linkDocs: 'Official docs → jacarejs.github.io/ui',
      linkComponents: 'Components catalog',
      linkGithub: 'Source on GitHub',
    },
  },
  uiPage: {
    kicker: '@jacare/ui',
    title: 'Official UI kit',
    lead:
      'Accessible, themeable Jacaré components powered by signals — no virtual DOM. Install @jacare/ui beside @jacare/core and import deep paths such as @jacare/ui/Button.',
    tip:
      'This Lab already loads @jacare/ui/theme.css and applyTheme("system") in boot.js. The top-bar language control is @jacare/ui/Select bound to the persisted locale pulse (localStorage j-locale). Prefer deep imports (@jacare/ui/Card).',
    yes: 'on',
    no: 'off',
    pillarsHeading: 'Why @jacare/ui',
    pillars: {
      signal: {
        title: 'Signals, not VDOM',
        body: 'Same pulse graph as Jacaré core — only bound nodes update.',
      },
      theme: {
        title: 'One token sheet',
        body: 'theme.css + applyTheme / density / motion for the whole kit.',
      },
      contract: {
        title: 'Contracts first',
        body: 'Props, slots, and emits live in each .jcr — docs stay honest.',
      },
    },
    links: {
      docs: 'Docs · jacarejs.github.io/ui',
      github: 'GitHub · jacarejs/ui',
      components: 'Components catalog',
      i18n: 'i18n guide',
      theme: 'Theme tokens',
      fullCatalog: 'Full catalog with live demos →',
      select: 'Select docs',
      selectDocs: 'Select component docs →',
    },
    demo: {
      install: {
        title: 'Install + theme boot',
        lead: 'Peer @jacare/core ^0.1.15. Import theme.css once, then apply preferences.',
        note: 'Lab already runs this pattern in src/boot.js.',
      },
      card: {
        title: 'Card · Button · Badge',
        lead: 'Surface + primary action + status pill — the smallest useful composition.',
        cardTitle: 'Profile',
        body: 'These are real @jacare/ui mounts, not Lab-only wrappers.',
        badge: 'Official',
        save: 'Save',
        reset: 'Reset',
        clicks: 'presses · {count}',
      },
      form: {
        title: 'Field · Switch',
        lead: 'bind-value / bind-checked wire pulses straight into the kit models.',
        nameLabel: 'Name',
        namePlaceholder: 'Ada Lovelace',
        nameHint: 'Typed value stays on a pulse — no form library required for a single field.',
        notify: 'Email me updates',
        greeting: 'Hello, {name} · notify {notify}',
        anon: 'friend',
      },
      select: {
        title: 'Select',
        lead: 'Searchable dropdown from @jacare/ui/Select — bind-value to a pulse, pass { value, label } options.',
        label: 'Role',
        placeholder: 'Pick a role',
        viewer: 'Viewer',
        editor: 'Editor',
        admin: 'Admin',
        summary: 'Selected role: {role}',
      },
      display: {
        title: 'Avatar · Text · Divider',
        lead: 'Compose display primitives with Stack — same tokens as the rest of the kit.',
        name: 'Ada Lovelace',
        badge: 'Contributor',
        divider: 'Details',
        note: 'Signals, no virtual DOM — Text tone="muted" for secondary copy.',
      },
      controls: {
        title: 'Checkbox · Rate · Slider · InputNumber · Spinner',
        lead: 'More form/feedback controls on pulses — toggle Spinner to see busy state.',
        accept: 'I agree to the demo terms',
        qty: 'Quantity',
        spin: 'Show spinner',
        stop: 'Hide spinner',
        saving: 'Saving…',
        summary: 'agree {accepted} · stars {rating} · volume {volume} · qty {qty}',
      },
      feedback: {
        title: 'Alert · Progress',
        lead: 'Inline status and a determinate bar — both reactive to pulses.',
        alertTitle: 'Heads up',
        alertBody: 'Powered by Jacaré signals — the Progress value below is a pulse.',
        progressLabel: 'Upload',
        bump: 'Bump progress',
      },
    },
    catalog: {
      title: 'What ships',
      lead: 'A short map of the catalog. Open the docs for every prop, slot, and live demo.',
      forms: 'Forms & inputs (plus Autocomplete, Select, Date/Time, Upload, …)',
      display: 'Data display surfaces',
      feedback: 'Inline feedback & loading',
      overlay: 'Modals and confirmations',
      layout: 'Layout primitives',
      chrome: 'App chrome helpers + icons',
    },
  },
}
