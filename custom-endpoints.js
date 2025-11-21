const express = require('express');
const router = express.Router();

// Endpoint para buscar profissionais por proximidade
router.get('/professionals/search', (req, res) => {
  const { lat, lon, radius = 8, serviceId } = req.query;

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
    params: { lat, lon, radius, serviceId },
    note: 'Cálculo de distância realizado no cliente (Haversine)'
  });
});

// Endpoint para atualizar status de contratacao
router.put('/contracts/:id/status', (req, res) => {
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
router.put('/contracts/:id/avaliar', (req, res) => {
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

module.exports = router;
