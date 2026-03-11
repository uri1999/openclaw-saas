import { generateText } from 'ai';
import { createVertex } from '@ai-sdk/google-vertex';
const vertex = createVertex({ project: 'project-3c44aff9-54a3-456c-a53', location: 'us-central1' });
try {
  const result = await generateText({
    model: vertex('gemini-1.5-flash'),
    prompt: 'Hello'
  });
  console.log(result.text);
} catch (e) {
  console.error(e);
}
