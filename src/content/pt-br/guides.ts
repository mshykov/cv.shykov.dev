// Guias em português do Brasil: slug, título e descrição. Só dados; os corpos
// dos artigos ficam em articles.tsx.
import type { Guide } from '../types.ts'

export const GUIDES: Guide[] = [
  {
    id: 'what-is-an-ats-score',
    slug: 'o-que-e-pontuacao-ats-do-curriculo',
    title: 'O que é a pontuação ATS do currículo e o que ela mede de fato?',
    description:
      'A pontuação ATS mede o quanto uma máquina consegue ler seu currículo, não o quanto você é bom candidato. Veja o que o número cobre, o que ele não enxerga e o mito que você pode ignorar.',
  },
  {
    id: 'ats-checker-without-upload',
    slug: 'verificador-de-curriculo-ats-sem-enviar-arquivo',
    title: 'Verificador de currículo ATS que não pede para enviar seu arquivo',
    description:
      'A maioria dos verificadores de currículo exige o envio do arquivo e um e-mail. Veja o que acontece com ele, por que isso importa se você ainda está empregado e como funciona uma verificação 100% local.',
  },
  {
    id: 'pdf-or-docx-for-ats',
    slug: 'curriculo-em-pdf-ou-docx-para-ats',
    title: 'Currículo em PDF ou DOCX para ATS: qual enviar?',
    description:
      'Envie PDF, a menos que o formulário peça outro formato. O raciocínio, o único PDF que sempre falha e o que fazer quando a empresa indica o formato.',
  },
  {
    id: 'how-ats-parsing-works',
    slug: 'como-o-ats-le-seu-curriculo',
    title: 'Como o ATS lê o seu currículo, na prática',
    description:
      'O que acontece entre o envio do currículo e o momento em que o recrutador o vê: extração do texto, divisão em seções, extração de dados e indexação para busca, e onde cada etapa falha.',
  },
  {
    id: 'ats-resume-checklist',
    slug: 'checklist-de-curriculo-para-ats',
    title: 'Checklist de currículo para ATS',
    description:
      'Quinze verificações concretas, ordenadas pelo estrago que fazem se você as ignorar: de arquivos ilegíveis até os últimos retoques.',
  },
  {
    id: 'how-to-check-your-cv-score',
    slug: 'como-verificar-pontuacao-do-curriculo-gratis',
    title: 'Como verificar a pontuação do seu currículo grátis (e o que corrigir primeiro)',
    description:
      'Verifique a pontuação do currículo em quatro passos, sem enviar o arquivo nem criar conta. O que o número significa, o que é uma boa pontuação e quais correções mais pesam.',
  },
]
