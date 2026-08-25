const form = document.querySelector('#form-livro');
const listaEl = document.querySelector('#lista-livros');
const mensagemErro = document.querySelector('#mensagem-erro');

async function carregarLivros() {
  try {
    mensagemErro.classList.add('oculto');

    const response = await fetch('/livros');

    if (!response.ok) {
      const erro = await response.json().catch(() => ({}));
      mostrarErro(erro.erro || 'Erro ao buscar livros.');
      return;
    }

    const livros = await response.json();
    renderizarLivros(livros);
  } catch (error) {
    mostrarErro('Não foi possível conectar com o servidor.');
  }
}

function mostrarErro(msg) {
  mensagemErro.textContent = msg;
  mensagemErro.classList.remove('oculto');
}

function mostrarSucesso(msg) {
  mensagemErro.textContent = msg;
  mensagemErro.classList.remove('oculto');
  mensagemErro.classList.add('sucesso');

  setTimeout(() => {
    mensagemErro.classList.add('oculto');
    mensagemErro.classList.remove('sucesso');
  }, 2500);
}

// ----- TAREFA 1: renderizar os livros na tela -----
function renderizarLivros(livros) {
  listaEl.innerHTML = '';
  const contador = document.querySelector('#contador-livros');
  contador.textContent = `${livros.length} ${livros.length === 1 ? 'livro' : 'livros'}`;

  if (livros.length === 0) {
    const vazio = document.createElement('li');
    vazio.className = 'vazio';
    vazio.textContent = 'Nenhum livro cadastrado ainda.';
    listaEl.appendChild(vazio);
    return;
  }

  livros.forEach((livro) => {
    const item = document.createElement('li');
    item.className = 'livro-card';

    const info = document.createElement('div');
    info.className = 'livro-info';

    const titulo = document.createElement('h3');
    titulo.textContent = livro.titulo;

    const informacoes = document.createElement('p');
    informacoes.textContent = `Autor: ${livro.autor} • Ano: ${livro.ano || 'Não informado'}`;

    const statusDisponivel = livro.disponivel === 1;
    const status = document.createElement('span');
    status.textContent = statusDisponivel ? '✓ Disponível' : '✕ Emprestado';
    status.className = `status-badge ${statusDisponivel ? 'disponivel' : 'indisponivel'}`;

    info.appendChild(titulo);
    info.appendChild(informacoes);
    info.appendChild(status);

    const botoes = document.createElement('div');
    botoes.className = 'acao-botoes';

    const botaoStatus = document.createElement('button');
    botaoStatus.type = 'button';
    botaoStatus.className = `btn ${statusDisponivel ? 'btn-warning' : 'btn-success'}`;
    botaoStatus.textContent = statusDisponivel ? '↗ Emprestar' : '↩ Devolver';
    botaoStatus.addEventListener('click', () => alternarStatus(livro));

    const botaoRemover = document.createElement('button');
    botaoRemover.type = 'button';
    botaoRemover.className = 'btn btn-danger';
    botaoRemover.textContent = '🗑 Remover';
    botaoRemover.addEventListener('click', () => removerLivro(livro.id));

    botoes.appendChild(botaoStatus);
    botoes.appendChild(botaoRemover);
    item.appendChild(info);
    item.appendChild(botoes);
    listaEl.appendChild(item);
  });
}

// ----- TAREFA 2: cadastrar um novo livro (POST) -----
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const titulo = document.querySelector('#input-titulo').value.trim();
    const autor = document.querySelector('#input-autor').value.trim();
    const ano = document.querySelector('#input-ano').value;

    const response = await fetch('/livros', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        titulo,
        autor,
        ano: ano ? Number(ano) : null
      })
    });

    if (!response.ok) {
      const erro = await response.json().catch(() => ({}));
      mostrarErro(erro.erro || 'Erro ao cadastrar o livro.');
      return;
    }

    form.reset();
    await carregarLivros();
    mostrarSucesso('Livro cadastrado com sucesso!');
  } catch (error) {
    mostrarErro('Não foi possível cadastrar o livro.');
  }
});

// ----- TAREFA 3: remover um livro (DELETE) -----
async function removerLivro(id) {
  try {
    const response = await fetch(`/livros/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const erro = await response.json().catch(() => ({}));
      mostrarErro(erro.erro || 'Erro ao remover o livro.');
      return;
    }

    await carregarLivros();
    mostrarSucesso('Livro removido com sucesso!');
  } catch (error) {
    mostrarErro('Não foi possível remover o livro.');
  }
}

// ----- TAREFA 4: emprestar / devolver um livro (PUT) -----
async function alternarStatus(livro) {
  const novoValor = livro.disponivel === 1 ? 0 : 1;

  try {
    const response = await fetch(`/livros/${livro.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        disponivel: novoValor
      })
    });

    if (!response.ok) {
      const erro = await response.json().catch(() => ({}));
      mostrarErro(erro.erro || 'Erro ao alterar a disponibilidade.');
      return;
    }

    await carregarLivros();
    mostrarSucesso(
      novoValor === 1
        ? 'Livro devolvido com sucesso!'
        : 'Livro emprestado com sucesso!'
    );
  } catch (error) {
    mostrarErro('Não foi possível alterar a disponibilidade.');
  }
}

carregarLivros();
