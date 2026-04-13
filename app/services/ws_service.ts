import { WebSocket } from 'ws'

class WsService {
  private rooms: Map<string, Set<WebSocket>> = new Map()

  addToRoom(sessionId: string, ws: WebSocket): void {
    let room = this.rooms.get(sessionId)
    if (!room) {
      room = new Set()
      this.rooms.set(sessionId, room)
    }
    room.add(ws)
  }

  removeFromRoom(sessionId: string, ws: WebSocket): void {
    const room = this.rooms.get(sessionId)
    if (!room) return

    room.delete(ws)
    if (room.size === 0) {
      this.rooms.delete(sessionId)
    }
  }

  broadcast(sessionId: string, event: string, payload: object): void {
    const room = this.rooms.get(sessionId)
    if (!room) return

    const message = JSON.stringify({ event, payload })
    for (const ws of room) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    }
  }

  getRoomSize(sessionId: string): number {
    return this.rooms.get(sessionId)?.size ?? 0
  }
}

export default new WsService()
