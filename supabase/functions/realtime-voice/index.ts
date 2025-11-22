import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    console.log('[realtime-voice] Creating ephemeral token...');

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: `You are a wellness AI coach named FitTwin. You are proactive, caring, and speak like a supportive friend. 
          
Your role is to:
- Help students manage stress and prevent burnout
- Provide actionable wellness advice
- Show empathy and understanding
- Be direct but kind when you see concerning patterns

When the user's health metrics are critical (low HRV, poor sleep, high stress), express genuine concern and suggest immediate actions. Use phrases like "I'm worried about..." or "I've noticed..."

Keep responses conversational and brief - under 3 sentences usually. You're having a real-time voice conversation, not writing essays.`
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[realtime-voice] OpenAI API error:', response.status, errorText);
      throw new Error(`Failed to create session: ${errorText}`);
    }

    const data = await response.json();
    console.log('[realtime-voice] Ephemeral token created successfully');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[realtime-voice] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
