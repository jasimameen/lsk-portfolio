import * as sdk from "microsoft-cognitiveservices-speech-sdk";



export async function GET(req: any) {
    

    const speechConfig = sdk. SpeechConfig.fromSubscription( process.env.SPEECH_KEY!, process.env.SPEECH_REGION! )


}