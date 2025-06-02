# caixa-firebase

Projeto de exemplo para controle de notas fiscais utilizando Firebase Firestore com Node.js.

## Descrição

Este projeto simula um sistema de caixa, onde é possível:
- Criar notas fiscais com itens
- Atualizar e excluir notas (com exclusão em cascata dos itens)
- Realizar transações de teste
- Consultar relatórios como quantidade de notas por mês, vendas de um produto em janeiro/2025 e faturamento por mês

O código utiliza o Firebase Admin SDK para manipulação do Firestore.

---

## Passo a Passo para rodar o projeto

### 1. Pré-requisitos

- Node.js instalado (versão 18 ou superior)
- Conta no Firebase e um projeto criado
- Chave de serviço do Firebase (arquivo `serviceAccountKey.json`)

### 2. Instalação

1. Clone este repositório:
   ```sh
   git clone https://github.com/EnzoWarner/caixa-firebase.git
   cd caixa-firebase
   ```
2. Instale as dependências:
   ```sh
   npm install
   ```
3. Coloque sua chave de serviço do Firebase em `serviceAccountKey.json`.
4. Execute o projeto:
   ```sh
   node index.js
   ```

### 3. Uso

- Acesse `http://localhost:3000` para ver a aplicação em funcionamento.
- Utilize as rotas da API para interagir com o sistema de notas fiscais.

---

## Contribuição

Sinta-se à vontade para contribuir com melhorias ou correções. Faça um fork deste repositório, implemente suas mudanças e envie um pull request.

---

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
