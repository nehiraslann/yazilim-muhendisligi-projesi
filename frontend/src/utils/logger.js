export const reportClientError = (message, error) => {
  if (!import.meta.env.DEV) return;
  console.error(message, error);
};
