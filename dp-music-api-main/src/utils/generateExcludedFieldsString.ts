export const generateExcludedFieldsString = (fields: string[]) => {
  return fields.reduce((acc, field) => {
    return `${acc} -${field}`;
  }, "");
};
