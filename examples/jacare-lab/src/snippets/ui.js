export const uiInstallCode = `yarn add @jacare/ui @jacare/core

// boot.js
import '@jacare/ui/theme.css'
import { applyTheme, applyDensity, applyMotion } from '@jacare/ui/theme'

applyTheme('system')
applyDensity('comfortable')
applyMotion('system')
`

export const uiCardCode = `import { pulse } from '@jacare/core'
import Card from '@jacare/ui/Card'
import Button from '@jacare/ui/Button'
import Badge from '@jacare/ui/Badge'

const clicks = pulse(0)

export <view>
  <Card :title=\${'Profile'}>
    <Badge :text=\${'Official'} :tone=\${'success'} />
    <Button :variant=\${'primary'} on-press=\${() => clicks.update((n) => n + 1)}>
      Save
    </Button>
  </Card>
</view>
`

export const uiFieldCode = `import { pulse } from '@jacare/core'
import Field from '@jacare/ui/Field'
import Switch from '@jacare/ui/Switch'

const name = pulse('')
const notify = pulse(true)

export <view>
  <Field :label=\${'Name'} bind-value=\${name} :placeholder=\${'Ada'} />
  <Switch :label=\${'Notify me'} bind-checked=\${notify} />
</view>
`

export const uiFeedbackCode = `import { pulse } from '@jacare/core'
import Alert from '@jacare/ui/Alert'
import Progress from '@jacare/ui/Progress'
import Button from '@jacare/ui/Button'

const progress = pulse(35)

export <view>
  <Alert :tone=\${'info'} :title=\${'Heads up'}>
    Powered by Jacaré signals — no virtual DOM.
  </Alert>
  <Progress :value=\${progress} :showValue=\${true} :label=\${'Upload'} />
  <Button :variant=\${'outline'} on-press=\${() => progress.update((n) => Math.min(100, n + 15))}>
    Bump
  </Button>
</view>
`

export const uiSelectCode = `import { pulse } from '@jacare/core'
import Select from '@jacare/ui/Select'

const role = pulse('editor')
const roles = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
]

export <view>
  <Select
    :label=\${'Role'}
    :options=\${roles}
    :searchable=\${false}
    bind-value=\${role}
  />
</view>
`

export const uiDisplayCode = `import Avatar from '@jacare/ui/Avatar'
import Badge from '@jacare/ui/Badge'
import Text from '@jacare/ui/Text'
import Divider from '@jacare/ui/Divider'
import Stack from '@jacare/ui/Stack'

export <view>
  <Stack :direction=\${'row'} :gap=\${'md'} :align=\${'center'}>
    <Avatar :name=\${'Ada Lovelace'} :tone=\${'success'} />
    <Stack :gap=\${'xs'}>
      <Text :weight=\${'bold'}>Ada Lovelace</Text>
      <Badge :text=\${'Contributor'} :tone=\${'info'} />
    </Stack>
  </Stack>
  <Divider :label=\${'Details'} />
  <Text :tone=\${'muted'}>Signals, no virtual DOM.</Text>
</view>
`

export const uiControlsCode = `import { pulse } from '@jacare/core'
import Checkbox from '@jacare/ui/Checkbox'
import Rate from '@jacare/ui/Rate'
import Slider from '@jacare/ui/Slider'
import InputNumber from '@jacare/ui/InputNumber'
import Spinner from '@jacare/ui/Spinner'
import Stack from '@jacare/ui/Stack'

const accepted = pulse(false)
const rating = pulse(4)
const volume = pulse(40)
const qty = pulse(2)
const busy = pulse(false)

export <view>
  <Stack :gap=\${'md'}>
    <Checkbox :label=\${'I agree'} bind-checked=\${accepted} />
    <Rate bind-value=\${rating} :showText=\${true} />
    <Slider bind-value=\${volume} :min=\${0} :max=\${100} :showTooltip=\${true} />
    <InputNumber :label=\${'Qty'} bind-value=\${qty} :min=\${1} :max=\${99} />
    #if busy()
      <Spinner :label=\${'Saving…'} />
    #end
  </Stack>
</view>
`
