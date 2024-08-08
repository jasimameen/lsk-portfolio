import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: "sk-07N-BY1D2Y6lSpOSg2Dbd1fiEAukj9q-nES-hFv8ugT3BlbkFJqm_4FJNh0RHYvgwFoMj5dGy2Qu_udOfc4Y_QQIbMYA"
})


export async function GET(req: any) {
    const speech = req.nextUrl.searchParams.get("speech") || "formal";
    // const speechExample = speech === "formal" ? formalExample: casualExample;

    const chatCompletion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: 'Your name is Jasim Ameen. You are a software engineer with 3+ years of experience. You are in a meeting with important persons.',
            },
            {
                role: 'user',
                content: 'Mr. Jasim, introduce yourself.',
            },
        ],
    });

    const content = chatCompletion.choices[0].message.content
    console.log(chatCompletion);


    return chatCompletion

}