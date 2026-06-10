# AWS Manager — Frontend ☁️

[![Vue](https://img.shields.io/badge/Vue.js-3.x-4fc08d?style=for-the-badge&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Quasar](https://img.shields.io/badge/Quasar-v2.x-1976d2?style=for-the-badge&logo=quasar&logoColor=white)](https://quasar.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-Store-ffd859?style=for-the-badge&logo=vue.js&logoColor=black)](https://pinia.vuejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Container-2496ed?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Web_Server-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://nginx.org/)

Interface web moderna, responsiva e de alta performance desenvolvida em **Vue 3** e **Quasar Framework** para administração simplificada de recursos na nuvem Amazon Web Services (AWS), especificamente focado em **Amazon S3** e **Amazon EC2**.

---

## 📌 Sobre o Projeto

O **AWS Manager Frontend** atua como o painel administrativo de um ecossistema integrado com um backend desenvolvido em **Spring Boot**. O objetivo é abstrair a complexidade do Console AWS tradicional e fornecer aos operadores uma interface limpa, rápida e segura para operações cotidianas, como upload/download de arquivos no S3 e controle de ciclo de vida de servidores virtuais.

---

## 🚀 Funcionalidades

### 📊 Dashboard Geral
*   **Cards de Resumo**: Exibição rápida de métricas essenciais (total de arquivos no S3, tamanho total consumido, total de instâncias EC2, e contagem de instâncias rodando ou paradas).
*   **Visão Rápida**: Listagem instantânea dos 5 arquivos mais recentemente enviados ao S3 e das 5 instâncias EC2 com seus respectivos status operacionais atuais.

### 📦 Gerenciamento de Armazenamento (S3)
*   **Navegador de Arquivos**: Tabela paginada e dinâmica com identificação visual de tipos de arquivos (PDF, Imagem, Vídeo, Compactado, Planilha, etc.) por meio de ícones dedicados.
*   **Filtro em Tempo Real**: Campo de pesquisa para filtrar arquivos instantaneamente pelo nome.
*   **Múltiplos Buckets**: Suporte à listagem dinâmica e alternância entre diferentes Buckets S3 cadastrados.
*   **Upload Inteligente**:
    *   Zona interativa de *Drag & Drop* (arrastar e soltar) ou seleção tradicional de arquivo.
    *   Barra de progresso de upload integrada atualizada em tempo real via Axios.
    *   Restrição de tamanho de arquivo definida para até 100MB.
*   **Links Seguros (Presigned URLs)**: Geração sob demanda de URLs pré-assinadas da AWS com tempo de expiração seguro para download direto dos objetos.
*   **Ações Rápidas**: Copiar a chave do objeto (*Object Key*) para a área de transferência com um clique e deleção permanente com aviso de confirmação.

### ⚙️ Gerenciamento de Servidores (EC2)
*   **Monitoramento de Status**: Exibição do estado da máquina virtual em tempo real com chips de status coloridos (`running`, `stopped`, `pending`, `stopping`).
*   **Controle do Ciclo de Vida**: Ações imediatas de **Iniciar (Start)**, **Parar (Stop)** e **Reiniciar (Reboot)**, todas precedidas por caixas de diálogo para confirmação de segurança.
*   **Dados da Instância**: Visualização do Tipo de Instância (`instanceType`), Zona de Disponibilidade, IP Público, IP Privado, Horário de Inicialização e Tags (como a tag de identificação `Name`).
*   **Visualizador JSON Completo**: Modal interativo que exibe o objeto completo da instância retornado pelo AWS SDK.

### 📝 Logs de Auditoria
*   **Histórico de Operações**: Tabela dedicada contendo o histórico cronológico de todas as ações executadas nas instâncias EC2 através da plataforma (Data/Hora, ID da Instância, Tipo de Operação, Status e Mensagem de Erro detalhada em caso de falha).

---

## 🛠️ Tecnologias Utilizadas

*   **Vue 3**: Utilização da Composition API (`<script setup>`) para um código mais limpo e reativo.
*   **Quasar Framework (v2)**: Biblioteca UI baseada em Material Design que garante responsividade nativa, além de componentes avançados de tabelas, diálogos e carregamento.
*   **Pinia**: Gerenciamento de estado global otimizado e segmentado por módulos (`s3Store` e `ec2Store`).
*   **Axios**: Cliente HTTP para chamadas REST, configurado com interceptadores de requisição e resposta para capturar e exibir notificações de erro amigáveis ao usuário final.
*   **Nginx (1.25)**: Servidor web utilizado para entrega dos assets de produção com compressão Gzip e proxy reverso.

---

## 💻 Como Executar o Projeto Localmente

### Pré-requisitos
*   **Node.js**: Versão `>= 18.0.0` recomendada.
*   **NPM** ou **Yarn**.

### Passo a Passo

1.  **Clonar o repositório e entrar na pasta:**
    ```bash
    git clone <url-do-repositorio>
    cd frontend-aws
    ```

2.  **Instalar as dependências do projeto:**
    ```bash
    npm install
    # ou usando yarn
    yarn install
    ```

3.  **Executar o servidor de desenvolvimento:**
    ```bash
    npm run dev
    # ou usando o Quasar CLI global
    quasar dev
    ```
    O servidor iniciará automaticamente no endereço **`http://localhost:9000`**.

4.  **Gerar o Build de Produção:**
    ```bash
    npm run build
    # ou usando o Quasar CLI
    quasar build
    ```
    Os arquivos estáticos otimizados para produção serão gerados na pasta `dist/spa`.

---

## 🐳 Deploy & Containerização (Docker)

O projeto está totalmente preparado para ser executado em ambientes de produção conteinerizados via **Docker**. Ele utiliza uma estratégia de **Multi-stage Build** para otimizar o tamanho final da imagem.

### Estrutura do Dockerfile

*   **Estágio 1 (Builder)**: Utiliza a imagem `node:20-alpine` para instalar dependências, compilar a aplicação e gerar os assets de produção.
*   **Estágio 2 (Nginx)**: Utiliza a imagem `nginx:1.25-alpine`. Remove a configuração padrão do Nginx, copia nossa configuração customizada ([nginx.conf](file:///d:/Projetos/frontend-aws/nginx.conf)) e copia o build do Vue estático para a pasta `/usr/share/nginx/html`.

### Como buildar e rodar o container

1.  **Construir a imagem Docker:**
    ```bash
    docker build -t aws-manager-frontend .
    ```

2.  **Executar o container:**
    ```bash
    docker run -d -p 80:80 --name aws-frontend aws-manager-frontend
    ```
    A aplicação estará acessível na porta **`80`** da máquina hospedeira.

### ⚙️ Configuração do Nginx (`nginx.conf`)
O servidor Nginx integrado está configurado com as seguintes diretivas importantes:
*   **Compressão Gzip**: Ativada para arquivos de texto, CSS, JSON e Javascript para otimização de banda de rede.
*   **Cache de Longa Duração**: Configuração de expiração de cache de 1 ano (`Cache-Control "public, immutable"`) para arquivos estáticos (`.js`, `.css`, imagens).
*   **Fallback SPA**: Redirecionamento automático de todas as rotas desconhecidas para a raiz (`/index.html`) para manter a navegação interna do Vue Router funcionando.
*   **Proxy Reverso (`/api/`)**: Redirecionamento interno de chamadas da API diretamente para a URL do backend (`http://backend:8080/api/`), evitando problemas de CORS e configurando timeouts generosos de até 300 segundos para uploads de grandes volumes ao S3.
*   **Cabeçalhos de Segurança**: Inclui `X-Frame-Options`, `X-Content-Type-Options` e `Referrer-Policy`.

---

## 📁 Estrutura de Diretórios

A estrutura do projeto segue o padrão do Quasar Framework:

```text
frontend-aws/
├── .quasar/                # Diretório gerado em tempo de execução pelo Quasar
├── Dockerfile              # Script de build Docker multi-stage
├── nginx.conf              # Configuração customizada do servidor web Nginx
├── quasar.config.js        # Configurações do ecossistema Quasar e variáveis de ambiente
├── package.json            # Dependências, scripts e configurações npm
└── src/
    ├── App.vue             # Componente raiz da aplicação
    ├── main.js             # Ponto de entrada do script principal
    ├── index.template.html # Template HTML principal
    ├── boot/               # Inicializadores e configurações de bibliotecas de terceiros
    │   └── axios.js        # Configurações globais, interceptadores e baseURL da API
    ├── css/                # Folhas de estilo da aplicação
    │   └── app.scss        # Configuração SCSS global e customização
    ├── layouts/            # Layouts principais da aplicação (Header, Drawer)
    │   └── MainLayout.vue
    ├── components/         # Componentes compartilhados e reutilizáveis
    │   ├── NavItem.vue     # Links de navegação do menu lateral
    │   └── StatCard.vue    # Cards de estatísticas exibidos no Dashboard
    ├── pages/              # Páginas e rotas da aplicação
    │   ├── DashboardPage.vue # Painel geral unificado
    │   ├── S3Page.vue        # Interface de upload/gerenciamento de arquivos
    │   ├── Ec2Page.vue       # Painel de controle de instâncias
    │   └── Ec2LogsPage.vue   # Histórico de auditoria de operações
    ├── router/             # Definição de rotas e comportamentos do Vue Router
    │   └── index.js
    └── stores/             # Gerenciamento de estado global com Pinia
        ├── index.js
        ├── s3Store.js      # Gerenciamento de arquivos e buckets S3
        └── ec2Store.js     # Gerenciamento de estados e logs EC2
```

---

## ⚙️ Variáveis de Ambiente e Proxy

O projeto está configurado para se conectar à API do backend na rota definida pela variável de ambiente `API_URL` (padrão local em desenvolvimento: `/api`, que é proxied para `http://localhost:8080` conforme definido em `quasar.config.js`). Em produção, a requisição passa pelo proxy reverso do Nginx para apontar para o container do backend.
