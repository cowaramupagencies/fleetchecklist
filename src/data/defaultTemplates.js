/**
 * Seed data for Firestore checklist templates.
 *
 * Item `key` (kebab-case) is normalized to `id` when seeding (see templates.js).
 * Templates in Firestore use `id` on items for checklist results / Settings editor.
 */

function buildWorkplaceEnvironmentCategory(order = 1) {
  return {
    id: 'workplace-environment',
    name: 'Workplace Environment Checklist (Daily)',
    order,
    items: [
      {
        key: 'no-go-zones-marked',
        label: "Are 'no go' zones clearly marked?",
        order: 0,
        active: true,
      },
      {
        key: 'lighting-ventilation',
        label: 'Is there sufficient lighting and ventilation for everyone to work safely?',
        order: 1,
        active: true,
      },
      {
        key: 'excessive-noise',
        label: 'Is there too much other noise (other machinery) that may impair your ability to hear?',
        order: 2,
        active: true,
      },
      {
        key: 'road-surfaces-clear',
        label: 'Are road surfaces even and clear of obstructions?',
        order: 3,
        active: true,
      },
      {
        key: 'overhead-features',
        label: 'Check for any overhead features, fittings, cables or powerlines?',
        order: 4,
        active: true,
      },
      {
        key: 'obstructions-spills',
        label: 'Are there any other obstructions or spills?',
        order: 5,
        active: true,
      },
      {
        key: 'loading-docks-clear',
        label: 'Are loading docks clear?',
        order: 6,
        active: true,
      },
      {
        key: 'storage-racking-capacity',
        label: 'Is there sufficient room or capacity on storage racking?',
        order: 7,
        active: true,
      },
      {
        key: 'forklift-paths-clear',
        label: 'Are forklift operating paths clear?',
        order: 8,
        active: true,
      },
      {
        key: 'congested-blind-spots',
        label: 'Are there any congested areas or blind spots?',
        order: 9,
        active: true,
      },
      {
        key: 'pedestrian-traffic-interaction',
        label: 'Is there any interaction with pedestrians or other traffic?',
        order: 10,
        active: true,
      },
    ],
  };
}

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
      buildWorkplaceEnvironmentCategory(6),
    ],
  };
}

export function buildForkliftTemplate() {
  return {
    name: 'Forklift Checklist',
    vehicleType: 'forklift',
    categories: [
      {
        id: 'forklift-pre-op',
        name: 'Forklift Pre-Operational Checklist (Daily)',
        order: 0,
        items: [
          {
            key: 'keys-removed',
            label: 'Keys — check keys are removed from ignition',
            order: 0,
            active: true,
          },
          {
            key: 'tyres-condition',
            label: 'Tyres — check tyres for wear, damage and pressure (if applicable)',
            order: 1,
            active: true,
          },
          {
            key: 'fluids-levels',
            label: 'Fluids — check oil, hydraulics, battery, fuel, coolant and brake fluid',
            order: 2,
            active: true,
          },
          {
            key: 'seating-condition',
            label: 'Seating — check condition and adjustment',
            order: 3,
            active: true,
          },
          {
            key: 'warning-devices',
            label: 'Warning devices — check lights, horns, reversing beeper and flashing light',
            order: 4,
            active: true,
          },
          {
            key: 'handbrake-on',
            label: 'Handbrake — check handbrake is on (at all times when stationary)',
            order: 5,
            active: true,
          },
          {
            key: 'capacity-plate',
            label: 'Capacity — check that the load capacity date plate is fitted and legible',
            order: 6,
            active: true,
          },
          {
            key: 'mast-chains-guides',
            label: 'Mast — check for any wear or damage to the lift chains and guides',
            order: 7,
            active: true,
          },
          {
            key: 'hydraulic-leaks',
            label: 'Hydraulic cylinders and hoses — check for any leaks',
            order: 8,
            active: true,
          },
          {
            key: 'forklift-tines',
            label: 'Forklift tines — check for wear, damage, cracks or repairs',
            order: 9,
            active: true,
          },
          {
            key: 'seatbelt-condition',
            label: 'Seatbelt — make sure it is in good, working order',
            order: 10,
            active: true,
          },
          {
            key: 'guarding-in-place',
            label: 'Guarding — check all guards are in place',
            order: 11,
            active: true,
          },
          {
            key: 'controls-operation',
            label: 'Controls — check that all pedals and controls operate correctly',
            order: 12,
            active: true,
          },
          {
            key: 'brakes-operation',
            label: 'Brakes — check all brakes (incl park brake) operate correctly',
            order: 13,
            active: true,
          },
        ],
      },
      buildWorkplaceEnvironmentCategory(1),
    ],
  };
}
