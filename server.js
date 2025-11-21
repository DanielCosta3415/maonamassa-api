#!/usr/bin/env node

/**
 * ============================================================================
 * server.js - Servidor JSON Server (Mão na Massa API)
 * ============================================================================
 *
 * Propósito: Executar JSON Server com autenticação JWT baseado em
 *           esquema relacional (8 tabelas)
 *
 * Stack: Node.js + Express.js + JSON Server + json-server-auth
 *
 * Tabelas (db.json):
 *   1. users          - Autenticação + cadastro base
 *   2. clients         - Dados específicos cliente
 *   3. professionals   - Dados específicos profissional
 *   4. portfolios      - Fotos/trabalhos do profissional
 *   5. contracts       - Pedidos/serviços
 *   6. services        - Categorias de serviços
 *   7. notifications   - Notificações locais
 *   8. favorites       - Profissionais favoritados
 *
 * Deploy: Local (node server.js) ou Vercel (via vercel.json)
 *
 * ============================================================================
 */

const jsonServer = require('json-server');
const auth = require('json-server-auth');
const path = require('path');

// ============================================================================
// CRIAR SERVIDOR
// ============================================================================

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));

/** Regras de acesso para as rotas das "tabelas" do JSON Server.
 *
 *  Não há como proteger a rota `contracts` através de regras de dono (`6**`)
 *  pois não é possível determinar o dono do dado através do `userId`, visto
 *  que tanto clientes quanto profissionais precisam ter o acesso de leitura/escrita
 *  do contrato após criados.
 *
 *  Além disso, os profissionais podem criar um novo contrato após visualizarem
 *  e aceitarem os `services` pedidos pelos clientes.
 */
const accessRules = auth.rewriter({
  // Só o dono dos dados pode modificá-los.
  "users": 600,

  // Só o dono dos dados pode modificá-los e os outros podem apenas visualizar.
  "clients": 644,
  "professionals": 644,

  // Só o profissional pode modificar seus portifólios,
  // enquanto o cliente e público podem apenas visualizar.
  "portfolios": 644,

  // Só o cliente pode modificar os serviços solicitados,
  // enquanto os profissionais podem apenas visualizar.
  "services": 640,

  // Só o cliente e o profissional podem modificar as contratações.
  "contracts": 660,

  // Só o dono das notificações pode modificá-las.
  "notifications": 600,

  // Só o cliente pode modificar os profissionais favoritos.
  "favorites": 600
});

/** O pacote `json-server-auth` exige que o banco de dados seja
 *  [associado ao `server` (ou `app`) criado](https://github.com/jeremyben/json-server-auth/tree/master#module-usage-)
 *  para que ele possa gerenciar usuários e tokens JWT.
 */
server.db = router.db;

// Middlewares padrão (logging, CORS, body parser)
const middlewares = jsonServer.defaults({
  noCors: false,
  bodyParser: true
});

// ============================================================================
// APLICAR MIDDLEWARES E ROTEADORES
// ============================================================================

// 1. Middlewares globais
server.use(middlewares);

// Middleware para adicionar timestamps automaticamente
server.use((req, res, next) => {
  if (req.method === 'POST') {
    // Adiciona data de criação em novos registros
    req.body.createdAt = new Date().toISOString();
    req.body.updatedAt = new Date().toISOString();
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    // Atualiza data de edição em registros editados
    req.body.updatedAt = new Date().toISOString();
  }

  next();
});

// 2. Autenticação JWT + regras de acesso
server.use(accessRules);
server.use(auth);

// ============================================================================
// ENDPOINTS CUSTOMIZADOS
// ============================================================================

// Health Check
server.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    api: 'Mão na Massa (JSON Server)',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    tables: [
      'users',
      'clients',
      'professionals',
      'portfolios',
      'contracts',
      'services',
      'notifications',
      'favorites'
    ]
  });
});

// Endpoint para buscar profissionais por proximidade
// GET /api/professionals/search?lat=-19.9167&lon=-43.9345&radius=8&servico_id=1
server.get('/api/professionals/search', (req, res) => {
  const { lat, lon, radius = 8, servico_id } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({
      error: 'Parâmetros obrigatórios: lat, lon',
      example: '/api/professionals/search?lat=-19.9167&lon=-43.9345&radius=8'
    });
  }

  // Aqui seria implementada lógica Haversine no backend
  // Por enquanto, cliente faz cálculo (vs. lógica em backend)
  res.json({
    message: 'Busca por proximidade disponível',
    params: { lat, lon, radius, servico_id },
    note: 'Cálculo de distância realizado no cliente (Haversine)'
  });
});

