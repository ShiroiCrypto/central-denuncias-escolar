<div align="center">
  
  # 🛡️ Quantum Denúncias Escolar
  **Plataforma Segura e Anônima para Monitoramento e Gestão de Ocorrências Escolares**
  
  [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShiroiCrypto%2Fcentral-denuncias-escolar)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
</div>

<br />

## 📖 Sobre o Projeto
**Quantum Denúncias** é uma Single Page Application (SPA) moderna, concebida para fornecer aos alunos um ambiente 100% seguro (e de uso amigável) na hora de reportarem incidentes sofridos ou observados dentro da instituição. 

Para a coordenação, o sistema provê um **Dashboard Administrativo** instantâneo utilizando fluxos e trilhas gerenciais em Kanban — auxiliando gestores na rápida triagem e rastreio de reincidências (cruzamentos de dados).

---

## ✨ Principais Funcionalidades

### 🎓 **Para o Aluno (Ambiente Público)**
- 🔒 **Garantia de Anonimato:** Nenhuma informação de acesso, IP ou localização do dispositivo é requisitada ou salva.
- 📱 **Foco Mobile First:** Totalmente preparado para leitura em fluxos rápidos por leituras via QR Code em cartazes escolares.
- 📝 **Preenchimento Guiado:** Validações de comprimento de texto instantâneas com feedback de interface através da biblioteca Framer Motion.

### 👨‍🏫 **Para a Coordenação Escolar (Dashboard Administrativo)**
- 📊 **Mapa de Calor Abstrato:** O sistema processa cruzamentos de dados instantâneos demonstrando estatísticas visuais dos "Locais Críticos" diretamente no painel.
- ⚠️ **Alerta de Reincidência (Smart Alert):** Quando múltiplos relatos independentes chegam citando uma mesma vítima, o sistema injeta *flags vermelhas de urgência* em todas as pontas dos painéis de investigação.
- 🗂️ **Trilha de Apuração (Kanban):** Colunas de progresso no estilo Trello (Entrada Diária ➔ Em Andamento ➔ Concluídas) com cartões detalhados e popups customizados (Modais).

---

## 🛠️ Tecnologias Utilizadas
A plataforma é construída sobre um ecossistema minimalista, moderno e altamente reativo:
- **[Next.js](https://nextjs.org/) (App Router)** - Framework React para Front-end renderizado perfeitamente e API local.
- **[Tailwind CSS](https://tailwindcss.com/)** - UI elegante, responsiva, rápida e padronizada.
- **[Framer Motion](https://www.framer.com/motion/)** - Motor avançado para as transições sedosas do Dashboard.
- **[Lucide Icons](https://lucide.dev/)** - Iconografia vetorial limpa e embutida.
- **Node.js (FileSystem API)** - Intermediação entre o Backend em Serverless local e os processos de banco de dados físicos simulados nativamente em (`.json`).

---

## 🚀 Como Executar Localmente

### 1️⃣ Clone este repositório
```bash
git clone https://github.com/ShiroiCrypto/central-denuncias-escolar.git
cd central-denuncias-escolar
```

### 2️⃣ Instale as dependências via NPM / YARN
```bash
npm install
```

### 3️⃣ Inicie o Servidor Local
```bash
npm run dev
```

### 4️⃣ Acesso
- O App vai renderizar visualmente em seu navegador na porta local: [http://localhost:3000](http://localhost:3000)
- **Acesso da Vistoria Escolar:** Navegue suavemente até o rodapé na área pública e acesse o "*Acesso Administrativo Institucional*" utilizando a sua chave de demonstração padrão: `admin123`.

---

## ☁️ Deploy via Vercel
O projeto possui arquitetura Zero-Configuration compatível com os serviços de infraestutura em nuvem da **Vercel**, rodando de forka imediata na *Edge*!

🔗 **[Subir no Vercel (Botão 1 Clique)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FShiroiCrypto%2Fcentral-denuncias-escolar)**

---

## 📄 Licença
O Quantum Denúncias é livre e de código aberto protegido pela licença **MIT**. Existe a permissão ampla de alteração arquitetural, comercialização, distribuição ou bifurcações livres de limitações para qualquer um, em favor de promover um ambiente escolar cada vez melhor pelas vias do Open-Source!

<br />
<div align="center">
  <sub>Criado de 👨‍💻 para 👨‍💻 com ❤️ — Produzido em pair-programming com Shiroi & Matheus.</sub>
</div>
