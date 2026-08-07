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

    // 3. Prepare data rows (Headers + Dummy Data with Event column)
    const rows = [
      ["Event", "Kategori", "Posisi", "Nama_Tim"],
      ["Badminton Tournament", "Single Putra", "Penyisihan 1", "Yohanes Donny Triatmoko - Lantai 26"],
      ["Badminton Tournament", "Single Putra", "Penyisihan 2", "Agus Setiawan - Lantai 27"],
      ["Badminton Tournament", "Single Putra", "Penyisihan", "Aldi Maulana - Lantai 26"],
      ["Badminton Tournament", "Single Putra", "Penyisihan", "Budi Santoso - Lantai 27"],
      ["Badminton Tournament", "Single Putra", "Juara 1", "Yohanes Donny Triatmoko - Lantai 26"],
      ["Badminton Tournament", "Single Putra", "Juara 2", "Agus Setiawan - Lantai 27"],
      ["Badminton Tournament", "Single Putra", "Juara 3", "Aldi Maulana - Lantai 26"],
      ["Badminton Tournament", "Ganda Campuran", "Juara 1", "Aldi & Vanesha - Lantai 26"],
      ["Fun Games Day", "Yel-Yel Kemerdekaan", "Best Performance", "Kelompok 3"],
      ["Fun Games Day", "Best Costume", "Terkreatif", "Kelompok 5"],
    ];

    console.log("Updating Winners data (now with Event column)...");
    
    // Clear old data
    await sheets.spreadsheets.values.clear({
        spreadsheetId: env.GOOGLE_SHEET_ID,
        range: "Winners!A:D"
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: "Winners!A1:D" + rows.length,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows
      }
    });

    console.log("Winners setup completed successfully!");

  } catch (err) {
    console.error("ERROR:");
    console.error(err.message);
  }
}

setup();
