// Guides statiques (français), rendus en HTML autonome à la construction par
// scripts/prerender.mjs. Ils n'embarquent aucun JavaScript : un guide est de la
// prose, et le bundle de l'application ne ferait que le ralentir.
//
// Ils vivent dans src/ pour que le scanner de Tailwind voie ces noms de classes
// et produise la même feuille de style que l'application. Ne pas les déplacer
// hors de src/, sinon les guides s'affichent sans style.
import { A, Code, H2, H3, LI, Note, OL, P, Pre, Table, UL } from '../prose.tsx'
import { rubricRows, sectionRows } from '../tables.ts'
import { GUIDES } from './guides.ts'
import type { Article, Guide } from '../types.ts'
import { fr } from '../../i18n/messages/fr.ts'

function guide(id: Guide['id']): Guide {
  const meta = GUIDES.find((g) => g.id === id)
  if (!meta) throw new Error(`articles: no entry for "${id}" in guides.ts`)
  return meta
}

const RUBRIC_ROWS = rubricRows(fr)
const SECTION_ROWS = sectionRows('fr', fr)

export const ARTICLES: Article[] = [
  {
    ...guide('what-is-an-ats-score'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Un score ATS estime avec quelle netteté un logiciel de suivi des candidatures extrait le texte, les coordonnées, les rubriques et les dates de votre CV. Il ne dit rien de votre adéquation au poste. Au-dessus de 85 environ, rien d’important ne se perd : consacrez plutôt votre temps au contenu.',
    body: (
      <>
        <P>
          Un système de suivi des candidatures (ATS, pour <em>applicant tracking system</em>) est le
          logiciel qu’un employeur utilise pour recevoir, stocker et rechercher des candidatures.
          Avant qu’un recruteur lise votre CV, le système l’analyse : il en extrait votre nom, vos
          coordonnées, vos intitulés de poste, vos dates et vos compétences, et les range dans les
          champs d’une base de données. Un <strong>score ATS</strong> est une estimation de la
          réussite de cette étape.
        </P>
        <P>
          L’affirmation est plus étroite qu’il n’y paraît, et c’est précisément ce qui compte. Le
          score ne sait pas si vous convenez au poste. Il mesure une seule chose : le document
          survit-il à la lecture par une machine ?
        </P>

        <H2>Le mythe à oublier d’abord</H2>
        <P>
          Vous avez sans doute lu que <em>« 75% des CV sont rejetés par un ATS avant qu’un humain ne
          les voie »</em>. Ce chiffre circule depuis plus de dix ans et ne s’appuie sur aucune source
          crédible. Les ATS sont des outils de stockage et de recherche. Ils classent et filtrent
          selon des critères fixés par un recruteur ; ils ne jettent pas, de leur propre initiative,
          trois candidats sur quatre.
        </P>
        <P>
          Le vrai risque est plus banal, et plus facile à corriger. Si l’analyseur ne trouve pas votre
          adresse e-mail, votre candidature arrive avec un champ de contact vide. S’il ne lit pas vos
          intitulés de poste, vous n’apparaissez pas dans la recherche du recruteur sur « chef de
          projet ». Personne ne vous a écarté : vous n’avez simplement jamais figuré dans les
          résultats.
        </P>

        <H2>Ce qu’un score peut raisonnablement mesurer</H2>
        <P>
          Tout score ATS honnête est une heuristique construite à partir de quelques vérifications.
          Sur ce site, le barème est fixé à 100 points et publié : vous voyez exactement d’où vient
          chaque point. Il se répartit en cinq groupes :
        </P>
        <UL>
          <LI><strong>Lisibilité (25)</strong> — y a-t-il du vrai texte sélectionnable, ou la page est-elle une image ?</LI>
          <LI><strong>Contact (15)</strong> — adresse e-mail, téléphone et un lien écrit en texte visible.</LI>
          <LI><strong>Rubriques (35)</strong> — des titres qu’un analyseur reconnaît : Expérience, Formation, Compétences, Profil.</LI>
          <LI><strong>Format (15)</strong> — nombre de pages, postes datés, vraie structure en puces.</LI>
          <LI><strong>Contenu (10)</strong> — résultats chiffrés et puces qui commencent par un verbe.</LI>
        </UL>
        <P>Et vérification par vérification — ce tableau est celui que le calcul applique, pas un résumé :</P>
        <Table
          caption="Barème de notation d’ATS Resume Toolkit, vérification par vérification"
          head={['Vérification', 'Groupe', 'Points']}
          rows={RUBRIC_ROWS}
        />
        <P>
          Deux détails passent facilement inaperçus. L’absence de téléphone ou de profil ne coûte que
          ses propres points — ce sont des avertissements, pas des échecs — alors qu’un titre
          Expérience, Formation ou Compétences manquant fait échouer la vérification. Et la dernière
          ligne des rubriques est un bonus : un titre Réalisations vaut 4 points, Projets 3,
          Certifications 3.
        </P>
        <P>
          Les rubriques pèsent le plus lourd parce qu’elles transforment un bloc de texte en données
          structurées. Un analyseur qui trouve un titre « Expérience professionnelle » sait que les
          entrées en dessous sont des postes. Sans lui, il devine.
        </P>

        <H2>Ce qu’aucun score ne peut mesurer</H2>
        <UL>
          <LI>Si votre expérience correspond au poste. C’est le jugement du recruteur.</LI>
          <LI>Quel ATS précis l’employeur utilise. Les éditeurs n’analysent pas tous de la même façon, et aucun ne publie ses règles.</LI>
          <LI>Si votre rédaction est convaincante. Un CV parfaitement lisible par une machine peut rester terne.</LI>
        </UL>
        <P>
          Considérez un score supérieur à 85 environ comme « rien ne se perdra en route », et passez
          au contenu. Courir après les derniers points est presque toujours du temps perdu.
        </P>

        <H2>Pourquoi deux vérificateurs donnent deux scores différents</H2>
        <P>
          Il n’existe pas de score ATS standard. Chaque vérificateur invente son barème, le pondère à
          sa guise et — le plus souvent — ne dit pas lequel. Un 62 sur un site et un 81 sur un autre
          ne se contredisent pas : ce sont deux tests différents. La bonne question n’est jamais
          « quel chiffre est le bon ? » mais « quelle vérification précise a échoué, et suis-je
          d’accord pour dire qu’elle compte ? ». On ne peut y répondre que si les règles sont
          publiées.
        </P>

        <Note>
          <strong>Vérifiez le vôtre en quelques secondes.</strong> Le{' '}
          <A href="/fr/">vérificateur de CV ATS gratuit</A> analyse un PDF ou un DOCX entièrement
          dans votre navigateur : le fichier n’est jamais envoyé, il n’y a pas de compte et aucun
          modèle de langage n’intervient. Vous pouvez lire les règles de notation exactes dans le
          code source public.
        </Note>

        <H2>À lire aussi</H2>
        <UL>
          <LI><A href="/fr/comment-un-ats-lit-un-cv">Comment un ATS lit un CV</A></LI>
          <LI><A href="/fr/checklist-cv-compatible-ats">La checklist du CV compatible ATS</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Qu’est-ce qu’un bon score ATS ?',
        a: 'Sur ce vérificateur, 85 ou plus signifie qu’un analyseur lira le document proprement et que rien d’important ne se perd. De 70 à 84, le score est bon et il reste quelques corrections précises. De 50 à 69, le CV demande du travail, en général un titre de rubrique ou une coordonnée manquants. En dessous de 50, un problème structurel existe, le plus souvent du texte que l’analyseur ne peut pas extraire.',
      },
      {
        q: 'Les employeurs voient-ils mon score ATS ?',
        a: 'Pas un score issu d’un outil comme celui-ci : il est calculé sur votre appareil et n’est envoyé nulle part. Le système de l’employeur peut classer les candidatures par rapport à l’offre, mais ce classement repose sur ses propres règles et sur les mots recherchés par le recruteur, pas sur un score tiers.',
      },
      {
        q: 'Pourquoi mon CV obtient-il un score différent sur chaque vérificateur ?',
        a: 'Parce qu’il n’existe pas de standard. Chaque vérificateur définit ses propres contrôles et leur poids. Comparez les vérifications qui ont échoué plutôt que les chiffres affichés.',
      },
      {
        q: 'Est-il vrai que 75% des CV sont rejetés par un ATS ?',
        a: 'Ce chiffre circule depuis plus de dix ans sans source crédible. Les ATS stockent et recherchent des candidatures ; ce sont les recruteurs qui fixent les filtres. Le vrai risque est un CV mal lu par l’analyseur, qui n’apparaît alors pas dans la recherche d’un recruteur.',
      },
    ],
  },

  {
    ...guide('ats-checker-without-upload'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Un navigateur peut lire et noter un PDF ou un DOCX sans l’envoyer nulle part : l’envoi est un choix de conception, pas une nécessité technique. Vous pouvez vérifier un outil vous-même en moins d’une minute : ouvrez le panneau Réseau du navigateur, déposez votre CV et cherchez une requête qui transporte le fichier.',
    body: (
      <>
        <P>
          Un CV est l’un des documents les plus sensibles que l’on possède. Il contient votre nom
          complet, votre adresse e-mail personnelle, votre numéro de téléphone, votre ville et la
          chronologie complète de vos employeurs. Le confier à un site est une décision plus lourde
          qu’il n’y paraît.
        </P>
        <P>
          C’est surtout vrai dans la situation où l’on cherche le plus souvent un vérificateur de CV :{' '}
          <strong>chercher un poste alors qu’on est encore en poste.</strong> À ce moment-là, le
          document n’est pas seulement une donnée personnelle, c’est la preuve d’une intention.
        </P>

        <H2>Ce que veut généralement dire « envoyez votre CV »</H2>
        <P>
          Quand un outil vous demande d’envoyer votre CV, le fichier quitte votre appareil et arrive
          sur un serveur. À partir de là, plusieurs des cas suivants sont courants, et souvent
          mentionnés dans les conditions d’utilisation :
        </P>
        <UL>
          <LI>Le fichier est conservé, parfois indéfiniment, et rattaché au compte que vous avez créé.</LI>
          <LI>Le texte est transmis à un modèle de langage tiers pour être noté ou réécrit.</LI>
          <LI>L’adresse e-mail saisie à l’inscription entre dans une séquence de prospection.</LI>
          <LI>Des données agrégées alimentent un produit de recrutement vendu aux employeurs.</LI>
        </UL>
        <P>
          Rien de tout cela n’est forcément malveillant. C’est simplement le modèle économique : la
          vérification est gratuite parce que vous et votre document êtes le produit. Mais mieux vaut
          le savoir avant de cliquer plutôt qu’après.
        </P>

        <H2>Les questions à poser à tout vérificateur</H2>
        <UL>
          <LI><strong>Le fichier quitte-t-il l’appareil ?</strong> S’il n’y a pas d’envoi, la plupart des autres questions perdent leur importance.</LI>
          <LI><strong>Faut-il un compte ?</strong> Un mur d’inscription sert à récupérer votre adresse e-mail, pas à améliorer le score.</LI>
          <LI><strong>Le score est-il déterministe ou généré ?</strong> Si un modèle rédige les commentaires, votre CV lui a été envoyé.</LI>
          <LI><strong>Peut-on lire les règles ?</strong> Un barème publié peut se discuter. Un barème caché, non.</LI>
          <LI><strong>Comment supprimer ses données ?</strong> Si la réponse est « écrivez au support », supposez que le fichier est conservé.</LI>
        </UL>

        <H2>Comment fonctionne une vérification purement locale</H2>
        <P>
          Les navigateurs modernes savent lire un PDF ou un DOCX sans aucun serveur. Le fichier est
          ouvert en mémoire, une bibliothèque JavaScript en extrait le texte, les vérifications
          s’exécutent sur ce texte et le résultat s’affiche — le tout dans l’onglet que vous avez déjà
          ouvert. Fermez l’onglet et le document disparaît.
        </P>
        <P>
          Le compromis est réel et mérite d’être dit : un outil local ne peut pas vous comparer à une
          base d’autres candidats, ni réécrire vos puces à votre place. Ce qu’il sait faire, c’est
          vous dire si un analyseur lira correctement le document, et quelles lignes précises sont
          faibles — ce qui est justement la partie qui détermine si votre candidature arrive intacte.
        </P>

        <H2>Comment vérifier qu’un outil n’envoie vraiment pas votre fichier</H2>
        <P>
          « Nous ne conservons jamais votre fichier » est une promesse. Savoir si le fichier quitte
          votre ordinateur, vous pouvez le constater — ou non — dans n’importe quel navigateur de
          bureau :
        </P>
        <OL>
          <li>Ouvrez l’outil, puis les outils de développement du navigateur : <Code>F12</Code> sous Windows et Linux, <Code>⌥ ⌘ I</Code> sur Mac.</li>
          <li>Passez à l’onglet <strong>Réseau</strong> (<em>Network</em>) et videz-le, pour que seules les nouvelles requêtes s’affichent.</li>
          <li>Déposez votre CV dans l’outil et attendez le résultat.</li>
          <li>
            Parcourez les nouvelles requêtes. Un envoi est une requête <Code>POST</Code> ou{' '}
            <Code>PUT</Code> dont la taille est à peu près celle de votre fichier. Les scripts et les
            polices que la page charge pour elle-même ne sont pas des envois.
          </li>
        </OL>
        <P>
          Si aucune requête ne transporte le fichier, le fichier n’est pas sorti. Cela fonctionne sur
          n’importe quel site, y compris celui-ci — et c’est le but : l’affirmation doit pouvoir être
          vérifiée par vous, pas crue sur parole.
        </P>
        <P>
          Ce site ajoute une seconde garantie, imposée par le navigateur. Son en-tête
          Content-Security-Policy contient <Code>connect-src 'self' data: blob:</Code>, ce qui
          signifie que le navigateur lui-même refuse toute connexion réseau vers un autre domaine, et
          que l’unique domaine autorisé ne sert que des fichiers statiques : il n’existe aucun point
          d’entrée pour recevoir un CV.
        </P>

        <Note>
          <strong>Ce site est de type local.</strong>{' '}
          Le <A href="/fr/">vérificateur de CV ATS gratuit</A> lit votre PDF ou votre DOCX dans le
          navigateur avec{' '}
          <code className="rounded bg-white px-1 py-0.5 text-[13px] text-stone-800">pdf.js</code> et{' '}
          <code className="rounded bg-white px-1 py-0.5 text-[13px] text-stone-800">mammoth</code>,
          le note avec des règles fixes, et n’a aucun serveur capable de recevoir un fichier. Il est
          sous licence MIT : l’affirmation se vérifie, elle n’est pas seulement promise.
        </Note>

        <H2>À lire aussi</H2>
        <UL>
          <LI><A href="/fr/score-ats-cv-cest-quoi">Ce que mesure vraiment un score ATS</A></LI>
          <LI><A href="/fr/cv-pdf-ou-word-pour-ats">CV en PDF ou en Word : lequel envoyer ?</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Est-il sûr d’envoyer son CV à un vérificateur de CV en ligne ?',
        a: 'Cela dépend de ce que devient le fichier, ce que seules les conditions d’utilisation décrivent en général. Les CV envoyés sont couramment conservés, rattachés à un compte et parfois transmis à des modèles de langage tiers. Si vous cherchez un poste alors que vous êtes en poste, préférez un outil qui ne reçoit jamais le fichier.',
      },
      {
        q: 'Comment un site peut-il lire mon CV sans l’envoyer ?',
        a: 'Les navigateurs peuvent ouvrir le fichier que vous sélectionnez dans la mémoire de la page. Des bibliothèques JavaScript comme pdf.js et mammoth en extraient alors le texte, et les vérifications s’exécutent sur votre appareil. Aucun serveur n’est nécessaire.',
      },
      {
        q: 'Comment savoir si un vérificateur de CV n’envoie pas mon fichier ?',
        a: 'Ouvrez les outils de développement du navigateur, allez dans l’onglet Réseau, videz-le, puis déposez votre CV. Un envoi apparaît comme une requête POST ou PUT d’une taille proche de celle de votre fichier. S’il n’y en a aucune, le fichier est resté sur votre appareil.',
      },
    ],
  },

  {
    ...guide('pdf-or-docx-for-ats'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Envoyez un PDF avec du vrai texte, sauf si la candidature demande un autre format : envoyez alors exactement ce qui est demandé. Le seul PDF qui échoue de façon fiable est celui qui ne contient pas de vrai texte, comme un scan ou un export aux polices vectorisées, et cela se teste en quelques secondes.',
    body: (
      <>
        <P>
          La réponse courte : <strong>envoyez un PDF avec du vrai texte, sauf si l’employeur demande
          autre chose — auquel cas envoyez exactement ce qu’il demande.</strong> La réponse longue
          vaut deux minutes, car le conseil habituel (« utilisez toujours Word, les ATS ne lisent pas
          les PDF ») a dix ans de retard.
        </P>

        <H2>Pourquoi le PDF est devenu le choix par défaut</H2>
        <UL>
          <LI><strong>Il s’affiche partout à l’identique.</strong> Un DOCX se remet en page selon les polices et la version de Word de l’autre côté. Votre mise en page soignée sur deux pages peut arriver sur trois pages décousues.</LI>
          <LI><strong>Les analyseurs modernes le gèrent.</strong> L’extraction de texte d’un PDF est un problème résolu ; les principaux systèmes la prennent en charge depuis des années.</LI>
          <LI><strong>Il est plus difficile à abîmer.</strong> Personne ne modifie votre PDF par accident entre l’envoi et la lecture.</LI>
        </UL>

        <H2>Le seul PDF qui échoue à tous les coups</H2>
        <P>
          Un PDF est un conteneur. Il peut contenir du vrai texte, ou une image de texte. Si vous avez
          exporté depuis un outil de design avec le texte vectorisé, scanné une version imprimée, ou
          fait une capture d’écran de votre CV enregistrée en PDF, le fichier ne contient{' '}
          <em>aucun texte</em>. Un analyseur le lit comme un document vide.
        </P>
        <P>
          Le test prend trois secondes : ouvrez le PDF et essayez de sélectionner une ligne de texte
          avec le curseur. Si vous ne pouvez pas la surligner, l’ATS non plus.
        </P>

        <H2>Un test de 30 secondes pour n’importe quel PDF</H2>
        <P>Pouvoir sélectionner du texte prouve qu’il existe. Deux étapes de plus montrent s’il ressort de façon exploitable :</P>
        <OL>
          <li><strong>Sélectionnez une ligne.</strong> Si rien ne se surligne, la page est une image. Réexportez depuis le document d’origine.</li>
          <li>
            <strong>Recherchez votre adresse e-mail</strong> avec <Code>Ctrl F</Code> / <Code>⌘ F</Code>.
            Si le lecteur ne la trouve pas, un analyseur non plus — souvent parce qu’elle se trouve
            dans un en-tête, une image ou une zone de texte.
          </li>
          <li>
            <strong>Sélectionnez tout, copiez, et collez dans un éditeur de texte brut</strong> (Bloc-notes,
            ou TextEdit en mode texte brut). Ce que vous voyez ressemble à ce que reçoit un analyseur.
            Si deux colonnes ressortent entremêlées ligne par ligne, ou si vos intitulés de poste
            apparaissent loin de leurs dates, corrigez la mise en page avant toute autre chose.
          </li>
        </OL>
        <P>
          L’export depuis Word, Google Docs ou Pages avec leur commande habituelle{' '}
          <em>Télécharger au format PDF</em> ou <em>Exporter en PDF</em> produit des PDF avec du vrai
          texte. Les chemins risqués sont l’« impression en image », le scan, et les outils de design
          qui proposent de convertir le texte en tracés.
        </P>

        <H2>Quand le DOCX est la bonne réponse</H2>
        <UL>
          <LI><strong>Le formulaire l’exige.</strong> Si le champ d’envoi n’accepte que <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">.doc/.docx</code>, c’est la réponse. Inutile de faire plus malin que le formulaire.</LI>
          <LI><strong>Un recruteur l’a demandé.</strong> Les cabinets remettent souvent votre CV dans leur propre modèle, ce qui suppose un fichier modifiable.</LI>
          <LI><strong>L’employeur utilise un système plus ancien.</strong> Rare aujourd’hui, mais sans inconvénient à respecter.</LI>
        </UL>

        <H2>Ce qui compte plus que l’extension</H2>
        <P>
          Le format est la décision la plus facile que vous prendrez pour votre CV. Voici celles qui
          pèsent vraiment :
        </P>
        <UL>
          <LI><strong>Une seule colonne.</strong> Les mises en page à plusieurs colonnes peuvent être lues dans le mauvais ordre, en entremêlant deux lignes sans rapport.</LI>
          <LI><strong>Pas de texte dans des images.</strong> Un logo passe ; votre intitulé de poste transformé en image, non.</LI>
          <LI><strong>Aucune information essentielle dans l’en-tête ou le pied de page.</strong> Certains analyseurs ignorent ces zones. Mettez votre adresse e-mail dans le corps.</LI>
          <LI><strong>De vraies puces,</strong> pas des tirets tracés à la main dans une cellule de tableau.</LI>
          <LI><strong>Un nom de fichier sensé</strong> — <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">Prenom_Nom_CV.pdf</code>. Un humain le voit dans un dossier de centaines de fichiers.</LI>
        </UL>

        <Note>
          <strong>Vous ne savez pas dans quelle catégorie tombe votre fichier ?</strong> Déposez-le sur le{' '}
          <A href="/fr/">vérificateur de CV ATS gratuit</A> : il lit les PDF comme les DOCX dans votre
          navigateur et vous dit tout de suite s’il y a du texte extractible, combien de pages voit un
          analyseur et quelles rubriques il a su identifier.
        </Note>

        <H2>À lire aussi</H2>
        <UL>
          <LI><A href="/fr/comment-un-ats-lit-un-cv">Comment un ATS lit un CV</A></LI>
          <LI><A href="/fr/checklist-cv-compatible-ats">La checklist du CV compatible ATS</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Un ATS peut-il lire un CV en PDF ?',
        a: 'Oui, tant que le PDF contient du vrai texte. Les ATS modernes extraient couramment le texte des PDF. Un PDF scanné ou composé d’images n’a aucun texte à extraire et se lit comme un document vide.',
      },
      {
        q: 'Faut-il envoyer un .doc ou un .docx ?',
        a: 'Préférez le .docx, le format actuel de Word, sauf si l’employeur demande expressément du .doc. Mieux encore, envoyez un PDF avec du vrai texte, sauf si le formulaire vous limite aux fichiers Word.',
      },
      {
        q: 'Comment savoir si mon PDF contient du vrai texte ?',
        a: 'Ouvrez-le et essayez de surligner une ligne avec le curseur, puis recherchez votre adresse e-mail. Si vous pouvez sélectionner du texte et que la recherche trouve votre adresse, le PDF contient du vrai texte.',
      },
    ],
  },

  {
    ...guide('how-ats-parsing-works'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Un ATS analyse un CV en quatre étapes mécaniques : il extrait le texte, le découpe en rubriques d’après leurs titres, en tire des données comme l’adresse e-mail, les dates et les intitulés de poste, puis indexe le résultat pour que les recruteurs puissent le rechercher. Presque tous les conseils de mise en forme existent parce qu’une de ces étapes échoue.',
    body: (
      <>
        <P>
          La plupart des conseils sur le CV traitent l’ATS comme une boîte noire pleine d’opinions.
          C’est plus simple que cela. L’analyse se fait par étapes, toutes mécaniques, et presque
          chaque conseil de mise en forme découle de l’échec d’une étape précise.
        </P>

        <H2>Étape 1 — Extraction du texte</H2>
        <P>
          Le fichier est ouvert et les caractères en sont extraits. Pour un DOCX, il s’agit surtout de
          lire du XML. Pour un PDF, c’est plus difficile : un PDF ne stocke ni lignes ni paragraphes,
          mais des fragments de texte avec des coordonnées. Reconstituer « ce fragment et celui-là
          sont sur la même ligne » relève de la géométrie, et c’est là que les mises en page à
          plusieurs colonnes se défont : deux colonnes peuvent être recousues en une seule ligne
          absurde.
        </P>
        <P>
          Voici ce que cela donne. Un CV à deux colonnes tel que le voit un lecteur, puis le texte que
          récupère réellement un extracteur ligne par ligne — celui de ce site compris :
        </P>
        <Pre label="Ce que voit le lecteur">{`EXPÉRIENCE                        COMPÉTENCES
Engineering Manager, Acme         Kubernetes, Go
janv. 2020 – présent              Terraform, AWS`}</Pre>
        <Pre label="Ce que reçoit l’analyseur">{`EXPÉRIENCE COMPÉTENCES
Engineering Manager, Acme Kubernetes, Go
janv. 2020 – présent Terraform, AWS`}</Pre>
        <P>
          Chaque ligne est désormais un hybride. Le titre Expérience partage sa ligne avec
          Compétences, votre intitulé de poste a deux compétences collées derrière lui, et la plage
          de dates est suivie de fournisseurs cloud. Rien n’a été perdu — tout a été remis dans le
          mauvais ordre, ce qui, pour un analyseur, revient au même.
        </P>
        <P><strong>Échoue quand :</strong> la page est une image, le texte est vectorisé, ou la mise en page comporte plusieurs colonnes.</P>

        <H2>Étape 2 — Découpage en rubriques</H2>
        <P>
          Le texte est découpé en zones en cherchant des titres. C’est pourquoi le titre banal bat le
          titre original : un analyseur qui compare à une liste de mots connus trouve{' '}
          <em>Expérience</em>, <em>Expérience professionnelle</em> et <em>Parcours professionnel</em>. Il ne
          trouve pas <em>Là où j’ai laissé mon empreinte</em>.
        </P>
        <P>
          Pour être concret : voici les titres exacts que cherche le vérificateur de ce site. Il
          accepte une ligne courte — 45 caractères ou moins, quelle que soit la casse — qui contient
          l’un d’eux, de sorte que <em>Expérience professionnelle pertinente</em> compte comme
          Expérience.
        </P>
        <Table
          caption="Titres de rubriques reconnus par ATS Resume Toolkit"
          head={['Rubrique', 'Titres acceptés', 'Points']}
          rows={SECTION_ROWS}
        />
        <P>
          Les analyseurs du commerce utilisent des listes plus longues, mais le principe est le même —
          et aucune ne contient le titre que vous avez inventé.
        </P>
        <P><strong>Échoue quand :</strong> les titres sont créatifs, distingués seulement par la couleur, ou absents.</P>

        <H2>Étape 3 — Extraction des données</H2>
        <P>
          Dans chaque rubrique, l’analyseur cherche des éléments précis : une adresse e-mail est un
          motif, un numéro de téléphone est un motif, une plage de dates marque le début d’un poste.
          L’intitulé du poste et l’employeur sont déduits de leur position par rapport à la date.
        </P>
        <P>
          C’est pourquoi <strong>les dates comptent plus qu’on ne le croit</strong>. Une ligne datée
          est l’ancre qui indique à l’analyseur « un nouveau poste commence ici ». Les postes sans date
          s’effondrent dans ce qui les précède, et vos trois années quelque part se retrouvent dans la
          fiche de l’employeur précédent.
        </P>
        <P><strong>Échoue quand :</strong> les dates manquent, sont écrites seulement « 2 ans », ou dessinées sous forme de frise.</P>

        <H2>Étape 4 — Indexation et recherche</H2>
        <P>
          Les champs extraits sont placés dans une base de données. Un recruteur la consulte ensuite —
          par intitulé, par compétence, par lieu. À ce stade, votre CV n’est pas jugé ; il est{' '}
          <em>interrogé</em>.
        </P>
        <P>
          Ce qui change la question des mots-clés. Le but n’est pas d’en bourrer le texte pour plaire
          à un algorithme. C’est de s’assurer que les mots qu’un recruteur taperait vraisemblablement
          apparaissent quelque part où vous les avez honnêtement mérités. Si vous avez piloté des
          migrations Kubernetes sans jamais écrire le mot « Kubernetes », vous ne figurerez pas dans
          ces résultats.
        </P>
        <P><strong>Échoue quand :</strong> le vocabulaire de votre CV et celui de l’offre n’ont aucun point commun.</P>

        <H2>Ce que cela implique</H2>
        <UL>
          <LI>Les conseils de mise en forme ne relèvent pas de la superstition : chaque règle correspond à une étape ci-dessus.</LI>
          <LI>Les conseils sur les mots-clés portent sur le recoupement de vocabulaire, pas sur la densité. Ne revendiquez jamais une compétence que vous n’avez pas.</LI>
          <LI>Rien dans cette chaîne ne vous évalue. Elle vous met sous une forme consultable, ou n’y parvient pas.</LI>
        </UL>

        <Note>
          <strong>Voyez les choses du côté de l’analyseur.</strong> Le{' '}
          <A href="/fr/">vérificateur de CV ATS gratuit</A> propose un onglet <em>Données extraites</em>{' '}
          qui montre exactement ce qui est ressorti de votre fichier — le nom, les coordonnées, les
          liens et chaque poste identifié. Si quelque chose y manque, cela manquera aussi chez
          l’employeur.
        </Note>

        <H2>À lire aussi</H2>
        <UL>
          <LI><A href="/fr/score-ats-cv-cest-quoi">Ce que mesure vraiment un score ATS</A></LI>
          <LI><A href="/fr/verificateur-cv-ats-sans-envoyer-son-cv">Vérificateurs de CV qui n’envoient pas votre CV</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Un ATS peut-il lire un CV à deux colonnes ?',
        a: 'Souvent pas dans le bon ordre. L’extraction du texte reconstitue les lignes d’après les positions sur la page, si bien que deux colonnes peuvent être recousues ligne par ligne, en mêlant un intitulé de poste à une liste de compétences. Une mise en page à une seule colonne évite complètement le problème.',
      },
      {
        q: 'Les ATS lisent-ils les en-têtes et les pieds de page ?',
        a: 'Certains analyseurs ignorent ces zones ou les traitent de façon peu fiable. Gardez votre nom, votre adresse e-mail et votre numéro de téléphone dans le corps de la page, pour qu’ils soient extraits quel que soit l’analyseur.',
      },
      {
        q: 'Cacher des mots-clés en texte blanc sert-il à quelque chose ?',
        a: 'Non. Le texte blanc reste du texte : il est extrait dans le profil analysé que lit le recruteur, où il ressemble à une tentative de manipuler la recherche. N’utilisez le vocabulaire de l’offre que là où vous l’avez réellement mérité.',
      },
    ],
  },

  {
    ...guide('ats-resume-checklist'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Corrigez d’abord cinq points : du texte sélectionnable, votre adresse e-mail dans le corps, une seule colonne, des titres de rubriques standard et une date sur chaque poste. Ils décident si la candidature arrive intacte. Tout le reste décide si elle est trouvée dans une recherche, puis si un humain prend plaisir à la lire.',
    body: (
      <>
        <P>
          Classée par conséquence, pas par habitude. Le premier groupe décide si votre candidature
          arrive tout court ; le dernier, c’est de la finition. Si vous n’avez que dix minutes,
          occupez-vous du premier groupe.
        </P>

        <H2>Critique — si vous les négligez, la candidature risque de ne pas arriver</H2>
        <UL>
          <LI><strong>Le texte est sélectionnable.</strong> Ouvrez le fichier et essayez de surligner une ligne. Si vous n’y arrivez pas, l’analyseur voit une page vide.</LI>
          <LI><strong>Votre adresse e-mail est en texte brut dans le corps.</strong> Pas dans l’en-tête, pas seulement derrière une icône de courrier, pas seulement sous forme de lien.</LI>
          <LI><strong>Une seule colonne.</strong> Les colonnes latérales sont la cause la plus fréquente d’extraction brouillée.</LI>
          <LI><strong>Des titres de rubriques standard.</strong> Expérience, Formation, Compétences, Profil. Ici, le banal l’emporte.</LI>
          <LI><strong>Chaque poste porte des dates.</strong> Mois et année, dans un format cohérent, sur la même ligne que le poste.</LI>
        </UL>

        <H2>Important — elles décident si vous apparaissez dans une recherche</H2>
        <UL>
          <LI><strong>Les intitulés de poste sont reconnaissables.</strong> Si votre titre interne est « Ninja du déploiement », ajoutez à côté l’intitulé courant dans votre métier.</LI>
          <LI><strong>Le vocabulaire de l’offre apparaît</strong> — mais seulement là où vous l’avez honnêtement mérité.</LI>
          <LI><strong>Une rubrique de compétences existe,</strong> en texte simple séparé par des virgules plutôt qu’en graphique de jauges.</LI>
          <LI><strong>Vos liens sont écrits</strong> en texte visible : <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">linkedin.com/in/vous</code>. Un analyseur lit du texte, pas la cible d’un lien.</LI>
          <LI><strong>Aucun texte ne se trouve dans une image ou une zone de texte.</strong></LI>
        </UL>

        <H2>À faire — c’est ce que lit l’humain</H2>
        <UL>
          <LI><strong>Les puces commencent par un verbe.</strong> Dirigé, livré, réduit, reconstruit, piloté.</LI>
          <LI><strong>L’impact est chiffré.</strong> « Fiabilité améliorée » est une affirmation ; « sessions sans crash passées de 96% à 99,5% » est une preuve.</LI>
          <LI><strong>Pas de formules toutes faites.</strong> « Professionnel dynamique et motivé, fort d’une solide expérience » n’apprend rien à un lecteur.</LI>
          <LI><strong>La longueur correspond à votre parcours.</strong> Une page en début de carrière, deux sont normales après une dizaine d’années. Trois demandent une raison.</LI>
          <LI><strong>Le nom du fichier est un nom</strong> — <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">Prenom_Nom_CV.pdf</code>, pas <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">cv_final_v3_VRAI.pdf</code>.</LI>
        </UL>

        <H2>Ce qu’un vérificateur peut contrôler à votre place</H2>
        <P>
          Une grande part de la liste est mécanique, donc un logiciel peut la contrôler. Une autre
          relève du jugement, donc non. Voici la répartition pour le vérificateur de ce site :
        </P>
        <H3>Contrôlé automatiquement</H3>
        <UL>
          <LI>Le texte sélectionnable et un encodage des caractères propre</LI>
          <LI>L’adresse e-mail, le téléphone et un lien de profil visible en texte — il signale aussi un lien qui n’existe que sous forme d’hyperlien caché</LI>
          <LI>Les titres standard pour Expérience, Formation, Compétences et Profil, ainsi que Réalisations, Projets et Certifications</LI>
          <LI>Les dates, la structure en puces et le nombre de pages</LI>
          <LI>Les chiffres dans vos puces, et les puces qui commencent par un verbe</LI>
          <LI>Les formules toutes faites et les affirmations vagues, dans l’onglet distinct « Style rédactionnel »</LI>
          <LI>Le vocabulaire de l’offre, si vous la collez dans l’onglet « Correspondance avec l’offre »</LI>
        </UL>
        <H3>Reste à votre charge</H3>
        <UL>
          <LI>Savoir si une colonne latérale ou une seconde colonne brouille l’ordre de lecture — utilisez le test copier-coller</LI>
          <LI>Savoir si vos intitulés de poste sont ceux qu’un recruteur chercherait</LI>
          <LI>Savoir si chaque mot-clé ajouté est un mot-clé que vous avez mérité</LI>
          <LI>Le nom du fichier</LI>
        </UL>

        <Note>
          <strong>La majeure partie de cette liste se contrôle automatiquement.</strong> Le{' '}
          <A href="/fr/">vérificateur de CV ATS gratuit</A> exécute dans votre navigateur les
          vérifications de lisibilité, de contact, de rubriques, de format et de contenu, et classe
          les échecs selon le nombre de points que coûte chacun — pour que vous corrigiez d’abord ce
          qui coûte le plus. L’onglet « Style rédactionnel » couvre les formules toutes faites et les
          affirmations non chiffrées.
        </Note>

        <H2>À lire aussi</H2>
        <UL>
          <LI><A href="/fr/comment-un-ats-lit-un-cv">Comment un ATS lit un CV</A></LI>
          <LI><A href="/fr/cv-pdf-ou-word-pour-ats">CV en PDF ou en Word : lequel envoyer ?</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Quelle longueur pour un CV compatible ATS ?',
        a: 'Une page en début de carrière, deux pages sont normales après une dizaine d’années. La longueur n’empêche pas un analyseur de lire le fichier, mais les pages au-delà de la deuxième ne sont souvent pas lues par le recruteur.',
      },
      {
        q: 'Les tableaux et les zones de texte sont-ils sûrs dans un CV compatible ATS ?',
        a: 'Évitez-les pour tout ce qui est important. Le texte dans une zone de texte peut être ignoré ou extrait dans le désordre, et les tableaux utilisés pour la mise en page créent les mêmes problèmes d’ordre de lecture que les colonnes. Les paragraphes simples et les listes à puces sont les plus sûrs.',
      },
      {
        q: 'Que corriger d’abord sur mon CV pour un ATS ?',
        a: 'Vérifiez que le texte est sélectionnable, que votre adresse e-mail est dans le corps, que la mise en page est à une seule colonne, que les titres de rubriques sont standard et que chaque poste a des dates. Ces cinq points décident si la candidature est lue correctement tout court.',
      },
    ],
  },

  {
    ...guide('how-to-check-your-cv-score'),
    published: '2026-10-10',
    updated: '2026-10-10',
    summary:
      'Déposez votre PDF ou votre DOCX dans un vérificateur de score de CV, lisez le score et les vérifications échouées, corrigez d’abord les plus coûteuses, puis recommencez. Ici, tout se passe dans votre navigateur : pas d’envoi, pas de compte, pas d’IA. Un score de 85 ou plus signifie que rien d’important ne se perd.',
    body: (
      <>
        <P>
          Un score de CV estime avec quelle netteté un logiciel peut lire votre document. Les
          employeurs utilisent des systèmes de suivi des candidatures (ATS) pour stocker et
          rechercher les candidatures ; un CV mal lu par le système peut donc perdre votre adresse
          e-mail ou vos intitulés de poste. Vérifier le score prend moins d’une minute, et c’est
          gratuit.
        </P>

        <H2>Vérifier le score de son CV en quatre étapes</H2>
        <OL>
          <LI>
            Ouvrez le <A href="/fr/">vérificateur de CV ATS gratuit</A> et choisissez{' '}
            <em>Analyser mon CV</em>.
          </LI>
          <LI>
            Déposez votre CV en PDF ou en DOCX. Le fichier est lu dans votre navigateur et n’est
            envoyé nulle part : vous pouvez donc l’utiliser sans crainte sur le CV que vous destinez
            à un concurrent de votre employeur actuel.
          </LI>
          <LI>
            Lisez le score et la liste des vérifications échouées. Les échecs sont classés selon le
            nombre de points que coûte chacun : le premier élément est donc la correction qui
            rapporte le plus.
          </LI>
          <LI>
            Corrigez les deux ou trois premiers éléments, exportez de nouveau et déposez le nouveau
            fichier. Recommencez jusqu’à ce qu’il ne reste plus rien de coûteux.
          </LI>
        </OL>

        <H2>Ce qu’est un bon score de CV</H2>
        <P>
          Sur ce vérificateur, 85 ou plus signifie qu’un analyseur lira le document proprement. De 70
          à 84, le score est bon et il reste quelques corrections précises. De 50 à 69, le CV demande
          du travail, en général un titre de rubrique ou une coordonnée manquants. En dessous de 50,
          un problème structurel existe, le plus souvent du texte que l’analyseur ne peut pas
          extraire. Ne courez pas après les derniers points : au-delà de 85 environ, le contenu
          compte davantage que le score.
        </P>

        <H2>Que corriger d’abord</H2>
        <UL>
          <LI>Vérifiez que le texte est sélectionnable. Un PDF scanné ou composé d’images obtient un score proche de zéro.</LI>
          <LI>Placez votre adresse e-mail et votre téléphone dans le corps de la page, pas dans un en-tête ni dans une image.</LI>
          <LI>Utilisez des titres standard : Expérience, Formation, Compétences, Profil.</LI>
          <LI>Datez chaque poste, et utilisez de vraies puces.</LI>
        </UL>

        <H2>Ce que le score ne vous dit pas</H2>
        <P>
          Il ne sait pas si vous convenez au poste, et ce n’est pas ce que voit un employeur. Pour
          l’adéquation avec une offre, collez l’annonce dans l’onglet « Correspondance avec l’offre ».
          Pour l’ensemble des règles, lisez{' '}
          <A href="/fr/score-ats-cv-cest-quoi">ce que mesure vraiment un score ATS</A>.
        </P>

        <Note>
          <strong>Essayez-le sur votre propre fichier.</strong> Le{' '}
          <A href="/fr/">vérificateur de CV ATS gratuit</A> est à code source ouvert, fonctionne dans votre
          navigateur et ne demande pas d’adresse e-mail.
        </Note>

        <H2>À lire aussi</H2>
        <UL>
          <LI><A href="/fr/score-ats-cv-cest-quoi">Ce que mesure vraiment un score ATS</A></LI>
          <LI><A href="/fr/checklist-cv-compatible-ats">La checklist du CV compatible ATS</A></LI>
          <LI><A href="/fr/verificateur-cv-ats-sans-envoyer-son-cv">Vérificateurs de CV ATS qui n’envoient pas votre CV</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Comment vérifier gratuitement le score de mon CV ?',
        a: 'Ouvrez un vérificateur de score de CV qui ne demande pas d’inscription, déposez votre PDF ou votre DOCX, et lisez le score et les vérifications échouées. Sur ce site, le fichier est traité dans votre navigateur et n’est jamais envoyé.',
      },
      {
        q: 'Qu’est-ce qu’un bon score de CV ?',
        a: 'Sur ce vérificateur, 85 ou plus signifie que le document est lu proprement. De 70 à 84, le score est bon et il reste quelques corrections. En dessous de 50, cela signifie en général que le texte ne peut pas être extrait.',
      },
      {
        q: 'Le score de CV est-il la même chose que le score ATS ?',
        a: 'En pratique, oui : les deux estiment avec quelle netteté un logiciel de suivi des candidatures peut lire votre document. Il n’existe pas de score standard, donc des vérificateurs différents donnent des chiffres différents.',
      },
    ],
  },
]
