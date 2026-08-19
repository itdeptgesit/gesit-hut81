// Script: Update Ahid Suria di Kelompok 5 → tambah tag (PERDIN)
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

// Baca .env.local manual seperti test.js
const env = fs.readFileSync(".env.local", "utf-8").split("\n").reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    acc[match[1]] = val;
  }
  return acc;
}, {});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Ambil semua team
  const { data: allTeams, error } = await supabase
    .from("teams")
    .select("*")
    .order("team_id");

  if (error) { console.error("Error fetch:", error); process.exit(1); }

  console.log("Semua team:");
  allTeams.forEach(t => console.log(` - [${t.team_id}] ${t.team_name}`));

  // Cari Kelompok 5
  const team5 = allTeams.find(t =>
    t.team_name?.toLowerCase().includes("kelompok 5") ||
    t.team_name?.toLowerCase().includes("group 5") ||
    t.team_name?.toLowerCase() === "5"
  );

  if (!team5) {
    console.error("\n❌ Kelompok 5 tidak ditemukan! Cek nama team di atas.");
    process.exit(1);
  }

  console.log(`\n✅ Kelompok 5 ditemukan: "${team5.team_name}" [ID: ${team5.team_id}]`);
  console.log("Members saat ini:\n", team5.members);

  const oldMembers = team5.members || "";

  if (!oldMembers.toLowerCase().includes("ahid")) {
    console.error("\n❌ Nama 'Ahid' tidak ditemukan di members Kelompok 5!");
    process.exit(1);
  }

  // Ganti: "Ahid Suria" → "Ahid Suria (PERDIN)" (hindari double tag)
  const newMembers = oldMembers.replace(
    /Ahid\s+Suria(?!\s*\(PERDIN\))/gi,
    "Ahid Suria (PERDIN)"
  );

  if (newMembers === oldMembers) {
    console.log("\n⚠️ Ahid Suria sudah memiliki tag (PERDIN), tidak ada perubahan.");
    process.exit(0);
  }

  console.log("\nMembers baru:\n", newMembers);

  const { error: updateError } = await supabase
    .from("teams")
    .update({ members: newMembers })
    .eq("team_id", team5.team_id);

  if (updateError) {
    console.error("\n❌ Gagal update:", updateError);
    process.exit(1);
  }

  console.log("\n✅ Berhasil! Ahid Suria ditandai (PERDIN) di Kelompok 5.");
}

main();
