// 파일 위치: my-tts-app/api/tts.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import util from 'util';

const client = new textToSpeech.TextToSpeechClient();

export default async (req: VercelRequest, res: VercelResponse) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: '텍스트가 제공되지 않았습니다.' });
    }

    const request = {
      input: { text },
      voice: { languageCode: 'ko-KR', name: 'ko-KR-Neural2-B' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    const fileName = `/tmp/output.mp3`;
    await writeFile(fileName, response.audioContent, 'binary');

    const audioBase64 = Buffer.from(response.audioContent!).toString('base64');
    res.status(200).json({ audioUrl: `data:audio/mp3;base64,${audioBase64}` });
  } catch (error) {
    console.error('❌ 서버 오류:', error);
    res.status(500).json({ error: 'TTS 처리 중 오류 발생' });
  }
};
