export const topics = [
  {
    slug: 'getting-started',
    step: 1,
    title: 'Getting started',
    summary: 'Project layout, modules, and your first view.',
  },
  {
    slug: 'reactivity',
    step: 2,
    title: 'Reactivity',
    summary: 'Signals, derived values, and effects without a virtual DOM.',
  },
  {
    slug: 'templates',
    step: 3,
    title: 'Templates',
    summary: 'Conditionals, lists, bindings, and components.',
  },
  {
    slug: 'components',
    step: 4,
    title: 'Components',
    summary: 'Reusable self-closing components with typed props.',
  },
  {
    slug: 'navigation',
    step: 5,
    title: 'Navigation',
    summary: 'Routes, lazy screens, URL params, and query strings.',
  },
  {
    slug: 'forms',
    step: 6,
    title: 'Forms',
    summary: 'Two-way bindings, validation, and field components.',
  },
  {
    slug: 'lifecycle',
    step: 7,
    title: 'Lifecycle',
    summary: 'Screen hooks and live Scope debugging.',
  },
]

export function topicHref(slug) {
  return `/tutorial/${slug}`
}

export function topicNeighbors(slug) {
  const index = topics.findIndex((item) => item.slug === slug)
  if (index === -1) return { prev: null, next: null }
  return {
    prev: index > 0 ? topics[index - 1] : null,
    next: index < topics.length - 1 ? topics[index + 1] : null,
  }
}
