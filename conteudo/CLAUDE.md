# conteudo/ — Geracao de Conteudo

Geracao de conteudo a partir de templates pre-determinados para TikTok, Pinterest e Instagram.

---

## Dependencia: Banco de Fotos

Esta pasta depende de `fotos/` como banco de imagens. O fluxo e:

```
fotos/__classificacao/  →  photo-selector.js  →  render.js  →  output/
(banco de fotos)           (seleciona por         (renderiza      (posts prontos)
                            estampa/shot)          HTML→JPG)
```

- `templates/photo-selector.js` le as fotos classificadas de `../fotos/__classificacao/`
- `reels/build_video.py` le fotos de `../fotos/__classificacao/Dia das maes/`
- Rapports para --reference estao em `../fotos/estampas/`

**Se fotos novas forem adicionadas ou reclassificadas em `fotos/`, o conteudo gerado aqui ja reflete automaticamente.**

---

## Estrutura

```
conteudo/
├── brand/        ← Docs de identidade e estrategia
├── library/      ← Sistema operacional de conteudo (angles, hooks, matrix, voice)
├── reels/        ← Videos (build_video.py, frames, narracoes)
├── templates/    ← Templates HTML + photo-selector + render
├── remotion/     ← Componentes React para video (Remotion)
├── public/       ← Assets estaticos (rapports, brand elements, vozes)
└── output/       ← Posts gerados (prontos para publicacao)
```

## Workflow — Como Trabalhar

### Ordem de operacoes (sempre seguir)
1. **Receber slot** — Ex: "TikTok segunda, estampa Whimsical"
2. **Consultar MATRIX** — Identificar angulo + hook do slot (`library/MATRIX.md`)
3. **Consultar ANGLES** — Receita visual completa do angulo escolhido (`library/ANGLES.md`)
4. **Consultar HOOKS** — Hook exato + variacoes disponiveis (`library/HOOKS.md`)
5. **Consultar VOICE** — Tom e linguagem aprovados (`library/VOICE.md`)
6. **Gerar conteudo** — Usar prompt padrao com parametros preenchidos (ver MATRIX.md)
7. **Checar CHECKLIST** — Rodar checklist pre-publicacao (ver MATRIX.md secao final)
8. **Apresentar** — Mostrar para aprovacao da Bia. NUNCA publique sem aprovacao humana

---

## Arquivos de Referencia

### brand/ — Estrategia e Marca
| Arquivo | O que contem | Quando usar |
|---|---|---|
| `BRAND_GUIDE.md` | Identidade completa: visual, tom, foto, influencers | Sempre — e a biblia da marca |
| `MARKETING_STRATEGY.md` | Metricas, KPIs, calendario de campanhas, prioridades 2026 | Planejamento, campanhas, reports |
| `CONTENT_MATRIX.md` | 14 estampas estabelecidas x angulos x formatos | Geracao de briefs e posts |
| `CONTENT_MATRIX_NOVAS.md` | 5 conceitos novos x colorways | Lancamentos 2026 |
| `matriz_conteudo.csv` | CSV com status de producao por estampa/angulo | Tracking |

### library/ — Sistema de Conteudo
| Arquivo | O que contem | Quando usar |
|---|---|---|
| `ANGLES.md` | 14 angulos (A01-A14) com receita visual, formula de legenda, prompt-base | Escolher perspectiva/abordagem |
| `HOOKS.md` | 30+ hooks codificados com variacoes e dados de performance | Abertura de reels, captions, CTAs |
| `MATRIX.md` | Matriz semanal seg-dom, specs por plataforma, prompts, hashtags, checklist | Planejamento e execucao |
| `VOICE.md` | Tom de voz operacional, regua certo/errado, estrutura de legenda | Validar qualquer texto |
| `SOCIAL_PROOF.md` | Provas sociais por angulo, UGC guidelines, frases aprovadas | Conteudo com prova social |

---

## Templates de Post

