import { IntegrationDefinition } from '@botpress/sdk'
import { sentry as sentryHelpers } from '@botpress/sdk-addons'
import typingIndicator from 'bp_modules/typing-indicator'

import { actions, configuration, channels, user, states } from './src/definitions'

export default new IntegrationDefinition({
  name: 'teams',
  version: '1.0.0',
  title: 'Microsoft Teams',
  description: 'Interact with users, deliver notifications, and perform actions within Microsoft Teams.',
  icon: 'icon.svg',
  readme: 'hub.md',
  configuration,
  channels,
  user,
  actions,
  events: {},
  states,
  secrets: sentryHelpers.COMMON_SECRET_NAMES,
}).extend(typingIndicator, () => ({ entities: {} }))
