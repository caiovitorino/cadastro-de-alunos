# Portal Acadêmico — Cadastro de alunos

Aplicação educacional para cadastrar, consultar, pesquisar e excluir alunos, utilizando **Node.js, TypeScript, Express e MySQL**.

## Funcionalidades

- Cadastro de aluno com nome, e-mail e curso.
- Listagem dos alunos em ordem decrescente de ID.
- Busca por nome, e-mail ou curso na interface.
- Indicadores de total de alunos, cursos diferentes e ID do último cadastro.
- Exclusão com modal de confirmação.
- Validação no navegador e no servidor.
- Bloqueio de e-mail duplicado.
- Consultas SQL parametrizadas e credenciais guardadas no `.env`.
- Layout responsivo para desktop e celular.

> O escopo funcional deste projeto é inserir, consultar e excluir registros. A edição de cadastros não faz parte desta versão.

## Tecnologias

- HTML5 e CSS3
- TypeScript no navegador e no backend
- Node.js e Express
- MySQL com `mysql2`
- dotenv para configuração local

## Estrutura

```text
portal-academico/
├── banco.sql
├── .env.example
├── package.json
├── tsconfig.json
├── tsconfig.frontend.json
├── src/
│   ├── server.ts
│   ├── config/database.ts
│   ├── routes/alunos.ts
│   └── types/aluno.ts
└── public/
    ├── index.html
    ├── css/style.css
    ├── ts/app.ts
    └── js/app.js
```

## Requisitos

Instale o Node.js LTS e o MySQL Server. Se usar XAMPP, inicie o serviço MySQL pelo painel. Confirme as instalações:

```bash
node --version
npm --version
```

## 1. Instalar dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

## 2. Criar o banco

Execute `banco.sql` no MySQL Workbench, phpMyAdmin ou terminal. Pelo terminal, se o comando `mysql` estiver disponível:

```bash
mysql -u root -p < banco.sql
```

O script cria o banco `aula_mysql` e a tabela `alunos`, com ID automático e e-mail único.

## 3. Configurar o ambiente

Crie um arquivo chamado `.env` na raiz, copiando o `.env.example`. Exemplo de configuração local:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=aula_mysql
```

Ajuste usuário, senha e porta conforme a instalação do seu MySQL. Se o usuário local não tiver senha, deixe `DB_PASSWORD=` vazio. **Não compartilhe nem publique seu `.env`.**

## 4. Compilar e executar

```bash
npm run build
npm start
```

O terminal deve indicar que a conexão com o MySQL foi estabelecida e que o Portal Acadêmico está disponível.

Abra no navegador: <http://localhost:3000>

Para testar o servidor: <http://localhost:3000/api/health>

Para compilar novamente depois de alterar arquivos TypeScript, execute `npm run build`.

## Rotas da API

| Método | Caminho | Descrição |
|---|---|---|
| GET | `/api/health` | Verifica se o servidor está ativo |
| GET | `/api/alunos` | Lista todos os alunos |
| GET | `/api/alunos?nome=ana` | Filtra alunos pelo nome no servidor |
| POST | `/api/alunos` | Cadastra um aluno |
| DELETE | `/api/alunos/:id` | Exclui um aluno pelo ID |

O navegador se comunica com a API por HTTP. Somente o backend acessa o MySQL. Os valores recebidos são enviados às consultas SQL por parâmetros, em vez de serem concatenados diretamente no comando.

## Teste rápido

1. Abra o Portal Acadêmico.
2. Clique em **Novo aluno** e preencha nome, e-mail e curso.
3. Cadastre dois alunos com e-mails diferentes.
4. Pesquise pelo nome, e-mail ou curso.
5. Clique no ícone de exclusão de um registro e confirme.
6. Tente cadastrar novamente um e-mail já utilizado para verificar a validação de duplicidade.

## Problemas comuns

- **Conexão com MySQL falhou:** confirme que o serviço está ativo e revise as configurações do `.env`.
- **Banco ou tabela não existe:** execute `banco.sql`.
- **E-mail já cadastrado:** cada aluno deve possuir um e-mail único.
- **A porta 3000 está ocupada:** altere `PORT` no `.env`.
- **O JavaScript do navegador não atualizou:** execute `npm run build:frontend` e atualize a página.
- **O comando `mysql` não é reconhecido:** use um cliente gráfico ou configure o executável MySQL no PATH.

## Fluxo da aplicação

Interface HTML/CSS → JavaScript gerado a partir de TypeScript → requisição HTTP (`fetch`) → Express → consulta parametrizada no MySQL → resposta JSON → atualização da interface.

## Personalização

O nome, a identidade visual e os textos do Portal Acadêmico foram organizados para esta versão. Antes de entregar, revise o código, teste as operações no seu ambiente e certifique-se de conseguir explicar as decisões principais do projeto.
