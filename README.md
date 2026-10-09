# Geração de Primeira

Este é um site estático para divulgar e organizar as atividades do Ministério de Adolescentes da Primeira Igreja Batista do Recife.

## Arquitetura simplificada
A estrutura do projeto agora foi separada por responsabilidades:
- assets/css/style.css: estilos do site
- assets/js/script.js: lógica da interface
- index.html: estrutura da página

Essa organização facilita manutenção, leitura e futuras expansões sem quebrar a funcionalidade atual.

## Funcionalidades
- Tema claro/escuro
- Relógio com saudação personalizada
- Lista de tarefas persistente no navegador
- Validação de formulário de contato

## Como abrir
- Abra o arquivo index.html em um navegador, ou
- Execute um servidor local simples, como:
  python -m http.server 8000

Depois acesse http://localhost:8000
