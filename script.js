/* === BANCO DE DADOS DE TEXTOS (CHECKLISTS) === */
const CHECKLIST_DB = {
    pedagogica: {
        "1. Funções Cognitivas": [
            { label: "Atenção Instável", texto: "Demonstra dificuldade significativa em manter o foco em atividades dirigidas.", indicacao: "Atividades de curta duração." },
            { label: "Boa Atenção", texto: "Mantém atenção adequada nas atividades propostas.", indicacao: "" },
            { label: "Memória Comprometida", texto: "Dificuldade em reter instruções recentes e sequências simples.", indicacao: "Jogos da memória." }
        ],
        "2. Leitura e Escrita": [
            { label: "Pré-Silábico", texto: "Encontra-se em hipótese de escrita pré-silábica (garatujas/desenhos).", indicacao: "Estimulação da consciência fonológica." },
            { label: "Silábico", texto: "Escreve uma letra para cada sílaba sonora.", indicacao: "Atividades de completação." },
            { label: "Não Alfabetizado", texto: "Não domina o código alfabético.", indicacao: "Letramento lúdico." }
        ],
        "3. Matemática": [
            { label: "Não Identifica Numerais", texto: "Não identifica numerais básicos (0 a 10).", indicacao: "Jogos de bingo e músicas." },
            { label: "Contagem Mecânica", texto: "Conta verbalmente mas não associa à quantidade.", indicacao: "Contagem com material concreto." }
        ]
    },
    clinica: {
        "1. Saúde Geral": [
            { label: "Atraso DNPM", texto: "Histórico de atraso no Desenvolvimento Neuropsicomotor.", encam: "Avaliação Neuropediatra." },
            { label: "Convulsões", texto: "Relato de crises convulsivas controladas/em tratamento.", encam: "Neurologista." }
        ],
        "2. Linguagem": [
            { label: "Ausência de Fala", texto: "Não utiliza linguagem oral para comunicação.", encam: "Fonoaudiologia." },
            { label: "Ecolalia", texto: "Apresenta repetição de falas (ecolalia).", encam: "" }
        ]
    },
    social: {
        "1. Contexto Familiar": [
            { label: "Vulnerabilidade", texto: "Família em situação de vulnerabilidade socioeconômica.", encam: "Acompanhamento CRAS." },
            { label: "Participativa", texto: "Família demonstra interesse e participa da vida escolar.", encam: "" }
        ],
        "2. Benefícios": [
            { label: "Possui BPC", texto: "Família beneficiária do BPC.", encam: "" },
            { label: "Demanda BPC", texto: "Perfil para BPC, mas ainda não acessou.", encam: "Orientação para requerimento." }
        ]
    }
};

/* === VARIÁVEIS GLOBAIS === */
let dadosRelatorio = { pedagogica: { texto: '', extra: '' }, clinica: { texto: '', extra: '' }, social: { texto: '', extra: '' } };
let bancoRelatorios = [];
let modalAtual = '';

/* === INICIALIZAÇÃO === */
document.addEventListener('DOMContentLoaded', () => {
    configurarInputs();
    carregarBancoDeDados();
    
    // Se não tiver ID carregado, limpa para garantir estado novo
    if(!document.getElementById('reportId').value) {
        novoRelatorio(false); 
    }
    
    // Data de hoje
    const hoje = new Date();
    document.getElementById('dataAtual').innerText = hoje.toLocaleDateString('pt-BR', {day:'numeric', month:'long', year:'numeric'});
});

/* === SISTEMA DE BANCO DE DADOS (LOCALSTORAGE) === */

function carregarBancoDeDados() {
    const json = localStorage.getItem('db_escola_manain_v2');
    if(json) {
        try {
            bancoRelatorios = JSON.parse(json);
            atualizarListaSidebar();
        } catch (e) {
            console.error("Erro ao ler banco", e);
            bancoRelatorios = [];
        }
    }
}

