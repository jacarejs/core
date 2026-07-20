import { viewSnippet, codeFiles } from '../utils/snippet.js'
import {
  CARD_SOURCE,
  BADGE_SOURCE,
  ICON_BUTTON_SOURCE,
  COUNTER_SOURCE,
  MODEL_FIELD_SOURCE,
} from './component-sources.js'

export const cardCode = codeFiles(
  viewSnippet(
    `const moods = ['curious', 'focused', 'shipping']
const mood = pulse('curious')

function cycleMood() {
  const index = moods.indexOf(mood())
  mood.set(moods[(index + 1) % moods.length])
}`,
    `  <Card :title=\${'Card with slots'} :subtitle=\${'default slot content below, actions in the row'}>
    <p>This paragraph is projected into the default slot.</p>
    <Badge :text=\${mood} />
    <div slot="actions">
      <button on-click=\${cycleMood}>Cycle mood</button>
    </div>
  </Card>`,
  ),
  [
    { name: 'components/Card.jcr', code: CARD_SOURCE },
    { name: 'components/Badge.jcr', code: BADGE_SOURCE },
  ],
)

export const iconButtonCode = codeFiles(
  viewSnippet(
    `const removed = pulse(0)

function onRemovePress() {
  removed.update((n) => n + 1)
}`,
    `  <div class="stack">
    <IconButton :label=\${'Remove'} on-press=\${onRemovePress} />
    <p class="muted">Removed \${removed} times</p>
  </div>`,
  ),
  [{ name: 'components/IconButton.jcr', code: ICON_BUTTON_SOURCE }],
)

export const counterCode = codeFiles(
  viewSnippet(
    `const score = pulse(0)

function onScoreInc() {
  score.update((n) => n + 1)
}`,
    `  <Counter :label=\${'Score'} :count=\${score} on-inc=\${onScoreInc} />`,
  ),
  [{ name: 'components/Counter.jcr', code: COUNTER_SOURCE }],
)

export const modelFieldCode = codeFiles(
  viewSnippet(
    `const playerName = pulse('Jacaré')`,
    `  <div class="stack">
    <ModelField :label=\${'Player name'} bind-value=\${playerName} />
    <p class="muted">Hello, \${playerName}!</p>
  </div>`,
  ),
  [{ name: 'components/ModelField.jcr', code: MODEL_FIELD_SOURCE }],
)

export const nestedCode = codeFiles(
  viewSnippet(
    `const teamScore = pulse(0)

function onTeamScoreInc() {
  teamScore.update((n) => n + 1)
}`,
    `  <Card :title=\${'Team panel'} :subtitle=\${'A component rendered inside another component'}>
    <Counter :label=\${'Team score'} :count=\${teamScore} on-inc=\${onTeamScoreInc} />
  </Card>`,
  ),
  [
    { name: 'components/Card.jcr', code: CARD_SOURCE },
    { name: 'components/Counter.jcr', code: COUNTER_SOURCE },
  ],
)

export const optionalLeadCode = codeFiles(
  viewSnippet(
    `const noteText = pulse('')`,
    `  <div class="stack">
    <Card :title=\${'No subtitle prop passed'}>
      <p class="muted">subtitle has a default of '' in the contract, so the conditional subtitle block simply does not render.</p>
      <input class="input" bind-value=\${noteText} placeholder="Optional note" />
    </Card>
  </div>`,
  ),
  [{ name: 'components/Card.jcr', code: CARD_SOURCE }],
)

export const debugPropsCode = viewSnippet(
  `const score = pulse(0)
const mood = pulse('curious')
const removed = pulse(0)
const playerName = pulse('Jacaré')

function onScoreInc() {
  score.update((n) => n + 1)
}

function cycleMood() {
  mood.set(mood() === 'curious' ? 'focused' : 'curious')
}`,
  `  <div class="stack">
    <Counter :label=\${'Score'} :count=\${score} on-inc=\${onScoreInc} />
    <debug copy label="props">\${{ score, mood, removed, playerName }}</debug>
  </div>`,
)
