import { buildForkliftTemplate, buildTruckTemplate } from '../data/defaultTemplates.js';
import { normalizeTemplateCategories } from '../services/templates.js';

/**
 * Checklist template for UI + buildResultsFromTemplate: { name, vehicleType, categories }.
 * Prefers embedded `vehicle.checklistTemplate` from creation; otherwise local defaults.
 */
export function resolveChecklistTemplateForVehicle(vehicle) {
  if (!vehicle) return null;

  const embedded = vehicle.checklistTemplate;
  if (embedded?.categories?.length) {
    return {
      name: embedded.name || (vehicle.type === 'forklift' ? 'Forklift Checklist' : 'Truck Checklist'),
      vehicleType: embedded.vehicleType || vehicle.type,
      categories: embedded.categories,
    };
  }

  const built = vehicle.type === 'forklift' ? buildForkliftTemplate() : buildTruckTemplate();
  return {
    name: built.name,
    vehicleType: built.vehicleType,
    categories: normalizeTemplateCategories(built.categories),
  };
}

/**
 * Build embedded template payload for new vehicles (Firestore-safe shape).
 */
export function buildEmbeddedChecklistTemplateForType(type) {
  const built = type === 'forklift' ? buildForkliftTemplate() : buildTruckTemplate();
  return {
    name: built.name,
    vehicleType: built.vehicleType,
    categories: normalizeTemplateCategories(built.categories),
  };
}
