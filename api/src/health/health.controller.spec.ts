import { ServiceUnavailableException } from '@nestjs/common'
import type { Pool } from 'pg'
import {
  HEALTH_READY_QUERY_TIMEOUT_MS,
  HealthController,
} from './health.controller'

describe('HealthController', () => {
  const query = jest.fn()
  const controller = new HealthController({ query } as unknown as Pool)

  beforeEach(() => {
    query.mockReset()
  })

  it('keeps liveness independent from the database', () => {
    expect(controller.check()).toEqual({ status: 'ok' })
    expect(query).not.toHaveBeenCalled()
  })

  it('probes the database with a short timeout for readiness', async () => {
    query.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })

    await expect(controller.ready()).resolves.toEqual({ status: 'ready' })
    expect(query).toHaveBeenCalledWith({
      text: 'SELECT 1',
      query_timeout: HEALTH_READY_QUERY_TIMEOUT_MS,
    })
  })

  it('reports service unavailable when the database probe fails', async () => {
    query.mockRejectedValueOnce(new Error('database unavailable'))

    await expect(controller.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    )
  })
})
