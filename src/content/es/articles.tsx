// Guías estáticas, convertidas a HTML independiente en la compilación por
// scripts/prerender.mjs. No incluyen nada de JavaScript: una guía es prosa y el
// bundle de la aplicación solo la ralentizaría.
//
// Viven en src/ para que el escáner de Tailwind vea estas clases y genere la
// misma hoja de estilos que la aplicación. No las muevas fuera de src/ o las
// guías se verán sin estilos.
import { A, Code, H2, H3, LI, Note, OL, P, Pre, Table, UL } from '../prose.tsx'
import { rubricRows, sectionRows } from '../tables.ts'
import { GUIDES } from './guides.ts'
import type { Article, Guide } from '../types.ts'
import { es } from '../../i18n/messages/es.ts'

function guide(id: Guide['id']): Guide {
  const meta = GUIDES.find((g) => g.id === id)
  if (!meta) throw new Error(`articles: no entry for "${id}" in guides.ts`)
  return meta
}

const RUBRIC_ROWS = rubricRows(es)
const SECTION_ROWS = sectionRows('es', es)

export const ARTICLES: Article[] = [
  {
    ...guide('what-is-an-ats-score'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'La puntuación ATS estima lo bien que un software de seguimiento de candidatos puede extraer de tu CV el texto, los datos de contacto, las secciones y las fechas. No dice nada sobre si encajas en el puesto. A partir de más o menos 85 no se pierde nada importante: dedica el tiempo al contenido.',
    body: (
      <>
        <P>
          Un sistema de seguimiento de candidatos (ATS, por sus siglas en inglés) es el software que
          usa una empresa para recibir, guardar y buscar candidaturas. Antes de que un reclutador lea
          tu CV, el sistema lo analiza: extrae tu nombre, tus datos de contacto, los puestos que has
          ocupado, las fechas y las habilidades, y los guarda en campos de una base de datos. La{' '}
          <strong>puntuación ATS</strong> es una estimación de lo bien que saldrá ese paso.
        </P>
        <P>
          Es una afirmación más estrecha de lo que parece, y ahí está la clave. La puntuación no sabe
          si eres la persona adecuada para el puesto. Mide una sola cosa: si el documento sobrevive a
          que lo lea una máquina.
        </P>

        <H2>El mito que conviene olvidar primero</H2>
        <P>
          Seguramente has leído que <em>«el 75% de los currículums son rechazados por un ATS antes de
          que los vea una persona».</em> Esa cifra se repite desde hace más de una década y no tiene
          detrás ninguna fuente creíble. Los sistemas de seguimiento de candidatos son herramientas de
          búsqueda y almacenamiento. Ordenan y filtran según criterios que fija el reclutador; no
          descartan por su cuenta a tres de cada cuatro candidatos.
        </P>
        <P>
          El riesgo real es más aburrido y más fácil de arreglar. Si el analizador no encuentra tu
          correo electrónico, tu candidatura llega con el campo de contacto vacío. Si no lee tus
          puestos, no apareces cuando el reclutador busca «responsable de ingeniería». Nadie te ha
          rechazado: simplemente no estabas entre los resultados.
        </P>

        <H2>Qué puede medir razonablemente una puntuación</H2>
        <P>
          Toda puntuación ATS honesta es una heurística construida con unas pocas comprobaciones. En
          este sitio la escala es fija, de 100 puntos, y está publicada, de modo que puedes ver de
          dónde sale cada punto. Se reparte en cinco grupos:
        </P>
        <UL>
          <LI><strong>Legibilidad (25)</strong>: ¿hay texto real y seleccionable o la página es una imagen?</LI>
          <LI><strong>Datos de contacto (15)</strong>: correo electrónico, teléfono y un enlace escrito como texto visible.</LI>
          <LI><strong>Secciones (35)</strong>: títulos que reconoce un analizador, como Experiencia, Formación, Habilidades o Resumen.</LI>
          <LI><strong>Formato (15)</strong>: número de páginas, puestos con fechas y una estructura real de viñetas.</LI>
          <LI><strong>Contenido (10)</strong>: resultados cuantificados y viñetas que empiezan con un verbo.</LI>
        </UL>
        <P>Y comprobación por comprobación; esta tabla es la que ejecuta el comprobador, no un resumen de ella:</P>
        <Table
          caption="Escala de puntuación de ATS Resume Toolkit, comprobación por comprobación"
          head={['Comprobación', 'Grupo', 'Puntos']}
          rows={RUBRIC_ROWS}
        />
        <P>
          Hay dos detalles fáciles de pasar por alto. Que falten el teléfono o el resumen solo resta
          sus propios puntos (son avisos, no errores), mientras que la ausencia del título de
          Experiencia, Formación o Habilidades cuenta como fallo. Y la última fila de Secciones es un
          extra: el título de Logros vale 4 puntos, el de Proyectos 3 y el de Certificaciones 3.
        </P>
        <P>
          Las secciones pesan más porque son lo que convierte un muro de texto en datos
          estructurados. Un analizador que encuentra un título llamado «Experiencia» sabe que las
          entradas de debajo son puestos de trabajo. Sin él, está adivinando.
        </P>

        <H2>Qué no puede medir ninguna puntuación</H2>
        <UL>
          <LI>Si tu experiencia encaja con el puesto. Eso lo juzga el reclutador.</LI>
          <LI>Qué ATS concreto usa la empresa. Cada proveedor analiza de forma distinta y ninguno publica sus reglas.</LI>
          <LI>Si tu redacción convence. Un CV perfectamente legible puede seguir siendo soso.</LI>
        </UL>
        <P>
          Considera una puntuación por encima de 85 más o menos como «nada de esto se perderá por el
          camino» y pasa al contenido. Perseguir los últimos puntos casi siempre es esfuerzo perdido.
        </P>

        <H2>Por qué dos comprobadores te dan puntuaciones distintas</H2>
        <P>
          No existe una puntuación ATS estándar. Cada comprobador inventa su propia escala, la pondera
          como quiere y, normalmente, no te cuenta cuál es. Un 62 en una web y un 81 en otra no se
          contradicen: son dos pruebas distintas. La pregunta útil no es «qué número es el correcto»,
          sino «qué comprobación concreta ha fallado y estoy de acuerdo en que importa». Eso solo se
          puede responder cuando las reglas están publicadas.
        </P>

        <Note>
          <strong>Compruébalo en unos segundos.</strong> El{' '}
          <A href="/es/">comprobador de CV gratuito</A> puntúa un PDF o un DOCX por completo dentro de
          tu navegador: el archivo no se sube, no hay cuenta y no interviene ningún modelo de
          lenguaje. Puedes leer las reglas exactas de puntuación en el código público.
        </Note>

        <H2>Relacionado</H2>
        <UL>
          <LI><A href="/es/como-lee-un-ats-tu-cv">Cómo lee tu CV un ATS: así funciona el análisis automático</A></LI>
          <LI><A href="/es/lista-de-comprobacion-cv-ats">Lista de comprobación para un CV compatible con ATS</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: '¿Qué puntuación ATS es buena?',
        a: 'En este comprobador, 85 o más significa que un analizador leerá el documento sin problemas y no se pierde nada importante. De 70 a 84 es buena, con algunas correcciones concretas pendientes. De 50 a 69 necesita mejoras, normalmente por falta del título de una sección o de un dato de contacto. Por debajo de 50 hay un problema estructural, casi siempre texto que el analizador no puede extraer.',
      },
      {
        q: '¿Ven las empresas mi puntuación ATS?',
        a: 'No la de un comprobador como este. Se calcula en tu dispositivo y no se envía a ninguna parte. El sistema de la empresa puede ordenar las candidaturas según la oferta, pero ese orden usa sus propias reglas y los términos de búsqueda del reclutador, no una puntuación de terceros.',
      },
      {
        q: '¿Por qué mi CV tiene una puntuación distinta en cada comprobador?',
        a: 'Porque no hay un estándar. Cada comprobador define sus propias comprobaciones y pesos. Compara las comprobaciones concretas que han fallado, no las cifras globales.',
      },
      {
        q: '¿Es cierto que un ATS rechaza el 75% de los currículums?',
        a: 'Esa cifra circula desde hace más de una década sin una fuente creíble. Los sistemas de seguimiento de candidatos guardan y buscan candidaturas; los filtros los fija el reclutador. El riesgo real es un CV que el analizador lee mal y que por eso no aparece en la búsqueda de un reclutador.',
      },
    ],
  },

  {
    ...guide('ats-checker-without-upload'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Un navegador puede leer y puntuar un PDF o un DOCX sin enviarlo a ninguna parte, así que subir el archivo es una decisión de diseño, no una necesidad técnica. Puedes comprobar un analizador tú mismo en menos de un minuto: abre el panel Network (Red) del navegador, arrastra tu CV y busca una petición que lleve el archivo.',
    body: (
      <>
        <P>
          Un CV es uno de los documentos más sensibles que tiene la mayoría de la gente. Incluye tu
          nombre completo, tu correo personal, tu teléfono, tu ciudad y un historial completo de
          quién te ha contratado. Entregárselo a una web es una decisión más importante de lo que
          parece.
        </P>
        <P>
          Importa sobre todo en la situación en la que suele estar quien busca un comprobador de CV:{' '}
          <strong>buscar trabajo mientras sigue empleado.</strong> En ese momento el documento no es
          solo un dato personal: es la prueba de que estás buscando otra cosa.
        </P>

        <H2>Qué suele significar «sube tu currículum»</H2>
        <P>
          Cuando una herramienta te pide que subas el archivo, este sale de tu dispositivo y llega a
          un servidor. A partir de ahí es habitual (y a menudo consta en las condiciones de uso) que
          ocurra alguna combinación de lo siguiente:
        </P>
        <UL>
          <LI>El archivo se almacena, a veces de forma indefinida, y queda asociado a la cuenta que has creado.</LI>
          <LI>El texto se envía a un modelo de lenguaje de terceros para puntuarlo o reescribirlo.</LI>
          <LI>El correo con el que te registraste entra en una secuencia de marketing.</LI>
          <LI>Los datos agregados alimentan un producto de selección de personal que se vende a empresas.</LI>
        </UL>
        <P>
          Nada de eso es necesariamente malintencionado. Es simplemente el modelo de negocio: la
          revisión es gratis porque el producto eres tú y tu documento. Pero conviene saberlo antes de
          hacer clic, no después.
        </P>

        <H2>Las preguntas que merece la pena hacerle a cualquier comprobador</H2>
        <UL>
          <LI><strong>¿Sale el archivo de tu dispositivo?</strong> Si no hay subida, casi todo lo demás deja de importar.</LI>
          <LI><strong>¿Exige una cuenta?</strong> Un muro de correo existe para capturar el correo, no para mejorar la puntuación.</LI>
          <LI><strong>¿La puntuación es determinista o generada?</strong> Si un modelo escribe los comentarios, tu CV se ha enviado a ese modelo.</LI>
          <LI><strong>¿Puedes leer las reglas?</strong> Una escala publicada se puede discutir. Una oculta, no.</LI>
          <LI><strong>¿Cómo se borra el archivo?</strong> Si la respuesta es «escribe a soporte», da por hecho que el archivo se queda.</LI>
        </UL>

        <H2>Cómo funciona una revisión solo local</H2>
        <P>
          Los navegadores modernos pueden leer un PDF o un DOCX sin que intervenga ningún servidor. El
          archivo se abre en memoria, una librería de JavaScript extrae el texto, las comprobaciones
          se ejecutan sobre ese texto y se muestra el resultado, todo dentro de la pestaña que ya
          tienes abierta. Si cierras la pestaña, el documento desaparece.
        </P>
        <P>
          La contrapartida es real y conviene decirla: un comprobador local no puede compararte con
          una base de datos de otros candidatos ni reescribir tus viñetas. Lo que sí puede es decirte
          si un analizador leerá bien el documento y qué líneas concretas son débiles, que es lo que
          de verdad influye en que tu candidatura llegue intacta.
        </P>

        <H2>Cómo comprobar que un comprobador de verdad no sube nada</H2>
        <P>
          «Nunca guardamos tu archivo» es una promesa. Si el archivo sale de tu equipo es algo que
          puedes ver que ocurre, o que no ocurre, en cualquier navegador de escritorio:
        </P>
        <OL>
          <li>Abre el comprobador y, después, las herramientas para desarrolladores del navegador: <Code>F12</Code> en Windows y Linux, <Code>⌥ ⌘ I</Code> en Mac.</li>
          <li>Ve a la pestaña <strong>Network</strong> (Red) y límpiala, para que solo aparezcan las peticiones nuevas.</li>
          <li>Arrastra tu CV al comprobador y espera al resultado.</li>
          <li>
            Revisa las peticiones nuevas. Una subida es una petición <Code>POST</Code> o{' '}
            <Code>PUT</Code> cuyo tamaño es aproximadamente el de tu archivo. Los scripts y las
            fuentes que la página carga para sí misma no son subidas.
          </li>
        </OL>
        <P>
          Si ninguna petición lleva el archivo, el archivo no ha salido. Esto funciona en cualquier
          web, incluida esta, y ahí está la gracia: la afirmación debe poder comprobarla cualquiera,
          no darse por buena sin más.
        </P>
        <P>
          Este sitio añade una segunda garantía, impuesta por el propio navegador. Su cabecera
          Content-Security-Policy fija <Code>connect-src 'self' data: blob:</Code>, lo que significa
          que el navegador rechaza cualquier conexión de red a otro dominio, y el único dominio con el
          que puede hablar solo sirve archivos estáticos: no existe ningún punto que reciba un CV.
        </P>

        <Note>
          <strong>Este sitio es de los locales.</strong> El{' '}
          <A href="/es/">comprobador de CV gratuito</A> analiza tu PDF o DOCX en el navegador con{' '}
          <code className="rounded bg-white px-1 py-0.5 text-[13px] text-stone-800">pdf.js</code> y{' '}
          <code className="rounded bg-white px-1 py-0.5 text-[13px] text-stone-800">mammoth</code>,
          lo puntúa con reglas fijas y no tiene ningún servidor que pueda recibir un archivo. Tiene
          licencia MIT, de modo que la afirmación se puede comprobar en lugar de prometerse.
        </Note>

        <H2>Relacionado</H2>
        <UL>
          <LI><A href="/es/que-es-la-puntuacion-ats-de-un-cv">Qué mide en realidad la puntuación ATS</A></LI>
          <LI><A href="/es/cv-pdf-o-word-para-ats">CV en PDF o en Word: ¿cuál debes enviar?</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: '¿Es seguro subir mi currículum a un comprobador de CV online?',
        a: 'Depende de lo que ocurra con el archivo, algo que normalmente solo se describe en las condiciones de uso. Los CV subidos suelen almacenarse, asociarse a una cuenta y, a veces, enviarse a modelos de lenguaje de terceros. Si buscas trabajo mientras estás empleado, elige un comprobador que nunca reciba el archivo.',
      },
      {
        q: '¿Cómo puede una web leer mi CV sin subirlo?',
        a: 'Los navegadores pueden abrir un archivo que seleccionas en la propia memoria de la página. Librerías de JavaScript como pdf.js y mammoth extraen después el texto y las comprobaciones se ejecutan en tu dispositivo. No hace falta ningún servidor.',
      },
      {
        q: '¿Cómo sé que un comprobador de CV no está subiendo mi archivo?',
        a: 'Abre las herramientas para desarrolladores del navegador, ve a la pestaña Network (Red), límpiala y arrastra tu CV. Una subida aparece como una petición POST o PUT del tamaño aproximado de tu archivo. Si no hay ninguna, el archivo se ha quedado en tu dispositivo.',
      },
    ],
  },

  {
    ...guide('pdf-or-docx-for-ats'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Envía un PDF con texto real, salvo que la candidatura pida otro formato: entonces envía exactamente el que pidan. El único PDF que falla siempre es el que no contiene texto de verdad, como un escaneo o una exportación con las fuentes convertidas a contornos, y se puede comprobar en segundos.',
    body: (
      <>
        <P>
          La respuesta corta: <strong>envía un PDF con texto real, salvo que la empresa pida otra
          cosa; en ese caso, envía exactamente lo que pida.</strong> La respuesta larga merece dos
          minutos, porque el consejo habitual («usa siempre Word, los ATS no leen PDF») lleva una
          década desfasado.
        </P>

        <H2>Por qué el PDF es hoy la opción por defecto</H2>
        <UL>
          <LI><strong>Se ve igual en todas partes.</strong> Un DOCX se recoloca según las fuentes y la versión de Word que haya al otro lado. Tu maquetación cuidada de dos páginas puede llegar como tres páginas desordenadas.</LI>
          <LI><strong>Los analizadores modernos lo manejan.</strong> La extracción de texto de un PDF es un problema resuelto; los principales sistemas la admiten desde hace años.</LI>
          <LI><strong>Es más difícil que se estropee.</strong> Nadie edita tu PDF por accidente entre la subida y la revisión.</LI>
        </UL>

        <H2>El único PDF que falla siempre</H2>
        <P>
          Un PDF es un contenedor. Puede contener texto real o una imagen de texto. Si exportaste
          desde una herramienta de diseño con el texto convertido a contornos, escaneaste una
          impresión o hiciste una captura de pantalla de tu CV y la guardaste como PDF, el archivo
          contiene <em>cero texto</em>. Un analizador lo lee como un documento en blanco.
        </P>
        <P>
          La prueba lleva tres segundos: abre el PDF e intenta seleccionar una línea de texto con el
          cursor. Si no puedes resaltarla, el ATS tampoco.
        </P>

        <H2>Una prueba de 30 segundos para cualquier PDF</H2>
        <P>Seleccionar texto demuestra que el texto existe. Estos tres pasos muestran si sale en un estado utilizable:</P>
        <OL>
          <li><strong>Selecciona una línea.</strong> Si no se resalta nada, la página es una imagen. Vuelve a exportar desde el documento original.</li>
          <li>
            <strong>Busca tu correo electrónico</strong> con <Code>Ctrl F</Code> / <Code>⌘ F</Code>.
            Si el visor no lo encuentra, un analizador tampoco, a menudo porque está en una cabecera,
            en una imagen o en un cuadro de texto.
          </li>
          <li>
            <strong>Selecciona todo, copia y pega en un editor de texto plano</strong> (el Bloc de
            notas, o TextEdit en modo de texto plano). Lo que ves se parece mucho a lo que recibe un
            analizador. Si dos columnas salen entrelazadas línea a línea, o tus puestos aparecen lejos
            de sus fechas, corrige la maquetación antes de preocuparte por nada más.
          </li>
        </OL>
        <P>
          Exportar desde Word, Google Docs o Pages con su opción normal de <em>Descargar como PDF</em>{' '}
          o <em>Exportar a PDF</em> produce PDF con texto real. Las vías de riesgo son «imprimir como
          imagen», escanear y las herramientas de diseño con una opción para convertir el texto a
          contornos.
        </P>

        <H2>Cuándo es mejor un DOCX</H2>
        <UL>
          <LI><strong>El formulario lo pide.</strong> Si el campo de subida admite solo <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">.doc/.docx</code>, esa es la respuesta. No intentes ser más listo que el formulario.</LI>
          <LI><strong>Un reclutador te lo ha pedido.</strong> Las consultoras de selección suelen pasar tu CV a su propia plantilla, y para eso necesitan un archivo editable.</LI>
          <LI><strong>La empresa usa un sistema antiguo.</strong> Hoy es raro, pero no cuesta nada cumplir.</LI>
        </UL>

        <H2>Cosas que importan más que la extensión</H2>
        <P>
          El formato es la decisión más fácil que tomarás sobre tu CV. Estas son las que de verdad
          marcan la diferencia:
        </P>
        <UL>
          <LI><strong>Una sola columna.</strong> Las maquetaciones de varias columnas pueden leerse en el orden equivocado y mezclar dos líneas sin relación.</LI>
          <LI><strong>Nada de texto dentro de imágenes.</strong> Un logotipo no pasa nada; tu puesto convertido en gráfico, sí.</LI>
          <LI><strong>Ningún dato esencial en la cabecera o el pie.</strong> Algunos analizadores se saltan esas zonas. Pon tu correo en el cuerpo.</LI>
          <LI><strong>Viñetas reales,</strong> no guiones dibujados a mano dentro de la celda de una tabla.</LI>
          <LI><strong>Un nombre de archivo sensato:</strong> <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">Nombre_Apellidos_CV.pdf</code>. Una persona lo verá en una carpeta con cientos de archivos.</LI>
        </UL>

        <Note>
          <strong>¿No sabes en qué categoría cae tu archivo?</strong> Suéltalo en el{' '}
          <A href="/es/">comprobador de CV gratuito</A>: lee PDF y DOCX en tu navegador y te dice al
          momento si hay texto extraíble, cuántas páginas ve un analizador y qué secciones ha
          conseguido identificar.
        </Note>

        <H2>Relacionado</H2>
        <UL>
          <LI><A href="/es/como-lee-un-ats-tu-cv">Cómo lee tu CV un ATS: así funciona el análisis automático</A></LI>
          <LI><A href="/es/lista-de-comprobacion-cv-ats">Lista de comprobación para un CV compatible con ATS</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: '¿Puede un ATS leer un currículum en PDF?',
        a: 'Sí, siempre que el PDF contenga texto real. Los sistemas de seguimiento de candidatos actuales extraen texto de los PDF de forma rutinaria. Un PDF escaneado o formado solo por imágenes no tiene texto que extraer y se lee como una página en blanco.',
      },
      {
        q: '¿Debo enviar .doc o .docx?',
        a: 'Mejor .docx, el formato actual de Word, salvo que la empresa pida expresamente .doc. Y todavía mejor: envía un PDF con texto real, a menos que el formulario te limite a archivos de Word.',
      },
      {
        q: '¿Cómo sé si mi PDF tiene texto real?',
        a: 'Ábrelo e intenta resaltar una línea con el cursor; después busca tu dirección de correo electrónico. Si puedes seleccionar texto y la búsqueda encuentra tu correo, el PDF tiene texto real.',
      },
    ],
  },

  {
    ...guide('how-ats-parsing-works'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Un ATS analiza un CV en cuatro fases mecánicas: extrae el texto, lo divide en secciones según sus títulos, saca datos como el correo, las fechas y los puestos, e indexa el resultado para que los reclutadores lo busquen. Casi todo consejo de formato existe porque una de esas fases falla.',
    body: (
      <>
        <P>
          Gran parte de los consejos sobre CV tratan el sistema de seguimiento de candidatos como una
          caja negra con opiniones. Es más sencillo que eso. El análisis se hace por fases, todas
          mecánicas, y casi cada consejo real de formato nace del fallo de una fase concreta.
        </P>

        <H2>Fase 1: extracción del texto</H2>
        <P>
          Se abre el archivo y se sacan de él los caracteres. En un DOCX es sobre todo leer XML. En un
          PDF es más difícil: un PDF no guarda líneas ni párrafos, sino fragmentos de texto con
          coordenadas. Reconstruir que «este fragmento y aquel están en la misma línea» es geometría,
          y es donde se descomponen las maquetaciones en varias columnas: dos columnas pueden
          coserse en una sola línea sin sentido.
        </P>
        <P>
          Así se ve. Un CV en dos columnas, tal como lo ve una persona, y el texto que devuelve un
          extractor que lee línea a línea, como el de este sitio:
        </P>
        <Pre label="Lo que ve quien lo lee">{`EXPERIENCIA                       HABILIDADES
Responsable de ingeniería, Acme   Kubernetes, Go
ene 2020 – actualidad             Terraform, AWS`}</Pre>
        <Pre label="Lo que recibe el analizador">{`EXPERIENCIA HABILIDADES
Responsable de ingeniería, Acme Kubernetes, Go
ene 2020 – actualidad Terraform, AWS`}</Pre>
        <P>
          Ahora cada línea es un híbrido. El título de Experiencia comparte línea con Habilidades, tu
          puesto lleva pegadas dos tecnologías y tras el intervalo de fechas aparecen proveedores de
          nube. No se ha perdido nada: solo se ha vuelto a juntar en el orden equivocado, que para un
          analizador es lo mismo.
        </P>
        <P><strong>Falla cuando:</strong> la página es una imagen, el texto está convertido a contornos o la maquetación tiene varias columnas.</P>

        <H2>Fase 2: separación en secciones</H2>
        <P>
          El texto se corta en regiones buscando títulos. Por eso gana el título aburrido frente al
          ingenioso: un analizador que compara con una lista de palabras conocidas encuentra{' '}
          <em>Experiencia</em>, <em>Experiencia laboral</em> e <em>Historial laboral</em>. No
          encuentra <em>Donde he dejado huella</em>.
        </P>
        <P>
          Para concretar: estos son los títulos exactos que busca el comprobador de este sitio. Acepta
          una línea corta, de 45 caracteres o menos y en cualquier combinación de mayúsculas y
          minúsculas, que contenga uno de ellos, así que <em>Experiencia laboral relevante</em> cuenta
          como Experiencia.
        </P>
        <Table
          caption="Títulos de sección que reconoce ATS Resume Toolkit"
          head={['Sección', 'Títulos que acepta', 'Puntos']}
          rows={SECTION_ROWS}
        />
        <P>
          Los analizadores comerciales usan listas más largas, pero el principio es idéntico, y en
          ninguna de ellas figura el título que te hayas inventado.
        </P>
        <P><strong>Falla cuando:</strong> los títulos son creativos, solo se distinguen por el color o no existen.</P>

        <H2>Fase 3: extracción de datos</H2>
        <P>
          Dentro de cada sección, el analizador busca elementos concretos: un correo es un patrón, un
          teléfono es un patrón y un intervalo de fechas marca el comienzo de un puesto. El cargo y la
          empresa se deducen por su posición respecto a la fecha.
        </P>
        <P>
          Por eso <strong>las fechas importan más de lo que la gente espera</strong>. Una línea con
          fecha es el ancla que le dice al analizador «aquí empieza un trabajo nuevo». Los puestos sin
          fecha se funden con lo que hay antes, y tus tres años en una empresa acaban dentro de la
          entrada del empleo anterior.
        </P>
        <P><strong>Falla cuando:</strong> faltan las fechas, se escriben solo como «2 años» o se dibujan como una línea de tiempo gráfica.</P>

        <H2>Fase 4: indexación y búsqueda</H2>
        <P>
          Los campos extraídos van a una base de datos. Después, un reclutador la consulta: por cargo,
          por habilidad, por ubicación. En ese momento tu CV no se está juzgando; se está{' '}
          <em>consultando</em>.
        </P>
        <P>
          Eso replantea la cuestión de las palabras clave. El objetivo no es rellenar el texto de
          términos para complacer a un algoritmo, sino asegurarte de que las palabras que un
          reclutador escribiría con verosimilitud aparezcan en algún lugar donde de verdad te las
          hayas ganado. Si lideraste migraciones a Kubernetes y nunca escribiste la palabra
          «Kubernetes», no estarás en ese conjunto de resultados.
        </P>
        <P><strong>Falla cuando:</strong> el vocabulario de tu CV y el de la oferta no tienen nada en común.</P>

        <H2>Qué se deduce de todo esto</H2>
        <UL>
          <LI>Los consejos de formato no son superstición: cada regla corresponde a una de las fases anteriores.</LI>
          <LI>Los consejos sobre palabras clave tratan de coincidencia de vocabulario, no de densidad. Nunca declares una habilidad que no tengas.</LI>
          <LI>Nada de este proceso te evalúa. O te coloca en una forma que se puede buscar, o no lo consigue.</LI>
        </UL>

        <Note>
          <strong>Míralo desde el lado del analizador.</strong> El{' '}
          <A href="/es/">comprobador de CV gratuito</A> tiene una pestaña <em>Datos extraídos</em> que
          muestra exactamente lo que ha salido de tu archivo: el nombre, los datos de contacto, los
          enlaces y cada puesto que ha logrado identificar. Si algo falta ahí, también le faltará a la
          empresa.
        </Note>

        <H2>Relacionado</H2>
        <UL>
          <LI><A href="/es/que-es-la-puntuacion-ats-de-un-cv">Qué mide en realidad la puntuación ATS</A></LI>
          <LI><A href="/es/revisar-cv-ats-sin-subir-archivos">Revisar tu CV con un ATS sin subirlo a ningún servidor</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: '¿Puede un ATS leer un currículum en dos columnas?',
        a: 'A menudo no en el orden correcto. La extracción de texto reconstruye las líneas a partir de las posiciones en la página, así que dos columnas pueden coserse línea a línea y mezclar un puesto con una lista de habilidades. Una maquetación de una sola columna evita el problema por completo.',
      },
      {
        q: '¿Leen los sistemas de seguimiento de candidatos las cabeceras y los pies de página?',
        a: 'Algunos analizadores se saltan esas zonas o las tratan de forma poco fiable. Mantén tu nombre, tu correo y tu teléfono en el cuerpo de la página para que se extraigan sea cual sea el analizador que lea el archivo.',
      },
      {
        q: '¿Sirve de algo esconder palabras clave en texto blanco?',
        a: 'No. El texto blanco sigue siendo texto: se extrae en el perfil que lee el reclutador, donde parece un intento de manipular la búsqueda. Usa el vocabulario de la oferta solo donde te lo hayas ganado de verdad.',
      },
    ],
  },

  {
    ...guide('ats-resume-checklist'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Corrige primero cinco cosas: texto seleccionable, el correo en el cuerpo, una sola columna, títulos de sección estándar y una fecha en cada puesto. De ellas depende que la candidatura llegue intacta. Todo lo demás decide si te encuentran en una búsqueda y, después, si a una persona le gusta leerla.',
    body: (
      <>
        <P>
          Ordenado por consecuencias, no por costumbre. El primer grupo decide si tu candidatura llega
          siquiera; el último es pulido. Si solo tienes diez minutos, haz el primer grupo.
        </P>

        <H2>Crítico: si te lo saltas, puede que la candidatura no llegue</H2>
        <UL>
          <LI><strong>El texto es seleccionable.</strong> Abre el archivo e intenta resaltar una línea. Si no puedes, el analizador ve una página en blanco.</LI>
          <LI><strong>Tu correo es texto normal en el cuerpo.</strong> No en la cabecera, no solo tras un icono de sobre, no solo como hipervínculo.</LI>
          <LI><strong>Una sola columna.</strong> Las barras laterales son la causa más común de extracciones desordenadas.</LI>
          <LI><strong>Títulos de sección estándar.</strong> Experiencia, Formación, Habilidades, Resumen. Aquí gana lo aburrido.</LI>
          <LI><strong>Cada puesto lleva fechas.</strong> Mes y año, con un formato coherente, en la misma línea que el puesto.</LI>
        </UL>

        <H2>Importante: de esto depende que aparezcas en una búsqueda</H2>
        <UL>
          <LI><strong>Los cargos son reconocibles.</strong> Si tu cargo interno es «Ninja de proyectos», pon al lado el cargo estándar del sector.</LI>
          <LI><strong>Aparece el vocabulario de la oferta</strong>, pero solo donde te lo hayas ganado de verdad.</LI>
          <LI><strong>Existe una sección de habilidades,</strong> en texto normal separado por comas y no en un gráfico de barras de nivel.</LI>
          <LI><strong>Tus enlaces están escritos</strong> como texto visible: <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">linkedin.com/in/tu-nombre</code>. Un analizador lee texto, no destinos de enlaces.</LI>
          <LI><strong>No hay texto dentro de una imagen ni de un cuadro de texto.</strong></LI>
        </UL>

        <H2>Merece la pena: esto lo lee una persona</H2>
        <UL>
          <LI><strong>Las viñetas empiezan con un verbo.</strong> Lideré, lancé, reduje, reconstruí, asumí.</LI>
          <LI><strong>El impacto lleva una cifra.</strong> «Mejoré la fiabilidad» es una afirmación; «sesiones sin fallos del 96% al 99,5%» es una prueba.</LI>
          <LI><strong>Nada de frases hechas.</strong> «Profesional orientado a resultados con una trayectoria demostrada» no le dice nada a quien lo lee.</LI>
          <LI><strong>La extensión se ajusta a tu trayectoria.</strong> Una página al principio; dos es lo normal tras una década. Tres necesitan una razón.</LI>
          <LI><strong>El nombre del archivo es un nombre:</strong> <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">Nombre_Apellidos_CV.pdf</code>, no <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">cv_final_v3_DEFINITIVO.pdf</code>.</LI>
        </UL>

        <H2>Cuáles de estos puntos puede verificar un comprobador por ti</H2>
        <P>
          La mayor parte de la lista es mecánica, así que un software puede comprobarla. Otra parte es
          criterio, y eso no puede. Este es el reparto en el comprobador de este sitio:
        </P>
        <H3>Se comprueba automáticamente</H3>
        <UL>
          <LI>Texto seleccionable y codificación de caracteres limpia</LI>
          <LI>Correo, teléfono y un enlace de perfil visibles como texto; también avisa de un enlace que solo existe como hipervínculo oculto</LI>
          <LI>Títulos estándar de Experiencia, Formación, Habilidades y Resumen, además de Logros, Proyectos y Certificaciones</LI>
          <LI>Fechas, estructura de viñetas y número de páginas</LI>
          <LI>Cifras en tus viñetas y viñetas que empiezan con un verbo</LI>
          <LI>Frases hechas y afirmaciones vagas, en la pestaña independiente Estilo de redacción</LI>
          <LI>El vocabulario de la oferta, si pegas el texto de la oferta en la pestaña Coincidencia con la oferta</LI>
        </UL>
        <H3>Sigue dependiendo de ti</H3>
        <UL>
          <LI>Si una barra lateral o una segunda columna desordena el orden de lectura: usa la prueba de copiar y pegar</LI>
          <LI>Si tus cargos son los que buscaría un reclutador</LI>
          <LI>Si cada palabra clave que has añadido es una que te has ganado</LI>
          <LI>El nombre del archivo</LI>
        </UL>

        <Note>
          <strong>Casi toda esta lista se puede comprobar automáticamente.</strong> El{' '}
          <A href="/es/">comprobador de CV gratuito</A> ejecuta en tu navegador las comprobaciones de
          legibilidad, contacto, secciones, formato y contenido, y ordena los fallos por los puntos
          que cuesta cada uno, para que arregles primero lo caro. La pestaña de estilo de redacción
          cubre los puntos de frases hechas y afirmaciones sin cuantificar.
        </Note>

        <H2>Relacionado</H2>
        <UL>
          <LI><A href="/es/como-lee-un-ats-tu-cv">Cómo lee tu CV un ATS: así funciona el análisis automático</A></LI>
          <LI><A href="/es/cv-pdf-o-word-para-ats">CV en PDF o en Word: ¿cuál debes enviar?</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: '¿Cuánto debe ocupar un CV compatible con ATS?',
        a: 'Una página al principio de la carrera; dos páginas es lo normal tras unos diez años. La extensión no impide que un analizador lea el archivo, pero el reclutador suele no leer las páginas posteriores a la segunda.',
      },
      {
        q: '¿Son seguras las tablas y los cuadros de texto en un CV para ATS?',
        a: 'Evítalos para cualquier cosa importante. El texto de los cuadros de texto puede omitirse o extraerse en desorden, y las tablas usadas para maquetar crean los mismos problemas de orden de lectura que las columnas. Los párrafos normales y las listas con viñetas son lo más seguro.',
      },
      {
        q: '¿Qué debo corregir primero en mi CV para un ATS?',
        a: 'Asegúrate de que el texto sea seleccionable, de que tu correo esté en el cuerpo, de que la maquetación sea de una sola columna, de que los títulos de sección sean estándar y de que cada puesto tenga fechas. De esas cinco cosas depende que la candidatura se lea correctamente.',
      },
    ],
  },

  {
    ...guide('how-to-check-your-cv-score'),
    published: '2026-10-10',
    updated: '2026-10-10',
    summary:
      'Suelta tu PDF o DOCX en un comprobador de puntuación de CV, lee la puntuación y las comprobaciones fallidas, corrige primero las más costosas y vuelve a comprobar. Aquí todo se ejecuta en tu navegador: sin subida, sin cuenta y sin IA. Una puntuación de 85 o más significa que no se pierde nada importante.',
    body: (
      <>
        <P>
          La puntuación de un CV es una estimación de lo bien que un software puede leer tu documento.
          Las empresas usan sistemas de seguimiento de candidatos (ATS) para guardar y buscar
          candidaturas, así que un CV que el sistema lee mal puede perder tu correo o tus puestos.
          Comprobar la puntuación lleva menos de un minuto y es gratis.
        </P>

        <H2>Comprueba la puntuación de tu CV en cuatro pasos</H2>
        <OL>
          <LI>
            Abre el <A href="/es/">comprobador de CV gratuito</A> y elige <em>Revisar mi CV</em>.
          </LI>
          <LI>
            Suelta tu CV en PDF o DOCX. El archivo se lee dentro de tu navegador y no se envía a
            ninguna parte, así que puedes usarlo con el CV que vas a mandar a la competencia de tu
            empresa actual.
          </LI>
          <LI>
            Lee la puntuación y la lista de comprobaciones fallidas. Los fallos están ordenados por
            los puntos que cuesta cada uno, de modo que el primero es la corrección más valiosa.
          </LI>
          <LI>
            Corrige los dos o tres primeros, vuelve a exportar y suelta el archivo nuevo. Repite
            hasta que no quede nada costoso.
          </LI>
        </OL>

        <H2>Qué puntuación de CV es buena</H2>
        <P>
          En este comprobador, 85 o más significa que un analizador leerá el documento sin problemas.
          De 70 a 84 es buena, con algunas correcciones concretas pendientes. De 50 a 69 necesita
          mejoras, normalmente por falta del título de una sección o de un dato de contacto. Por
          debajo de 50 hay un problema estructural, casi siempre texto que el analizador no puede
          extraer. No persigas los últimos puntos: a partir de 85 más o menos, el contenido importa
          más que la puntuación.
        </P>

        <H2>Qué corregir primero</H2>
        <UL>
          <LI>Asegúrate de que el texto sea seleccionable. Un PDF escaneado o formado solo por imágenes puntúa casi cero.</LI>
          <LI>Pon el correo y el teléfono en el cuerpo de la página, no en una cabecera ni en una imagen.</LI>
          <LI>Usa títulos estándar: Experiencia, Formación, Habilidades, Resumen.</LI>
          <LI>Pon fechas en cada puesto y usa viñetas reales.</LI>
        </UL>

        <H2>Lo que la puntuación no te dice</H2>
        <P>
          No sabe si encajas en el puesto y no es lo que ve la empresa. Para saber si encajas, pega la
          oferta en la comparación de palabras clave. Para ver todas las reglas, lee{' '}
          <A href="/es/que-es-la-puntuacion-ats-de-un-cv">qué mide en realidad la puntuación ATS</A>.
        </P>

        <Note>
          <strong>Pruébalo con tu propio archivo.</strong> El{' '}
          <A href="/es/">comprobador de CV gratuito</A> es de código abierto, funciona en tu
          navegador y no te pide un correo electrónico.
        </Note>

        <H2>Relacionado</H2>
        <UL>
          <LI><A href="/es/que-es-la-puntuacion-ats-de-un-cv">Qué mide en realidad la puntuación ATS</A></LI>
          <LI><A href="/es/lista-de-comprobacion-cv-ats">Lista de comprobación para un CV compatible con ATS</A></LI>
          <LI><A href="/es/revisar-cv-ats-sin-subir-archivos">Revisar tu CV con un ATS sin subirlo a ningún servidor</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: '¿Cómo compruebo la puntuación de mi CV gratis?',
        a: 'Abre un comprobador de puntuación de CV que no exija registro, suelta tu PDF o DOCX y lee la puntuación y las comprobaciones fallidas. En este sitio el archivo se procesa en tu navegador y nunca se sube.',
      },
      {
        q: '¿Qué puntuación de CV es buena?',
        a: 'En este comprobador, 85 o más significa que el documento se lee sin problemas. De 70 a 84 es buena, con algunas correcciones pendientes. Por debajo de 50 suele significar que no se puede extraer el texto.',
      },
      {
        q: '¿La puntuación de un CV es lo mismo que la puntuación ATS?',
        a: 'En la práctica, sí: las dos estiman lo bien que un software de seguimiento de candidatos puede leer tu documento. No hay una puntuación estándar, así que cada comprobador da cifras distintas.',
      },
    ],
  },
]
