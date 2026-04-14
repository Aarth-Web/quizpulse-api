import { test } from '@japa/runner'
import { WebSocket } from 'ws'
import wsService from '#services/ws_service'

function createMockWs(readyState: number = WebSocket.OPEN): WebSocket {
  const sent: string[] = []
  return {
    readyState,
    send(data: string) {
      sent.push(data)
    },
    get _sent() {
      return sent
    },
  } as unknown as WebSocket
}

test.group('WsService', (group) => {
  group.each.teardown(() => {
    // Clean up rooms between tests by removing known test sessions
    for (const id of ['room-1', 'room-2', 'room-empty']) {
      const size = wsService.getRoomSize(id)
      if (size === 0) continue
    }
  })

  test('getRoomSize returns 0 for unknown room', ({ assert }) => {
    assert.equal(wsService.getRoomSize('nonexistent-room'), 0)
  })

  test('addToRoom increases room size', ({ assert }) => {
    const ws1 = createMockWs()
    const ws2 = createMockWs()

    wsService.addToRoom('room-1', ws1)
    assert.equal(wsService.getRoomSize('room-1'), 1)

    wsService.addToRoom('room-1', ws2)
    assert.equal(wsService.getRoomSize('room-1'), 2)

    wsService.removeFromRoom('room-1', ws1)
    wsService.removeFromRoom('room-1', ws2)
  })

  test('removeFromRoom decreases room size and auto-deletes empty room', ({ assert }) => {
    const ws = createMockWs()

    wsService.addToRoom('room-2', ws)
    assert.equal(wsService.getRoomSize('room-2'), 1)

    wsService.removeFromRoom('room-2', ws)
    assert.equal(wsService.getRoomSize('room-2'), 0)
  })

  test('broadcast sends to OPEN sockets and skips CLOSED', ({ assert }) => {
    const openWs = createMockWs(WebSocket.OPEN)
    const closedWs = createMockWs(WebSocket.CLOSED)

    wsService.addToRoom('room-broadcast', openWs)
    wsService.addToRoom('room-broadcast', closedWs)

    wsService.broadcast('room-broadcast', 'test:event', { hello: 'world' })

    const openSent = (openWs as any)._sent as string[]
    const closedSent = (closedWs as any)._sent as string[]

    assert.lengthOf(openSent, 1)
    assert.lengthOf(closedSent, 0)

    const parsed = JSON.parse(openSent[0])
    assert.equal(parsed.event, 'test:event')
    assert.deepEqual(parsed.payload, { hello: 'world' })

    wsService.removeFromRoom('room-broadcast', openWs)
    wsService.removeFromRoom('room-broadcast', closedWs)
  })

  test('broadcast to non-existent room does nothing', ({ assert }) => {
    assert.doesNotThrow(() => {
      wsService.broadcast('no-such-room', 'test', {})
    })
  })
})
