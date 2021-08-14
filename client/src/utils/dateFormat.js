export const dateToTimeString = (unixTimestamp) => (
  unixTimestamp == 0 ? "N/A" : new Date(unixTimestamp * 1000).toUTCString()
);