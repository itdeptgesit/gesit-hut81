const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8').split('\n').reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    acc[match[1]] = val;
  }
  return acc;
}, {});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { count } = await supabaseAdmin
      .from("participants")
      .select("*", { count: "exact", head: true });

    const nextIdNumber = (count ?? 0) + 1;
    const registration_id = `HUTRI-2026-${String(nextIdNumber).padStart(4, "0")}`;

    console.log("Next ID:", registration_id);

    const { error: insertError } = await supabaseAdmin.from("participants").insert({
      registration_id,
      name: "Test Bug",
      floor: "Lantai 26",
      event: "Badminton Tournament",
      category: "Single Putra",
      status: "Registered",
    });

    if (insertError) throw insertError;
    console.log("Success!");
  } catch (err) {
    console.error("Catch:", err);
  }
}
test();
