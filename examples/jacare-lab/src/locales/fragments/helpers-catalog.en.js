export default {
  helpersCatalog: {
  groups: {
    reactivity: "Reactivity",
    pulseBags: "Pulse bags",
    dom: "DOM (emitted)",
    controlFlow: "Control flow (emitted)",
    slots: "Slots (emitted)",
    navigation: "Navigation",
    forms: "Forms",
    lifecycle: "Lifecycle",
    ssr: "SSR",
    islands: "Islands",
    ssrClient: "SSR / client",
    devtoolsCore: "DevTools (core)",
    devtoolsUi: "DevTools UI",
    compiler: "Compiler API",
    vite: "Vite",
    meta: "Meta / file routes",
    cli: "CLI",
    language: "Language",
  },
    pulse: {
      usage: "Create reactive state. Call to read, .set / .update to write.",
      about: "pulse is Jacaré’s primary reactive cell (preferred name). Create one with an initial value, call it like a function to read, and write with .set(value) or .update(fn). Reads inside effects, derives, and template bindings subscribe automatically so only the dependent UI updates. Prefer pulse over signal in new Jacaré code.",
    },
    signal: {
      usage: "Alias of pulse — same API.",
      about: "signal is the same runtime primitive as pulse — an alias for familiarity with other fine-grained libraries. Methods (.set, .update, .peek, .subscribe) and template use are identical. Prefer writing pulse in Jacaré apps so docs and Lab stay consistent.",
    },
    derive: {
      usage: "Computed value that updates when dependencies change.",
      about: "derive builds a cached computed value from other pulses or derives. The function re-runs only when a dependency it actually read has changed. Read it like a pulse: doubled(). Call dispose() when you create derives dynamically (e.g. per list item) and tear them down — long-lived derives in bags/forms/nav usually do not need it.",
    },
    computed: {
      usage: "Alias of derive.",
      about: "computed is an alias of derive with the same lazy, cached dependency tracking and dispose(). Prefer derive in new Jacaré code; keep computed only when matching external examples that use that name.",
    },
    effect: {
      usage: "Run side effects when pulses change. Call .dispose() to stop.",
      about: "effect runs a side-effect whenever its tracked pulses change (logging, document.title, fetch, imperative DOM). It may return a cleanup that runs before the next execution and on dispose(). Call dispose() when you created the effect yourself and the owner unmounts — compiled template bindings dispose for you.",
    },
    watch: {
      usage: "Alias of effect.",
      about: "watch is an alias of effect. Prefer watch when the intent reads as “watch this state”; prefer effect when matching older examples. Same dispose and cleanup contract.",
    },
    batch: {
      usage: "Group writes so effects run once after all updates.",
      about: "batch groups multiple pulse writes so dependent effects and DOM updates flush once after the callback finishes. Use it when one user action updates several cells (form submit, cart count + total) to avoid intermediate flicker and extra work.",
    },
    enablePatience: {
      usage: "Opt-in: coalesce writes outside batch into one microtask.",
      about: "Default schedule is synchronous — set() updates effects on the same turn. enablePatience() turns on Patience: writes outside batch queue and flush once in a microtask (safety net for bursty sockets/timers). With Patience on, the runtime uses internal lanes (input → default → idle): bindModel marks input; idle uses requestIdleCallback. Authors do not pick lanes — no startTransition API. Prefer batch/ripple for explicit groups. flushSync() drains every lane now (tests and escape hatch). disablePatience() flushes and restores sync.",
    },
    flushSync: {
      usage: "Drain pending reactive updates immediately.",
      about: "flushSync runs any queued subscribers now (every Patience lane: input, default, idle). Required after enablePatience() when tests or UI need the DOM on the same turn. Harmless when the queue is empty. batch/ripple already flush synchronously at the end of their callback.",
    },
    disablePatience: {
      usage: "Turn off Patience and restore sync schedule.",
      about: "disablePatience drains any pending updates with flushSync semantics, then sets the scheduler back to synchronous default. Use when leaving a demo or tearing down a test that called enablePatience().",
    },
    isPatienceEnabled: {
      usage: "Read whether Patience coalesce is on.",
      about: "isPatienceEnabled() returns true after enablePatience() and false after disablePatience() (or by default). Useful in demos and tests — not needed in most apps.",
    },
    runAsLane: {
      usage: "Runtime/tooling: mark write origin for Patience lanes.",
      about: "runAsLane(lane, fn) runs fn while tagging writes as input, default, or idle. bindModel already uses input. Apps should not pick lanes — this is for the runtime and rare tooling. Without enablePatience(), schedule stays synchronous and the lane tag is ignored for flush timing.",
    },
    untrack: {
      usage: "Read pulses without subscribing the current effect.",
      about: "untrack runs a function without registering pulse reads as dependencies of the current effect or derive. Use it to peek at values without re-running when they change, or to avoid accidental subscriptions. For a single cell, pulse.peek is often clearer.",
    },
    ReactiveCycleError: {
      usage: "Error thrown when updates never settle.",
      about: "Updates are delivered synchronously by default, so two effects that write to each other would recurse forever. Jacaré stops the cascade after 200 nested levels and throws ReactiveCycleError instead of a stack overflow. error.depth carries the limit that was hit. Break the loop with pulse.peek, pulse.update(fn) or untrack.",
    },
    createBag: {
      usage: "Register a shared bag of pulses (Mesh).",
      about: "createBag registers a named shared store on the Pulse Mesh. The factory stays lazy until a property is first read. Export the bag from a module and reuse it across screens. Duplicate ids throw. Each published field becomes addressable as @id/key in templates.",
    },
    getBag: {
      usage: "Look up a bag by id from anywhere.",
      about: "getBag looks up a bag by string id from anywhere (another module or a screen that did not import the bag). Returns undefined if missing. Reading a property on the handle still triggers lazy factory publish.",
    },
    listBags: {
      usage: "List registered bag ids.",
      about: "listBags returns the ids of every bag registered in the page so far (including not-yet-published lazy bags). Useful for DevTools, debugging, and tests — rarely needed in app UI.",
    },
    ripple: {
      usage: "Batch bag writes into one Mesh notification wave.",
      about: "ripple(fn) runs a function inside a batch and records which mesh cells changed so DevTools Mesh can show one notification wave. Signature is ripple(fn) — not ripple(port, fn). Wrap multi-field bag writes together.",
    },
    bagSnap: {
      usage: "Persist, restore, or reset bag ports.",
      about: "Methods on the bag handle from createBag. snap() copies writable pulse values to a plain object (e.g. localStorage). hydrate(data) writes those values back in one wave. reset() restores factory defaults while keeping the same cell identities so bindings stay alive.",
    },
    bagKey: {
      usage: "Read a bag port directly in the view.",
      about: "Mesh address syntax inside .jcr templates. ${@cart/count} reads the published port without importing the bag into the script (compiler emits getBag). Ideal for shared chrome such as a header cart badge. Prefer normal cart.count() in the module that owns the bag.",
    },
    bindText: {
      usage: "You write ${count}; compiler emits bindText.",
      about: "Compiler-emitted helper that keeps a text node’s data in sync with a pulse or expression. You almost never import it — write ${count} or ${label()} in the view. Only that text node updates when the source changes.",
    },
    bindAttribute: {
      usage: "Dynamic HTML attributes.",
      about: "Emitted for :attr=${expr}. Updates or removes the attribute when the expression changes. Use for href, title, aria-*, and boolean attributes that should appear or disappear with state.",
    },
    bindClass: {
      usage: "Toggle a CSS class from a boolean.",
      about: "Emitted for class-name=${bool} (for example class-open=${open}). Toggles a single CSS class via classList. Prefer this over rebuilding full className strings on every update.",
    },
    bindStyleVar: {
      usage: "Set a CSS custom property.",
      about: "Emitted for style---name=${expr}, which maps to CSS custom properties (style---pct → --pct). Lets CSS drive layout from reactive numbers without large inline style objects.",
    },
    bindModel: {
      usage: "Two-way input binding.",
      about: "Emitted for bind-value and bind-checked. Keeps an input’s value or checked state aligned with a pulse and writes back on input/change. Prefer pulses or createForm fields as the source of truth.",
    },
    branch: {
      usage: "Conditional blocks in templates.",
      about: "Runtime helpers behind #if / #elif / #else / #case. They mount one branch at a time and dispose the previous branch’s bindings when the condition changes. You write the directives; the compiler emits branch or showIf.",
    },
    reconcileKeyedList: {
      usage: "Keyed list reconciliation.",
      about: "Runtime behind #for list as item (key). Diffs by key: reuses existing item mounts, creates new keys, disposes removed keys, and reorders DOM nodes. Always pass a stable key (item.id), not the index, if the list can reorder.",
    },
    mountSlot: {
      usage: "Default and named slots.",
      about: "Runtime behind <slot> and named slots. Parent content is projected into the child component’s slot outlets. You write slot markup; the compiler emits mountSlot.",
    },
    createNav: {
      usage: "Create the app router.",
      about: "Creates the SPA router: layout shell, screen table, missing page, optional beforeGo guard and base path. Returns nav with where (current place as a pulse), attach, go, swap, undo, and warm. One nav per app is typical.",
    },
    lazy: {
      usage: "Lazy-load a screen module.",
      about: "Marks a dynamic import as a lazy screen loader for createNav. The .jcr module loads on first visit (or after warm). Keeps the initial bundle small for multi-page apps.",
    },
    screen: {
      usage: "Wrap an eagerly imported screen.",
      about: "Wraps an already-imported screen module for eager use in createNav (for example the home page). Opposite of lazy — included in the parent chunk instead of loaded on demand.",
    },
    navMethods: {
      usage: "Mount, navigate, preload.",
      about: "Instance methods after createNav. attach(el) mounts the layout and frame and listens to history. go(path) pushes a new history entry; swap replaces; undo goes back; warm(path) preloads a lazy screen without navigating.",
    },
    createRoute: {
      usage: "Helpers around nav.where.",
      about: "Builds a small helper object around nav.where so routeParam and routeSearch stay ergonomic. Export one route next to nav in larger apps.",
    },
    getRouteParam: {
      usage: "Reactive getter for an active nav path param.",
      about: "Used by template sugar ${@route/id}. Returns a getter that tracks nav.where. Prefer createRoute(nav.where) in JS for typed helpers and search keys.",
    },
    routeParam: {
      usage: "Read a path param as a reactive getter.",
      about: "Returns a getter for a path parameter (for example :id). Call id() in script or templates; it tracks navigation so the UI updates when the param changes.",
    },
    routeSearch: {
      usage: "Read a query string value.",
      about: "Same idea as routeParam for ?query= values. The getter is reactive to search changes on the current place.",
    },
    routeHref: {
      usage: "Build an href from path + params/search.",
      about: "Pure helper that builds a path string from a pattern and params or search. Replaces each :name / :name* token (no substring collisions such as :id inside :idea). Useful for jacare-go targets and tests. It does not navigate by itself.",
    },
    navTitle: {
      usage: "Update document.title at runtime.",
      about: "setNavTitle updates document.title (and nav title plumbing). getNavTitle reads the current title string. Often used inside an effect or a screen title function when the title depends on pulses.",
    },
    jacareAttrs: {
      usage: "Outlet + SPA links + active match.",
      about: "Template attributes (not JS imports). jacare-frame is the outlet where screens mount. jacare-go intercepts clicks for SPA navigation (keep href for progressive enhancement). jacare-here marks the active link match for styling. jacare-when={cond} is a one-liner #if. data-jacare-focus is the default focus target for nav.go(path, { focus: true }).",
    },
    createForm: {
      usage: "Reactive form fields, validation, submit.",
      about: "Builds a reactive form from a field schema (initial value + optional validate). Each field behaves like a pulse with .error(), .touched(), .dirty(), and .blur(). handleSubmit(fn) validates then calls fn(values). Pair fields with bind-value in the view.",
    },
    createLifecycle: {
      usage: "Screen mount / activate / deactivate hooks.",
      about: "Export lifecycle from a screen module so nav can call onMount, onActivate, onDeactivate, and onUnmount. Use activate/deactivate for work that should run when the screen is shown or hidden without a full unmount. Return cleanups from hooks when needed.",
    },
    registerScope: {
      usage: "Expose a value in the DevTools Scope panel.",
      about: "Registers a labeled getter in the DevTools Scope panel (for example draft state while debugging). Usually returned from onActivate so it unregisters on deactivate. Not required for production UI.",
    },
    renderToString: {
      usage: "SSR a page render() to one HTML string.",
      about: "Calls your page’s render(props) and returns the HTML string. Use on the server or in build scripts. Pair with the .jcr module’s render export — it is not a replacement for client mount.",
    },
    renderToStream: {
      usage: "Stream SSR chunks (async iterable).",
      about: "Async-iterates HTML chunks derived from a full render (top-level element split). Useful to start writing response bytes early. It is not a fully incremental component stream like React Server Components.",
    },
    resumeBindings: {
      usage: "Low-level: rebind data-jacare-bind nodes.",
      about: "Low-level hydration: finds [data-jacare-bind] nodes and attaches text bindings from SSR state. Prefer the compiled resume() from the .jcr module in apps; this helper is for custom SSR pipelines.",
    },
    mountIsland: {
      usage: "Embed a compiled .jcr widget into a host element (static/React/Vue/Angular).",
      about: "Thin island entry: resolve a host (selector or Element), optionally attach a shadow root, call the widget’s mount, mark the host with data-jacare-island, and return dispose. Plain props become live pulses by default — call dispose.update(next) without remounting. Does not pull nav/forms/DevTools. Prefer shadow: true when the host has aggressive global CSS.",
    },
    escapeHtml: {
      usage: "Escape text before injecting into SSR HTML.",
      about: "Escapes &, <, >, and \" for safe HTML text and attribute interpolation. The compiler inserts escapeHtml in SSR codegen; call it yourself only if you build HTML strings manually.",
    },
    mount: {
      usage: "Client: create DOM + bind. Returns dispose.",
      about: "Default client entry exported by every compiled .jcr file. mount(element, props?) creates DOM, wires bindings, and returns dispose(). Used by boot scripts and by nav when attaching screens.",
    },
    render: {
      usage: "SSR: return { html, state }.",
      about: "SSR export from a .jcr module. render(props?) returns { html, state }. Send html in the response and pass state to resume on the client.",
    },
    resume: {
      usage: "Hydrate existing SSR HTML.",
      about: "Client hydration export. resume(element, state, props?) binds to existing SSR markup instead of recreating it. Use after render or renderToString on the server.",
    },
    enableDevtools: {
      usage: "Turn on pulse graph collection.",
      about: "Turns on the in-core pulse graph registry (dependency edges and names). Apps usually call connectJacareDevtools instead, which enables this for you. Keep behind DEV flags.",
    },
    why: {
      usage: "Causal chain: element → binding → pulse → last write.",
      about: "why(target) builds a WhyChain from the DevTools registry and write ledger. Targets: Element/Node, pulse, pulse id, or mesh name (@bag/key). whyLast() uses the last recorded write. formatWhyChain prints the tree used by $why, the overlay Why card, and ReactiveCycleError. Requires enableDevtools / connectJacareDevtools so writes are ledgered.",
    },
    namePulse: {
      usage: "Label a pulse in the graph.",
      about: "Attaches a human label (and optional file/line) to a pulse for the graph UI. The compiler often emits this in DEV automatically for const pulses in .jcr modules.",
    },
    getPulseGraph: {
      usage: "Snapshot of the pulse graph.",
      about: "Returns a snapshot of pulses, effects, and edges for custom tooling or tests. The overlay UI uses subscribePulseGraph; you rarely need this in application code.",
    },
    connectJacareDevtools: {
      usage: "Mount the overlay UI. Returns dispose.",
      about: "Mounts the Jacaré DevTools overlay (Pulse Graph, optional Scope and Mesh tabs). Returns a stop function. Use only in development or behind an explicit Lab toggle — not as a production default.",
    },
    compile: {
      usage: "Compile .jcr source to JS (tooling / tests).",
      about: "Programmatic compiler: .jcr source string → JavaScript module code (and optional source map). Used by the Vite plugin, CLI, Lab playground, and tests. Production apps do not call compile in the browser.",
    },
    parseModule: {
      usage: "Parse AST for tools.",
      about: "Lower-level parsers that return ASTs for tooling (linters, IR inspectors, IDE features). Prefer compile() unless you are building developer tools on top of Jacaré.",
    },
    inspectTemplateBindings: {
      usage: "Binding IR sites (same as jacare check --bindings).",
      about: "Returns Binding IR sites for a template — the same data jacare check --bindings prints. Use it to teach, test, or visualize how each ${} / bind becomes a runtime helper.",
    },
    lowerMountAst: {
      usage: "Lower template AST to MountPlan forest.",
      about: "Lowers a parsed template AST into a MountPlan forest (structured mount instructions). Advanced compiler and IR tooling — see the Binding IR lesson.",
    },
    jacare: {
      usage: "Vite plugin for .jcr transform + HMR.",
      about: "Default Vite plugin. Transforms .jcr on the fly, enables HMR, turns on CPW optimizations in production, and strips debug binds. Add plugins: [jacare()] to your Vite config.",
    },
    createJacareViteConfig: {
      usage: "Opinionated Vite config helper.",
      about: "Helper that returns a ready-made Vite config with the Jacaré plugin and sensible defaults (title, and related options). Useful for scaffolds; customize when you outgrow it.",
    },
    jacareMeta: {
      usage: "Vite plugin for file-based routes.",
      about: "Optional Vite plugin for file-based routing (a pages directory becomes a route table). Import from @jacare/meta/vite — the main @jacare/meta entry stays browser-safe.",
    },
    discoverRoutes: {
      usage: "Map pages/** files to route paths.",
      about: "Scans a pages directory and maps file paths to URL patterns (including dynamic segments). Used by meta tooling at build time — import from @jacare/meta/vite.",
    },
    createJacareApp: {
      usage: "Bootstrap nav from an explicit screens map.",
      about: "Wraps createNav when you already have screens. Does not scan pagesDir at runtime — for file routes use jacareMeta() + createJacareAppFromRoutes({ routeLoaders }) from virtual:jacare-routes.",
    },
    jacareCli: {
      usage: "Scaffold, develop, build, and inspect.",
      about: "Command-line tools (not a JavaScript import). new scaffolds an app; dev runs Vite; build writes production output; check compiles project .jcr files; check --bindings prints Binding IR. You can also run npm create jacare@latest.",
    },
    exportView: {
      usage: "The page or component template.",
      about: "Required template block in a .jcr module — the UI tree with bindings, directives, and components. The compiler turns it into mount, render, and resume. Script above the view stays plain JavaScript.",
    },
    exportStyle: {
      usage: "CSS scoped to this module.",
      about: "Optional scoped CSS for this module. Selectors are rewritten so styles do not leak globally. Styles may be static or reactive depending on content.",
    },
    exportContract: {
      usage: "Declare props / events for tooling.",
      about: "Optional declaration of props, emits, slots, and related surface for tooling and validation. Helps catch misuse of components at compile or check time.",
    },
    events: {
      usage: "DOM events with automatic cleanup.",
      about: "Template event attributes. Prefer on-click=${handler}; @click is an alias. Listeners are registered on mount and removed on dispose — no manual removeEventListener in app code.",
    },
    debugTag: {
      usage: "Inline debug panel for selected values.",
      about: "Dev-only template tag that shows a small panel of selected values. Stripped or no-op in production builds. Handy while teaching reactivity on a page.",
    },
  },
}
