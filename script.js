(function () {
  var app = {
    elements: {},
    state: {
      tarefas: [
        { texto: "Abrir o site no celular", feito: true },
        { texto: "Trocar o tema claro e escuro", feito: false },
        { texto: "Adicionar uma tarefa minha", feito: false }
      ]
    },

    init: function () {
      this.cacheElements();
      this.loadThemePreference();
      this.bindThemeToggle();
      this.bindClock();
      this.loadTasks();
      this.bindTaskForm();
      this.bindContactForm();
    },

    cacheElements: function () {
      this.elements.root = document.documentElement;
      this.elements.botaoTema = document.getElementById("tema");
      this.elements.saudacao = document.getElementById("saudacao");
      this.elements.relogio = document.getElementById("relogio");
      this.elements.lista = document.getElementById("lista");
      this.elements.contagem = document.getElementById("contagem");
      this.elements.campoTarefa = document.getElementById("nova-tarefa");
      this.elements.formularioTarefa = document.getElementById("form-tarefa");
      this.elements.formularioContato = document.getElementById("form-contato");
      this.elements.status = document.getElementById("status");
    },

    safeStorage: {
      get: function (key) {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          return null;
        }
      },
      set: function (key, value) {
        try {
          localStorage.setItem(key, value);
        } catch (error) {}
      }
    },

    loadThemePreference: function () {
      var temaSalvo = this.safeStorage.get("tema");
      if (temaSalvo === "dark" || temaSalvo === "light") {
        this.elements.root.setAttribute("data-theme", temaSalvo);
      } else {
        this.elements.root.setAttribute("data-theme", "light");
      }
      this.updateThemeButton();
    },

    isDarkTheme: function () {
      return this.elements.root.getAttribute("data-theme") === "dark";
    },

    updateThemeButton: function () {
      if (!this.elements.botaoTema) return;
      var escuro = this.isDarkTheme();
      this.elements.botaoTema.textContent = escuro ? "Tema claro" : "Tema escuro";
      this.elements.botaoTema.setAttribute("aria-pressed", String(escuro));
    },

    bindThemeToggle: function () {
      if (!this.elements.botaoTema) return;
      var self = this;
      this.elements.botaoTema.addEventListener("click", function () {
        var novoTema = self.isDarkTheme() ? "light" : "dark";
        self.elements.root.setAttribute("data-theme", novoTema);
        self.safeStorage.set("tema", novoTema);
        self.updateThemeButton();
      });
    },

    bindClock: function () {
      var self = this;

      function pad(valor) {
        return String(valor).padStart(2, "0");
      }

      function atualizarHora() {
        var agora = new Date();
        var hora = agora.getHours();

        if (self.elements.saudacao) {
          self.elements.saudacao.textContent = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
        }

        if (self.elements.relogio) {
          self.elements.relogio.textContent = "Agora são " + pad(hora) + ":" + pad(agora.getMinutes());
        }
      }

      atualizarHora();
      setInterval(atualizarHora, 30000);
    },

    loadTasks: function () {
      var tarefasSalvas = this.safeStorage.get("tarefas");
      if (tarefasSalvas) {
        try {
          var dados = JSON.parse(tarefasSalvas);
          if (Array.isArray(dados)) {
            this.state.tarefas = dados;
          }
        } catch (error) {}
      }
      this.renderTasks();
    },

    saveTasks: function () {
      this.safeStorage.set("tarefas", JSON.stringify(this.state.tarefas));
    },

    renderTasks: function () {
      if (!this.elements.lista || !this.elements.contagem) return;

      this.elements.lista.innerHTML = "";
      this.state.tarefas.forEach(function (tarefa, indice) {
        var item = document.createElement("li");
        if (tarefa.feito) item.className = "done";

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = tarefa.feito;
        checkbox.id = "t" + indice;
        checkbox.addEventListener("change", function () {
          app.state.tarefas[indice].feito = checkbox.checked;
          app.saveTasks();
          app.renderTasks();
        });

        var texto = document.createElement("label");
        texto.className = "txt";
        texto.setAttribute("for", checkbox.id);
        texto.textContent = tarefa.texto;

        var remover = document.createElement("button");
        remover.type = "button";
        remover.className = "rm";
        remover.textContent = "Remover";
        remover.setAttribute("aria-label", "Remover tarefa: " + tarefa.texto);
        remover.addEventListener("click", function () {
          app.state.tarefas.splice(indice, 1);
          app.saveTasks();
          app.renderTasks();
        });

        item.appendChild(checkbox);
        item.appendChild(texto);
        item.appendChild(remover);
        app.elements.lista.appendChild(item);
      });

      var concluidas = this.state.tarefas.filter(function (tarefa) {
        return tarefa.feito;
      }).length;

      this.elements.contagem.textContent = this.state.tarefas.length
        ? concluidas + " de " + this.state.tarefas.length + " concluídas"
        : "Nenhuma tarefa. Adicione a primeira acima.";
    },

    bindTaskForm: function () {
      if (!this.elements.formularioTarefa || !this.elements.campoTarefa) return;
      var self = this;

      this.elements.formularioTarefa.addEventListener("submit", function (evento) {
        evento.preventDefault();
        var texto = self.elements.campoTarefa.value.trim();

        if (!texto) {
          self.elements.campoTarefa.focus();
          return;
        }

        self.state.tarefas.push({ texto: texto, feito: false });
        self.elements.campoTarefa.value = "";
        self.saveTasks();
        self.renderTasks();
        self.elements.campoTarefa.focus();
      });
    },

    setFormError: function (campoId, mensagem) {
      var elementoErro = document.getElementById("erro-" + campoId);
      if (elementoErro) elementoErro.textContent = mensagem;
      return !mensagem;
    },

    bindContactForm: function () {
      if (!this.elements.formularioContato) return;
      var self = this;

      this.elements.formularioContato.addEventListener("submit", function (evento) {
        evento.preventDefault();

        var nome = document.getElementById("nome").value.trim();
        var igreja = document.getElementById("igreja").value.trim();
        var email = document.getElementById("email").value.trim();
        var mensagem = document.getElementById("mensagem").value.trim();

        var nomeValido = self.setFormError("nome", nome.length < 2 ? "Digite seu nome com pelo menos 2 letras." : "");
        var igrejaValida = self.setFormError("igreja", igreja.length < 2 ? "Informe o nome da igreja." : "");
        var emailValido = self.setFormError("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "Digite um e-mail válido, como nome@exemplo.com.");
        var mensagemValida = self.setFormError("mensagem", mensagem.length < 10 ? "Escreva pelo menos 10 caracteres." : "");

        if (self.elements.status) {
          self.elements.status.className = "status";
        }

        if (nomeValido && igrejaValida && emailValido && mensagemValida) {
          if (self.elements.status) {
            self.elements.status.className = "status ok";
            self.elements.status.textContent = "Tudo certo, " + nome.split(" ")[0] + ". Os campos passaram na validação. Este exemplo não envia a mensagem.";
          }
          self.elements.formularioContato.reset();
        } else if (self.elements.status) {
          self.elements.status.textContent = "";
        }
      });
    }
  };

  app.init();
})();
