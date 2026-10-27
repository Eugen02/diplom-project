export const checkFieldTypes = (
  obj: any,
  fieldTypes: "string" | "number" | "boolean"
): boolean => {
  const objectValues = Object.values(obj);

  const isIncludesWrongType = objectValues.every((value: any) => {
    if (value === undefined) {
      return true;
    }

    return typeof value === fieldTypes;
  });

  return !isIncludesWrongType;
};
