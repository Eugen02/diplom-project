import { ObjectId } from "mongodb";
import { FiltersFieldsEnum } from "../types/enums/FiltersFields.enum";
import { PaymentTypesEnum } from "../types/enums/PaymentTypes.enum";

export const getFilterFields = (filters: any) => {
  const updatedFilters = Object.keys(filters).reduce((acc, key) => {
    if (
      key === FiltersFieldsEnum.CEREAL_CROPS &&
      filters?.cerealCrops?.length
    ) {
      return { ...acc, cerealCrop: { $in: filters.cerealCrops || [] } };
    }

    if (key === FiltersFieldsEnum.COUNTRY && filters.country) {
      return { ...acc, country: filters.country };
    }

    if (key === FiltersFieldsEnum.STATES && filters?.states?.length) {
      return { ...acc, state: { $in: filters.states || [] } };
    }

    if (
      key === FiltersFieldsEnum.PAYMENT_TYPES &&
      filters?.paymentTypes?.length
    ) {
      if (filters.paymentTypes.includes(PaymentTypesEnum.ANY)) {
        return acc;
      }

      return { ...acc, paymentType: { $in: filters.paymentTypes || [] } };
    }

    if (filters?.currency && key === FiltersFieldsEnum.CURRENCY) {
      return {
        ...acc,
        [`prices.${filters?.currency}`]: {
          $exists: true,
        },
      };
    }

    if (key === "rootPhone" && filters?.rootPhone) {
      return {
        ...acc,
        "contacts.rootPhone": filters?.rootPhone,
      };
    }

    return acc;
  }, {});

  return updatedFilters;
};

export const getTradingFilterFields = (filters: any) => {
  const updatedFilters = Object.keys(filters).reduce((acc, key) => {
    if (
      key === FiltersFieldsEnum.CEREAL_CROPS &&
      filters?.cerealCrops?.length
    ) {
      return {
        ...acc,
        cerealCrop: {
          $in:
            filters?.cerealCrops?.map((id: string) => new ObjectId(id)) || [],
        },
      };
    }

    if (key === FiltersFieldsEnum.COUNTRY && filters.country) {
      return { ...acc, country: filters.country };
    }

    if (key === FiltersFieldsEnum.STATES && filters?.states?.length) {
      return {
        ...acc,
        $or: [{ states: { $in: filters.states } }, { isFullCountry: true }],
      };
    }

    if (
      key === FiltersFieldsEnum.PAYMENT_TYPES &&
      filters?.paymentTypes?.length
    ) {
      if (filters.paymentTypes.includes(PaymentTypesEnum.ANY)) {
        return acc;
      }

      return { ...acc, paymentType: { $in: filters.paymentTypes || [] } };
    }

    if (filters?.currency && key === FiltersFieldsEnum.CURRENCY) {
      return {
        ...acc,
        [`prices.${filters?.currency}`]: {
          $exists: true,
          $gt: 0,
        },
      };
    }

    if (key === "rootPhone" && filters?.rootPhone) {
      return {
        ...acc,
        "contacts.rootPhone": filters?.rootPhone,
      };
    }

    return acc;
  }, {});

  return updatedFilters;
};
