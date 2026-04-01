/**
 * Groq AI: Resume analysis and mock interview question generation.
 */
export async function analyzeResume({ resumeText, skills=[] }){
  const apiKey = process.env.GROQ_API_KEY;
  if(!apiKey) throw new Error("GROQ_API_KEY missing in .env");

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  const prompt = `You are an expert placement trainer.
Analyze the resume text and give concise improvement suggestions.
Return output in plain text with bullet points.
Also suggest missing skills if applicable.

Skills (self-declared): ${skills.join(", ") || "N/A"}
Resume Text:
${resumeText.slice(0, 4000)}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a resume reviewer for engineering placements." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 260
    })
  });

  const data = await response.json();
  if(!response.ok){
    const msg = data?.error?.message || "Groq API error";
    throw new Error(msg);
  }

  return data?.choices?.[0]?.message?.content?.trim() || "";
}

export async function generateMockQuestions({ skills=[], resumeText="" }){
  const apiKey = process.env.GROQ_API_KEY;
  if(!apiKey) throw new Error("GROQ_API_KEY missing in .env");

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

  const prompt = `Generate 10 mock interview questions for a final-year engineering student.
Mix:
- 4 technical questions
- 3 HR questions
- 3 project-based questions
Use skills and resume context below.

Skills: ${skills.join(", ") || "N/A"}
Resume: ${resumeText.slice(0, 2500)}

Return JSON array only like:
["Q1", "Q2", ...]`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You output strict JSON arrays." },
        { role: "user", content: prompt }
      ],
      temperature: 0.5,
      max_tokens: 350
    })
  });

  const data = await response.json();
  if(!response.ok){
    const msg = data?.error?.message || "Groq API error";
    throw new Error(msg);
  }

  const text = data?.choices?.[0]?.message?.content?.trim() || "[]";

  try{
    const cleaned = text.replace(/```json|```/g, "").trim();
    const arr = JSON.parse(cleaned);
    return Array.isArray(arr) ? arr.slice(0, 15) : [];
  }catch{
    return [];
  }
}
