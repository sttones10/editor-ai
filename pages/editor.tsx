
'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [htmlOriginal, setHtmlOriginal] = useState('');
  const [htmlEditado, setHtmlEditado] = useState('');
  const [comando, setComando] = useState('');
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<string[]>([]);
  const [refazerPilha, setRefazerPilha] = useState<string[]>([]);
  const [creditos, setCreditos] = useState<number | null>(null);
  const [progresso, setProgresso] = useState(0);

  const sugestoes = [
    "Adicione um botão do WhatsApp no final da página",
    "Troque as imagens dos depoimentos por [link1, link2, link3]",
    "Centralize os textos da seção Sobre",
    "Corrija todos os títulos para deixá-los mais elegantes",
    "Aplique sombra nos cards de tratamento",
    "Adicione uma frase de impacto abaixo do título principal"
  ];

  const buscarCreditos = async () => {
    try {
      const res = await axios.get('/api/credits', {
        headers: { 'x-user-id': 'guest' }
      });
      setCreditos(res.data.credits);
    } catch {
      setCreditos(null);
    }
  };

  const iniciarProgressoFake = () => {
  let progressoAtual = 0;
  setProgresso(0);
  const intervalo = setInterval(() => {
    progressoAtual += 0.25; // Aumenta bem devagar
    if (progressoAtual >= 95) clearInterval(intervalo);
    setProgresso(Math.min(progressoAtual, 95));
  }, 100); // 100ms × 400 ciclos = ~40 segundos
  return intervalo;
};

  const withCSS = (html: string) => {
    const cssLinks = `
      <link href='https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css' rel='stylesheet'>
      <link href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' rel='stylesheet'>
      <style>body { font-family: 'Playfair Display', serif; }</style>
    `;
    return html.includes('<head>')
      ? html.replace(/<head>/i, `<head>${cssLinks}`)
      : `<head>${cssLinks}</head>${html}`;
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setHtmlOriginal(content);
        setHtmlEditado('');
        setHistorico([]);
        setRefazerPilha([]);
      };
      reader.readAsText(file);
    }
  };

  const aplicarComando = async () => {
    if (!htmlOriginal || !comando) return;
    setLoading(true);
    const intervaloProgresso = iniciarProgressoFake();

    try {
      const res = await axios.post('/api/edit-html', {
        html: htmlEditado || htmlOriginal,
        command: comando,
      });

      let htmlRetornado = res.data.updatedHtml || '';
      const match = htmlRetornado.match(/<html[\s\S]*<\/html>/i);
      const limpo = match ? match[0] : htmlRetornado.replace(/```html|```/g, '').trim();

      setHistorico([...historico, htmlEditado || htmlOriginal]);
      setHtmlEditado(limpo);
      setRefazerPilha([]);
    } catch (error) {
      alert('Erro ao aplicar comando.');
    }

    clearInterval(intervaloProgresso);
    setProgresso(100);
    buscarCreditos();

    setTimeout(() => {
      setLoading(false);
      setProgresso(0);
    }, 1000);
  };

  const desfazer = () => {
    if (historico.length === 0) return;
    const anterior = historico[historico.length - 1];
    setRefazerPilha([htmlEditado, ...refazerPilha]);
    setHtmlEditado(anterior);
    setHistorico(historico.slice(0, -1));
  };

  const refazer = () => {
    if (refazerPilha.length === 0) return;
    const proximo = refazerPilha[0];
    setHistorico([...historico, htmlEditado]);
    setHtmlEditado(proximo);
    setRefazerPilha(refazerPilha.slice(1));
  };

  const baixarEditado = () => {
    const blob = new Blob([htmlEditado], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'index-editado.html';
    link.click();
  };

  useEffect(() => {
    buscarCreditos();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-8 font-sans">
      <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">Editor de SITE com IA ✨</h1>
      <div className="text-center text-sm text-gray-600 mb-6">
        Créditos disponíveis: <strong>{creditos ?? '...'}</strong> / 50
      </div>

      <div className="flex flex-col items-center gap-4 mb-8">
        <label htmlFor="upload" className="cursor-pointer bg-white border-2 border-dashed border-blue-400 p-6 rounded-xl shadow-md hover:bg-blue-50 transition-all">
          <span className="text-blue-600 font-medium">📂 Clique para enviar seu arquivo HTML</span>
          <input type="file" id="upload" accept=".html" onChange={handleUpload} className="hidden" />
        </label>

        <textarea
          value={comando}
          onChange={(e) => setComando(e.target.value)}
          placeholder="Ex: Adicione um botão do WhatsApp abaixo do texto 'Agende sua consulta'"
          className="w-full max-w-3xl h-32 border rounded-md p-4 text-gray-700 shadow-sm focus:outline-blue-500"
        ></textarea>

        <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
          {sugestoes.map((s, i) => (
            <button
              key={i}
              onClick={() => setComando(s)}
              className="bg-gray-100 hover:bg-blue-100 text-sm text-gray-800 px-3 py-2 rounded border border-gray-200"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            onClick={aplicarComando}
            disabled={loading || !htmlOriginal || !comando}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-40"
          >
            {loading ? 'Processando...' : 'Aplicar comando IA'}
          </button>

          <button
            onClick={desfazer}
            disabled={historico.length === 0}
            className="bg-yellow-500 text-white px-4 py-3 rounded-md hover:bg-yellow-600 disabled:opacity-30"
          >
            🖙 Desfazer
          </button>

          <button
            onClick={refazer}
            disabled={refazerPilha.length === 0}
            className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 disabled:opacity-30"
          >
            🔁 Refazer
          </button>
        </div>

        {loading && (
          <div className="w-full max-w-3xl h-2 bg-gray-200 rounded overflow-hidden mt-4">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${progresso}%` }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-center font-semibold mb-2 text-gray-700">🔍 Versão Original</h2>
          <iframe
            className="w-full h-[500px] border shadow rounded-md"
            srcDoc={htmlOriginal ? withCSS(htmlOriginal) : '<p class="text-center mt-24 text-gray-400">Nenhum HTML carregado.</p>'}
            sandbox=""
          />
        </div>
        <div>
          <h2 className="text-center font-semibold mb-2 text-gray-700">✅ Versão Editada</h2>
          <iframe
            className="w-full h-[500px] border shadow rounded-md"
            srcDoc={htmlEditado ? withCSS(htmlEditado) : '<p class="text-center mt-24 text-gray-400">Sem alterações ainda.</p>'}
            sandbox=""
          />
        </div>
      </div>

      {htmlEditado && (
        <div className="text-center mt-8">
          <button
            onClick={baixarEditado}
            className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700"
          >
            ⬇️ Baixar HTML Editado
          </button>
        </div>
      )}
    </div>
  );
}
