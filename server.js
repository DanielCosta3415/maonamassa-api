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
// PUT /api/contratacao/:id/status
server.put('/api/contratacao/:id/status', (req, res) => {
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
// PUT /api/contratacao/:id/avaliar
server.put('/api/contratacao/:id/avaliar', (req, res) => {
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
    console.log('   GET    /users                  List');
    console.log('   GET    /users/:id              Detail');
    console.log('   PUT    /users/:id              Edit');

    console.log('\n🛍️  CLIENTS:');
    console.log('   GET    /clients                List');
    console.log('   GET    /clients/:id            Detail');
    console.log('   PUT    /clients/:id            Edit');

    console.log('\n👨‍💼 PROFESSIONALS:');
    console.log('   GET    /professionals          List all');
    console.log('   GET    /professionals/:id      Detail');
    console.log('   PUT    /professionals/:id      Edit');
    console.log('   GET    /api/professionals/search?lat=X&lon=Y&radius=Z');

    console.log('\n🖼️  PORTFOLIOS:');
    console.log('   GET    /portfolios             List');
    console.log('   GET    /portfolios?professional_id=X');
    console.log('   POST   /portfolios             Create');

    console.log('\n📋 SERVICES/CATEGORIES:');
    console.log('   GET    /services               List');

    console.log('\n🤝 CONTRACTS (Orders):');
    console.log('   POST   /contracts             Create order');
    console.log('   GET    /contracts             List');
    console.log('   GET    /contracts/:id         Detail');
    console.log('   PUT    /contracts/:id         Update');
    console.log('   PUT    /api/contracts/:id/status      Change status');
    console.log('   PUT    /api/contracts/:id/avaliar     Rate');
    console.log('   DELETE /contracts/:id         Cancel');

    console.log('\n💬 NOTIFICATIONS:');
    console.log('   GET    /notifications         List');
    console.log('   POST   /notifications         Create');

    console.log('\n⭐ FAVORITES:');
    console.log('   GET    /favorites             List');
    console.log('   POST   /favorites             Add');
    console.log('   DELETE /favorites/:id         Remove');

    console.log('\n🏥 SAÚDE:');
    console.log('   GET    /health                 Health check');

    console.log('\n════════════════════════════════════════════════════════\n');
    console.log('📖 Teste no navegador: http://localhost:3000/professional');
    console.log('📚 Documentação: https://github.com/seu-usuario/maonamassa-api');
    console.log('\n');
  });
}
