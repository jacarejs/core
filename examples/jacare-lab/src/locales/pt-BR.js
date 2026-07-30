export default {
  shell: {
    brandTag: 'Tutorial completo da API',
    lessonsNav: 'Lições',
    menuClose: 'Fechar',
    menuOpen: 'Lições',
    topbarHint: 'Demos ao vivo · Ver código abre o fonte de cada exemplo',
    viewCode: 'Ver código',
    devtoolsOn: 'DevTools ligado',
    devtoolsOff: 'DevTools desligado',
    devtoolsTitle: 'Alternar overlay do Jacaré DevTools',
    footer: 'Feito no Brasil',
    localeLabel: 'Idioma',
    close: 'Fechar',
    copy: 'Copiar',
    copied: 'Copiado',
    copyFailed: 'Falhou',
    copyCode: 'Copiar código',
    reset: 'Resetar',
    clicks: 'Cliques',
  },
  bagTree: {
    parentLabel: 'Pai · lê cart.count',
    parentNote: 'Itens na bag:',
    childLabel: 'Filho · lê cart.money',
    childNote: 'Total:',
    grandLabel: 'Neto · sem import da bag (pass-through)',
    grandNote: 'Este nível só aninha — nunca toca na bag.',
    leafLabel: 'Bisneto · escreve cart.add',
    leafNote: 'A folha profunda importa a mesma bag — sem props dos ancestrais.',
    leafAdd: 'Adicionar da folha',
    leafCount: 'count',
  },
  lesson: {
    start: {
      title: 'Início',
      blurb: 'Visão geral do Lab, instalação e índice das lições',
    },
    'quick-start': {
      title: 'Começo rápido',
      blurb: 'API §1 — scaffold, app.jcr, boot.js, shell HTML',
    },
    module: {
      title: 'Formato do módulo',
      blurb: 'API §2 — layout .jcr, sintaxe view/style, exports compilados',
    },
    typescript: {
      title: 'TypeScript',
      blurb: '// @jacare-ts · sibling *.jcr.ts · jacare.d.ts — tipos opcionais',
    },
    language: {
      title: 'Referência da linguagem',
      blurb: 'Palavras reservadas, @route, jacare-when, mapa runtime, CLI',
    },
    'binding-ir': {
      title: 'Binding IR',
      blurb: 'MountPlan · check --bindings · uma floresta para client/SSR/CPW',
    },
    reactivity: {
      title: 'Reatividade',
      blurb: 'signal, computed, effect, batch, Patience, untrack, aliases',
    },
    bag: {
      title: 'Pulse bags',
      blurb: 'Mesh compartilhado, Mesh Ports, publish lazy — nativo e leve',
    },
    templates: {
      title: 'Templates',
      blurb: 'Texto, atributos, variáveis CSS style---',
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
      blurb: 'Sintaxe <debug> — painéis JSON, label, copy, atalho',
    },
    why: {
      title: 'Why',
      blurb: '$why · card Why · ReactiveCycleError · jacare why arquivo:linha',
    },
    if: {
      title: '#if',
      blurb: 'Ramificações, jacare-when, condições aninhadas, estados vazios',
    },
    case: {
      title: '#case',
      blurb: 'Combinar um valor — braços #when, fallback #else',
    },
    for: {
      title: '#for',
      blurb: 'Listas com chave, reordenar, fragmentos, pais estáveis',
    },
    components: {
      title: 'Componentes',
      blurb: 'Props, slots, contracts, emit, model bind-',
    },
    css: {
      title: 'CSS com escopo',
      blurb: 'export <style>, isolamento, :global, if/for/case reativos',
    },
    nav: {
      title: 'Navegação',
      blurb: 'createNav, createRoute, @route, focus grip, guards',
    },
    forms: {
      title: 'Formulários',
      blurb: 'createForm, Field, validate, submit, reset',
    },
    lifecycle: {
      title: 'Ciclo de vida',
      blurb: 'onMount, onActivate, dispose, registerScope',
    },
    cookbook: {
      title: 'Cookbook',
      blurb: 'Tela de tarefas combinando if + for + events + props',
    },
    playground: {
      title: 'Playground',
      blurb: 'Digite fonte .jcr e veja o mount ao vivo',
    },
    ssr: {
      title: 'SSR',
      blurb: 'render, resume, streaming — cards de referência',
    },
    island: {
      title: 'Islands',
      blurb: 'API §14b — mountIsland, shadow, hosts React/Vue/Angular',
    },
    tooling: {
      title: 'Ferramentas',
      blurb: 'CLI, check --bindings/--routes, why arquivo:linha, Binding IR, DevTools',
    },
    helpers: {
      title: 'Catálogo de imports',
      blurb: 'Cada import — explicação, linha de import e exemplo',
    },
    i18n: {
      title: 'i18n',
      blurb: 'createI18n, t({name}), <select>, te() — en / pt-BR / es',
    },
    ui: {
      title: 'Jacaré UI',
      blurb: '@jacare/ui — componentes oficiais, tema, demos ao vivo',
    },
  },
  home: {
    title: 'Jacaré Lab',
    lead:
      'Um tour completo e ao vivo da API — cada lição une uma explicação curta a uma demo rodando. Abra Ver código para ver o fonte.',
    github: 'Repositório no GitHub',
    tip: 'Cada card Demo abaixo tem um botão "Ver código" no cabeçalho — ele abre o fonte exato daquele exemplo em um modal.',
    whatTitle: 'O que é o Jacaré?',
    whatBody1:
      'Jacaré é um framework front-end em tempo de compilação para apps web rápidos e reativos com JavaScript puro. Você escreve módulos .jcr — JS normal mais uma view HTML-like — e o compilador vira isso em atualizações diretas no DOM. Sem virtual DOM, sem re-render da árvore inteira: quando o estado muda, só os nós que dependem dele atualizam.',
    whatBody2:
      'Este lab é um tour guiado dessa API. Cada lição traz uma demo ao vivo e um botão Ver código para você ler o fonte que está rodando.',
    installTitle: 'Instalar',
    installBody1: 'Crie um app novo com o pacote oficial create (npm, pnpm ou yarn funcionam):',
    installBody2: 'Ou instale a CLI globalmente e use jacare new:',
    startTitle: 'Iniciar um projeto',
    startBody1:
      'Na pasta do projeto, suba o servidor com npm run dev (create-jacare) ou jacare dev (scaffold da CLI). Apps create-jacare e jacare new usam http://localhost:3000 por padrão.',
    startBody2:
      'Edite src/app.jcr (ou as telas em src/pages/ se escolheu o template com nav) e a página recarrega a quente. Quando quiser explorar a API toda, percorra as lições na barra lateral — ou abra o Playground e digite.',
    hello: 'Olá, {name}!',
    namePlaceholder: 'Seu nome',
    demo: {
      quick: {
        title: 'Começo rápido',
        lead: 'Um pulse, um botão, uma linha de texto reativo — o menor app Jacaré possível.',
        note: 'Este é o contador inteiro mostrado no painel de código — sem fio extra.',
      },
      boot: {
        title: 'Padrão de boot do app',
        lead: 'Como o boot.js liga app.css, o nav e o hot reload neste lab.',
        note: 'O Jacaré Lab sobe com nav.attach(root) — o mesmo padrão de todas as lições de navegação.',
      },
      greeting: {
        title: 'Um signal e um derive juntos',
        lead: 'Cada lição deste lab é uma variação dessas duas chamadas.',
      },
      highlight: {
        title: 'Uma classe ligada a um signal',
        lead: 'As lições de bindings e CSS se apoiam toda nessa ideia.',
        badge: 'Prévia da lição',
        toggle: 'Alternar classe',
      },
    },
  },
  i18nPage: {
    kicker: '@jacare/ui · i18n',
    title: 'Internacionalização',
    lead:
      'Inicialize createI18n uma vez, guarde as strings nos arquivos de locale e chame t() / translate() dentro das views para que cada rótulo atualize quando o idioma mudar — sem remount e sem virtual DOM.',
    tip:
      'Chame t() dentro do template (ou dentro de um derive que leia o locale). Não guarde o resultado de t() em consts ou arrays no topo do módulo — guarde a chave e traduza na renderização. O t() do Lab devolve string para :title=${t(...)} e placeholders continuarem reativos.',
    yes: 'sim',
    no: 'não',
    hello: 'Olá, {name}!',
    helloFallback: 'amigo',
    nameLabel: 'Seu nome',
    namePlaceholder: 'Digite um nome…',
    sampleTitle: 'Bem-vindo',
    sampleBody: 'Este par Card / Button é @jacare/ui puro — títulos e textos vêm dos arquivos de locale e atualizam com o idioma da barra superior.',
    sampleAction: 'Experimente outro idioma',
    links: {
      docs: 'Docs do Jacaré UI',
      components: 'Componentes',
      github: 'GitHub · @jacare/ui',
    },
    api: {
      title: 'API · @jacare/ui/i18n',
      lead: 'Uma instância ativa via createI18n. O Lab reexporta os helpers em src/i18n.js.',
      createI18n: 'Sobe o store: locale, fallbackLocale, messages, persist (localStorage j-locale).',
      t: 'Lab: string imediata. No pacote, o padrão devolve um derive — envolva ou chame () se usar cru.',
      translate: 'String imediata (no pacote: t(key)()). Prefira em scripts / corpos de derive.',
      setLocale: 'Troca o locale, atualiza <html lang> e persiste quando habilitado.',
      locale: 'Signal do locale atual — ligue com :value=${locale} em um <select>.',
      te: 'true quando a chave existe no locale ativo ou no fallback.',
      availableLocales: 'Ids de locale presentes no objeto messages.',
      addMessages: 'Mescla mais chaves em um locale em runtime (incrementa um signal de revisão).',
    },
    demo: {
      live: {
        title: 'Strings ao vivo',
        lead: 't() em texto e props :title — mude o idioma e este card atualiza no lugar.',
      },
      params: {
        title: 'Interpolação · {name}',
        lead: 'Passe um objeto params. Placeholders usam a sintaxe {palavra} e atualizam com locale e input.',
        note: 'Input vazio cai no padrão traduzido (“amigo” / “friend” / …).',
      },
      select: {
        title: '@jacare/ui Select',
        lead: 'Mesmo padrão da barra do Lab: bind-value no pulse de locale + setLocale no change (persiste j-locale).',
        label: 'Locale nesta página',
        note: 'A escolha persiste entre reloads via localStorage (chave j-locale). Depois de F5 o Select mostra o idioma salvo.',
      },
      inspect: {
        title: 'Inspecionar helpers de locale',
        lead: 'locale(), te() e availableLocales() são reativos — troque o idioma e observe as linhas.',
      },
      messages: {
        title: 'Catálogos de mensagens',
        lead: 'Aninhe as chaves por feature. Mantenha a mesma árvore em cada arquivo de locale.',
        note: 'Este Lab mescla bases en / pt-BR / es com fragments em src/locales/fragments/.',
      },
      pitfalls: {
        title: 'Armadilhas',
        lead: 'Estes erros fazem as traduções parecerem “travadas” ou pela metade.',
      },
    },
    inspect: {
      locale: 'Ativo: {locale}',
      teKnown: 'existe → {value}',
      teMissing: 'existe → {value}',
      available: '{list}',
    },
    pitfalls: {
      badTop: '❌ const title = t("…") no topo do módulo',
      goodTop: '✅ ${t("…")} dentro da view',
      badArray: '❌ { label: t("…") } em array estático',
      goodArray: '✅ { labelKey: "…" } e depois t(row.labelKey)',
      badDerive: '❌ Passar derive do pacote para bindProp sem ()',
      goodDerive: '✅ t() string do Lab — ou chame derive() você mesmo',
    },
    uiKit: {
      title: 'Jacaré UI — biblioteca oficial de componentes',
      body:
        '@jacare/ui é o kit oficial de componentes do Jacaré: controles acessíveis e com tema, baseados em signals, sem virtual DOM. Instale junto com @jacare/core e importe Button, Field, Card, Dialog e helpers de tema.',
      item1: 'Botões, campos, formulários, diálogos, selects, date/time pickers e mais',
      item2: 'Tokens de tema, densidade e motion via @jacare/ui/theme',
      item3: 'Módulo de i18n em @jacare/ui/i18n (createI18n / t / setLocale)',
      linkDocs: 'Docs oficiais → jacarejs.github.io/ui',
      linkComponents: 'Catálogo de componentes',
      linkGithub: 'Código no GitHub',
    },
  },
  uiPage: {
    kicker: '@jacare/ui',
    title: 'Kit oficial de UI',
    lead:
      'Componentes Jacaré acessíveis e com tema, baseados em signals — sem virtual DOM. Instale @jacare/ui junto com @jacare/core e importe caminhos profundos como @jacare/ui/Button.',
    tip:
      'Este Lab já carrega @jacare/ui/theme.css e applyTheme("system") em boot.js. O controle de idioma da barra é @jacare/ui/Select ligado ao pulse de locale persistido (localStorage j-locale). Prefira imports profundos (@jacare/ui/Card).',
    yes: 'ligado',
    no: 'desligado',
    pillarsHeading: 'Por que @jacare/ui',
    pillars: {
      signal: {
        title: 'Signals, não VDOM',
        body: 'Mesmo grafo de pulses do core — só os nós ligados atualizam.',
      },
      theme: {
        title: 'Uma folha de tokens',
        body: 'theme.css + applyTheme / density / motion para o kit inteiro.',
      },
      contract: {
        title: 'Contracts primeiro',
        body: 'Props, slots e emits vivem em cada .jcr — a docs permanece honesta.',
      },
    },
    links: {
      docs: 'Docs · jacarejs.github.io/ui',
      github: 'GitHub · jacarejs/ui',
      components: 'Catálogo de componentes',
      i18n: 'Guia de i18n',
      theme: 'Tokens de tema',
      fullCatalog: 'Catálogo completo com demos ao vivo →',
      select: 'Docs do Select',
      selectDocs: 'Docs do componente Select →',
    },
    demo: {
      install: {
        title: 'Install + boot do tema',
        lead: 'Peer @jacare/core ^0.1.15. Importe theme.css uma vez e aplique as preferências.',
        note: 'O Lab já usa esse padrão em src/boot.js.',
      },
      card: {
        title: 'Card · Button · Badge',
        lead: 'Superfície + ação primária + pill de status — a menor composição útil.',
        cardTitle: 'Perfil',
        body: 'Estes são mounts reais do @jacare/ui, não wrappers só do Lab.',
        badge: 'Oficial',
        save: 'Salvar',
        reset: 'Resetar',
        clicks: 'cliques · {count}',
      },
      form: {
        title: 'Field · Switch',
        lead: 'bind-value / bind-checked ligam pulses direto nos models do kit.',
        nameLabel: 'Nome',
        namePlaceholder: 'Ada Lovelace',
        nameHint: 'O valor digitado fica num pulse — sem form library para um campo só.',
        notify: 'Receber e-mails',
        greeting: 'Olá, {name} · notify {notify}',
        anon: 'amigo',
      },
      select: {
        title: 'Select',
        lead: 'Dropdown do @jacare/ui/Select — bind-value num pulse, options com { value, label }.',
        label: 'Papel',
        placeholder: 'Escolha um papel',
        viewer: 'Leitor',
        editor: 'Editor',
        admin: 'Admin',
        summary: 'Papel selecionado: {role}',
      },
      display: {
        title: 'Avatar · Text · Divider',
        lead: 'Componha primitivos de display com Stack — mesmos tokens do resto do kit.',
        name: 'Ada Lovelace',
        badge: 'Contribuidor',
        divider: 'Detalhes',
        note: 'Signals, sem virtual DOM — Text tone="muted" para texto secundário.',
      },
      controls: {
        title: 'Checkbox · Rate · Slider · InputNumber · Spinner',
        lead: 'Mais controles de form/feedback em pulses — alterne o Spinner para ver o estado busy.',
        accept: 'Concordo com os termos da demo',
        qty: 'Quantidade',
        spin: 'Mostrar spinner',
        stop: 'Esconder spinner',
        saving: 'Salvando…',
        summary: 'aceito {accepted} · estrelas {rating} · volume {volume} · qtd {qty}',
      },
      feedback: {
        title: 'Alert · Progress',
        lead: 'Status inline e barra determinada — ambos reativos a pulses.',
        alertTitle: 'Atenção',
        alertBody: 'Baseado em signals do Jacaré — o valor do Progress abaixo é um pulse.',
        progressLabel: 'Upload',
        bump: 'Aumentar progresso',
      },
    },
    catalog: {
      title: 'O que vem no pacote',
      lead: 'Mapa curto do catálogo. Abra a docs para cada prop, slot e demo ao vivo.',
      forms: 'Forms e inputs (mais Autocomplete, Select, Date/Time, Upload, …)',
      display: 'Superfícies de exibição de dados',
      feedback: 'Feedback inline e loading',
      overlay: 'Modais e confirmações',
      layout: 'Primitivos de layout',
      chrome: 'Helpers de chrome do app + ícones',
    },
  },
}
