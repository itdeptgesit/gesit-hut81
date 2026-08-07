const { google } = require("googleapis");
const fs = require("fs");

const env = fs.readFileSync(".env.local", "utf-8").split("\n").reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    acc[match[1]] = val;
  }
  return acc;
}, {});

async function setup() {
  try {
    const privateKey = env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    
    // 1. Get spreadsheet info to see existing sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: env.GOOGLE_SHEET_ID,
    });
    
    const existingTitles = spreadsheet.data.sheets.map(s => s.properties.title);
    const requests = [];

    // 2. Add Participants sheet if not exists
    if (!existingTitles.includes("Participants")) {
      requests.push({
        addSheet: {
          properties: {
            title: "Participants",
          }
        }
      });
    }

    // 3. Add Settings sheet if not exists
    if (!existingTitles.includes("Settings")) {
      requests.push({
        addSheet: {
          properties: {
            title: "Settings",
          }
        }
      });
    }

    // Execute batchUpdate to create sheets
    if (requests.length > 0) {
      console.log("Creating sheets...");
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: env.GOOGLE_SHEET_ID,
        requestBody: {
          requests,
        }
      });
    }

    // 4. Update headers in Participants
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: "Participants!A1:K1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          ["Registration ID", "Timestamp", "Name", "Department", "Floor", "Email", "Phone", "Event", "Category", "Partner", "Status"]
        ]
      }
    });

    // 5. Update settings in Settings
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: "Settings!A1:B1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          ["registration_open", "TRUE"]
        ]
      }
    });

    console.log("Setup completed successfully!");

  } catch (err) {
    console.error("ERROR:");
    console.error(err.message);
  }
}

setup();
