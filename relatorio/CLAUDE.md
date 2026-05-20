# relatorio/ — Relatorio Semanal de Inteligencia

Relatorio que monitora redes sociais, puxa tendencias virais, faz diagnostico de performance e analisa os numeros da Tini Tiny.

---

## Arquivos

| Arquivo | O que faz |
|---|---|
| `perfis_monitoramento_semanal.md` | Lista de perfis monitorados: concorrentes, marcas referencia, influencers, curadoras, hashtags |
| `renovar_token_meta.py` | Script Python para renovar token Meta Ads (rotacao 60 dias). Le/escreve `.env` na raiz |
| `renovar-meta-token.sh` | Wrapper bash do script acima |
| `2026-XX-XX/` | Pastas por semana com relatorio.html e relatorio.pdf gerados |

## Como Gerar

Skill: `/relatorio-semanal`

1. Consultar `perfis_monitoramento_semanal.md` para saber quem/o que monitorar
2. Acessar redes sociais via Browserbase MCP ou APIs
3. Gerar HTML com dados + analise
4. Renderizar PDF via `npx playwright pdf`
5. Salvar em pasta da semana (ex: `2026-05-25/`)

## Token Meta

O token Meta Ads expira a cada ~60 dias. Renovar com:
```bash
python relatorio/renovar_token_meta.py
```
O script le `META_ACCESS_TOKEN` do `.env` na raiz e atualiza automaticamente.

## Cadencia

Roda manual domingo a noite. Futuro: automatizar no Railway.
