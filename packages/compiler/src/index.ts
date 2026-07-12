export { compile } from './compile.js'
export { JacareCompileError, formatCompileError } from './errors.js'
export { parseModule, findViewTemplates, hasViewSource } from './parse-module.js'
export { flattenViewLiteral } from './flatten-literal.js'
export { flattenViewBlock, findViewBlocks } from './flatten-view-block.js'
export { parseTemplate } from './parse-template.js'
export { generate } from './codegen.js'
export { scopeCss, scopeIdFromFilename } from './scope-css.js'
export type {
  CompileOptions,
  CompileResult,
  TemplateAST,
  TemplateAttr,
  TemplateComponentNode,
  TemplateEachNode,
  TemplateElementNode,
  TemplateIfNode,
  TemplateSlotNode,
  TemplateNode,
  TemplateTextNode,
  TextPart,
} from './types.js'
