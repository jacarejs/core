export default {
  bag: {
    kicker: 'API · Pulse bags',
    title: 'Pulse bags',
    lead:
      'El modelo de estado compartido propio de Jacaré: pulses con nombre en un mesh direccionable, conectados en tiempo de compilación — ligero, nativo y construido sobre las mismas cells de la reactividad local.',
    tip:
      'Prefiere cart.count() puro o ${@cart/count} cuando no haya un local de loop. La factory queda lazy hasta la primera lectura de propiedad — los módulos de bag sin uso salen en el tree-shake. Las views compiladas emiten /* jacare-mesh-ports: … */ para las ports que tocan.',
    products: {
      tea: 'Mate',
      cap: 'Gorra',
      zine: 'Zine',
    },
    mesh30: {
      title: 'Mesh 30s — sin useStore()',
      lead:
        'Un bag, dos pantallas, una dirección. Lee esta tarjeta (~30s), pulsa Añadir, mira cómo se mueven los dos badges — luego abre la pantalla real de checkout.',
      step1: 'publica ports en el Mesh',
      step2: 'vía',
      step3: 'sin import',
      screenA: 'Pantalla A',
      screenB: 'Pantalla B',
      screensAria: 'Dos pantallas compartiendo un bag',
      openCheckout: 'Abrir la Pantalla B real · /bag/checkout',
      sameBag: 'Mismo id de bag',
      bookmarkable: 'URL guardable en favoritos.',
    },
    arch: {
      title: 'Arquitectura · Pulse Mesh + Pulse Bag',
      lead:
        'Este es un diseño nativo de Jacaré — no es un port de otra librería de store. El grafo de pulse / DependencyCell ya existía; Pulse Mesh hace esas cells direccionables (@cart/total), y Pulse Bag es la DX que publica un grupo con nombre usando createBag. Cualquier .jcr se conecta por import, por links en el contract o por address sugar — la misma cell, actualización O(1).',
      diagramAria: 'Capas del Pulse Mesh',
      idea: {
        title: 'La idea',
        body:
          'Comparte estado entre cualquier componente sin props drilling y sin un segundo sistema de reactividad. Una escritura entra en un pulse; solo el DOM (y los derives) que realmente leen esa cell se actualizan — el mesh es el grafo que ya existe, con direcciones estables para las herramientas y para el cableado en compilación.',
        item1: 'Sin provider / wrapper de context alrededor del árbol',
        item2: 'Sin proxy de store ni objeto state paralelo',
        item3: 'Las mutaciones usan ripple() (una ola de flush), no un dispatcher',
      },
      how: {
        title: 'Cómo funciona',
        body:
          'createBag registra un id. La factory corre en la primera lectura de propiedad (lazy publish). Las cells reciben direcciones estables para DevTools y para el snap de SSR. Las templates que leen cart.count o @cart/count bajan a Mesh Ports — bindText(node, cell) / peek+subscribe de CPW — el puntero de la cell se fija en el mount.',
        item1: 'ripple = batch + meta del mesh (una ola de flush)',
        item2: 'snap / hydrate / reset suave conservan la identidad de la cell',
        item3: 'La pestaña Mesh de DevTools lista @id/key y el último ripple',
      },
      light: {
        title: 'Por qué es ligero y nativo',
        body:
          'Los bags no son un segundo sistema de reactividad. Nombran y agrupan los pulses que ya conoces. El runtime es un registro fino + ensure lazy. La ruta caliente equivale a un pulse local una vez que la Mesh Port está conectada.',
        item1: 'Viene en @jacare/core — sin paquete de store extra',
        item2: 'Los módulos de bag sin uso salen en el tree-shake (nunca importados → fuera del chunk)',
        item3: 'El compilador emite pistas de slice /* jacare-mesh-ports: … */',
        item4: 'Límites por links en el contract (read / write / mirror) sin Inject',
      },
      shipped: {
        title: 'Qué ya está listo',
        body: 'Capacidades que puedes probar en las demos de abajo.',
        item1: 'createBag, ripple, snap / hydrate / reset suave',
        item2: 'Mesh en DevTools (@lab-cart/*, pop-out)',
        item3: 'IR de Mesh Port — cart.count liga la cell directamente',
        item4: 'links en el contract + jacare check para ports publicadas',
        item5: 'Factory lazy + pistas de slice /* jacare-mesh-ports */',
        item6: 'Address sugar @bag/key vía getBag',
      },
    },
    demo: {
      define: {
        title: 'createBag + carrito en vivo',
        lead:
          'Añade desde el catálogo — la cuenta y el total se actualizan por la misma instancia del bag.',
        clear: 'Vaciar bag',
      },
      use: {
        title: 'El mismo bag, otra view',
        lead: 'Una segunda superficie importa el bag idéntico — sin props, sin provider.',
        empty: 'El carrito está vacío.',
        remove: 'Quitar',
      },
      links: {
        title: 'links en el contract (sin importar el bag)',
        lead:
          'Una hoja reutilizable declara links en el contract — getBag resuelve @lab-cart/* en el mount. jacare check verifica que la port esté publicada.',
      },
      lazy: {
        title: 'Publish lazy',
        lead:
          'Importar el módulo del bag solo registra el id. La factory corre en la primera lectura de propiedad — las ejecuciones de la factory siguen en 0 hasta que toques el bag.',
        runs: 'ejecuciones de la factory',
        touch: 'Tocar el bag',
        bump: 'Incrementar (también publica)',
        note:
          'El Mesh queda sin publicar hasta la primera lectura de propiedad. Abre DevTools → Mesh para @lab-lazy/*.',
      },
      address: {
        title: 'Address sugar @bag/key',
        lead:
          'Sin importar el bag — @lab-cart/count y @lab-cart/clear se resuelven vía getBag en la dirección del mesh.',
        clear: 'Vaciar vía @lab-cart/clear',
      },
      tree: {
        title: 'Padre → hijo → nieto → hoja',
        lead:
          'Cuatro componentes anidados en un bag aparte (lab-tree). Padre/hijo leen; la hoja escribe. El carrito en vivo de arriba sigue en lab-cart.',
      },
      snap: {
        title: 'snap / hydrate / reset',
        lead:
          'Persiste los pulses escribibles, restáuralos o haz un reset suave a los valores de la factory (las mismas cells — la UI sigue viva).',
        snap: 'Snap a la sesión',
        hydrate: 'Hydrate',
        reset: 'Resetear bag',
      },
    },
    mesh30Catalog: {
      screenLabel: 'Pantalla A · Catálogo',
      badgeTitle: 'Ruta del import: mesh30.count',
      cart: 'carrito',
      lead: 'Importa el bag y llama a ripple vía add.',
      add: 'Añadir',
      items: {
        tea: 'Mate',
        cap: 'Gorra',
        zine: 'Zine',
      },
    },
    mesh30Chrome: {
      screenLabel: 'Pantalla B · Chrome',
      badgeTitle: 'Address sugar — sin importar el bag',
      inCart: 'en el carrito',
      lead: 'Las mismas cells vía address sugar — sin import en este archivo.',
      clear: 'Vaciar vía @lab-mesh30/clear',
    },
  },
  bagCheckout: {
    kicker: 'Mesh 30s · Pantalla B',
    title: 'Chrome del checkout',
    leadStart:
      'Esta pantalla nunca importa el módulo del bag para leer — solo el address sugar. Añade ítems en',
    leadEnd: ', luego vuelve: el badge sigue sincronizado.',
    tip:
      'El import por efecto secundario registra el bag una vez. La template solo usa address sugar — la misma Mesh Port que la Pantalla A en /bag.',
    sharedBadge: 'Badge compartido',
    clear: 'Vaciar carrito',
    back: 'Volver al Mesh 30s',
  },
  templates: {
    kicker: 'API §4',
    title: 'Templates',
    lead:
      'Las templates compilan en tiempo de build — el compilador emite llamadas directas al DOM y hooks de binding, nunca un árbol virtual.',
    tip:
      'Un ${signal} puro en el texto compila a un text binding. En cuanto lo mezclas con otro texto o lo llamas, el compilador cae a un effect — escribe siempre ${name()} en texto mixto.',
    demo: {
      text: {
        title: 'Texto puro vs mixto',
        lead:
          '${name} puro compila a un text binding. Mezcla texto estático con un signal y tienes que llamarlo — Hello, ${name()}!',
        placeholder: 'Escribe un nombre',
        bare: 'Puro',
        mixed: 'Mixto',
        hello: '¡Hola, {name}!',
      },
      attr: {
        title: 'Atributo estático vs :src / bind-href',
        lead: 'Un atributo string normal nunca cambia; :src y bind-href siguen un signal.',
        staticTitle: 'Este title nunca cambia',
        staticBadge: 'Atributo estático',
        avatarAlt: 'Avatar',
        swapSrc: 'Cambiar :src',
        reactiveLink: 'Enlace reactivo',
        swapHref: 'Cambiar bind-href',
      },
      progress: {
        title: 'Variable CSS reactiva: style---pct',
        lead: 'style---nombre liga un signal directo a una custom property de CSS.',
      },
      multiAttr: {
        title: 'Varios atributos reactivos en un elemento',
        lead: ':disabled y :title siguen signals derivados en el mismo botón.',
        seats: '{booked} / {max} plazas reservadas',
        book: 'Reservar una plaza',
      },
      trend: {
        title: 'Texto condicional + clase por expresiones',
        lead:
          'trendLabel es un ternario dentro de derive(); las clases del badge vienen de expresiones inline, no de signals puros.',
        up: '▲ Sube',
        down: '▼ Baja',
        flat: '– Estable',
      },
    },
  },
  bindings: {
    kicker: 'API §5',
    title: 'Bindings',
    lead:
      'bind-value / bind-checked conectan inputs de dos vías. class-* alterna una clase. style---* liga un signal a una custom property de CSS. Client y SSR comparten un único Binding IR — el compilador clasifica cada punto una sola vez.',
    tip:
      'Prefiere expresiones puras cuando no haya un local de loop que capturar — ${count()} y ${() => count()} reaccionan igual; la primera es el estilo Jacaré. Usa arrow para ítems de #for y handlers. jacare check avisa de arrows sin argumentos redundantes (CPW igual inlinea class-*, style---* y bind-* de una vía en producción).',
    demo: {
      mirror: {
        title: 'Espejos con bind-value / bind-checked',
        lead:
          'Los dos inputs de cada fila están ligados al mismo pulse — escribe o alterna cualquiera.',
        placeholder: 'Escribe aquí',
        mirrorPlaceholder: 'Refleja el campo de arriba',
        agree: 'Acepto',
        mirrorCheckbox: 'Refleja el checkbox',
      },
      classes: {
        title: 'class-active / class-done',
        lead: 'Un binding class-<nombre> alterna esa clase según un booleano.',
        tasks: {
          docs: 'Leer la documentación',
          demo: 'Construir una demo',
          ship: 'Publicar',
        },
      },
      gauge: {
        title: 'Gauge con style---',
        lead: 'La clase gauge-mini lee la custom property --angle que define style---angle.',
      },
      number: {
        title: 'bind-value en un input numérico',
        lead: 'bind-value convierte automáticamente — quantity es un número puro, no un string.',
      },
      multiClass: {
        title: 'Varios bindings class-* en un elemento',
        lead: 'Cada botón lleva tres toggles class-* independientes a la vez.',
        levels: {
          low: 'baja',
          medium: 'media',
          high: 'alta',
        },
      },
    },
  },
  events: {
    kicker: 'API §6',
    title: 'Eventos',
    lead:
      'on-* y @* conectan un addEventListener real con limpieza automática en el unmount. Sirve cualquier nombre de evento del DOM.',
    tip:
      'Prefiere handlers con nombre por legibilidad. Las arrows inline van muy bien dentro de loops cuando necesitas capturar el ítem actual. Para campos de texto, prefiere bind-value — usa on-input / on-change cuando necesites el evento crudo.',
    demo: {
      click: {
        title: 'Handler con nombre vs @click',
        lead: 'on-click y @click compilan exactamente a la misma llamada de addEventListener.',
        named: 'on-click (con nombre)',
        inline: '@click (inline)',
        clicks: 'Clics',
      },
      loop: {
        title: 'Arrow inline dentro de un loop',
        lead: 'Cada fila necesita su propio handler ligado a ese fruit.id concreto.',
        pick: 'Elegir',
        fruits: {
          apple: 'Manzana',
          banana: 'Plátano',
          cherry: 'Cereza',
        },
      },
      keydown: {
        title: 'on-keydown: enviar con Enter',
        lead: 'Un handler de teclado normal — sin sintaxis especial de formulario.',
        placeholder: 'Escribe y pulsa Enter',
        submitted: 'Enviado',
      },
      inputChange: {
        title: 'on-input vs on-change',
        lead:
          'input se dispara en cada tecla; change se dispara cuando el valor se confirma (blur / Enter en campos de texto).',
        placeholder: 'Escribe y luego sal del campo o pulsa Enter',
        live: 'on-input (en vivo)',
        committed: 'on-change (confirmado)',
      },
      focus: {
        title: 'on-focus / on-blur',
        lead: 'Sigue las transiciones de foco con el mismo patrón de listener que click.',
        placeholder: 'Haz clic dentro y luego fuera',
        state: 'Estado',
        log: 'Log',
        focused: 'con foco',
        blurred: 'sin foco',
        empty: 'nada aún',
      },
      submit: {
        title: 'on-submit + preventDefault',
        lead: 'Evita que el navegador recargue la página y trata los valores tú mismo.',
        placeholder: 'Tu nombre',
        submit: 'Enviar',
        waiting: 'Esperando el envío…',
        saved: 'Guardado "{name}" (sin recargar la página)',
        required: 'El nombre es obligatorio',
      },
      pad: {
        title: 'Pad de pointer',
        lead: 'on-pointermove mueve variables CSS; down / up / leave siguen el estado de presión.',
        pressing: 'presionando',
        idle: 'inactivo',
      },
      stop: {
        title: 'stopPropagation: botones anidados',
        lead: 'El botón interno evita que el clic dispare también el handler de la tarjeta.',
        cardHint: 'Haz clic en cualquier parte de esta tarjeta.',
        inner: 'Botón interno (detiene la propagación)',
        outerCount: 'externo',
        innerCount: 'interno',
      },
      preventLink: {
        title: 'preventDefault en un enlace',
        lead: 'Bloquea la navegación y corre tu propia lógica.',
        link: 'Enlace externo (bloqueado)',
        calls: 'llamadas a preventDefault',
      },
      hover: {
        title: 'on-mouseenter / on-mouseleave',
        lead: 'Seguimiento de hover con las mismas reglas de limpieza que cualquier otro listener.',
        hint: 'Pasa el ratón por esta tarjeta — hover: {state}',
        yes: 'sí',
        no: 'no',
        entered: 'Veces que entró',
      },
      dblclick: {
        title: 'on-dblclick',
        lead: 'Sirve cualquier nombre de evento del DOM — incluido dblclick.',
        button: 'Haz doble clic',
        count: 'cuenta de dblclick',
      },
      debug: {
        title: '<debug>: estado de los eventos',
        lead: 'Inspecciona el estado reactivo tras los clics — usa copy para tomar el JSON.',
        click: 'Clic',
        pickApple: 'Elegir manzana',
      },
    },
  },
  debug: {
    kicker: 'API §7c',
    title: 'Debug',
    lead:
      'Imprime el estado reactivo como JSON en desarrollo. Prefiere <debug> a volcar objetos en nodos de texto normales cuando quieras comillas legibles y actualizaciones en vivo.',
    tip:
      '<debug> se elimina de los builds de producción (Vite pasa debug: !isProduction). El render() de SSR también lo ignora. Los nombres de pulse puros dentro de { score, mood } se vuelven score() / mood() automáticamente.',
    syntax: {
      title: 'Sintaxis',
      body: 'El cuerpo debe ser un único ${expr}. label y el booleano copy son opcionales.',
      alsoUsedIn: 'También se usa en vivo en',
      and: 'y',
    },
    demo: {
      single: {
        title: 'Un solo pulse',
        lead: 'Pasa un signal — el panel se actualiza cada vez que el valor cambia.',
        add: 'Añadir línea',
        bump: 'Subir la primera qty',
      },
      labelCopy: {
        title: 'label + copy',
        lead: 'label titula el encabezado; copy añade un botón Copy JSON.',
        note: 'El mismo pulse del carrito — prueba Copy JSON en el panel.',
      },
      shorthand: {
        title: 'Atajo de objeto',
        lead:
          '{ score, mood, removed } desenvuelve cada pulse — no hace falta score() dentro del literal.',
        cycleMood: 'ciclar ánimo',
      },
      nested: {
        title: 'Objeto derivado',
        lead:
          'Cualquier expresión funciona — aquí un derive junta pulses anidados en un solo snapshot.',
        rename: 'Renombrar usuario',
        toggleDark: 'Alternar dark',
      },
    },
  },
  why: {
    kicker: 'API §15 · why()',
    title: 'Why',
    lead:
      'Una pregunta — ¿por qué esta UI está así? — respondida igual en la consola, en el overlay, en los errores de ciclo y en jacare why archivo:línea.',
    tip:
      'Activa DevTools (toggle del Lab o connectJacareDevtools). Luego usa $why($0) sobre un elemento seleccionado, haz clic en un valor de State/Mesh para abrir la tarjeta Why, o corre jacare why src/pages/why.jcr:NN en la terminal.',
    demo: {
      title: '$why en la consola',
      lead:
        'Selecciona el badge de abajo en Elements de DevTools y corre $why($0). Es la misma cadena de la tarjeta Why del overlay.',
      idle: 'inactivo',
      once: 'una vez',
    },
    console: {
      title: 'Consola · overlay · error',
    },
    cli: {
      title: 'jacare why (IR estático)',
      body: 'Sin navegador — puntos del Binding IR para un archivo:línea (hermano de check --bindings).',
    },
    cycle: {
      title: 'ReactiveCycleError incluye why',
      body: 'Con DevTools activo, los errores de ciclo añaden el mismo texto de WhyChain.',
    },
  },
}