function salvarNoBanco() {
    const nome = document.getElementById('nomeEstudante').value.trim();
    if(!nome) { alert("⚠️ Erro: Digite o NOME DO ESTUDANTE antes de salvar."); return; }

    const idAtual = document.getElementById('reportId').value;
    
    // Coleta dados dos inputs
    const inputsValores = {};
    document.querySelectorAll('input, textarea').forEach(el => {
        if(el.id && el.id !== 'buscaAluno') inputsValores[el.id] = el.value;
    });

    const relatorioObjeto = {
        id: idAtual || Date.now().toString(), // Se não tiver ID, cria um timestamp
        nome: nome,
        dataSalvo: new Date().toLocaleString('pt-BR'),
        dadosRelatorio: dadosRelatorio, // Estrutura dos checklists
        inputs: inputsValores // Campos de texto
    };

    if(idAtual) {
        // Atualiza registro existente
        const index = bancoRelatorios.findIndex(r => r.id === idAtual);
        if(index !== -1) bancoRelatorios[index] = relatorioObjeto;
        else bancoRelatorios.push(relatorioObjeto);
    } else {
        // Novo registro
        bancoRelatorios.push(relatorioObjeto);
        document.getElementById('reportId').value = relatorioObjeto.id;
    }

    localStorage.setItem('db_escola_manain_v2', JSON.stringify(bancoRelatorios));
    atualizarListaSidebar();
    
    // Efeito visual no botão
    const btn = document.getElementById('btnSalvar');
    const htmlOrig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> SALVO!';
    btn.classList.add('btn-verde'); // Garante cor
    setTimeout(() => { btn.innerHTML = htmlOrig; }, 2000);
}

function atualizarListaSidebar() {
    const lista = document.getElementById('lista-alunos');
    lista.innerHTML = "";
    const termo = document.getElementById('buscaAluno').value.toLowerCase();

    // Ordena: mais recente primeiro
    const ordenado = [...bancoRelatorios].sort((a,b) => b.id - a.id);

    ordenado.forEach(rel => {
        if(rel.nome.toLowerCase().includes(termo)) {
            const div = document.createElement('div');
            div.className = 'item-aluno';
            div.innerHTML = `
                <h4>${rel.nome}</h4>
                <span><i class="far fa-clock"></i> ${rel.dataSalvo}</span>
                <button class="btn-apagar-item" title="Excluir" onclick="deletarRelatorio('${rel.id}', event)"><i class="fas fa-trash"></i></button>
            `;
            // Clique no card carrega, clique no lixo deleta
            div.onclick = (e) => {
                if(!e.target.closest('.btn-apagar-item')) carregarRelatorio(rel.id);
            };
            lista.appendChild(div);
        }
    });
}

function carregarRelatorio(id) {
    const rel = bancoRelatorios.find(r => r.id === id);
    if(!rel) return;

    if(!confirm(`Deseja abrir o relatório de "${rel.nome}"? \nDados não salvos na tela atual serão perdidos.`)) return;

    // 1. Preenche Inputs
    if(rel.inputs) {
        for (const [key, valor] of Object.entries(rel.inputs)) {
            const el = document.getElementById(key);
            if(el) {
                el.value = valor;
                if(el.tagName === 'TEXTAREA' && el.mirrorDiv) {
                    el.mirrorDiv.innerText = valor;
                    ajustarAltura(el);
                }
            }
        }
    }

    // 2. Preenche Variáveis Globais
    if(rel.dadosRelatorio) dadosRelatorio = rel.dadosRelatorio;

    // 3. Atualiza Interface
    document.getElementById('reportId').value = rel.id;
    atualizarStatusVisual('pedagogica');
    atualizarStatusVisual('clinica');
    atualizarStatusVisual('social');
    calcularIdade();
    atualizarAssinaturas();
    
    toggleSidebar(); // Fecha menu
}

