// Metadatos de las guías: slug, título y descripción. Solo datos y muy pequeño a
// propósito: la página de inicio lo importa para su lista de guías, mientras que
// los cuerpos (articles.tsx) solo los necesita el prerenderizado y deben quedar
// fuera del bundle de la home.
import type { Guide } from '../types.ts'

export const GUIDES: Guide[] = [
  {
    id: 'what-is-an-ats-score',
    slug: 'que-es-la-puntuacion-ats-de-un-cv',
    title: '¿Qué es la puntuación ATS de un CV y qué mide en realidad?',
    description:
      'La puntuación ATS mide lo bien que una máquina puede leer tu CV, no lo buen candidato que eres. Qué cubre el número, qué no ve y el mito que conviene olvidar.',
  },
  {
    id: 'ats-checker-without-upload',
    slug: 'revisar-cv-ats-sin-subir-archivos',
    title: 'Revisar tu CV con un ATS sin subirlo a ningún servidor',
    description:
      'La mayoría de los analizadores de CV te piden subir el archivo y dar tu correo. Qué pasa con el archivo, por qué importa si aún trabajas en otra empresa y en qué se diferencia una revisión local.',
  },
  {
    id: 'pdf-or-docx-for-ats',
    slug: 'cv-pdf-o-word-para-ats',
    title: 'CV en PDF o en Word para un ATS: ¿cuál debes enviar?',
    description:
      'Envía un PDF, salvo que el formulario pida otra cosa. Los motivos, el único PDF que falla siempre y qué hacer cuando la empresa indica un formato.',
  },
  {
    id: 'how-ats-parsing-works',
    slug: 'como-lee-un-ats-tu-cv',
    title: 'Cómo lee tu CV un ATS: así funciona el análisis automático',
    description:
      'Qué ocurre entre que subes un CV y lo ve un reclutador: extracción del texto, separación en secciones, extracción de datos e indexación para la búsqueda, y dónde falla cada fase.',
  },
  {
    id: 'ats-resume-checklist',
    slug: 'lista-de-comprobacion-cv-ats',
    title: 'Lista de comprobación para un CV compatible con ATS',
    description:
      'Quince comprobaciones concretas, ordenadas por el daño que causa saltárselas: desde los archivos ilegibles hasta los últimos retoques.',
  },
  {
    id: 'how-to-check-your-cv-score',
    slug: 'como-comprobar-la-puntuacion-de-tu-cv-gratis',
    title: 'Cómo comprobar la puntuación de tu CV gratis (y qué corregir primero)',
    description:
      'Comprueba la puntuación de tu CV en cuatro pasos sin subir el archivo ni crear una cuenta. Qué significa el número, qué puntuación es buena y qué correcciones la mejoran más.',
  },
]