// Endpoint para atualizar status de contratacao
// PUT /api/contracts/:id/status
server.put('/api/contracts/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatus = ['criado', 'aceito', 'em_andamento', 'concluido', 'cancelado'];

  if (!validStatus.includes(status)) {
    return res.status(400).json({
      error: `Status inválido. Deve ser um de: ${validStatus.join(', ')}`
    });
  }

  res.json({
    message: `Status atualizado para: ${status}`,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para atualizar avaliação de contratacao
// PUT /api/contracts/:id/avaliar
server.put('/api/contracts/:id/avaliar', (req, res) => {
  const { nota, comentario } = req.body;

  if (nota < 1 || nota > 5) {
    return res.status(400).json({
      error: 'Nota deve estar entre 1 e 5'
    });
  }

  res.json({
    message: 'Avaliação registrada',
    nota,
    comentario,
    timestamp: new Date().toISOString()
  });
});

// 4. Roteador (CRUD automático para todas as tabelas)
server.use(router);

// ============================================================================
// EXPORTAR PARA VERCEL
// ============================================================================

module.exports = server;

// ============================================================================
// EXECUÇÃO LOCAL
// ============================================================================

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     🚀 Mão na Massa - JSON Server (API Fake) 🚀       ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`\n📡 Servidor rodando em: http://localhost:${PORT}`);

    console.log('\n📊 ENDPOINTS DISPONÍVEIS:\n');

    console.log('🔐 AUTENTICAÇÃO:');
    console.log('   POST   /register               Cadastro (users)');
    console.log('   POST   /login                  Login (retorna JWT)');

    console.log('\n👤 USERS:');
    console.log('   GET    /users                  Listar');
    console.log('   GET    /users/:id              Detalhe');
    console.log('   PUT    /users/:id              Editar');

    console.log('\n🛍️  CLIENTS:');
    console.log('   GET    /clients                Listar');
    console.log('   GET    /clients/:id            Detalhe');
    console.log('   PUT    /clients/:id            Editar');

    console.log('\n👨‍💼 PROFESSIONALS:');
    console.log('   GET    /professionals          Listar todos');
    console.log('   GET    /professionals/:id      Detalhe');
    console.log('   PUT    /professionals/:id      Editar');
    console.log('   GET    /api/professionals/search?lat=X&lon=Y&radius=Z');

    console.log('\n🖼️  PORTFOLIOS:');
    console.log('   GET    /portfolios             Listar');
    console.log('   GET    /portfolios?professional_id=X');
    console.log('   POST   /portfolios             Criar');

    console.log('\n📋 SERVICES/CATEGORIES:');
    console.log('   GET    /services               Listar');

    console.log('\n🤝 CONTRACTS (Orders):');
    console.log('   POST   /contracts             Criar pedido');
    console.log('   GET    /contracts             Listar');
    console.log('   GET    /contracts/:id         Detalhe');
    console.log('   PUT    /contracts/:id         Atualizar');
    console.log('   PUT    /api/contracts/:id/status      Mudar status');
    console.log('   PUT    /api/contracts/:id/avaliar     Avaliar');
    console.log('   DELETE /contracts/:id         Cancelar');

    console.log('\n💬 NOTIFICATIONS:');
    console.log('   GET    /notifications         Listar');
    console.log('   POST   /notifications         Criar');

    console.log('\n⭐ FAVORITES:');
    console.log('   GET    /favorites             Listar');
    console.log('   POST   /favorites             Adicionar');
    console.log('   DELETE /favorites/:id         Remover');

    console.log('\n🏥 SAÚDE:');
    console.log('   GET    /health                 Health check');

    console.log('\n════════════════════════════════════════════════════════\n');
    console.log('📖 Teste no navegador: http://localhost:3000/professionals');
    console.log('📚 Documentação: https://github.com/seu-usuario/maonamassa-api');
    console.log('\n');
  });
}
