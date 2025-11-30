export const EVENT_TYPES = [
  { value: "milonga", label: "Milonga", icon: "🎶" },
  { value: "practica", label: "Practica", icon: "🎯" },
  { value: "workshop", label: "Workshop", icon: "📚" },
  { value: "class", label: "Class", icon: "👨‍🏫" },
  { value: "festival", label: "Festival", icon: "🎉" },
  { value: "marathon", label: "Marathon", icon: "🏃" },
  { value: "encuentro", label: "Encuentro", icon: "🤝" },
  { value: "performance", label: "Performance", icon: "🎭" },
  { value: "show", label: "Show", icon: "🎬" },
  { value: "social", label: "Social", icon: "💃" },
  { value: "competition", label: "Competition", icon: "🏆" },
  { value: "concert", label: "Concert", icon: "🎵" },
  { value: "online", label: "Online", icon: "💻" },
];

export const EVENT_TYPE_VALUES = EVENT_TYPES.map(t => t.value);

export function getEventTypeLabel(value: string): string {
  return EVENT_TYPES.find(t => t.value === value)?.label || value;
}

export function getEventTypeIcon(value: string): string {
  return EVENT_TYPES.find(t => t.value === value)?.icon || "";
}
