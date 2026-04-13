import type { WebSocketServer, WebSocket } from 'ws'
import type { IncomingMessage } from 'node:http'
import jwt from 'jsonwebtoken'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import wsService from '#services/ws_service'

export default function bootWs(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url ?? '', `http://${req.headers.host}`)
    const token = url.searchParams.get('token')
    const sessionId = url.searchParams.get('sessionId')

    if (!token) {
      ws.close(4001, 'Unauthorized')
      return
    }

    let payload: jwt.JwtPayload
    try {
      payload = jwt.verify(token, env.get('JWT_SECRET')) as jwt.JwtPayload
    } catch {
      ws.close(4001, 'Unauthorized')
      return
    }

    if (payload.role === 'guest') {
      ws.close(4003, 'Guests cannot join sessions')
      return
    }

    const userId = payload.sub

    if (!sessionId) {
      ws.close(4002, 'Missing sessionId')
      return
    }

    wsService.addToRoom(sessionId, ws)
    logger.info(`WS client joined room ${sessionId} (size: ${wsService.getRoomSize(sessionId)})`)

    wsService.broadcast(sessionId, 'player:joined', { userId })
    ws.send(JSON.stringify({ event: 'connected', payload: { userId, sessionId } }))

    ws.on('message', (raw) => {
      try {
        const { event, payload: msgPayload } = JSON.parse(raw.toString())
        wsService.broadcast(sessionId, event, msgPayload ?? {})
      } catch {
        logger.warn('WS received malformed message')
      }
    })

    ws.on('close', () => {
      wsService.removeFromRoom(sessionId, ws)
      logger.info(`WS client left room ${sessionId} (size: ${wsService.getRoomSize(sessionId)})`)
      wsService.broadcast(sessionId, 'player:left', { userId })
    })

    ws.on('error', (err) => {
      logger.error(err, `WS error in room ${sessionId}`)
      wsService.removeFromRoom(sessionId, ws)
    })
  })
}
