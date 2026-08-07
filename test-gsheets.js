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

async function test() {
  try {
    console.log("SHEET_ID:", env.GOOGLE_SHEET_ID);
    console.log("CLIENT_EMAIL:", env.GOOGLE_CLIENT_EMAIL);
    console.log("HAS_PRIVATE_KEY:", !!env.GOOGLE_PRIVATE_KEY);

    // Make sure we unescape the \n string in the private key if it was quoted
    const privateKey = env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    
    console.log("Fetching sheet data...");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: "Participants!A1:K1",
    });

    console.log("SUCCESS!", response.data.values);
  } catch (err) {
    console.error("ERROR:");
    console.error(err.message);
  }
}

test();