### Post 4 — Foto Pura (pronto)
```bash
node conteudo/templates/render.js --template post4 --estampa tt-vichy-rosa --count 3
```
- Seleciona fotos de `fotos/__classificacao/` via `photo-selector.js`
- Renderiza HTML para JPG 1080x1350 via Playwright
- Output em `conteudo/output/post4-{estampa}-{data}/`

### Roadmap de Templates
- Post 3 (reel poetico) → Post 1 (trend carousel) → Post 2 (storytelling)

---

## Reels / Video

### build_video.py
Gera MP4 1080x1920 com fotos + slides de marca + narracacao + xfade.
```bash
python conteudo/reels/build_video.py
```
Requer ffmpeg instalado.

### Remotion (em desenvolvimento)
Componentes React em `remotion/` para geracao estruturada de video.
- `WrapSemanal.jsx` — Template wrap semanal
- `ReelsComparacao.jsx` — Comparacao de reels

---

## Regras da Marca (completas)

### Identidade Visual
- **Cor primaria:** Sage Mint `#C1D9D7`
- **Cor secundaria:** Blush Pink `#F2C4C4`
- **Neutro:** Off-White `#FFFDF9`
- **Acento:** Deep Sage `#7A9E9C`
- **Texto:** Near Black `#262626`
- **Paleta UI/digital:** Dark Sage `#A4B6B4` | Light Mint `#DFF1F0` | White `#FFFFFF`
- **NUNCA usar:** vermelho, azul primario, amarelo vibrante, neon, alta saturacao
- **Logo:** "tini tiny" SEMPRE minusculo, bold rounded retro-bubbly serif
- **Fonte:** Poppins Bold (titulos/overlays), Poppins Regular (corpo), Lato Medium (fallback)
- **Grafico assinatura:** Ribbon/banner em sage com texto branco uppercase serif

### Tom de Voz
- Portugues BR, sempre "voce" + "a gente" (inclusivo)
- Quente, intimo, um pouco cool — "como um DM de uma amiga estilosa que tambem e expert"
- Comunidade: "clube", "nossa comunidade", "cool moms"
- Pode ser poetico sem ser pretensioso
- **NUNCA:** corporativo, clinico, vendedor demais, exclamacoes excessivas
- **Emoji:** Max 1-2 por mensagem. Laranja e o emoji institucional

### Frases de Marca (usar e reforcar)
- "Maternar nao significa deixar quem voce e de lado." — MASTER BRAND LINE
- "Pequeno no tamanho e imensuravel no significado." — TAGLINE OFICIAL
- "Uma moldura para essas memorias especiais." — metafora do produto
- "Nada generico, nada pronto, nada copiado." — manifesto anti-commodity
- "Cada familia e unica e o seu tapetinho tambem pode ser." — personalizacao
- "Vem fazer parte do nosso clube!" — CTA comunidade

### Mensagens-Chave (sempre reforcar)
1. Materia-prima atoxica e hipoalergenica
2. Producao sob encomenda (feito especialmente para voce)
3. Qualidade e seguranca infantil
4. Marca brasileira, handmade
5. Atendimento proximo e humanizado
6. Tecnologia patenteada — impressao UV direta no EVA

### Fotografia e Video
- Angulo dominante: overhead / bird's-eye (tapete como heroi)
- Rostos de criancas: maioria de costas, olhando para baixo, angulo. Editorial, nao retrato
- Pes de bebe descalcos no tapete — sempre
- Maos de mae: aneis dourados, unhas feitas, pulseiras estilo Cartier
- Luz: airy, high-key, muita luz natural, sem sombras dominantes
- Props: Maileg mice, livros Beatrix Potter, brinquedos Montessori de madeira, bonecas de pano
- **NUNCA:** cores vibrantes no frame, brinquedos plasticos, fundo escuro, cartoon, clip-art, rostos frontais de criancas em video
- Tratamento de cor: Brightness +15%, Contrast +4%, Saturation -10%, Sharpness +10%

