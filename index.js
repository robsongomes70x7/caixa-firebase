// index.js
const { db, admin } = require('./firebase');

// 1. Inserir, Excluir e Alterar (CRUD)
// ------------------------------------

// 1.1. Criar nota + itens em lote
async function criarNotaComItens(mes = 1) {
  const notaRef = db.collection('notasFiscais').doc();
  await notaRef.set({
    cpfCnpj: '12345678900',
    nomeCliente: 'João Silva',
    enderecoEntrega: 'Rua A, 123',
    dataCompra: admin.firestore.Timestamp.fromDate(new Date(2025, mes - 1, 15)), // dia 15 do mês escolhido
    totalNota: 0
  });

  const batch = db.batch();
  const itens = [
    { codProduto: 'P001', descrProduto: 'Caneta Azul', valorUnitario: 2.50 },
    { codProduto: 'P002', descrProduto: 'Caderno 100fls', valorUnitario: 15.00 }
  ];

  itens.forEach(item => {
    const itemRef = notaRef.collection('items').doc();
    batch.set(itemRef, item);
  });
  await batch.commit();

  const snap = await notaRef.collection('items').get();
  const soma = snap.docs.reduce((sum, d) => sum + d.data().valorUnitario, 0);
  await notaRef.update({ totalNota: soma });

  console.log('Nota criada com ID:', notaRef.id);
}

// 1.2. Atualizar nota
async function atualizarNota(notaId) {
  await db.collection('notasFiscais').doc(notaId)
    .update({ enderecoEntrega: 'Av. B, 456' });
  console.log('Endereço atualizado para nota', notaId);
}

// 1.3. Excluir nota e itens (cascade)
async function excluirNota(notaId) {
  const notaRef = db.collection('notasFiscais').doc(notaId);
  const itens = await notaRef.collection('items').listDocuments();
  const batch = db.batch();
  itens.forEach(docRef => batch.delete(docRef));
  batch.delete(notaRef);
  await batch.commit();
  console.log('Nota e itens excluídos:', notaId);
}

// 2. Transações
// -------------
async function transacoesExemplo() {
  // Commit
  await db.runTransaction(async tx => {
    const a = db.collection('tx').doc();
    const b = db.collection('tx').doc();
    tx.set(a, { a:1, b:'a' });
    tx.set(b, { a:2, b:'b' });
  });
  console.log('Transação commitada');

  // Rollback
  try {
    await db.runTransaction(async tx => {
      const c = db.collection('tx').doc();
      const d = db.collection('tx').doc();
      tx.set(c, { a:3, b:'c' });
      tx.set(d, { a:4, b:'d' });
      throw new Error('Forçar rollback');
    });
  } catch {
    console.log('Transação revertida (rollback)');
  }
}

// 3. Consultas Específicas
// ------------------------
// C1: Quantas notas fiscais há por mês
async function consultaC1() {
  const snap = await db.collection('notasFiscais').get();
  const contagem = {};
  snap.docs.forEach(d => {
    const dt = d.data().dataCompra.toDate();
    const key = `${dt.getFullYear()}-${dt.getMonth()+1}`;
    contagem[key] = (contagem[key]||0) + 1;
  });
  console.log('C1 - Notas por mês:', contagem);
}

// C2: Quantas vendas do produto P em janeiro/2025
async function consultaC2(codProduto) {
  const inicio = new Date(2025, 0, 1);
  const fim    = new Date(2025, 1, 1);
  const notasSnap = await db.collection('notasFiscais')
    .where('dataCompra', '>=', inicio)
    .where('dataCompra', '<',  fim)
    .get();

  let qtd = 0, total = 0;
  for (const nota of notasSnap.docs) {
    const itemsSnap = await nota.ref
      .collection('items')
      .where('codProduto', '==', codProduto)
      .get();
    qtd += itemsSnap.size;
    itemsSnap.docs.forEach(d => total += d.data().valorUnitario);
  }
  console.log(`C2 - Vendas de ${codProduto} em Jan/2025:`, { qtd, total });
}

// C3: Faturamento em um mês específico de 2025
async function consultaC3(mes) {
  // mes: 1 = janeiro, 2 = fevereiro, ..., 12 = dezembro
  const inicio = new Date(2025, mes - 1, 1);
  const fim    = new Date(2025, mes, 1);
  const notasSnap = await db.collection('notasFiscais')
    .where('dataCompra', '>=', inicio)
    .where('dataCompra', '<',  fim)
    .get();
  const faturamento = notasSnap.docs
    .reduce((s, d) => s + d.data().totalNota, 0);
  console.log(`C3 - Faturamento ${mes}/2025: R$ ${faturamento.toFixed(2)}`);
}

// Dica para facilitar: listar todos os IDs antes de update/delete
async function listarIds() {
  const snap = await db.collection('notasFiscais').get();
  console.log('Notas existentes:', snap.docs.map(d => d.id));
}

// Execução de exemplo (descomente conforme necessário)
(async () => {
  // listarIds();
  // criarNotaComItens(); // se quiser criar uma nova nota em um mês específico, e só adicionar o numero entre os () ex: criarNotaComItens(1) para janeiro
  // atualizarNota('COLE_UM_DOS_IDS_ACIMA');
  // excluirNota('COLE_UM_DOS_IDS_ACIMA');
  // transacoesExemplo();
  // consultaC1();
  // consultaC2('P001');
  // consultaC3(); // Adicione o mes desejado, ex: consultaC3(1) para janeiro 
})();