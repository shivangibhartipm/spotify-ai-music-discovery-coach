import "server-only";

import { getGroqEnv } from "@/lib/config/env";
import { httpRequest } from "@/lib/http/client";
import {
  llmRecommendationResponseSchema,
  llmSurpriseRecommendationResponseSchema,
  type LlmRecommendation,
  type LlmSurpriseRecommendation,
} from "@/lib/validation/recommendations";

const groqChatCompletionsUrl = "https://api.groq.com/openai/v1/chat/completions";

type GroqMessage = {
  role: "system" | "user";
  content: string;
};

const systemPrompt =
  "You are a precise music recommendation engine. Return only valid JSON that matches the requested schema. Do not include markdown.";

function extractJson(content: string) {
  const trimmed = content.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  return trimmed;
}

export class GroqClient {
  private async createJsonCompletion(prompt: string) {
    const { GROQ_API_KEY, GROQ_MODEL } = getGroqEnv();
    const messages: GroqMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await httpRequest(
      groqChatCompletionsUrl,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          temperature: 0.8,
          max_tokens: 1200,
          response_format: { type: "json_object" },
        }),
      },
      {
        timeoutMs: 20_000,
        retries: 1,
      },
    );
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };

    if (!response.ok) {
      throw new Error(payload.error?.message ?? `Groq request failed with status ${response.status}`);
    }

    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty recommendation response");
    }

    return JSON.parse(extractJson(content)) as unknown;
  }

  async generateRecommendations(prompt: string): Promise<LlmRecommendation[]> {
    const parsed = await this.createJsonCompletion(prompt);

    return llmRecommendationResponseSchema.parse(parsed).recommendations;
  }

  async generateSurpriseRecommendation(prompt: string): Promise<LlmSurpriseRecommendation> {
    const parsed = await this.createJsonCompletion(prompt);

    return llmSurpriseRecommendationResponseSchema.parse(parsed).recommendation;
  }
}
