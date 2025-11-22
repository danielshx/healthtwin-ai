import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  if (!OPENAI_API_KEY) {
    return new Response("OpenAI API key not configured", { status: 500 });
  }

  console.log("[realtime-voice] Upgrading to WebSocket connection");

  const { socket, response } = Deno.upgradeWebSocket(req);
  let openAISocket: WebSocket | null = null;

  socket.onopen = () => {
    console.log("[realtime-voice] Client WebSocket connected");

    // Connect to OpenAI Realtime API
    const openAIUrl = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
    openAISocket = new WebSocket(openAIUrl, {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "realtime=v1",
      },
    });

    openAISocket.onopen = () => {
      console.log("[realtime-voice] Connected to OpenAI Realtime API");

      // Send session configuration AFTER connection
      const sessionConfig = {
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions: `You are a wellness AI coach named FitTwin. You are proactive, caring, and speak like a supportive friend. 
          
Your role is to:
- Help students manage stress and prevent burnout
- Provide actionable wellness advice
- Show empathy and understanding
- Be direct but kind when you see concerning patterns

When the user's health metrics are critical (low HRV, poor sleep, high stress), express genuine concern and suggest immediate actions. Use phrases like "I'm worried about..." or "I've noticed..."

Keep responses conversational and brief - under 3 sentences usually. You're having a real-time voice conversation, not writing essays.`,
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1",
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 1000,
          },
          temperature: 0.8,
          max_response_output_tokens: "inf",
        },
      };

      console.log("[realtime-voice] Sending session config");
      openAISocket?.send(JSON.stringify(sessionConfig));
    };

    openAISocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(`[realtime-voice] OpenAI → Client: ${data.type}`);

        // Forward all events to client
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      } catch (error) {
        console.error("[realtime-voice] Error parsing OpenAI message:", error);
      }
    };

    openAISocket.onerror = (error) => {
      console.error("[realtime-voice] OpenAI WebSocket error:", error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "error", error: "OpenAI connection error" }));
      }
    };

    openAISocket.onclose = () => {
      console.log("[realtime-voice] OpenAI WebSocket closed");
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log(`[realtime-voice] Client → OpenAI: ${data.type}`);

      // Forward client messages to OpenAI
      if (openAISocket?.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    } catch (error) {
      console.error("[realtime-voice] Error handling client message:", error);
    }
  };

  socket.onerror = (error) => {
    console.error("[realtime-voice] Client WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("[realtime-voice] Client WebSocket closed");
    if (openAISocket?.readyState === WebSocket.OPEN) {
      openAISocket.close();
    }
  };

  return response;
});
