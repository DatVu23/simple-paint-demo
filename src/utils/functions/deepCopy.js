export const deepCopy = input => {
  const output = Array.isArray(input) ? [] : {};

  for (const key in input) {
    const value = input[key];
    output[key] = typeof value === "object" ? deepCopy(value) : value;
  }

  return output;
};
