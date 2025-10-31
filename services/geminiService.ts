import { GoogleGenAI, GenerateContentResponse, Chat, Type } from "@google/genai";
import { ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// For the chatbot - using flash-lite for low latency and streaming
export const getAiChatResponseStream = async (
  prompt: string,
  history: ChatMessage[]
): Promise<AsyncGenerator<GenerateContentResponse>> => {
  if (!API_KEY) throw new Error("AI service is currently unavailable. Please check API key configuration.");
  
  // FIX: Use the recommended model name for gemini flash lite.
  const model = 'gemini-flash-lite-latest';
  const chat: Chat = ai.chats.create({
    model: model,
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    config: {
      systemInstruction: "You are a friendly and expert travel assistant for Nepal. Provide helpful, concise, and inspiring travel advice. Keep responses under 100 words unless asked for details.",
    },
  });

  const response = await chat.sendMessageStream({ message: prompt });
  return response;
};

// For complex itinerary planning - NOW STREAMING for much better perceived performance
export const planComplexTripStream = async (
  prompt: string
): Promise<AsyncGenerator<GenerateContentResponse>> => {
   if (!API_KEY) throw new Error("AI service is currently unavailable. Please check API key configuration.");
   
   const response = await ai.models.generateContentStream({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class travel planner specializing in creating detailed, day-by-day, personalized, and logistical itineraries for trips in Nepal. Be thorough, creative, practical, and provide estimated costs and booking advice. Format the output in well-structured markdown.",
        thinkingConfig: { thinkingBudget: 32768 } 
      },
    });
    return response;
};

// For the home screen search - using flash with search grounding
export const getAiSearchGroundedResponse = async (
  query: string,
): Promise<GenerateContentResponse> => {
   if (!API_KEY) throw new Error("AI service is currently unavailable. Please check API key configuration.");
   
   const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide up-to-date and accurate travel information about the following topic in Nepal: ${query}. Include interesting facts, what to do, how to get there, and best times to visit.`,
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    return response;
}

// Keep existing maps grounding function
export const findNearbyPlaces = async (
  query: string,
  userLocation: { latitude: number; longitude: number }
): Promise<GenerateContentResponse> => {
  if (!API_KEY) throw new Error("API_KEY not configured");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the following near me: ${query}.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude
            }
          }
        }
      },
    });
    return response;
  } catch (error) {
    console.error("Error with Google Maps grounding:", error);
    throw error;
  }
};

// For destination details on the home screen - NOW STREAMING
export const getDestinationDetailsStream = async (
  destinationName: string
): Promise<AsyncGenerator<GenerateContentResponse>> => {
   if (!API_KEY) throw new Error("AI service is currently unavailable. Please check API key configuration.");

   const prompt = `Provide a detailed, engaging, and practical travel guide for "${destinationName}" in Nepal for a tourist. 
   Structure the response in markdown with the following sections:
   - **Overview:** A captivating summary.
   - **What to See & Do:** A bulleted list of key attractions and activities.
   - **Best Time to Visit:** A brief recommendation.
   - **How to Get There:** Practical travel advice.
   - **Traveler Tips:** A few essential tips for safety, culture, or packing.
   
   Keep the tone inspiring and helpful.`;

   const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response;
};

// For AI Image Generation for Feed Posts
export const generatePostImage = async (
  prompt: string,
): Promise<string> => {
   if (!API_KEY) throw new Error("AI service is currently unavailable. Please check API key configuration.");
   
   const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '4:3',
      },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    if (!base64ImageBytes) {
      throw new Error("No image was generated by the API.");
    }
    return base64ImageBytes;
}

// For AI-powered post suggestions from an image
export const analyzePostImage = async (
  base64ImageData: string,
  mimeType: string
): Promise<{ location: string; caption: string; }> => {
  if (!API_KEY) throw new Error("AI service is currently unavailable. Please check API key configuration.");
  
  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: base64ImageData,
    },
  };

  const textPart = {
    text: "Analyze this image from a traveler in Nepal. Identify the specific location (city, monument, or natural park) and suggest a creative, engaging caption for a social media post. Be imaginative."
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          location: {
            type: Type.STRING,
            description: "The specific location identified in the image (e.g., 'Boudhanath Stupa, Kathmandu')."
          },
          caption: {
            type: Type.STRING,
            description: "A creative and engaging social media caption for the image, under 50 words."
          }
        },
        required: ['location', 'caption']
      }
    }
  });

  const jsonText = response.text.trim();
  try {
      return JSON.parse(jsonText);
  } catch (e) {
      console.error("Failed to parse AI JSON response:", jsonText, e);
      throw new Error("AI returned an invalid response format.");
  }
};
