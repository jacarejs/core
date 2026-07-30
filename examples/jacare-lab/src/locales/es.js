export default {
  shell: {
    brandTag: 'Tutorial completo de la API',
    lessonsNav: 'Lecciones',
    menuClose: 'Cerrar',
    menuOpen: 'Lecciones',
    topbarHint: 'Demos en vivo · Ver código abre el fuente de cada ejemplo',
    viewCode: 'Ver código',
    devtoolsOn: 'DevTools activo',
    devtoolsOff: 'DevTools inactivo',
    devtoolsTitle: 'Alternar overlay de Jacaré DevTools',
    footer: 'Hecho en Brasil',
    localeLabel: 'Idioma',
    close: 'Cerrar',
    copy: 'Copiar',
    copied: 'Copiado',
    copyFailed: 'Falló',
    copyCode: 'Copiar código',
    reset: 'Restablecer',
    clicks: 'Clics',
  },
  bagTree: {
    parentLabel: 'Padre · lee cart.count',
    parentNote: 'Ítems en la bag:',
    childLabel: 'Hijo · lee cart.money',
    childNote: 'Total:',
    grandLabel: 'Nieto · sin import de la bag (pass-through)',
    grandNote: 'Este nivel solo anida — nunca toca la bag.',
    leafLabel: 'Bisnieto · escribe cart.add',
    leafNote: 'La hoja profunda importa la misma bag — sin props de los ancestros.',
    leafAdd: 'Añadir desde la hoja',
    leafCount: 'count',
  },
  lesson: {
    start: {
      title: 'Inicio',
      blurb: 'Resumen del Lab, instalación e índice de lecciones',
    },
    'quick-start': {
      title: 'Inicio rápido',
      blurb: 'API §1 — scaffold, app.jcr, boot.js, shell HTML',
    },
    module: {
      title: 'Formato del módulo',
      blurb: 'API §2 — layout .jcr, sintaxis view/style, exports compilados',
    },
    typescript: {
      title: 'TypeScript',
      blurb: '// @jacare-ts · sibling *.jcr.ts · jacare.d.ts — tipos opcionales',
    },
    language: {
      title: 'Referencia del lenguaje',
      blurb: 'Palabras reservadas, @route, jacare-when, mapa runtime, CLI',
    },
    'binding-ir': {
      title: 'Binding IR',
      blurb: 'MountPlan · check --bindings · un bosque para client/SSR/CPW',
    },
    reactivity: {
      title: 'Reactividad',
      blurb: 'signal, computed, effect, batch, Patience, untrack, aliases',
    },
    bag: {
      title: 'Pulse bags',
      blurb: 'Mesh compartido, Mesh Ports, publish lazy — nativo y ligero',
    },
    templates: {
      title: 'Plantillas',
      blurb: 'Texto, atributos, variables CSS style---',
    },
    bindings: {
      title: 'Bindings',
      blurb: 'bind-value, class-*, vars de style, Binding IR + CPW',
    },
    events: {
      title: 'Eventos',
      blurb: 'on-*, @*, teclado, pointer, stopPropagation',
    },
    debug: {
      title: 'Debug',
      blurb: 'Sintaxis <debug> — paneles JSON, label, copy, atajo',
    },
    why: {
      title: 'Why',
      blurb: '$why · card Why · ReactiveCycleError · jacare why archivo:línea',
    },
    if: {
      title: '#if',
      blurb: 'Ramas, jacare-when, condiciones anidadas, estados vacíos',
    },
    case: {
      title: '#case',
      blurb: 'Emparejar un valor — brazos #when, fallback #else',
    },
    for: {
      title: '#for',
      blurb: 'Listas con clave, reordenar, fragmentos, padres estables',
    },
    components: {
      title: 'Componentes',
      blurb: 'Props, slots, contracts, emit, model bind-',
    },
    css: {
      title: 'CSS con ámbito',
      blurb: 'export <style>, aislamiento, :global, if/for/case reactivos',
    },
    nav: {
      title: 'Navegación',
      blurb: 'createNav, createRoute, @route, focus grip, guards',
    },
    forms: {
      title: 'Formularios',
      blurb: 'createForm, Field, validate, submit, reset',
    },
    lifecycle: {
      title: 'Ciclo de vida',
      blurb: 'onMount, onActivate, dispose, registerScope',
    },
    cookbook: {
      title: 'Cookbook',
      blurb: 'Pantalla de tareas combinando if + for + events + props',
    },
    playground: {
      title: 'Playground',
      blurb: 'Escribe fuente .jcr y mira el mount en vivo',
    },
    ssr: {
      title: 'SSR',
      blurb: 'render, resume, streaming — tarjetas de referencia',
    },
    island: {
      title: 'Islands',
      blurb: 'API §14b — mountIsland, shadow, hosts React/Vue/Angular',
    },
    tooling: {
      title: 'Herramientas',
      blurb: 'CLI, check --bindings/--routes, why archivo:línea, Binding IR, DevTools',
    },
    helpers: {
      title: 'Catálogo de imports',
      blurb: 'Cada import — explicación, línea de import y ejemplo',
    },
    i18n: {
      title: 'i18n',
      blurb: 'createI18n, t({name}), <select>, te() — en / pt-BR / es',
    },
    ui: {
      title: 'Jacaré UI',
      blurb: '@jacare/ui — componentes oficiales, tema, demos en vivo',
    },
  },
  home: {
    title: 'Jacaré Lab',
    lead:
      'Un recorrido completo y en vivo de la API — cada lección une una explicación corta con una demo en ejecución. Abre Ver código para ver el fuente.',
    github: 'Repositorio en GitHub',
    tip: 'Cada tarjeta Demo de abajo tiene un botón "Ver código" en el encabezado — abre el fuente exacto de ese ejemplo en un modal.',
    whatTitle: '¿Qué es Jacaré?',
    whatBody1:
      'Jacaré es un framework front-end en tiempo de compilación para apps web rápidas y reactivas con JavaScript puro. Escribes módulos .jcr — JS normal más una view HTML-like — y el compilador lo convierte en actualizaciones directas del DOM. Sin virtual DOM, sin re-render del árbol completo: cuando cambia el estado, solo se actualizan los nodos que dependen de él.',
    whatBody2:
      'Este lab es un recorrido guiado de esa API. Cada lección incluye una demo en vivo y un botón Ver código para leer el fuente que está corriendo.',
    installTitle: 'Instalar',
    installBody1: 'Crea una app nueva con el paquete oficial create (npm, pnpm o yarn funcionan):',
    installBody2: 'O instala la CLI globalmente y usa jacare new:',
    startTitle: 'Iniciar un proyecto',
    startBody1:
      'Desde la carpeta del proyecto, arranca el servidor con npm run dev (create-jacare) o jacare dev (scaffold de la CLI). Las apps create-jacare y jacare new usan http://localhost:3000 por defecto.',
    startBody2:
      'Edita src/app.jcr (o las pantallas en src/pages/ si elegiste la plantilla con nav) y la página recarga en caliente. Cuando quieras explorar toda la API, recorre las lecciones en la barra lateral — o abre el Playground y escribe.',
    hello: '¡Hola, {name}!',
    namePlaceholder: 'Tu nombre',
    demo: {
      quick: {
        title: 'Inicio rápido',
        lead: 'Un pulse, un botón, una línea de texto reactivo — la app Jacaré más pequeña posible.',
        note: 'Este es el contador completo mostrado en el panel de código — sin cableado extra.',
      },
      boot: {
        title: 'Patrón de boot de la app',
        lead: 'Cómo boot.js conecta app.css, el nav y el hot reload en este lab.',
        note: 'Jacaré Lab arranca con nav.attach(root) — el mismo patrón de todas las lecciones de navegación.',
      },
      greeting: {
        title: 'Un signal y un derive juntos',
        lead: 'Cada lección de este lab es una variación de estas dos llamadas.',
      },
      highlight: {
        title: 'Una clase ligada a un signal',
        lead: 'Las lecciones de bindings y CSS se apoyan por completo en esta idea.',
        badge: 'Vista previa',
        toggle: 'Alternar clase',
      },
    },
  },
  i18nPage: {
    kicker: '@jacare/ui · i18n',
    title: 'Internacionalización',
    lead:
      'Inicializa createI18n una vez, guarda las strings en archivos de locale y llama t() / translate() dentro de las views para que cada etiqueta se actualice al cambiar el idioma — sin remount y sin virtual DOM.',
    tip:
      'Llama t() dentro del template (o dentro de un derive que lea el locale). No guardes el resultado de t() en consts o arrays a nivel de módulo — guarda la clave y traduce al renderizar. El t() del Lab devuelve string para que :title=${t(...)} y los placeholders sigan siendo reactivos.',
    yes: 'sí',
    no: 'no',
    hello: '¡Hola, {name}!',
    helloFallback: 'amigo',
    nameLabel: 'Tu nombre',
    namePlaceholder: 'Escribe un nombre…',
    sampleTitle: 'Bienvenido',
    sampleBody: 'Este par Card / Button es @jacare/ui puro — títulos y textos vienen de los archivos de locale y se actualizan con el idioma de la barra superior.',
    sampleAction: 'Prueba otro idioma',
    links: {
      docs: 'Docs de Jacaré UI',
      components: 'Componentes',
      github: 'GitHub · @jacare/ui',
    },
    api: {
      title: 'API · @jacare/ui/i18n',
      lead: 'Una instancia activa vía createI18n. El Lab reexporta los helpers en src/i18n.js.',
      createI18n: 'Arranca el store: locale, fallbackLocale, messages, persist (localStorage j-locale).',
      t: 'Lab: string inmediata. En el paquete, el default devuelve un derive — envuélvelo o llama () si lo usas crudo.',
      translate: 'String inmediata (en el paquete: t(key)()). Prefiere en scripts / cuerpos de derive.',
      setLocale: 'Cambia el locale, actualiza <html lang> y persiste cuando está habilitado.',
      locale: 'Signal del locale actual — enlaza con :value=${locale} en un <select>.',
      te: 'true cuando la clave existe en el locale activo o en el fallback.',
      availableLocales: 'Ids de locale presentes en el objeto messages.',
      addMessages: 'Fusiona más claves en un locale en runtime (incrementa un signal de revisión).',
    },
    demo: {
      live: {
        title: 'Strings en vivo',
        lead: 't() en texto y props :title — cambia el idioma y esta tarjeta se actualiza en el sitio.',
      },
      params: {
        title: 'Interpolación · {name}',
        lead: 'Pasa un objeto params. Los placeholders usan la sintaxis {palabra} y se actualizan con locale e input.',
        note: 'Input vacío cae al valor por defecto traducido (“amigo” / “friend” / …).',
      },
      select: {
        title: '@jacare/ui Select',
        lead: 'El mismo patrón de la barra del Lab: bind-value en el pulse de locale + setLocale en change (persiste j-locale).',
        label: 'Locale en esta página',
        note: 'La elección persiste entre recargas vía localStorage (clave j-locale). Tras F5 el Select muestra el idioma guardado.',
      },
      inspect: {
        title: 'Inspeccionar helpers de locale',
        lead: 'locale(), te() y availableLocales() son reactivos — cambia el idioma y observa las filas.',
      },
      messages: {
        title: 'Catálogos de mensajes',
        lead: 'Anida las claves por feature. Mantén el mismo árbol en cada archivo de locale.',
        note: 'Este Lab fusiona bases en / pt-BR / es con fragments en src/locales/fragments/.',
      },
      pitfalls: {
        title: 'Trampas',
        lead: 'Estos errores hacen que las traducciones parezcan “atascadas” o a medias.',
      },
    },
    inspect: {
      locale: 'Activo: {locale}',
      teKnown: 'existe → {value}',
      teMissing: 'existe → {value}',
      available: '{list}',
    },
    pitfalls: {
      badTop: '❌ const title = t("…") al tope del módulo',
      goodTop: '✅ ${t("…")} dentro de la view',
      badArray: '❌ { label: t("…") } en un array estático',
      goodArray: '✅ { labelKey: "…" } y luego t(row.labelKey)',
      badDerive: '❌ Pasar derive del paquete a bindProp sin ()',
      goodDerive: '✅ t() string del Lab — o llama derive() tú mismo',
    },
    uiKit: {
      title: 'Jacaré UI — biblioteca oficial de componentes',
      body:
        '@jacare/ui es el kit oficial de componentes de Jacaré: controles accesibles y con tema, impulsados por signals, sin virtual DOM. Instálalo junto con @jacare/core e importa Button, Field, Card, Dialog y helpers de tema.',
      item1: 'Botones, campos, formularios, diálogos, selects, date/time pickers y más',
      item2: 'Tokens de tema, densidad y motion vía @jacare/ui/theme',
      item3: 'Módulo de i18n en @jacare/ui/i18n (createI18n / t / setLocale)',
      linkDocs: 'Docs oficiales → jacarejs.github.io/ui',
      linkComponents: 'Catálogo de componentes',
      linkGithub: 'Código en GitHub',
    },
  },
  uiPage: {
    kicker: '@jacare/ui',
    title: 'Kit oficial de UI',
    lead:
      'Componentes Jacaré accesibles y con tema, impulsados por signals — sin virtual DOM. Instala @jacare/ui junto con @jacare/core e importa rutas profundas como @jacare/ui/Button.',
    tip:
      'Este Lab ya carga @jacare/ui/theme.css y applyTheme("system") en boot.js. El control de idioma de la barra es @jacare/ui/Select ligado al pulse de locale persistido (localStorage j-locale). Prefiere imports profundos (@jacare/ui/Card).',
    yes: 'activado',
    no: 'desactivado',
    pillarsHeading: 'Por qué @jacare/ui',
    pillars: {
      signal: {
        title: 'Signals, no VDOM',
        body: 'El mismo grafo de pulses del core — solo los nodos ligados se actualizan.',
      },
      theme: {
        title: 'Una hoja de tokens',
        body: 'theme.css + applyTheme / density / motion para todo el kit.',
      },
      contract: {
        title: 'Contracts primero',
        body: 'Props, slots y emits viven en cada .jcr — la docs se mantiene honesta.',
      },
    },
    links: {
      docs: 'Docs · jacarejs.github.io/ui',
      github: 'GitHub · jacarejs/ui',
      components: 'Catálogo de componentes',
      i18n: 'Guía de i18n',
      theme: 'Tokens de tema',
      fullCatalog: 'Catálogo completo con demos en vivo →',
      select: 'Docs de Select',
      selectDocs: 'Docs del componente Select →',
    },
    demo: {
      install: {
        title: 'Install + boot del tema',
        lead: 'Peer @jacare/core ^0.1.15. Importa theme.css una vez y aplica las preferencias.',
        note: 'El Lab ya usa este patrón en src/boot.js.',
      },
      card: {
        title: 'Card · Button · Badge',
        lead: 'Superficie + acción primaria + pill de estado — la composición útil más pequeña.',
        cardTitle: 'Perfil',
        body: 'Estos son mounts reales de @jacare/ui, no wrappers solo del Lab.',
        badge: 'Oficial',
        save: 'Guardar',
        reset: 'Resetear',
        clicks: 'pulsaciones · {count}',
      },
      form: {
        title: 'Field · Switch',
        lead: 'bind-value / bind-checked conectan pulses directo a los models del kit.',
        nameLabel: 'Nombre',
        namePlaceholder: 'Ada Lovelace',
        nameHint: 'El valor tipado vive en un pulse — sin form library para un solo campo.',
        notify: 'Recibir correos',
        greeting: 'Hola, {name} · notify {notify}',
        anon: 'amigo',
      },
      select: {
        title: 'Select',
        lead: 'Dropdown de @jacare/ui/Select — bind-value a un pulse, options con { value, label }.',
        label: 'Rol',
        placeholder: 'Elige un rol',
        viewer: 'Lector',
        editor: 'Editor',
        admin: 'Admin',
        summary: 'Rol seleccionado: {role}',
      },
      display: {
        title: 'Avatar · Text · Divider',
        lead: 'Compón primitivos de display con Stack — los mismos tokens del resto del kit.',
        name: 'Ada Lovelace',
        badge: 'Colaborador',
        divider: 'Detalles',
        note: 'Signals, sin virtual DOM — Text tone="muted" para texto secundario.',
      },
      controls: {
        title: 'Checkbox · Rate · Slider · InputNumber · Spinner',
        lead: 'Más controles de form/feedback en pulses — alterna el Spinner para ver el estado busy.',
        accept: 'Acepto los términos de la demo',
        qty: 'Cantidad',
        spin: 'Mostrar spinner',
        stop: 'Ocultar spinner',
        saving: 'Guardando…',
        summary: 'acepto {accepted} · estrellas {rating} · volumen {volume} · cant {qty}',
      },
      feedback: {
        title: 'Alert · Progress',
        lead: 'Estado inline y barra determinada — ambos reactivos a pulses.',
        alertTitle: 'Atención',
        alertBody: 'Impulsado por signals de Jacaré — el valor de Progress abajo es un pulse.',
        progressLabel: 'Upload',
        bump: 'Subir progreso',
      },
    },
    catalog: {
      title: 'Qué incluye el paquete',
      lead: 'Mapa corto del catálogo. Abre la docs para cada prop, slot y demo en vivo.',
      forms: 'Forms e inputs (más Autocomplete, Select, Date/Time, Upload, …)',
      display: 'Superficies de visualización de datos',
      feedback: 'Feedback inline y loading',
      overlay: 'Modales y confirmaciones',
      layout: 'Primitivos de layout',
      chrome: 'Helpers de chrome de la app + iconos',
    },
  },
}
