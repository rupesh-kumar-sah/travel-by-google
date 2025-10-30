import { GoogleGenAI, GenerateContentResponse, Chat, Type, Modality } from "@google/genai";
import { ChatMessage, Destination } from '../types';

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

// For complex itinerary planning - using pro with thinking mode
export const planComplexTrip = async (
  prompt: string
): Promise<string> => {
   if (!API_KEY) return "AI service is currently unavailable. Please check API key configuration.";
   try {
     const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
          systemInstruction: "You are a world-class travel planner specializing in creating detailed, day-by-day, personalized, and logistical itineraries for trips in Nepal. Be thorough, creative, practical, and provide estimated costs and booking advice. Format the output in well-structured markdown.",
          thinkingConfig: { thinkingBudget: 32768 } 
        },
      });
      return response.text;
   } catch (error) {
     console.error("Error generating complex plan:", error);
     return "Sorry, I encountered an error while planning your trip. Please try again.";
   }
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

// NEW function to generate an image for a destination
const getDestinationImage = async (
  destinationName: string,
  destinationDescription: string
): Promise<string> => {
  try {
    const prompt = `A stunning, professional, photorealistic travel photograph of ${destinationName}, Nepal. ${destinationDescription}. High resolution, vibrant colors, capturing the essence of the location.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:image/png;base64,${base64ImageBytes}`;
      }
    }
    // Fallback if no image is found in the response
    return `https://placehold.co/400x300/0d0d0d/ffffff?text=${encodeURIComponent(destinationName)}`;
  } catch (error) {
    console.error(`Error generating image for ${destinationName}:`, error);
    // Return a placeholder on error
    return `https://placehold.co/400x300/0d0d0d/ffffff?text=${encodeURIComponent(destinationName)}`;
  }
};

// For dynamically generating featured destinations
export const getAIFeaturedDestinations = async (
  existingNames: string[]
): Promise<Omit<Destination, 'id'>[]> => {
  if (!API_KEY) return [];
  try {
    const prompt = `Generate a list of 2 unique and interesting travel destinations in Nepal that are NOT on this list: [${existingNames.join(', ')}].
    For each destination, provide a name, location (district or province), a short compelling description (2-3 sentences), and an array of 1-2 relevant tags from this list: 'AI Pick', 'Hidden Gem', 'Adventure', 'Cultural', 'Nature', 'Spiritual'.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              location: { type: Type.STRING },
              description: { type: Type.STRING },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['name', 'location', 'description', 'tags']
          }
        },
      }
    });

    const jsonString = response.text.trim();
    const newDestinationsTextData: Omit<Destination, 'id' | 'image'>[] = JSON.parse(jsonString);
    
    // Now, generate an image for each new destination in parallel
    const destinationsWithImages = await Promise.all(
      newDestinationsTextData.map(async (dest) => {
        const imageUrl = await getDestinationImage(dest.name, dest.description);
        return {
          ...dest,
          image: imageUrl,
        };
      })
    );

    return destinationsWithImages;
  } catch (error) {
    console.error("Error generating AI featured destinations:", error);
    return []; // Return empty array on error
  }
};