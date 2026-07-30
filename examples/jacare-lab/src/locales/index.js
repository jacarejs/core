import en from './en.js'
import ptBR from './pt-BR.js'
import es from './es.js'
import batch1En from './fragments/batch1.en.js'
import batch1Pt from './fragments/batch1.pt-BR.js'
import batch1Es from './fragments/batch1.es.js'
import batch2En from './fragments/batch2.en.js'
import batch2Pt from './fragments/batch2.pt-BR.js'
import batch2Es from './fragments/batch2.es.js'
import batch3En from './fragments/batch3.en.js'
import batch3Pt from './fragments/batch3.pt-BR.js'
import batch3Es from './fragments/batch3.es.js'
import batch4En from './fragments/batch4.en.js'
import batch4Pt from './fragments/batch4.pt-BR.js'
import batch4Es from './fragments/batch4.es.js'
import helpersCatalogEn from './fragments/helpers-catalog.en.js'
import helpersCatalogPt from './fragments/helpers-catalog.pt-BR.js'
import helpersCatalogEs from './fragments/helpers-catalog.es.js'

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

function merge(base, extra) {
  const out = { ...base }
  for (const key of Object.keys(extra)) {
    const next = extra[key]
    out[key] = isPlainObject(next) && isPlainObject(out[key]) ? merge(out[key], next) : next
  }
  return out
}

function withFragments(base, extras) {
  return extras.reduce((acc, fragment) => merge(acc, fragment), base)
}

export const messages = {
  en: withFragments(en, [batch1En, batch2En, batch3En, batch4En, helpersCatalogEn]),
  'pt-BR': withFragments(ptBR, [batch1Pt, batch2Pt, batch3Pt, batch4Pt, helpersCatalogPt]),
  es: withFragments(es, [batch1Es, batch2Es, batch3Es, batch4Es, helpersCatalogEs]),
}
