---
title: "CPF e CNPJ: o que são os dígitos verificadores"
description: Entenda como funciona a validação de CPF e CNPJ e use um gerador e validador gratuito para testes.
date: 2026-07-13T13:00:00-03:00
category: ferramentas
tags: []
emoji: 🧾
related:
  - gerador-de-documentos
  - consulta-cnpj
status: publicado
---

Você já reparou que os dois últimos números do CPF (e do CNPJ) parecem "conferir" o resto? Eles são os **dígitos verificadores** — calculados a partir dos outros números para detectar erros de digitação.

## Para que servem

Quando você digita um CPF ou CNPJ em um site, o sistema recalcula esses dígitos. Se não baterem, ele avisa que o número é inválido — antes mesmo de consultar qualquer base de dados. É uma primeira checagem simples e rápida.

## Ferramenta para desenvolvedores

Se você programa ou testa sistemas, muitas vezes precisa de números **válidos** (que passam na checagem) sem usar dados de pessoas reais. Para isso existe o nosso [gerador e validador de CPF/CNPJ/PIS](/ferramentas/gerador-de-documentos):

- **Gerar**: cria números matematicamente válidos, ideais para preencher formulários de teste.
- **Validar**: confere se um número tem os dígitos corretos.

> Importante: um número "válido" só significa que os dígitos fecham a conta. **Não** quer dizer que ele pertence a alguém ou está ativo na Receita.

## E para conferir uma empresa de verdade?

Aí o caminho é a [consulta de CNPJ](/ferramentas/consulta-cnpj), que traz razão social, situação cadastral e endereço a partir de dados públicos.
