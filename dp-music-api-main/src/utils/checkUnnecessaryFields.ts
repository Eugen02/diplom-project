export const checkUnnecessaryFields = (obj: object, validFields: string[]) => {
  const objKeys = Object.keys(obj);

  const unnecessaryFields = objKeys.filter(
    (field) => !validFields.includes(field)
  );

  return unnecessaryFields.length > 0;
};
