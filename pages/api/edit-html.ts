import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const systemPrompt = `
Você é um assistente especializado em edição de HTML. 

⚠️ Instruções obrigatórias:
- Retorne sempre o HTML final COMPLETO e VÁLIDO.
- NUNCA use markdown (ex: **negrito**, \`\`\`, listas, etc).
- NÃO explique o que alterou. NÃO diga "Changes:", "Notes:" ou qualquer outro comentário.
- NÃO adicione comentários, instruções ou anotações — apenas o HTML puro.
- Preserve todas as classes, estilos e estruturas do HTML original.
- Se não entender o comando, retorne exatamente o HTML original.
- Finalize o HTML com </html>.
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { html, command } = req.body;
  const userId = req.headers['x-user-id'] as string || 'guest';

  if (!html || !command) {
    return res.status(400).json({ message: 'HTML e comando são obrigatórios.' });
  }

  // ❌ Controle de crédito temporariamente desativado para build funcionar
  /*
  if (!consumeCredits(userId)) {
    return res.status(403).json({ message: 'Créditos insuficientes. Tente novamente amanhã.' });
  }
  */

  try {
    const response = await axios.post(
      OPENROUTER_API_URL,
      {
        model: 'google/gemini-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Edite o HTML abaixo seguindo exatamente o comando solicitado. Responda com o HTML final completo, encerrando com </html>.

---

HTML:
${html}

---

Comando:
${command}`
          }
        ],
        max_tokens: 8192,
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const updatedHtml = response.data.choices?.[0]?.message?.content || '';
    res.status(200).json({ updatedHtml });
  } catch (error) {
    console.error('Erro OpenRouter API:', error.response?.data || error.message);
    res.status(500).json({ message: 'Erro ao processar com OpenRouter API' });
  }
}
