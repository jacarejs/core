export default {
  helpersCatalog: {
    groups: {
      reactivity: "Reactividad",
      pulseBags: "Bags de pulse",
      dom: "DOM (emitido)",
      controlFlow: "Flujo de control (emitido)",
      slots: "Slots (emitidos)",
      navigation: "Navegación",
      forms: "Formularios",
      lifecycle: "Ciclo de vida",
      ssr: "SSR",
      islands: "Islas",
      ssrClient: "SSR / cliente",
      devtoolsCore: "DevTools (core)",
      devtoolsUi: "UI de DevTools",
      compiler: "API del compilador",
      vite: "Vite",
      meta: "Meta / rutas por archivo",
      cli: "CLI",
      language: "Lenguaje",
    },
    pulse: {
      usage: "Crea estado reactivo. Llama para leer, usa .set / .update para escribir.",
      about: "pulse es la celda reactiva principal de Jacaré (nombre preferido). Crea una con un valor inicial, llámala como función para leer y escribe con .set(value) o .update(fn). Las lecturas dentro de effects, derives y bindings de plantilla se suscriben automáticamente, así que solo se actualiza la UI dependiente. Prefiere pulse en lugar de signal en código nuevo de Jacaré.",
    },
    signal: {
      usage: "Alias de pulse — misma API.",
      about: "signal es el mismo primitivo de runtime que pulse — un alias para resultar familiar a quienes vienen de otras bibliotecas fine-grained. Los métodos (.set, .update, .peek, .subscribe) y el uso en plantillas son idénticos. Prefiere escribir pulse en apps Jacaré para que la documentación y el Lab sigan siendo consistentes.",
    },
    derive: {
      usage: "Valor computado que se actualiza cuando cambian las dependencias.",
      about: "derive construye un valor computado en caché a partir de otros pulses o derives. La función solo se vuelve a ejecutar cuando cambia una dependencia que realmente leyó. Léelo como un pulse: doubled(). Llama a dispose() cuando crees derives de forma dinámica (por ejemplo, por elemento de lista) y luego los desmontes — los derives de larga vida en bags/forms/nav normalmente no lo necesitan.",
    },
    computed: {
      usage: "Alias de derive.",
      about: "computed es un alias de derive con el mismo seguimiento perezoso y en caché de dependencias y el mismo dispose(). Prefiere derive en código nuevo de Jacaré; conserva computed solo al seguir ejemplos externos que usan ese nombre.",
    },
    effect: {
      usage: "Ejecuta efectos secundarios cuando cambian los pulses. Llama a .dispose() para detenerlo.",
      about: "effect ejecuta un efecto secundario cada vez que cambian sus pulses rastreados (logging, document.title, fetch, DOM imperativo). Puede devolver una limpieza que se ejecuta antes de la siguiente ejecución y en dispose(). Llama a dispose() cuando hayas creado el effect tú mismo y el owner se desmonte — los bindings de plantilla compilados se descartan por ti.",
    },
    watch: {
      usage: "Alias de effect.",
      about: "watch es un alias de effect. Prefiere watch cuando la intención se lea como \"observar este estado\"; prefiere effect al seguir ejemplos más antiguos. Mismo contrato de dispose y cleanup.",
    },
    batch: {
      usage: "Agrupa escrituras para que los effects se ejecuten una vez después de todas las actualizaciones.",
      about: "batch agrupa varias escrituras de pulse para que los effects dependientes y las actualizaciones del DOM se vacíen una sola vez cuando termine el callback. Úsalo cuando una acción del usuario actualiza varias celdas (submit de formulario, cantidad + total del carrito) para evitar parpadeos intermedios y trabajo extra.",
    },
    enablePatience: {
      usage: "Opt-in: fusiona escrituras fuera de batch en una microtask.",
      about: "La programación por defecto es síncrona — set() actualiza los effects en el mismo turno. enablePatience() activa Patience: las escrituras fuera de batch se encolan y se vacían una sola vez en una microtask (red de seguridad para sockets/timers en ráfaga). Con Patience activado, el runtime usa lanes internas (input → default → idle): bindModel marca input; idle usa requestIdleCallback. Quien escribe la app no elige lanes — no existe una API startTransition. Prefiere batch/ripple para grupos explícitos. flushSync() drena todas las lanes ahora mismo (tests y escape hatch). disablePatience() vacía la cola y restaura el modo síncrono.",
    },
    flushSync: {
      usage: "Drena de inmediato las actualizaciones reactivas pendientes.",
      about: "flushSync ejecuta ahora cualquier subscriber encolado (todas las lanes de Patience: input, default, idle). Es necesario después de enablePatience() cuando los tests o la UI necesitan el DOM en el mismo turno. Es inocuo cuando la cola está vacía. batch/ripple ya vacían de forma síncrona al final de su callback.",
    },
    disablePatience: {
      usage: "Apaga Patience y restaura la programación síncrona.",
      about: "disablePatience drena cualquier actualización pendiente con la semántica de flushSync y luego devuelve el scheduler a su modo síncrono por defecto. Úsalo al salir de una demo o al desmontar un test que llamó a enablePatience().",
    },
    isPatienceEnabled: {
      usage: "Lee si la coalescencia de Patience está activada.",
      about: "isPatienceEnabled() devuelve true después de enablePatience() y false después de disablePatience() (o por defecto). Útil en demos y tests — no hace falta en la mayoría de las apps.",
    },
    runAsLane: {
      usage: "Runtime/tooling: marca el origen de la escritura para las lanes de Patience.",
      about: "runAsLane(lane, fn) ejecuta fn mientras etiqueta las escrituras como input, default o idle. bindModel ya usa input. Las apps no deberían elegir lanes — esto es para el runtime y para casos raros de tooling. Sin enablePatience(), la programación sigue siendo síncrona y la etiqueta de lane se ignora al decidir cuándo vaciar.",
    },
    untrack: {
      usage: "Lee pulses sin suscribir el effect actual.",
      about: "untrack ejecuta una función sin registrar lecturas de pulse como dependencias del effect o derive actual. Úsalo para echar un vistazo a valores sin reejecutar cuando cambien, o para evitar suscripciones accidentales. Para una sola celda, pulse.peek suele ser más claro.",
    },
    ReactiveCycleError: {
      usage: "Error lanzado cuando las actualizaciones nunca se estabilizan.",
      about: "Las actualizaciones se entregan de forma síncrona por defecto, así que dos effects que se escriben entre sí recursarían para siempre. Jacaré detiene la cascada tras 200 niveles anidados y lanza ReactiveCycleError en lugar de un stack overflow. error.depth lleva el límite que se alcanzó. Rompe el bucle con pulse.peek, pulse.update(fn) o untrack.",
    },
    createBag: {
      usage: "Registra una bag compartida de pulses (Mesh).",
      about: "createBag registra una store compartida con nombre en la Pulse Mesh. La factory sigue siendo perezosa hasta que se lee una propiedad por primera vez. Exporta la bag desde un módulo y reutilízala entre pantallas. Los ids duplicados lanzan error. Cada campo publicado pasa a poder direccionarse como @id/key en las plantillas.",
    },
    getBag: {
      usage: "Busca una bag por id desde cualquier lugar.",
      about: "getBag busca una bag por id de string desde cualquier lugar (otro módulo o una pantalla que no importó la bag). Devuelve undefined si falta. Leer una propiedad del handle sigue disparando la publicación perezosa de la factory.",
    },
    listBags: {
      usage: "Lista los ids de las bags registradas.",
      about: "listBags devuelve los ids de todas las bags registradas en la página hasta el momento (incluidas las bags perezosas aún no publicadas). Útil para DevTools, debugging y tests — rara vez hace falta en la UI de la app.",
    },
    ripple: {
      usage: "Agrupa escrituras de bag en una sola ola de notificación de Mesh.",
      about: "ripple(fn) ejecuta una función dentro de un batch y registra qué celdas de la mesh cambiaron para que DevTools Mesh pueda mostrar una única ola de notificación. La firma es ripple(fn) — no ripple(port, fn). Agrupa juntas las escrituras de bag en varios campos.",
    },
    bagSnap: {
      usage: "Persiste, restaura o reinicia ports de bag.",
      about: "Métodos del handle de bag que viene de createBag. snap() copia los valores escribibles de pulse a un objeto plano (por ejemplo, localStorage). hydrate(data) vuelve a escribir esos valores en una sola ola. reset() restaura los valores por defecto de la factory mientras mantiene las mismas identidades de celda para que los bindings sigan vivos.",
    },
    bagKey: {
      usage: "Lee un port de bag directamente en la view.",
      about: "Sintaxis de dirección de Mesh dentro de plantillas .jcr. ${@cart/count} lee el port publicado sin importar la bag en el script (el compilador emite getBag). Ideal para chrome compartido, como un badge del carrito en el header. Prefiere el habitual cart.count() en el módulo que posee la bag.",
    },
    bindText: {
      usage: "Tú escribes ${count}; el compilador emite bindText.",
      about: "Helper emitido por el compilador que mantiene sincronizados los datos de un nodo de texto con un pulse o una expresión. Casi nunca lo importas — escribe ${count} o ${label()} en la view. Solo se actualiza ese nodo de texto cuando cambia el origen.",
    },
    bindAttribute: {
      usage: "Atributos HTML dinámicos.",
      about: "Emitido para :attr=${expr}. Actualiza o elimina el atributo cuando cambia la expresión. Úsalo para href, title, aria-* y atributos booleanos que deban aparecer o desaparecer con el estado.",
    },
    bindClass: {
      usage: "Activa o desactiva una clase CSS desde un booleano.",
      about: "Emitido para class-name=${bool} (por ejemplo class-open=${open}). Alterna una sola clase CSS mediante classList. Prefiere esto en lugar de reconstruir strings completos de className en cada actualización.",
    },
    bindStyleVar: {
      usage: "Define una propiedad personalizada de CSS.",
      about: "Emitido para style---name=${expr}, que se mapea a propiedades personalizadas de CSS (style---pct → --pct). Deja que CSS dirija el layout desde números reactivos sin grandes objetos de estilo inline.",
    },
    bindModel: {
      usage: "Binding bidireccional de inputs.",
      about: "Emitido para bind-value y bind-checked. Mantiene el value o checked de un input alineado con un pulse y escribe de vuelta en input/change. Prefiere pulses o campos de createForm como fuente de verdad.",
    },
    branch: {
      usage: "Bloques condicionales en plantillas.",
      about: "Helpers de runtime detrás de #if / #elif / #else / #case. Montan una rama a la vez y descartan los bindings de la rama anterior cuando cambia la condición. Tú escribes las directivas; el compilador emite branch o showIf.",
    },
    reconcileKeyedList: {
      usage: "Reconciliación de listas con key.",
      about: "Runtime detrás de #for list as item (key). Hace diff por key: reutiliza montajes de elementos existentes, crea nuevas keys, descarta keys eliminadas y reordena nodos del DOM. Pasa siempre una key estable (item.id), no el índice, si la lista puede reordenarse.",
    },
    mountSlot: {
      usage: "Slots predeterminados y con nombre.",
      about: "Runtime detrás de <slot> y de los slots con nombre. El contenido del padre se proyecta en las salidas de slot del componente hijo. Tú escribes el marcado del slot; el compilador emite mountSlot.",
    },
    createNav: {
      usage: "Crea el router de la app.",
      about: "Crea el router SPA: layout shell, tabla de pantallas, página faltante, guard opcional beforeGo y base path. Devuelve nav con where (el lugar actual como pulse), attach, go, swap, undo y warm. Lo habitual es un nav por app.",
    },
    lazy: {
      usage: "Carga de forma diferida un módulo de pantalla.",
      about: "Marca un import dinámico como cargador lazy de pantalla para createNav. El módulo .jcr se carga en la primera visita (o después de warm). Así se mantiene pequeño el bundle inicial en apps multipágina.",
    },
    screen: {
      usage: "Envuelve una pantalla importada de forma eager.",
      about: "Envuelve un módulo de pantalla ya importado para usarlo de forma eager en createNav (por ejemplo, la página de inicio). Es lo contrario de lazy — se incluye en el chunk padre en vez de cargarse bajo demanda.",
    },
    navMethods: {
      usage: "Monta, navega y precarga.",
      about: "Métodos de instancia después de createNav. attach(el) monta el layout y el frame y escucha el historial. go(path) agrega una nueva entrada al historial; swap reemplaza; undo vuelve atrás; warm(path) precarga una pantalla lazy sin navegar.",
    },
    createRoute: {
      usage: "Helpers alrededor de nav.where.",
      about: "Construye un pequeño objeto helper alrededor de nav.where para que routeParam y routeSearch sigan siendo ergonómicos. Exporta una route junto a nav en apps más grandes.",
    },
    getRouteParam: {
      usage: "Getter reactivo para un parámetro de path del nav activo.",
      about: "Lo usa el azúcar de plantilla ${@route/id}. Devuelve un getter que rastrea nav.where. Prefiere createRoute(nav.where) en JS para helpers tipados y claves de búsqueda.",
    },
    routeParam: {
      usage: "Lee un parámetro de path como getter reactivo.",
      about: "Devuelve un getter para un parámetro de path (por ejemplo :id). Llama a id() en script o plantillas; rastrea la navegación para que la UI se actualice cuando cambie el parámetro.",
    },
    routeSearch: {
      usage: "Lee un valor de query string.",
      about: "La misma idea que routeParam para valores ?query=. El getter es reactivo a los cambios de search en el lugar actual.",
    },
    routeHref: {
      usage: "Construye un href a partir de path + params/search.",
      about: "Helper puro que construye un string de path a partir de un pattern y params o search. Sustituye cada token :name / :name* (sin colisiones de subcadenas, como :id dentro de :idea). Útil para destinos de jacare-go y tests. No navega por sí solo.",
    },
    navTitle: {
      usage: "Actualiza document.title en runtime.",
      about: "setNavTitle actualiza document.title (y toda la fontanería de títulos de nav). getNavTitle lee el string de título actual. A menudo se usa dentro de un effect o de una función de título de pantalla cuando el título depende de pulses.",
    },
    jacareAttrs: {
      usage: "Outlet + enlaces SPA + coincidencia activa.",
      about: "Atributos de plantilla (no imports de JS). jacare-frame es el outlet donde se montan las pantallas. jacare-go intercepta clics para navegación SPA (mantén href para progressive enhancement). jacare-here marca la coincidencia del enlace activo para estilizar. jacare-when={cond} es un #if en una sola línea. data-jacare-focus es el objetivo de foco por defecto para nav.go(path, { focus: true }).",
    },
    createForm: {
      usage: "Campos de formulario reactivos, validación y submit.",
      about: "Construye un formulario reactivo a partir de un schema de campos (valor inicial + validate opcional). Cada campo se comporta como un pulse con .error(), .touched(), .dirty() y .blur(). handleSubmit(fn) valida y luego llama a fn(values). Combina los campos con bind-value en la view.",
    },
    createLifecycle: {
      usage: "Hooks de montaje / activación / desactivación de pantalla.",
      about: "Exporta lifecycle desde un módulo de pantalla para que nav pueda llamar a onMount, onActivate, onDeactivate y onUnmount. Usa activate/deactivate para trabajo que deba ejecutarse cuando la pantalla se muestra u oculta sin un unmount completo. Devuelve limpiezas desde los hooks cuando haga falta.",
    },
    registerScope: {
      usage: "Expón un valor en el panel Scope de DevTools.",
      about: "Registra un getter etiquetado en el panel Scope de DevTools (por ejemplo, estado de borrador durante debugging). Normalmente se devuelve desde onActivate para que se desregistre en deactivate. No es necesario para la UI de producción.",
    },
    renderToString: {
      usage: "Haz SSR de un render() de página a un único string HTML.",
      about: "Llama a render(props) de tu página y devuelve el string HTML. Úsalo en el servidor o en scripts de build. Combínalo con el export render del módulo .jcr — no sustituye al mount del cliente.",
    },
    renderToStream: {
      usage: "Transmite chunks de SSR (iterable asíncrono).",
      about: "Itera de forma asíncrona por chunks de HTML derivados de un render completo (división por elemento de nivel superior). Útil para empezar a escribir bytes de la respuesta antes. No es un stream incremental completo de componentes como React Server Components.",
    },
    resumeBindings: {
      usage: "Bajo nivel: vuelve a enlazar nodos data-jacare-bind.",
      about: "Hidratación de bajo nivel: encuentra nodos [data-jacare-bind] y adjunta bindings de texto a partir del estado SSR. Prefiere el resume() compilado del módulo .jcr en apps; este helper es para pipelines SSR personalizados.",
    },
    mountIsland: {
      usage: "Incrusta un widget .jcr compilado en un elemento host (static/React/Vue/Angular).",
      about: "Entrada ligera de isla: resuelve un host (selector o Element), opcionalmente adjunta un shadow root, llama al mount del widget, marca el host con data-jacare-island y devuelve dispose. Las props simples se convierten en pulses vivos por defecto — llama a dispose.update(next) sin volver a montar. No arrastra nav/forms/DevTools. Prefiere shadow: true cuando el host tenga CSS global agresivo.",
    },
    escapeHtml: {
      usage: "Escapa texto antes de inyectarlo en el HTML de SSR.",
      about: "Escapa &, <, > y \\\" para una interpolación segura de texto HTML y atributos. El compilador inserta escapeHtml en el codegen de SSR; llámalo tú mismo solo si construyes strings HTML manualmente.",
    },
    mount: {
      usage: "Cliente: crea DOM + bind. Devuelve dispose.",
      about: "Entrada de cliente por defecto exportada por cada archivo .jcr compilado. mount(element, props?) crea el DOM, conecta los bindings y devuelve dispose(). Lo usan los scripts de arranque y nav al adjuntar pantallas.",
    },
    render: {
      usage: "SSR: devuelve { html, state }.",
      about: "Export SSR de un módulo .jcr. render(props?) devuelve { html, state }. Envía html en la respuesta y pasa state a resume en el cliente.",
    },
    resume: {
      usage: "Hidrata HTML SSR ya existente.",
      about: "Export de hidratación del cliente. resume(element, state, props?) se enlaza al marcado SSR existente en vez de recrearlo. Úsalo después de render o renderToString en el servidor.",
    },
    enableDevtools: {
      usage: "Activa la recopilación del grafo de pulses.",
      about: "Activa el registro interno del grafo de pulses (aristas de dependencia y nombres). Las apps suelen llamar en su lugar a connectJacareDevtools, que lo habilita por ti. Mantenlo detrás de flags DEV.",
    },
    why: {
      usage: "Cadena causal: elemento → binding → pulse → última escritura.",
      about: "why(target) construye una WhyChain a partir del registro de DevTools y del ledger de escrituras. Objetivos: Element/Node, pulse, id de pulse o nombre de mesh (@bag/key). whyLast() usa la última escritura registrada. formatWhyChain imprime el árbol usado por $why, por la tarjeta Why del overlay y por ReactiveCycleError. Requiere enableDevtools / connectJacareDevtools para que las escrituras queden registradas en el ledger.",
    },
    namePulse: {
      usage: "Etiqueta un pulse en el grafo.",
      about: "Adjunta una etiqueta legible por humanos (y opcionalmente archivo/línea) a un pulse para la UI del grafo. El compilador suele emitir esto automáticamente en DEV para pulses const en módulos .jcr.",
    },
    getPulseGraph: {
      usage: "Snapshot del grafo de pulses.",
      about: "Devuelve un snapshot de pulses, effects y aristas para tooling personalizado o tests. La UI del overlay usa subscribePulseGraph; rara vez lo necesitas en código de aplicación.",
    },
    connectJacareDevtools: {
      usage: "Monta la UI del overlay. Devuelve dispose.",
      about: "Monta el overlay de Jacaré DevTools (Pulse Graph, con pestañas opcionales Scope y Mesh). Devuelve una función para detenerlo. Úsalo solo en desarrollo o detrás de un toggle explícito del Lab — no como valor por defecto en producción.",
    },
    compile: {
      usage: "Compila código fuente .jcr a JS (tooling / tests).",
      about: "Compilador programático: string de código fuente .jcr → código de módulo JavaScript (y source map opcional). Lo usan el plugin de Vite, la CLI, el playground del Lab y los tests. Las apps de producción no llaman a compile en el navegador.",
    },
    parseModule: {
      usage: "Haz parse de AST para herramientas.",
      about: "Parsers de nivel inferior que devuelven ASTs para tooling (linters, inspectores de IR, funciones de IDE). Prefiere compile() salvo que estés construyendo herramientas de desarrollador sobre Jacaré.",
    },
    inspectTemplateBindings: {
      usage: "Sitios de Binding IR (igual que jacare check --bindings).",
      about: "Devuelve sitios de Binding IR para una plantilla — los mismos datos que imprime jacare check --bindings. Úsalo para enseñar, probar o visualizar cómo cada ${} / bind se convierte en un helper de runtime.",
    },
    lowerMountAst: {
      usage: "Reduce un AST de plantilla a un bosque MountPlan.",
      about: "Reduce un AST de plantilla parseado a un bosque MountPlan (instrucciones estructuradas de montaje). Tooling avanzado de compilador e IR — consulta la lección de Binding IR.",
    },
    jacare: {
      usage: "Plugin de Vite para transformación de .jcr + HMR.",
      about: "Plugin de Vite por defecto. Transforma .jcr al vuelo, habilita HMR, activa optimizaciones CPW en producción y elimina debug binds. Añade plugins: [jacare()] a tu configuración de Vite.",
    },
    createJacareViteConfig: {
      usage: "Helper opinado de configuración de Vite.",
      about: "Helper que devuelve una configuración de Vite lista para usar con el plugin de Jacaré y valores por defecto sensatos (title y opciones relacionadas). Útil para scaffolds; personalízalo cuando se te quede corto.",
    },
    jacareMeta: {
      usage: "Plugin de Vite para rutas basadas en archivos.",
      about: "Plugin opcional de Vite para routing basado en archivos (un directorio pages se convierte en una tabla de rutas). Importa desde @jacare/meta/vite — la entrada principal @jacare/meta sigue siendo segura para navegador.",
    },
    discoverRoutes: {
      usage: "Mapea archivos pages/** a paths de ruta.",
      about: "Escanea un directorio pages y mapea las rutas de archivo a patrones de URL (incluidos segmentos dinámicos). Lo usa el tooling meta en tiempo de build — importa desde @jacare/meta/vite.",
    },
    createJacareApp: {
      usage: "Inicializa nav a partir de un mapa explícito de pantallas.",
      about: "Envuelve createNav cuando ya tienes las pantallas. No escanea pagesDir en runtime — para rutas por archivo usa jacareMeta() + createJacareAppFromRoutes({ routeLoaders }) desde virtual:jacare-routes.",
    },
    jacareCli: {
      usage: "Haz scaffold, desarrolla, construye e inspecciona.",
      about: "Herramientas de línea de comandos (no es un import de JavaScript). new crea el scaffold de una app; dev ejecuta Vite; build escribe la salida de producción; check compila los archivos .jcr del proyecto; check --bindings imprime Binding IR. También puedes ejecutar npm create jacare@latest.",
    },
    exportView: {
      usage: "La plantilla de la página o del componente.",
      about: "Bloque de plantilla obligatorio en un módulo .jcr — el árbol de UI con bindings, directivas y componentes. El compilador lo convierte en mount, render y resume. El script por encima de la view sigue siendo JavaScript puro.",
    },
    exportStyle: {
      usage: "CSS con ámbito para este módulo.",
      about: "CSS opcional con ámbito para este módulo. Los selectores se reescriben para que los estilos no se filtren globalmente. Los estilos pueden ser estáticos o reactivos según el contenido.",
    },
    exportContract: {
      usage: "Declara props / events para tooling.",
      about: "Declaración opcional de props, emits, slots y la superficie relacionada para tooling y validación. Ayuda a detectar usos incorrectos de componentes en tiempo de compile o check.",
    },
    events: {
      usage: "Eventos de DOM con limpieza automática.",
      about: "Atributos de evento en plantilla. Prefiere on-click=${handler}; @click es un alias. Los listeners se registran al montar y se eliminan al hacer dispose — sin removeEventListener manual en código de app.",
    },
    debugTag: {
      usage: "Panel de debug inline para valores seleccionados.",
      about: "Etiqueta de plantilla solo para DEV que muestra un pequeño panel de valores seleccionados. Se elimina o se vuelve no-op en builds de producción. Resulta útil al enseñar reactividad en una página.",
    },
  },
};
