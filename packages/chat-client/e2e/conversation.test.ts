import { expect, test } from 'vitest'
import _ from 'lodash'
import * as utils from './utils'
import * as config from './config'
import * as chat from '../src'

const apiUrl = config.get('API_URL')

test('api prevents creating conversation with an invalid fid', async () => {
  const client = await chat.Client.connect({ apiUrl })

  const convFid = utils.getConversationFid()
  const invalidUserIds = [
    `invalid+${convFid}`, // invalid character
    `invalid_${convFid}_${convFid}_${convFid}`, // too long
  ]

  for (const id of invalidUserIds) {
    const promise = client.createConversation({ id })
    await expect(promise).rejects.toThrow(chat.InvalidPayloadError)
  }

  for (const id of invalidUserIds) {
    const promise = client.getOrCreateConversation({ id })
    await expect(promise).rejects.toThrow(chat.InvalidPayloadError)
  }
})

test('api prevents creating multiple conversations with the same foreign id', async () => {
  const client = await chat.Client.connect({ apiUrl })

  const conversationFid = utils.getConversationFid()

  const createConversation = () => client.createConversation({ id: conversationFid })

  await createConversation()
  await expect(createConversation).rejects.toThrow(chat.AlreadyExistsError)
})

test('get or create a conversation always returns the same conversation', async () => {
  const client = await chat.Client.connect({ apiUrl })

  const {
    conversation: { id: conversationId },
  } = await client.createConversation({})

  const getOrCreate = () => client.getConversation({ id: conversationId }).then((r) => r.conversation.id)

  expect(await getOrCreate()).toBe(conversationId)
  expect(await getOrCreate()).toBe(conversationId) // operation is idempotent
})

test('get or create a conversation with a fid always returns the same conversation', async () => {
  const client = await chat.Client.connect({ apiUrl })

  const conversationFid = utils.getConversationFid()
  await client.createConversation({ id: conversationFid })

  const getOrCreate = () => client.getConversation({ id: conversationFid }).then((r) => r.conversation.id)

  expect(await getOrCreate()).toBe(conversationFid)
  expect(await getOrCreate()).toBe(conversationFid) // operation is idempotent
})

test('get conversation is only allowed for participants', async () => {
  const client = new chat.Client({ apiUrl })

  const user1 = await client.createUser({})
  const user2 = await client.createUser({})
  const user3 = await client.createUser({})

  const { conversation } = await client.createConversation({ 'x-user-key': user1.key })
  await client.addParticipant({ conversationId: conversation.id, 'x-user-key': user1.key, userId: user2.user.id })

  const promise1 = client.getConversation({ id: conversation.id, 'x-user-key': user1.key })
  await expect(promise1).resolves.toBeTruthy()
  const promise2 = client.getConversation({ id: conversation.id, 'x-user-key': user2.key })
  await expect(promise2).resolves.toBeTruthy()
  const promise3 = client.getConversation({ id: conversation.id, 'x-user-key': user3.key })
  await expect(promise3).rejects.toThrow(chat.ForbiddenError)
})
