import dotenv from 'dotenv'
import StreamPot from '@streampot/client';
dotenv.config(); // if you are on node < v21

const streampot = new StreamPot({
    secret: process.env.STREAMPOT_SECRET_KEY  
});

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
async function main() {
    const EXAMPLE_VID = 'https://github.com/jackbridger/streampot-ai-video-example/raw/main/example.webm'
    const audioUrl = await extractAudio(EXAMPLE_VID)
    console.log(audioUrl)
}
main()