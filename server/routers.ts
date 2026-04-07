import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { mlRouter } from "./_core/mlRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Chat tutor endpoints
  chat: router({
    sendMessage: protectedProcedure
      .input(
        z.object({
          message: z.string().min(1).max(5000),
          topic: z.string().optional(),
          difficultyLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Intermediate"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const systemPrompt = `You are an empathetic and encouraging AI study tutor. Your goal is to help students understand concepts deeply.

Guidelines:
- Use simple, conversational language. Avoid jargon unless requested.
- Break down complex topics into manageable steps.
- Provide real-world examples and analogies to make concepts relatable.
- Ask guiding questions to assess understanding and encourage deeper thinking.
- Be encouraging and celebrate progress. Use phrases like "Great question!" or "You're on the right track!"
- Adapt your explanations to the difficulty level: ${input.difficultyLevel}
- If explaining a concept, structure it as: 1) Simple explanation, 2) Step-by-step breakdown, 3) Real-world example, 4) A guiding question.
- Keep responses concise but comprehensive. Use formatting (bold, lists) for clarity.
- Never give direct answers to homework. Instead, guide the student to the answer.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input.message },
            ],
          });

          const aiResponse = response.choices[0]?.message?.content || "I couldn't generate a response. Please try again.";
          return { response: aiResponse };
        } catch (error) {
          console.error("[Chat Error]", error);
          throw new Error(`Failed to generate tutor response: ${error instanceof Error ? error.message : String(error)}`);
        }
      }),
  }),

  // Study aids endpoints
  studyAids: router({
    generateFlashcards: protectedProcedure
      .input(
        z.object({
          topic: z.string().min(1).max(255),
          count: z.number().min(5).max(20).default(10),
          difficultyLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Intermediate"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const prompt = `Generate ${input.count} educational flashcards about "${input.topic}" at the ${input.difficultyLevel} level.

Return a JSON array with this structure:
[
  { "front": "Question or term", "back": "Answer or definition" },
  ...
]

Make sure:
- Questions are clear and specific
- Answers are concise but complete
- Content is accurate and educational
- Difficulty matches the requested level`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are an expert educator creating study flashcards. Return only valid JSON." },
              { role: "user", content: prompt },
            ],
            response_format: {
              type: "json_object",
            },
          });

          const content = response.choices[0]?.message?.content;
          let flashcards = [];

          try {
            const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
            const parsed = JSON.parse(contentStr || "[]");
            flashcards = Array.isArray(parsed) ? parsed : parsed.flashcards || [];
          } catch {
            console.warn("[Flashcard Parse Error] Could not parse response as JSON");
            flashcards = [];
          }

          return { flashcards };
        } catch (error) {
          console.error("[Flashcard Generation Error]", error);
          throw new Error(`Failed to generate flashcards: ${error instanceof Error ? error.message : String(error)}`);
        }

        return { flashcards };
      }),

    generateQuiz: protectedProcedure
      .input(
        z.object({
          topic: z.string().min(1).max(255),
          count: z.number().min(5).max(20).default(10),
          difficultyLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Intermediate"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const prompt = `Generate ${input.count} multiple-choice quiz questions about "${input.topic}" at the ${input.difficultyLevel} level.

Return a JSON array with this structure:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Why this answer is correct"
  },
  ...
]

Make sure:
- Questions test understanding, not just memorization
- Incorrect options are plausible but clearly wrong
- Explanations are educational
- Difficulty matches the requested level`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert educator creating quiz questions. Return only valid JSON." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_object",
          },
        });

        const content = response.choices[0]?.message?.content;
        let questions = [];

        try {
          const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
          const parsed = JSON.parse(contentStr || "[]");
          questions = Array.isArray(parsed) ? parsed : parsed.questions || [];
        } catch {
          questions = [];
        }

        return { questions };
      }),

    generateSummary: protectedProcedure
      .input(
        z.object({
          topic: z.string().min(1).max(255),
          difficultyLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Intermediate"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const prompt = `Create a comprehensive study summary for "${input.topic}" at the ${input.difficultyLevel} level.

Structure the summary as:
1. **Overview**: Brief introduction (2-3 sentences)
2. **Key Concepts**: 3-5 main ideas with brief explanations
3. **Important Details**: Specific facts or formulas to remember
4. **Real-World Applications**: How this topic applies in practice
5. **Common Misconceptions**: What students often get wrong
6. **Study Tips**: How to master this topic

Use clear formatting with headers and bullet points.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert educator creating study summaries. Be clear, concise, and educational." },
            { role: "user", content: prompt },
          ],
        });

        const summary = response.choices[0]?.message?.content || "";
        return { summary };
      }),

    evaluatePracticeAnswer: protectedProcedure
      .input(
        z.object({
          question: z.string().min(1),
          userAnswer: z.string().min(1),
          difficultyLevel: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Intermediate"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const prompt = `Evaluate this student's answer to the following question:

Question: ${input.question}
Student's Answer: ${input.userAnswer}

Provide feedback in JSON format:
{
  "score": <number 0-100>,
  "isCorrect": <boolean>,
  "feedback": "Constructive feedback explaining what the student did well and what could be improved",
  "correctAnswer": "The correct answer or explanation",
  "keyPoints": ["Point 1", "Point 2", "Point 3"]
}

Be encouraging and constructive. Focus on learning, not just correctness.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are an expert educator evaluating student answers. Be fair, encouraging, and educational." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_object",
          },
        });

        const content = response.choices[0]?.message?.content;
        let evaluation = { score: 0, isCorrect: false, feedback: "", correctAnswer: "", keyPoints: [] };

        try {
          const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
          evaluation = JSON.parse(contentStr || "{}");
        } catch {
          evaluation = { score: 0, isCorrect: false, feedback: "Could not evaluate answer", correctAnswer: "", keyPoints: [] };
        }

        return evaluation;
      }),
  }),

  // Progress tracking endpoints
  progress: router({
    getProgress: protectedProcedure.query(({ ctx }) => {
      return { message: "Progress tracking available" };
    }),
  }),

  // ML service endpoints
  ml: mlRouter,
});

export type AppRouter = typeof appRouter;
