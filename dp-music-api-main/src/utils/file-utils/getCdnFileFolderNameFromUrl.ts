import { FolderEnum } from "../../services/FileService";

export const getCdnFileFolderNameFromUrl = (fileUrl: any): FolderEnum => {
  const slitted = fileUrl?.logoUrl?.split?.("/");

  return slitted?.[slitted.length - 2] as FolderEnum;
};
