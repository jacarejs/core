export const viewOpen = 'export ' + '<view>'
export const styleOpen = 'export ' + '<style>'
export const contractOpen = 'export ' + '<contract>'

export const step1Code = `import { pulse } from '@jacare/core'

const title = pulse('Hello, Jacaré')

${viewOpen}
  <section class="hello">
    <h1>\${title}</h1>
    <p>Your first .jcr component</p>
  </section>
</view>

${styleOpen}
.hello { padding: 1rem; }
</style>`

export const step2Code = `import { pulse } from '@jacare/core'

const variant = pulse('default')
const animation = pulse('fade')
const active = pulse(false)
const lastEvent = pulse('Waiting…')

${viewOpen}
  <p>Variant: \${variant}</p>
  <p>Animation: \${animation}</p>
  <p>Active: \${active}</p>
  <p>\${lastEvent}</p>
</view>`

export const step3Code = `// ProfileCard.jcr
${contractOpen}
  props: {
    name: { type: 'string', required: true }
    description: { type: 'string', default: '' }
  }
  emits: ['profileSelected']
</contract>

${viewOpen}
  <article on-click=\${() => emit('profileSelected', { name })}>
    <h3>\${name}</h3>
    <p>\${description}</p>
  </article>
</view>`

export const step4Code = `<ProfileCard
  :name=\${name}
  :description=\${description}
  :avatar=\${avatar}
  :status=\${status}
  :variant=\${variant}
  :animation=\${animation}
  :active=\${active}
/>`

export const step5Code = `// child
emit('profileSelected', { name, variant })

// parent
function onProfileSelected(detail) {
  lastEvent.set('ProfileCard emitted: profileSelected')
}

<ProfileCard on-profileSelected=\${onProfileSelected} />`

export const step6Code = `const variant = pulse('glass')

<ProfileCard :variant=\${variant} />

/* classes: variant-default | glass | neon | nature */`

export const step7Code = `const animation = pulse('bounce')
const playToken = pulse(1)

function replay() {
  playToken.update((n) => n + 1)
}

<ProfileCard :animation=\${animation} :playToken=\${playToken} />`

export const step8Code = `import { pulse } from '@jacare/core'
import ProfileCard from '../profile-card/ProfileCard.jcr'
import VariantSelector from '../variant-selector/VariantSelector.jcr'
import AnimationControls from '../animation-controls/AnimationControls.jcr'

const name = pulse('Jacaré Dev')
const variant = pulse('nature')
const animation = pulse('scale')
const playToken = pulse(1)

${viewOpen}
  <VariantSelector :value=\${variant} :options=\${VARIANTS} on-change=\${(v) => variant.set(v)} />
  <AnimationControls :value=\${animation} :options=\${ANIMS} on-change=\${(v) => animation.set(v)} />
  <ProfileCard :name=\${name} :variant=\${variant} :animation=\${animation} :playToken=\${playToken} />
</view>`

export const counterTrackCode = `export <contract>
  props: {
    label: { type: 'string', required: true }
    count: { type: 'number', required: true }
  }
  emits: ['inc']
</contract>

${viewOpen}
  <button on-click=\${() => emit('inc')}>\${label}: \${count}</button>
</view>`

export const listTrackCode = `const items = pulse([
  { id: 'a', title: 'Signals' },
  { id: 'b', title: 'Events' },
])

${viewOpen}
  <ul>
    #for items() as item (item.id)
      <li>\${item.title}</li>
    #end
  </ul>
</view>`

export const step8Tree = `src/
├── components/
│   ├── animated-profile/
│   │   └── AnimatedProfile.jcr
│   ├── profile-card/
│   │   └── ProfileCard.jcr
│   ├── variant-selector/
│   │   └── VariantSelector.jcr
│   └── animation-controls/
│       └── AnimationControls.jcr
├── styles/
│   └── animations.css
└── pages/
    ├── index.jcr
    ├── tutorial.jcr
    ├── playground.jcr
    └── game.jcr`

export const oceanHint = `Add .variant-ocean in ProfileCard.
Blend water tones with Jacaré green (#189030 + #2a9d8f).
Push { id: 'ocean', label: 'Ocean' } into the variant list.`

export const oceanSolution = `/* ProfileCard.jcr — Ocean variant */
.profile-card.variant-ocean {
  background: linear-gradient(145deg, #e8f7f4, #f4fbf6 55%, #dff3ff);
  border-color: #7ec8c0;
  box-shadow: 0 14px 36px rgba(16, 80, 90, 0.12);
}

.profile-card.variant-ocean .profile-avatar {
  background: linear-gradient(135deg, #189030, #2a9d8f);
  color: #f0fff4;
}

/* AnimatedProfile.jcr */
const VARIANTS = [
  { id: 'default', label: 'Default' },
  { id: 'glass', label: 'Glass' },
  { id: 'neon', label: 'Neon' },
  { id: 'nature', label: 'Nature' },
  { id: 'ocean', label: 'Ocean' },
]`

export const fileTree = step8Tree
