import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// O caminho físico pro arquivo json (baseado no formato do projeto src)
const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

// Função auxiliar para garantir leitura e criação caso o arquivo falte
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
    return [];
  }
  const fileData = fs.readFileSync(DB_PATH, 'utf-8');
  try {
    return JSON.parse(fileData);
  } catch (err) {
    return [];
  }
}

// 1. GET - Buscar todas as denúncias para montar a Tela (Dashboard e Validações)
export async function GET() {
  const data = readDB();
  return NextResponse.json(data);
}

// 2. POST - Aluno insere uma nova denúncia, nós gravamos no .json
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const denuncias = readDB();
    
    // Anexa a nova
    denuncias.push(data);
    
    // Grava de volta sobrescrevendo o arquivo físico com indentação (null, 2)
    fs.writeFileSync(DB_PATH, JSON.stringify(denuncias, null, 2));

    return NextResponse.json({ success: true, message: 'Gravado com sucesso no JSON' });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar denúncia no banco JSON' }, { status: 500 });
  }
}

// 3. PUT - O Professor atualiza o status de uma denúncia (Kanban)
export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    const denuncias = readDB();
    
    const alteradas = denuncias.map((d: any) => 
      d.id === id ? { ...d, status } : d
    );
    
    fs.writeFileSync(DB_PATH, JSON.stringify(alteradas, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar denúncia no JSON' }, { status: 500 });
  }
}
