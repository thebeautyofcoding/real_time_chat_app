export const url = (urlPath: string): string => {
  console.log(process.env.VUE_APP_BASE_URL)
  return process.env.VUE_APP_BASE_URL+ urlPath;
  }
