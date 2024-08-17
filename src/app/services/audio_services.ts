import { showToast } from "../utils/toast";

// export function outputAudioSpeech(text: string) {
//     showToast(text)
//     const newUtterance = new SpeechSynthesisUtterance(text);
//     speechSynthesis.speak(newUtterance);
// }

export async function outputAudioSpeech(question: string) {
    try {
      // Fetch the answer from your API route
      const response = await fetch(`/api/ai?question=${encodeURIComponent(question)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      const answer = data.answer;

      showToast(answer)
  
      // Speak the answer
      const newUtterance = new SpeechSynthesisUtterance(answer);
      speechSynthesis.speak(newUtterance);
    } catch (error) {
      console.error('Error fetching answer or speaking:', error);
    }
  }