function deletarRelatorio(id, event) {
    event.stopPropagation(); // Impede que o clique no lixo abra o relatório
    if(confirm("ATENÇÃO: Deseja EXCLUIR PERMANENTEMENTE este relatório?")) {
        bancoRelatorios = bancoRelatorios.filter(r => r.id !== id);
        localStorage.setItem('db_escola_manain_v2', JSON.stringify(bancoRelatorios));
        atualizarListaSidebar();
        
        // Se apagou o que estava aberto, limpa a tela
        if(document.getElementById('reportId').value === id) novoRelatorio(false);
    }
}

function novoRelatorio(perguntar = true) {
    if(perguntar && !confirm("Deseja limpar a tela para iniciar um NOVO aluno?")) return;

    // Limpa inputs (exceto fixos)
    document.querySelectorAll('input, textarea').forEach(el => {
        if(['nre','municipio','escola','buscaAluno'].includes(el.id)) return;
        el.value = "";
        if(el.mirrorDiv) el.mirrorDiv.innerText = "";
    });
    
    // Reseta globais
    dadosRelatorio = { pedagogica: { texto: '', extra: '' }, clinica: { texto: '', extra: '' }, social: { texto: '', extra: '' } };
    
    atualizarStatusVisual('pedagogica');
    atualizarStatusVisual('clinica');
    atualizarStatusVisual('social');
    
    document.getElementById('reportId').value = ""; // Sem ID = Novo
}

/* === LÓGICA DE INTERFACE === */

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('aberto');
}

function filtrarLista() { atualizarListaSidebar(); }

function configurarInputs() {
    // Textareas com auto-crescimento
    document.querySelectorAll('textarea').forEach(tx => {
        const mirror = document.createElement('div');
        mirror.className = 'print-mirror';
        tx.parentNode.insertBefore(mirror, tx.nextSibling);
        tx.mirrorDiv = mirror;
        tx.addEventListener('input', () => {
            mirror.innerText = tx.value;
            ajustarAltura(tx);
        });
    });

    // Eventos
    document.getElementById('dataNascimento').addEventListener('change', calcularIdade);
    document.getElementById('nomeSoc').addEventListener('input', atualizarAssinaturas);
    document.getElementById('regSoc').addEventListener('input', atualizarAssinaturas);
}

function ajustarAltura(el) {
    el.style.height = 'auto';
    el.style.height = (el.scrollHeight + 2) + 'px';
}

function calcularIdade() {
    const nasc = document.getElementById('dataNascimento').value;
    if(nasc) {
        const hoje = new Date(); const n = new Date(nasc);
        let idade = hoje.getFullYear() - n.getFullYear();
        if(hoje < new Date(hoje.getFullYear(), n.getMonth(), n.getDate())) idade--;
        document.getElementById('idade').value = idade + " anos";
    }
}

function atualizarAssinaturas() {
    const sNome = document.getElementById('nomeSoc').value; 
    const sReg = document.getElementById('regSoc').value;
    const elAss = document.getElementById('assSoc');
    if(elAss) elAss.innerText = sNome ? `${sNome} ${sReg ? '- CRESS ' + sReg : ''}` : '';
}

function atualizarStatusVisual(tipo) {
    const st = document.getElementById(`status-${tipo}`);
    if(dadosRelatorio[tipo].texto && dadosRelatorio[tipo].texto.trim() !== "") { 
        st.innerHTML = `<i class="fas fa-check-circle"></i> OK`; 
        st.className = "status salvo"; 
    } else {
        st.innerHTML = "Pendente";
        st.className = "status pendente";
    }
}

/* === MODAL E CHECKLIST === */

