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
 *   2. cliente        - Dados específicos cliente
 *   3. professional   - Dados específicos profissional
 *   4. portfolio      - Fotos/trabalhos do profissional
 *   5. contratacao    - Pedidos/serviços
 *   6. servico        - Categorias de serviços
 *   7. notificacao    - Notificações locais
 *   8. favorito       - Profissionais favoritados
 *
 * Deploy: Local (node server.js) ou Vercel (via vercel.json)
 *
 * ============================================================================
 */

const jsonServer = require('json-server');
const auth = require('json-server-auth');
const path = require('path');

const customEndpoints = require('./custom-endpoints.js');

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
const defaultMiddlewares = jsonServer.defaults({
  noCors: false,
  bodyParser: true
});

// ============================================================================
// APLICANDO MIDDLEWARES E ROTEADORES
// ============================================================================

server.use(defaultMiddlewares);

// Adicionando timestamps automaticamente em metodos POST, PUT e PATCH.
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

// Autenticação JWT + regras de acesso
server.use(auth);

// ============================================================================
// ENDPOINTS CUSTOMIZADOS
// ============================================================================

// Verificação básica de saúde do servidor.
server.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    api: 'Mão na Massa (JSON Server)',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    tables: [
      'users',
      'cliente',
      'professional',
      'portfolio',
      'contratacao',
      'servico',
      'notificacao',
      'favorito'
    ]
  });
});

server.use("/api", customEndpoints);

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

    console.log('\n👤 USUÁRIOS:');
    console.log('   GET    /users                  Listar');
    console.log('   GET    /users/:id              Detalhe');
    console.log('   PUT    /users/:id              Editar');

    console.log('\n🛍️  CLIENTES:');
    console.log('   GET    /cliente                Listar');
    console.log('   GET    /cliente/:id            Detalhe');
    console.log('   PUT    /cliente/:id            Editar');

    console.log('\n👨‍💼 PROFISSIONAIS:');
    console.log('   GET    /professional           Listar todos');
    console.log('   GET    /professional/:id       Detalhe');
    console.log('   PUT    /professional/:id       Editar');
    console.log('   GET    /api/professionals/search?lat=X&lon=Y&radius=Z');

    console.log('\n🖼️  PORTFÓLIO:');
    console.log('   GET    /portfolio              Listar');
    console.log('   GET    /portfolio?professional_id=X');
    console.log('   POST   /portfolio              Criar');

    console.log('\n📋 SERVIÇOS/CATEGORIAS:');
    console.log('   GET    /servico                Listar');

    console.log('\n🤝 CONTRATAÇÕES (Pedidos):');
    console.log('   POST   /contratacao            Criar pedido');
    console.log('   GET    /contratacao            Listar');
    console.log('   GET    /contratacao/:id        Detalhe');
    console.log('   PUT    /contratacao/:id        Atualizar');
    console.log('   PUT    /api/contratacao/:id/status      Mudar status');
    console.log('   PUT    /api/contratacao/:id/avaliar     Avaliar');
    console.log('   DELETE /contratacao/:id        Cancelar');

    console.log('\n💬 NOTIFICAÇÕES:');
    console.log('   GET    /notificacao            Listar');
    console.log('   POST   /notificacao            Criar');

    console.log('\n⭐ FAVORITOS:');
    console.log('   GET    /favorito               Listar');
    console.log('   POST   /favorito               Adicionar');
    console.log('   DELETE /favorito/:id           Remover');

    console.log('\n🏥 SAÚDE:');
    console.log('   GET    /health                 Health check');

    console.log('\n════════════════════════════════════════════════════════\n');
    console.log('📖 Teste no navegador: http://localhost:3000/professional');
    console.log('📚 Documentação: https://github.com/seu-usuario/maonamassa-api');
    console.log('\n');
  });
}
