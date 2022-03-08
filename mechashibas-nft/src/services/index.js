export const getSignature = async (address) => {
  const response = await fetch(`/signature/${address}`);
  return await response.json();
};
