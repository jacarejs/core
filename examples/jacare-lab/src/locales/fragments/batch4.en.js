export default {
  formsPage: {
    kicker: 'API §12',
    title: 'Forms',
    lead:
      'createForm builds signal-backed fields with validation, dirty tracking, and a ready-to-wire submit handler.',
    tip:
      'Field uses bind-value (model prop) plus :error=${field.error()} so the child receives the message string. Native checkboxes still need bind-checked on a top-level pulse — that is why newsletter lives beside the form schema.',
    field: {
      name: 'Name',
      email: 'Email',
      password: 'Password',
      confirm: 'Confirm password',
      username: 'Username',
    },
    confirmPlaceholder: 'Repeat password',
    newsletter: 'Subscribe to the newsletter',
    submit: 'Submit',
    reset: 'Reset',
    yes: 'yes',
    no: 'no',
    error: {
      nameShort: 'Name is too short',
      email: 'Enter a valid email',
      mismatch: 'Passwords do not match',
      usernameShort: 'At least 3 characters',
      usernameSpaces: 'No spaces allowed',
    },
    state: 'valid: {valid} · dirty: {dirty}',
    submitted: 'Submitted:',
    empty: 'Nothing submitted yet.',
    badge: {
      nameTouched: 'name touched: {value}',
      nameDirty: 'name dirty: {value}',
      emailTouched: 'email touched: {value}',
    },
    stateHint: 'Focus and blur the fields in the schema demo above — these flip in real time.',
    demo: {
      schema: {
        title: 'Schema + validation',
        lead: 'Each field tracks its own value, error, touched, and dirty state.',
      },
      submit: {
        title: 'Submit handler + form state',
        lead:
          'handleSubmit blurs every field, validates, and only calls your callback when the form is valid.',
      },
      fieldState: {
        title: 'Field state: touched + dirty',
        lead:
          'Every field exposes its own touched and dirty signals, independent of form.valid and form.dirty.',
      },
      confirm: {
        title: 'Custom validator reading another field',
        lead:
          'The validate function closes over the password pulse and reruns whenever either value changes.',
      },
      multi: {
        title: 'Multiple validators on one field',
        lead: 'validate accepts an array — the first validator to return a message wins.',
      },
    },
  },
  lifecyclePage: {
    kicker: 'API §13',
    title: 'Lifecycle and Scope',
    lead:
      'Nav wraps each lazy screen with screen() — hooks fire in a fixed order when you enter and leave a route.',
    tip:
      'Static titles go in createNav as { use, title }. Live titles use setNavTitle inside an effect from onActivate. Use onMount for timers — always return a cleanup from it.',
    cycle: {
      badge: 'live cycle',
      title: 'Screen lifecycle flow',
      lead:
        'Enter: onActivate → onMount → mount the view. Leave: onDeactivate → onUnmount → run every cleanup.',
      codeTitle: 'screen() lifecycle order',
      diagramAria: 'Screen lifecycle diagram',
    },
    phase: {
      mounted: 'mounted',
      active: 'active',
      deactivated: 'deactivated',
      unmounted: 'unmounted',
    },
    orbit: {
      timerSuffix: 's on screen',
      note: 'This page is running the hooks below.',
      activate: {
        step: '1 · enter',
        desc: 'Analytics, registerScope',
      },
      mount: {
        step: '2 · enter',
        desc: 'Timers, subscriptions — return cleanup',
      },
      deactivate: {
        step: '3 · leave',
        desc: 'Screen hidden, still may be cached',
      },
      unmount: {
        step: '4 · leave',
        desc: 'Final teardown after dispose',
      },
    },
    legend: {
      enter: 'Enter path',
      leave: 'Leave path',
    },
    actions:
      'Leave this lesson and come back — onActivate bumps again; onDeactivate / onUnmount fire when nav disposes the screen.',
    phaseLabel: 'phase',
    demo: {
      title: {
        title: 'Screen title + setNavTitle',
        lead:
          'Static titles live in createNav. For a live tab title (countdown, totals), call setNavTitle from an effect started in onActivate.',
        note: 'See the Todo suite /focus for a live setNavTitle + timer example.',
      },
      hooks: {
        title: 'Full lifecycle export',
        lead:
          'This page exports lifecycle with all four hooks — the orbit counters above are wired to them.',
      },
      scope: {
        title: 'registerScope for DevTools',
        lead:
          'Registered values show up live in the Scope panel (bottom-left by default) while @jacare/devtools is connected.',
        note:
          'Open the Scope panel and look for "Lifecycle ticks" — it mirrors the timer in the orbit center. Use ⚙ on the Pulse Graph to move panels or Clear Scope.',
      },
      activation: {
        title: 'onActivate on every visit',
        lead:
          'Navigate away to another lesson and back — activations increments again while the onMount timer keeps counting if the screen stayed cached.',
      },
      dispose: {
        title: 'Effect dispose (same idea as onMount cleanup)',
        lead:
          "A plain effect's cleanup runs before every rerun and on final dispose — the same mechanism behind onUnmount.",
        unmountBlock: 'Unmount block',
        mountBlock: 'Mount block',
        mounts: 'mounts',
        disposals: 'disposals',
        mounted: 'This block is currently mounted.',
      },
    },
  },
  cookbookPage: {
    kicker: 'API §13b',
    title: 'Cookbook',
    lead:
      'One screen combining conditionals, loops, events, immutable updates, and two shared components.',
    tip:
      'This is the same shape as any real screen: pulses for state, plain functions for actions, and a template that reads them back.',
    task: {
      readDocs: 'Read the API docs',
      buildLesson: 'Build a lesson page',
    },
    remainingOne: '{count} left',
    remainingMany: '{count} left',
    total: 'total',
    draftPlaceholder: 'What needs to be done?',
    add: 'Add',
    delete: 'Delete',
    emptyTasks: 'No tasks yet — add one above.',
    searchPlaceholder: 'Search name or role',
    matchOne: '{count} match',
    matchMany: '{count} matches',
    emptySearch: 'Nobody matches that search.',
    role: {
      engineer: 'Engineer',
      mathematician: 'Mathematician',
    },
    demo: {
      tasks: {
        title: 'Task list',
        lead:
          'Add, toggle, and remove tasks with immutable updates so the list can reconcile efficiently.',
      },
      search: {
        title: 'Search + filter',
        lead:
          'A single derive() drives the badge count, the empty state, and the filtered list together.',
      },
    },
  },
  playgroundPage: {
    kicker: 'Live lab',
    title: 'Playground',
    lead: 'Type Jacaré source on the left — it compiles and mounts on the right as you type.',
    tip:
      'Sandbox: the preview runs your source with new Function in this browser tab — only paste code you trust. Use a full module: imports, pulses, functions, then an export view block. Presets below are complete starting points. For a full-viewport shareable editor, open Jacaré Studio.',
    link: {
      studio: 'Open Jacaré Studio',
      apiDocs: 'API docs',
      languageReference: 'Language reference',
    },
    status: {
      ready: 'Ready',
      compiling: 'Compiling…',
      live: 'Live',
      error: 'Error',
    },
    hostMissing: 'Preview host not found',
    sourceTitle: 'Source',
    previewTitle: 'Preview',
    previewNote: 'live mount',
    editorAria: 'Jacaré source editor',
    example: {
      counter: 'Counter',
      derive: 'Derive',
      list: 'List',
      if: '#if',
      case: '#case',
      events: 'Events',
      bindings: 'Bindings',
      'form-field': 'Form field',
    },
  },
  ssrPage: {
    kicker: 'API §14',
    title: 'SSR and hydration',
    lead:
      'Every .jcr file compiles to three exports — mount, render, and resume — so the same source runs on the server and the client.',
    tip:
      'This lab is served client-only, so the SSR cards below are reference demos with a live mental model — the View code always shows the full module including the view block. Under the hood, render() walks the same MountPlan as mount(), so dynamic class / attr / text stay in sync with the Binding IR.',
    hydration: {
      done: 'Hydrated — listeners attached',
      pending: 'Server HTML only — no listeners yet',
    },
    demo: {
      render: {
        title: 'render(props): server HTML + state',
        lead:
          'render() never touches the DOM — it returns escaped HTML plus a small state object describing each dynamic binding.',
        bump: 'Bump (client-only mirror)',
        note:
          "On the server this button does not exist yet — render() only produces the initial HTML for this counter's starting value.",
      },
      mental: {
        title: 'The resume() mental model',
        lead:
          'Before resume(), the button looks real but has no listener. Simulate resume() to attach it — no DOM is recreated.',
        click: 'Click me (needs resume())',
        simulate: 'Simulate resume()',
        clicks: 'Clicks after hydration:',
      },
      resume: {
        title: 'resume(target, state, props)',
        lead:
          'resume() walks state.bindings and re-attaches signal subscriptions to the existing server-rendered nodes.',
        note:
          'Hydration keeps the server HTML in place — only listeners and bindings are wired up on the client.',
      },
      string: {
        title: 'renderToString: one HTML string',
        lead: 'A thin wrapper around render() for handlers that just need a string to send.',
        note: 'Useful for classic request/response servers that buffer the full page before writing.',
      },
      stream: {
        title: 'renderToStream: chunked HTML',
        lead:
          'Splits the rendered markup into top-level chunks so a server can start flushing early.',
        note: 'Same .jcr source — only the delivery strategy changes on the server.',
      },
    },
  },
  islandPage: {
    kicker: 'API §14b',
    title: 'Island mount kit',
    lead:
      'Embed a compiled .jcr widget into any host page — static HTML, React, Vue, Angular — without making Jacaré the app shell. Import mountIsland from the thin @jacare/core/island subpath.',
    tip:
      'This lesson mounts real islands into the cards below. Full host apps live in examples/jacare-island, jacare-island-react, jacare-island-vue, and jacare-island-angular. Prefer shadow: true when the host has aggressive global CSS.',
    yes: 'yes',
    no: 'no',
    remount: 'Remount',
    dispose: 'Dispose',
    liveDemo: 'Live demo:',
    local: 'local',
    labClicks: 'Lab clicks',
    fromLabState: 'From Lab state',
    tipWidget: {
      show: 'Show tip',
      hide: 'Hide tip',
      body: 'Shadow island — host page CSS does not restyle this box.',
      topic: 'Topic:',
    },
    demo: {
      basic: {
        title: 'mountIsland — live embed',
        lead:
          'Resolve a host element, call the compiled mount, mark the host, return dispose. Same fine-grained bindings as a SPA — just no createNav shell.',
        loading: 'Loading island…',
        live: 'Live:',
        hostMark: 'Host mark',
        markSet: 'set',
        markCleared: 'cleared',
      },
      widget: {
        title: 'The widget is a normal .jcr',
        lead:
          'Contracts, pulses, scoped style — nothing special. The island kit only changes how the host mounts it.',
        note:
          'Default export of a compiled .jcr is mount. mountIsland accepts the module, module.mount, or a bare mount function.',
      },
      props: {
        title: 'Props from the host',
        lead:
          'There is no live prop bridge yet — when host state changes, dispose and remount with new props. React, Vue, and Angular wrappers use the same remount pattern.',
        label: 'Label:',
        mounted: 'mounted:',
      },
      shadow: {
        title: 'shadow: true — CSS isolation',
        lead:
          'Attaches an open shadow root, mounts into an inner Element wrapper, and injects island styles into that shadow. Host rules stay out.',
        clash:
          'This host paragraph uses a loud host class (serif + underline). The shadow tip below ignores it.',
        loading: 'Loading tip…',
        remount: 'Remount shadow',
        live: 'Shadow tip live:',
      },
      options: {
        title: 'Options: props · shadow · clear · mark',
        lead:
          'All options are optional. Defaults clear the host — drops Loading… — and set data-jacare-island on the host element.',
        props: '— object passed through to compiled mount',
        clear1: '— default',
        clear2: '; wipe host children before mount',
        mark1: '— attribute name, or',
        mark2: 'to skip',
      },
      dispose: {
        title: 'Dispose contract',
        lead:
          'Same cleanup model as SPA mount: effects, listeners, scoped styles. Always dispose on host unmount / HMR.',
        note: 'Use the Dispose button on the first card to watch the mark clear and the slot empty.',
      },
      how: {
        title: 'How mountIsland works',
        lead:
          'Seven steps — resolve host, resolve mount, resolve target — shadow wrapper — then clear, mount, mark, return dispose.',
        note:
          'Shadow mounts need an Element wrapper because bindStyleSheet / scoped styles call setAttribute on the mount target.',
      },
      subpath: {
        title: 'Why the island subpath',
        lead:
          'Main @jacare/core also exports nav, forms, SSR, and DevTools hooks. Islands stay on a thin subpath so host bundles stay small.',
        note: 'The widget still imports pulse / derive from core — Vite tree-shakes unused symbols.',
      },
      static: {
        title: 'Static HTML host',
        lead: 'WordPress, Rails, or any static page: a div + a module script is enough.',
      },
      vite: {
        title: 'Vite host config',
        lead: 'Add the jacare plugin next to React, Vue, or Angular JIT so .jcr imports compile.',
        note:
          "Without the plugin, import X from './X.jcr' fails. Pre-bundling the widget as JS is the other option.",
      },
      react: {
        title: 'React host wrapper',
        lead: 'ref + useEffect: mount on mount, dispose on cleanup, remount when props change.',
      },
      vue: {
        title: 'Vue 3 host wrapper',
        lead: 'onMounted + watch + onBeforeUnmount — same dispose discipline.',
      },
      angular: {
        title: 'Angular host wrapper',
        lead:
          'AfterViewInit + OnChanges + OnDestroy with classic Input decorators — signal inputs skip ngOnChanges.',
        escape: 'Escape @ in Angular templates as &#64;.',
      },
    },
    aside: {
      title: 'Also see',
      ssr: 'SSR §14',
      module: 'Module exports',
      guide: 'Full guide:',
      api: '· API:',
    },
  },
  toolingPage: {
    kicker: 'API §16 - §19',
    title: 'Tooling',
    lead:
      'The CLI, Vite plugin, Binding IR, compiler, DevTools — and the VS Code extension for .jcr files.',
    tip:
      'DevTools: top-bar toggle (DevTools on/off). Overlay tabs: State | Mesh | Scope (↗ pops out). Prefer the Chrome extension tab Jacaré for simpler debug. Try /bag for Mesh, Lifecycle for Scope, /binding-ir for the compiler forest.',
    demo: {
      named: {
        title: 'Named pulses + DOM highlight',
        lead: 'Compiler injects { name, file, line } in DEV. Hover a State node to outline this counter.',
      },
      cli: {
        title: 'CLI commands',
        lead:
          'jacare new / dev / build / compile / check wrap Vite and the compiler. Pass --bindings for IR sites, --routes for static jacare-go vs createNav screens.',
      },
    },
    vscode: {
      alt: 'Jacaré available in the VS Code Marketplace',
      title: 'Jacaré for VS Code',
      body:
        'Syntax highlighting (JS + optional // @jacare-ts / *.jcr.ts), snippets (screen/nav/a11y), class:/style: aliases, Lab lesson command — install from the Marketplace.',
    },
    uiKit: {
      title: 'Jacaré UI (official)',
      body:
        'Accessible, themeable components for Jacaré apps — Button, Field, Card, Dialog, forms, pickers, and more — powered by signals with no virtual DOM. npm: @jacare/ui.',
      link: 'Official docs → jacarejs.github.io/ui',
    },
    typescript: {
      title: 'TypeScript (optional)',
      body1: 'Sibling',
      body2: 'or import from',
      body3: '— reference cards (no live mount):',
    },
    card: {
      checkBindings: {
        title: 'jacare check --bindings',
        body:
          'Prints every lowered binding site from the Binding IR — the same classification used for client and SSR emit.',
      },
      checkRoutes: {
        title: 'jacare check --routes',
        body:
          'Opt-in: compares static jacare-go="/…" targets to createNav screen patterns. Dynamic links are skipped.',
      },
      expression: {
        title: 'Expression style',
        body:
          'Prefer bare calls when there is no loop local. jacare check warns on redundant nullary arrows.',
      },
      bindingIr: {
        title: 'Binding IR (compiler)',
        body1: 'Templates lower once into MountPlan; mount() and render() walk the same forest.',
        body2: 'Full lesson:',
      },
      vite: {
        title: 'Vite plugin options',
        body: 'emit and cpw default to "auto" — production client builds get CPW automatically.',
      },
      compiler: {
        title: 'Compiler API',
        body: 'Use @jacare/compiler directly to inspect generated code outside of Vite.',
      },
      devtools: {
        title: 'DevTools',
        body: 'State shows named pulses + DOM highlight; Scope shows registerScope() entries.',
      },
      testing: {
        title: 'Testing',
        body: 'Compile + mount in Vitest with happy-dom for full integration coverage.',
      },
      scripts: {
        title: 'package.json scripts',
        body: 'A typical project wires dev / build / check / test straight to the CLI.',
      },
    },
  },
  helpersPage: {
    kicker: 'API §20',
    title: 'Import catalog',
    lead1:
      'Every importable symbol with a short summary, a detailed explanation, the import line, and a minimal example. Full tables also live in',
    lead2: '§20.',
    tip:
      'Prefer pulse / derive / watch in new code. DOM helpers (bindText, branch, …) are usually emitted from .jcr syntax — you write ${count}, not the helper call. Filter by package or search the explanations.',
    filterPlaceholder: 'Filter by name, package, explanation…',
    filterAll: 'all',
    countOf: 'of',
    countSymbols: 'symbols',
    importLabel: 'Import',
    exampleLabel: 'Example',
    openLesson: 'Open lesson',
    empty: 'No symbols match that filter.',
  },
  topicParamPage: {
    kicker: 'Param route',
    titlePrefix: 'Topic:',
    lead:
      'Mounted from /topic/:slug — the slug segment is passed as a mount prop. No manual URL parsing.',
    tip:
      'createNav merges ctx.params and ctx.search into the props object passed to mount() — every :name segment becomes a same-named prop on the screen. Template sugar ${@route/slug} reads the same param via getRouteParam (createRoute still preferred in JS).',
    back: '← Back to Navigation',
  },
  notFoundPage: {
    kicker: '404',
    title: "This lesson doesn't exist yet",
    lead1: "The route you followed doesn't match any screen in",
    lead2: '. Head back to the start and pick a lesson from the sidebar.',
    back: '← Back to Start',
  },
}
