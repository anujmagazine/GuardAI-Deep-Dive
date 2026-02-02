
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisInput, DeepDiveResult, LicenseTier } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function performDeepDive(input: AnalysisInput): Promise<DeepDiveResult> {
  const modelName = 'gemini-3-pro-preview';

  const systemInstruction = `
    You are a world-class Corporate Security & Data Privacy Architect. 
    Your task is to conduct a "Deep Dive" audit into a specific software tool, focusing on a specific user scenario and license tier.
    
    CRITICAL INSTRUCTIONS:
    1. Research the Tool: ${input.toolName} (${input.website}).
    2. Focus on Tier: ${input.licenseTier}. Privacy terms often differ significantly between Free and Enterprise tiers.
    3. Analyze Scenario: ${input.scenario}. Map exactly how data moves, where it is stored, and who has access in this specific context.
    4. Search for specific clauses regarding feature training (AI training on user data), data retention, and sub-processors.
    5. Proactive Safety: Identify any specific settings the user can toggle to improve safety for this scenario (e.g. "Opt-out of model training", "Delete data after session", "Enable E2EE"). Provide clear, numbered steps for each.
    
    JSON STRUCTURE REQUIREMENTS:
    - dataFlowAnalysis: Array of steps (step name, description, data types involved).
    - specificRisks: Array of risks unique to this tier + scenario combo.
    - safetySettings: { available: boolean, configurations: [{ title: string, steps: string[] }] }.
    - verdict: Summary, securityScore (0-100), and a clear recommendation.
    - truthBomb: A brutally honest, creative, and "no-corporate-speak" warning about the hidden implications.
    
    You MUST return the output in valid JSON format only.
  `;

  const prompt = `
    Perform a deep-dive security audit for:
    Tool: ${input.toolName}
    Website: ${input.website}
    License Tier: ${input.licenseTier}
    Specific Scenario: ${input.scenario}
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dataFlowAnalysis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.STRING },
                description: { type: Type.STRING },
                dataTypes: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["step", "description", "dataTypes"]
            }
          },
          specificRisks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                risk: { type: Type.STRING },
                mitigation: { type: Type.STRING },
                severity: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] }
              },
              required: ["category", "risk", "mitigation", "severity"]
            }
          },
          safetySettings: {
            type: Type.OBJECT,
            properties: {
              available: { type: Type.BOOLEAN },
              configurations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    steps: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["title", "steps"]
                }
              }
            },
            required: ["available", "configurations"]
          },
          verdict: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              securityScore: { type: Type.NUMBER },
              recommendation: { type: Type.STRING }
            },
            required: ["summary", "securityScore", "recommendation"]
          },
          truthBomb: { type: Type.STRING }
        },
        required: ["dataFlowAnalysis", "specificRisks", "safetySettings", "verdict", "truthBomb"]
      },
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response generated");

  let result: any;
  try {
    result = JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON", text);
    throw new Error("Invalid response format from AI");
  }

  // Extract sources from grounding metadata
  const sources: { title: string; uri: string }[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web && chunk.web.uri) {
        sources.push({
          title: chunk.web.title || "Reference Source",
          uri: chunk.web.uri
        });
      }
    });
  }

  return {
    ...result,
    toolName: input.toolName,
    licenseTier: input.licenseTier,
    scenario: input.scenario,
    sources: sources.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i) // Deduplicate
  };
}
