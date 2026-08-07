import { google } from "googleapis";

// Define the scopes
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

// We authenticate via JWT using the environment variables
const getAuthClient = () => {
  return new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: SCOPES
  });
};

export const getSheetsInstance = () => {
  const auth = getAuthClient();
  return google.sheets({ version: "v4", auth });
};

export const getSheetData = async (range: string) => {
  try {
    const sheets = getSheetsInstance();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
    });
    return response.data.values || [];
  } catch (error) {
    console.error("Error reading from Google Sheets:", error);
    throw error;
  }
};

export const appendSheetData = async (range: string, values: any[][]) => {
  try {
    const sheets = getSheetsInstance();
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error appending to Google Sheets:", error);
    throw error;
  }
};
