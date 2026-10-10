// Guias estáticos, convertidos em HTML autónomo no momento do build por
// scripts/prerender.mjs. Não levam JavaScript - um guia é prosa, e o bundle da
// aplicação só o tornaria mais lento.
//
// Vivem em src/ para que o Tailwind veja estas classes e gere o mesmo CSS que a
// aplicação usa. Não os mova para fora de src/ ou ficam sem estilo.
import { A, Code, H2, H3, LI, Note, OL, P, Pre, Table, UL } from '../prose.tsx'
import { rubricRows, sectionRows } from '../tables.ts'
import { GUIDES } from './guides.ts'
import type { Article, Guide } from '../types.ts'
import { ptPT } from '../../i18n/messages/pt-pt.ts'

function guide(id: Guide['id']): Guide {
  const meta = GUIDES.find((g) => g.id === id)
  if (!meta) throw new Error(`articles: no entry for "${id}" in guides.ts`)
  return meta
}

const RUBRIC_ROWS = rubricRows(ptPT)
const SECTION_ROWS = sectionRows('pt', ptPT)

export const ARTICLES: Article[] = [
  {
    ...guide('what-is-an-ats-score'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'A pontuação ATS estima a facilidade com que o software de acompanhamento de candidaturas consegue extrair do seu CV o texto, os contactos, as secções e as datas. Não diz nada sobre se serve para a vaga. Acima de cerca de 85, nada de importante se perde — dedique o tempo ao conteúdo.',
    body: (
      <>
        <P>
          Um sistema de acompanhamento de candidaturas (ATS, do inglês <em>applicant tracking
          system</em>) é o software que uma empresa usa para receber, guardar e pesquisar
          candidaturas. Antes de um recrutador ler o seu CV, o sistema lê-o: extrai o nome, os
          contactos, os cargos, as datas e as competências e grava-os em campos de uma base de dados.
          A <strong>pontuação ATS</strong> é uma estimativa de quão bem esse passo vai correr.
        </P>
        <P>
          É uma afirmação mais limitada do que parece, e essa limitação é o essencial. A pontuação
          não sabe se é a pessoa certa para a vaga. Mede apenas uma coisa: se o documento sobrevive
          a ser lido por uma máquina.
        </P>

        <H2>O mito a abandonar primeiro</H2>
        <P>
          É provável que já tenha lido que <em>“75% dos CV são rejeitados por um ATS antes de um
          humano os ver.”</em> Este número repete-se há mais de uma década e não tem uma fonte
          credível por trás. Os sistemas de acompanhamento de candidaturas são ferramentas de
          pesquisa e arquivo. Ordenam e filtram segundo critérios definidos pelo recrutador; não
          descartam sozinhos três quartos dos candidatos.
        </P>
        <P>
          O risco real é mais banal e mais fácil de corrigir. Se o leitor não encontra o seu email,
          a candidatura chega com o campo de contacto vazio. Se não consegue ler os seus cargos, não
          aparece na pesquisa do recrutador por “gestor de engenharia”. Ninguém o rejeitou — nunca
          chegou a entrar nos resultados.
        </P>

        <H2>O que uma pontuação pode medir de forma razoável</H2>
        <P>
          Toda a pontuação ATS honesta é uma heurística construída a partir de um punhado de
          verificações. Neste site, a grelha tem 100 pontos fixos e é pública, para que veja
          exatamente de onde vem cada ponto. Em cinco grupos:
        </P>
        <UL>
          <LI><strong>Legibilidade (25)</strong> — há texto real e selecionável, ou a página é uma imagem?</LI>
          <LI><strong>Contactos (15)</strong> — email, telefone e uma ligação escrita como texto visível.</LI>
          <LI><strong>Secções (35)</strong> — títulos que um leitor reconhece: Experiência, Formação, Competências, Resumo.</LI>
          <LI><strong>Formato (15)</strong> — número de páginas, funções com datas, estrutura real de marcadores.</LI>
          <LI><strong>Conteúdo (10)</strong> — resultados quantificados e marcadores que começam por um verbo.</LI>
        </UL>
        <P>E, verificação a verificação — esta tabela é a que o verificador executa, não um resumo dela:</P>
        <Table
          caption="Grelha de pontuação do ATS Resume Toolkit, verificação a verificação"
          head={['Verificação', 'Grupo', 'Pontos']}
          rows={RUBRIC_ROWS}
        />
        <P>
          Há dois pormenores fáceis de perder. A falta do telefone ou do resumo custa apenas os
          respetivos pontos — são avisos, não falhas —, enquanto a falta de um título de Experiência,
          Formação ou Competências é uma falha direta. E a última linha das Secções é um bónus: um
          título de Conquistas vale 4, Projetos 3, Certificações 3.
        </P>
        <P>
          As secções pesam mais porque são o que transforma um bloco de texto em dados estruturados.
          Um leitor que encontra um título “Experiência” sabe que as entradas por baixo são
          empregos. Sem ele, está a adivinhar.
        </P>

        <H2>O que nenhuma pontuação consegue medir</H2>
        <UL>
          <LI>Se a sua experiência corresponde à função. Isso é juízo do recrutador.</LI>
          <LI>Que ATS em concreto a empresa usa. Cada fornecedor lê de forma diferente e nenhum publica as suas regras.</LI>
          <LI>Se a sua escrita é persuasiva. Um CV perfeitamente legível pode ainda assim ser enfadonho.</LI>
        </UL>
        <P>
          Encare uma pontuação acima de cerca de 85 como “nada daqui se vai perder no caminho” e passe
          ao conteúdo. Perseguir os últimos pontos é quase sempre esforço desperdiçado.
        </P>

        <H2>Porque é que dois verificadores dão pontuações diferentes</H2>
        <P>
          Não existe uma pontuação ATS padrão. Cada verificador inventa a sua grelha, dá-lhe os
          pesos que entende e — em geral — não diz quais são. Um 62 num site e um 81 noutro não são
          uma contradição; são dois testes diferentes. A pergunta útil nunca é “qual dos números está
          certo”, mas “que verificação concreta falhou e concordo que importa?”. Isso só tem resposta
          quando as regras são públicas.
        </P>

        <Note>
          <strong>Verifique o seu em poucos segundos.</strong> O{' '}
          <A href="/pt-pt/">verificador de CV ATS gratuito</A> pontua um PDF ou DOCX inteiramente no
          navegador — o ficheiro nunca é carregado para um servidor, não há conta e não intervém
          nenhum modelo de linguagem. Pode ler as regras exatas de pontuação no código público.
        </Note>

        <H2>Relacionado</H2>
        <UL>
          <LI><A href="/pt-pt/como-funciona-a-leitura-de-cv-ats">Como funciona realmente a leitura de CV por um ATS</A></LI>
          <LI><A href="/pt-pt/checklist-cv-ats">A checklist do CV para ATS</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'O que é uma boa pontuação ATS?',
        a: 'Neste verificador, 85 ou mais significa que um leitor lê o documento sem problemas e nada de importante se perde. De 70 a 84 é bom, com algumas correções por fazer. De 50 a 69 precisa de trabalho, normalmente por falta de um título de secção ou de um contacto. Abaixo de 50 há algo estrutural errado, quase sempre texto que o leitor não consegue extrair.',
      },
      {
        q: 'As empresas veem a minha pontuação ATS?',
        a: 'Não uma pontuação de um verificador como este. Ela é calculada no seu dispositivo e não é enviada para lado nenhum. O sistema da empresa pode ordenar as candidaturas face à vaga, mas essa ordenação usa as suas próprias regras e os termos de pesquisa do recrutador, não qualquer pontuação de terceiros.',
      },
      {
        q: 'Porque é que o meu CV tem uma pontuação diferente em cada verificador?',
        a: 'Porque não há um padrão. Cada verificador define as suas verificações e os seus pesos. Compare as verificações individuais que falharam, e não os números globais.',
      },
      {
        q: 'É verdade que 75% dos CV são rejeitados por um ATS?',
        a: 'Esse número circula há mais de uma década sem uma fonte credível. Os sistemas de acompanhamento de candidaturas guardam e pesquisam candidaturas; os filtros são definidos pelos recrutadores. O risco real é um CV mal lido pelo leitor, que depois não aparece na pesquisa do recrutador.',
      },
    ],
  },

  {
    ...guide('ats-checker-without-upload'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Um navegador consegue ler e pontuar um PDF ou DOCX sem o enviar para lado nenhum, pelo que carregar o ficheiro é uma opção de desenho, não uma necessidade técnica. Pode confirmar um verificador em menos de um minuto: abra o painel Rede (Network) do navegador, largue lá o CV e procure um pedido que leve o ficheiro.',
    body: (
      <>
        <P>
          O CV é um dos documentos mais sensíveis que a maioria das pessoas tem. Contém o nome
          completo, o email pessoal, o telefone, a localidade e o historial completo de quem o
          empregou. Entregá-lo a um site é uma decisão maior do que parece.
        </P>
        <P>
          Importa sobretudo na situação em que as pessoas costumam recorrer a um verificador de CV:{' '}
          <strong>à procura de emprego sem ter saído do atual.</strong> Nessa altura, o documento
          não é só informação pessoal, é prova de intenção.
        </P>

        <H2>O que costuma significar “carregue o seu CV”</H2>
        <P>
          Quando uma ferramenta pede para carregar o ficheiro, ele sai do seu dispositivo e chega a
          um servidor. A partir daí, é normal — e muitas vezes está nos termos — acontecer alguma
          combinação do seguinte:
        </P>
        <UL>
          <LI>O ficheiro é guardado, por vezes indefinidamente, e associado à conta que criou.</LI>
          <LI>O texto é enviado a um modelo de linguagem de terceiros para pontuar ou reescrever.</LI>
          <LI>O email com que se registou entra numa sequência de marketing.</LI>
          <LI>Dados agregados alimentam um produto de recrutamento vendido a empresas.</LI>
        </UL>
        <P>
          Nada disto é necessariamente malicioso. É simplesmente o modelo de negócio: a verificação é
          grátis porque o produto são você e o seu documento. Mas convém saber antes de clicar, e não
          depois.
        </P>

        <H2>As perguntas a fazer a qualquer verificador</H2>
        <UL>
          <LI><strong>O ficheiro sai do dispositivo?</strong> Se não há envio, a maioria das outras perguntas deixa de importar.</LI>
          <LI><strong>É preciso criar conta?</strong> Um muro de email serve para recolher o email, não para melhorar a pontuação.</LI>
          <LI><strong>A pontuação é determinística ou gerada?</strong> Se um modelo escreve o feedback, o seu CV foi enviado a esse modelo.</LI>
          <LI><strong>Pode ler as regras?</strong> Uma grelha pública pode ser contestada. Uma escondida não.</LI>
          <LI><strong>Como se apaga o ficheiro?</strong> Se a resposta é um email para o apoio ao cliente, assuma que o ficheiro fica.</LI>
        </UL>

        <H2>Como funciona uma verificação só local</H2>
        <P>
          Os navegadores modernos conseguem ler um PDF ou DOCX sem qualquer servidor envolvido. O
          ficheiro é aberto em memória, uma biblioteca JavaScript extrai o texto, as verificações
          correm sobre esse texto e o resultado é apresentado — tudo dentro do separador que já tem
          aberto. Feche o separador e o documento desaparece.
        </P>
        <P>
          A contrapartida é real e convém dizê-la: um verificador local não o consegue comparar com
          uma base de dados de outros candidatos, nem reescrever os seus marcadores. O que consegue é
          dizer-lhe se um leitor vai ler bem o documento e quais são as linhas fracas — que é a parte
          que de facto afeta se a candidatura chega intacta.
        </P>

        <H2>Como confirmar que um verificador não carrega mesmo o ficheiro</H2>
        <P>
          “Nunca guardamos o seu ficheiro” é uma promessa. Se o ficheiro chega sequer a sair do seu
          computador é algo que pode ver acontecer — ou não — em qualquer navegador de secretária:
        </P>
        <OL>
          <li>Abra o verificador e, a seguir, as ferramentas de programador do navegador: <Code>F12</Code> no Windows e no Linux, <Code>⌥ ⌘ I</Code> num Mac.</li>
          <li>Passe ao separador <strong>Rede</strong> (<em>Network</em>) e limpe-o, para que só apareçam pedidos novos.</li>
          <li>Largue o seu CV no verificador e espere pelo resultado.</li>
          <li>
            Percorra os pedidos novos. Um envio é um <Code>POST</Code> ou <Code>PUT</Code> cujo
            tamanho é aproximadamente o do seu ficheiro. Os scripts e tipos de letra que a página
            carrega para si própria não são envios.
          </li>
        </OL>
        <P>
          Se nenhum pedido leva o ficheiro, o ficheiro não saiu. Isto funciona em qualquer site,
          incluindo este — e é essa a ideia: a afirmação deve poder ser confirmada por si, e não aceite
          por confiança.
        </P>
        <P>
          Este site acrescenta uma segunda garantia, imposta pelo próprio navegador. O seu cabeçalho
          Content-Security-Policy define <Code>connect-src 'self' data: blob:</Code>, o que significa
          que o navegador recusa qualquer ligação de rede a outro domínio, e o único domínio com que
          pode comunicar serve apenas ficheiros estáticos — não existe nenhum ponto de receção de CV.
        </P>

        <Note>
          <strong>Este site é do tipo local.</strong>{' '}
          O <A href="/pt-pt/">verificador de CV ATS gratuito</A> lê o seu PDF ou DOCX no navegador com{' '}
          <code className="rounded bg-white px-1 py-0.5 text-[13px] text-stone-800">pdf.js</code> e{' '}
          <code className="rounded bg-white px-1 py-0.5 text-[13px] text-stone-800">mammoth</code>,
          pontua-o com regras fixas e não tem nenhum servidor que possa receber um ficheiro. Tem
          licença MIT, pelo que a afirmação se pode confirmar em vez de ser apenas prometida.
        </Note>

        <H2>Relacionado</H2>
        <UL>
          <LI><A href="/pt-pt/o-que-e-a-pontuacao-ats">O que mede realmente a pontuação ATS</A></LI>
          <LI><A href="/pt-pt/pdf-ou-docx-para-ats">PDF ou DOCX: qual deve enviar?</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'É seguro carregar o meu CV num verificador de CV online?',
        a: 'Depende do que acontece ao ficheiro, o que normalmente só vem descrito nos termos. Os CV carregados são, em geral, guardados, associados a uma conta e por vezes enviados a modelos de linguagem de terceiros. Se procura emprego sem ter saído do atual, prefira um verificador que nunca receba o ficheiro.',
      },
      {
        q: 'Como pode um site ler o meu CV sem o carregar?',
        a: 'Os navegadores conseguem abrir um ficheiro que escolher para a memória da própria página. Bibliotecas JavaScript como pdf.js e mammoth extraem então o texto, e as verificações correm no seu dispositivo. Nada precisa de um servidor.',
      },
      {
        q: 'Como sei que um verificador de CV não está a carregar o meu ficheiro?',
        a: 'Abra as ferramentas de programador do navegador, vá ao separador Rede, limpe-o e depois largue lá o CV. Um envio aparece como um pedido POST ou PUT com aproximadamente o tamanho do ficheiro. Se não houver nenhum, o ficheiro ficou no seu dispositivo.',
      },
    ],
  },

  {
    ...guide('pdf-or-docx-for-ats'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Envie um PDF com texto real, a menos que a candidatura peça outro formato — nesse caso, envie exatamente o que pedem. O único PDF que falha de forma fiável é o que não tem texto real, como uma digitalização ou uma exportação com os tipos de letra convertidos em contornos, e dá para o testar em segundos.',
    body: (
      <>
        <P>
          A resposta curta: <strong>envie um PDF com texto real, a menos que a empresa peça outra
          coisa — nesse caso, envie exatamente o que pediram.</strong> A resposta longa merece dois
          minutos, porque o conselho habitual (“use sempre Word, os ATS não leem PDF”) está
          desatualizado há uma década.
        </P>

        <H2>Porque é que o PDF é hoje a opção por defeito</H2>
        <UL>
          <LI><strong>Fica igual em todo o lado.</strong> Um DOCX reorganiza-se consoante os tipos de letra e a versão do Word do outro lado. A sua disposição cuidada de duas páginas pode chegar como três páginas desalinhadas.</LI>
          <LI><strong>Os leitores modernos lidam bem com ele.</strong> A extração de texto de PDF é um problema resolvido; os principais sistemas suportam-no há anos.</LI>
          <LI><strong>É mais difícil de estragar.</strong> Ninguém edita o seu PDF por acidente entre o envio e a revisão.</LI>
        </UL>

        <H2>O único PDF que falha sempre</H2>
        <P>
          Um PDF é um contentor. Pode conter texto real ou uma imagem de texto. Se exportou a partir
          de uma ferramenta de design com o texto convertido em contornos, ou digitalizou uma
          impressão, ou fez uma captura de ecrã do CV e a guardou como PDF, o ficheiro não contém{' '}
          <em>nenhum texto</em>. Um leitor vê-o como um documento em branco.
        </P>
        <P>
          O teste demora três segundos: abra o PDF e tente selecionar uma linha de texto com o
          cursor. Se não a consegue realçar, o ATS também não.
        </P>

        <H2>Um teste de 30 segundos para qualquer PDF</H2>
        <P>Selecionar texto prova que o texto existe. Mais dois passos mostram se sai utilizável:</P>
        <OL>
          <li><strong>Selecione uma linha.</strong> Se nada fica realçado, a página é uma imagem. Volte a exportar a partir do documento original.</li>
          <li>
            <strong>Pesquise o seu email</strong> com <Code>Ctrl F</Code> / <Code>⌘ F</Code>. Se o
            visualizador não o encontra, um leitor de ATS também não — muitas vezes porque está num
            cabeçalho, numa imagem ou numa caixa de texto.
          </li>
          <li>
            <strong>Selecione tudo, copie e cole num editor de texto simples</strong> (o Bloco de
            Notas, ou o TextEdit em modo de texto simples). O que vir é próximo do que um leitor
            recebe. Se duas colunas saírem intercaladas linha a linha, ou os cargos aparecerem longe
            das datas, corrija a disposição antes de se preocupar com o resto.
          </li>
        </OL>
        <P>
          Exportar do Word, do Google Docs ou do Pages com a opção normal de <em>exportar</em> ou{' '}
          <em>guardar como PDF</em> produz PDF com texto real. Os caminhos de risco são “imprimir
          para imagem”, a digitalização e as ferramentas de design com a opção de converter texto em
          contornos.
        </P>

        <H2>Quando o DOCX é a resposta certa</H2>
        <UL>
          <LI><strong>O formulário assim o diz.</strong> Se o campo de envio aceita apenas <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">.doc/.docx</code>, essa é a resposta. Não tente ser mais esperto do que o formulário.</LI>
          <LI><strong>Um recrutador pediu.</strong> As agências costumam passar o seu CV para o modelo delas, o que exige um ficheiro editável.</LI>
          <LI><strong>A empresa usa um sistema mais antigo.</strong> Raro hoje, mas não custa cumprir.</LI>
        </UL>

        <H2>O que importa mais do que a extensão</H2>
        <P>
          O formato é a decisão mais fácil que vai tomar sobre o CV. Estas são as que realmente
          fazem diferença:
        </P>
        <UL>
          <LI><strong>Uma coluna.</strong> As disposições em várias colunas podem ser lidas pela ordem errada, intercalando duas linhas sem relação.</LI>
          <LI><strong>Sem texto dentro de imagens.</strong> Um logótipo não faz mal; o cargo desenhado como gráfico faz.</LI>
          <LI><strong>Nenhum dado essencial no cabeçalho ou no rodapé.</strong> Alguns leitores ignoram essas zonas. Ponha o email no corpo.</LI>
          <LI><strong>Marcadores verdadeiros,</strong> e não traços desenhados à mão dentro de uma célula de tabela.</LI>
          <LI><strong>Um nome de ficheiro sensato</strong> — <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">Nome_Apelido_CV.pdf</code>. Uma pessoa vê-o numa pasta com centenas.</LI>
        </UL>

        <Note>
          <strong>Não sabe em que categoria cai o seu ficheiro?</strong> Largue-o no{' '}
          <A href="/pt-pt/">verificador de CV ATS gratuito</A> — lê PDF e DOCX no navegador e diz-lhe
          logo se há texto extraível, quantas páginas vê um leitor e que secções conseguiu
          identificar.
        </Note>

        <H2>Relacionado</H2>
        <UL>
          <LI><A href="/pt-pt/como-funciona-a-leitura-de-cv-ats">Como funciona realmente a leitura de CV por um ATS</A></LI>
          <LI><A href="/pt-pt/checklist-cv-ats">A checklist do CV para ATS</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Um ATS consegue ler um CV em PDF?',
        a: 'Sim, desde que o PDF contenha texto real. Os sistemas de acompanhamento de candidaturas modernos extraem texto de PDF de forma rotineira. Um PDF digitalizado ou só com imagens não tem texto para extrair e é lido como estando em branco.',
      },
      {
        q: 'Devo enviar .doc ou .docx?',
        a: 'Prefira .docx, o formato atual do Word, a menos que a empresa peça especificamente .doc. Melhor ainda, envie um PDF com texto real, a não ser que o formulário o limite a ficheiros Word.',
      },
      {
        q: 'Como sei se o meu PDF tem texto real?',
        a: 'Abra-o e tente realçar uma linha com o cursor; depois pesquise o seu endereço de email. Se consegue selecionar texto e a pesquisa encontra o email, o PDF tem texto real.',
      },
    ],
  },

  {
    ...guide('how-ats-parsing-works'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Um ATS lê um CV em quatro fases mecânicas: extrai o texto, divide-o em secções pelos títulos, retira entidades como o email, as datas e os cargos e indexa o resultado para os recrutadores pesquisarem. Quase todos os conselhos de formatação existem porque uma destas fases falha.',
    body: (
      <>
        <P>
          A maior parte dos conselhos sobre CV trata o sistema de acompanhamento de candidaturas
          como uma caixa negra com opiniões. É mais simples do que isso. A leitura faz-se por fases,
          todas mecânicas, e quase todo o conselho de formatação verdadeiro decorre de uma fase
          concreta que falha.
        </P>

        <H2>Fase 1 — Extração do texto</H2>
        <P>
          O ficheiro é aberto e os carateres são retirados dele. Num DOCX, trata-se sobretudo de ler
          XML. Num PDF é mais difícil: um PDF não guarda linhas nem parágrafos, guarda fragmentos de
          texto com coordenadas. Reconstruir “este fragmento e aquele estão na mesma linha” é
          geometria, e é aqui que as disposições em várias colunas se desfazem — duas colunas podem
          ser cosidas numa única linha sem sentido.
        </P>
        <P>
          Eis o que isso parece. Um CV de duas colunas, como o leitor o vê, e o texto que um
          extrator linha a linha — incluindo o deste site — de facto recebe:
        </P>
        <Pre label="O que o leitor vê">{`EXPERIÊNCIA                       COMPETÊNCIAS
Gestor de Engenharia, Acme        Kubernetes, Go
jan 2020 – presente               Terraform, AWS`}</Pre>
        <Pre label="O que o leitor de ATS recebe">{`EXPERIÊNCIA COMPETÊNCIAS
Gestor de Engenharia, Acme Kubernetes, Go
jan 2020 – presente Terraform, AWS`}</Pre>
        <P>
          Todas as linhas passam a ser híbridas. O título Experiência partilha a linha com
          Competências, ao cargo ficam coladas duas competências e o intervalo de datas é seguido de
          fornecedores de cloud. Nada se perdeu — foi só recomposto pela ordem errada, o que para um
          leitor é a mesma coisa.
        </P>
        <P><strong>Falha quando:</strong> a página é uma imagem, o texto está convertido em contornos ou a disposição tem várias colunas.</P>

        <H2>Fase 2 — Divisão em secções</H2>
        <P>
          O texto é cortado em zonas à procura de títulos. É por isso que o título aborrecido vence
          o engenhoso: um leitor que compara com uma lista de palavras conhecidas encontra{' '}
          <em>Experiência</em>, <em>Experiência Profissional</em> e <em>Percurso Profissional</em>.
          Não encontra <em>Onde Deixei Marca</em>.
        </P>
        <P>
          Para ser concreto: estes são os títulos exatos que o verificador deste site procura. Aceita
          uma linha curta — 45 carateres ou menos, com qualquer combinação de maiúsculas e
          minúsculas — que contenha um deles, pelo que <em>Experiência Profissional Relevante</em>{' '}
          conta como Experiência.
        </P>
        <Table
          caption="Títulos de secção que o ATS Resume Toolkit reconhece"
          head={['Secção', 'Títulos que aceita', 'Pontos']}
          rows={SECTION_ROWS}
        />
        <P>
          Os leitores comerciais usam listas mais longas, mas o princípio é idêntico — e nenhuma
          delas tem o seu título inventado.
        </P>
        <P><strong>Falha quando:</strong> os títulos são criativos, distinguidos só pela cor, ou não existem.</P>

        <H2>Fase 3 — Extração de entidades</H2>
        <P>
          Dentro de cada secção, o leitor procura coisas específicas: um email é um padrão, um número
          de telefone é um padrão, um intervalo de datas marca o início de uma função. O cargo e a
          empresa deduzem-se pela posição relativa à data.
        </P>
        <P>
          É por isso que <strong>as datas importam mais do que as pessoas esperam</strong>. Uma linha
          com data é a âncora que diz ao leitor “aqui começa um novo emprego”. As funções sem data
          fundem-se no que vinha antes, e os seus três anos nalgum sítio vão parar à entrada do
          empregador anterior.
        </P>
        <P><strong>Falha quando:</strong> faltam as datas, estão escritas só como “2 anos” ou desenhadas como uma linha cronológica gráfica.</P>

        <H2>Fase 4 — Indexação e pesquisa</H2>
        <P>
          Os campos extraídos entram numa base de dados. Depois, um recrutador pesquisa-a — por
          cargo, por competência, por localidade. Nesta altura o seu CV não está a ser avaliado; está
          a ser <em>consultado</em>.
        </P>
        <P>
          O que muda a questão das palavras-chave. O objetivo não é encher o texto de termos para
          agradar a um algoritmo. É garantir que as palavras que um recrutador escreveria
          plausivelmente aparecem em algum lado onde as conquistou honestamente. Se liderou migrações
          para Kubernetes e nunca escreveu a palavra “Kubernetes”, não vai estar nesses resultados.
        </P>
        <P><strong>Falha quando:</strong> o vocabulário do CV e o do anúncio não têm qualquer sobreposição.</P>

        <H2>O que isto implica</H2>
        <UL>
          <LI>Os conselhos de formatação não são superstição — cada regra corresponde a uma das fases acima.</LI>
          <LI>Os conselhos sobre palavras-chave dizem respeito à sobreposição de vocabulário, não à densidade. Nunca afirme uma competência que não tem.</LI>
          <LI>Nada neste processo o avalia. Ou o coloca numa forma pesquisável, ou falha.</LI>
        </UL>

        <Note>
          <strong>Veja-o do lado do leitor.</strong> O{' '}
          <A href="/pt-pt/">verificador de CV ATS gratuito</A> tem um separador <em>Dados extraídos</em>{' '}
          que mostra exatamente o que saiu do seu ficheiro — o nome, os contactos, as ligações e cada
          função que conseguiu identificar. Se algo falta ali, também faltará para a empresa.
        </Note>

        <H2>Relacionado</H2>
        <UL>
          <LI><A href="/pt-pt/o-que-e-a-pontuacao-ats">O que mede realmente a pontuação ATS</A></LI>
          <LI><A href="/pt-pt/verificador-cv-ats-sem-carregar-ficheiro">Verificadores que não carregam o seu CV</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Um ATS consegue ler um CV de duas colunas?',
        a: 'Muitas vezes não pela ordem certa. A extração de texto reconstrói as linhas a partir das posições na página, pelo que duas colunas podem ser cosidas linha a linha, misturando um cargo com uma lista de competências. Uma disposição de coluna única evita o problema por completo.',
      },
      {
        q: 'Os sistemas de acompanhamento de candidaturas leem cabeçalhos e rodapés?',
        a: 'Alguns leitores ignoram essas zonas ou tratam-nas de forma pouco fiável. Mantenha o nome, o email e o telefone no corpo da página, para serem extraídos seja qual for o leitor que abra o ficheiro.',
      },
      {
        q: 'Esconder palavras-chave a branco ajuda?',
        a: 'Não. O texto branco continua a ser texto: é extraído para o perfil que o recrutador lê, onde parece uma tentativa de manipular a pesquisa. Use o vocabulário do anúncio apenas onde o conquistou de facto.',
      },
    ],
  },

  {
    ...guide('ats-resume-checklist'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Corrija primeiro cinco coisas: texto selecionável, o email no corpo, uma única coluna, títulos de secção padrão e uma data em cada função. Decidem se a candidatura chega intacta. Tudo o resto decide se é encontrado numa pesquisa e, depois, se uma pessoa gosta de o ler.',
    body: (
      <>
        <P>
          Ordenado pelas consequências, não pela convenção. O primeiro grupo decide se a candidatura
          chega sequer; o último é acabamento. Se só tem dez minutos, faça o primeiro grupo.
        </P>

        <H2>Crítico — se o ignorar, a candidatura pode não chegar</H2>
        <UL>
          <LI><strong>O texto é selecionável.</strong> Abra o ficheiro e tente realçar uma linha. Se não consegue, o leitor vê uma página em branco.</LI>
          <LI><strong>O email está em texto simples, no corpo.</strong> Não no cabeçalho, não só atrás de um ícone de correio, não só como hiperligação.</LI>
          <LI><strong>Uma coluna.</strong> As barras laterais são a causa mais comum de extrações baralhadas.</LI>
          <LI><strong>Títulos de secção padrão.</strong> Experiência, Formação, Competências, Resumo. Aqui ganha o aborrecido.</LI>
          <LI><strong>Todas as funções têm datas.</strong> Mês e ano, num formato coerente, na mesma linha da função.</LI>
        </UL>

        <H2>Importante — decidem se aparece numa pesquisa</H2>
        <UL>
          <LI><strong>Os cargos são reconhecíveis.</strong> Se o seu cargo interno é “Ninja da Entrega”, ponha ao lado o cargo habitual do setor.</LI>
          <LI><strong>O vocabulário do anúncio aparece</strong> — mas só onde o conquistou honestamente.</LI>
          <LI><strong>Existe uma secção de competências,</strong> em texto simples separado por vírgulas e não num gráfico de barras de competências.</LI>
          <LI><strong>As ligações estão escritas</strong> como texto visível: <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">linkedin.com/in/nome</code>. Um leitor lê texto, não o destino da ligação.</LI>
          <LI><strong>Nenhum texto vive dentro de uma imagem ou de uma caixa de texto.</strong></LI>
        </UL>

        <H2>Vale a pena — são lidos por uma pessoa</H2>
        <UL>
          <LI><strong>Os marcadores começam por um verbo.</strong> Liderei, lancei, reduzi, reconstruí, geri.</LI>
          <LI><strong>O impacto leva um número.</strong> “Melhorei a fiabilidade” é uma afirmação; “sessões sem falhas de 96% para 99,5%” é prova.</LI>
          <LI><strong>Sem frases feitas.</strong> “Profissional orientado para resultados com historial comprovado” não diz nada a quem lê.</LI>
          <LI><strong>A extensão corresponde à carreira.</strong> Uma página no início, duas é normal passada uma década. Três pedem uma razão.</LI>
          <LI><strong>O nome do ficheiro é um nome</strong> — <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">Nome_Apelido_CV.pdf</code>, e não <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">cv_final_v3_MESMO.pdf</code>.</LI>
        </UL>

        <H2>O que um verificador consegue confirmar por si</H2>
        <P>
          A maior parte da lista é mecânica, por isso o software pode verificá-la. Uma parte é
          juízo, por isso não pode. Eis a divisão para o verificador deste site:
        </P>
        <H3>Verificado automaticamente</H3>
        <UL>
          <LI>Texto selecionável e codificação de carateres limpa</LI>
          <LI>Email, telefone e uma ligação de perfil visível como texto — assinala também uma ligação que existe apenas como hiperligação escondida</LI>
          <LI>Títulos padrão para Experiência, Formação, Competências e Resumo, mais Conquistas, Projetos e Certificações</LI>
          <LI>Datas, estrutura de marcadores e número de páginas</LI>
          <LI>Números nos marcadores e marcadores que começam por um verbo</LI>
          <LI>Frases feitas e afirmações vagas, no separador próprio de estilo de escrita</LI>
          <LI>O vocabulário do anúncio, se colar o anúncio na comparação com o anúncio de emprego</LI>
        </UL>
        <H3>Fica por sua conta</H3>
        <UL>
          <LI>Se uma barra lateral ou uma segunda coluna baralha a ordem de leitura — use o teste de copiar e colar</LI>
          <LI>Se os cargos são os que um recrutador pesquisaria</LI>
          <LI>Se cada palavra-chave que acrescentou é uma que conquistou</LI>
          <LI>O nome do ficheiro</LI>
        </UL>

        <Note>
          <strong>Quase tudo nesta lista se verifica automaticamente.</strong> O{' '}
          <A href="/pt-pt/">verificador de CV ATS gratuito</A> executa no navegador as verificações
          de legibilidade, contactos, secções, formato e conteúdo e ordena as falhas pelos pontos que
          cada uma custa — para corrigir primeiro o que sai mais caro. O separador de estilo de
          escrita cobre as frases feitas e as afirmações sem números.
        </Note>

        <H2>Relacionado</H2>
        <UL>
          <LI><A href="/pt-pt/como-funciona-a-leitura-de-cv-ats">Como funciona realmente a leitura de CV por um ATS</A></LI>
          <LI><A href="/pt-pt/pdf-ou-docx-para-ats">PDF ou DOCX: qual deve enviar?</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Que extensão deve ter um CV compatível com ATS?',
        a: 'Uma página no início da carreira; duas páginas é normal passada cerca de uma década. A extensão não impede um leitor de ler o ficheiro, mas as páginas além da segunda muitas vezes não são lidas pelo recrutador.',
      },
      {
        q: 'As tabelas e as caixas de texto são seguras num CV para ATS?',
        a: 'Evite-as para tudo o que seja importante. O texto dentro de caixas de texto pode ser ignorado ou extraído fora de ordem, e as tabelas usadas para disposição criam os mesmos problemas de ordem de leitura que as colunas. Parágrafos simples e listas com marcadores são o mais seguro.',
      },
      {
        q: 'O que devo corrigir primeiro no meu CV para ATS?',
        a: 'Garanta que o texto é selecionável, que o email está no corpo, que a disposição é de uma só coluna, que os títulos de secção são padrão e que cada função tem datas. Estas cinco coisas decidem se a candidatura é lida corretamente.',
      },
    ],
  },

  {
    ...guide('how-to-check-your-cv-score'),
    published: '2026-10-10',
    updated: '2026-10-10',
    summary:
      'Largue o PDF ou DOCX num verificador de pontuação do CV, leia a pontuação e as verificações falhadas, corrija primeiro as mais pesadas e volte a verificar. Aqui tudo corre no navegador: sem carregar o ficheiro, sem conta, sem IA. Uma pontuação de 85 ou mais significa que nada de importante se perde.',
    body: (
      <>
        <P>
          A pontuação do CV é uma estimativa da facilidade com que o software consegue ler o seu
          documento. As empresas usam sistemas de acompanhamento de candidaturas (ATS) para guardar e
          pesquisar candidaturas, pelo que um CV mal lido pelo sistema pode ficar sem o email ou sem
          os cargos. Verificar a pontuação demora menos de um minuto e é grátis.
        </P>

        <H2>Verifique a pontuação do CV em quatro passos</H2>
        <OL>
          <LI>
            Abra o <A href="/pt-pt/">verificador de CV ATS gratuito</A> e escolha <em>Verificar o meu CV</em>.
          </LI>
          <LI>
            Largue o CV em PDF ou DOCX. O ficheiro é lido dentro do navegador e nunca é enviado para
            lado nenhum, por isso pode usá-lo sem receio com o CV que vai enviar a um concorrente do
            seu empregador atual.
          </LI>
          <LI>
            Leia a pontuação e a lista de verificações falhadas. As falhas estão ordenadas pelos
            pontos que cada uma custa, pelo que o primeiro item é a correção mais valiosa.
          </LI>
          <LI>
            Corrija os dois ou três primeiros itens, volte a exportar e largue o novo ficheiro.
            Repita até não restar nada caro.
          </LI>
        </OL>

        <H2>O que é uma boa pontuação de CV</H2>
        <P>
          Neste verificador, 85 ou mais significa que um leitor lê o documento sem problemas. De 70 a
          84 é bom, com algumas correções por fazer. De 50 a 69 precisa de trabalho, normalmente por
          falta de um título de secção ou de um contacto. Abaixo de 50 há algo estrutural errado,
          quase sempre texto que o leitor não consegue extrair. Não persiga os últimos pontos: acima
          de cerca de 85, o conteúdo importa mais do que a pontuação.
        </P>

        <H2>O que corrigir primeiro</H2>
        <UL>
          <LI>Garanta que o texto é selecionável. Um PDF digitalizado ou só com imagens pontua perto de zero.</LI>
          <LI>Ponha o email e o telefone no corpo da página, não num cabeçalho nem numa imagem.</LI>
          <LI>Use títulos padrão: Experiência, Formação, Competências, Resumo.</LI>
          <LI>Dê datas a todas as funções e use marcadores verdadeiros.</LI>
        </UL>

        <H2>O que a pontuação não lhe diz</H2>
        <P>
          Não sabe se serve para a vaga e não é o que a empresa vê. Para saber se serve para a vaga,
          cole o anúncio na comparação de palavras-chave. Para as regras completas, leia{' '}
          <A href="/pt-pt/o-que-e-a-pontuacao-ats">o que mede realmente a pontuação ATS</A>.
        </P>

        <Note>
          <strong>Experimente com o seu ficheiro.</strong> O{' '}
          <A href="/pt-pt/">verificador de CV ATS gratuito</A> é de código aberto, funciona no
          navegador e não pede um endereço de email.
        </Note>

        <H2>Relacionado</H2>
        <UL>
          <LI><A href="/pt-pt/o-que-e-a-pontuacao-ats">O que mede realmente a pontuação ATS</A></LI>
          <LI><A href="/pt-pt/checklist-cv-ats">A checklist do CV para ATS</A></LI>
          <LI><A href="/pt-pt/verificador-cv-ats-sem-carregar-ficheiro">Verificadores de CV ATS que não carregam o seu ficheiro</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Como verifico a pontuação do meu CV grátis?',
        a: 'Abra um verificador de pontuação do CV que não exija registo, largue lá o PDF ou DOCX e leia a pontuação e as verificações falhadas. Neste site o ficheiro é processado no navegador e nunca é carregado para um servidor.',
      },
      {
        q: 'O que é uma boa pontuação de CV?',
        a: 'Neste verificador, 85 ou mais significa que o documento é lido sem problemas. De 70 a 84 é bom, com algumas correções por fazer. Abaixo de 50 costuma significar que o texto não pode ser extraído.',
      },
      {
        q: 'A pontuação do CV é o mesmo que a pontuação ATS?',
        a: 'Na prática, sim: ambas estimam a facilidade com que o software de acompanhamento de candidaturas lê o seu documento. Não existe uma pontuação padrão, por isso verificadores diferentes dão números diferentes.',
      },
    ],
  },
]
