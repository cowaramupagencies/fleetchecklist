/** Default emoji when none chosen (no photo). */
export function defaultEmojiForVehicleType(type) {
  return type === 'forklift' ? '🚜' : '🚛';
}

/**
 * Shown when there is no image: custom emoji, else type default.
 */
export function vehicleDisplayEmoji(vehicle) {
  if (!vehicle) return '🚛';
  const custom = typeof vehicle.emoji === 'string' ? vehicle.emoji.trim() : '';
  if (custom) return custom;
  return defaultEmojiForVehicleType(vehicle.type);
}
