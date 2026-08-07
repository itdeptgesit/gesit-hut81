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

const teamsData = [
  {
    name: "Kelompok 1",
    members: [
      "Aldi Maulana", "Retno Widiyati", "Vanesha Valentina", "Ety Sumiaty", 
      "Yohanes Donny Triatmoko", "Pratiwi", "Winda Amelia Furqoni", 
      "Katherine Herviana Sumantri", "Andi Septiandi", "Ryandhi Widjaya", "Muhammad Zakky Alif"
    ]
  },
  {
    name: "Kelompok 2",
    members: [
      "Sylvia", "Hansdi Putra Adinata", "Afif Rivai", "Winarti", "Dimas Andi Nugroho", 
      "Petrus Voki Cahyadi", "Muhammad Susilo", "Muchammad Tunggul Buono", 
      "Ahmad Yunus", "Dwi Ibnu Afrikanto", "Marissa Theodora Massang"
    ]
  },
  {
    name: "Kelompok 3",
    members: [
      "Novita Ariani Sitorus", "Titis Gayuh Jayati", "Yohan Alamsyah", "Aldo Sastra", 
      "Nancy Dunda", "Nabillah Saroh Afifah", "Hilia Annisa Putri", "Aldri Herdian", 
      "Coraevi", "Parawinata Naidi Gaing"
    ]
  },
  {
    name: "Kelompok 4",
    members: [
      "Salma Sanniyah Safinatunnajah", "Abdul Wahid Ramdoni", "Julhan Sabani", "Dinny Anggraini", 
      "Said Uwais", "Desi Rahmuni", "Mian", "Suryadi", "Andri Widiyanto", 
      "Fathul Jannah", "Luhut Pardamean Manik"
    ]
  },
  {
    name: "Kelompok 5",
    members: [
      "Afirlinka Nisrina", "Novitasari Siregar", "Ezra Farabi Umar", "Stephanie Yaputra", 
      "Mazhar Andrian", "Irsyad Mubarok", "Avisa Regina Cahyaningrum", "Ahid Suria Nandya", 
      "Yudha Budiman Achmad", "Ananda Ruby Nurcantika", "Yosep Roni Simarmata"
    ]
  },
  {
    name: "Kelompok 6",
    members: [
      "Nathalia Lisi Yohanes", "Yudha Prabowo", "Andi Raniadhi", "Hana Trijayanti", 
      "Juan Novsky Yunus Prayoga", "Maradona Parhorasan Manurung", "Loi Emarson", 
      "Sinta Wahyuputri", "Romli", "Rahmat Hidayat Hengky Saputra"
    ]
  },
  {
    name: "Kelompok 7",
    members: [
      "Eliaanti Christine", "Argadana Abdul Aziz Sukron", "Priscilia Angsari", "Harvey Kurniawan", 
      "Hadly Robbianza", "Heni", "Stefanini", "Muh. Surhamzah", "Adriana Neysa Yulita Sutanto", 
      "Thomas Tony Irawan", "Edel Trudis Uto"
    ]
  },
  {
    name: "Kelompok 8",
    members: [
      "Rizki Meisara Rosadi", "Juni Baktius", "Rizcky Wishaputra Basnapal", "Pipin Syaripin", 
      "Merly Miselly", "Nike Destia", "Hilaluddin", "Rayviansyah Andika Aulia", 
      "Sariana", "Puji Setiyatno"
    ]
  }
];

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
    
    // 2. Add Teams sheet if not exists
    if (!existingTitles.includes("Teams")) {
      console.log("Creating Teams sheet...");
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: env.GOOGLE_SHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Teams",
                }
              }
            }
          ],
        }
      });
    } else {
        console.log("Teams sheet already exists. Will overwrite data.");
    }

    // 3. Prepare data rows
    const rows = [
      ["team_id", "team_name", "event", "captain", "members", "status"]
    ];

    teamsData.forEach((team, idx) => {
        const id = `TEAM-FGD-${String(idx + 1).padStart(2, "0")}`;
        const captain = team.members[0];
        const membersStr = team.members.join(", ");
        rows.push([id, team.name, "Fun Games Day", captain, membersStr, "Registered"]);
    });

    // 4. Update data in Teams sheet (clear first, then update)
    console.log("Updating Teams data...");
    
    // Clear old data first just in case
    await sheets.spreadsheets.values.clear({
        spreadsheetId: env.GOOGLE_SHEET_ID,
        range: "Teams!A:F"
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range: "Teams!A1:F" + rows.length,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: rows
      }
    });

    console.log("Teams setup completed successfully!");

  } catch (err) {
    console.error("ERROR:");
    console.error(err.message);
  }
}

setup();
