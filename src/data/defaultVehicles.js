/**
 * Cowaramup fleet forklifts — seeded per user when missing (by registrationId).
 */
export const DEFAULT_FORKLIFTS = [
  {
    name: 'AU33516',
    type: 'forklift',
    registrationId: 'AU33516',
    imageUrl: '/forklift-cartoon-yellow.svg',
    notes: 'Cowaramup forklift',
  },
  {
    name: 'AU4537',
    type: 'forklift',
    registrationId: 'AU4537',
    imageUrl: '/forklift-cartoon-red.svg',
    notes: 'Cowaramup forklift',
  },
];

export const COWARAMUP_FORKLIFT_REGS = new Set(
  DEFAULT_FORKLIFTS.map((v) => v.registrationId.trim().toUpperCase())
);
