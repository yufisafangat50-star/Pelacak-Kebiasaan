export const formatNumber = (num: number) => {
  if (Number.isInteger(num)) return num.toString();
  return parseFloat(num.toFixed(2)).toString();
};
