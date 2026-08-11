import { useEffect, useState } from 'react'

import { fetchWorkers, type PagedResult, type WorkersQuery } from './client'
import type { Worker } from '../workers'

export type WorkersState = {
  workers: Worker[]
  /** Size of the filtered set — the pagination footer counts against this, not items.length. */
  total: number
  loading: boolean
  error: string | null
}

/**
 * Loads a page of workers, refetching whenever the query changes.
 *
 * Every filter/sort/page change is a round trip, so an in-flight request is
 * aborted when the query changes again — without that, a slow early response can
 * land after a fast later one and overwrite the newer results.
 */
export function useWorkers(query: WorkersQuery): WorkersState {
  const [state, setState] = useState<WorkersState>({
    workers: [],
    total: 0,
    loading: true,
    error: null,
  })

  // Destructured because the caller builds `query` inline: a new object every
  // render would re-run this effect forever if used as the dependency.
  const { search, view, site, sort, direction, page, pageSize } = query

  useEffect(() => {
    const controller = new AbortController()

    // Keep the previous rows visible while refetching — blanking the table on
    // every keystroke makes the list flash.
    setState((current) => ({ ...current, loading: true, error: null }))

    fetchWorkers({ search, view, site, sort, direction, page, pageSize }, controller.signal)
      .then((result: PagedResult<Worker>) => {
        setState({ workers: result.items, total: result.total, loading: false, error: null })
      })
      .catch((error: unknown) => {
        // An abort is this effect cleaning up after itself, not a failure to report.
        if (controller.signal.aborted) return
        setState({
          workers: [],
          total: 0,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load workers.',
        })
      })

    return () => controller.abort()
  }, [search, view, site, sort, direction, page, pageSize])

  return state
}
