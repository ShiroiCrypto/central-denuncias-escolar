import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const DB_NAME = 'quantum_db';
const COL_NAME = 'denuncias';

// 1. GET (O motor de dados + Inteligência de Cruzamento do MongoDB)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COL_NAME);

    // PIPELINE DE AGREGAÇÃO (A Mágica Solicitada)
    // Usamos $lookup referenciando a própria coleção para caçar nomes cruzados.
    const pipeline = [
      {
        $lookup: {
          from: COL_NAME,
          let: { 
            v: { $toLower: { $trim: { input: { $ifNull: ["$vitima", ""] } } } },
            a: { $toLower: { $trim: { input: { $ifNull: ["$agressor", ""] } } } }
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    // A Vítima atual aparece em outros lugares (como Vítima ou Agressor)?
                    { $and: [
                        { $ne: ["$$v", ""] },
                        { $ne: ["$$v", "não informada"] },
                        { $ne: ["$$v", "não informado"] },
                        { $or: [
                           { $eq: [{ $toLower: { $trim: { input: { $ifNull: ["$vitima", ""] } } } }, "$$v"] },
                           { $eq: [{ $toLower: { $trim: { input: { $ifNull: ["$agressor", ""] } } } }, "$$v"] }
                        ]}
                    ]},
                    // O Agressor atual aparece em outros lugares (como Vítima ou Agressor)?
                    { $and: [
                        { $ne: ["$$a", ""] },
                        { $ne: ["$$a", "não informada"] },
                        { $ne: ["$$a", "não informado"] },
                        { $or: [
                           { $eq: [{ $toLower: { $trim: { input: { $ifNull: ["$vitima", ""] } } } }, "$$a"] },
                           { $eq: [{ $toLower: { $trim: { input: { $ifNull: ["$agressor", ""] } } } }, "$$a"] }
                        ]}
                    ]}
                  ]
                }
              }
            }
          ],
          as: "coincidencias_db"
        }
      },
      {
        // Se a contagem de coincidências no banco for MAIOR QUE 1 (ou seja, ele + 1 extra), ligue o alerta.
        $addFields: {
          alerta: { $gt: [{ $size: "$coincidencias_db" }, 1] },
          id: { $toString: "$_id" } // O Front-end em React precisa do 'id' em string para as Keys
        }
      },
      {
        $project: { 
          coincidencias_db: 0, // Inibe mostrar os laços na resposta JSON final (economia de rede)
          _id: 0
        }
      },
      { 
        $sort: { createdAt: -1 } 
      }
    ];

    const data = await collection.aggregate(pipeline).toArray();

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: 'Erro ao conectar ao banco' }, { status: 500 });
  }
}

// 2. POST (Enviando o Reporte para o Atlas)
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validando os dados vitais obrigatórios
    if (!data.relato || !data.local) {
      return NextResponse.json({ error: 'Relato/Local incorretos' }, { status: 400 });
    }

    const client = await clientPromise;
    const collection = client.db(DB_NAME).collection(COL_NAME);
    
    // Converte os dados brutos num Document do MondoDB
    const novoDoc = {
      relato: data.relato,
      vitima: data.vitima || 'Não informada',
      agressor: data.agressor || 'Não informado',
      local: data.local,
      status: 'novas', // Status Oculto da Vistoria Inicial
      createdAt: new Date().toISOString()
    };
    
    const result = await collection.insertOne(novoDoc);

    return NextResponse.json({ 
      success: true, 
      id: result.insertedId.toString(),
      message: 'Criptografado no Mongo Atlas!' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao conectar ao banco' }, { status: 500 });
  }
}

// 3. PUT (A Vistoria movendo cards no Trello/Kanban)
export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Envie um Id e o novo Status.' }, { status: 400 });
    }

    const client = await clientPromise;
    const collection = client.db(DB_NAME).collection(COL_NAME);
    
    const alterado = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: status } }
    );
    
    return NextResponse.json({ 
      success: true, 
      modified: alterado.modifiedCount
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao conectar ao banco' }, { status: 500 });
  }
}
