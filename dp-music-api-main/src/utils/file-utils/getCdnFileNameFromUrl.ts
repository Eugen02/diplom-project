export const getCdnFileNameFromUrl = (fileUrl: any): string => {
  const slitted = fileUrl?.logoUrl?.split?.("/");

  return slitted?.[slitted.length - 1];
};
