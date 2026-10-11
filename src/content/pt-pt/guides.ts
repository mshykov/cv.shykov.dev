// Metadados dos guias: slug, título, descrição. Apenas dados, de propósito - a
// página inicial importa este ficheiro para a lista de guias, enquanto os corpos
// dos artigos (articles.tsx) só são precisos no pré-render e ficam fora do bundle.
import type { Guide } from '../types.ts'

export const GUIDES: Guide[] = [
  {
    id: 'what-is-an-ats-score',
    slug: 'o-que-e-a-pontuacao-ats',
    title: 'O que é a pontuação ATS do CV e o que mede realmente?',
    description:
      'A pontuação ATS mede a facilidade com que uma máquina lê o seu CV, não a qualidade da sua candidatura. Veja o que o número cobre, o que não consegue ver e o mito que deve ignorar.',
  },
  {
    id: 'ats-checker-without-upload',
    slug: 'verificador-cv-ats-sem-carregar-ficheiro',
    title: 'Verificadores de CV ATS que não carregam o seu ficheiro',
    description:
      'A maioria dos verificadores de CV pede que carregue o ficheiro e deixe um email. Veja o que acontece ao documento, porque importa se ainda está empregado e como difere uma verificação só local.',
  },
  {
    id: 'pdf-or-docx-for-ats',
    slug: 'pdf-ou-docx-para-ats',
    title: 'PDF ou DOCX para um ATS: qual deve enviar?',
    description:
      'Envie um PDF, a menos que o formulário peça outro formato. O raciocínio, o único PDF que falha sempre e o que fazer quando a empresa indica um formato.',
  },
  {
    id: 'how-ats-parsing-works',
    slug: 'como-funciona-a-leitura-de-cv-ats',
    title: 'Como funciona realmente a leitura de CV por um ATS',
    description:
      'O que acontece entre carregar um CV e o recrutador vê-lo: extração do texto, divisão em secções, extração de dados e indexação para pesquisa — e onde cada fase falha.',
  },
  {
    id: 'ats-resume-checklist',
    slug: 'checklist-cv-ats',
    title: 'A checklist do CV para ATS',
    description:
      'Quinze verificações concretas, ordenadas pelo estrago que fazem se as ignorar — dos ficheiros ilegíveis aos retoques finais.',
  },
  {
    id: 'how-to-check-your-cv-score',
    slug: 'como-verificar-a-pontuacao-do-cv',
    title: 'Como verificar a pontuação do CV grátis (e o que corrigir primeiro)',
    description:
      'Verifique a pontuação do seu CV em quatro passos, sem carregar o ficheiro nem criar conta. O que significa o número, o que é uma boa pontuação e que correções mais pesam.',
  },
]
