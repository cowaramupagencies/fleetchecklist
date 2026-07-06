import { buildForkliftTemplate, buildTruckTemplate } from '../data/defaultTemplates.js';
import {
  getTemplateByType,
  isUpToDateForkliftTemplate,
  normalizeTemplateCategories,
  refreshTemplateFromBuiltIn,
} from '../services/templates.js';

function defaultNameForType(type) {
  return type === 'forklift' ? 'Forklift Checklist' : 'Truck Checklist';
}

function shapeTemplate(source, vehicleType) {
  if (!source?.categories?.length) return null;
  return {
    name: source.name || defaultNameForType(vehicleType),
    vehicleType: source.vehicleType || vehicleType,
    categories: source.categories,
  };
}

function builtInTemplateForType(type) {
  const built = type === 'forklift' ? buildForkliftTemplate() : buildTruckTemplate();
  return {
    name: built.name,
    vehicleType: built.vehicleType,
    categories: normalizeTemplateCategories(built.categories),
  };
}

/**
 * Live checklist template: Settings (Firestore) → built-in defaults → embedded snapshot.
 * Stale forklift templates (old 3-item version) are auto-upgraded in Firestore.
 */
export async function resolveChecklistTemplateForVehicle(uid, vehicle) {
  if (!vehicle) return null;

  const type = vehicle.type === 'forklift' ? 'forklift' : 'truck';

  if (uid) {
    const fromSettings = await getTemplateByType(uid, type);

    if (type === 'forklift' && fromSettings && !isUpToDateForkliftTemplate(fromSettings)) {
      await refreshTemplateFromBuiltIn(uid, 'forklift');
      return builtInTemplateForType('forklift');
    }

    const shaped = shapeTemplate(fromSettings, type);
    if (shaped) return shaped;
  }

  if (type === 'forklift') {
    const embedded = shapeTemplate(vehicle.checklistTemplate, type);
    if (embedded && isUpToDateForkliftTemplate(vehicle.checklistTemplate)) {
      return embedded;
    }
    return builtInTemplateForType('forklift');
  }

  const embedded = shapeTemplate(vehicle.checklistTemplate, type);
  if (embedded) return embedded;

  return builtInTemplateForType(type);
}

/**
 * Snapshot for new vehicles: Settings template when seeded, otherwise built-in defaults.
 */
export async function buildEmbeddedChecklistTemplateForType(uid, type) {
  const vehicleType = type === 'forklift' ? 'forklift' : 'truck';

  if (uid) {
    const fromSettings = await getTemplateByType(uid, vehicleType);

    if (vehicleType === 'forklift' && fromSettings && !isUpToDateForkliftTemplate(fromSettings)) {
      return builtInTemplateForType('forklift');
    }

    const shaped = shapeTemplate(fromSettings, vehicleType);
    if (shaped) return shaped;
  }

  return builtInTemplateForType(vehicleType);
}
