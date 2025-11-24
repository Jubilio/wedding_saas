# 🗺️ Rotas e Funcionalidades Secundárias

Este arquivo documenta todas as rotas e funcionalidades que **não aparecem no menu principal** do site, mas são acessíveis via URL direta ou QR Code.

## 📸 Photo Booth

- **Rota**: `/photo-booth`
- **Acesso**: QR Code ou link direto
- **Descrição**: Permite que convidados tirem selfies com molduras personalizadas
- **Status**: ✅ Implementado (Fase 1 - MVP)
- **Funcionalidades**:
  - Acesso à câmera frontal
  - 4 opções de molduras (Sem moldura, Clássica, Polaroid, Floral)
  - Upload para Firebase Storage
  - Sistema de moderação (admin aprova antes de publicar)
- **Próximas Fases**:
  - Fase 2: Integração com galeria pública
  - Fase 3: Painel de moderação no admin
  - Fase 4: Download, compartilhamento social, QR code

---

## 🔐 Dashboard Administrativo

- **Rota**: `/gestao-casamento-2026`
- **Acesso**: URL secreta (não divulgar)
- **Descrição**: Painel de administração para gerenciar RSVPs e fotos
- **Status**: ✅ Implementado
- **Autenticação**: Firebase Authentication (email + senha)
- **Funcionalidades**:
  - Visualizar confirmações de presença
  - Exportar dados em CSV
  - Estatísticas de convidados
  - Deletar/limpar RSVPs
  - (Futuro) Moderar fotos do photo booth

---

## 📝 Template para Novas Funcionalidades

Quando adicionar uma nova rota/funcionalidade secundária, copie e preencha:

```markdown
## [Ícone] Nome da Funcionalidade
- **Rota**: `/caminho-da-rota`
- **Acesso**: [QR Code | Link direto | URL secreta]
- **Descrição**: Breve descrição do que faz
- **Status**: [🚧 Em desenvolvimento | ✅ Implementado | 📋 Planejado]
- **Autenticação**: [Pública | Requer login | Apenas admin]
- **Funcionalidades**:
  - Item 1
  - Item 2
- **Notas**: Qualquer informação adicional relevante
```

---

## 🎯 Funcionalidades Planejadas

### 📊 Painel de Estatísticas (Futuro)
- **Rota**: `/estatisticas-casamento` (sugestão)
- **Status**: 📋 Planejado
- **Descrição**: Visualização de dados agregados sobre o casamento
- **Ideias**:
  - Gráficos de confirmações ao longo do tempo
  - Mapa de origem dos convidados
  - Estatísticas de restrições alimentares
  - Timeline de fotos do photo booth

### 🎁 Lista de Presentes Interativa (Futuro)
- **Rota**: `/presentes` (já existe, mas pode ser expandida)
- **Status**: 📋 Planejado
- **Descrição**: Sistema de reserva de presentes
- **Ideias**:
  - Convidados podem "reservar" um presente
  - Integração com PIX para contribuições
  - Status de presentes já comprados

---

## 📌 Notas Importantes

1. **Segurança**: Rotas administrativas devem sempre ter autenticação
2. **SEO**: Rotas secundárias podem ter `robots.txt` para não indexar
3. **QR Codes**: Gerar QR codes para rotas que serão impressas
4. **Analytics**: Considerar tracking separado para rotas especiais
5. **Mobile First**: Todas as rotas secundárias devem ser mobile-friendly

---

**Última atualização**: 2025-11-21
