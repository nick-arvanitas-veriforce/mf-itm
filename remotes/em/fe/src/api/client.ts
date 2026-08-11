// Client for the EM backend (remotes/em/be).
//
// The remote runs INSIDE the host page, so these are cross-origin requests from
// the host's origin — the API must list that origin in CORS_ALLOWED_ORIGINS.

import type { Worker } from '../workers'

// Vite inlines VITE_* at BUILD time. The dev fallback matches the port the
// backend runs on locally (see the repo README).
const API_URL = (import.meta.env.VITE_EM_API_URL ?? 'http://localhost:5082').replace(/\/$/, '')

export type WorkersQuery = {
  search?: string
  /** 'All' | 'Active' | 'Inactive' — the toolbar's view Select. */
  view?: string
  site?: string | null
  sort?: string
  direction?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export type PagedResult<T> = {
  items: T[]
  /** Size of the FILTERED set, not the page — the table footer needs it for paging. */
  total: number
  page: number
  pageSize: number
}

/**
 * Fetches one page of workers. Filtering, sorting and paging all happen on the
 * server: the roster is not fully loaded into the browser, so the table cannot
 * sort or filter rows it has not been sent.
 */
export async function fetchWorkers(
  query: WorkersQuery,
  signal?: AbortSignal,
): Promise<PagedResult<Worker>> {
  const params = new URLSearchParams()

  // Only send parameters that carry meaning — an empty `search` or a null `site`
  // would otherwise become the literal strings "" and "null" in the query.
  if (query.search?.trim()) params.set('search', query.search.trim())
  if (query.view && query.view !== 'All') params.set('view', query.view.toLowerCase())
  if (query.site) params.set('site', query.site)
  if (query.sort) params.set('sort', query.sort)
  if (query.direction) params.set('direction', query.direction)
  if (query.page !== undefined) params.set('page', String(query.page))
  if (query.pageSize !== undefined) params.set('pageSize', String(query.pageSize))

  return getJson<PagedResult<Worker>>(`/api/workers?${params}`, signal)
}

/** The distinct sites, for the site filter's options. */
export async function fetchSites(signal?: AbortSignal): Promise<string[]> {
  return getJson<string[]>('/api/sites', signal)
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    // Surface the status — a CORS failure and a 500 look identical to the caller
    // otherwise, and they need very different fixes.
    throw new Error(`GET ${path} failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}