### Video (Reels / TikTok)
- Slow-paced, cinematic, aspiracional — NUNCA fast-cut
- Minimo 3.5s por frame, texto fica minimo 4s
- 1080x1920 (TikTok) / 1440x2560 (Reels), Poppins Bold overlays, cores da marca
- Narracacao: voz feminina calma, 2a pessoa + 1a plural, ritmo lento, tom confessional
- Legendas: caixa branca + texto preto, posicao inferior centrada
- Musica: instrumental suave nos reels narrativos; pop ingles female vocal no social proof
- Barra final: "tini tiny | @tini.tiny.shop" em sage + doodles

### Formula dos Reels (validada — replicar)
**Hook (pergunta/curiosidade)** > **Contexto emocional/cultural** > **Diferencial do produto** > **Exclusividade + seguranca** > **Tagline/CTA**

---

## Catalogo de Estampas

### Core (11 confirmadas em cliente/UGC)
Dinossauros, Jardim/Floral, Geometrico/Listrado, Lacos Caramelo, Lacos Rosa, Dachshund/Salsicha, Tenis/Tennis, Cachorros Multiplas Racas, Xadrez Rosa+Estrelas, Bolinhas+Ondas, Folhas Botanical

### Novas 2026 (5 conceitos, 11 colorways)
- **Carros Vintage** (1 variacao — pastel)
- **Florette** (Azul, Rosa) — NUNCA usar "Flower Power"
- **Constellation** (Verde = hero, Rosa, Azul) — tem topo/base, orientacao obrigatoria
- **Vichy** (Cinza, Khaki) — SEMPRE "Vichy", NUNCA "Gingham"
- **Whimsical** (Rosa, Verde, Colorido) — Colorido: cenario sempre neutro

### Regra
Mariana Jabur e ilustradora colab (nao e uma estampa). Nao listar como estampa.

---

## Publico-Alvo

Maes brasileiras, 28-42, alta renda, forte sensibilidade estetica. Curadoras de vida — casa, roupa, ambiente dos filhos. Ela nao procura o mais barato, procura o mais bonito.

**Segmento secundario:** Pet moms ("Cool Pet Mom"), presenteadoras (baby shower)

---

## Cadencia de Conteudo

| Canal | Frequencia | Formato |
|-------|-----------|---------|
| TikTok | 1x/dia, 7x/semana | Video MP4 1080x1920 |
| Instagram Feed | 4-5x/semana | Foto ou Reel |
| Instagram Stories | Diario | Raw, proximo, humano |
| Pinterest | 10+ pins/semana | Imagem estatica + product pins |

---

## Checklist de Validacao

> Checklist completo em `library/MATRIX.md` secao "CHECKLIST PRE-PUBLICACAO"

### Visual
- [ ] Sem rosto frontal de crianca em video
- [ ] Cores neutras (sage, off-white, madeira) — sem primarias saturadas
- [ ] Assinatura "tini tiny | @tini.tiny.shop" no ultimo frame
- [ ] Poppins Bold, minimo 52pt, legivel em mobile

### Copy
- [ ] Hook na primeira linha — sem saudacao ou nome da marca
- [ ] Tom cool mom friend — nao corporativo
- [ ] CTA criativo (nao "link na bio" isolado)
- [ ] "Cool Moms Club" (nao "clube das maes")
- [ ] "motherhood is not boring" (nao "maternidade nao e chata")
- [ ] "tiragem limitada" (nao "ultimas chapas de EVA")
- [ ] "pano umido com sabao neutro" (nao "esfregar")
- [ ] Sem revelar processo tecnico (patente pendente)
- [ ] Nomes corretos: Vichy (nao Gingham), Florette (nao Flower Power)

### Tecnico
- [ ] Dimensao correta para a plataforma
- [ ] Video TikTok sem musica embutida
- [ ] Ritmo lento: 3.5s+ por frame
