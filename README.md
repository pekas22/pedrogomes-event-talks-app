# 🚀 BigQuery Release Navigator

O **BigQuery Release Navigator** é uma aplicação web moderna de alta fidelidade desenvolvida em **Python (Flask)**, **HTML5**, **CSS3** e **JavaScript** puros (Vanilla). Ela foi criada para monitorar, filtrar, pesquisar e compartilhar de forma ágil as notas de lançamento (Release Notes) do Google Cloud BigQuery.

---

## ✨ Principais Recursos

*   **⚡ Sincronização Dinâmica (Parser Atom)**: Conecta-se ao feed oficial XML do Google Cloud, decodificando e quebrando as entradas diárias agrupadas em atualizações individuais mais fáceis de ler e gerenciar.
*   **📂 Cache Inteligente**: Grava um cache local (`release_notes_cache.json`) que elimina a latência e garante que o painel carregue instantaneamente.
*   **🔍 Busca e Filtros Combinados**: Filtre as notas por tipo de alteração (Features, Known Issues, Resolved, Deprecations) ou faça buscas textuais por palavras-chave em tempo real no próprio navegador.
*   **📊 Estatísticas em Tempo Real**: Métricas automáticas na barra lateral mostrando o volume geral de novidades e o detalhamento por categoria.
*   **🐦 Integrador Social (Tweet Composer)**:
    *   **Templates Prontos**: Gere textos de tweets estruturados de forma automática com emojis adequados e URLs reduzidas.
    *   **Anel de Progresso Circular**: Contador interativo do limite de 280 caracteres do X (Twitter) que muda de cor conforme a proximidade do limite.
    *   **Postagens Simuladas**: Um feed no estilo X em tempo real no lado direito do painel para testar os tweets localmente (os dados persistem via `localStorage`).
    *   **Postagem Direta**: Abre o Web Intent do X com o tweet preenchido e pronto para publicação real.

---

## 📁 Estrutura de Arquivos

```text
├── app.py                      # Servidor Flask, Rotas API e Parser XML
├── templates/
│   └── index.html              # Layout HTML semântico e estruturado
├── static/
│   ├── css/
│   │   └── style.css           # Estilização com tema Dark e animações
│   └── js/
│       └── app.js              # Controlador Javascript, manipulação do DOM e lógica local
├── .gitignore                  # Arquivos ignorados pelo Git (venv, caches, etc.)
└── README.md                   # Esta documentação
```

---

## 🛠️ Como Executar o Projeto

Este projeto utiliza um ambiente virtual Python (`venv`) para isolar suas dependências.

### Requisitos
*   Python 3.x instalado.

### Passo a Passo para Execução Local

1.  **Clone este repositório** (se necessário):
    ```bash
    git clone https://github.com/pekas22/pedrogomes-event-talks-app.git
    cd pedrogomes-event-talks-app
    ```

2.  **Configure o Ambiente Virtual e Dependências**:
    Se você já possui a pasta `venv` configurada, pule para o próximo passo. Caso contrário:
    ```bash
    # Cria o ambiente virtual
    python3 -m venv venv
    
    # Ativa o venv (macOS/Linux)
    source venv/bin/activate
    
    # Instala as dependências necessárias
    pip install Flask requests
    ```

3.  **Inicie o Servidor Flask**:
    ```bash
    # Se estiver com o venv ativado:
    python3 app.py
    
    # Alternativamente, execute diretamente usando o interpretador do venv:
    ./venv/bin/python3 app.py
    ```

4.  **Acesse no Navegador**:
    Abra o link abaixo no seu navegador de preferência:
    👉 **[http://127.0.0.1:5001](http://127.0.0.1:5001)**

> 💡 **Nota de macOS**: O servidor está configurado para rodar na porta **`5001`**. Isso evita o conflito comum no macOS com o serviço AirPlay Receiver, que por padrão escuta na porta `5000`.

---

## ⚙️ Detalhes da API

O servidor Flask disponibiliza os dados processados na seguinte rota interna:

*   `GET /api/notes` - Retorna a lista de todas as notas processadas.
*   `GET /api/notes?refresh=true` - Ignora o cache em disco, força a requisição HTTP externa para o feed do Google Cloud e atualiza o arquivo local de cache.

---

## 📄 Licença e Uso

Este projeto foi construído para fins educacionais e de demonstração prática de consumo de dados RSS/Atom com integração de interface rica em Vanilla JS. Sinta-se livre para usar, clonar e modificar!
