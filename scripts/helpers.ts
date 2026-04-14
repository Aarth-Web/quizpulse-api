import WebSocket from 'ws'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3333/api/v1'
const WS_URL = process.env.WS_URL || 'ws://localhost:3333'

const GREEN = '\x1b[32m'
const RED = '\x1b[31m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

let passCount = 0
let failCount = 0

export function assert(condition: boolean, label: string) {
  if (condition) {
    passCount++
    console.log(`  ${GREEN}PASS${RESET} ${label}`)
  } else {
    failCount++
    console.log(`  ${RED}FAIL${RESET} ${label}`)
    throw new Error(`Assertion failed: ${label}`)
  }
}

export function section(name: string) {
  console.log(`\n${BOLD}${YELLOW}--- ${name} ---${RESET}`)
}

export function summary() {
  console.log(`\n${BOLD}Results: ${GREEN}${passCount} passed${RESET}, ${failCount > 0 ? RED : ''}${failCount} failed${RESET}`)
  return failCount === 0
}

export async function api(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  token?: string
): Promise<{ status: number; data: any }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const json = await res.json().catch(() => ({}))
  return { status: res.status, data: json }
}

interface WsClient {
  ws: WebSocket
  events: Array<{ event: string; payload: any }>
  waitForEvent: (name: string, timeoutMs?: number) => Promise<any>
  close: () => void
}

export function connectWs(token: string, sessionId: string): Promise<WsClient> {
  return new Promise((resolve, reject) => {
    const url = `${WS_URL}?token=${token}&sessionId=${sessionId}`
    const ws = new WebSocket(url)
    const events: Array<{ event: string; payload: any }> = []
    const listeners: Map<string, Array<(payload: any) => void>> = new Map()

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString())
        events.push(msg)
        const waiting = listeners.get(msg.event)
        if (waiting && waiting.length > 0) {
          const cb = waiting.shift()!
          cb(msg.payload)
        }
      } catch {}
    })

    ws.on('open', () => {
      resolve({
        ws,
        events,
        waitForEvent(name: string, timeoutMs = 5000): Promise<any> {
          const existing = events.find((e) => e.event === name)
          if (existing) {
            events.splice(events.indexOf(existing), 1)
            return Promise.resolve(existing.payload)
          }

          return new Promise((res, rej) => {
            const timer = setTimeout(() => rej(new Error(`Timeout waiting for WS event: ${name}`)), timeoutMs)
            if (!listeners.has(name)) listeners.set(name, [])
            listeners.get(name)!.push((payload) => {
              clearTimeout(timer)
              res(payload)
            })
          })
        },
        close() {
          ws.close()
        },
      })
    })

    ws.on('error', reject)

    setTimeout(() => reject(new Error('WS connection timeout')), 5000)
  })
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function randomEmail() {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.com`
}
