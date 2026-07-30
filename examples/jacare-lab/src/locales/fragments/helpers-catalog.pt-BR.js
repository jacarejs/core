export default {
  helpersCatalog: {
    groups: {
      reactivity: "Reatividade",
      pulseBags: "Bags de pulse",
      dom: "DOM (emitido)",
      controlFlow: "Fluxo de controle (emitido)",
      slots: "Slots (emitidos)",
      navigation: "Navegação",
      forms: "Formulários",
      lifecycle: "Ciclo de vida",
      ssr: "SSR",
      islands: "Ilhas",
      ssrClient: "SSR / cliente",
      devtoolsCore: "DevTools (core)",
      devtoolsUi: "UI do DevTools",
      compiler: "API do compilador",
      vite: "Vite",
      meta: "Meta / rotas por arquivo",
      cli: "CLI",
      language: "Linguagem",
    },
    pulse: {
      usage: "Crie estado reativo. Chame para ler, use .set / .update para escrever.",
      about: "pulse é a célula reativa principal do Jacaré (nome preferido). Crie uma com um valor inicial, chame-a como função para ler e escreva com .set(value) ou .update(fn). Leituras dentro de effects, derives e bindings de template assinam automaticamente, então só a UI dependente é atualizada. Prefira pulse em vez de signal em código novo de Jacaré.",
    },
    signal: {
      usage: "Alias de pulse — mesma API.",
      about: "signal é o mesmo primitivo de runtime que pulse — um alias para familiaridade com outras bibliotecas fine-grained. Os métodos (.set, .update, .peek, .subscribe) e o uso em templates são idênticos. Prefira escrever pulse em apps Jacaré para manter docs e Lab consistentes.",
    },
    derive: {
      usage: "Valor computado que atualiza quando as dependências mudam.",
      about: "derive constrói um valor computado em cache a partir de outros pulses ou derives. A função roda de novo apenas quando uma dependência que ela realmente leu mudou. Leia como um pulse: doubled(). Chame dispose() quando criar derives dinamicamente (por exemplo, por item de lista) e depois desmontá-los — derives de longa duração em bags/forms/nav normalmente não precisam disso.",
    },
    computed: {
      usage: "Alias de derive.",
      about: "computed é um alias de derive com o mesmo rastreamento preguiçoso e em cache de dependências e o mesmo dispose(). Prefira derive em código novo de Jacaré; mantenha computed apenas ao seguir exemplos externos que usam esse nome.",
    },
    effect: {
      usage: "Execute efeitos colaterais quando pulses mudarem. Chame .dispose() para parar.",
      about: "effect executa um efeito colateral sempre que seus pulses rastreados mudam (logging, document.title, fetch, DOM imperativo). Ele pode retornar uma limpeza que roda antes da próxima execução e no dispose(). Chame dispose() quando você mesmo tiver criado o effect e o dono desmontar — bindings de template compilados descartam isso para você.",
    },
    watch: {
      usage: "Alias de effect.",
      about: "watch é um alias de effect. Prefira watch quando a intenção soar como \"observar este estado\"; prefira effect ao seguir exemplos mais antigos. Mesmo contrato de dispose e cleanup.",
    },
    batch: {
      usage: "Agrupe escritas para que os effects rodem uma vez após todas as atualizações.",
      about: "batch agrupa várias escritas em pulse para que effects dependentes e atualizações de DOM sejam descarregados uma vez quando o callback terminar. Use quando uma ação do usuário atualiza várias células (submit de formulário, contagem + total do carrinho) para evitar cintilação intermediária e trabalho extra.",
    },
    enablePatience: {
      usage: "Opt-in: coalesça escritas fora de batch em uma microtask.",
      about: "O agendamento padrão é síncrono — set() atualiza os effects no mesmo turno. enablePatience() liga Patience: escritas fora de batch entram na fila e descarregam uma vez em uma microtask (rede de segurança para sockets/timers em rajada). Com Patience ligado, o runtime usa lanes internas (input → default → idle): bindModel marca input; idle usa requestIdleCallback. Quem escreve apps não escolhe lanes — não há API startTransition. Prefira batch/ripple para grupos explícitos. flushSync() drena todas as lanes agora (testes e escape hatch). disablePatience() descarrega e restaura o modo síncrono.",
    },
    flushSync: {
      usage: "Drene atualizações reativas pendentes imediatamente.",
      about: "flushSync executa agora qualquer subscriber enfileirado (todas as lanes de Patience: input, default, idle). É necessário após enablePatience() quando testes ou UI precisam do DOM no mesmo turno. É inofensivo quando a fila está vazia. batch/ripple já descarregam de forma síncrona ao fim do callback.",
    },
    disablePatience: {
      usage: "Desligue Patience e restaure o agendamento síncrono.",
      about: "disablePatience drena qualquer atualização pendente com a semântica de flushSync e depois redefine o scheduler para o padrão síncrono. Use ao sair de uma demo ou desmontar um teste que chamou enablePatience().",
    },
    isPatienceEnabled: {
      usage: "Leia se a coalescência de Patience está ligada.",
      about: "isPatienceEnabled() retorna true após enablePatience() e false após disablePatience() (ou por padrão). Útil em demos e testes — não é necessário na maioria dos apps.",
    },
    runAsLane: {
      usage: "Runtime/tooling: marque a origem da escrita para as lanes de Patience.",
      about: "runAsLane(lane, fn) executa fn enquanto marca escritas como input, default ou idle. bindModel já usa input. Apps não devem escolher lanes — isto é para o runtime e para casos raros de tooling. Sem enablePatience(), o agendamento continua síncrono e a marcação da lane é ignorada no momento do flush.",
    },
    untrack: {
      usage: "Leia pulses sem assinar o effect atual.",
      about: "untrack executa uma função sem registrar leituras de pulse como dependências do effect ou derive atual. Use para espiar valores sem reexecutar quando eles mudarem, ou para evitar assinaturas acidentais. Para uma única célula, pulse.peek costuma ser mais claro.",
    },
    ReactiveCycleError: {
      usage: "Erro lançado quando as atualizações nunca estabilizam.",
      about: "As atualizações são entregues de forma síncrona por padrão, então dois effects que escrevem um no outro recursariam para sempre. Jacaré interrompe a cascata após 200 níveis aninhados e lança ReactiveCycleError em vez de um stack overflow. error.depth traz o limite que foi atingido. Quebre o loop com pulse.peek, pulse.update(fn) ou untrack.",
    },
    createBag: {
      usage: "Registre uma bag compartilhada de pulses (Mesh).",
      about: "createBag registra uma store compartilhada nomeada na Pulse Mesh. A factory permanece preguiçosa até que uma propriedade seja lida pela primeira vez. Exporte a bag de um módulo e reutilize-a entre telas. Ids duplicados lançam erro. Cada campo publicado passa a ser endereçável como @id/key em templates.",
    },
    getBag: {
      usage: "Procure uma bag por id de qualquer lugar.",
      about: "getBag procura uma bag por id de string de qualquer lugar (outro módulo ou uma tela que não importou a bag). Retorna undefined se não existir. Ler uma propriedade no handle ainda dispara a publicação preguiçosa da factory.",
    },
    listBags: {
      usage: "Liste ids de bags registradas.",
      about: "listBags retorna os ids de todas as bags registradas na página até o momento (incluindo bags preguiçosas ainda não publicadas). Útil para DevTools, debugging e testes — raramente é necessário na UI do app.",
    },
    ripple: {
      usage: "Agrupe escritas de bag em uma onda única de notificação da Mesh.",
      about: "ripple(fn) executa uma função dentro de um batch e registra quais células da mesh mudaram para que o DevTools Mesh possa mostrar uma única onda de notificação. A assinatura é ripple(fn) — não ripple(port, fn). Agrupe juntas as escritas de bag em múltiplos campos.",
    },
    bagSnap: {
      usage: "Persista, restaure ou redefina ports de bag.",
      about: "Métodos no handle da bag vindo de createBag. snap() copia valores graváveis de pulse para um objeto simples (por exemplo, localStorage). hydrate(data) escreve esses valores de volta em uma única onda. reset() restaura os padrões da factory enquanto mantém as mesmas identidades de célula para que os bindings continuem vivos.",
    },
    bagKey: {
      usage: "Leia um port de bag diretamente na view.",
      about: "Sintaxe de endereço Mesh dentro de templates .jcr. ${@cart/count} lê o port publicado sem importar a bag para o script (o compilador emite getBag). Ideal para chrome compartilhado, como um badge de carrinho no header. Prefira o normal cart.count() no módulo que é dono da bag.",
    },
    bindText: {
      usage: "Você escreve ${count}; o compilador emite bindText.",
      about: "Helper emitido pelo compilador que mantém os dados de um nó de texto em sincronia com um pulse ou expressão. Você quase nunca o importa — escreva ${count} ou ${label()} na view. Só aquele nó de texto é atualizado quando a origem muda.",
    },
    bindAttribute: {
      usage: "Atributos HTML dinâmicos.",
      about: "Emitido para :attr=${expr}. Atualiza ou remove o atributo quando a expressão muda. Use para href, title, aria-* e atributos booleanos que devem aparecer ou desaparecer com o estado.",
    },
    bindClass: {
      usage: "Ative/desative uma classe CSS a partir de um booleano.",
      about: "Emitido para class-name=${bool} (por exemplo class-open=${open}). Alterna uma única classe CSS via classList. Prefira isso em vez de reconstruir strings completas de className a cada atualização.",
    },
    bindStyleVar: {
      usage: "Defina uma propriedade customizada de CSS.",
      about: "Emitido para style---name=${expr}, que mapeia para propriedades customizadas de CSS (style---pct → --pct). Isso deixa o CSS dirigir o layout a partir de números reativos sem grandes objetos de estilo inline.",
    },
    bindModel: {
      usage: "Binding bidirecional de input.",
      about: "Emitido para bind-value e bind-checked. Mantém o value ou checked de um input alinhado com um pulse e escreve de volta em input/change. Prefira pulses ou campos de createForm como fonte da verdade.",
    },
    branch: {
      usage: "Blocos condicionais em templates.",
      about: "Helpers de runtime por trás de #if / #elif / #else / #case. Eles montam um branch por vez e descartam os bindings do branch anterior quando a condição muda. Você escreve as diretivas; o compilador emite branch ou showIf.",
    },
    reconcileKeyedList: {
      usage: "Reconciliação de lista com key.",
      about: "Runtime por trás de #for list as item (key). Faz diff por key: reutiliza montagens de item existentes, cria novas keys, descarta keys removidas e reordena nós de DOM. Sempre passe uma key estável (item.id), não o índice, se a lista puder reordenar.",
    },
    mountSlot: {
      usage: "Slots padrão e nomeados.",
      about: "Runtime por trás de <slot> e slots nomeados. O conteúdo do pai é projetado nas saídas de slot do componente filho. Você escreve o markup de slot; o compilador emite mountSlot.",
    },
    createNav: {
      usage: "Crie o roteador do app.",
      about: "Cria o roteador SPA: layout shell, tabela de telas, página ausente, guard opcional beforeGo e base path. Retorna nav com where (lugar atual como um pulse), attach, go, swap, undo e warm. Um nav por app é o mais comum.",
    },
    lazy: {
      usage: "Carregue um módulo de tela sob demanda.",
      about: "Marca um import dinâmico como carregador lazy de tela para createNav. O módulo .jcr carrega na primeira visita (ou após warm). Isso mantém o bundle inicial pequeno para apps com várias páginas.",
    },
    screen: {
      usage: "Empacote uma tela importada de forma eager.",
      about: "Empacota um módulo de tela já importado para uso eager em createNav (por exemplo, a página inicial). É o oposto de lazy — entra no chunk pai em vez de ser carregado sob demanda.",
    },
    navMethods: {
      usage: "Monte, navegue, faça preload.",
      about: "Métodos de instância após createNav. attach(el) monta o layout e o frame e escuta o histórico. go(path) adiciona uma nova entrada ao histórico; swap substitui; undo volta; warm(path) faz preload de uma tela lazy sem navegar.",
    },
    createRoute: {
      usage: "Helpers em torno de nav.where.",
      about: "Constrói um pequeno objeto helper em torno de nav.where para que routeParam e routeSearch permaneçam ergonômicos. Exporte uma route ao lado de nav em apps maiores.",
    },
    getRouteParam: {
      usage: "Getter reativo para um parâmetro de path do nav ativo.",
      about: "Usado pelo açúcar de template ${@route/id}. Retorna um getter que rastreia nav.where. Prefira createRoute(nav.where) em JS para helpers tipados e chaves de busca.",
    },
    routeParam: {
      usage: "Leia um parâmetro de path como getter reativo.",
      about: "Retorna um getter para um parâmetro de path (por exemplo :id). Chame id() em script ou templates; ele rastreia a navegação para que a UI atualize quando o parâmetro mudar.",
    },
    routeSearch: {
      usage: "Leia um valor da query string.",
      about: "A mesma ideia de routeParam para valores ?query=. O getter é reativo a mudanças de search no lugar atual.",
    },
    routeHref: {
      usage: "Construa um href a partir de path + params/search.",
      about: "Helper puro que constrói uma string de path a partir de um pattern e params ou search. Substitui cada token :name / :name* (sem colisões de substring, como :id dentro de :idea). Útil para alvos de jacare-go e testes. Ele não navega por conta própria.",
    },
    navTitle: {
      usage: "Atualize document.title em runtime.",
      about: "setNavTitle atualiza document.title (e toda a infraestrutura de título do nav). getNavTitle lê a string de título atual. Costuma ser usado dentro de um effect ou de uma função de título de tela quando o título depende de pulses.",
    },
    jacareAttrs: {
      usage: "Outlet + links de SPA + correspondência ativa.",
      about: "Atributos de template (não imports JS). jacare-frame é o outlet onde as telas montam. jacare-go intercepta cliques para navegação SPA (mantenha href para progressive enhancement). jacare-here marca a correspondência do link ativo para estilização. jacare-when={cond} é um #if de uma linha. data-jacare-focus é o alvo de foco padrão para nav.go(path, { focus: true }).",
    },
    createForm: {
      usage: "Campos reativos de formulário, validação e submit.",
      about: "Constrói um formulário reativo a partir de um schema de campos (valor inicial + validate opcional). Cada campo se comporta como um pulse com .error(), .touched(), .dirty() e .blur(). handleSubmit(fn) valida e então chama fn(values). Combine os campos com bind-value na view.",
    },
    createLifecycle: {
      usage: "Hooks de montagem / ativação / desativação da tela.",
      about: "Exporte lifecycle de um módulo de tela para que nav possa chamar onMount, onActivate, onDeactivate e onUnmount. Use activate/deactivate para trabalho que deve rodar quando a tela é mostrada ou ocultada sem um unmount completo. Retorne limpezas dos hooks quando necessário.",
    },
    registerScope: {
      usage: "Exponha um valor no painel Scope do DevTools.",
      about: "Registra um getter rotulado no painel Scope do DevTools (por exemplo, estado de rascunho durante debugging). Normalmente é retornado de onActivate para que seja desregistrado em deactivate. Não é necessário para UI de produção.",
    },
    renderToString: {
      usage: "Faça SSR de um render() de página para uma única string HTML.",
      about: "Chama render(props) da sua página e retorna a string HTML. Use no servidor ou em scripts de build. Combine com o export render do módulo .jcr — isso não substitui o mount no cliente.",
    },
    renderToStream: {
      usage: "Transmita chunks de SSR (iterável assíncrono).",
      about: "Itera de forma assíncrona por chunks de HTML derivados de um render completo (divisão por elemento de topo). Útil para começar a escrever bytes da resposta mais cedo. Não é um stream incremental completo de componentes como React Server Components.",
    },
    resumeBindings: {
      usage: "Baixo nível: reanexe nós data-jacare-bind.",
      about: "Hidratação de baixo nível: encontra nós [data-jacare-bind] e anexa bindings de texto a partir do estado SSR. Prefira o resume() compilado do módulo .jcr em apps; este helper é para pipelines SSR customizados.",
    },
    mountIsland: {
      usage: "Embuta um widget .jcr compilado em um elemento host (static/React/Vue/Angular).",
      about: "Entrada enxuta de ilha: resolve um host (selector ou Element), opcionalmente anexa um shadow root, chama o mount do widget, marca o host com data-jacare-island e retorna dispose. Props simples viram pulses vivos por padrão — chame dispose.update(next) sem remontar. Não puxa nav/forms/DevTools. Prefira shadow: true quando o host tiver CSS global agressivo.",
    },
    escapeHtml: {
      usage: "Escape texto antes de injetá-lo no HTML de SSR.",
      about: "Escapa &, <, > e \\\" para interpolação segura de texto HTML e atributos. O compilador insere escapeHtml no codegen de SSR; chame você mesmo apenas se estiver montando strings HTML manualmente.",
    },
    mount: {
      usage: "Cliente: crie DOM + bind. Retorna dispose.",
      about: "Entrada padrão de cliente exportada por todo arquivo .jcr compilado. mount(element, props?) cria DOM, conecta bindings e retorna dispose(). É usado por scripts de boot e por nav ao anexar telas.",
    },
    render: {
      usage: "SSR: retorne { html, state }.",
      about: "Export SSR de um módulo .jcr. render(props?) retorna { html, state }. Envie html na resposta e passe state para resume no cliente.",
    },
    resume: {
      usage: "Hidrate HTML SSR existente.",
      about: "Export de hidratação do cliente. resume(element, state, props?) se conecta ao markup SSR existente em vez de recriá-lo. Use após render ou renderToString no servidor.",
    },
    enableDevtools: {
      usage: "Ligue a coleta do grafo de pulses.",
      about: "Liga o registro em core do grafo de pulses (arestas de dependência e nomes). Apps normalmente chamam connectJacareDevtools no lugar, que habilita isso para você. Mantenha atrás de flags DEV.",
    },
    why: {
      usage: "Cadeia causal: elemento → binding → pulse → última escrita.",
      about: "why(target) constrói uma WhyChain a partir do registro do DevTools e do ledger de escritas. Alvos: Element/Node, pulse, id de pulse ou nome de mesh (@bag/key). whyLast() usa a última escrita registrada. formatWhyChain imprime a árvore usada por $why, pelo cartão Why do overlay e por ReactiveCycleError. Exige enableDevtools / connectJacareDevtools para que as escritas sejam registradas no ledger.",
    },
    namePulse: {
      usage: "Rotule um pulse no grafo.",
      about: "Anexa um rótulo legível por humanos (e opcionalmente arquivo/linha) a um pulse para a UI do grafo. O compilador costuma emitir isso automaticamente em DEV para pulses const em módulos .jcr.",
    },
    getPulseGraph: {
      usage: "Snapshot do grafo de pulses.",
      about: "Retorna um snapshot de pulses, effects e arestas para tooling customizado ou testes. A UI do overlay usa subscribePulseGraph; você raramente precisa disso em código de aplicação.",
    },
    connectJacareDevtools: {
      usage: "Monte a UI do overlay. Retorna dispose.",
      about: "Monta o overlay do Jacaré DevTools (Pulse Graph, com abas opcionais Scope e Mesh). Retorna uma função de parada. Use apenas em desenvolvimento ou atrás de um toggle explícito do Lab — não como padrão de produção.",
    },
    compile: {
      usage: "Compile código-fonte .jcr para JS (tooling / testes).",
      about: "Compilador programático: string de código-fonte .jcr → código de módulo JavaScript (e source map opcional). É usado pelo plugin do Vite, CLI, playground do Lab e testes. Apps de produção não chamam compile no navegador.",
    },
    parseModule: {
      usage: "Faça parse de AST para ferramentas.",
      about: "Parsers de nível mais baixo que retornam ASTs para tooling (linters, inspetores de IR, recursos de IDE). Prefira compile() a menos que você esteja construindo ferramentas de desenvolvedor em cima de Jacaré.",
    },
    inspectTemplateBindings: {
      usage: "Sites de Binding IR (o mesmo que jacare check --bindings).",
      about: "Retorna sites de Binding IR para um template — os mesmos dados que jacare check --bindings imprime. Use para ensinar, testar ou visualizar como cada ${} / bind vira um helper de runtime.",
    },
    lowerMountAst: {
      usage: "Reduza AST de template para uma floresta MountPlan.",
      about: "Reduz uma AST de template parseada para uma floresta MountPlan (instruções estruturadas de montagem). Ferramenta avançada de compilador e IR — veja a lição de Binding IR.",
    },
    jacare: {
      usage: "Plugin do Vite para transformação de .jcr + HMR.",
      about: "Plugin padrão do Vite. Transforma .jcr em tempo real, habilita HMR, liga otimizações CPW em produção e remove debug binds. Adicione plugins: [jacare()] na configuração do Vite.",
    },
    createJacareViteConfig: {
      usage: "Helper opinativo de configuração do Vite.",
      about: "Helper que retorna uma configuração pronta do Vite com o plugin do Jacaré e defaults sensatos (title e opções relacionadas). Útil para scaffolds; personalize quando superar esse ponto.",
    },
    jacareMeta: {
      usage: "Plugin do Vite para rotas baseadas em arquivo.",
      about: "Plugin opcional do Vite para roteamento baseado em arquivos (um diretório pages vira uma tabela de rotas). Importe de @jacare/meta/vite — a entrada principal @jacare/meta continua segura para o navegador.",
    },
    discoverRoutes: {
      usage: "Mapeie arquivos pages/** para paths de rota.",
      about: "Faz scan de um diretório pages e mapeia caminhos de arquivo para padrões de URL (incluindo segmentos dinâmicos). É usado por tooling meta em tempo de build — importe de @jacare/meta/vite.",
    },
    createJacareApp: {
      usage: "Inicialize nav a partir de um mapa explícito de telas.",
      about: "Encapsula createNav quando você já tem as telas. Não faz scan de pagesDir em runtime — para rotas por arquivo use jacareMeta() + createJacareAppFromRoutes({ routeLoaders }) de virtual:jacare-routes.",
    },
    jacareCli: {
      usage: "Faça scaffold, desenvolva, gere build e inspecione.",
      about: "Ferramentas de linha de comando (não um import JavaScript). new cria o scaffold de um app; dev roda Vite; build escreve a saída de produção; check compila arquivos .jcr do projeto; check --bindings imprime Binding IR. Você também pode rodar npm create jacare@latest.",
    },
    exportView: {
      usage: "O template da página ou componente.",
      about: "Bloco de template obrigatório em um módulo .jcr — a árvore de UI com bindings, diretivas e componentes. O compilador o transforma em mount, render e resume. O script acima da view continua sendo JavaScript puro.",
    },
    exportStyle: {
      usage: "CSS com escopo para este módulo.",
      about: "CSS opcional com escopo para este módulo. Os seletores são reescritos para que os estilos não vazem globalmente. Os estilos podem ser estáticos ou reativos, dependendo do conteúdo.",
    },
    exportContract: {
      usage: "Declare props / events para tooling.",
      about: "Declaração opcional de props, emits, slots e superfícies relacionadas para tooling e validação. Ajuda a detectar uso indevido de componentes em tempo de compile ou check.",
    },
    events: {
      usage: "Eventos de DOM com limpeza automática.",
      about: "Atributos de evento em template. Prefira on-click=${handler}; @click é um alias. Os listeners são registrados no mount e removidos no dispose — sem removeEventListener manual em código de app.",
    },
    debugTag: {
      usage: "Painel de debug inline para valores selecionados.",
      about: "Tag de template apenas para DEV que mostra um pequeno painel com valores selecionados. É removida ou vira no-op em builds de produção. Útil ao ensinar reatividade em uma página.",
    },
  },
};