function abrirModal(tipo) {
    modalAtual = tipo;
    const container = document.getElementById('container-checklist');
    const labelExtra = document.getElementById('labelExtra');
    
    labelExtra.innerText = tipo === 'pedagogica' ? "Indicações (Automático):" : "Encaminhamentos (Automático):";
    
    document.getElementById('modalTexto').value = dadosRelatorio[tipo].texto;
    document.getElementById('modalExtra').value = dadosRelatorio[tipo].extra;
    document.getElementById('modalTitulo').innerText = "Checklist: " + tipo.charAt(0).toUpperCase() + tipo.slice(1);

    container.innerHTML = "";
    const dados = CHECKLIST_DB[tipo];
    
    if(dados) {
        for(const [cat, itens] of Object.entries(dados)) {
            let html = `<div class="grupo-checklist"><h5>${cat}</h5>`;
            itens.forEach((it) => {
                const isChecked = dadosRelatorio[tipo].texto.includes(it.texto) ? 'checked' : '';
                html += `<div class="item-check"><input type="checkbox" ${isChecked} onchange="procCheck(this, '${it.texto}', '${it.indicacao||it.encam||''}')"><label>${it.label}</label></div>`;
            });
            container.innerHTML += html + "</div>";
        }
    }
    document.getElementById('modalOverlay').style.display = 'flex';
}

function procCheck(chk, txt, ext) {
    const t = document.getElementById('modalTexto'); 
    const e = document.getElementById('modalExtra');
    
    if(chk.checked) {
        if(!t.value.includes(txt)) t.value += (t.value ? "\n" : "") + txt;
        if(ext && !e.value.includes(ext)) e.value += (e.value ? "\n- " : "- ") + ext;
    } else {
        t.value = t.value.replace(txt, '').replace(/\n\n/g, '\n').trim();
        if(ext) e.value = e.value.replace("- " + ext, '').replace(/\n\n/g, '\n').trim();
    }
}

function salvarModal() {
    dadosRelatorio[modalAtual].texto = document.getElementById('modalTexto').value;
    dadosRelatorio[modalAtual].extra = document.getElementById('modalExtra').value;
    
    const inputOculto = document.getElementById(`texto-${modalAtual}`);
    if(inputOculto) {
        inputOculto.value = dadosRelatorio[modalAtual].texto;
        // Atualiza o espelho de impressão também
        if(inputOculto.mirrorDiv) {
            inputOculto.mirrorDiv.innerText = dadosRelatorio[modalAtual].texto;
            ajustarAltura(inputOculto);
        }
    }

    atualizarStatusVisual(modalAtual);
    atualizarFinais();
    fecharModal();
}

function fecharModal() { document.getElementById('modalOverlay').style.display = 'none'; }

function atualizarFinais() {
    // 1. Indicações Pedagógicas
    const ind = document.getElementById('final-indicacoes');
    if(dadosRelatorio.pedagogica.extra && (!ind.value || ind.value === dadosRelatorio.pedagogica.extra)) {
        ind.value = dadosRelatorio.pedagogica.extra; 
        if(ind.mirrorDiv) ind.mirrorDiv.innerText = ind.value;
    }

    // 2. Encaminhamentos (Junta Saúde + Social)
    let enc = "";
    if(dadosRelatorio.clinica.extra) enc += "SAÚDE:\n" + dadosRelatorio.clinica.extra + "\n";
    if(dadosRelatorio.social.extra) enc += "SOCIAL:\n" + dadosRelatorio.social.extra;
    
    const finEnc = document.getElementById('final-encaminhamentos');
    if(enc && finEnc.value.trim() === "") {
        finEnc.value = enc.trim();
        if(finEnc.mirrorDiv) finEnc.mirrorDiv.innerText = finEnc.value;
    }
}

function gerarConclusaoAutomatica() {
    const nome = document.getElementById('nomeEstudante').value || "O estudante";
    const p = dadosRelatorio.pedagogica.texto;
    const conc = document.getElementById('final-conclusao');
    
    if(!conc.value || confirm("O campo de conclusão já tem texto. Deseja sobrescrever?")) {
        conc.value = `CONCLUSÃO DIAGNÓSTICA:\n\nConsiderando o processo avaliativo, conclui-se que ${nome} apresenta necessidades educacionais específicas.\n\nNo aspecto Pedagógico: ${p.replace(/\n/g, ". ")}.`;
        if(conc.mirrorDiv) conc.mirrorDiv.innerText = conc.value;
        ajustarAltura(conc);
    }
}