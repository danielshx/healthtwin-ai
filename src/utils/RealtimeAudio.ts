export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      console.log('[AudioRecorder] Requesting microphone access...');
      
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('[AudioRecorder] Microphone access granted');
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      console.log('[AudioRecorder] Recording started');
    } catch (error) {
      console.error('[AudioRecorder] Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    console.log('[AudioRecorder] Stopping recording...');
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    console.log('[AudioRecorder] Recording stopped');
  }
}

class AudioQueue {
  private queue: Uint8Array[] = [];
  private isPlaying = false;
  private audioContext: AudioContext;

  constructor(audioContext: AudioContext) {
    this.audioContext = audioContext;
  }

  async addToQueue(audioData: Uint8Array) {
    this.queue.push(audioData);
    if (!this.isPlaying) {
      await this.playNext();
    }
  }

  private async playNext() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.queue.shift()!;

    try {
      const wavData = this.createWavFromPCM(audioData);
      const audioBuffer = await this.audioContext.decodeAudioData(wavData.buffer as ArrayBuffer);
      
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      
      source.onended = () => this.playNext();
      source.start(0);
    } catch (error) {
      console.error('[AudioQueue] Error playing audio:', error);
      this.playNext();
    }
  }

  private createWavFromPCM(pcmData: Uint8Array): Uint8Array {
    const int16Data = new Int16Array(pcmData.length / 2);
    for (let i = 0; i < pcmData.length; i += 2) {
      int16Data[i / 2] = (pcmData[i + 1] << 8) | pcmData[i];
    }
    
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const sampleRate = 24000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + int16Data.byteLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, int16Data.byteLength, true);

    const wavArray = new Uint8Array(wavHeader.byteLength + int16Data.byteLength);
    wavArray.set(new Uint8Array(wavHeader), 0);
    wavArray.set(new Uint8Array(int16Data.buffer as ArrayBuffer), wavHeader.byteLength);
    
    return wavArray;
  }

  clear() {
    this.queue = [];
    this.isPlaying = false;
  }
}

export const encodeAudioForAPI = (float32Array: Float32Array): string => {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  const uint8Array = new Uint8Array(int16Array.buffer as ArrayBuffer);
  let binary = '';
  const chunkSize = 0x8000;
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
};

export class RealtimeVoiceChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private isConnected = false;

  constructor(
    private onMessage: (event: any) => void,
    private onConnectionChange: (connected: boolean) => void
  ) {
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async connect() {
    try {
      console.log('[RealtimeVoiceChat] Getting ephemeral token...');
      
      // Get ephemeral token from edge function
      const response = await fetch(
        `https://facfhfdnvbqaafsrfyxh.supabase.co/functions/v1/realtime-voice`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get token: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.client_secret?.value) {
        throw new Error("Failed to get ephemeral token");
      }

      const EPHEMERAL_KEY = data.client_secret.value;
      console.log('[RealtimeVoiceChat] Token received, setting up WebRTC...');

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Set up remote audio
      this.pc.ontrack = e => {
        console.log('[RealtimeVoiceChat] Received audio track');
        this.audioEl.srcObject = e.streams[0];
      };

      // Add local audio track
      console.log('[RealtimeVoiceChat] Requesting microphone access...');
      const ms = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      this.pc.addTrack(ms.getTracks()[0]);
      console.log('[RealtimeVoiceChat] Local audio track added');

      // Set up data channel for events
      this.dc = this.pc.createDataChannel("oai-events");
      this.dc.addEventListener("message", (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log(`[RealtimeVoiceChat] Received event: ${event.type}`);
          this.onMessage(event);
        } catch (error) {
          console.error('[RealtimeVoiceChat] Error parsing message:', error);
        }
      });

      this.dc.addEventListener("open", () => {
        console.log('[RealtimeVoiceChat] Data channel opened');
        this.isConnected = true;
        this.onConnectionChange(true);
      });

      this.dc.addEventListener("close", () => {
        console.log('[RealtimeVoiceChat] Data channel closed');
        this.isConnected = false;
        this.onConnectionChange(false);
      });

      // Create and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);
      console.log('[RealtimeVoiceChat] Created offer');

      // Connect to OpenAI's Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`Failed to connect: ${sdpResponse.statusText}`);
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log('[RealtimeVoiceChat] WebRTC connection established');

    } catch (error) {
      console.error('[RealtimeVoiceChat] Connection error:', error);
      this.isConnected = false;
      this.onConnectionChange(false);
      throw error;
    }
  }

  sendText(text: string) {
    if (!this.dc || this.dc.readyState !== 'open') {
      console.error('[RealtimeVoiceChat] Cannot send - data channel not ready');
      return;
    }

    console.log(`[RealtimeVoiceChat] Sending text: ${text}`);

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }]
      }
    };

    this.dc.send(JSON.stringify(event));
    this.dc.send(JSON.stringify({ type: 'response.create' }));
  }

  disconnect() {
    console.log('[RealtimeVoiceChat] Disconnecting...');
    this.dc?.close();
    this.pc?.close();
    this.audioEl.srcObject = null;
    this.isConnected = false;
    this.onConnectionChange(false);
  }

  get connected() {
    return this.isConnected;
  }
}
