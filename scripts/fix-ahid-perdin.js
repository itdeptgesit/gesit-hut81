const { createClient } = require("@supabase/supabase-js");
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

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function fix() {
  const { data } = await sb.from("teams").select("*").eq("team_id", "TEAM-FGD-05").single();
  const old = data.members;
  console.log("Sebelum:", old);

  // Fix: pindah (PERDIN) ke akhir nama lengkap
  const fixed = old.replace("Ahid Suria (PERDIN) Nandya", "Ahid Suria Nandya (PERDIN)");
  console.log("Sesudah:", fixed);

  const { error } = await sb.from("teams").update({ members: fixed }).eq("team_id", "TEAM-FGD-05");
  if (error) console.error("Error:", error);
  else console.log("✅ Berhasil diperbaiki!");
}

fix();
