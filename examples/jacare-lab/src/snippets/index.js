export { quickStartCode, bootCode, greetingCode, highlightCode } from './start.js'

export { scaffoldCode, appJcrCode, bootJsCode, htmlShellCode } from './quick-start.js'

export {
  layoutCode,
  viewSyntaxCode,
  styleSyntaxCode,
  compiledExportsCode,
  liveModuleCode,
} from './module.js'

export {
  signalCode,
  computedCode,
  effectCode,
  batchCode,
  untrackCode,
  aliasCode,
  rangeCode,
  watchCode,
  nestedComputedCode,
} from './reactivity.js'

export { textBindingCode, attrCode, progressCode, multiAttrCode, trendCode } from './templates.js'

export { mirrorCode, classCode, gaugeCode, numberBindCode, multiClassCode } from './bindings.js'

export {
  clickCode,
  forCode,
  keydownCode,
  inputChangeCode,
  focusBlurCode,
  submitCode,
  padCode,
  stopCode,
  preventLinkCode,
  hoverCode,
  dblClickCode,
} from './events.js'

export {
  stateCode,
  nestedCode as conditionalsNestedCode,
  siblingCode,
  gradeCode,
  emptyResultsCode,
  themeBgCode,
} from './conditionals.js'

export { keyedCode, indexCode, emptyPatternCode, catalogCode, filterCode, moveTopCode } from './lists.js'

export {
  cardCode,
  iconButtonCode,
  counterCode,
  modelFieldCode,
  nestedCode as componentsNestedCode,
  optionalLeadCode,
} from './components.js'

export { scopedCode, globalCode, spotlightCode, hueChipCode } from './css.js'

export {
  setupCode,
  routeCode,
  navApiCode,
  linksCode,
  queryCode,
  guardCode,
  warmOnHoverCode,
  shellCode,
} from './navigation.js'

export { formCode, touchedDirtyCode, confirmCode, multiValidatorCode } from './forms.js'

export { cycleFlowCode, hooksCode, scopeCode, activationCode, disposeCode } from './lifecycle.js'

export { cookbookCode, searchCode } from './cookbook.js'

export {
  renderCode,
  resumeMentalModelCode,
  resumeCode,
  renderToStringCode,
  renderToStreamCode,
} from './ssr.js'

export { cliCode, vitePluginCode, compileApiCode, devtoolsCode, testingCode, scriptsCode } from './tooling.js'

import { quickStartCode, bootCode, greetingCode, highlightCode } from './start.js'
import { scaffoldCode, appJcrCode, bootJsCode, htmlShellCode } from './quick-start.js'
import {
  layoutCode,
  viewSyntaxCode,
  styleSyntaxCode,
  compiledExportsCode,
  liveModuleCode,
} from './module.js'
import {
  signalCode,
  computedCode,
  effectCode,
  batchCode,
  untrackCode,
  aliasCode,
  rangeCode,
  watchCode,
  nestedComputedCode,
} from './reactivity.js'
import { textBindingCode, attrCode, progressCode, multiAttrCode, trendCode } from './templates.js'
import { mirrorCode, classCode, gaugeCode, numberBindCode, multiClassCode } from './bindings.js'
import {
  clickCode,
  forCode,
  keydownCode,
  inputChangeCode,
  focusBlurCode,
  submitCode,
  padCode,
  stopCode,
  preventLinkCode,
  hoverCode,
  dblClickCode,
} from './events.js'
import {
  stateCode,
  nestedCode as conditionalsNestedCode2,
  siblingCode,
  gradeCode,
  emptyResultsCode,
  themeBgCode,
} from './conditionals.js'
import { keyedCode, indexCode, emptyPatternCode, catalogCode, filterCode, moveTopCode } from './lists.js'
import {
  cardCode,
  iconButtonCode,
  counterCode,
  modelFieldCode,
  nestedCode as componentsNestedCode2,
  optionalLeadCode,
} from './components.js'
import { scopedCode, globalCode, spotlightCode, hueChipCode } from './css.js'
import {
  setupCode,
  routeCode,
  navApiCode,
  linksCode,
  queryCode,
  guardCode,
  warmOnHoverCode,
  shellCode,
} from './navigation.js'
import { formCode, touchedDirtyCode, confirmCode, multiValidatorCode } from './forms.js'
import { cycleFlowCode, hooksCode, scopeCode, activationCode, disposeCode } from './lifecycle.js'
import { cookbookCode, searchCode } from './cookbook.js'
import {
  renderCode,
  resumeMentalModelCode,
  resumeCode,
  renderToStringCode,
  renderToStreamCode,
} from './ssr.js'
import { cliCode, vitePluginCode, compileApiCode, devtoolsCode, testingCode, scriptsCode } from './tooling.js'

