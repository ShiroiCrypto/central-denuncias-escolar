'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, UploadCloud, MapPin, User, FileText, 
  CheckCircle2, AlertCircle, Lock, ArrowRight, ArrowLeft, 
  Inbox, Activity, Archive, BarChart3, AlertTriangle, X 
} from 'lucide-react';

// =========================================================================
// TIPAGEM DOS DADOS E CONSTANTES GLOBAIS
// =========================================================================
type StatusDenuncia = 'novas' | 'investigacao' | 'resolvido';

interface Denuncia {
  id: string;
  description: string;
  victim: string;
  location: string;
  status: StatusDenuncia;
  createdAt: string;
}

// =========================================================================
// MOTOR PRINCIPAL DA SPA (Single Page Application)
// Agora usando API + JSON FS em vez de LocalStorage
// =========================================================================
export default function QuantumAppSPA() {
  const [currentView, setCurrentView] = useState<'form' | 'login' | 'dashboard'>('form');
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // MUDANÇA: Agora o useEffect faz uma chamada HTTP para a API Node do Next.js (.json)
  useEffect(() => {
    fetch('/api/denuncias')
      .then(res => res.json())
      .then(data => {
        setDenuncias(data);
      })
      .catch(console.error)
      .finally(() => {
        setIsLoaded(true); 
      });
  }, []);

  // Lógica OTIMISTA: Atualiza o status visualmente primeiro e, no fundo, faz a requisição pro JSON
  const atualizarStatus = async (id: string, novoStatus: StatusDenuncia) => {
    const denunciasAtualizadas = denuncias.map(d => 
      d.id === id ? { ...d, status: novoStatus } : d
    );
    setDenuncias(denunciasAtualizadas);
    
    try {
      await fetch('/api/denuncias', {
        method: 'PUT',
        body: JSON.stringify({ id, status: novoStatus })
      });
    } catch(e) {
      console.error("Erro na atualização silenciosa pro Backend.", e);
    }
  };

  if (!isLoaded) return null; 

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-gray-50 to-indigo-50/30 font-sans text-gray-900 overflow-x-hidden">
      <AnimatePresence mode="wait">
        
        {currentView === 'form' && (
          <StudentFormView 
            key="form"
            onSave={(novaDenuncia) => {
               setDenuncias([...denuncias, novaDenuncia]);
            }}
            onGoToAdmin={() => setCurrentView('login')}
          />
        )}
        
        {currentView === 'login' && (
          <AdminLoginView 
            key="login"
            onBack={() => setCurrentView('form')}
            onSuccess={() => setCurrentView('dashboard')}
          />
        )}
        
        {currentView === 'dashboard' && (
          <AdminDashboardView 
            key="dashboard"
            denuncias={denuncias}
            onUpdateStatus={atualizarStatus}
            onLogout={() => setCurrentView('form')}
          />
        )}

      </AnimatePresence>
    </div>
  );
}

