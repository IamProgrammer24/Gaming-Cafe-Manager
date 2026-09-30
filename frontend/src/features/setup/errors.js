// Turns the server's error into a sentence an owner can act on.
export function deviceErrorMessage(err) {
  if (err.code === "DUPLICATE_VALUE")
    return "A device with this name already exists.";

  if (err.code === "DEVICE_NAME_CONFLICT" && Array.isArray(err.details)) {
    const shown = err.details.slice(0, 5).join(", ");
    const more = err.details.length > 5 ? " and more" : "";
    return `These names already exist: ${shown}${more}. Change the prefix or the starting number.`;
  }

  if (err.code === "VALIDATION_ERROR" && Array.isArray(err.details)) {
    return err.details.map((d) => d.message).join(". ");
  }
  return err.message;
}
