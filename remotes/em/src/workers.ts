// Sample data for the Workers table. Follows guidelines/foundations/data-formatting.md:
// diverse realistic names, @example.com emails, 555-prefixed US numbers, and
// dates relative to the current date.

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

export const workers: Worker[] = [
  { id: 'w-1041', name: 'Priya Raghunathan', email: 'priya.raghunathan@example.com', phone: '(512) 555-0147', employeeId: 'EMP-1041', status: 'active', compliance: 'compliant', role: 'Site Supervisor', site: 'Houston, TX', training: 100, lastActive: '2026-08-11' },
  { id: 'w-1042', name: 'Marcus Adeyemi', email: 'marcus.adeyemi@example.com', phone: '(713) 555-0182', employeeId: 'EMP-1042', status: 'active', compliance: 'expiring', role: 'Millwright', site: 'Houston, TX', training: 82, lastActive: '2026-08-10' },
  { id: 'w-1043', name: 'Sofia Marchetti', email: 'sofia.marchetti@example.com', phone: '(281) 555-0119', employeeId: 'EMP-1043', status: 'active', compliance: 'compliant', role: 'Safety Coordinator', site: 'Baytown, TX', training: 96, lastActive: '2026-08-11' },
  { id: 'w-1044', name: 'Daniel Okonkwo', email: 'daniel.okonkwo@example.com', phone: '(403) 555-0166', employeeId: 'EMP-1044', status: 'pending', compliance: 'expired', role: 'Electrician', site: 'Calgary, AB', training: 41, lastActive: '2026-08-04' },
  { id: 'w-1045', name: 'Hannah Whitfield', email: 'hannah.whitfield@example.com', phone: '(587) 555-0173', employeeId: 'EMP-1045', status: 'active', compliance: 'compliant', role: 'Scaffolder', site: 'Calgary, AB', training: 88, lastActive: '2026-08-09' },
  { id: 'w-1046', name: 'Chen Wei', email: 'chen.wei@example.com', phone: '(604) 555-0128', employeeId: 'EMP-1046', status: 'active', compliance: 'expiring', role: 'Welder', site: 'Burnaby, BC', training: 74, lastActive: '2026-08-08' },
  { id: 'w-1047', name: 'Aaliyah Brooks', email: 'aaliyah.brooks@example.com', phone: '(225) 555-0194', employeeId: 'EMP-1047', status: 'active', compliance: 'compliant', role: 'Instrument Tech', site: 'Baton Rouge, LA', training: 100, lastActive: '2026-08-11' },
  { id: 'w-1048', name: 'Tomás Delgado', email: 'tomas.delgado@example.com', phone: '(956) 555-0151', employeeId: 'EMP-1048', status: 'inactive', compliance: 'expired', role: 'Pipefitter', site: 'Laredo, TX', training: 33, lastActive: '2026-06-19' },
  { id: 'w-1049', name: 'Nadia Haddad', email: 'nadia.haddad@example.com', phone: '(313) 555-0137', employeeId: 'EMP-1049', status: 'active', compliance: 'compliant', role: 'Quality Inspector', site: 'Detroit, MI', training: 91, lastActive: '2026-08-10' },
  { id: 'w-1050', name: 'Owen Fitzgerald', email: 'owen.fitzgerald@example.com', phone: '(216) 555-0142', employeeId: 'EMP-1050', status: 'pending', compliance: 'expiring', role: 'Rigger', site: 'Cleveland, OH', training: 58, lastActive: '2026-08-07' },
  { id: 'w-1051', name: 'Grace Mwangi', email: 'grace.mwangi@example.com', phone: '(469) 555-0188', employeeId: 'EMP-1051', status: 'active', compliance: 'compliant', role: 'Site Supervisor', site: 'Dallas, TX', training: 100, lastActive: '2026-08-11' },
  { id: 'w-1052', name: 'Liam O’Sullivan', email: 'liam.osullivan@example.com', phone: '(972) 555-0163', employeeId: 'EMP-1052', status: 'active', compliance: 'compliant', role: 'Crane Operator', site: 'Dallas, TX', training: 94, lastActive: '2026-08-09' },
  { id: 'w-1053', name: 'Yuki Tanaka', email: 'yuki.tanaka@example.com', phone: '(206) 555-0175', employeeId: 'EMP-1053', status: 'active', compliance: 'expiring', role: 'Boilermaker', site: 'Seattle, WA', training: 69, lastActive: '2026-08-06' },
  { id: 'w-1054', name: 'Rebecca Lindqvist', email: 'rebecca.lindqvist@example.com', phone: '(303) 555-0121', employeeId: 'EMP-1054', status: 'active', compliance: 'compliant', role: 'Safety Coordinator', site: 'Denver, CO', training: 97, lastActive: '2026-08-11' },
  { id: 'w-1055', name: 'Andre Botha', email: 'andre.botha@example.com', phone: '(720) 555-0159', employeeId: 'EMP-1055', status: 'inactive', compliance: 'expired', role: 'Millwright', site: 'Denver, CO', training: 22, lastActive: '2026-05-28' },
  { id: 'w-1056', name: 'Fatima Al-Rashid', email: 'fatima.alrashid@example.com', phone: '(602) 555-0134', employeeId: 'EMP-1056', status: 'active', compliance: 'compliant', role: 'Electrician', site: 'Phoenix, AZ', training: 89, lastActive: '2026-08-10' },
  { id: 'w-1057', name: 'Julien Beaumont', email: 'julien.beaumont@example.com', phone: '(514) 555-0146', employeeId: 'EMP-1057', status: 'active', compliance: 'expiring', role: 'Welder', site: 'Montréal, QC', training: 77, lastActive: '2026-08-08' },
  { id: 'w-1058', name: 'Devon Carter', email: 'devon.carter@example.com', phone: '(404) 555-0192', employeeId: 'EMP-1058', status: 'pending', compliance: 'expired', role: 'Scaffolder', site: 'Atlanta, GA', training: 15, lastActive: '2026-08-05' },
  { id: 'w-1059', name: 'Ingrid Solberg', email: 'ingrid.solberg@example.com', phone: '(651) 555-0177', employeeId: 'EMP-1059', status: 'active', compliance: 'compliant', role: 'Quality Inspector', site: 'Saint Paul, MN', training: 100, lastActive: '2026-08-11' },
  { id: 'w-1060', name: 'Rajesh Patel', email: 'rajesh.patel@example.com', phone: '(732) 555-0125', employeeId: 'EMP-1060', status: 'active', compliance: 'compliant', role: 'Instrument Tech', site: 'Edison, NJ', training: 93, lastActive: '2026-08-09' },
  { id: 'w-1061', name: 'Camille Dubois', email: 'camille.dubois@example.com', phone: '(819) 555-0168', employeeId: 'EMP-1061', status: 'active', compliance: 'expiring', role: 'Pipefitter', site: 'Gatineau, QC', training: 64, lastActive: '2026-08-07' },
  { id: 'w-1062', name: 'Malik Johnson', email: 'malik.johnson@example.com', phone: '(410) 555-0113', employeeId: 'EMP-1062', status: 'active', compliance: 'compliant', role: 'Rigger', site: 'Baltimore, MD', training: 86, lastActive: '2026-08-10' },
  { id: 'w-1063', name: 'Elena Petrova', email: 'elena.petrova@example.com', phone: '(917) 555-0181', employeeId: 'EMP-1063', status: 'active', compliance: 'compliant', role: 'Site Supervisor', site: 'Queens, NY', training: 99, lastActive: '2026-08-11' },
  { id: 'w-1064', name: 'Samuel Nkemelu', email: 'samuel.nkemelu@example.com', phone: '(832) 555-0156', employeeId: 'EMP-1064', status: 'inactive', compliance: 'expired', role: 'Crane Operator', site: 'Houston, TX', training: 48, lastActive: '2026-04-30' },
  { id: 'w-1065', name: 'Mei-Ling Chang', email: 'meiling.chang@example.com', phone: '(408) 555-0139', employeeId: 'EMP-1065', status: 'active', compliance: 'compliant', role: 'Safety Coordinator', site: 'San Jose, CA', training: 95, lastActive: '2026-08-11' },
  { id: 'w-1066', name: 'Cormac Byrne', email: 'cormac.byrne@example.com', phone: '(617) 555-0164', employeeId: 'EMP-1066', status: 'active', compliance: 'expiring', role: 'Boilermaker', site: 'Boston, MA', training: 71, lastActive: '2026-08-06' },
  { id: 'w-1067', name: 'Zainab Osei', email: 'zainab.osei@example.com', phone: '(773) 555-0129', employeeId: 'EMP-1067', status: 'active', compliance: 'compliant', role: 'Electrician', site: 'Chicago, IL', training: 90, lastActive: '2026-08-10' },
  { id: 'w-1068', name: 'Victor Almeida', email: 'victor.almeida@example.com', phone: '(305) 555-0171', employeeId: 'EMP-1068', status: 'pending', compliance: 'expiring', role: 'Welder', site: 'Miami, FL', training: 52, lastActive: '2026-08-08' },
  { id: 'w-1069', name: 'Astrid Nilsson', email: 'astrid.nilsson@example.com', phone: '(503) 555-0148', employeeId: 'EMP-1069', status: 'active', compliance: 'compliant', role: 'Millwright', site: 'Portland, OR', training: 98, lastActive: '2026-08-11' },
  { id: 'w-1070', name: 'Kwame Mensah', email: 'kwame.mensah@example.com', phone: '(614) 555-0183', employeeId: 'EMP-1070', status: 'active', compliance: 'compliant', role: 'Quality Inspector', site: 'Columbus, OH', training: 92, lastActive: '2026-08-09' },
  { id: 'w-1071', name: 'Isabelle Rousseau', email: 'isabelle.rousseau@example.com', phone: '(418) 555-0117', employeeId: 'EMP-1071', status: 'active', compliance: 'expiring', role: 'Instrument Tech', site: 'Québec, QC', training: 67, lastActive: '2026-08-07' },
  { id: 'w-1072', name: 'Trevor Osborne', email: 'trevor.osborne@example.com', phone: '(702) 555-0195', employeeId: 'EMP-1072', status: 'inactive', compliance: 'expired', role: 'Scaffolder', site: 'Las Vegas, NV', training: 29, lastActive: '2026-06-02' },
  { id: 'w-1073', name: 'Amara Chukwu', email: 'amara.chukwu@example.com', phone: '(919) 555-0152', employeeId: 'EMP-1073', status: 'active', compliance: 'compliant', role: 'Pipefitter', site: 'Raleigh, NC', training: 87, lastActive: '2026-08-10' },
  { id: 'w-1074', name: 'Henrik Larsen', email: 'henrik.larsen@example.com', phone: '(414) 555-0126', employeeId: 'EMP-1074', status: 'active', compliance: 'compliant', role: 'Crane Operator', site: 'Milwaukee, WI', training: 100, lastActive: '2026-08-11' },
  { id: 'w-1075', name: 'Lucia Fernández', email: 'lucia.fernandez@example.com', phone: '(210) 555-0179', employeeId: 'EMP-1075', status: 'active', compliance: 'expiring', role: 'Rigger', site: 'San Antonio, TX', training: 73, lastActive: '2026-08-06' },
]
