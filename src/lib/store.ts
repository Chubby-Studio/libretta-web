// The App Store listing. Fill APP_STORE_ID (the number in the App Store URL) when the pre-order
// opens: every page then shows Safari's App Store banner and the structured data links the app.
export const APP_STORE_ID = "";

export const appStoreURL = APP_STORE_ID ? `https://apps.apple.com/app/id${APP_STORE_ID}` : undefined;