// =========================================================================
// COMPONENTE 1: VISÃO DO ALUNO (Formulário Integrado ao Backend/Json)
// =========================================================================
function StudentFormView({ onSave, onGoToAdmin }: { onSave: (d: Denuncia) => void, onGoToAdmin: () => void }) {
  const [description, setDescription] = useState('');
  const [victim, setVictim] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const descriptionError = description.length > 0 && description.length < 10 
    ? "A descrição deve ter pelo menos 10 caracteres." : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.length < 10) return setError("Detalhe melhor o que aconteceu (mín. 10 caracteres).");
    if (!location) return setError("Selecione o local da ocorrência.");

    setError('');
    setIsSubmitting(true);

    try {
      const novaDenuncia: Denuncia = {
        id: crypto.randomUUID(), 
        description,
        victim: victim.trim() || 'Não informada',
        location,
        status: 'novas',
        createdAt: new Date().toISOString()
      };

      const resposta_servidor = await fetch('/api/denuncias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaDenuncia)
      });
      
      if (!resposta_servidor.ok) throw new Error("Falha no servidor");

      onSave(novaDenuncia);
      setIsSubmitted(true);
    } catch (err) {
      setError("Ocorreu um erro ao salvar o relato.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-[2rem] shadow-xl max-w-md w-full text-center border border-gray-100"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 size={40} className="stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Segurança Garantida!</h2>
          <p className="text-gray-600 mb-8 font-medium">Sua denúncia foi registrada de forma <strong>100% anônima</strong> no servidor da instituição.</p>
          <button 
            onClick={() => { setIsSubmitted(false); setDescription(''); setVictim(''); setLocation(''); }}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-md shadow-indigo-200 hover:bg-indigo-700 transition transform hover:-translate-y-1"
          >
            Fazer Nova Denúncia
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col min-h-[100dvh]">
      <div className="flex-1 flex justify-center items-center py-6 px-4">
        <div className="max-w-md w-full space-y-6">
          
          <div className="text-center pt-4">
            <div className="flex justify-center mb-5"><div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200"><ShieldAlert size={38} className="stroke-[2]" /></div></div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quantum <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Denúncias</span></h1>
            <div className="mt-3"><span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 py-1.5 px-4 rounded-full inline-flex items-center gap-1.5 shadow-sm"><ShieldAlert size={14} /> Ambiente Seguro e Anônimo</span></div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl py-8 px-5 sm:px-8 shadow-2xl rounded-[2.5rem] border border-white">
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm flex items-start gap-2.5 overflow-hidden border border-red-100">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" /> <span className="font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-indigo-100 group-focus-within:text-indigo-600 transition"><FileText size={16} /></span>
                  O que aconteceu? <span className="text-red-500">*</span>
                  <span className={`ml-auto text-xs font-bold ${description.length < 10 ? 'text-gray-400' : 'text-emerald-500'}`}>
                    {description.length}/10 min
                  </span>
                </label>
                <textarea
                  value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
                  className={`w-full px-4 py-3.5 rounded-2xl border-2 ${descriptionError ? 'border-red-300 focus:ring-red-500 bg-red-50/30' : 'border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-gray-50/50 hover:bg-gray-50'} transition-all resize-none outline-none font-medium text-gray-800 placeholder:text-gray-400`}
                  placeholder="Relate os detalhes..."
                />
                <AnimatePresence>
                  {descriptionError && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-red-500 text-xs font-medium mt-1.5">
                      {descriptionError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-indigo-100 group-focus-within:text-indigo-600 transition"><User size={16} /></span>
                  Quem é a vítima alvo? <span className="text-gray-400 font-medium text-xs ml-1">(Opcional)</span>
                </label>
                <input
                  type="text" value={victim} onChange={(e) => setVictim(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-gray-50/50 outline-none font-medium placeholder:text-gray-400"
                  placeholder="Nome do alvo (Se houver)"
                />
              </div>

               <div className="group">
                <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="p-1.5 bg-gray-100 rounded-lg group-focus-within:bg-indigo-100 group-focus-within:text-indigo-600 transition"><MapPin size={16} /></span>
                  Onde ocorreu? <span className="text-red-500">*</span>
                </label>
                <select
                  value={location} onChange={(e) => setLocation(e.target.value)} required
                  className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 bg-gray-50/50 outline-none font-medium cursor-pointer"
                >
                  <option value="" disabled>Selecione um local</option>
                  <option value="Pátio">Pátio</option>
                  <option value="Corredores">Corredores</option>
                  <option value="Banheiros">Banheiros</option>
                  <option value="Refeitório">Refeitório</option>
                  <option value="Salas de Aula">Salas de Aula</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <button
                type="submit" disabled={isSubmitting || description.length < 10 || !location}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-2xl shadow-xl shadow-indigo-200 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500/30 transition-all disabled:opacity-50 active:scale-95 transform hover:-translate-y-1"
              >
                {isSubmitting ? "Gravando no Banco..." : "Concluir Denúncia Anônima"}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div className="w-full flex justify-center pb-6">
        <button 
          onClick={onGoToAdmin}
          className="text-xs text-gray-400 focus-visible:text-indigo-600 hover:text-indigo-600 font-medium transition-colors flex items-center gap-1.5 opacity-60 hover:opacity-100 bg-transparent p-2 rounded-lg"
        >
          <Lock size={12} /> Acesso Administrativo Institucional
        </button>
      </div>
    </motion.div>
  );
}

// =========================================================================
// COMPONENTE 2: VISÃO DE LOGIN DO DISPOSITIVO (Professores)
// =========================================================================
function AdminLoginView({ onBack, onSuccess }: { onBack: () => void, onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { 
      onSuccess();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="min-h-[100dvh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border border-gray-100">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-900 mb-8 flex items-center gap-2 text-sm font-bold transition-colors">
          <ArrowLeft size={16} /> Área de Alunos
        </button>
        
        <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-violet-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-indigo-200">
          <Lock size={30} className="stroke-[2.5]" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Painel de Gestão Escolar</h2>
        <p className="text-sm text-gray-500 mb-8 font-medium">Digite a chave de acesso operacional.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="password" autoFocus placeholder="Senha (admin123)"
              value={password} onChange={e => setPassword(e.target.value)}
              className={`w-full px-4 py-3.5 rounded-xl border-2 ${error ? 'border-red-400 bg-red-50 text-red-900' : 'border-gray-100 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 bg-gray-50'} outline-none transition-all font-bold text-lg`}
            />
          </div>
          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-colors shadow-xl active:scale-95 flex items-center justify-center gap-2">
            Verificar Acesso <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}

// =========================================================================
// COMPONENTE 3: O DASHBOARD DO PROFESSOR COM KANBAN E MAPA DE DADOS
// =========================================================================
function AdminDashboardView({ denuncias, onUpdateStatus, onLogout }: { 
  denuncias: Denuncia[], 
  onUpdateStatus: (id: string, status: StatusDenuncia) => void,
  onLogout: () => void 
}) {

  const [selectedDenuncia, setSelectedDenuncia] = useState<Denuncia | null>(null);

  const freqVitimas = denuncias.reduce((acc, obj) => {
    const nomeLimpo = obj.victim.toLowerCase().trim();
    if (nomeLimpo && nomeLimpo !== 'não informada') {
      acc[nomeLimpo] = (acc[nomeLimpo] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const vitimasRecorrentes = Object.keys(freqVitimas).filter(nome => freqVitimas[nome] >= 2);

  const freqLocais = denuncias.reduce((acc, obj) => {
    const loc = obj.location;
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const rankingLocais = Object.entries(freqLocais).sort((a, b) => b[1] - a[1]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-[100dvh] bg-zinc-100 text-gray-800 pb-16">
      
      <nav className="bg-slate-900 text-white px-6 py-4 shadow-xl sticky top-0 z-20">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-xl"><ShieldAlert size={20} className="stroke-[2.5]" /></div>
            <h1 className="font-extrabold text-xl tracking-wide hidden sm:block">Centro de Gestão <span className="text-indigo-400 font-medium ml-1">Quantum</span></h1>
          </div>
          <button onClick={onLogout} className="text-sm font-bold bg-white/10 hover:bg-red-500 px-5 py-2.5 rounded-xl transition-all cursor-pointer">
            Sair do Sistema
          </button>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
        
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-indigo-600 p-8 rounded-[2rem] shadow-xl shadow-indigo-200 text-white flex flex-col justify-center overflow-hidden relative">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             <h3 className="text-lg font-medium text-indigo-100 mb-2">Monitoramento Total</h3>
             <p className="text-5xl font-extrabold mb-6 font-mono tracking-tighter">{denuncias.length}</p>
             <div className="bg-black/20 p-4 border border-white/10 rounded-2xl flex items-center justify-between backdrop-blur-sm">
                <span className="text-sm font-semibold">Casos Reincidentes:</span>
                <strong className={`text-xl ${vitimasRecorrentes.length > 0 ? 'text-amber-300 animate-pulse' : 'text-emerald-300'}`}>
                  {vitimasRecorrentes.length} Alertas
                </strong>
             </div>
          </div>

          <div className="lg:col-span-8 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-indigo-700 font-bold mb-6">
              <BarChart3 size={24} /> <h3 className="text-xl">Mapa de Calor (Vulnerabilidade de Zonas)</h3>
            </div>
            {rankingLocais.length === 0 ? (
              <p className="text-gray-400 text-sm font-medium p-4 bg-gray-50 rounded-xl text-center">Nenhuma zona com incidência relatada.</p>
            ) : (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {rankingLocais.slice(0,6).map(([local, count], idx) => {
                  const isTop = idx === 0; 
                  return (
                    <li key={local} className="flex flex-col gap-2 text-sm font-bold">
                      <div className="flex justify-between text-gray-700">
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400"/> {local}</span> 
                        <span className="text-gray-400">{count} registros</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${(count / rankingLocais[0][1]) * 100}%` }} 
                          transition={{ delay: 0.1 * idx, duration: 0.8 }}
                          className={`h-full ${isTop ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-indigo-400'} rounded-full`}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 text-slate-900 font-extrabold text-2xl mb-8">
             Trilha de Apuração
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            <KanbanColumn 
              title="Entrada Diária" icon={<Inbox size={20}/>} corFundo="bg-slate-200" corTexto="text-slate-800"
              items={denuncias.filter(d => d.status === 'novas')}
              textoAcao="Assumir Investigação" iconeAcao={<ArrowRight size={16} />} 
              onAction={(id: string) => onUpdateStatus(id, 'investigacao')} corBotaoAcao="bg-slate-800 hover:bg-black"
              vitimasRecorrentes={vitimasRecorrentes}
              onViewDetails={setSelectedDenuncia}
            />

            <KanbanColumn 
              title="Em Andamento" icon={<Activity size={20}/>} corFundo="bg-amber-100" corTexto="text-amber-900"
              items={denuncias.filter(d => d.status === 'investigacao')}
              textoAcao="Concluir Caso" iconeAcao={<CheckCircle2 size={16} />} 
              onAction={(id: string) => onUpdateStatus(id, 'resolvido')} corBotaoAcao="bg-amber-600 hover:bg-amber-700 shadow-amber-200"
              vitimasRecorrentes={vitimasRecorrentes}
              onViewDetails={setSelectedDenuncia}
            />

            <KanbanColumn 
              title="Casos Encerrados" icon={<Archive size={20}/>} corFundo="bg-emerald-100" corTexto="text-emerald-900"
              items={denuncias.filter(d => d.status === 'resolvido')}
              vitimasRecorrentes={vitimasRecorrentes}
              onViewDetails={setSelectedDenuncia}
            />
          </div>
        </section>
      </div>

      {/* MODAL (CARD GRANDÃO PARA DENÚNCIA) */}
      <AnimatePresence>
        {selectedDenuncia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col border-2 border-slate-100 overflow-hidden"
            >
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FileText size={22} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg">Detalhes do Relato</h3>
                    <p className="text-[11px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">Protocolo {selectedDenuncia.id.split('-')[0]}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedDenuncia(null)}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
                >
                  <X size={18} className="stroke-[2.5]" />
                </button>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Local do Acidente</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" /> {selectedDenuncia.location}</span>
                  </div>
                  <div className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Vítima Apontada</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1.5"><User size={16} className="text-slate-400" /> {selectedDenuncia.victim}</span>
                  </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                     <AlertCircle size={16} className="text-indigo-500" /> Descrição Completa:
                   </h4>
                   <p className="text-slate-700 font-medium leading-loose whitespace-pre-wrap bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm text-[15px]">
                     {selectedDenuncia.description}
                   </p>
                </div>
              </div>
              
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// =========================================================================
// SUB-COMPONENTE: ESTRUTURA VISUAL DE CADA COLUNA KANBAN
// =========================================================================
function KanbanColumn({ title, icon, corFundo, corTexto, items, textoAcao, iconeAcao, corBotaoAcao = "bg-indigo-600", onAction, vitimasRecorrentes, onViewDetails }: any) {
  return (
    <div className={`${corFundo} p-4 sm:p-5 rounded-[2rem] min-h-[500px] border border-black/5`}>
      <div className={`flex items-center gap-2.5 font-extrabold text-lg ${corTexto} mb-6 px-1`}>
        {icon} <h3>{title}</h3> 
        <span className="ml-auto bg-black/10 px-3 py-1 rounded-full text-sm font-bold shadow-sm">{items.length}</span>
      </div>
      
      <ul className="space-y-4">
        <AnimatePresence>
          {items.map((item: Denuncia) => {
             const nomeVit = item.victim.toLowerCase().trim();
             const isReincidente = vitimasRecorrentes.includes(nomeVit);

             return (
               <motion.li 
                 key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} 
                 className={`bg-white p-5 rounded-2xl shadow-sm border-[3px] transition-all transform hover:-translate-y-1 ${isReincidente ? 'border-red-400 shadow-red-100' : 'border-white'} relative group flex flex-col`}
               >
                 {isReincidente && (
                   <div className="absolute -top-3 left-[15px] bg-red-500 text-white text-[10px] uppercase font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 ring-2 ring-white">
                     <AlertTriangle size={12} className="stroke-[3]" /> URGENTE: MÚLTIPLOS RELATOS!
                   </div>
                 )}

                 <div className="text-xs text-gray-400 mb-2 font-bold flex justify-between items-center mt-2">
                   <span>{new Date(item.createdAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit'})}</span>
                   <span className="bg-gray-100/80 px-2 py-1 rounded-md text-gray-600 truncate max-w-[120px] ml-2">{item.location}</span>
                 </div>
                 
                 {/* CSS line-clamp para truncar texto nas viewzinhas */}
                 <p className="text-[14px] font-semibold text-gray-900 mb-3 leading-relaxed line-clamp-3 overflow-hidden text-ellipsis flex-1">
                   {item.description}
                 </p>
                 
                 <button 
                   onClick={() => onViewDetails && onViewDetails(item)} 
                   className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50/80 px-2.5 py-1.5 rounded-lg border border-indigo-100 transition-colors w-max mb-5"
                 >
                   Ler relato completo <ArrowRight size={10} />
                 </button>

                 <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50/80 py-2.5 px-3 rounded-xl mb-4 border border-gray-100 truncate">
                    <User size={14} className={`shrink-0 ${isReincidente ? "text-red-500" : "text-gray-400"}`} /> 
                    <span className={`truncate ${isReincidente ? "font-bold text-red-600" : "font-medium"}`}>
                      Vítima registrada: <span className={isReincidente ? "underline decoration-2" : ""}>{item.victim}</span>
                    </span>
                 </div>

                 {onAction && (
                   <button 
                     onClick={() => onAction(item.id)}
                     className={`w-full flex items-center justify-center gap-2 py-3.5 px-3 rounded-xl text-xs font-bold text-white transition-all shadow-md active:scale-95 ${corBotaoAcao}`}
                   >
                     {textoAcao} {iconeAcao}
                   </button>
                 )}
               </motion.li>
             );
          })}
        </AnimatePresence>
        
        {items.length === 0 && (
          <div className="text-center font-bold text-black/20 py-10 opacity-70 border-2 border-dashed border-black/10 rounded-2xl p-4">
            A coluna está vazia
          </div>
        )}
      </ul>
    </div>
  );
}
