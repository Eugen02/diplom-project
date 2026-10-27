export const getSorts = ({ date, amount, price, filters }: any): any => {
  const createdAt = date === "asc" ? 1 : -1;
  const amountSort = amount === "asc" ? 1 : -1;
  const priceSort = price === "asc" ? 1 : -1;

  if (amount) {
    return {
      amount: amountSort,
    };
  }

  if (price && filters?.currency) {
    return { [`prices.${filters.currency}`]: priceSort };
  }

  return { createdAt: createdAt };
};

export const getTradingSorts = ({
  date,
  amount,
  price,
  currency,
}: any): any => {
  const createdAt = date === "asc" ? 1 : -1;
  const amountSort = amount === "asc" ? 1 : -1;
  const priceSort = price === "asc" ? 1 : -1;

  if (amount) {
    return {
      amount: amountSort,
    };
  }

  if (price && currency) {
    return { [`prices.${currency}`]: priceSort };
  }

  if (date) {
    return { updatedAtByUser: createdAt };
  }

  return { updatedAtByUser: -1 };
};
