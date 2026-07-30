export default {
  formsPage: {
    kicker: 'API §12',
    title: 'Formularios',
    lead:
      'createForm crea campos respaldados por señales, con validación, control de cambios y un handler de submit listo para conectar.',
    tip:
      'Field usa bind-value (prop de modelo) más :error=${field.error()} para que el hijo reciba el mensaje como string. Los checkboxes nativos siguen necesitando bind-checked sobre un pulse de nivel superior — por eso newsletter vive junto al schema del formulario.',
    field: {
      name: 'Nombre',
      email: 'Correo',
      password: 'Contraseña',
      confirm: 'Confirmar contraseña',
      username: 'Usuario',
    },
    confirmPlaceholder: 'Repite la contraseña',
    newsletter: 'Suscribirse al boletín',
    submit: 'Enviar',
    reset: 'Restablecer',
    yes: 'sí',
    no: 'no',
    error: {
      nameShort: 'El nombre es demasiado corto',
      email: 'Introduce un correo válido',
      mismatch: 'Las contraseñas no coinciden',
      usernameShort: 'Al menos 3 caracteres',
      usernameSpaces: 'No se permiten espacios',
    },
    state: 'válido: {valid} · modificado: {dirty}',
    submitted: 'Enviado:',
    empty: 'Nada enviado todavía.',
    badge: {
      nameTouched: 'nombre tocado: {value}',
      nameDirty: 'nombre modificado: {value}',
      emailTouched: 'correo tocado: {value}',
    },
    stateHint:
      'Enfoca y sal de los campos en la demo de schema de arriba — estos valores cambian en tiempo real.',
    demo: {
      schema: {
        title: 'Schema + validación',
        lead: 'Cada campo controla su propio valor, error y estado de tocado y modificado.',
      },
      submit: {
        title: 'Handler de submit + estado del formulario',
        lead:
          'handleSubmit marca todos los campos como tocados, valida y solo llama a tu callback cuando el formulario es válido.',
      },
      fieldState: {
        title: 'Estado del campo: tocado + modificado',
        lead:
          'Cada campo expone sus propias señales de tocado y modificado, independientes de form.valid y form.dirty.',
      },
      confirm: {
        title: 'Validador propio que lee otro campo',
        lead:
          'La función validate captura el pulse de la contraseña y se vuelve a ejecutar cuando cambia cualquiera de los valores.',
      },
      multi: {
        title: 'Varios validadores en un campo',
        lead: 'validate acepta un array — gana el primer validador que devuelve un mensaje.',
      },
    },
  },
  lifecyclePage: {
    kicker: 'API §13',
    title: 'Ciclo de vida y Scope',
    lead:
      'El nav envuelve cada pantalla lazy con screen() — los hooks se disparan en un orden fijo cuando entras y sales de una ruta.',
    tip:
      'Los títulos estáticos van en createNav como { use, title }. Los títulos dinámicos usan setNavTitle dentro de un effect iniciado en onActivate. Usa onMount para timers — devuelve siempre una limpieza.',
    cycle: {
      badge: 'ciclo en vivo',
      title: 'Flujo del ciclo de vida de la pantalla',
      lead:
        'Entrada: onActivate → onMount → monta la vista. Salida: onDeactivate → onUnmount → ejecuta todas las limpiezas.',
      codeTitle: 'orden del ciclo de vida de screen()',
      diagramAria: 'Diagrama del ciclo de vida de la pantalla',
    },
    phase: {
      mounted: 'montada',
      active: 'activa',
      deactivated: 'desactivada',
      unmounted: 'desmontada',
    },
    orbit: {
      timerSuffix: 's en pantalla',
      note: 'Esta página está ejecutando los hooks de abajo.',
      activate: {
        step: '1 · entrada',
        desc: 'Analytics, registerScope',
      },
      mount: {
        step: '2 · entrada',
        desc: 'Timers, suscripciones — devuelve la limpieza',
      },
      deactivate: {
        step: '3 · salida',
        desc: 'Pantalla oculta, aún puede estar en caché',
      },
      unmount: {
        step: '4 · salida',
        desc: 'Desmontaje final después del dispose',
      },
    },
    legend: {
      enter: 'Camino de entrada',
      leave: 'Camino de salida',
    },
    actions:
      'Sal de esta lección y vuelve — onActivate incrementa otra vez; onDeactivate / onUnmount se disparan cuando el nav descarta la pantalla.',
    phaseLabel: 'fase',
    demo: {
      title: {
        title: 'Título de la pantalla + setNavTitle',
        lead:
          'Los títulos estáticos viven en createNav. Para un título dinámico (cuenta atrás, totales), llama a setNavTitle desde un effect iniciado en onActivate.',
        note: 'Mira la suite Todo /focus para un ejemplo en vivo de setNavTitle + timer.',
      },
      hooks: {
        title: 'Export completo de lifecycle',
        lead:
          'Esta página exporta lifecycle con los cuatro hooks — los contadores de la órbita de arriba están conectados a ellos.',
      },
      scope: {
        title: 'registerScope para DevTools',
        lead:
          'Los valores registrados aparecen en vivo en el panel Scope (abajo a la izquierda por defecto) mientras @jacare/devtools está conectado.',
        note:
          'Abre el panel Scope y busca "Lifecycle ticks" — refleja el timer del centro de la órbita. Usa ⚙ en el Pulse Graph para mover paneles o limpiar el Scope.',
      },
      activation: {
        title: 'onActivate en cada visita',
        lead:
          'Navega a otra lección y vuelve — activations incrementa de nuevo, mientras el timer de onMount sigue contando si la pantalla quedó en caché.',
      },
      dispose: {
        title: 'Dispose de effect (la misma idea que la limpieza de onMount)',
        lead:
          'La limpieza de un effect normal se ejecuta antes de cada reejecución y en el dispose final — el mismo mecanismo detrás de onUnmount.',
        unmountBlock: 'Desmontar bloque',
        mountBlock: 'Montar bloque',
        mounts: 'montajes',
        disposals: 'descartes',
        mounted: 'Este bloque está montado ahora.',
      },
    },
  },
  cookbookPage: {
    kicker: 'API §13b',
    title: 'Recetario',
    lead:
      'Una pantalla que combina condicionales, bucles, eventos, actualizaciones inmutables y dos componentes compartidos.',
    tip:
      'Esta es la misma forma que cualquier pantalla real: pulses para el estado, funciones simples para las acciones y una plantilla que los vuelve a leer.',
    task: {
      readDocs: 'Leer la documentación de la API',
      buildLesson: 'Crear una página de lección',
    },
    remainingOne: '{count} pendiente',
    remainingMany: '{count} pendientes',
    total: 'en total',
    draftPlaceholder: '¿Qué hay que hacer?',
    add: 'Añadir',
    delete: 'Eliminar',
    emptyTasks: 'Aún no hay tareas — añade una arriba.',
    searchPlaceholder: 'Buscar por nombre o rol',
    matchOne: '{count} resultado',
    matchMany: '{count} resultados',
    emptySearch: 'Nadie coincide con esa búsqueda.',
    role: {
      engineer: 'Ingeniería',
      mathematician: 'Matemáticas',
    },
    demo: {
      tasks: {
        title: 'Lista de tareas',
        lead:
          'Añade, marca y elimina tareas con actualizaciones inmutables para que la lista reconcilie de forma eficiente.',
      },
      search: {
        title: 'Búsqueda + filtro',
        lead:
          'Un único derive() alimenta el contador del badge, el estado vacío y la lista filtrada a la vez.',
      },
    },
  },
  playgroundPage: {
    kicker: 'Lab en vivo',
    title: 'Playground',
    lead:
      'Escribe código Jacaré a la izquierda — se compila y se monta a la derecha mientras escribes.',
    tip:
      'Sandbox: la vista previa ejecuta tu código con new Function en esta pestaña del navegador — pega solo código de confianza. Usa un módulo completo: imports, pulses, funciones y luego un bloque export view. Los presets de abajo son puntos de partida completos. Para un editor a pantalla completa y compartible, abre Jacaré Studio.',
    link: {
      studio: 'Abrir Jacaré Studio',
      apiDocs: 'Documentación de la API',
      languageReference: 'Referencia del lenguaje',
    },
    status: {
      ready: 'Listo',
      compiling: 'Compilando…',
      live: 'En vivo',
      error: 'Error',
    },
    hostMissing: 'No se encontró el host de la vista previa',
    sourceTitle: 'Código',
    previewTitle: 'Vista previa',
    previewNote: 'montaje en vivo',
    editorAria: 'Editor de código Jacaré',
    example: {
      counter: 'Contador',
      derive: 'Derive',
      list: 'Lista',
      if: '#if',
      case: '#case',
      events: 'Eventos',
      bindings: 'Bindings',
      'form-field': 'Campo de formulario',
    },
  },
  ssrPage: {
    kicker: 'API §14',
    title: 'SSR e hidratación',
    lead:
      'Cada archivo .jcr compila a tres exports — mount, render y resume — así el mismo código corre en el servidor y en el cliente.',
    tip:
      'Este lab se sirve solo en el cliente, así que las tarjetas de SSR de abajo son demos de referencia con un modelo mental en vivo — View code siempre muestra el módulo completo, incluido el bloque view. Por debajo, render() recorre el mismo MountPlan que mount(), así que class / attr / text dinámicos siguen sincronizados con el Binding IR.',
    hydration: {
      done: 'Hidratado — listeners conectados',
      pending: 'Solo HTML del servidor — todavía sin listeners',
    },
    demo: {
      render: {
        title: 'render(props): HTML del servidor + state',
        lead:
          'render() nunca toca el DOM — devuelve HTML escapado más un pequeño objeto state que describe cada binding dinámico.',
        bump: 'Incrementar (espejo solo en cliente)',
        note:
          'En el servidor este botón todavía no existe — render() solo produce el HTML inicial con el valor de partida de este contador.',
      },
      mental: {
        title: 'El modelo mental de resume()',
        lead:
          'Antes de resume(), el botón parece real pero no tiene listener. Simula resume() para conectarlo — no se recrea nada del DOM.',
        click: 'Púlsame (necesita resume())',
        simulate: 'Simular resume()',
        clicks: 'Clics después de la hidratación:',
      },
      resume: {
        title: 'resume(target, state, props)',
        lead:
          'resume() recorre state.bindings y vuelve a conectar las suscripciones de señales a los nodos ya renderizados por el servidor.',
        note:
          'La hidratación mantiene el HTML del servidor en su lugar — solo los listeners y los bindings se conectan en el cliente.',
      },
      string: {
        title: 'renderToString: un único string HTML',
        lead:
          'Una envoltura fina sobre render() para handlers que solo necesitan un string para enviar.',
        note:
          'Útil para servidores clásicos de request/response que acumulan la página completa antes de escribir.',
      },
      stream: {
        title: 'renderToStream: HTML por chunks',
        lead:
          'Divide el marcado renderizado en chunks de primer nivel para que el servidor empiece a enviar antes.',
        note: 'El mismo código .jcr — solo cambia la estrategia de entrega en el servidor.',
      },
    },
  },
  islandPage: {
    kicker: 'API §14b',
    title: 'Kit de montaje de islas',
    lead:
      'Incrusta un widget .jcr compilado en cualquier página anfitriona — HTML estático, React, Vue, Angular — sin convertir a Jacaré en el shell de la app. Importa mountIsland desde el subpath ligero @jacare/core/island.',
    tip:
      'Esta lección monta islas reales en las tarjetas de abajo. Las apps anfitrionas completas están en examples/jacare-island, jacare-island-react, jacare-island-vue y jacare-island-angular. Prefiere shadow: true cuando el host tiene CSS global agresivo.',
    yes: 'sí',
    no: 'no',
    remount: 'Volver a montar',
    dispose: 'Descartar',
    liveDemo: 'Demo en vivo:',
    local: 'local',
    labClicks: 'Clics del Lab',
    fromLabState: 'Del estado del Lab',
    tipWidget: {
      show: 'Mostrar consejo',
      hide: 'Ocultar consejo',
      body: 'Isla con shadow — el CSS de la página host no reestiliza esta caja.',
      topic: 'Tema:',
    },
    demo: {
      basic: {
        title: 'mountIsland — incrustación en vivo',
        lead:
          'Resuelve el elemento host, llama al mount compilado, marca el host y devuelve el dispose. Los mismos bindings finos que una SPA — solo sin el shell de createNav.',
        loading: 'Cargando isla…',
        live: 'En vivo:',
        hostMark: 'Marca en el host',
        markSet: 'definida',
        markCleared: 'eliminada',
      },
      widget: {
        title: 'El widget es un .jcr normal',
        lead:
          'Contracts, pulses, style con ámbito — nada especial. El kit de islas solo cambia cómo lo monta el host.',
        note:
          'El export default de un .jcr compilado es mount. mountIsland acepta el módulo, module.mount o una función mount suelta.',
      },
      props: {
        title: 'Props desde el host',
        lead:
          'Todavía no hay puente reactivo de props — cuando cambia el estado del host, descarta y vuelve a montar con las nuevas props. Los wrappers de React, Vue y Angular usan el mismo patrón.',
        label: 'Label:',
        mounted: 'montada:',
      },
      shadow: {
        title: 'shadow: true — aislamiento de CSS',
        lead:
          'Adjunta un shadow root abierto, monta en un wrapper Element interno e inyecta los estilos de la isla en ese shadow. Las reglas del host se quedan fuera.',
        clash:
          'Este párrafo del host usa una clase muy llamativa (serif + subrayado). La tarjeta en shadow de abajo la ignora.',
        loading: 'Cargando consejo…',
        remount: 'Volver a montar el shadow',
        live: 'Consejo en shadow en vivo:',
      },
      options: {
        title: 'Opciones: props · shadow · clear · mark',
        lead:
          'Todas las opciones son opcionales. Por defecto se limpia el host — el Cargando… desaparece — y se define data-jacare-island en el elemento host.',
        props: '— objeto que se pasa al mount compilado',
        clear1: '— por defecto',
        clear2: '; limpia los hijos del host antes de montar',
        mark1: '— nombre del atributo, o',
        mark2: 'para omitirlo',
      },
      dispose: {
        title: 'Contrato de dispose',
        lead:
          'El mismo modelo de limpieza que el mount de una SPA: effects, listeners, estilos con ámbito. Descarta siempre al desmontar el host o en HMR.',
        note:
          'Usa el botón Descartar de la primera tarjeta para ver cómo se limpia la marca y se vacía el slot.',
      },
      how: {
        title: 'Cómo funciona mountIsland',
        lead:
          'Siete pasos — resolver host, resolver mount, resolver target — wrapper de shadow — y luego limpiar, montar, marcar y devolver el dispose.',
        note:
          'Los montajes en shadow necesitan un wrapper Element porque bindStyleSheet / los estilos con ámbito llaman a setAttribute sobre el target del montaje.',
      },
      subpath: {
        title: 'Por qué un subpath para islas',
        lead:
          'El @jacare/core principal también exporta nav, forms, SSR y hooks de DevTools. Las islas viven en un subpath ligero para que los bundles del host sigan siendo pequeños.',
        note:
          'El widget sigue importando pulse / derive del core — Vite elimina los símbolos sin usar.',
      },
      static: {
        title: 'Host en HTML estático',
        lead:
          'WordPress, Rails o cualquier página estática: basta con un div y un script de módulo.',
      },
      vite: {
        title: 'Configuración de Vite en el host',
        lead:
          'Añade el plugin jacare junto a React, Vue o Angular JIT para que los imports .jcr compilen.',
        note:
          "Sin el plugin, import X from './X.jcr' falla. Preempaquetar el widget como JS es la otra opción.",
      },
      react: {
        title: 'Wrapper anfitrión en React',
        lead:
          'ref + useEffect: monta al montar, descarta en la limpieza y vuelve a montar cuando cambian las props.',
      },
      vue: {
        title: 'Wrapper anfitrión en Vue 3',
        lead: 'onMounted + watch + onBeforeUnmount — la misma disciplina de dispose.',
      },
      angular: {
        title: 'Wrapper anfitrión en Angular',
        lead:
          'AfterViewInit + OnChanges + OnDestroy con decoradores Input clásicos — los signal inputs no pasan por ngOnChanges.',
        escape: 'Escapa la @ en plantillas de Angular como &#64;.',
      },
    },
    aside: {
      title: 'Ver también',
      ssr: 'SSR §14',
      module: 'Exports de módulo',
      guide: 'Guía completa:',
      api: '· API:',
    },
  },
  toolingPage: {
    kicker: 'API §16 - §19',
    title: 'Herramientas',
    lead:
      'La CLI, el plugin de Vite, el Binding IR, el compilador, DevTools — y la extensión de VS Code para archivos .jcr.',
    tip:
      'DevTools: interruptor en la barra superior (DevTools on/off). Pestañas del overlay: State | Mesh | Scope (↗ abre una ventana). Prefiere la pestaña Jacaré de la extensión de Chrome para un debug más simple. Prueba /bag para Mesh, Lifecycle para Scope y /binding-ir para el bosque del compilador.',
    demo: {
      named: {
        title: 'Pulses con nombre + resaltado del DOM',
        lead:
          'El compilador inyecta { name, file, line } en DEV. Pasa el cursor sobre un nodo de State para resaltar este contador.',
      },
      cli: {
        title: 'Comandos de la CLI',
        lead:
          'jacare new / dev / build / compile / check envuelven Vite y el compilador. Pasa --bindings para los puntos del IR y --routes para comparar jacare-go estático con las pantallas de createNav.',
      },
    },
    vscode: {
      alt: 'Jacaré disponible en el Marketplace de VS Code',
      title: 'Jacaré para VS Code',
      body:
        'Resaltado de sintaxis (JS + opcional // @jacare-ts / *.jcr.ts), snippets (screen/nav/a11y), alias class:/style: y comando de lección del Lab — instálalo desde el Marketplace.',
    },
    uiKit: {
      title: 'Jacaré UI (oficial)',
      body:
        'Componentes accesibles y con tema para apps Jacaré — Button, Field, Card, Dialog, forms, pickers y más — con signals y sin virtual DOM. npm: @jacare/ui.',
      link: 'Docs oficiales → jacarejs.github.io/ui',
    },
    typescript: {
      title: 'TypeScript (opcional)',
      body1: 'Archivo hermano',
      body2: 'o import desde',
      body3: '— tarjetas de referencia (sin montaje en vivo):',
    },
    card: {
      checkBindings: {
        title: 'jacare check --bindings',
        body:
          'Imprime todos los puntos de binding generados desde el Binding IR — la misma clasificación que se usa al emitir para cliente y SSR.',
      },
      checkRoutes: {
        title: 'jacare check --routes',
        body:
          'Opcional: compara los destinos estáticos jacare-go="/…" con los patrones de pantalla de createNav. Los enlaces dinámicos se omiten.',
      },
      expression: {
        title: 'Estilo de expresión',
        body:
          'Prefiere llamadas directas cuando no hay variable de bucle. jacare check avisa de las arrows sin argumentos redundantes.',
      },
      bindingIr: {
        title: 'Binding IR (compilador)',
        body1:
          'Las plantillas se reducen una sola vez a MountPlan; mount() y render() recorren el mismo bosque.',
        body2: 'Lección completa:',
      },
      vite: {
        title: 'Opciones del plugin de Vite',
        body:
          'emit y cpw usan "auto" por defecto — las builds de producción para cliente reciben CPW automáticamente.',
      },
      compiler: {
        title: 'API del compilador',
        body: 'Usa @jacare/compiler directamente para inspeccionar el código generado fuera de Vite.',
      },
      devtools: {
        title: 'DevTools',
        body:
          'State muestra los pulses con nombre + resaltado del DOM; Scope muestra las entradas de registerScope().',
      },
      testing: {
        title: 'Pruebas',
        body: 'Compila + monta en Vitest con happy-dom para una cobertura de integración completa.',
      },
      scripts: {
        title: 'Scripts de package.json',
        body: 'Un proyecto típico conecta dev / build / check / test directamente a la CLI.',
      },
    },
  },
  helpersPage: {
    kicker: 'API §20',
    title: 'Catálogo de imports',
    lead1:
      'Cada símbolo importable con un resumen corto, una explicación detallada, la línea de import y un ejemplo mínimo. Las tablas completas también están en',
    lead2: '§20.',
    tip:
      'Prefiere pulse / derive / watch en código nuevo. Los helpers de DOM (bindText, branch, …) normalmente los emite la sintaxis .jcr — tú escribes ${count}, no la llamada al helper. Filtra por paquete o busca en las explicaciones.',
    filterPlaceholder: 'Filtrar por nombre, paquete, explicación…',
    filterAll: 'todos',
    countOf: 'de',
    countSymbols: 'símbolos',
    importLabel: 'Import',
    exampleLabel: 'Ejemplo',
    openLesson: 'Abrir lección',
    empty: 'Ningún símbolo coincide con ese filtro.',
  },
  topicParamPage: {
    kicker: 'Ruta con parámetro',
    titlePrefix: 'Tema:',
    lead:
      'Montado desde /topic/:slug — el segmento slug se pasa como prop de mount. Sin parseo manual de la URL.',
    tip:
      'createNav combina ctx.params y ctx.search en el objeto de props que se pasa a mount() — cada segmento :name se convierte en una prop con el mismo nombre en la pantalla. El azúcar de plantilla ${@route/slug} lee el mismo parámetro vía getRouteParam (createRoute sigue siendo preferible en JS).',
    back: '← Volver a Navegación',
  },
  notFoundPage: {
    kicker: '404',
    title: 'Esta lección todavía no existe',
    lead1: 'La ruta que seguiste no coincide con ninguna pantalla en',
    lead2: '. Vuelve al inicio y elige una lección en la barra lateral.',
    back: '← Volver al Inicio',
  },
}
