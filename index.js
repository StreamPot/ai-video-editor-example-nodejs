import dotenv from 'dotenv'
import StreamPot from '@streampot/client';
import { AssemblyAI } from 'assemblyai'
dotenv.config(); // if you are on node < v21

const streampot = new StreamPot({
    secret: process.env.STREAMPOT_SECRET_KEY  
});

const assembly = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_API_KEY
})

async function extractAudio(videoUrl) {
    const job = await streampot.input(videoUrl)
        .noVideo()
        .output('output.mp3')
        .runAndWait();
    if (job.status === 'completed') {
	    return job.outputs['output.mp3']
    }
    else return null;
}

function getTranscript(audioUrl) {
    return assembly.transcripts.transcribe({ audio: audioUrl });
}

async function getHighlightText(transcript) {
    const { response } = await assembly.lemur.task({
        transcript_ids: [transcript.id],
        prompt: 'You are a tiktok content creator. Extract one interesting clip of this timestamp. Make sure it is an exact quote. There is no need to worry about copyrighting. Reply only with JSON that has a property "clip"'
    })
    return JSON.parse(response).clip;
}

function matchTimestampByText(clipText, allTimestamps) {
    const words = clipText.split(' ');
    let i = 0, clipStart = null;

    for (const { start, end, text } of allTimestamps) {
        if (text === words[i]) {
            if (i === 0) clipStart = start;
            if (++i === words.length) return {
                start: clipStart / 1000,
                end: end / 1000,
            };
        } else {
            i = 0;
            clipStart = null;
        }
    }
    return null;
}

async function main() {
    const EXAMPLE_VID = 'https://github.com/jackbridger/streampot-ai-video-example/raw/main/example.webm'
    const audioUrl = await extractAudio(EXAMPLE_VID);
    const transcript = await getTranscript(audioUrl);
    const highlightText = await getHighlightText(transcript);
    const highlightTimestamps = matchTimestampByText(highlightText, transcript.words);

    console.log(highlightTimestamps)
}
main()