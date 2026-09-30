export const DEVICE_TYPES = [
  { value: "pc", label: "Gaming PC", prefix: "PC" },
  { value: "ps5", label: "PS5", prefix: "PS5" },
  { value: "xbox", label: "Xbox", prefix: "Xbox" },
  { value: "other", label: "Other", prefix: "Device" },
];

export const typeMeta = (value) =>
  DEVICE_TYPES.find((t) => t.value === value) ?? DEVICE_TYPES[3];
