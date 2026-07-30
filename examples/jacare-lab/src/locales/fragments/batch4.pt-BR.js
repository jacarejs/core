export default {
  formsPage: {
    kicker: 'API §12',
    title: 'Formulários',
    lead:
      'createForm cria campos apoiados em sinais, com validação, controle de alterações e um handler de submit pronto para usar.',
    tip:
      'Field usa bind-value (prop de modelo) mais :error=${field.error()} para que o filho receba a mensagem como string. Checkboxes nativos ainda precisam de bind-checked em um pulse de topo — por isso newsletter fica ao lado do schema do formulário.',
    field: {
      name: 'Nome',
      email: 'E-mail',
      password: 'Senha',
      confirm: 'Confirmar senha',
      username: 'Usuário',
    },
    confirmPlaceholder: 'Repita a senha',
    newsletter: 'Assinar a newsletter',
    submit: 'Enviar',
    reset: 'Limpar',
    yes: 'sim',
    no: 'não',
    error: {
      nameShort: 'O nome é muito curto',
      email: 'Informe um e-mail válido',
      mismatch: 'As senhas não coincidem',
      usernameShort: 'Pelo menos 3 caracteres',
      usernameSpaces: 'Espaços não são permitidos',
    },
    state: 'válido: {valid} · alterado: {dirty}',
    submitted: 'Enviado:',
    empty: 'Nada enviado ainda.',
    badge: {
      nameTouched: 'nome tocado: {value}',
      nameDirty: 'nome alterado: {value}',
      emailTouched: 'e-mail tocado: {value}',
    },
    stateHint:
      'Dê foco e saia dos campos na demo de schema acima — estes valores mudam em tempo real.',
    demo: {
      schema: {
        title: 'Schema + validação',
        lead: 'Cada campo controla o próprio valor, erro, estado de toque e de alteração.',
      },
      submit: {
        title: 'Handler de submit + estado do formulário',
        lead:
          'handleSubmit marca todos os campos como tocados, valida e só chama seu callback quando o formulário está válido.',
      },
      fieldState: {
        title: 'Estado do campo: tocado + alterado',
        lead:
          'Cada campo expõe os próprios sinais de tocado e alterado, independentes de form.valid e form.dirty.',
      },
      confirm: {
        title: 'Validador customizado lendo outro campo',
        lead:
          'A função validate captura o pulse da senha e roda de novo sempre que qualquer um dos valores muda.',
      },
      multi: {
        title: 'Vários validadores em um campo',
        lead: 'validate aceita um array — vence o primeiro validador que retornar uma mensagem.',
      },
    },
  },
  lifecyclePage: {
    kicker: 'API §13',
    title: 'Ciclo de vida e Scope',
    lead:
      'O nav envolve cada tela lazy com screen() — os hooks disparam em uma ordem fixa quando você entra e sai de uma rota.',
    tip:
      'Títulos estáticos vão no createNav como { use, title }. Títulos dinâmicos usam setNavTitle dentro de um effect iniciado no onActivate. Use onMount para timers — sempre retorne uma limpeza dele.',
    cycle: {
      badge: 'ciclo ao vivo',
      title: 'Fluxo do ciclo de vida da tela',
      lead:
        'Entrada: onActivate → onMount → monta a view. Saída: onDeactivate → onUnmount → executa todas as limpezas.',
      codeTitle: 'ordem do ciclo de vida do screen()',
      diagramAria: 'Diagrama do ciclo de vida da tela',
    },
    phase: {
      mounted: 'montado',
      active: 'ativo',
      deactivated: 'desativado',
      unmounted: 'desmontado',
    },
    orbit: {
      timerSuffix: 's na tela',
      note: 'Esta página está executando os hooks abaixo.',
      activate: {
        step: '1 · entrada',
        desc: 'Analytics, registerScope',
      },
      mount: {
        step: '2 · entrada',
        desc: 'Timers, assinaturas — retorne a limpeza',
      },
      deactivate: {
        step: '3 · saída',
        desc: 'Tela oculta, ainda pode estar em cache',
      },
      unmount: {
        step: '4 · saída',
        desc: 'Desmontagem final depois do dispose',
      },
    },
    legend: {
      enter: 'Caminho de entrada',
      leave: 'Caminho de saída',
    },
    actions:
      'Saia desta lição e volte — onActivate incrementa novamente; onDeactivate / onUnmount disparam quando o nav descarta a tela.',
    phaseLabel: 'fase',
    demo: {
      title: {
        title: 'Título da tela + setNavTitle',
        lead:
          'Títulos estáticos ficam no createNav. Para um título dinâmico (contagem, totais), chame setNavTitle em um effect iniciado no onActivate.',
        note: 'Veja a suíte Todo /focus para um exemplo ao vivo de setNavTitle + timer.',
      },
      hooks: {
        title: 'Export completo de lifecycle',
        lead:
          'Esta página exporta lifecycle com os quatro hooks — os contadores da órbita acima estão ligados a eles.',
      },
      scope: {
        title: 'registerScope para o DevTools',
        lead:
          'Valores registrados aparecem ao vivo no painel Scope (canto inferior esquerdo por padrão) enquanto o @jacare/devtools está conectado.',
        note:
          'Abra o painel Scope e procure "Lifecycle ticks" — ele espelha o timer no centro da órbita. Use ⚙ no Pulse Graph para mover painéis ou limpar o Scope.',
      },
      activation: {
        title: 'onActivate em cada visita',
        lead:
          'Navegue para outra lição e volte — activations incrementa de novo, enquanto o timer do onMount continua contando se a tela ficou em cache.',
      },
      dispose: {
        title: 'Dispose de effect (mesma ideia da limpeza do onMount)',
        lead:
          'A limpeza de um effect comum roda antes de cada reexecução e no dispose final — o mesmo mecanismo por trás do onUnmount.',
        unmountBlock: 'Desmontar bloco',
        mountBlock: 'Montar bloco',
        mounts: 'montagens',
        disposals: 'descartes',
        mounted: 'Este bloco está montado agora.',
      },
    },
  },
  cookbookPage: {
    kicker: 'API §13b',
    title: 'Livro de receitas',
    lead:
      'Uma tela combinando condicionais, laços, eventos, atualizações imutáveis e dois componentes compartilhados.',
    tip:
      'Esta é a mesma forma de qualquer tela real: pulses para estado, funções simples para ações e um template que lê tudo de volta.',
    task: {
      readDocs: 'Ler a documentação da API',
      buildLesson: 'Criar uma página de lição',
    },
    remainingOne: '{count} restante',
    remainingMany: '{count} restantes',
    total: 'no total',
    draftPlaceholder: 'O que precisa ser feito?',
    add: 'Adicionar',
    delete: 'Excluir',
    emptyTasks: 'Nenhuma tarefa ainda — adicione uma acima.',
    searchPlaceholder: 'Buscar por nome ou cargo',
    matchOne: '{count} resultado',
    matchMany: '{count} resultados',
    emptySearch: 'Ninguém corresponde a essa busca.',
    role: {
      engineer: 'Engenharia',
      mathematician: 'Matemática',
    },
    demo: {
      tasks: {
        title: 'Lista de tarefas',
        lead:
          'Adicione, marque e remova tarefas com atualizações imutáveis para a lista reconciliar de forma eficiente.',
      },
      search: {
        title: 'Busca + filtro',
        lead:
          'Um único derive() alimenta a contagem do badge, o estado vazio e a lista filtrada ao mesmo tempo.',
      },
    },
  },
  playgroundPage: {
    kicker: 'Lab ao vivo',
    title: 'Playground',
    lead:
      'Digite código Jacaré à esquerda — ele compila e monta à direita conforme você escreve.',
    tip:
      'Sandbox: o preview executa seu código com new Function nesta aba do navegador — cole apenas código em que você confia. Use um módulo completo: imports, pulses, funções e depois um bloco export view. Os presets abaixo são pontos de partida completos. Para um editor em tela cheia e compartilhável, abra o Jacaré Studio.',
    link: {
      studio: 'Abrir o Jacaré Studio',
      apiDocs: 'Documentação da API',
      languageReference: 'Referência da linguagem',
    },
    status: {
      ready: 'Pronto',
      compiling: 'Compilando…',
      live: 'Ao vivo',
      error: 'Erro',
    },
    hostMissing: 'Host do preview não encontrado',
    sourceTitle: 'Código',
    previewTitle: 'Preview',
    previewNote: 'montagem ao vivo',
    editorAria: 'Editor de código Jacaré',
    example: {
      counter: 'Contador',
      derive: 'Derive',
      list: 'Lista',
      if: '#if',
      case: '#case',
      events: 'Eventos',
      bindings: 'Bindings',
      'form-field': 'Campo de formulário',
    },
  },
  ssrPage: {
    kicker: 'API §14',
    title: 'SSR e hidratação',
    lead:
      'Todo arquivo .jcr compila para três exports — mount, render e resume — então o mesmo código roda no servidor e no cliente.',
    tip:
      'Este lab é servido apenas no cliente, então os cards de SSR abaixo são demos de referência com um modelo mental ao vivo — o View code sempre mostra o módulo completo, incluindo o bloco view. Por baixo, render() percorre o mesmo MountPlan que mount(), então class / attr / text dinâmicos ficam em sincronia com o Binding IR.',
    hydration: {
      done: 'Hidratado — listeners conectados',
      pending: 'Apenas HTML do servidor — nenhum listener ainda',
    },
    demo: {
      render: {
        title: 'render(props): HTML do servidor + state',
        lead:
          'render() nunca toca o DOM — ele retorna HTML escapado mais um pequeno objeto de state descrevendo cada binding dinâmico.',
        bump: 'Incrementar (espelho só no cliente)',
        note:
          'No servidor este botão ainda não existe — render() só produz o HTML inicial com o valor de partida deste contador.',
      },
      mental: {
        title: 'O modelo mental do resume()',
        lead:
          'Antes do resume(), o botão parece real mas não tem listener. Simule o resume() para conectá-lo — nenhum DOM é recriado.',
        click: 'Clique aqui (precisa do resume())',
        simulate: 'Simular resume()',
        clicks: 'Cliques após a hidratação:',
      },
      resume: {
        title: 'resume(target, state, props)',
        lead:
          'resume() percorre state.bindings e reconecta as assinaturas de sinais aos nós já renderizados pelo servidor.',
        note:
          'A hidratação mantém o HTML do servidor no lugar — só listeners e bindings são conectados no cliente.',
      },
      string: {
        title: 'renderToString: uma única string HTML',
        lead:
          'Um invólucro fino sobre render() para handlers que só precisam de uma string para enviar.',
        note:
          'Útil para servidores clássicos de request/response que montam a página inteira antes de escrever.',
      },
      stream: {
        title: 'renderToStream: HTML em chunks',
        lead:
          'Divide a marcação renderizada em chunks de topo para o servidor começar a enviar mais cedo.',
        note: 'O mesmo código .jcr — só a estratégia de entrega muda no servidor.',
      },
    },
  },
  islandPage: {
    kicker: 'API §14b',
    title: 'Kit de montagem de ilhas',
    lead:
      'Embuta um widget .jcr compilado em qualquer página host — HTML estático, React, Vue, Angular — sem transformar o Jacaré no shell da aplicação. Importe mountIsland do subpath enxuto @jacare/core/island.',
    tip:
      'Esta lição monta ilhas reais nos cards abaixo. Apps host completos ficam em examples/jacare-island, jacare-island-react, jacare-island-vue e jacare-island-angular. Prefira shadow: true quando o host tiver CSS global agressivo.',
    yes: 'sim',
    no: 'não',
    remount: 'Remontar',
    dispose: 'Descartar',
    liveDemo: 'Demo ao vivo:',
    local: 'local',
    labClicks: 'Cliques do Lab',
    fromLabState: 'Do estado do Lab',
    tipWidget: {
      show: 'Mostrar dica',
      hide: 'Ocultar dica',
      body: 'Ilha com shadow — o CSS da página host não restiliza esta caixa.',
      topic: 'Tópico:',
    },
    demo: {
      basic: {
        title: 'mountIsland — embed ao vivo',
        lead:
          'Resolva o elemento host, chame o mount compilado, marque o host e retorne o dispose. Os mesmos bindings granulares de uma SPA — só sem o shell do createNav.',
        loading: 'Carregando ilha…',
        live: 'Ao vivo:',
        hostMark: 'Marca no host',
        markSet: 'definida',
        markCleared: 'removida',
      },
      widget: {
        title: 'O widget é um .jcr normal',
        lead:
          'Contracts, pulses, style com escopo — nada de especial. O kit de ilhas só muda como o host monta o componente.',
        note:
          'O export default de um .jcr compilado é mount. mountIsland aceita o módulo, module.mount ou uma função mount pura.',
      },
      props: {
        title: 'Props vindas do host',
        lead:
          'Ainda não existe ponte reativa de props — quando o estado do host muda, descarte e remonte com as novas props. Os wrappers de React, Vue e Angular usam o mesmo padrão de remontagem.',
        label: 'Label:',
        mounted: 'montado:',
      },
      shadow: {
        title: 'shadow: true — isolamento de CSS',
        lead:
          'Anexa um shadow root aberto, monta em um wrapper Element interno e injeta os estilos da ilha nesse shadow. As regras do host ficam de fora.',
        clash:
          'Este parágrafo do host usa uma classe bem chamativa (serifada + sublinhada). A dica em shadow abaixo ignora isso.',
        loading: 'Carregando dica…',
        remount: 'Remontar shadow',
        live: 'Dica em shadow ao vivo:',
      },
      options: {
        title: 'Opções: props · shadow · clear · mark',
        lead:
          'Todas as opções são opcionais. Por padrão o host é limpo — o Carregando… desaparece — e data-jacare-island é definido no elemento host.',
        props: '— objeto repassado ao mount compilado',
        clear1: '— padrão',
        clear2: '; limpa os filhos do host antes de montar',
        mark1: '— nome do atributo, ou',
        mark2: 'para desativar',
      },
      dispose: {
        title: 'Contrato de dispose',
        lead:
          'Mesmo modelo de limpeza do mount de SPA: effects, listeners, estilos com escopo. Sempre descarte no unmount do host / HMR.',
        note:
          'Use o botão Descartar no primeiro card para ver a marca sair e o slot ficar vazio.',
      },
      how: {
        title: 'Como o mountIsland funciona',
        lead:
          'Sete passos — resolver host, resolver mount, resolver target — wrapper de shadow — depois limpar, montar, marcar e retornar o dispose.',
        note:
          'Montagens em shadow precisam de um wrapper Element porque bindStyleSheet / estilos com escopo chamam setAttribute no target da montagem.',
      },
      subpath: {
        title: 'Por que um subpath para ilhas',
        lead:
          'O @jacare/core principal também exporta nav, forms, SSR e hooks de DevTools. Ilhas ficam em um subpath enxuto para os bundles do host continuarem pequenos.',
        note:
          'O widget continua importando pulse / derive do core — o Vite remove os símbolos não usados.',
      },
      static: {
        title: 'Host em HTML estático',
        lead:
          'WordPress, Rails ou qualquer página estática: uma div + um script de módulo já bastam.',
      },
      vite: {
        title: 'Configuração do Vite no host',
        lead:
          'Adicione o plugin jacare ao lado de React, Vue ou Angular JIT para os imports .jcr compilarem.',
        note:
          "Sem o plugin, import X from './X.jcr' falha. Pré-empacotar o widget como JS é a outra opção.",
      },
      react: {
        title: 'Wrapper host em React',
        lead:
          'ref + useEffect: monta na montagem, descarta na limpeza e remonta quando as props mudam.',
      },
      vue: {
        title: 'Wrapper host em Vue 3',
        lead: 'onMounted + watch + onBeforeUnmount — a mesma disciplina de dispose.',
      },
      angular: {
        title: 'Wrapper host em Angular',
        lead:
          'AfterViewInit + OnChanges + OnDestroy com decorators Input clássicos — signal inputs não passam pelo ngOnChanges.',
        escape: 'Escape o @ em templates Angular como &#64;.',
      },
    },
    aside: {
      title: 'Veja também',
      ssr: 'SSR §14',
      module: 'Exports de módulo',
      guide: 'Guia completo:',
      api: '· API:',
    },
  },
  toolingPage: {
    kicker: 'API §16 - §19',
    title: 'Ferramentas',
    lead:
      'A CLI, o plugin do Vite, o Binding IR, o compilador, o DevTools — e a extensão do VS Code para arquivos .jcr.',
    tip:
      'DevTools: alternador na barra superior (DevTools on/off). Abas do overlay: State | Mesh | Scope (↗ abre em janela). Prefira a aba Jacaré da extensão do Chrome para um debug mais simples. Experimente /bag para Mesh, Lifecycle para Scope e /binding-ir para a floresta do compilador.',
    demo: {
      named: {
        title: 'Pulses nomeados + destaque no DOM',
        lead:
          'O compilador injeta { name, file, line } em DEV. Passe o mouse em um nó de State para destacar este contador.',
      },
      cli: {
        title: 'Comandos da CLI',
        lead:
          'jacare new / dev / build / compile / check encapsulam o Vite e o compilador. Passe --bindings para os pontos de IR e --routes para comparar jacare-go estático com as telas do createNav.',
      },
    },
    vscode: {
      alt: 'Jacaré disponível no Marketplace do VS Code',
      title: 'Jacaré para VS Code',
      body:
        'Realce de sintaxe (JS + opcional // @jacare-ts / *.jcr.ts), snippets (screen/nav/a11y), aliases class:/style: e comando de lição do Lab — instale pelo Marketplace.',
    },
    uiKit: {
      title: 'Jacaré UI (oficial)',
      body:
        'Componentes acessíveis e com tema para apps Jacaré — Button, Field, Card, Dialog, forms, pickers e mais — com signals e sem virtual DOM. npm: @jacare/ui.',
      link: 'Docs oficiais → jacarejs.github.io/ui',
    },
    typescript: {
      title: 'TypeScript (opcional)',
      body1: 'Arquivo irmão',
      body2: 'ou import a partir de',
      body3: '— cards de referência (sem montagem ao vivo):',
    },
    card: {
      checkBindings: {
        title: 'jacare check --bindings',
        body:
          'Imprime todos os pontos de binding gerados a partir do Binding IR — a mesma classificação usada na emissão para cliente e SSR.',
      },
      checkRoutes: {
        title: 'jacare check --routes',
        body:
          'Opcional: compara alvos estáticos jacare-go="/…" com os padrões de tela do createNav. Links dinâmicos são ignorados.',
      },
      expression: {
        title: 'Estilo de expressão',
        body:
          'Prefira chamadas diretas quando não houver variável de laço. O jacare check avisa sobre arrows sem argumentos redundantes.',
      },
      bindingIr: {
        title: 'Binding IR (compilador)',
        body1:
          'Templates são reduzidos uma única vez para MountPlan; mount() e render() percorrem a mesma floresta.',
        body2: 'Lição completa:',
      },
      vite: {
        title: 'Opções do plugin do Vite',
        body:
          'emit e cpw usam "auto" por padrão — builds de produção para o cliente ganham CPW automaticamente.',
      },
      compiler: {
        title: 'API do compilador',
        body: 'Use o @jacare/compiler direto para inspecionar o código gerado fora do Vite.',
      },
      devtools: {
        title: 'DevTools',
        body:
          'State mostra pulses nomeados + destaque no DOM; Scope mostra as entradas de registerScope().',
      },
      testing: {
        title: 'Testes',
        body: 'Compile + monte no Vitest com happy-dom para cobertura de integração completa.',
      },
      scripts: {
        title: 'Scripts do package.json',
        body: 'Um projeto típico liga dev / build / check / test direto na CLI.',
      },
    },
  },
  helpersPage: {
    kicker: 'API §20',
    title: 'Catálogo de imports',
    lead1:
      'Cada símbolo importável com um resumo curto, uma explicação detalhada, a linha de import e um exemplo mínimo. As tabelas completas também estão em',
    lead2: '§20.',
    tip:
      'Prefira pulse / derive / watch em código novo. Helpers de DOM (bindText, branch, …) normalmente são gerados pela sintaxe .jcr — você escreve ${count}, não a chamada do helper. Filtre por pacote ou busque nas explicações.',
    filterPlaceholder: 'Filtrar por nome, pacote, explicação…',
    filterAll: 'todos',
    countOf: 'de',
    countSymbols: 'símbolos',
    importLabel: 'Import',
    exampleLabel: 'Exemplo',
    openLesson: 'Abrir lição',
    empty: 'Nenhum símbolo corresponde a esse filtro.',
  },
  topicParamPage: {
    kicker: 'Rota com parâmetro',
    titlePrefix: 'Tópico:',
    lead:
      'Montado a partir de /topic/:slug — o segmento slug é passado como prop de mount. Sem parsing manual de URL.',
    tip:
      'createNav junta ctx.params e ctx.search no objeto de props passado para mount() — cada segmento :name se torna uma prop de mesmo nome na tela. O açúcar de template ${@route/slug} lê o mesmo parâmetro via getRouteParam (createRoute ainda é preferido em JS).',
    back: '← Voltar para Navegação',
  },
  notFoundPage: {
    kicker: '404',
    title: 'Esta lição ainda não existe',
    lead1: 'A rota que você seguiu não corresponde a nenhuma tela em',
    lead2: '. Volte para o início e escolha uma lição na barra lateral.',
    back: '← Voltar para o Início',
  },
}
