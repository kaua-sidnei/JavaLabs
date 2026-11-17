# Especificação de Segurança do Firestore (Phase 0 — Payload-First Security TDD)

## 1. Invariantes de Dados

1. **Autenticação Verificada Obrigatória**: Nenhuma leitura ou escrita em `/users/{userId}` ou suas subcoleções é permitida sem `request.auth != null` e `request.auth.token.email_verified == true`.
2. **Isolamento Estrito por Proprietário**: Um usuário somente pode acessar documentos onde `userId == request.auth.uid` e onde o campo interno `uid` / `userId` corresponde exatamente a `request.auth.uid`.
3. **Master Gate de Subcoleção**: Documentos em `/users/{userId}/progress/{atividadeId}` e `/users/{userId}/submissions/{submissionId}` exigem a existência do documento pai `/users/{userId}` (inclusive em escrita em lote via `existsAfter`).
4. **Integridade Temporal**: Todos os campos `updatedAt`, `atualizado_em`, `criado_em` e novos valores de `concluido_em` devem ser idênticos a `request.time`. Uma vez concluída a atividade (`resolvido == true`), `concluido_em` e `resolvido == true` são imutáveis.
5. **Limites Volumétricos e Regex de IDs**: Todos os IDs de rota e payload devem casar com `^[a-zA-Z0-9_-]+$` (`<= 128` chars); código salvo limitado a `25000` chars; `pontuacao` restrita ao intervalo `[0, 100]`.
6. **Zero Shadow Fields**: Todos os writes validam `keys().hasAll(...)` e `keys().hasOnly(...)` na criação e `affectedKeys().hasOnly(...)` em atualizações por ação.

## 2. "Dirty Dozen" Payloads (Vetores de Ataque Esperados -> PERMISSION_DENIED)

1. **Escrita Anônima (`progress`)**: Tentativa de criar `/users/uid1/progress/m01-ex01` com `request.auth == null` -> `PERMISSION_DENIED`.
2. **E-mail Não Verificado (`users`)**: Usuário autenticado com `email_verified: false` tentando gravar `/users/uid1` -> `PERMISSION_DENIED`.
3. **Sequestro de UID em Outro Usuário (`progress`)**: Usuário `uid2` tentando gravar `/users/uid1/progress/m01-ex01` -> `PERMISSION_DENIED`.
4. **Falsificação de `userId` no Payload**: Usuário `uid1` enviando `{ userId: "uid2", ... }` em `/users/uid1/progress/m01-ex01` -> `PERMISSION_DENIED`.
5. **ID Poisoning na Rota**: Documento `/users/uid1/progress/abc..130chars..` ou com caracteres inválidos (`$bad/id`) -> `PERMISSION_DENIED`.
6. **Shadow / Ghost Field Injection**: Payload de `ActivityProgress` contendo campo extra `{ isAdmin: true }` -> `PERMISSION_DENIED`.
7. **Pontuação Fora da Faixa (`> 100` ou `< 0`)**: `{ pontuacao: 999 }` ou `{ pontuacao: -5 }` -> `PERMISSION_DENIED`.
8. **Type Poisoning no `codigo_salvo` ou Payload > 25 KB**: `{ codigo_salvo: 12345 }` ou string com 30.000 caracteres -> `PERMISSION_DENIED`.
9. **Falsificação de Timestamp (`concluido_em` no futuro/passado)**: `{ resolvido: true, concluido_em: Timestamp(2020-01-01) }` -> `PERMISSION_DENIED`.
10. **Inconsistência `resolvido: false` com `concluido_em` preenchido**: `{ resolvido: false, concluido_em: request.time }` -> `PERMISSION_DENIED`.
11. **Reversão de Conclusão ou Alteração de `concluido_em` na Atualização**: Tentar alterar `resolvido` de `true` para `false` ou alterar `concluido_em` já existente -> `PERMISSION_DENIED`.
12. **PII Blanket Read / Mutação de Histórico Imutável**: Usuário `uid2` tentando ler `/users/uid1/private/profile`, ou `uid1` tentando `update` em `/users/uid1/submissions/{submissionId}` -> `PERMISSION_DENIED`.
