import { GoogleGenAI, GenerateContentResponse, Chat, Type, Modality } from "@google/genai";
import { ChatMessage, Destination } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

// New interface for trip ideas
export interface TripIdea {
  title: string;
  prompt: string;
}

// Interface for new dynamic hero
export interface DynamicHeroContent {
  title: string;
  description: string;
  image: string; // base64 string or URL
}


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

// For dynamically generating featured destinations with AI images
export const getAIFeaturedDestinations = async (
  count: number = 3
): Promise<Omit<Destination, 'id'>[]> => {
  if (!API_KEY) return [];
  try {
    // Step 1: Generate text content for multiple destinations
    const textPrompt = `Generate a list of ${count} diverse and interesting travel destinations in Nepal.
    For each, provide a name, location (district or province), a short compelling description (2-3 sentences), and an array of 1-2 relevant tags from this list: 'Trending', 'AI Pick', 'Hidden Gem', 'Adventure', 'Cultural', 'Nature', 'Spiritual'.`;

    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: textPrompt,
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

    const destinationsTextData: Omit<Destination, 'id' | 'image'>[] = JSON.parse(textResponse.text.trim());
    if (destinationsTextData.length === 0) {
        return [];
    }
    
    // Step 2: Generate an image for each destination in parallel
    const destinationPromises = destinationsTextData.map(async (destData) => {
        try {
            const imagePrompt = `A stunning, high-quality, photorealistic travel photograph of ${destData.name}, ${destData.location}, Nepal. The image should capture the essence of its description: "${destData.description}". Epic cinematic style with vibrant colors.`;
            
            const imageResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image',
              contents: { parts: [{ text: imagePrompt }] },
              config: { responseModalities: [Modality.IMAGE] },
            });
            
            let imageUrl = `https://placehold.co/400x300/0d0d0d/ffffff?text=${encodeURIComponent(destData.name)}`; // Fallback

            for (const part of imageResponse.candidates[0].content.parts) {
              if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                break; // Found the image, no need to continue
              }
            }
            
            return {
                ...destData,
                image: imageUrl,
            };
        } catch (imgError) {
            console.error(`Failed to generate image for ${destData.name}:`, imgError);
            // Return with a fallback image on individual failure, so the whole process doesn't stop.
            return {
                ...destData,
                image: `https://placehold.co/400x300/0d0d0d/ffffff?text=Image+Error`
            };
        }
    });

    const finalDestinations = await Promise.all(destinationPromises);
    return finalDestinations;

  } catch (error) {
    console.error("Error generating AI featured destinations:", error);
    return []; // Return empty array on top-level error
  }
};


// NEW function to generate trip ideas
export const getTripIdeas = async (): Promise<TripIdea[]> => {
  if (!API_KEY) return [];
  try {
    const prompt = `Generate a list of 4 diverse and creative trip ideas for tourists in Nepal. The ideas should cover different interests like adventure, culture, spirituality, and relaxation.
    For each idea, provide a short, catchy "title" and a detailed "prompt" that a user could give to an AI travel planner. The prompt should be a complete sentence or two describing the desired trip.`;

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
              title: { type: Type.STRING, description: "A short, catchy title for the trip idea." },
              prompt: { type: Type.STRING, description: "A detailed prompt for the AI planner." },
            },
            required: ['title', 'prompt']
          }
        },
      }
    });

    const jsonString = response.text.trim();
    const newIdeas: TripIdea[] = JSON.parse(jsonString);
    return newIdeas;
  } catch (error) {
    console.error("Error generating AI trip ideas:", error);
    return []; // Return empty array on error
  }
};

// NEW function for a daily travel tip
export const getTravelTip = async (): Promise<string> => {
  if (!API_KEY) return "Remember to stay hydrated, especially when trekking at high altitudes.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a single, short, and useful travel tip for someone visiting Nepal. Keep it under 20 words. Be creative and practical.",
    });
    return response.text;
  } catch (error) {
    console.error("Error generating travel tip:", error);
    return "Always have a backup power bank for your electronics in remote areas.";
  }
};

// NEW function for dynamic hero content
export const getDynamicHeroContent = async (): Promise<DynamicHeroContent> => {
  const fallbackContent: DynamicHeroContent = {
    title: "Timeless Kathmandu",
    description: "Explore the ancient heart of Nepal's capital.",
    image: 'https://images.unsplash.com/photo-1605788485215-35990d068502?q=80&w=400&auto=format&fit=crop',
  };

  if (!API_KEY) return fallbackContent;

  try {
    // 1. Generate text content
    const textPrompt = `Generate a captivating title, a short one-sentence description, and a detailed image prompt for a featured travel experience in Nepal. 
    The experience should be inspiring. The image prompt should be suitable for an AI image generator to create a stunning, photorealistic, vibrant travel photograph of a real location in Nepal.`;
    
    const textResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: textPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            photo_prompt: { type: Type.STRING },
          },
          required: ['title', 'description', 'photo_prompt']
        }
      }
    });

    const { title, description, photo_prompt } = JSON.parse(textResponse.text.trim());
    
    // 2. Generate image based on the prompt
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: photo_prompt }] },
      config: { responseModalities: [Modality.IMAGE] },
    });

    for (const part of imageResponse.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return {
          title,
          description,
          image: `data:image/png;base64,${base64ImageBytes}`,
        };
      }
    }

    // If image generation fails, return text with fallback image
    return { ...fallbackContent, title, description };

  } catch (error) {
    console.error("Error generating dynamic hero content:", error);
    return fallbackContent;
  }
};