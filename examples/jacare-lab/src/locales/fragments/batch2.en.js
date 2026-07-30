export default {
  bag: {
    kicker: 'API · Pulse bags',
    title: 'Pulse bags',
    lead:
      'Jacaré’s own shared-state model: named pulses on an addressable mesh, wired at compile time — light, native, and built on the same cells as local reactivity.',
    tip:
      'Prefer bare cart.count() or ${@cart/count} when there is no loop local. Factory stays lazy until first property read — unused bag modules tree-shake out. Compiled views emit /* jacare-mesh-ports: … */ for ports they touch.',
    products: {
      tea: 'Mate tea',
      cap: 'Cap',
      zine: 'Zine',
    },
    mesh30: {
      title: 'Mesh 30s — no useStore()',
      lead:
        'One bag, two screens, one address. Read this card (~30s), tap Add, watch both badges move — then open the real checkout screen.',
      step1: 'publish ports on the Mesh',
      step2: 'via',
      step3: 'no import',
      screenA: 'Screen A',
      screenB: 'Screen B',
      screensAria: 'Two screens sharing one bag',
      openCheckout: 'Open real Screen B · /bag/checkout',
      sameBag: 'Same bag id',
      bookmarkable: 'bookmarkable URL.',
    },
    arch: {
      title: 'Architecture · Pulse Mesh + Pulse Bag',
      lead:
        'This is a Jacaré-native design — not a port of another store library. The pulse / DependencyCell graph already existed; Pulse Mesh makes those cells addressable (@cart/total), and Pulse Bag is the DX that publishes a named group with createBag. Any .jcr plugs in via import, contract links, or address sugar — same cell, O(1) update.',
      diagramAria: 'Pulse Mesh layers',
      idea: {
        title: 'The idea',
        body:
          'Share state across any component without props drilling and without a second reactivity system. A write goes into a pulse; only DOM (and derives) that actually read that cell update — the mesh is the existing graph, with stable addresses for tooling and compile wiring.',
        item1: 'No provider / context wrapper around the tree',
        item2: 'No store proxy or parallel state object',
        item3: 'Mutations use ripple() (one flush wave), not a dispatcher',
      },
      how: {
        title: 'How it works',
        body:
          'createBag registers an id. The factory runs on the first property read (lazy publish). Cells get stable addresses for DevTools and SSR snap. Templates that read cart.count or @cart/count lower to Mesh Ports — bindText(node, cell) / CPW peek+subscribe — the cell pointer is fixed at mount.',
        item1: 'ripple = batch + mesh meta (one flush wave)',
        item2: 'snap / hydrate / soft reset keep cell identity',
        item3: 'Mesh tab in DevTools lists @id/key and last ripple',
      },
      light: {
        title: 'Why it’s light & native',
        body:
          'Bags are not a second reactivity system. They name and group the pulses you already know. Runtime is a thin registry + lazy ensure. Hot path matches a local pulse once the Mesh Port is wired.',
        item1: 'Ships in @jacare/core — no extra store package',
        item2: 'Unused bag modules tree-shake (never imported → not in the chunk)',
        item3: 'Compiler emits /* jacare-mesh-ports: … */ slice hints',
        item4: 'Caps via contract links (read / write / mirror) without Inject',
      },
      shipped: {
        title: 'What shipped',
        body: 'Capabilities you can exercise in the demos below.',
        item1: 'createBag, ripple, snap / hydrate / soft reset',
        item2: 'DevTools Mesh (@lab-cart/*, pop-out)',
        item3: 'Mesh Port IR — cart.count binds the cell directly',
        item4: 'Contract links + jacare check for published ports',
        item5: 'Lazy factory + /* jacare-mesh-ports */ slice hints',
        item6: 'Address sugar @bag/key via getBag',
      },
    },
    demo: {
      define: {
        title: 'createBag + live cart',
        lead: 'Add from the catalog — count and total update through the same bag instance.',
        clear: 'Clear bag',
      },
      use: {
        title: 'Same bag, another view',
        lead: 'A second surface imports the identical bag — no props, no provider.',
        empty: 'Cart is empty.',
        remove: 'Remove',
      },
      links: {
        title: 'Contract links (no bag import)',
        lead:
          'Reusable leaf declares links in the contract — getBag resolves @lab-cart/* at mount. jacare check verifies the port is published.',
      },
      lazy: {
        title: 'Lazy publish',
        lead:
          'Importing the bag module only registers the id. The factory runs on the first property read — factory runs stay at 0 until you touch the bag.',
        runs: 'factory runs',
        touch: 'Touch bag',
        bump: 'Bump (also publishes)',
        note:
          'Mesh stays unpublished until the first property read. Open DevTools → Mesh for @lab-lazy/*.',
      },
      address: {
        title: 'Address sugar @bag/key',
        lead:
          'No bag import — @lab-cart/count and @lab-cart/clear resolve via getBag at the mesh address.',
        clear: 'Clear via @lab-cart/clear',
      },
      tree: {
        title: 'Parent → child → grandchild → leaf',
        lead:
          'Four nested components on a separate bag (lab-tree). Parent/child read; leaf writes. Live cart above stays on lab-cart.',
      },
      snap: {
        title: 'snap / hydrate / reset',
        lead:
          'Persist writable pulses, restore them, or soft-reset to factory defaults (same cells — UI stays live).',
        snap: 'Snap to session',
        hydrate: 'Hydrate',
        reset: 'Reset bag',
      },
    },
    mesh30Catalog: {
      screenLabel: 'Screen A · Catalog',
      badgeTitle: 'Import path: mesh30.count',
      cart: 'cart',
      lead: 'Import the bag and call ripple via add.',
      add: 'Add',
      items: {
        tea: 'Tea',
        cap: 'Cap',
        zine: 'Zine',
      },
    },
    mesh30Chrome: {
      screenLabel: 'Screen B · Chrome',
      badgeTitle: 'Address sugar — no bag import',
      inCart: 'in cart',
      lead: 'Same cells via address sugar — no import in this file.',
      clear: 'Clear via @lab-mesh30/clear',
    },
  },
  bagCheckout: {
    kicker: 'Mesh 30s · Screen B',
    title: 'Checkout chrome',
    leadStart:
      'This screen never imports the bag module for reads — only the address sugar. Add items on',
    leadEnd: ', then come back: the badge stays in sync.',
    tip:
      'Side-effect import registers the bag once. The template only uses address sugar — same Mesh Port as Screen A on /bag.',
    sharedBadge: 'Shared badge',
    clear: 'Clear cart',
    back: 'Back to Mesh 30s',
  },
  templates: {
    kicker: 'API §4',
    title: 'Templates',
    lead:
      'Templates compile at build time — the compiler emits direct DOM calls and binding hooks, never a virtual tree.',
    tip:
      'A bare ${signal} in text compiles to a text binding. As soon as you mix it with other text or call it, the compiler falls back to an effect — always write ${name()} in mixed text.',
    demo: {
      text: {
        title: 'Bare vs mixed text',
        lead:
          'Bare ${name} compiles to a text binding. Mix static text with a signal and you must call it — Hello, ${name()}!',
        placeholder: 'Type a name',
        bare: 'Bare',
        mixed: 'Mixed',
        hello: 'Hello, {name}!',
      },
      attr: {
        title: 'Static attribute vs :src / bind-href',
        lead: 'A plain string attribute never changes; :src and bind-href track a signal.',
        staticTitle: 'This title never changes',
        staticBadge: 'Static attribute',
        avatarAlt: 'Avatar',
        swapSrc: 'Swap :src',
        reactiveLink: 'Reactive link',
        swapHref: 'Swap bind-href',
      },
      progress: {
        title: 'Reactive CSS variable: style---pct',
        lead: 'style---name binds a signal straight to a CSS custom property.',
      },
      multiAttr: {
        title: 'Multiple reactive attributes on one element',
        lead: ':disabled and :title both track derived signals on the exact same button.',
        seats: '{booked} / {max} seats booked',
        book: 'Book a seat',
      },
      trend: {
        title: 'Conditional text + class from expressions',
        lead:
          'trendLabel is a ternary inside derive(); the badge classes come from inline expressions, not bare signals.',
        up: '▲ Up',
        down: '▼ Down',
        flat: '– Flat',
      },
    },
  },
  bindings: {
    kicker: 'API §5',
    title: 'Bindings',
    lead:
      'bind-value / bind-checked wire two-way inputs. class-* toggles a class. style---* binds a signal to a CSS custom property. Client and SSR share one Binding IR — the compiler classifies each site once.',
    tip:
      'Prefer bare expressions when there is no loop local to capture — ${count()} and ${() => count()} both react; the first is Jacaré style. Use an arrow for #for items and handlers. jacare check warns on redundant nullary arrows (CPW still inlines class-*, style---*, and one-way bind-* in production).',
    demo: {
      mirror: {
        title: 'bind-value / bind-checked mirrors',
        lead: 'Both inputs on each row are bound to the exact same pulse — type or toggle either one.',
        placeholder: 'Type here',
        mirrorPlaceholder: 'Mirrors the field above',
        agree: 'Agree',
        mirrorCheckbox: 'Mirrors the checkbox',
      },
      classes: {
        title: 'class-active / class-done',
        lead: 'A class-<name> binding toggles that class based on a boolean.',
        tasks: {
          docs: 'Read the docs',
          demo: 'Build a demo',
          ship: 'Ship it',
        },
      },
      gauge: {
        title: 'style--- gauge',
        lead: 'The gauge-mini class reads a --angle custom property set by style---angle.',
      },
      number: {
        title: 'bind-value on a number input',
        lead: 'bind-value coerces automatically — quantity is a plain number, not a string.',
      },
      multiClass: {
        title: 'Several class-* bindings on one element',
        lead: 'Each button carries three independent class-* toggles at once.',
        levels: {
          low: 'low',
          medium: 'medium',
          high: 'high',
        },
      },
    },
  },
  events: {
    kicker: 'API §6',
    title: 'Events',
    lead:
      'on-* and @* both wire a real addEventListener with automatic cleanup on unmount. Any DOM event name works.',
    tip:
      'Prefer named handlers for readability. Inline arrows are great inside loops when you need to capture the current item. For text fields, prefer bind-value — use on-input / on-change when you need the raw event.',
    demo: {
      click: {
        title: 'Named handler vs @click',
        lead: 'on-click and @click compile to the exact same addEventListener call.',
        named: 'on-click (named)',
        inline: '@click (inline)',
        clicks: 'Clicks',
      },
      loop: {
        title: 'Inline arrow inside a loop',
        lead: 'Each row needs its own handler bound to that specific fruit.id.',
        pick: 'Pick',
        fruits: {
          apple: 'Apple',
          banana: 'Banana',
          cherry: 'Cherry',
        },
      },
      keydown: {
        title: 'on-keydown: submit on Enter',
        lead: 'A plain keyboard handler — no special form syntax required.',
        placeholder: 'Type and press Enter',
        submitted: 'Submitted',
      },
      inputChange: {
        title: 'on-input vs on-change',
        lead:
          'input fires on every keystroke; change fires when the value is committed (blur / Enter on text fields).',
        placeholder: 'Type, then blur or press Enter',
        live: 'on-input (live)',
        committed: 'on-change (committed)',
      },
      focus: {
        title: 'on-focus / on-blur',
        lead: 'Track focus transitions with the same listener pattern as click.',
        placeholder: 'Click in, then click away',
        state: 'State',
        log: 'Log',
        focused: 'focused',
        blurred: 'blurred',
        empty: 'none yet',
      },
      submit: {
        title: 'on-submit + preventDefault',
        lead: 'Stop the browser from reloading the page, then handle the values yourself.',
        placeholder: 'Your name',
        submit: 'Submit',
        waiting: 'Waiting for submit…',
        saved: 'Saved "{name}" (no page reload)',
        required: 'Name is required',
      },
      pad: {
        title: 'Pointer pad',
        lead: 'on-pointermove drives CSS variables; down / up / leave track press state.',
        pressing: 'pressing',
        idle: 'idle',
      },
      stop: {
        title: 'stopPropagation: nested buttons',
        lead: 'The inner button stops the click from also firing the card handler.',
        cardHint: 'Click anywhere in this card.',
        inner: 'Inner button (stops propagation)',
        outerCount: 'outer',
        innerCount: 'inner',
      },
      preventLink: {
        title: 'preventDefault on a link',
        lead: 'Block navigation and run your own logic instead.',
        link: 'External link (blocked)',
        calls: 'preventDefault calls',
      },
      hover: {
        title: 'on-mouseenter / on-mouseleave',
        lead: 'Hover tracking with the same cleanup rules as every other listener.',
        hint: 'Hover this card — hovering: {state}',
        yes: 'yes',
        no: 'no',
        entered: 'Times entered',
      },
      dblclick: {
        title: 'on-dblclick',
        lead: 'Any DOM event name works — including dblclick.',
        button: 'Double-click me',
        count: 'dblclick count',
      },
      debug: {
        title: '<debug>: event state',
        lead: 'Inspect reactive state after clicks — use copy to grab the JSON.',
        click: 'Click',
        pickApple: 'Pick apple',
      },
    },
  },
  debug: {
    kicker: 'API §7c',
    title: 'Debug',
    lead:
      'Pretty-print reactive state as JSON in development. Prefer <debug> over dumping objects into normal text nodes when you want readable quotes and live updates.',
    tip:
      '<debug> is stripped from production builds (Vite passes debug: !isProduction). SSR render() skips it too. Bare pulse names inside { score, mood } become score() / mood() automatically.',
    syntax: {
      title: 'Syntax',
      body: 'Body must be a single ${expr}. Optional label and boolean copy.',
      alsoUsedIn: 'Also used live in',
      and: 'and',
    },
    demo: {
      single: {
        title: 'Single pulse',
        lead: 'Pass one signal — the panel updates whenever the value changes.',
        add: 'Add line',
        bump: 'Bump first qty',
      },
      labelCopy: {
        title: 'label + copy',
        lead: 'label captions the header; copy adds a Copy JSON button.',
        note: 'Same cart pulse — try Copy JSON in the panel.',
      },
      shorthand: {
        title: 'Object shorthand',
        lead: '{ score, mood, removed } unwraps each pulse — no score() needed inside the literal.',
        cycleMood: 'cycle mood',
      },
      nested: {
        title: 'Derived object',
        lead: 'Any expression works — here a derive bundles nested pulses into one snapshot.',
        rename: 'Rename user',
        toggleDark: 'Toggle dark',
      },
    },
  },
  why: {
    kicker: 'API §15 · why()',
    title: 'Why',
    lead:
      'One question — why is this UI like this? — answered the same way in the console, overlay, cycle errors, and jacare why file:line.',
    tip:
      'Enable DevTools (Lab toggle or connectJacareDevtools). Then $why($0) on a selected element, click a State/Mesh value for the Why card, or run jacare why src/pages/why.jcr:NN in the terminal.',
    demo: {
      title: '$why in the console',
      lead:
        'Select the badge below in DevTools Elements, then run $why($0). Same chain as the overlay Why card.',
      idle: 'idle',
      once: 'once',
    },
    console: {
      title: 'Console · overlay · error',
    },
    cli: {
      title: 'jacare why (static IR)',
      body: 'No browser — Binding IR sites for a file:line (sibling of check --bindings).',
    },
    cycle: {
      title: 'ReactiveCycleError includes why',
      body: 'With DevTools enabled, cycle errors append the same WhyChain text.',
    },
  },
}
