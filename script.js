  (function () {
    var root = document.documentElement;

    /* Tema */
    var botaoTema = document.getElementById("tema");
    function estaEscuro() {
      var t = root.getAttribute("data-theme");
      if (t === "dark") return true;
      if (t === "light") return false;
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    function atualizarBotao() {
      var escuro = estaEscuro();
      botaoTema.textContent = escuro ? "Tema claro" : "Tema escuro";
      botaoTema.setAttribute("aria-pressed", String(escuro));
    }
    try {
      var salvo = localStorage.getItem("tema");
      if (salvo === "dark" || salvo === "light") root.setAttribute("data-theme", salvo);
    } catch (e) {}
    botaoTema.addEventListener("click", function () {
      var novo = estaEscuro() ? "light" : "dark";
      root.setAttribute("data-theme", novo);
      try { localStorage.setItem("tema", novo); } catch (e) {}
      atualizarBotao();
    });
    atualizarBotao();

    /* Saudação e relógio */
    var saudacao = document.getElementById("saudacao");
    var relogio = document.getElementById("relogio");
    function pad(n) { return String(n).padStart(2, "0"); }
    function atualizarHora() {
      var agora = new Date();
      var h = agora.getHours();
      saudacao.textContent = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
      relogio.textContent = "Agora são " + pad(h) + ":" + pad(agora.getMinutes());
    }
    atualizarHora();
    setInterval(atualizarHora, 30000);

    /* Lista de tarefas */
    var lista = document.getElementById("lista");
    var contagem = document.getElementById("contagem");
    var campo = document.getElementById("nova-tarefa");
    var tarefas = [
      { texto: "Abrir o site no celular", feito: true },
      { texto: "Trocar o tema claro e escuro", feito: false },
      { texto: "Adicionar uma tarefa minha", feito: false }
    ];
    try {
      var guardado = JSON.parse(localStorage.getItem("tarefas") || "null");
      if (Array.isArray(guardado)) tarefas = guardado;
    } catch (e) {}

    function salvar() {
      try { localStorage.setItem("tarefas", JSON.stringify(tarefas)); } catch (e) {}
    }
    function desenhar() {
      lista.innerHTML = "";
      tarefas.forEach(function (t, i) {
        var li = document.createElement("li");
        if (t.feito) li.className = "done";
        var cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = t.feito;
        cb.id = "t" + i;
        cb.addEventListener("change", function () {
          tarefas[i].feito = cb.checked;
          salvar();
          desenhar();
        });
        var txt = document.createElement("label");
        txt.className = "txt";
        txt.setAttribute("for", cb.id);
        txt.textContent = t.texto;
        var rm = document.createElement("button");
        rm.type = "button";
        rm.className = "rm";
        rm.textContent = "Remover";
        rm.setAttribute("aria-label", "Remover tarefa: " + t.texto);
        rm.addEventListener("click", function () {
          tarefas.splice(i, 1);
          salvar();
          desenhar();
        });
        li.appendChild(cb);
        li.appendChild(txt);
        li.appendChild(rm);
        lista.appendChild(li);
      });
      var feitas = tarefas.filter(function (t) { return t.feito; }).length;
      contagem.textContent = tarefas.length
        ? feitas + " de " + tarefas.length + " concluídas"
        : "Nenhuma tarefa. Adicione a primeira acima.";
    }
    document.getElementById("form-tarefa").addEventListener("submit", function (e) {
      e.preventDefault();
      var texto = campo.value.trim();
      if (!texto) { campo.focus(); return; }
      tarefas.push({ texto: texto, feito: false });
      campo.value = "";
      salvar();
      desenhar();
      campo.focus();
    });
    desenhar();

    /* Formulário de contato */
    var form = document.getElementById("form-contato");
    var status = document.getElementById("status");
    function erro(id, msg) { document.getElementById("erro-" + id).textContent = msg; return !msg; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = document.getElementById("nome").value.trim();
      var email = document.getElementById("email").value.trim();
      var msg = document.getElementById("mensagem").value.trim();
      var okNome = erro("nome", nome.length < 2 ? "Digite seu nome com pelo menos 2 letras." : "");
      var okEmail = erro("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Digite um e-mail válido, como nome@exemplo.com.");
      var okMsg = erro("mensagem", msg.length < 10 ? "Escreva pelo menos 10 caracteres." : "");
      status.className = "status";
      if (okNome && okEmail && okMsg) {
        status.className = "status ok";
        status.textContent = "Tudo certo, " + nome.split(" ")[0] + ". Os campos passaram na validação. Este exemplo não envia a mensagem.";
        form.reset();
      } else {
        status.textContent = "";
      }
    });
  })();
