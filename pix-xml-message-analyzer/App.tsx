
import React, { useState, useMemo } from 'react';
import { Search, Trash2, ArrowRightLeft, FileJson, Download, FileText } from 'lucide-react';
import { parseXmlMessages } from './services/parser';
import { Side, MessageInfo } from './types';
import { MessageDetails } from './components/MessageDetails';

const App: React.FC = () => {
  const [payerXml, setPayerXml] = useState('');
  const [receiverXml, setReceiverXml] = useState('');

  const payerData = useMemo(() => payerXml ? parseXmlMessages(payerXml) : null, [payerXml]);
  const receiverData = useMemo(() => receiverXml ? parseXmlMessages(receiverXml) : null, [receiverXml]);

  const clear = (side: Side) => {
    if (side === Side.Payer) setPayerXml('');
    else setReceiverXml('');
  };

  const downloadFullLogs = () => {
    const formatSection = (title: string, data: any) => {
      if (!data) return `=== ${title.toUpperCase()} ===\nNenhum dado processado para este lado.\n\n`;
      let text = `================================================================================\n`;
      text += `=== ${title.toUpperCase()} ===\n`;
      text += `================================================================================\n\n`;
      
      const messages = [
        { label: 'Pacs.008', info: data.pacs008 },
        { label: 'Pacs.002 Retorno', info: data.pacs002Return },
        { label: 'Pacs.002 Final', info: data.pacs002Final }
      ];

      messages.forEach(m => {
        if (m.info?.busMsg) {
          // JSON.stringify without the '2' space parameter ensures it's on a single line
          text += `${m.label}: ${JSON.stringify(m.info.busMsg)}\n`;
        } else {
          text += `${m.label}: [Mensagem não encontrada ou JSON inválido]\n`;
        }
      });
      return text + '\n';
    };

    const content = formatSection('Fluxo Pagador', payerData) + "\n" + formatSection('Fluxo Recebedor', receiverData);
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PIX_BusMsg_SingleLine_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasData = payerData || receiverData;

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded flex items-center justify-center text-white shadow-md">
              <ArrowRightLeft size={20} />
            </div>
            <div>
              <h1 className="font-bold text-md text-slate-800 tracking-tight leading-none">PIX JSON Parser</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">BusMsg Content Extractor</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mr-4 border-r border-slate-100 pr-6">
              <span className="text-indigo-500">1º: 008</span>
              <span className="text-emerald-500">2º: 002 Ret</span>
              <span className="text-amber-500">3º: 002 Fin</span>
            </div>
            
            {hasData && (
              <button 
                onClick={downloadFullLogs}
                className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-slate-800 transition-all shadow-sm active:scale-95"
              >
                <Download size={14} />
                Download TXT (Single Line)
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.15em]">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                Input Pagador
              </label>
              <button onClick={() => clear(Side.Payer)} className="text-slate-300 hover:text-rose-500 transition-colors p-1" title="Limpar">
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              className="w-full h-48 p-4 bg-white border border-slate-200 rounded-xl shadow-inner text-xs mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none placeholder:text-slate-200"
              placeholder='Cole o log do Pagador aqui...'
              value={payerXml}
              onChange={(e) => setPayerXml(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.15em]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Input Recebedor
              </label>
              <button onClick={() => clear(Side.Receiver)} className="text-slate-300 hover:text-rose-500 transition-colors p-1" title="Limpar">
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              className="w-full h-48 p-4 bg-white border border-slate-200 rounded-xl shadow-inner text-xs mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-slate-200"
              placeholder='Cole o log do Recebedor aqui...'
              value={receiverXml}
              onChange={(e) => setReceiverXml(e.target.value)}
            />
          </div>
        </div>

        {hasData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200"></div>
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Resultados Extraídos</h2>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <FileText size={14} className="text-indigo-500" />
                  <h3 className="font-black text-[11px] text-slate-700 uppercase tracking-wider">Lado Pagador</h3>
                </div>
                <MessageDetails title="1. Pacs.008 (Transferência)" info={payerData?.pacs008} />
                <MessageDetails title="2. Pacs.002 (Retorno)" info={payerData?.pacs002Return} />
                <MessageDetails title="3. Pacs.002 (Final)" info={payerData?.pacs002Final} />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <FileText size={14} className="text-emerald-500" />
                  <h3 className="font-black text-[11px] text-slate-700 uppercase tracking-wider">Lado Recebedor</h3>
                </div>
                <MessageDetails title="1. Pacs.008 (Transferência)" info={receiverData?.pacs008} />
                <MessageDetails title="2. Pacs.002 (Retorno)" info={receiverData?.pacs002Return} />
                <MessageDetails title="3. Pacs.002 (Final)" info={receiverData?.pacs002Final} />
              </div>
            </div>
          </div>
        )}

        {!hasData && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-slate-100 rounded-3xl shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
              <FileJson size={32} />
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Aguardando Input</h3>
            <p className="text-slate-400 max-w-xs mt-2 text-[11px] font-medium leading-relaxed px-6">
              O sistema identificará os campos <code className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">"content"</code> escapados e extrairá os objetos BusMsg completos.
            </p>
          </div>
        )}
      </main>

      <footer className="mt-20 border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.3em]">
            PIX ISO 20022 DEBUGGER TOOL • DOWNLOAD CONTENT SUPPORTED
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
