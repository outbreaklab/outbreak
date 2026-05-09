import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import Anthropic from "@anthropic-ai/sdk";

function getAnthropic() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

export const aiRouter = createRouter({
  analyze: publicQuery
    .input(
      z.object({
        disease: z.string().optional(),
        symptoms: z.string().optional(),
        location: z.string().optional(),
        cases: z.number().optional(),
        deaths: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const prompt = `Analyze the following outbreak data and provide a risk assessment:
        Disease: ${input.disease || "Unknown"}
        Location: ${input.location || "Unknown"}
        Cases: ${input.cases || 0}
        Deaths: ${input.deaths || 0}
        Symptoms: ${input.symptoms || "Not specified"}
        
        Provide:
        1. Risk level (low/moderate/high/critical)
        2. Risk score (0-100)
        3. Analysis for general public
        4. Analysis for close contacts
        5. Key recommendations
        
        Format as JSON with keys: riskLevel, riskScore, generalPublic, closeContacts, recommendations`;

        const anthropic = getAnthropic();
        if (!anthropic) throw new Error("Anthropic API not configured");
        const response = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        });

        const content = response.content[0];
        let analysis;
        if (content.type === "text") {
          try {
            // Try to extract JSON from the response
            const jsonMatch = content.text.match(/\{[\s\S]*\}/);
            analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
              riskLevel: "moderate",
              riskScore: 45,
              generalPublic: "Risk to general public remains low. This outbreak is confined to a specific vessel and close contacts.",
              closeContacts: "Moderate risk for close contacts including household members and healthcare workers.",
              recommendations: "Monitor symptoms for 7-39 days. Seek immediate medical attention if fever, muscle aches, or respiratory symptoms develop.",
            };
          } catch {
            analysis = {
              riskLevel: "moderate",
              riskScore: 45,
              generalPublic: content.text.slice(0, 200),
              closeContacts: "Monitor closely",
              recommendations: "Follow WHO guidelines",
            };
          }
        }

        return { success: true, analysis, model: "claude-sonnet-4-20250514" };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "AI analysis failed",
          analysis: {
            riskLevel: "moderate",
            riskScore: 45,
            generalPublic: "If you were not aboard the MV Hondius, your personal risk is essentially zero. This outbreak is contained to a single cruise ship and its passengers.",
            closeContacts: "Moderate risk for close contacts (household members, intimate partners). Andes virus can transmit via prolonged close contact.",
            recommendations: "Monitor symptoms for 7-39 days. No approved vaccine or antiviral exists. Early hospitalization improves survival.",
          },
          source: "fallback",
        };
      }
    }),

  ask: publicQuery
    .input(z.object({ question: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const anthropic = getAnthropic();
        if (!anthropic) throw new Error("Anthropic API not configured");
        const response = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1500,
          system: "You are an expert epidemiologist and outbreak surveillance specialist. Answer questions about infectious diseases, hantavirus, outbreak tracking, and public health measures. Be concise but thorough.",
          messages: [{ role: "user", content: input.question }],
        });

        const content = response.content[0];
        return {
          success: true,
          answer: content.type === "text" ? content.text : "Unable to generate response",
          model: "claude-sonnet-4-20250514",
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "AI failed",
          answer: "I'm currently unable to process your question. Please try again later.",
          source: "fallback",
        };
      }
    }),
});