export const SNIPPET_CATALOG = [
  { id: 'start.quick-start', title: 'Quick start', lesson: '/', code: quickStartCode },
  { id: 'start.boot', title: 'App boot pattern', lesson: '/', code: bootCode },
  { id: 'start.greeting', title: 'A signal and a derive, together', lesson: '/', code: greetingCode },
  { id: 'start.highlight', title: 'A class toggled from a signal', lesson: '/', code: highlightCode },

  { id: 'quick-start.scaffold', title: 'Step 1 — Scaffold a project', lesson: '/quick-start', code: scaffoldCode },
  { id: 'quick-start.app-jcr', title: 'Step 2 — Create src/app.jcr', lesson: '/quick-start', code: appJcrCode },
  { id: 'quick-start.boot', title: 'Step 3 — Boot in src/boot.js', lesson: '/quick-start', code: bootJsCode },
  { id: 'quick-start.html', title: 'Step 4 — HTML shell (index.html)', lesson: '/quick-start', code: htmlShellCode },

  { id: 'module.layout', title: 'Recommended layout', lesson: '/module', code: layoutCode },
  { id: 'module.live', title: 'Live mini-module', lesson: '/module', code: liveModuleCode },
  { id: 'module.view-syntax', title: 'Supported view syntax', lesson: '/module', code: viewSyntaxCode },
  { id: 'module.style-syntax', title: 'Supported style syntax', lesson: '/module', code: styleSyntaxCode },
  { id: 'module.compiled', title: 'Compiled output', lesson: '/module', code: compiledExportsCode },

  { id: 'reactivity.signal', title: 'signal: set, update, peek', lesson: '/reactivity', code: signalCode },
  { id: 'reactivity.computed', title: 'computed: price × qty', lesson: '/reactivity', code: computedCode },
  { id: 'reactivity.effect', title: 'effect: write to a log', lesson: '/reactivity', code: effectCode },
  { id: 'reactivity.batch', title: 'batch: coalesce updates', lesson: '/reactivity', code: batchCode },
  { id: 'reactivity.untrack', title: 'untrack: skip a dependency', lesson: '/reactivity', code: untrackCode },
  { id: 'reactivity.alias', title: 'pulse / derive aliases', lesson: '/reactivity', code: aliasCode },
  { id: 'reactivity.range', title: 'derive: a category from a range', lesson: '/reactivity', code: rangeCode },
  { id: 'reactivity.watch', title: 'watch: an alias for effect', lesson: '/reactivity', code: watchCode },
  { id: 'reactivity.nested-computed', title: 'Nested computed: unit chain', lesson: '/reactivity', code: nestedComputedCode },

  { id: 'templates.text-binding', title: 'Bare vs mixed text', lesson: '/templates', code: textBindingCode },
  { id: 'templates.attr', title: 'Static attribute vs :src / bind-href', lesson: '/templates', code: attrCode },
  { id: 'templates.progress', title: 'Reactive CSS variable: style---pct', lesson: '/templates', code: progressCode },
  { id: 'templates.multi-attr', title: 'Multiple reactive attributes on one element', lesson: '/templates', code: multiAttrCode },
  { id: 'templates.trend', title: 'Conditional text + class from expressions', lesson: '/templates', code: trendCode },

  { id: 'bindings.mirror', title: 'bind-value / bind-checked mirrors', lesson: '/bindings', code: mirrorCode },
  { id: 'bindings.class', title: 'class-active / class-done', lesson: '/bindings', code: classCode },
  { id: 'bindings.gauge', title: 'style--- gauge', lesson: '/bindings', code: gaugeCode },
  { id: 'bindings.number-bind', title: 'bind-value on a number input', lesson: '/bindings', code: numberBindCode },
  { id: 'bindings.multi-class', title: 'Several class-* bindings on one element', lesson: '/bindings', code: multiClassCode },

  { id: 'events.click', title: 'Named handler vs @click', lesson: '/events', code: clickCode },
  { id: 'events.for', title: 'Inline arrow inside a loop', lesson: '/events', code: forCode },
  { id: 'events.keydown', title: 'on-keydown: submit on Enter', lesson: '/events', code: keydownCode },
  { id: 'events.input-change', title: 'on-input vs on-change', lesson: '/events', code: inputChangeCode },
  { id: 'events.focus-blur', title: 'on-focus / on-blur', lesson: '/events', code: focusBlurCode },
  { id: 'events.submit', title: 'on-submit + preventDefault', lesson: '/events', code: submitCode },
  { id: 'events.pad', title: 'Pointer pad', lesson: '/events', code: padCode },
  { id: 'events.stop', title: 'stopPropagation: nested buttons', lesson: '/events', code: stopCode },
  { id: 'events.prevent-link', title: 'preventDefault on a link', lesson: '/events', code: preventLinkCode },
  { id: 'events.hover', title: 'on-mouseenter / on-mouseleave', lesson: '/events', code: hoverCode },
  { id: 'events.dbl-click', title: 'on-dblclick', lesson: '/events', code: dblClickCode },

  { id: 'conditionals.state', title: 'Loading / error / empty / ready', lesson: '/if', code: stateCode },
  { id: 'conditionals.nested', title: 'Nested conditionals: auth gate', lesson: '/if', code: conditionalsNestedCode2 },
  { id: 'conditionals.sibling', title: 'Multi-sibling branches', lesson: '/if', code: siblingCode },
  { id: 'conditionals.grade', title: '#elif chain: grade tiers', lesson: '/if', code: gradeCode },
  { id: 'conditionals.empty-results', title: 'Empty-state pattern: search results', lesson: '/if', code: emptyResultsCode },
  { id: 'conditionals.theme-bg', title: 'Swap backgrounds with if', lesson: '/if', code: themeBgCode },

  { id: 'lists.keyed', title: 'Keyed add / remove / reorder', lesson: '/for', code: keyedCode },
  { id: 'lists.index', title: 'Index binding', lesson: '/for', code: indexCode },
  { id: 'lists.empty-pattern', title: 'A loop under a conditional vs a stable list', lesson: '/for', code: emptyPatternCode },
  { id: 'lists.catalog', title: 'Static catalog array', lesson: '/for', code: catalogCode },
  { id: 'lists.filter', title: 'Filtered list from a derive', lesson: '/for', code: filterCode },
  { id: 'lists.move-top', title: 'Move an item to the top', lesson: '/for', code: moveTopCode },

  { id: 'components.card', title: 'Badge + Card slots', lesson: '/components', code: cardCode },
  { id: 'components.icon-button', title: 'IconButton: contract + emit', lesson: '/components', code: iconButtonCode },
  { id: 'components.counter', title: 'Counter: props + emit', lesson: '/components', code: counterCode },
  { id: 'components.model-field', title: 'ModelField: bind-value model prop', lesson: '/components', code: modelFieldCode },
  { id: 'components.nested', title: 'Nested components', lesson: '/components', code: componentsNestedCode2 },
  { id: 'components.optional-lead', title: 'Optional subtitle prop', lesson: '/components', code: optionalLeadCode },

  { id: 'css.scoped', title: 'Same class name, two components', lesson: '/css', code: scopedCode },
  { id: 'css.global', title: 'Global opt-out', lesson: '/css', code: globalCode },
  { id: 'css.spotlight', title: 'Toggle a locally scoped class', lesson: '/css', code: spotlightCode },
  { id: 'css.hue-chip', title: 'Scoped style, reactive CSS variable', lesson: '/css', code: hueChipCode },

  { id: 'navigation.setup', title: 'createNav setup', lesson: '/nav', code: setupCode },
  { id: 'navigation.route', title: 'Live route reads', lesson: '/nav', code: routeCode },
  { id: 'navigation.nav-api', title: 'nav.go / swap / undo / warm', lesson: '/nav', code: navApiCode },
  { id: 'navigation.links', title: 'routeHref + param routes', lesson: '/nav', code: linksCode },
  { id: 'navigation.query', title: 'Search query with route.search', lesson: '/nav', code: queryCode },
  { id: 'navigation.guard', title: 'beforeGo guard', lesson: '/nav', code: guardCode },
  { id: 'navigation.warm-on-hover', title: 'Prefetch on hover', lesson: '/nav', code: warmOnHoverCode },
  { id: 'navigation.shell', title: 'Layout + lazy screens', lesson: '/nav', code: shellCode },

  { id: 'forms.form', title: 'Schema + validation', lesson: '/forms', code: formCode },
  { id: 'forms.touched-dirty', title: 'Field state: touched + dirty', lesson: '/forms', code: touchedDirtyCode },
  { id: 'forms.confirm', title: 'Custom validator reading another field', lesson: '/forms', code: confirmCode },
  { id: 'forms.multi-validator', title: 'Multiple validators on one field', lesson: '/forms', code: multiValidatorCode },

  { id: 'lifecycle.cycle', title: 'screen() lifecycle order', lesson: '/lifecycle', code: cycleFlowCode },
  { id: 'lifecycle.hooks', title: 'Full lifecycle export', lesson: '/lifecycle', code: hooksCode },
  { id: 'lifecycle.scope', title: 'registerScope for the DevTools panel', lesson: '/lifecycle', code: scopeCode },
  { id: 'lifecycle.activation', title: 'onActivate runs on every visit', lesson: '/lifecycle', code: activationCode },
  { id: 'lifecycle.dispose', title: 'Dispose counter', lesson: '/lifecycle', code: disposeCode },

  { id: 'cookbook.cookbook', title: 'Task list', lesson: '/cookbook', code: cookbookCode },
  { id: 'cookbook.search', title: 'Search + filter', lesson: '/cookbook', code: searchCode },

  { id: 'ssr.render', title: 'render(props): server HTML + state', lesson: '/ssr', code: renderCode },
  { id: 'ssr.resume-mental-model', title: 'The resume() mental model', lesson: '/ssr', code: resumeMentalModelCode },
  { id: 'ssr.resume', title: 'resume(target, state, props)', lesson: '/ssr', code: resumeCode },
  { id: 'ssr.render-to-string', title: 'renderToString: one HTML string', lesson: '/ssr', code: renderToStringCode },
  { id: 'ssr.render-to-stream', title: 'renderToStream: chunked HTML', lesson: '/ssr', code: renderToStreamCode },

  { id: 'tooling.cli', title: 'CLI commands', lesson: '/tooling', code: cliCode },
  { id: 'tooling.vite-plugin', title: 'Vite plugin options', lesson: '/tooling', code: vitePluginCode },
  { id: 'tooling.compile-api', title: 'Compiler API', lesson: '/tooling', code: compileApiCode },
  { id: 'tooling.devtools', title: 'DevTools', lesson: '/tooling', code: devtoolsCode },
  { id: 'tooling.testing', title: 'Testing', lesson: '/tooling', code: testingCode },
  { id: 'tooling.scripts', title: 'package.json scripts', lesson: '/tooling', code: scriptsCode },
]
