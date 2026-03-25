/**
 * Seed data for Firestore checklist templates.
 *
 * Item `key` (kebab-case) is normalized to `id` when seeding (see templates.js).
 * Templates in Firestore use `id` on items for checklist results / Settings editor.
 */

export function buildTruckTemplate() {
  return {
    name: 'Truck Checklist',
    vehicleType: 'truck',
    categories: [
      {
        id: 'general-condition',
        name: 'General Condition',
        order: 0,
        items: [
          {
            key: 'vehicle-clean',
            label: 'Vehicle clean and free of damage',
            order: 0,
            active: true,
          },
          {
            key: 'no-leaks-under-vehicle',
            label: 'No visible leaks under vehicle',
            order: 1,
            active: true,
          },
          {
            key: 'mirrors-clean-adjusted',
            label: 'Mirrors clean and properly adjusted',
            order: 2,
            active: true,
          },
          {
            key: 'windows-clean-unobstructed',
            label: 'Windows clean and unobstructed',
            order: 3,
            active: true,
          },
        ],
      },
      {
        id: 'engine-under-bonnet',
        name: 'Engine / Under Bonnet',
        order: 1,
        items: [
          {
            key: 'engine-oil-level',
            label: 'Engine oil level OK',
            order: 0,
            active: true,
          },
          {
            key: 'coolant-level',
            label: 'Coolant level OK',
            order: 1,
            active: true,
          },
          {
            key: 'brake-fluid-level',
            label: 'Brake fluid level OK',
            order: 2,
            active: true,
          },
          {
            key: 'battery-terminals-clean',
            label: 'Battery secure and terminals clean',
            order: 3,
            active: true,
          },
          {
            key: 'belts-hoses-condition',
            label: 'Belts and hoses in good condition',
            order: 4,
            active: true,
          },
        ],
      },
      {
        id: 'tyres-wheels',
        name: 'Tyres / Wheels',
        order: 2,
        items: [
          {
            key: 'tyre-condition',
            label: 'Tyres in good condition (no damage)',
            order: 0,
            active: true,
          },
          {
            key: 'tyre-pressure-correct',
            label: 'Tyre pressure appears correct',
            order: 1,
            active: true,
          },
          {
            key: 'wheel-nuts-secure',
            label: 'Wheel nuts present and secure',
            order: 2,
            active: true,
          },
        ],
      },
      {
        id: 'lights-electrical',
        name: 'Lights / Electrical',
        order: 3,
        items: [
          {
            key: 'headlights-working',
            label: 'Headlights working',
            order: 0,
            active: true,
          },
          {
            key: 'brake-lights-working',
            label: 'Brake lights working',
            order: 1,
            active: true,
          },
          {
            key: 'indicators-working',
            label: 'Indicators working',
            order: 2,
            active: true,
          },
          {
            key: 'hazard-lights-working',
            label: 'Hazard lights working',
            order: 3,
            active: true,
          },
          {
            key: 'reverse-lights-working',
            label: 'Reverse lights working',
            order: 4,
            active: true,
          },
        ],
      },
      {
        id: 'cab-controls',
        name: 'Cab / Controls',
        order: 4,
        items: [
          {
            key: 'seat-seatbelt-working',
            label: 'Seat and seatbelt working',
            order: 0,
            active: true,
          },
          {
            key: 'horn-working',
            label: 'Horn working',
            order: 1,
            active: true,
          },
          {
            key: 'dashboard-lights-normal',
            label: 'Dashboard lights normal (no warnings)',
            order: 2,
            active: true,
          },
          {
            key: 'steering-feels-normal',
            label: 'Steering feels normal',
            order: 3,
            active: true,
          },
          {
            key: 'brakes-responsive',
            label: 'Brakes responsive',
            order: 4,
            active: true,
          },
        ],
      },
      {
        id: 'safety-equipment',
        name: 'Safety Equipment',
        order: 5,
        items: [
          {
            key: 'fire-extinguisher-present',
            label: 'Fire extinguisher present and secure',
            order: 0,
            active: true,
          },
          {
            key: 'first-aid-kit-present',
            label: 'First aid kit present',
            order: 1,
            active: true,
          },
          {
            key: 'safety-triangles-present',
            label: 'Safety triangles present (if required)',
            order: 2,
            active: true,
          },
        ],
      },
    ],
  };
}

export function buildForkliftTemplate() {
  return {
    name: 'Forklift Checklist',
    vehicleType: 'forklift',
    categories: [
      {
        id: 'fl_mast',
        name: 'Mast & Hydraulics',
        order: 0,
        items: [
          { id: 'f1', label: 'Lift chains and rollers OK', order: 0, active: true },
          { id: 'f2', label: 'Hydraulic hoses not leaking', order: 1, active: true },
          { id: 'f3', label: 'Mast moves smoothly', order: 2, active: true },
        ],
      },
      {
        id: 'fl_ops',
        name: 'Operations & Safety',
        order: 1,
        items: [
          { id: 'f4', label: 'Horn working', order: 0, active: true },
          { id: 'f5', label: 'Brakes responsive', order: 1, active: true },
          { id: 'f6', label: 'Seatbelt / restraint OK', order: 2, active: true },
        ],
      },
      {
        id: 'fl_tires',
        name: 'Forks & Tyres',
        order: 2,
        items: [
          { id: 'f7', label: 'Fork tips not damaged', order: 0, active: true },
          { id: 'f8', label: 'Tyre condition OK', order: 1, active: true },
        ],
      },
    ],
  };
}
