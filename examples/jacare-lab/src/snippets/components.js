import { viewSnippet } from '../utils/snippet.js'

export const cardCode = viewSnippet(
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
)

export const iconButtonCode = viewSnippet(
  `const removed = pulse(0)

function onRemovePress() {
  removed.update((n) => n + 1)
}`,
  `  <div class="stack">
    <IconButton :label=\${'Remove'} on-press=\${onRemovePress} />
    <p class="muted">Removed \${removed} times</p>
  </div>`,
)

export const counterCode = viewSnippet(
  `const score = pulse(0)

function onScoreInc() {
  score.update((n) => n + 1)
}`,
  `  <Counter :label=\${'Score'} :count=\${score} on-inc=\${onScoreInc} />`,
)

export const modelFieldCode = viewSnippet(
  `const playerName = pulse('Jacaré')`,
  `  <div class="stack">
    <ModelField :label=\${'Player name'} bind-value=\${playerName} />
    <p class="muted">Hello, \${playerName}!</p>
  </div>`,
)

export const nestedCode = viewSnippet(
  `const teamScore = pulse(0)

function onTeamScoreInc() {
  teamScore.update((n) => n + 1)
}`,
  `  <Card :title=\${'Team panel'} :subtitle=\${'A component rendered inside another component'}>
    <Counter :label=\${'Team score'} :count=\${teamScore} on-inc=\${onTeamScoreInc} />
  </Card>`,
)

export const optionalLeadCode = viewSnippet(
  `const noteText = pulse('')`,
  `  <div class="stack">
    <Card :title=\${'No subtitle prop passed'}>
      <p class="muted">subtitle has a default of '' in the contract, so the conditional subtitle block simply does not render.</p>
      <input class="input" bind-value=\${noteText} placeholder="Optional note" />
    </Card>
  </div>`,
)
