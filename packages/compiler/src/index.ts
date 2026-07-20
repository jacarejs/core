export { compile } from './compile.js'
export { JacareCompileError, formatCompileError } from './errors.js'
export { parseModule, findViewTemplates, hasViewSource } from './parse-module.js'
export { flattenViewLiteral } from './flatten-literal.js'
export { flattenViewBlock, findViewBlocks } from './flatten-view-block.js'
export { parseTemplate } from './parse-template.js'
export { generate, detectProps, resolveMountProps } from './codegen.js'
export {
  parseContractBody,
  emptyContract,
  contractPropNames,
  hasContractSurface,
} from './parse-contract.js'
export {
  collectComponents,
  collectProvidedProps,
  formatContractIssue,
  validateContractUsage,
} from './validate-contract.js'
export type { ContractUsageIssue, ProvidedProp } from './validate-contract.js'
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
  TemplateCaseNode,
  TemplateSlotNode,
  TemplateNode,
  TemplateTextNode,
  TextPart,
} from './types.js'
export type {
  TemplateContract,
  ContractPropDef,
  ContractTypeName,
} from './parse-contract.js'
