import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.q1_overall || !data.q11_future) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('event_feedback')
      .insert([
        {
          participant_name: data.participant_name,
          participant_floor: data.participant_floor,
          q1_overall: data.q1_overall,
          q2_variety: data.q2_variety,
          q3_food: data.q3_food,
          ...(data.q4_facility != null && { q4_facility: data.q4_facility }),
          ...(data.q5_prizes != null && { q5_prizes: data.q5_prizes }),
          q6_togetherness: data.q6_togetherness,
          q7_values: data.q7_values,
          q8_pride: data.q8_pride,
          q9_networking: data.q9_networking,
          ...(data.q10_motivation != null && { q10_motivation: data.q10_motivation }),
          q11_future: data.q11_future,
          feedback_liked: data.feedback_liked,
          feedback_improve: data.feedback_improve,
          feedback_ideas: data.feedback_ideas
        }
      ]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Feedback berhasil dikirim' }, { status: 201 });
  } catch (error: any) {
    console.error('Error inserting feedback:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('event_feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
