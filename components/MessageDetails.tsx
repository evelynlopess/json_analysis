
import React, { useState } from 'react';
import { MessageInfo } from '../types';
import { Info, AlertCircle, Clock, ChevronDown, ChevronUp, Cpu, Copy, Check } from 'lucide-react';

interface Props {
  info?: MessageInfo;
  title: string;
}

export const MessageDetails: React.FC<Props> = ({ info, title }) => {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!info) {
    return (
      <div className="p-3 border border-dashed border-slate-300 rounded-lg text-slate-400 text-[11px] flex items-center gap-2 italic">
        <AlertCircle size={14} />
        {title} não identificado no log
      </div>
    );
  }

  const isSuccess = info.status === 'ACSC' || info.status === 'ACTC' || !info.status;

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    if (text === JSON.stringify(info.busMsg, null, 2)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm transition-all hover:border-slate-300">
      <div className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-between ${isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
        <div className="flex items-center gap-2">
          <Info size={12} />
          {title}
        </div>
        <div className="flex items-center gap-2">
          {info.status && (
            <span className="px-1.5 py-0.5 rounded bg-white border border-current font-bold">
              {info.status}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-3 space-y-2">
        {info.id && (
          <div className="group relative">
            <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">ID da Mensagem (MsgId/BizMsgIdr)</p>
            <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:border-slate-200 transition-colors">
              <p className="text-[11px] mono text-slate-700 truncate flex-1 select-all" title={info.id}>
                {info.id}
              </p>
              <button 
                onClick={(e) => handleCopy(e, info.id || '')}
                className="text-slate-300 hover:text-slate-600 transition-colors"
              >
                <Copy size={10} />
              </button>
            </div>
          </div>
        )}
        
        {info.endToEndId && (
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">EndToEndId</p>
            <p className="text-[11px] mono text-blue-600 font-semibold truncate bg-blue-50/50 px-2 py-1 rounded border border-blue-100/50" title={info.endToEndId}>
              {info.endToEndId}
            </p>
          </div>
        )}

        <div className="flex gap-4 pt-1">
          {info.amount && (
            <div className="flex-1">
              <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Valor</p>
              <p className="text-[11px] font-bold text-slate-800">R$ {parseFloat(info.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          )}
          {info.timestamp && (
            <div className="flex-1 text-right">
              <p className="text-[9px] text-slate-400 font-bold uppercase mb-0.5">Timestamp</p>
              <p className="text-[11px] text-slate-600 flex items-center justify-end gap-1">
                <Clock size={10} />
                {new Date(info.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>
          )}
        </div>

        {info.reason && (
          <div className="p-1.5 bg-rose-50/30 rounded border border-rose-100/50">
            <p className="text-[9px] text-rose-500 font-bold uppercase">Motivo</p>
            <p className="text-[10px] text-rose-700 font-medium">{info.reason}</p>
          </div>
        )}

        {info.busMsg && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <button 
              onClick={() => setShowJson(!showJson)}
              className="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter hover:text-indigo-600 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Cpu size={12} />
                {showJson ? 'Recolher JSON' : 'Ver JSON BusMsg'}
              </span>
              {showJson ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            
            {showJson && (
              <div className="mt-2 relative group">
                <button 
                  onClick={(e) => handleCopy(e, JSON.stringify(info.busMsg, null, 2))}
                  className="absolute right-2 top-2 p-1.5 bg-slate-800 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="Copiar JSON Completo"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
                <pre className="p-3 bg-slate-900 rounded-md text-[10px] text-emerald-400 mono overflow-x-auto max-h-40 scrollbar-thin border border-slate-800">
                  {JSON.stringify(info.busMsg, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
