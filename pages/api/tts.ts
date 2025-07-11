import type { NextApiRequest, NextApiResponse } from 'next';
import textToSpeech from '@google-cloud/text-to-speech';
import { GoogleAuth } from 'google-auth-library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '허용되지 않은 메서드입니다' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: '텍스트가 없습니다' });
  }

  try {
    // 🔐 JSON 환경변수에서 인증 정보 읽기
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON || '{}');
    const client = new textToSpeech.TextToSpeechClient({
      credentials,
    });

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: { languageCode: 'ko-KR', name: 'ko-KR-Neural2-B' },
      audioConfig: { audioEncoding: 'MP3' },
    });

    const audioBuffer = response.audioContent;
    if (!audioBuffer) throw new Error('음성 생성 실패');

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(audioBuffer);
  } catch (error) {
    console.error('❌ TTS 오류:', error);
    res.status(500).json({ error: 'TTS 처리 중 오류 발생' });
  }
}
