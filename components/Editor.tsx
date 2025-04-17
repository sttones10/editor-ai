
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Editor() {
  const [html, setHtml] = useState('');
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchCredits = async () => {
    const res = await axios.get('/api/credits', {
      headers: { 'x-user-id': 'guest' }
    });
    setCredits(res.data.credits);
  };

  const simulateProgress = () => {
    let current = 0;
    setProgress(0);
    const interval = setInterval(() => {
      current += Math.random() * 10;
      if (current >= 95) {
        clearInterval(interval);
      }
      setProgress(Math.min(current, 95));
    }, 200);
    return interval;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const interval = simulateProgress();

    try {
      const res = await axios.post('/api/edit-html', { html, command }, {
        headers: { 'x-user-id': 'guest' }
      });

      clearInterval(interval);
      setProgress(100);

      if (res.status === 403) {
        alert('Créditos insuficientes. Tente novamente amanhã.');
      } else {
        setOutput(res.data.updatedHtml);
        fetchCredits();
      }
    } catch {
      alert('Erro ao aplicar o comando.');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 1000);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4 text-sm text-gray-700 bg-gray-100 px-4 py-2 rounded">
        💳 Créditos disponíveis: <strong>{credits !== null ? credits : '...'}</strong> / 50
      </div>

      <textarea
        placeholder="Cole seu HTML aqui..."
        className="w-full h-48 p-4 border rounded mb-4 text-sm"
        value={html}
        onChange={(e) => setHtml(e.target.value)}
      />

      <input
        placeholder="Comando de edição (ex: Troque a imagem principal)"
        className="w-full p-3 border rounded mb-4 text-sm"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded disabled:opacity-50"
      >
        Aplicar comando IA
      </button>

      {loading && (
        <div className="w-full bg-gray-200 h-2 rounded mt-4 overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {output && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Resultado:</h3>
          <textarea
            className="w-full h-96 p-4 border rounded text-sm"
            value={output}
            readOnly
          />
        </div>
      )}
    </div>
  );
}
