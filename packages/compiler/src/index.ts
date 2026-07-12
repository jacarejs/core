export { compile } from './compile.js'
export { JacareCompileError, formatCompileError } from './errors.js'
export { parseModule, findViewTemplates } from './parse-module.js'
export { flattenViewLiteral } from './flatten-literal.js'
export { parseTemplate } from './parse-template.js'
export { generate } from './codegen.js'
export type {
  CompileOptions,
  CompileResult,
  TemplateAST,
  TemplateAttr,
  TemplateComponentNode,
  TemplateEachNode,
  TemplateElementNode,
  TemplateIfNode,
  TemplateNode,
  TemplateTextNode,
  TextPart,
} from './types.js'
