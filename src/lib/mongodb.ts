import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Está faltando a variável de ambiente secreta (MONGODB_URI) no arquivo .env!');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 5000,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function pingDatabase(clientConnection: Promise<MongoClient>) {
  try {
    const resolvedClient = await clientConnection;
    await resolvedClient.db('admin').command({ ping: 1 });
    console.log('🚀 BANCO DE DADOS ONLINE');
  } catch (error) {
    console.error('Falha de Ping no Atlas:', error);
  }
}

if (process.env.NODE_ENV === 'development') {
  // Em dev, nós queremos preservar uma única conexão rodando na RAM globalmente (Singleton Mode)
  // em vez de criar dezenas de conexões concorrentes a cada F5 na tela do React (HMR).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
    pingDatabase(globalWithMongo._mongoClientPromise);
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // Em PRD, não usamos Global Variables e sim uma nova alocação simples para cada Call Serverless
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
  pingDatabase(clientPromise);
}

// Este construtor vai agir como "Ponte" primária em todas as rotas API para que elas "respirem".
export default clientPromise;
