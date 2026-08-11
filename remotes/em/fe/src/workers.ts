// The Worker wire type and its display maps.
//
// This file used to also hold the sample rows; those now live in the EM
// backend's seeder (remotes/em/be/Data/EmSeeder.cs) and reach the page over
// /api/workers. What stays here describes the SHAPE the API returns, which it
// serialises to match ('active', 'expiring', …), so the label and colour maps
// below apply unchanged to fetched data.

export type WorkerStatus = 'active' | 'pending' | 'inactive'
export type ComplianceStatus = 'compliant' | 'expiring' | 'expired'

export type Worker = {
  id: string
  name: string
  email: string
  phone: string
  employeeId: string
  status: WorkerStatus
  compliance: ComplianceStatus
  role: string
  site: string
  /** 0-100, rendered by the ProgressCell stand-in. */
  training: number
  /** ISO date; formatted MMM DD, YYYY at render. */
  lastActive: string
}

export const statusLabels: Record<WorkerStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  inactive: 'Inactive',
}

// Active/inactive is a chip colored success / default; compliance carries
// severity (success / error / warning). Green = good, red = problem,
// yellow = needs attention.
export const statusColors: Record<WorkerStatus, 'success' | 'warning' | 'default'> = {
  active: 'success',
  pending: 'warning',
  inactive: 'default',
}

export const complianceLabels: Record<ComplianceStatus, string> = {
  compliant: 'Compliant',
  expiring: 'Expiring soon',
  expired: 'Expired',
}

export const complianceColors: Record<ComplianceStatus, 'success' | 'warning' | 'error'> = {
  compliant: 'success',
  expiring: 'warning',
  expired: 'error',
}
