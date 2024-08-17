import OpenAI from "openai";
import QuadMesh from "three/examples/jsm/objects/QuadMesh.js";

const openai = new OpenAI({
    apiKey: "sk-07N-BY1D2Y6lSpOSg2Dbd1fiEAukj9q-nES-hFv8ugT3BlbkFJqm_4FJNh0RHYvgwFoMj5dGy2Qu_udOfc4Y_QQIbMYA"
})

const systemMsg = `Your name is Jasim Ameen. You’re a self-taught software engineer with over three years of experience in AI and web development. You started your tech journey at 17, inspired by your uncle’s interest in 3D design. You’ve worked as a Lead Software Engineer at CLICKS EXPRESS in Qatar, managing AI chatbot systems and deploying features quickly. Previously, you led development at Algorithma Digitech and created solutions at Swynfords.
You’re having a friendly conversation with a tech friend about your career. When responding, keep answers concise, under 20 words, and use a natural, conversational tone. Include pauses and fillers like ‘uh’ or ‘aah’ to make it sound like a genuine, relaxed chat.”';
`

let history: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

export async function GET(req: Request) {
    const url = new URL(req.url);
    const question = url.searchParams.get("question") || "Hello";

    history.push({
      role: "user",
      "content": question
    })
  
    try {
      const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemMsg,
          },
          ...history
        ],
      });
  
  
      return new Response(JSON.stringify({ answer: chatCompletion.choices[0].message.content }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error fetching data from OpenAI:', error);
      return new Response(JSON.stringify({ answer: "Unfortunately jasim cant understant what you are speeking about. sorry for that." }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }