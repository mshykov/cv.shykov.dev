// Guias estáticos em português do Brasil, renderizados em HTML independente na
// hora do build por scripts/prerender.mjs. Não carregam JavaScript: um guia é
// texto, e o bundle do app só o deixaria mais lento.
//
// Ficam em src/ para o scanner do Tailwind enxergar estas classes e gerar o
// mesmo CSS do app. Não mova para fora de src/, ou os guias saem sem estilo.
import { A, Code, H2, H3, LI, Note, OL, P, Pre, Table, UL } from '../prose.tsx'
import { rubricRows, sectionRows } from '../tables.ts'
import { GUIDES } from './guides.ts'
import type { Article, Guide } from '../types.ts'
import { ptBR } from '../../i18n/messages/pt-br.ts'

function guide(id: Guide['id']): Guide {
  const meta = GUIDES.find((g) => g.id === id)
  if (!meta) throw new Error(`articles: no entry for "${id}" in guides.ts`)
  return meta
}

const RUBRIC_ROWS = rubricRows(ptBR)
const SECTION_ROWS = sectionRows('pt', ptBR)

export const ARTICLES: Article[] = [
  {
    ...guide('what-is-an-ats-score'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'A pontuação ATS estima com que clareza um software de rastreamento de candidatos consegue extrair do seu currículo o texto, os dados de contato, as seções e as datas. Ela não diz se você combina com a vaga. Acima de uns 85, nada importante está se perdendo: use o tempo para melhorar o conteúdo.',
    body: (
      <>
        <P>
          Um sistema de rastreamento de candidatos (ATS, na sigla em inglês) é o software que uma
          empresa usa para receber, armazenar e pesquisar candidaturas. Antes de um recrutador ler o
          seu currículo, o sistema o processa: extrai seu nome, seus dados de contato, seus cargos,
          suas datas e suas habilidades e grava tudo em campos de um banco de dados. A{' '}
          <strong>pontuação ATS</strong> é uma estimativa de como essa etapa vai correr.
        </P>
        <P>
          A afirmação é mais estreita do que parece, e é justamente aí que está o ponto. A pontuação
          não sabe se você é a pessoa certa para a vaga. Ela mede uma coisa só: se o documento
          sobrevive à leitura por uma máquina.
        </P>

        <H2>O mito que vale largar primeiro</H2>
        <P>
          Você provavelmente já leu que <em>“75% dos currículos são rejeitados por um ATS antes que
          uma pessoa os veja”.</em> Esse número é repetido há mais de uma década e não tem nenhuma
          fonte confiável por trás. Sistemas de rastreamento de candidatos são ferramentas de busca
          e armazenamento. Eles ordenam e filtram com critérios definidos pelo recrutador; não
          descartam sozinhos três quartos dos candidatos.
        </P>
        <P>
          O risco real é mais banal e mais fácil de corrigir. Se o leitor não encontra o seu e-mail,
          sua candidatura chega com o campo de contato vazio. Se não consegue ler seus cargos, você
          não aparece na busca do recrutador por “gerente de engenharia”. Ninguém rejeitou você:
          você simplesmente nunca entrou na lista de resultados.
        </P>

        <H2>O que uma pontuação consegue medir com razoabilidade</H2>
        <P>
          Toda pontuação ATS honesta é uma heurística montada a partir de poucas verificações. Neste
          site a tabela de critérios é fixa, soma 100 pontos e é pública, então você vê exatamente de
          onde vem cada ponto. Em cinco grupos:
        </P>
        <UL>
          <LI><strong>Legibilidade (25)</strong> — há texto real e selecionável, ou a página é uma imagem?</LI>
          <LI><strong>Contato (15)</strong> — e-mail, telefone e um link escrito como texto visível.</LI>
          <LI><strong>Seções (35)</strong> — títulos que o leitor reconhece: Experiência, Formação, Habilidades, Resumo.</LI>
          <LI><strong>Formato (15)</strong> — número de páginas, cargos com datas, estrutura real de marcadores.</LI>
          <LI><strong>Conteúdo (10)</strong> — resultados quantificados e marcadores que começam com um verbo.</LI>
        </UL>
        <P>E verificação por verificação — esta tabela é a que o verificador executa, não um resumo dela:</P>
        <Table
          caption="Tabela de pontuação do ATS Resume Toolkit, verificação por verificação"
          head={['Verificação', 'Grupo', 'Pontos']}
          rows={RUBRIC_ROWS}
        />
        <P>
          Dois detalhes passam fácil. A falta de telefone ou de resumo custa só os pontos da própria
          verificação — são avisos, não falhas — enquanto a falta de um título de Experiência,
          Formação ou Habilidades reprova de vez. E a última linha de Seções é bônus: o título
          Conquistas vale 4, Projetos 3 e Certificações 3.
        </P>
        <P>
          As seções pesam mais porque são o que transforma um bloco de texto em dados estruturados.
          Um leitor que encontra um título “Experiência” sabe que as entradas logo abaixo são
          empregos. Sem ele, está adivinhando.
        </P>

        <H2>O que nenhuma pontuação consegue medir</H2>
        <UL>
          <LI>Se a sua experiência combina com a vaga. Isso é julgamento do recrutador.</LI>
          <LI>Qual ATS específico a empresa usa. Cada fornecedor lê de um jeito e nenhum publica suas regras.</LI>
          <LI>Se a sua escrita convence. Um currículo perfeitamente legível ainda pode ser monótono.</LI>
        </UL>
        <P>
          Trate uma pontuação acima de uns 85 como “nada aqui vai se perder no caminho” e passe para
          o conteúdo. Correr atrás dos últimos pontos quase sempre é esforço perdido.
        </P>

        <H2>Por que dois verificadores dão duas pontuações diferentes</H2>
        <P>
          Não existe pontuação ATS padrão. Cada verificador inventa seus critérios, dá os pesos que
          quiser e, em geral, não conta quais são. Um 62 em um site e um 81 em outro não são uma
          contradição: são dois testes diferentes. A pergunta útil nunca é “qual número está certo”,
          e sim “qual verificação específica falhou, e eu concordo que ela importa?”. Isso só tem
          resposta quando as regras são públicas.
        </P>

        <Note>
          <strong>Confira o seu em alguns segundos.</strong> O{' '}
          <A href="/pt-br/">verificador de currículo ATS grátis</A> pontua um PDF ou DOCX inteiramente
          dentro do seu navegador: o arquivo nunca é enviado, não há cadastro e nenhum modelo de
          linguagem é usado. Você pode ler as regras exatas de pontuação no código público.
        </Note>

        <H2>Leia também</H2>
        <UL>
          <LI><A href="/pt-br/como-o-ats-le-seu-curriculo">Como o ATS lê o seu currículo, na prática</A></LI>
          <LI><A href="/pt-br/checklist-de-curriculo-para-ats">Checklist de currículo para ATS</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'O que é uma boa pontuação ATS?',
        a: 'Neste verificador, 85 ou mais significa que um leitor vai ler o documento sem problemas e nada importante se perde. De 70 a 84 é boa, com algumas correções específicas pendentes. De 50 a 69 precisa de ajustes, em geral por falta de um título de seção ou de um dado de contato. Abaixo de 50 há algo estrutural errado, quase sempre texto que o leitor não consegue extrair.',
      },
      {
        q: 'As empresas veem a minha pontuação ATS?',
        a: 'Não uma pontuação de um verificador como este. Ela é calculada no seu dispositivo e não é enviada a lugar nenhum. O sistema da própria empresa pode ordenar as candidaturas conforme a vaga, mas essa ordenação usa as regras dele e os termos de busca do recrutador, não a pontuação de terceiros.',
      },
      {
        q: 'Por que meu currículo tem uma pontuação diferente em cada verificador?',
        a: 'Porque não existe padrão. Cada verificador define suas próprias verificações e pesos. Compare as verificações individuais que falharam, não os números de destaque.',
      },
      {
        q: 'É verdade que 75% dos currículos são rejeitados por um ATS?',
        a: 'Esse número circula há mais de uma década sem fonte confiável. Os sistemas de rastreamento de candidatos armazenam e pesquisam candidaturas; quem define os filtros é o recrutador. O risco real é um currículo que o leitor interpreta mal e que, por isso, não aparece na busca do recrutador.',
      },
    ],
  },

  {
    ...guide('ats-checker-without-upload'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Um navegador consegue ler e pontuar um PDF ou DOCX sem enviá-lo a lugar nenhum, então o envio do arquivo é uma escolha de projeto, não uma necessidade técnica. Você mesmo confere um verificador em menos de um minuto: abra o painel Rede (Network) do navegador, solte seu currículo e procure uma requisição que leve o arquivo.',
    body: (
      <>
        <P>
          O currículo é um dos documentos mais sensíveis que a maioria das pessoas tem. Ele traz seu
          nome completo, seu e-mail pessoal, seu telefone, sua cidade e a linha do tempo completa de
          quem já empregou você. Entregá-lo a um site é uma decisão maior do que parece.
        </P>
        <P>
          Isso pesa mais justamente na situação em que a maioria das pessoas procura um verificador
          de currículo: <strong>procurando emprego sem ter saído do atual.</strong> Nesse
          momento o documento não é só um dado pessoal, é uma prova de intenção.
        </P>

        <H2>O que “envie seu currículo” costuma significar</H2>
        <P>
          Quando uma ferramenta pede o envio, o arquivo sai do seu dispositivo e vai parar em um
          servidor. Dali, alguma combinação destas coisas é normal e muitas vezes está descrita nos
          termos de uso:
        </P>
        <UL>
          <LI>O arquivo é armazenado, às vezes por tempo indeterminado, e vinculado à conta que você criou.</LI>
          <LI>O texto é enviado a um modelo de linguagem de terceiros para pontuar ou reescrever.</LI>
          <LI>O e-mail com que você se cadastrou entra em uma sequência de marketing.</LI>
          <LI>Dados agregados alimentam um produto de recrutamento vendido a empresas.</LI>
        </UL>
        <P>
          Nada disso é necessariamente mal-intencionado. É só o modelo de negócio: a verificação é
          grátis porque você e o seu documento são o produto. Mas vale saber antes de clicar, e não
          depois.
        </P>

        <H2>As perguntas que valem para qualquer verificador</H2>
        <UL>
          <LI><strong>O arquivo sai do dispositivo?</strong> Se não há envio, a maioria das outras perguntas deixa de importar.</LI>
          <LI><strong>É preciso criar conta?</strong> O muro de e-mail existe para capturar o e-mail, não para melhorar a pontuação.</LI>
          <LI><strong>A pontuação é determinística ou gerada?</strong> Se um modelo escreve o parecer, seu currículo foi enviado a esse modelo.</LI>
          <LI><strong>Dá para ler as regras?</strong> Um critério público pode ser contestado. Um escondido, não.</LI>
          <LI><strong>Como se apaga o arquivo?</strong> Se a resposta é um e-mail de suporte, suponha que ele fica.</LI>
        </UL>

        <H2>Como funciona uma verificação 100% local</H2>
        <P>
          Os navegadores modernos conseguem ler um PDF ou DOCX sem nenhum servidor envolvido. O
          arquivo é aberto na memória, o texto é extraído por uma biblioteca JavaScript, as
          verificações rodam sobre esse texto e o resultado é exibido, tudo dentro da aba que você já
          tem aberta. Feche a aba e o documento desaparece.
        </P>
        <P>
          A troca é real e vale dizer: um verificador local não consegue comparar você com um banco
          de outros candidatos nem reescrever seus marcadores por você. O que ele faz é dizer se um
          leitor vai interpretar o documento corretamente e quais linhas específicas estão fracas,
          que é a parte que de fato afeta se a sua candidatura chega inteira.
        </P>

        <H2>Como conferir que um verificador realmente não envia o arquivo</H2>
        <P>
          “Nunca guardamos o seu arquivo” é uma promessa. Se o arquivo sai ou não da sua máquina é
          algo que você pode ver acontecer, ou não acontecer, em qualquer navegador de computador:
        </P>
        <OL>
          <li>Abra o verificador e depois as ferramentas do desenvolvedor do navegador: <Code>F12</Code> no Windows e no Linux, <Code>⌥ ⌘ I</Code> no Mac.</li>
          <li>Vá para a aba <strong>Rede</strong> (Network) e limpe-a, para aparecerem só as requisições novas.</li>
          <li>Solte seu currículo no verificador e espere o resultado.</li>
          <li>
            Procure nas requisições novas. Um envio é uma requisição <Code>POST</Code> ou <Code>PUT</Code>{' '}
            cujo tamanho é mais ou menos o do seu arquivo. Scripts e fontes que a própria página
            carrega não são envios.
          </li>
        </OL>
        <P>
          Se nenhuma requisição leva o arquivo, ele não saiu. Isso vale em qualquer site, inclusive
          neste, e é esse o ponto: a promessa deve poder ser conferida por você, não aceita na
          confiança.
        </P>
        <P>
          Este site acrescenta uma segunda garantia, imposta pelo próprio navegador. O cabeçalho
          Content-Security-Policy define <Code>connect-src 'self' data: blob:</Code>, o que significa
          que o navegador recusa qualquer conexão de rede com outro domínio, e o único domínio com
          que ele pode falar serve apenas arquivos estáticos: não há nenhum endpoint para receber um
          currículo.
        </P>

        <Note>
          <strong>Este site é do tipo local.</strong>{' '}
          O <A href="/pt-br/">verificador de currículo ATS grátis</A> lê seu PDF ou DOCX no navegador com{' '}
          <code className="rounded bg-white px-1 py-0.5 text-[13px] text-stone-800">pdf.js</code> e{' '}
          <code className="rounded bg-white px-1 py-0.5 text-[13px] text-stone-800">mammoth</code>,
          pontua com regras fixas e não tem backend que possa receber um arquivo. O código tem
          licença MIT, então a afirmação pode ser conferida, em vez de apenas prometida.
        </Note>

        <H2>Leia também</H2>
        <UL>
          <LI><A href="/pt-br/o-que-e-pontuacao-ats-do-curriculo">O que a pontuação ATS do currículo mede de fato</A></LI>
          <LI><A href="/pt-br/curriculo-em-pdf-ou-docx-para-ats">Currículo em PDF ou DOCX: qual enviar?</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'É seguro enviar meu currículo para um verificador de currículo online?',
        a: 'Depende do que acontece com o arquivo, o que costuma estar descrito só nos termos de uso. Currículos enviados são com frequência armazenados, vinculados a uma conta e, às vezes, enviados a modelos de linguagem de terceiros. Se você procura emprego enquanto está empregado, prefira um verificador que nunca receba o arquivo.',
      },
      {
        q: 'Como um site lê meu currículo sem enviá-lo?',
        a: 'Os navegadores conseguem abrir um arquivo que você seleciona na memória da própria página. Bibliotecas JavaScript como pdf.js e mammoth extraem o texto, e as verificações rodam no seu dispositivo. Nada disso precisa de servidor.',
      },
      {
        q: 'Como sei que um verificador de currículo não está enviando meu arquivo?',
        a: 'Abra as ferramentas do desenvolvedor do navegador, vá para a aba Rede (Network), limpe-a e então solte seu currículo. Um envio aparece como uma requisição POST ou PUT com mais ou menos o tamanho do arquivo. Se não houver nenhuma, o arquivo ficou no seu dispositivo.',
      },
    ],
  },

  {
    ...guide('pdf-or-docx-for-ats'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Envie um PDF com texto selecionável, a menos que a candidatura peça outro formato; nesse caso, envie exatamente o que ela pede. O único PDF que falha de forma confiável é o que não tem texto real, como uma digitalização ou uma exportação com fontes convertidas em curvas, e dá para testar isso em segundos.',
    body: (
      <>
        <P>
          A resposta curta: <strong>envie um PDF com texto selecionável, a menos que a empresa peça
          outra coisa; nesse caso, envie exatamente o que ela pediu.</strong> A resposta longa vale
          dois minutos, porque o conselho de sempre (“use sempre Word, o ATS não lê PDF”) está uma
          década defasado.
        </P>

        <H2>Por que o PDF é o padrão hoje</H2>
        <UL>
          <LI><strong>Ele fica igual em todo lugar.</strong> Um DOCX se reorganiza conforme as fontes e a versão do Word de quem abre. Seu layout de duas páginas bem cuidado pode chegar como três páginas desalinhadas.</LI>
          <LI><strong>Os leitores modernos dão conta.</strong> Extrair texto de PDF é um problema resolvido; os principais sistemas oferecem esse suporte há anos.</LI>
          <LI><strong>É mais difícil de estragar.</strong> Ninguém edita seu PDF sem querer entre o envio e a análise.</LI>
        </UL>

        <H2>O único PDF que falha sempre</H2>
        <P>
          Um PDF é um contêiner. Ele pode guardar texto real ou uma imagem de texto. Se você exportou
          de uma ferramenta de design com o texto convertido em curvas, ou digitalizou uma impressão,
          ou tirou uma captura de tela do currículo e a salvou como PDF, o arquivo não contém{' '}
          <em>nenhum texto</em>. Um leitor o enxerga como um documento em branco.
        </P>
        <P>
          O teste leva três segundos: abra o PDF e tente selecionar uma linha de texto com o cursor.
          Se você não consegue destacá-la, o ATS também não consegue.
        </P>

        <H2>Um teste de 30 segundos para qualquer PDF</H2>
        <P>Selecionar o texto prova que ele existe. Mais dois passos mostram se ele sai utilizável:</P>
        <OL>
          <li><strong>Selecione uma linha.</strong> Se nada é destacado, a página é uma imagem. Exporte de novo a partir do documento original.</li>
          <li>
            <strong>Busque o seu e-mail</strong> com <Code>Ctrl F</Code> / <Code>⌘ F</Code>. Se o
            visualizador não o encontra, um leitor também não vai encontrar, em geral porque ele está
            em um cabeçalho, em uma imagem ou em uma caixa de texto.
          </li>
          <li>
            <strong>Selecione tudo, copie e cole em um editor de texto simples</strong> (Bloco de
            Notas, ou TextEdit no modo de texto simples). O que aparece é próximo do que um leitor
            recebe. Se duas colunas saem misturadas linha a linha, ou seus cargos aparecem longe das
            datas, corrija o layout antes de se preocupar com qualquer outra coisa.
          </li>
        </OL>
        <P>
          Exportar do Word, do Google Docs ou do Pages com o comando normal de <em>Baixar como PDF</em>{' '}
          ou <em>Exportar como PDF</em> gera PDFs com texto. Os caminhos arriscados são “imprimir
          como imagem”, a digitalização e ferramentas de design com a opção de converter texto em
          curvas.
        </P>

        <H2>Quando o DOCX é a resposta certa</H2>
        <UL>
          <LI><strong>O formulário exige.</strong> Se o campo de envio lista só <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">.doc/.docx</code>, essa é a resposta. Não tente ser mais esperto que o formulário.</LI>
          <LI><strong>Um recrutador pediu.</strong> Agências costumam colocar seu currículo no modelo delas, e isso exige um arquivo editável.</LI>
          <LI><strong>A empresa usa um sistema antigo.</strong> Hoje é raro, mas não custa nada atender.</LI>
        </UL>

        <H2>O que importa mais do que a extensão</H2>
        <P>
          O formato é a decisão mais fácil que você vai tomar sobre o currículo. Estas são as que
          realmente fazem diferença:
        </P>
        <UL>
          <LI><strong>Uma coluna.</strong> Layouts com várias colunas podem ser lidos na ordem errada, misturando duas linhas sem relação.</LI>
          <LI><strong>Nenhum texto dentro de imagens.</strong> Um logotipo tudo bem; seu cargo desenhado como imagem, não.</LI>
          <LI><strong>Nenhum dado crítico no cabeçalho ou no rodapé.</strong> Alguns leitores ignoram essas áreas. Coloque seu e-mail no corpo da página.</LI>
          <LI><strong>Marcadores de verdade,</strong> não travessões desenhados à mão dentro de uma célula de tabela.</LI>
          <LI><strong>Um nome de arquivo sensato</strong> — <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">Nome_Sobrenome_Curriculo.pdf</code>. Uma pessoa o vê em uma pasta com centenas de arquivos.</LI>
        </UL>

        <Note>
          <strong>Não sabe em que categoria o seu arquivo se enquadra?</strong> Solte-o no{' '}
          <A href="/pt-br/">verificador de currículo ATS grátis</A>: ele lê PDF e DOCX no seu navegador
          e diz na hora se há texto extraível, quantas páginas um leitor enxerga e quais seções ele
          conseguiu identificar.
        </Note>

        <H2>Leia também</H2>
        <UL>
          <LI><A href="/pt-br/como-o-ats-le-seu-curriculo">Como o ATS lê o seu currículo, na prática</A></LI>
          <LI><A href="/pt-br/checklist-de-curriculo-para-ats">Checklist de currículo para ATS</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Um ATS consegue ler um currículo em PDF?',
        a: 'Sim, desde que o PDF tenha texto real. Os sistemas de rastreamento de candidatos modernos extraem texto de PDFs rotineiramente. Um PDF digitalizado ou só com imagem não tem texto para extrair e é lido como em branco.',
      },
      {
        q: 'Devo enviar .doc ou .docx?',
        a: 'Prefira .docx, o formato atual do Word, a menos que a empresa peça especificamente .doc. Melhor ainda: envie um PDF com texto, a menos que o formulário limite você a arquivos do Word.',
      },
      {
        q: 'Como sei se o meu PDF tem texto selecionável?',
        a: 'Abra-o e tente destacar uma linha com o cursor; depois busque o seu e-mail. Se você consegue selecionar o texto e a busca encontra o e-mail, o PDF tem texto.',
      },
    ],
  },

  {
    ...guide('how-ats-parsing-works'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Um ATS lê o currículo em quatro etapas mecânicas: extrai o texto, divide-o em seções pelos títulos, identifica dados como e-mail, datas e cargos e indexa o resultado para os recrutadores pesquisarem. Quase todo conselho de formatação existe porque uma dessas etapas quebra.',
    body: (
      <>
        <P>
          A maior parte dos conselhos sobre currículo trata o sistema de rastreamento de candidatos
          como uma caixa-preta cheia de opiniões. É mais simples que isso. A leitura acontece em
          etapas, todas mecânicas, e quase toda dica de formatação de verdade decorre de uma etapa
          específica que falha.
        </P>

        <H2>Etapa 1 — Extração do texto</H2>
        <P>
          O arquivo é aberto e os caracteres são retirados dele. Em um DOCX, isso é basicamente ler
          XML. Em um PDF é mais difícil: o PDF não guarda linhas nem parágrafos, guarda fragmentos de
          texto com coordenadas. Reconstruir “este fragmento e aquele estão na mesma linha” é
          geometria, e é aí que os layouts com várias colunas desmoronam: duas colunas podem ser
          costuradas em uma única linha sem sentido.
        </P>
        <P>
          Veja como isso fica. Um currículo em duas colunas, como uma pessoa o vê, e o texto que um
          extrator linha a linha, como o deste site, de fato recebe de volta:
        </P>
        <Pre label="O que a pessoa vê">{`EXPERIÊNCIA                       HABILIDADES
Gerente de Engenharia, Acme       Kubernetes, Go
jan 2020 – atual                  Terraform, AWS`}</Pre>
        <Pre label="O que o leitor recebe">{`EXPERIÊNCIA HABILIDADES
Gerente de Engenharia, Acme Kubernetes, Go
jan 2020 – atual Terraform, AWS`}</Pre>
        <P>
          Agora cada linha é um híbrido. O título Experiência divide a linha com Habilidades, o seu
          cargo ganhou duas habilidades coladas e o período vem seguido de provedores de nuvem. Nada
          se perdeu: foi só remontado na ordem errada, o que para um leitor dá no mesmo.
        </P>
        <P><strong>Falha quando:</strong> a página é uma imagem, o texto está convertido em curvas ou o layout tem várias colunas.</P>

        <H2>Etapa 2 — Divisão em seções</H2>
        <P>
          O texto é cortado em regiões a partir dos títulos. Por isso o título sem graça vence o
          criativo: um leitor que compara com uma lista de palavras conhecidas encontra{' '}
          <em>Experiência</em>, <em>Experiência Profissional</em> e <em>Histórico Profissional</em>.
          Ele não encontra <em>Onde Deixei Minha Marca</em>.
        </P>
        <P>
          Para ficar concreto: estes são os títulos exatos que o verificador deste site procura. Ele
          aceita uma linha curta, de 45 caracteres ou menos, em qualquer combinação de maiúsculas e
          minúsculas, que contenha um deles; então <em>Experiência Profissional Relevante</em> conta
          como Experiência.
        </P>
        <Table
          caption="Títulos de seção que o ATS Resume Toolkit reconhece"
          head={['Seção', 'Títulos aceitos', 'Pontos']}
          rows={SECTION_ROWS}
        />
        <P>
          Os leitores comerciais usam listas mais longas, mas o princípio é idêntico, e nenhuma delas
          tem o título que você inventou.
        </P>
        <P><strong>Falha quando:</strong> os títulos são criativos, diferenciados só pela cor ou inexistentes.</P>

        <H2>Etapa 3 — Extração de dados</H2>
        <P>
          Dentro de cada seção, o leitor procura coisas específicas: um e-mail é um padrão, um
          telefone é um padrão, um intervalo de datas marca o começo de um cargo. O cargo e a empresa
          são deduzidos pela posição em relação à data.
        </P>
        <P>
          Por isso <strong>as datas importam mais do que as pessoas imaginam</strong>. Uma linha com
          data é a âncora que diz ao leitor “aqui começa um novo emprego”. Cargos sem data se fundem
          ao que veio antes, e seus três anos em uma empresa acabam dentro da entrada do empregador
          anterior.
        </P>
        <P><strong>Falha quando:</strong> faltam datas, elas aparecem só como “2 anos” ou são desenhadas como uma linha do tempo gráfica.</P>

        <H2>Etapa 4 — Indexação e busca</H2>
        <P>
          Os campos extraídos vão para um banco de dados. Um recrutador então o pesquisa: por cargo,
          por habilidade, por localização. Nesse ponto o seu currículo não está sendo julgado; está
          sendo <em>consultado</em>.
        </P>
        <P>
          Isso muda a pergunta sobre palavras-chave. O objetivo não é entupir o texto de termos para
          agradar um algoritmo. É garantir que as palavras que um recrutador digitaria apareçam em
          algum lugar em que você as conquistou de verdade. Se você liderou migrações de Kubernetes e
          nunca escreveu a palavra “Kubernetes”, não estará nessa lista de resultados.
        </P>
        <P><strong>Falha quando:</strong> o vocabulário do currículo e o da vaga não têm nenhuma sobreposição.</P>

        <H2>O que isso implica</H2>
        <UL>
          <LI>Dica de formatação não é superstição: cada regra corresponde a uma etapa acima.</LI>
          <LI>Dica de palavras-chave é sobre sobreposição de vocabulário, não densidade. Nunca declare uma habilidade que você não tem.</LI>
          <LI>Nada nesse processo avalia você. Ele coloca você em um formato pesquisável, ou não consegue.</LI>
        </UL>

        <Note>
          <strong>Veja pelo lado do leitor.</strong> O{' '}
          <A href="/pt-br/">verificador de currículo ATS grátis</A> tem uma aba <em>Dados extraídos</em>{' '}
          que mostra exatamente o que saiu do seu arquivo: o nome, os dados de contato, os links e
          cada cargo que ele conseguiu identificar. Se algo está faltando ali, também vai faltar para
          a empresa.
        </Note>

        <H2>Leia também</H2>
        <UL>
          <LI><A href="/pt-br/o-que-e-pontuacao-ats-do-curriculo">O que a pontuação ATS do currículo mede de fato</A></LI>
          <LI><A href="/pt-br/verificador-de-curriculo-ats-sem-enviar-arquivo">Verificadores que não pedem o envio do seu currículo</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Um ATS consegue ler um currículo em duas colunas?',
        a: 'Muitas vezes não na ordem certa. A extração do texto reconstrói as linhas a partir de posições na página, então duas colunas podem ser costuradas linha a linha, misturando um cargo com uma lista de habilidades. Um layout de coluna única evita o problema por completo.',
      },
      {
        q: 'Os sistemas de rastreamento de candidatos leem cabeçalho e rodapé?',
        a: 'Alguns leitores ignoram essas áreas ou as tratam de forma instável. Deixe seu nome, e-mail e telefone no corpo principal da página, para serem extraídos qualquer que seja o leitor.',
      },
      {
        q: 'Esconder palavras-chave em texto branco ajuda?',
        a: 'Não. Texto branco continua sendo texto: ele é extraído para o perfil lido pelo recrutador, onde parece uma tentativa de burlar a busca. Use o vocabulário da vaga apenas onde você realmente o conquistou.',
      },
    ],
  },

  {
    ...guide('ats-resume-checklist'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Corrija primeiro cinco coisas: texto selecionável, e-mail no corpo da página, coluna única, títulos de seção padrão e uma data em cada cargo. Elas decidem se a candidatura chega inteira. O restante decide se ela é encontrada em uma busca e, depois, se uma pessoa gosta de lê-la.',
    body: (
      <>
        <P>
          Ordenado por consequência, não por convenção. O primeiro grupo decide se a sua candidatura
          chega; o último é acabamento. Se você só tem dez minutos, faça o primeiro grupo.
        </P>

        <H2>Crítico — se pular estes, a candidatura pode não chegar</H2>
        <UL>
          <LI><strong>O texto é selecionável.</strong> Abra o arquivo e tente destacar uma linha. Se não dá, o leitor enxerga uma página em branco.</LI>
          <LI><strong>O e-mail é texto simples no corpo da página.</strong> Não no cabeçalho, não só atrás de um ícone de e-mail, não só como hiperlink.</LI>
          <LI><strong>Uma coluna.</strong> Barras laterais são a causa mais comum de extração embaralhada.</LI>
          <LI><strong>Títulos de seção padrão.</strong> Experiência, Formação, Habilidades, Resumo. Aqui, o sem graça ganha.</LI>
          <LI><strong>Todo cargo tem datas.</strong> Mês e ano, em um formato consistente, na mesma linha do cargo.</LI>
        </UL>

        <H2>Importante — estes decidem se você aparece em uma busca</H2>
        <UL>
          <LI><strong>Os cargos são reconhecíveis.</strong> Se o seu título interno é “Ninja de Entregas”, coloque ao lado o título padrão do mercado.</LI>
          <LI><strong>O vocabulário da vaga aparece</strong>, mas só onde você o conquistou de verdade.</LI>
          <LI><strong>Existe uma seção de habilidades,</strong> em texto simples separado por vírgulas, e não um gráfico de barras de nível.</LI>
          <LI><strong>Os links estão escritos</strong> como texto visível: <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">linkedin.com/in/voce</code>. O leitor lê texto, não o destino do link.</LI>
          <LI><strong>Nenhum texto fica dentro de uma imagem ou de uma caixa de texto.</strong></LI>
        </UL>

        <H2>Vale fazer — estes são lidos por uma pessoa</H2>
        <UL>
          <LI><strong>Os marcadores começam com um verbo.</strong> Liderei, entreguei, reduzi, reconstruí, assumi.</LI>
          <LI><strong>O impacto traz um número.</strong> “Melhorei a confiabilidade” é uma afirmação; “sessões sem falha de 96% para 99,5%” é evidência.</LI>
          <LI><strong>Nada de frases-padrão.</strong> “Profissional focado em resultados e com histórico comprovado” não diz nada ao leitor.</LI>
          <LI><strong>O tamanho acompanha a carreira.</strong> Uma página no começo; duas é normal depois de uma década. Três precisam de um motivo.</LI>
          <LI><strong>O nome do arquivo é um nome</strong> — <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">Nome_Sobrenome_Curriculo.pdf</code>, não <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">curriculo_final_v3_AGORA_VAI.pdf</code>.</LI>
        </UL>

        <H2>O que um verificador consegue conferir por você</H2>
        <P>
          Boa parte da lista é mecânica, então um software consegue verificá-la. Outra parte é
          julgamento, e não consegue. Veja a divisão no verificador deste site:
        </P>
        <H3>Verificado automaticamente</H3>
        <UL>
          <LI>Texto selecionável e codificação de caracteres limpa</LI>
          <LI>E-mail, telefone e um link de perfil visível como texto; ele também sinaliza um link que existe só como hiperlink escondido</LI>
          <LI>Títulos padrão de Experiência, Formação, Habilidades e Resumo, além de Conquistas, Projetos e Certificações</LI>
          <LI>Datas, estrutura de marcadores e número de páginas</LI>
          <LI>Números nos seus marcadores e marcadores que começam com um verbo</LI>
          <LI>Frases-padrão e afirmações vagas, na aba separada de estilo de escrita</LI>
          <LI>O vocabulário da vaga, se você colar o anúncio na comparação com a vaga</LI>
        </UL>
        <H3>Ainda é com você</H3>
        <UL>
          <LI>Se uma barra lateral ou uma segunda coluna embaralha a ordem de leitura: use o teste de copiar e colar</LI>
          <LI>Se os seus cargos são os que um recrutador pesquisaria</LI>
          <LI>Se cada palavra-chave que você adicionou é uma que você conquistou</LI>
          <LI>O nome do arquivo</LI>
        </UL>

        <Note>
          <strong>Quase toda essa lista pode ser conferida automaticamente.</strong> O{' '}
          <A href="/pt-br/">verificador de currículo ATS grátis</A> executa no seu navegador as
          verificações de legibilidade, contato, seções, formato e conteúdo e ordena as falhas pelo
          número de pontos que cada uma custa, para você corrigir primeiro as mais caras. A aba de
          estilo de escrita cobre os itens de frases-padrão e de afirmações sem números.
        </Note>

        <H2>Leia também</H2>
        <UL>
          <LI><A href="/pt-br/como-o-ats-le-seu-curriculo">Como o ATS lê o seu currículo, na prática</A></LI>
          <LI><A href="/pt-br/curriculo-em-pdf-ou-docx-para-ats">Currículo em PDF ou DOCX: qual enviar?</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Qual deve ser o tamanho de um currículo compatível com ATS?',
        a: 'Uma página no início da carreira; duas páginas é normal depois de cerca de uma década. O tamanho não impede o leitor de ler o arquivo, mas as páginas além da segunda muitas vezes não são lidas pelo recrutador.',
      },
      {
        q: 'Tabelas e caixas de texto são seguras em um currículo para ATS?',
        a: 'Evite-as para qualquer coisa importante. O texto dentro de caixas de texto pode ser ignorado ou extraído fora de ordem, e tabelas usadas como layout criam os mesmos problemas de ordem de leitura que as colunas. Parágrafos simples e listas com marcadores são o mais seguro.',
      },
      {
        q: 'O que devo corrigir primeiro no meu currículo para ATS?',
        a: 'Garanta que o texto seja selecionável, que o e-mail esteja no corpo da página, que o layout seja de coluna única, que os títulos de seção sejam padrão e que todo cargo tenha datas. Esses cinco pontos decidem se a candidatura é lida corretamente.',
      },
    ],
  },

  {
    ...guide('how-to-check-your-cv-score'),
    published: '2026-10-10',
    updated: '2026-10-10',
    summary:
      'Solte seu PDF ou DOCX em um verificador de pontuação, leia a nota e as verificações que falharam, corrija primeiro as mais caras e confira de novo. Aqui tudo roda no seu navegador: sem envio, sem cadastro, sem IA. Uma pontuação de 85 ou mais significa que nada importante está se perdendo.',
    body: (
      <>
        <P>
          A pontuação de um currículo é uma estimativa de quão claramente um software consegue ler o
          seu documento. As empresas usam sistemas de rastreamento de candidatos (ATS) para armazenar
          e pesquisar candidaturas, então um currículo que o sistema interpreta mal pode ficar sem o
          seu e-mail ou sem os seus cargos. Verificar a pontuação leva menos de um minuto e é grátis.
        </P>

        <H2>Verifique a pontuação do seu currículo em quatro passos</H2>
        <OL>
          <LI>
            Abra o <A href="/pt-br/">verificador de currículo ATS grátis</A> e escolha{' '}
            <em>Verificar meu currículo</em>.
          </LI>
          <LI>
            Solte seu currículo em PDF ou DOCX. O arquivo é lido dentro do navegador e não é enviado
            a lugar nenhum, então é seguro usar mesmo com o currículo que você está mandando para um
            concorrente do seu empregador atual.
          </LI>
          <LI>
            Leia a pontuação e a lista de verificações que falharam. As falhas vêm ordenadas pelo
            número de pontos que cada uma custa, então o primeiro item é a correção mais valiosa.
          </LI>
          <LI>
            Corrija os dois ou três primeiros itens, exporte de novo e solte o arquivo novo. Repita
            até não sobrar nada caro.
          </LI>
        </OL>

        <H2>O que é uma boa pontuação de currículo</H2>
        <P>
          Neste verificador, 85 ou mais significa que um leitor vai ler o documento sem problemas. De
          70 a 84 é boa, com algumas correções específicas pendentes. De 50 a 69 precisa de ajustes,
          em geral por falta de um título de seção ou de um dado de contato. Abaixo de 50 há algo
          estrutural errado, quase sempre texto que o leitor não consegue extrair. Não corra atrás
          dos últimos pontos: acima de uns 85, o conteúdo importa mais que a nota.
        </P>

        <H2>O que corrigir primeiro</H2>
        <UL>
          <LI>Garanta que o texto seja selecionável. Um PDF digitalizado ou só com imagem tem pontuação próxima de zero.</LI>
          <LI>Coloque e-mail e telefone no corpo da página, não em um cabeçalho nem em uma imagem.</LI>
          <LI>Use títulos padrão: Experiência, Formação, Habilidades, Resumo.</LI>
          <LI>Dê datas a todos os cargos e use marcadores de verdade.</LI>
        </UL>

        <H2>O que a pontuação não diz</H2>
        <P>
          Ela não sabe se você combina com a vaga e não é o que a empresa vê. Para saber a
          compatibilidade com a vaga, cole o anúncio na comparação de palavras-chave. Para o conjunto
          completo de regras, leia{' '}
          <A href="/pt-br/o-que-e-pontuacao-ats-do-curriculo">o que a pontuação ATS do currículo mede de fato</A>.
        </P>

        <Note>
          <strong>Teste com o seu próprio arquivo.</strong> O{' '}
          <A href="/pt-br/">verificador de currículo ATS grátis</A> tem código aberto, roda no seu
          navegador e não pede o seu e-mail.
        </Note>

        <H2>Leia também</H2>
        <UL>
          <LI><A href="/pt-br/o-que-e-pontuacao-ats-do-curriculo">O que a pontuação ATS do currículo mede de fato</A></LI>
          <LI><A href="/pt-br/checklist-de-curriculo-para-ats">Checklist de currículo para ATS</A></LI>
          <LI><A href="/pt-br/verificador-de-curriculo-ats-sem-enviar-arquivo">Verificador de currículo ATS que não pede para enviar seu arquivo</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Como verifico a pontuação do meu currículo de graça?',
        a: 'Abra um verificador de pontuação que não exija cadastro, solte seu PDF ou DOCX e leia a nota e as verificações que falharam. Neste site o arquivo é processado no seu navegador e nunca é enviado.',
      },
      {
        q: 'O que é uma boa pontuação de currículo?',
        a: 'Neste verificador, 85 ou mais significa que o documento é lido sem problemas. De 70 a 84 é boa, com algumas correções pendentes. Abaixo de 50 geralmente significa que o texto não pode ser extraído.',
      },
      {
        q: 'A pontuação do currículo é a mesma coisa que a pontuação ATS?',
        a: 'Na prática, sim: as duas estimam quão claramente um software de rastreamento de candidatos consegue ler o seu documento. Não existe pontuação padrão, então cada verificador dá números diferentes.',
      },
    ],
  },
]
