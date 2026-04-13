import type { ApplicationService } from '@adonisjs/core/types'
import { WebSocketServer } from 'ws'
import logger from '@adonisjs/core/services/logger'

export default class WsProvider {
  constructor(protected app: ApplicationService) {}

  async ready() {
    const server = await this.app.container.make('server')
    const httpServer = server.getNodeServer()
    if (!httpServer) return

    const wss = new WebSocketServer({ server: httpServer })
    const { default: bootWs } = await import('../start/ws.js')
    bootWs(wss)

    logger.info('WS server attached to HTTP server')
  }
}
