export default {
  bag: {
    kicker: 'API · Pulse bags',
    title: 'Pulse bags',
    lead:
      'O modelo de estado compartilhado do próprio Jacaré: pulses nomeados em um mesh endereçável, ligados em tempo de compilação — leve, nativo e construído sobre as mesmas cells da reatividade local.',
    tip:
      'Prefira cart.count() puro ou ${@cart/count} quando não houver local de loop. A factory fica lazy até a primeira leitura de propriedade — módulos de bag não usados saem no tree-shake. Views compiladas emitem /* jacare-mesh-ports: … */ para as ports que tocam.',
    products: {
      tea: 'Chá mate',
      cap: 'Boné',
      zine: 'Zine',
    },
    mesh30: {
      title: 'Mesh 30s — sem useStore()',
      lead:
        'Um bag, duas telas, um endereço. Leia este card (~30s), toque em Adicionar, veja os dois badges se moverem — depois abra a tela real de checkout.',
      step1: 'publica ports no Mesh',
      step2: 'via',
      step3: 'sem import',
      screenA: 'Tela A',
      screenB: 'Tela B',
      screensAria: 'Duas telas compartilhando um bag',
      openCheckout: 'Abrir a Tela B real · /bag/checkout',
      sameBag: 'Mesmo id de bag',
      bookmarkable: 'URL favoritável.',
    },
    arch: {
      title: 'Arquitetura · Pulse Mesh + Pulse Bag',
      lead:
        'Este é um design nativo do Jacaré — não é uma port de outra biblioteca de store. O grafo de pulse / DependencyCell já existia; o Pulse Mesh torna essas cells endereçáveis (@cart/total), e o Pulse Bag é a DX que publica um grupo nomeado com createBag. Qualquer .jcr se conecta por import, por links no contract ou por address sugar — mesma cell, atualização O(1).',
      diagramAria: 'Camadas do Pulse Mesh',
      idea: {
        title: 'A ideia',
        body:
          'Compartilhe estado entre qualquer componente sem props drilling e sem um segundo sistema de reatividade. Uma escrita entra em um pulse; só o DOM (e os derives) que realmente leem aquela cell atualizam — o mesh é o grafo que já existe, com endereços estáveis para ferramentas e para a ligação em tempo de compilação.',
        item1: 'Sem provider / wrapper de context em volta da árvore',
        item2: 'Sem proxy de store nem objeto state paralelo',
        item3: 'Mutações usam ripple() (uma onda de flush), não um dispatcher',
      },
      how: {
        title: 'Como funciona',
        body:
          'createBag registra um id. A factory roda na primeira leitura de propriedade (lazy publish). As cells ganham endereços estáveis para o DevTools e para o snap de SSR. Templates que leem cart.count ou @cart/count baixam para Mesh Ports — bindText(node, cell) / peek+subscribe do CPW — o ponteiro da cell é fixado no mount.',
        item1: 'ripple = batch + meta do mesh (uma onda de flush)',
        item2: 'snap / hydrate / reset suave preservam a identidade da cell',
        item3: 'A aba Mesh do DevTools lista @id/key e o último ripple',
      },
      light: {
        title: 'Por que é leve e nativo',
        body:
          'Bags não são um segundo sistema de reatividade. Eles nomeiam e agrupam os pulses que você já conhece. O runtime é um registro fino + ensure lazy. O caminho quente equivale a um pulse local depois que a Mesh Port está ligada.',
        item1: 'Vem no @jacare/core — sem pacote de store extra',
        item2: 'Módulos de bag não usados saem no tree-shake (nunca importados → fora do chunk)',
        item3: 'O compilador emite dicas de slice /* jacare-mesh-ports: … */',
        item4: 'Limites por links no contract (read / write / mirror) sem Inject',
      },
      shipped: {
        title: 'O que já existe',
        body: 'Recursos que você pode exercitar nas demos abaixo.',
        item1: 'createBag, ripple, snap / hydrate / reset suave',
        item2: 'Mesh no DevTools (@lab-cart/*, pop-out)',
        item3: 'IR de Mesh Port — cart.count liga a cell diretamente',
        item4: 'links no contract + jacare check para ports publicadas',
        item5: 'Factory lazy + dicas de slice /* jacare-mesh-ports */',
        item6: 'Address sugar @bag/key via getBag',
      },
    },
    demo: {
      define: {
        title: 'createBag + carrinho ao vivo',
        lead: 'Adicione pelo catálogo — contagem e total atualizam pela mesma instância do bag.',
        clear: 'Limpar bag',
      },
      use: {
        title: 'Mesmo bag, outra view',
        lead: 'Uma segunda superfície importa o bag idêntico — sem props, sem provider.',
        empty: 'O carrinho está vazio.',
        remove: 'Remover',
      },
      links: {
        title: 'links no contract (sem importar o bag)',
        lead:
          'Uma folha reutilizável declara links no contract — o getBag resolve @lab-cart/* no mount. O jacare check verifica se a port está publicada.',
      },
      lazy: {
        title: 'Publish lazy',
        lead:
          'Importar o módulo do bag só registra o id. A factory roda na primeira leitura de propriedade — as execuções da factory ficam em 0 até você tocar no bag.',
        runs: 'execuções da factory',
        touch: 'Tocar no bag',
        bump: 'Incrementar (também publica)',
        note:
          'O Mesh fica sem publicar até a primeira leitura de propriedade. Abra DevTools → Mesh para @lab-lazy/*.',
      },
      address: {
        title: 'Address sugar @bag/key',
        lead:
          'Sem importar o bag — @lab-cart/count e @lab-cart/clear resolvem via getBag no endereço do mesh.',
        clear: 'Limpar via @lab-cart/clear',
      },
      tree: {
        title: 'Pai → filho → neto → folha',
        lead:
          'Quatro componentes aninhados em um bag separado (lab-tree). Pai/filho leem; a folha escreve. O carrinho ao vivo acima continua no lab-cart.',
      },
      snap: {
        title: 'snap / hydrate / reset',
        lead:
          'Persista pulses graváveis, restaure-os ou faça reset suave para os padrões da factory (mesmas cells — a UI continua viva).',
        snap: 'Snap para a sessão',
        hydrate: 'Hydrate',
        reset: 'Resetar bag',
      },
    },
    mesh30Catalog: {
      screenLabel: 'Tela A · Catálogo',
      badgeTitle: 'Caminho do import: mesh30.count',
      cart: 'carrinho',
      lead: 'Importe o bag e chame ripple via add.',
      add: 'Adicionar',
      items: {
        tea: 'Chá',
        cap: 'Boné',
        zine: 'Zine',
      },
    },
    mesh30Chrome: {
      screenLabel: 'Tela B · Chrome',
      badgeTitle: 'Address sugar — sem importar o bag',
      inCart: 'no carrinho',
      lead: 'Mesmas cells via address sugar — sem import neste arquivo.',
      clear: 'Limpar via @lab-mesh30/clear',
    },
  },
  bagCheckout: {
    kicker: 'Mesh 30s · Tela B',
    title: 'Chrome do checkout',
    leadStart:
      'Esta tela nunca importa o módulo do bag para ler — só o address sugar. Adicione itens em',
    leadEnd: ', depois volte: o badge continua sincronizado.',
    tip:
      'O import por efeito colateral registra o bag uma vez. O template só usa address sugar — a mesma Mesh Port da Tela A em /bag.',
    sharedBadge: 'Badge compartilhado',
    clear: 'Limpar carrinho',
    back: 'Voltar para o Mesh 30s',
  },
  templates: {
    kicker: 'API §4',
    title: 'Templates',
    lead:
      'Templates compilam em tempo de build — o compilador emite chamadas diretas ao DOM e hooks de binding, nunca uma árvore virtual.',
    tip:
      'Um ${signal} puro no texto compila para um text binding. No momento em que você mistura com outro texto ou chama a função, o compilador cai para um effect — sempre escreva ${name()} em texto misto.',
    demo: {
      text: {
        title: 'Texto puro vs misto',
        lead:
          '${name} puro compila para um text binding. Misture texto estático com um signal e você precisa chamá-lo — Hello, ${name()}!',
        placeholder: 'Digite um nome',
        bare: 'Puro',
        mixed: 'Misto',
        hello: 'Olá, {name}!',
      },
      attr: {
        title: 'Atributo estático vs :src / bind-href',
        lead: 'Um atributo string comum nunca muda; :src e bind-href acompanham um signal.',
        staticTitle: 'Este title nunca muda',
        staticBadge: 'Atributo estático',
        avatarAlt: 'Avatar',
        swapSrc: 'Trocar :src',
        reactiveLink: 'Link reativo',
        swapHref: 'Trocar bind-href',
      },
      progress: {
        title: 'Variável CSS reativa: style---pct',
        lead: 'style---nome liga um signal direto a uma custom property do CSS.',
      },
      multiAttr: {
        title: 'Vários atributos reativos em um elemento',
        lead: ':disabled e :title acompanham signals derivados no mesmo botão.',
        seats: '{booked} / {max} lugares reservados',
        book: 'Reservar um lugar',
      },
      trend: {
        title: 'Texto condicional + classe por expressões',
        lead:
          'trendLabel é um ternário dentro de derive(); as classes do badge vêm de expressões inline, não de signals puros.',
        up: '▲ Subiu',
        down: '▼ Caiu',
        flat: '– Estável',
      },
    },
  },
  bindings: {
    kicker: 'API §5',
    title: 'Bindings',
    lead:
      'bind-value / bind-checked ligam inputs de duas vias. class-* alterna uma classe. style---* liga um signal a uma custom property do CSS. Client e SSR compartilham um único Binding IR — o compilador classifica cada ponto uma vez.',
    tip:
      'Prefira expressões puras quando não houver local de loop para capturar — ${count()} e ${() => count()} reagem igual; a primeira é o estilo Jacaré. Use arrow para itens de #for e handlers. O jacare check avisa sobre arrows sem argumentos redundantes (o CPW ainda inlina class-*, style---* e bind-* de uma via em produção).',
    demo: {
      mirror: {
        title: 'Espelhos com bind-value / bind-checked',
        lead: 'Os dois inputs de cada linha estão ligados ao mesmo pulse — digite ou alterne qualquer um.',
        placeholder: 'Digite aqui',
        mirrorPlaceholder: 'Espelha o campo acima',
        agree: 'Concordo',
        mirrorCheckbox: 'Espelha o checkbox',
      },
      classes: {
        title: 'class-active / class-done',
        lead: 'Um binding class-<nome> alterna essa classe com base em um booleano.',
        tasks: {
          docs: 'Ler a documentação',
          demo: 'Construir uma demo',
          ship: 'Publicar',
        },
      },
      gauge: {
        title: 'Gauge com style---',
        lead: 'A classe gauge-mini lê a custom property --angle definida por style---angle.',
      },
      number: {
        title: 'bind-value em um input numérico',
        lead: 'bind-value converte automaticamente — quantity é um número puro, não uma string.',
      },
      multiClass: {
        title: 'Vários bindings class-* em um elemento',
        lead: 'Cada botão carrega três toggles class-* independentes ao mesmo tempo.',
        levels: {
          low: 'baixa',
          medium: 'média',
          high: 'alta',
        },
      },
    },
  },
  events: {
    kicker: 'API §6',
    title: 'Eventos',
    lead:
      'on-* e @* ligam um addEventListener real com limpeza automática no unmount. Qualquer nome de evento do DOM funciona.',
    tip:
      'Prefira handlers nomeados pela legibilidade. Arrows inline são ótimas dentro de loops quando você precisa capturar o item atual. Para campos de texto, prefira bind-value — use on-input / on-change quando precisar do evento bruto.',
    demo: {
      click: {
        title: 'Handler nomeado vs @click',
        lead: 'on-click e @click compilam para exatamente a mesma chamada de addEventListener.',
        named: 'on-click (nomeado)',
        inline: '@click (inline)',
        clicks: 'Cliques',
      },
      loop: {
        title: 'Arrow inline dentro de um loop',
        lead: 'Cada linha precisa do seu próprio handler ligado àquele fruit.id específico.',
        pick: 'Escolher',
        fruits: {
          apple: 'Maçã',
          banana: 'Banana',
          cherry: 'Cereja',
        },
      },
      keydown: {
        title: 'on-keydown: enviar com Enter',
        lead: 'Um handler de teclado comum — nenhuma sintaxe especial de formulário.',
        placeholder: 'Digite e pressione Enter',
        submitted: 'Enviado',
      },
      inputChange: {
        title: 'on-input vs on-change',
        lead:
          'input dispara a cada tecla; change dispara quando o valor é confirmado (blur / Enter em campos de texto).',
        placeholder: 'Digite e depois saia do campo ou pressione Enter',
        live: 'on-input (ao vivo)',
        committed: 'on-change (confirmado)',
      },
      focus: {
        title: 'on-focus / on-blur',
        lead: 'Acompanhe transições de foco com o mesmo padrão de listener do click.',
        placeholder: 'Clique aqui e depois clique fora',
        state: 'Estado',
        log: 'Log',
        focused: 'com foco',
        blurred: 'sem foco',
        empty: 'nada ainda',
      },
      submit: {
        title: 'on-submit + preventDefault',
        lead: 'Impeça o navegador de recarregar a página e trate os valores você mesmo.',
        placeholder: 'Seu nome',
        submit: 'Enviar',
        waiting: 'Aguardando o envio…',
        saved: 'Salvo "{name}" (sem recarregar a página)',
        required: 'O nome é obrigatório',
      },
      pad: {
        title: 'Pad de pointer',
        lead: 'on-pointermove move variáveis CSS; down / up / leave acompanham o estado de pressão.',
        pressing: 'pressionando',
        idle: 'parado',
      },
      stop: {
        title: 'stopPropagation: botões aninhados',
        lead: 'O botão interno impede que o clique também dispare o handler do card.',
        cardHint: 'Clique em qualquer lugar deste card.',
        inner: 'Botão interno (para a propagação)',
        outerCount: 'externo',
        innerCount: 'interno',
      },
      preventLink: {
        title: 'preventDefault em um link',
        lead: 'Bloqueie a navegação e rode sua própria lógica.',
        link: 'Link externo (bloqueado)',
        calls: 'chamadas de preventDefault',
      },
      hover: {
        title: 'on-mouseenter / on-mouseleave',
        lead: 'Rastreio de hover com as mesmas regras de limpeza de qualquer outro listener.',
        hint: 'Passe o mouse neste card — hover: {state}',
        yes: 'sim',
        no: 'não',
        entered: 'Vezes que entrou',
      },
      dblclick: {
        title: 'on-dblclick',
        lead: 'Qualquer nome de evento do DOM funciona — incluindo dblclick.',
        button: 'Dê um duplo clique',
        count: 'contagem de dblclick',
      },
      debug: {
        title: '<debug>: estado dos eventos',
        lead: 'Inspecione o estado reativo depois dos cliques — use copy para pegar o JSON.',
        click: 'Clicar',
        pickApple: 'Escolher maçã',
      },
    },
  },
  debug: {
    kicker: 'API §7c',
    title: 'Debug',
    lead:
      'Imprima o estado reativo como JSON em desenvolvimento. Prefira <debug> a jogar objetos em nós de texto comuns quando quiser aspas legíveis e atualizações ao vivo.',
    tip:
      '<debug> é removido dos builds de produção (o Vite passa debug: !isProduction). O render() de SSR também ignora. Nomes de pulse puros dentro de { score, mood } viram score() / mood() automaticamente.',
    syntax: {
      title: 'Sintaxe',
      body: 'O corpo deve ser um único ${expr}. label e o booleano copy são opcionais.',
      alsoUsedIn: 'Também usado ao vivo em',
      and: 'e',
    },
    demo: {
      single: {
        title: 'Um único pulse',
        lead: 'Passe um signal — o painel atualiza sempre que o valor muda.',
        add: 'Adicionar linha',
        bump: 'Aumentar a primeira qty',
      },
      labelCopy: {
        title: 'label + copy',
        lead: 'label dá título ao cabeçalho; copy adiciona um botão Copy JSON.',
        note: 'Mesmo pulse do carrinho — experimente o Copy JSON no painel.',
      },
      shorthand: {
        title: 'Atalho de objeto',
        lead: '{ score, mood, removed } desembrulha cada pulse — sem precisar de score() dentro do literal.',
        cycleMood: 'ciclar humor',
      },
      nested: {
        title: 'Objeto derivado',
        lead: 'Qualquer expressão funciona — aqui um derive junta pulses aninhados em um snapshot.',
        rename: 'Renomear usuário',
        toggleDark: 'Alternar dark',
      },
    },
  },
  why: {
    kicker: 'API §15 · why()',
    title: 'Why',
    lead:
      'Uma pergunta — por que esta UI está assim? — respondida do mesmo jeito no console, no overlay, nos erros de ciclo e em jacare why arquivo:linha.',
    tip:
      'Ative o DevTools (toggle do Lab ou connectJacareDevtools). Depois use $why($0) em um elemento selecionado, clique em um valor de State/Mesh para abrir o card Why, ou rode jacare why src/pages/why.jcr:NN no terminal.',
    demo: {
      title: '$why no console',
      lead:
        'Selecione o badge abaixo em Elements do DevTools e rode $why($0). É a mesma cadeia do card Why do overlay.',
      idle: 'parado',
      once: 'uma vez',
    },
    console: {
      title: 'Console · overlay · erro',
    },
    cli: {
      title: 'jacare why (IR estático)',
      body: 'Sem navegador — pontos do Binding IR para um arquivo:linha (irmão de check --bindings).',
    },
    cycle: {
      title: 'ReactiveCycleError inclui why',
      body: 'Com o DevTools ativo, erros de ciclo anexam o mesmo texto de WhyChain.',
    },
  },
}
