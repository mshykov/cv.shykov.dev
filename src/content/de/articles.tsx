// Statische Ratgeberseiten (Deutsch), beim Build von scripts/prerender.mjs zu
// eigenständigem HTML gerendert. Sie liefern kein JavaScript aus.
//
// Sie liegen in src/, damit der Tailwind-Scanner diese Klassennamen sieht. Nicht
// aus src/ verschieben, sonst erscheinen die Ratgeber ohne Styling.
import { A, Code, H2, H3, LI, Note, OL, P, Pre, Table, UL } from '../prose.tsx'
import { rubricRows, sectionRows } from '../tables.ts'
import { GUIDES } from './guides.ts'
import type { Article, Guide } from '../types.ts'
import { de } from '../../i18n/messages/de.ts'

function guide(id: Guide['id']): Guide {
  const meta = GUIDES.find((g) => g.id === id)
  if (!meta) throw new Error(`articles: no entry for "${id}" in guides.ts`)
  return meta
}

/** Interner Link auf einen Ratgeber dieser Sprache. */
const to = (id: Guide['id']) => `/de/${guide(id).slug}`

const RUBRIC_ROWS = rubricRows(de)
const SECTION_ROWS = sectionRows('de', de)

export const ARTICLES: Article[] = [
  {
    ...guide('what-is-an-ats-score'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Ein ATS-Score schätzt, wie sauber Bewerbermanagement-Software Text, Kontaktdaten, Abschnitte und Datumsangaben aus Ihrem Lebenslauf herauslesen kann. Er sagt nichts darüber, ob Sie zur Stelle passen. Ab etwa 85 geht nichts Wichtiges verloren – investieren Sie die Zeit dann in den Inhalt.',
    body: (
      <>
        <P>
          Ein Bewerbermanagementsystem (englisch: Applicant Tracking System, kurz ATS) ist die Software,
          mit der ein Arbeitgeber Bewerbungen entgegennimmt, speichert und durchsucht. Bevor ein
          Recruiter Ihren Lebenslauf liest, liest ihn das System: Es zieht Ihren Namen, Ihre
          Kontaktdaten, Ihre Positionen, Ihre Zeiträume und Ihre Kenntnisse heraus und schreibt sie
          in Datenbankfelder. Ein <strong>ATS-Score</strong> ist eine Schätzung, wie gut dieser
          Schritt gelingt.
        </P>
        <P>
          Das ist eine engere Aussage, als es klingt – und genau darauf kommt es an. Der Score weiß
          nicht, ob Sie für die Stelle geeignet sind. Er misst nur eines: ob das Dokument das Lesen
          durch eine Maschine übersteht.
        </P>

        <H2>Der Mythos, den Sie zuerst vergessen sollten</H2>
        <P>
          Sie haben bestimmt gelesen: <em>„75 % aller Lebensläufe werden von einem ATS aussortiert,
          bevor ein Mensch sie sieht.“</em> Diese Zahl wird seit über zehn Jahren wiederholt und hat
          keine belastbare Quelle. Bewerbermanagementsysteme sind Such- und Ablagewerkzeuge. Sie
          sortieren und filtern nach Kriterien, die ein Recruiter festlegt; sie werfen nicht von
          selbst drei Viertel der Bewerber weg.
        </P>
        <P>
          Das tatsächliche Risiko ist unspektakulärer und lässt sich beheben. Findet ein Parser Ihre
          E-Mail-Adresse nicht, kommt Ihre Bewerbung mit leerem Kontaktfeld an. Kann er Ihre
          Positionen nicht lesen, tauchen Sie in der Suche des Recruiters nach „Teamleiter
          Softwareentwicklung“ nicht auf. Niemand hat Sie abgelehnt – Sie waren nie in der Trefferliste.
        </P>

        <H2>Was ein Score sinnvoll messen kann</H2>
        <P>
          Jeder ehrliche ATS-Score ist eine Heuristik aus wenigen Prüfungen. Auf dieser Seite ist das
          Bewertungsschema fest auf 100 Punkte angelegt und veröffentlicht, sodass Sie genau sehen,
          woher jeder Punkt kommt. In fünf Gruppen:
        </P>
        <UL>
          <LI><strong>Lesbarkeit (25)</strong> – gibt es echten, auswählbaren Text, oder ist die Seite ein Bild?</LI>
          <LI><strong>Kontakt (15)</strong> – E-Mail, Telefon und ein Link, der als sichtbarer Text ausgeschrieben ist.</LI>
          <LI><strong>Abschnitte (35)</strong> – Überschriften, die ein Parser erkennt: Berufserfahrung, Ausbildung, Kenntnisse, Profil.</LI>
          <LI><strong>Format (15)</strong> – Seitenzahl, datierte Stationen, echte Aufzählungsstruktur.</LI>
          <LI><strong>Inhalt (10)</strong> – messbare Ergebnisse und Aufzählungspunkte, die mit einem Verb beginnen.</LI>
        </UL>
        <P>Und Prüfung für Prüfung – diese Tabelle ist genau die, die der Checker ausführt, keine Zusammenfassung davon:</P>
        <Table
          caption="Bewertungsschema des ATS Resume Toolkit, Prüfung für Prüfung"
          head={['Prüfung', 'Gruppe', 'Punkte']}
          rows={RUBRIC_ROWS}
        />
        <P>
          Zwei Details übersieht man leicht. Eine fehlende Telefonnummer oder ein fehlendes Profil
          kostet nur die eigenen Punkte – das sind Warnungen, keine Fehler –, während eine fehlende
          Überschrift für Berufserfahrung, Ausbildung oder Kenntnisse glatt durchfällt. Und die letzte
          Zeile bei den Abschnitten ist ein Bonus: Erfolge bringen 4 Punkte, Projekte 3, Zertifikate 3.
        </P>
        <P>
          Abschnitte haben das größte Gewicht, weil sie aus einem Textblock strukturierte Daten
          machen. Findet ein Parser die Überschrift „Berufserfahrung“, weiß er, dass die Einträge
          darunter Stationen sind. Ohne sie rät er.
        </P>

        <H2>Was kein Score messen kann</H2>
        <UL>
          <LI>Ob Ihre Erfahrung zur Stelle passt. Das ist das Urteil des Recruiters.</LI>
          <LI>Welches ATS der Arbeitgeber einsetzt. Die Anbieter lesen unterschiedlich, und keiner veröffentlicht seine Regeln.</LI>
          <LI>Ob Ihr Text überzeugt. Ein perfekt lesbarer Lebenslauf kann trotzdem langweilig sein.</LI>
        </UL>
        <P>
          Verstehen Sie einen Score ab etwa 85 als „auf dem Weg geht nichts verloren“ und kümmern Sie
          sich dann um den Inhalt. Den letzten paar Punkten hinterherzujagen, ist fast immer vertane Mühe.
        </P>

        <H2>Warum zwei Checker zwei verschiedene Scores liefern</H2>
        <P>
          Es gibt keinen Standard-ATS-Score. Jeder Checker erfindet sein eigenes Schema, gewichtet es
          nach Belieben und verrät – meist – nicht, wie es aussieht. Eine 62 auf der einen und eine 81
          auf der anderen Seite sind kein Widerspruch, sondern zwei verschiedene Tests. Die nützliche
          Frage lautet nie „Welche Zahl stimmt?“, sondern „Welche konkrete Prüfung ist
          durchgefallen, und halte ich sie für wichtig?“. Das lässt sich nur beantworten, wenn die
          Regeln veröffentlicht sind.
        </P>

        <Note>
          <strong>Prüfen Sie Ihren Lebenslauf in wenigen Sekunden.</strong> Der{' '}
          <A href="/de/">kostenlose Lebenslauf ATS Check</A> bewertet ein PDF oder DOCX vollständig in
          Ihrem Browser – die Datei wird nicht hochgeladen, es gibt kein Konto, und es ist kein
          Sprachmodell beteiligt. Die genauen Bewertungsregeln können Sie im öffentlichen Quellcode nachlesen.
        </Note>

        <H2>Weiterlesen</H2>
        <UL>
          <LI><A href={to('how-ats-parsing-works')}>So funktioniert das Parsing von Lebensläufen im ATS</A></LI>
          <LI><A href={to('ats-resume-checklist')}>Die ATS-Checkliste für Ihren Lebenslauf</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Was ist ein guter ATS-Score?',
        a: 'Bei diesem Checker bedeutet ein Wert ab 85, dass ein Parser das Dokument sauber liest und nichts Wichtiges verloren geht. 70 bis 84 ist gut, mit ein paar konkreten Korrekturen. 50 bis 69 braucht Nacharbeit, meist wegen einer fehlenden Abschnittsüberschrift oder Kontaktangabe. Unter 50 stimmt strukturell etwas nicht, meist weil sich der Text nicht extrahieren lässt.',
      },
      {
        q: 'Sehen Arbeitgeber meinen ATS-Score?',
        a: 'Einen Score von einem Checker wie diesem nicht. Er wird auf Ihrem Gerät berechnet und nirgendwohin gesendet. Das System des Arbeitgebers kann Bewerbungen nach der Stelle sortieren, aber diese Sortierung folgt seinen eigenen Regeln und den Suchbegriffen des Recruiters, nicht einem Score von Dritten.',
      },
      {
        q: 'Warum bekommt mein Lebenslauf bei jedem Checker einen anderen Score?',
        a: 'Weil es keinen Standard gibt. Jeder Checker legt eigene Prüfungen und Gewichte fest. Vergleichen Sie die einzelnen durchgefallenen Prüfungen, nicht die Gesamtzahlen.',
      },
      {
        q: 'Stimmt es, dass 75 % der Lebensläufe von einem ATS aussortiert werden?',
        a: 'Diese Zahl kursiert seit über zehn Jahren ohne belastbare Quelle. Bewerbermanagementsysteme speichern und durchsuchen Bewerbungen; die Filter legen Recruiter fest. Das tatsächliche Risiko ist ein Lebenslauf, den der Parser falsch liest und der deshalb in der Suche des Recruiters nicht auftaucht.',
      },
    ],
  },

  {
    ...guide('ats-checker-without-upload'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Ein Browser kann eine PDF- oder DOCX-Datei lesen und bewerten, ohne sie irgendwohin zu senden – ein Upload ist also eine Designentscheidung, keine technische Notwendigkeit. Einen Checker können Sie in unter einer Minute selbst prüfen: Netzwerk-Ansicht der Browser-Entwicklertools öffnen, Lebenslauf hineinziehen und nach einer Anfrage suchen, die die Datei enthält.',
    body: (
      <>
        <P>
          Ein Lebenslauf gehört zu den sensibelsten Dokumenten, die die meisten Menschen besitzen. Er
          enthält Ihren vollständigen Namen, Ihre private E-Mail-Adresse, Ihre Telefonnummer, Ihren
          Wohnort und eine lückenlose Übersicht, wer Sie beschäftigt hat. Ihn einer Website zu
          übergeben, ist eine größere Entscheidung, als es sich anfühlt.
        </P>
        <P>
          Besonders wichtig ist das in der Lage, in der die meisten zum Lebenslauf-Checker greifen:{' '}
          <strong>Sie bewerben sich, während Sie noch angestellt sind.</strong> Dann ist das Dokument
          nicht nur ein Datensatz, sondern ein Beleg für Ihre Absicht.
        </P>

        <H2>Was „Lebenslauf hochladen“ meistens bedeutet</H2>
        <P>
          Wenn ein Tool Sie zum Hochladen auffordert, verlässt die Datei Ihr Gerät und landet auf
          einem Server. Danach ist je nach Anbieter einiges davon üblich und steht oft in den
          Nutzungsbedingungen:
        </P>
        <UL>
          <LI>Die Datei wird gespeichert, mitunter unbefristet, und mit dem von Ihnen angelegten Konto verknüpft.</LI>
          <LI>Der Text geht zur Bewertung oder Umformulierung an ein externes Sprachmodell.</LI>
          <LI>Die registrierte E-Mail-Adresse landet in einer Marketing-Strecke.</LI>
          <LI>Aggregierte Daten fließen in ein Recruiting-Produkt, das an Arbeitgeber verkauft wird.</LI>
        </UL>
        <P>
          Nichts davon ist zwangsläufig böswillig. Es ist schlicht das Geschäftsmodell: Die Prüfung
          ist kostenlos, weil Sie und Ihr Dokument das Produkt sind. Man sollte es aber wissen, bevor
          man klickt, nicht danach.
        </P>

        <H2>Die Fragen, die Sie jedem Checker stellen sollten</H2>
        <UL>
          <LI><strong>Verlässt die Datei das Gerät?</strong> Gibt es keinen Upload, erledigen sich die meisten anderen Fragen.</LI>
          <LI><strong>Ist ein Konto nötig?</strong> Eine E-Mail-Hürde dient dazu, die Adresse einzusammeln, nicht dazu, den Score zu verbessern.</LI>
          <LI><strong>Ist die Bewertung deterministisch oder generiert?</strong> Schreibt ein Modell das Feedback, wurde Ihr Lebenslauf an dieses Modell gesendet.</LI>
          <LI><strong>Können Sie die Regeln lesen?</strong> Ein veröffentlichtes Bewertungsschema lässt sich hinterfragen. Ein verborgenes nicht.</LI>
          <LI><strong>Wie sieht der Löschweg aus?</strong> Lautet die Antwort „E-Mail an den Support“, gehen Sie davon aus, dass die Datei bleibt.</LI>
        </UL>

        <H2>Wie eine rein lokale Prüfung funktioniert</H2>
        <P>
          Moderne Browser können eine PDF- oder DOCX-Datei ohne jeden Server lesen. Die Datei wird in
          den Arbeitsspeicher geöffnet, eine JavaScript-Bibliothek extrahiert den Text, die Prüfungen
          laufen über diesen Text, und das Ergebnis wird angezeigt – alles in dem Tab, den Sie ohnehin
          geöffnet haben. Schließen Sie den Tab, ist das Dokument weg.
        </P>
        <P>
          Der Preis dafür ist real und sollte genannt werden: Ein lokaler Checker kann Sie nicht mit
          einer Datenbank anderer Bewerber vergleichen und schreibt Ihre Aufzählungspunkte nicht für
          Sie um. Er kann Ihnen sagen, ob ein Parser das Dokument korrekt liest und welche Zeilen
          schwach sind – und das ist der Teil, der tatsächlich beeinflusst, ob Ihre Bewerbung unversehrt ankommt.
        </P>

        <H2>So prüfen Sie, ob ein Checker wirklich nichts hochlädt</H2>
        <P>
          „Wir speichern Ihre Datei nie“ ist ein Versprechen. Ob die Datei Ihren Rechner überhaupt
          verlässt, können Sie in jedem Desktop-Browser beobachten – oder eben nicht:
        </P>
        <OL>
          <li>Öffnen Sie den Checker und dann die Entwicklertools des Browsers: <Code>F12</Code> unter Windows und Linux, <Code>⌥ ⌘ I</Code> auf dem Mac.</li>
          <li>Wechseln Sie auf den Reiter <strong>Netzwerk</strong> (englisch „Network“) und leeren Sie die Liste, damit nur neue Anfragen erscheinen.</li>
          <li>Ziehen Sie Ihren Lebenslauf in den Checker und warten Sie auf das Ergebnis.</li>
          <li>
            Sehen Sie die neuen Anfragen durch. Ein Upload ist eine <Code>POST</Code>- oder{' '}
            <Code>PUT</Code>-Anfrage, deren Größe ungefähr der Ihrer Datei entspricht. Skripte und
            Schriften, die die Seite für sich selbst lädt, sind keine Uploads.
          </li>
        </OL>
        <P>
          Trägt keine Anfrage die Datei, hat die Datei das Gerät nicht verlassen. Das funktioniert auf
          jeder Seite, auch auf dieser – und genau das ist der Punkt: Die Aussage soll für Sie
          überprüfbar sein, nicht Vertrauenssache.
        </P>
        <P>
          Diese Seite bietet eine zweite, vom Browser durchgesetzte Absicherung. Ihr
          Content-Security-Policy-Header setzt <Code>connect-src 'self' data: blob:</Code>. Das heißt:
          Der Browser selbst verweigert jede Netzwerkverbindung zu einer anderen Domain, und die eine
          Domain, mit der er sprechen darf, liefert nur statische Dateien aus – es gibt keinen
          Endpunkt, der einen Lebenslauf entgegennehmen könnte.
        </P>

        <Note>
          <strong>Diese Seite ist von der lokalen Sorte.</strong> Der{' '}
          <A href="/de/">kostenlose Lebenslauf ATS Check</A> liest Ihr PDF oder DOCX im Browser mit{' '}
          <code className="rounded bg-white px-1 py-0.5 text-[13px] text-stone-800">pdf.js</code> und{' '}
          <code className="rounded bg-white px-1 py-0.5 text-[13px] text-stone-800">mammoth</code>,
          bewertet es nach festen Regeln und hat kein Backend, das eine Datei empfangen könnte. Der
          Code steht unter der MIT-Lizenz, die Aussage ist also nachprüfbar statt nur versprochen.
          Für Leser, denen der Datenschutz wichtig ist, gilt damit sachlich: Die Verarbeitung läuft in
          Ihrem Browser, es wird nichts gesendet. Das ist eine technische Eigenschaft, die Sie wie
          oben beschrieben selbst prüfen können, keine rechtliche Bewertung.
        </Note>

        <H2>Weiterlesen</H2>
        <UL>
          <LI><A href={to('what-is-an-ats-score')}>Was ein ATS-Score wirklich misst</A></LI>
          <LI><A href={to('pdf-or-docx-for-ats')}>PDF oder DOCX: Was sollten Sie senden?</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Ist es sicher, meinen Lebenslauf zu einem Online-Checker hochzuladen?',
        a: 'Das hängt davon ab, was mit der Datei geschieht – und das steht meist nur in den Nutzungsbedingungen. Hochgeladene Lebensläufe werden häufig gespeichert, mit einem Konto verknüpft und mitunter an externe Sprachmodelle gesendet. Wenn Sie sich bewerben, während Sie angestellt sind, wählen Sie besser einen Checker, der die Datei nie erhält.',
      },
      {
        q: 'Wie kann eine Website meinen Lebenslauf lesen, ohne ihn hochzuladen?',
        a: 'Browser können eine ausgewählte Datei in den eigenen Arbeitsspeicher der Seite öffnen. JavaScript-Bibliotheken wie pdf.js und mammoth extrahieren dann den Text, und die Prüfungen laufen auf Ihrem Gerät. Ein Server wird dafür nicht gebraucht.',
      },
      {
        q: 'Woran erkenne ich, dass ein Lebenslauf-Checker meine Datei nicht hochlädt?',
        a: 'Öffnen Sie die Entwicklertools des Browsers, wechseln Sie auf den Reiter „Netzwerk“, leeren Sie ihn und ziehen Sie dann Ihren Lebenslauf hinein. Ein Upload erscheint als POST- oder PUT-Anfrage in ungefähr der Größe Ihrer Datei. Gibt es keine, ist die Datei auf Ihrem Gerät geblieben.',
      },
    ],
  },

  {
    ...guide('pdf-or-docx-for-ats'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Senden Sie ein textbasiertes PDF, es sei denn, die Bewerbung verlangt ein anderes Format – dann senden Sie genau das Verlangte. Das einzige PDF, das zuverlässig scheitert, enthält keinen echten Text, etwa ein Scan oder ein Export mit in Pfade umgewandelten Schriften; das lässt sich in Sekunden testen.',
    body: (
      <>
        <P>
          Die kurze Antwort: <strong>Senden Sie ein textbasiertes PDF, es sei denn, der Arbeitgeber
          verlangt etwas anderes – dann senden Sie genau das.</strong> Die lange Antwort lohnt zwei
          Minuten, denn der übliche Rat („immer Word, ein ATS kann kein PDF lesen“) ist ein Jahrzehnt veraltet.
        </P>

        <H2>Warum PDF heute die Voreinstellung ist</H2>
        <UL>
          <LI><strong>Es sieht überall gleich aus.</strong> Ein DOCX bricht je nach Schriften und Word-Version beim Empfänger um. Aus Ihrem sorgfältigen Zwei-Seiten-Layout werden leicht drei ausgefranste Seiten.</LI>
          <LI><strong>Moderne Parser kommen damit zurecht.</strong> Textextraktion aus PDF ist ein gelöstes Problem; die großen Systeme unterstützen sie seit Jahren.</LI>
          <LI><strong>Es lässt sich schwerer verfälschen.</strong> Niemand bearbeitet Ihr PDF versehentlich zwischen Hochladen und Sichtung.</LI>
        </UL>

        <H2>Das eine PDF, an dem jedes System scheitert</H2>
        <P>
          Ein PDF ist ein Container. Er kann echten Text enthalten oder ein Bild von Text. Wenn Sie
          aus einem Designprogramm mit in Pfade umgewandelter Schrift exportiert, einen Ausdruck
          eingescannt oder Ihren Lebenslauf als Screenshot in ein PDF gespeichert haben, enthält die
          Datei <em>gar keinen Text</em>. Ein Parser liest sie als leeres Dokument.
        </P>
        <P>
          Der Test dauert drei Sekunden: Öffnen Sie das PDF und versuchen Sie, mit dem Cursor eine
          Textzeile zu markieren. Lässt sie sich nicht markieren, kann sie auch das ATS nicht lesen.
        </P>

        <H2>Ein 30-Sekunden-Test für jedes PDF</H2>
        <P>Dass sich Text markieren lässt, beweist, dass er existiert. Zwei weitere Schritte zeigen, ob er brauchbar herauskommt:</P>
        <OL>
          <li><strong>Eine Zeile markieren.</strong> Wird nichts hervorgehoben, ist die Seite ein Bild. Exportieren Sie erneut aus dem Originaldokument.</li>
          <li>
            <strong>Nach Ihrer E-Mail-Adresse suchen</strong> mit <Code>Strg F</Code> bzw.{' '}
            <Code>⌘ F</Code>. Findet der Viewer sie nicht, findet auch ein Parser sie nicht – oft,
            weil sie in der Kopfzeile, in einem Bild oder in einem Textfeld steht.
          </li>
          <li>
            <strong>Alles markieren, kopieren und in einen reinen Texteditor einfügen</strong> (Editor
            unter Windows, TextEdit im Nur-Text-Modus). Was Sie sehen, entspricht ungefähr dem, was
            ein Parser erhält. Kommen zwei Spalten zeilenweise vermischt heraus oder stehen Ihre
            Positionen weit von ihren Zeiträumen entfernt, beheben Sie das Layout, bevor Sie sich um
            irgendetwas anderes kümmern.
          </li>
        </OL>
        <P>
          Wenn Sie aus Word, Google Docs oder Pages mit der normalen Funktion <em>Als PDF speichern</em>{' '}
          bzw. <em>Als PDF exportieren</em> exportieren, entstehen textbasierte PDFs. Riskant sind „als
          Bild drucken“, Scannen und Designprogramme mit der Option, Text in Pfade umzuwandeln.
        </P>

        <H2>Wann DOCX die richtige Antwort ist</H2>
        <UL>
          <LI><strong>Das Formular verlangt es.</strong> Nennt das Upload-Feld nur <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">.doc/.docx</code>, ist das die Antwort. Überlisten Sie das Formular nicht.</LI>
          <LI><strong>Ein Recruiter hat darum gebeten.</strong> Personalagenturen übertragen Ihren Lebenslauf oft auf die eigene Vorlage, wofür eine bearbeitbare Datei nötig ist.</LI>
          <LI><strong>Der Arbeitgeber nutzt ein älteres System.</strong> Heute selten, aber unschädlich, dem zu folgen.</LI>
        </UL>

        <H2>Was wichtiger ist als die Dateiendung</H2>
        <P>
          Das Format ist die einfachste Entscheidung, die Sie bei Ihrem Lebenslauf treffen. Diese
          Punkte bewirken tatsächlich etwas:
        </P>
        <UL>
          <LI><strong>Eine Spalte.</strong> Mehrspaltige Layouts können in falscher Reihenfolge gelesen werden und zwei unzusammenhängende Zeilen vermischen.</LI>
          <LI><strong>Kein Text in Bildern.</strong> Ein Logo ist in Ordnung; Ihre Position als Grafik nicht.</LI>
          <LI><strong>Keine wichtigen Angaben in Kopf- oder Fußzeile.</strong> Manche Parser überspringen diese Bereiche. Setzen Sie Ihre E-Mail-Adresse in den Haupttext.</LI>
          <LI><strong>Echte Aufzählungszeichen</strong> statt von Hand gesetzter Striche in einer Tabellenzelle.</LI>
          <LI><strong>Ein sinnvoller Dateiname</strong> – <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">Vorname_Nachname_Lebenslauf.pdf</code>. Ein Mensch sieht ihn in einem Ordner mit Hunderten Dateien.</LI>
        </UL>

        <Note>
          <strong>Unsicher, in welche Kategorie Ihre Datei fällt?</strong> Ziehen Sie sie in den{' '}
          <A href="/de/">kostenlosen Lebenslauf ATS Check</A> – er liest PDF und DOCX in Ihrem Browser
          und sagt Ihnen sofort, ob es extrahierbaren Text gibt, wie viele Seiten ein Parser sieht und
          welche Abschnitte er erkennen konnte.
        </Note>

        <H2>Weiterlesen</H2>
        <UL>
          <LI><A href={to('how-ats-parsing-works')}>So funktioniert das Parsing von Lebensläufen im ATS</A></LI>
          <LI><A href={to('ats-resume-checklist')}>Die ATS-Checkliste für Ihren Lebenslauf</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Kann ein ATS einen Lebenslauf als PDF lesen?',
        a: 'Ja, solange das PDF echten Text enthält. Moderne Bewerbermanagementsysteme extrahieren Text aus PDFs routinemäßig. Ein gescanntes oder reines Bild-PDF hat keinen Text, der sich extrahieren ließe, und wirkt wie eine leere Seite.',
      },
      {
        q: 'Sollte ich .doc oder .docx senden?',
        a: 'Bevorzugen Sie .docx, das aktuelle Word-Format, es sei denn, der Arbeitgeber verlangt ausdrücklich .doc. Noch besser ist ein textbasiertes PDF, sofern das Formular Sie nicht auf Word-Dateien beschränkt.',
      },
      {
        q: 'Woran erkenne ich, ob mein PDF textbasiert ist?',
        a: 'Öffnen Sie es und versuchen Sie, mit dem Cursor eine Zeile zu markieren, und suchen Sie dann nach Ihrer E-Mail-Adresse. Lässt sich Text markieren und findet die Suche Ihre E-Mail-Adresse, ist das PDF textbasiert.',
      },
    ],
  },

  {
    ...guide('how-ats-parsing-works'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Ein ATS liest einen Lebenslauf in vier mechanischen Stufen: Es extrahiert den Text, teilt ihn anhand der Überschriften in Abschnitte, zieht Angaben wie E-Mail, Datumsangaben und Positionen heraus und indexiert das Ergebnis für die Suche der Recruiter. Fast jeder Formatierungsrat existiert, weil eine dieser Stufen scheitert.',
    body: (
      <>
        <P>
          Die meisten Lebenslauf-Ratschläge behandeln das Bewerbermanagementsystem wie eine Blackbox
          mit eigener Meinung. Es ist einfacher. Das Parsing läuft in Stufen, jede davon mechanisch,
          und fast jeder echte Formatierungsrat geht darauf zurück, dass eine bestimmte Stufe scheitert.
        </P>

        <H2>Stufe 1 – Textextraktion</H2>
        <P>
          Die Datei wird geöffnet, und die Zeichen werden herausgezogen. Bei DOCX bedeutet das
          überwiegend, XML zu lesen. Bei PDF ist es schwerer: Ein PDF speichert keine Zeilen oder
          Absätze, sondern Textfragmente mit Koordinaten. „Dieses und jenes Fragment stehen in
          derselben Zeile“ zu rekonstruieren, ist Geometrie – und genau hier fallen mehrspaltige
          Layouts auseinander: Zwei Spalten können zu einer unsinnigen Zeile zusammengesetzt werden.
        </P>
        <P>
          So sieht das aus. Ein zweispaltiger Lebenslauf, wie ein Leser ihn sieht, und der Text, den
          ein zeilenweiser Extraktor – auch der dieser Seite – tatsächlich zurückbekommt:
        </P>
        <Pre label="Was der Leser sieht">{`BERUFSERFAHRUNG                   KENNTNISSE
Leiter Entwicklung, Acme GmbH     Kubernetes, Go
Jan. 2020 – heute                 Terraform, AWS`}</Pre>
        <Pre label="Was der Parser erhält">{`BERUFSERFAHRUNG KENNTNISSE
Leiter Entwicklung, Acme GmbH Kubernetes, Go
Jan. 2020 – heute Terraform, AWS`}</Pre>
        <P>
          Jede Zeile ist jetzt ein Zwitter. Die Überschrift Berufserfahrung teilt sich eine Zeile
          mit Kenntnisse, an Ihrer Position hängen zwei Technologien, und auf den Zeitraum folgen
          Cloud-Anbieter. Nichts ging verloren – es wurde nur in falscher Reihenfolge wieder
          zusammengesetzt, und das ist für einen Parser dasselbe.
        </P>
        <P><strong>Scheitert, wenn:</strong> die Seite ein Bild ist, der Text in Pfade umgewandelt wurde oder das Layout mehrspaltig ist.</P>

        <H2>Stufe 2 – Abschnittserkennung</H2>
        <P>
          Der Text wird anhand von Überschriften in Bereiche zerlegt. Deshalb schlägt die langweilige
          Überschrift die kreative: Ein Parser, der gegen eine Liste bekannter Wörter vergleicht,
          findet <em>Berufserfahrung</em>, <em>Beruflicher Werdegang</em> und <em>Werdegang</em>. Er
          findet nicht <em>Wo ich Spuren hinterlassen habe</em>.
        </P>
        <P>
          Konkret: Das sind genau die Überschriften, nach denen der Checker dieser Seite sucht. Er
          akzeptiert eine kurze Zeile – höchstens 45 Zeichen, in beliebiger Groß- und Kleinschreibung –,
          die eine davon enthält; <em>Relevante Berufserfahrung</em> zählt also als Berufserfahrung.
        </P>
        <Table
          caption="Abschnittsüberschriften, die das ATS Resume Toolkit erkennt"
          head={['Abschnitt', 'Akzeptierte Überschriften', 'Punkte']}
          rows={SECTION_ROWS}
        />
        <P>
          Kommerzielle Parser nutzen längere Listen, aber das Prinzip ist dasselbe – und auf keiner
          steht Ihre selbst erfundene Überschrift.
        </P>
        <P><strong>Scheitert, wenn:</strong> Überschriften kreativ, nur durch Farbe abgesetzt oder gar nicht vorhanden sind.</P>

        <H2>Stufe 3 – Extraktion von Angaben</H2>
        <P>
          Innerhalb jedes Abschnitts sucht der Parser nach bestimmten Dingen: Eine E-Mail-Adresse ist
          ein Muster, eine Telefonnummer ist ein Muster, ein Zeitraum markiert den Beginn einer
          Station. Position und Arbeitgeber werden aus der Lage relativ zum Datum abgeleitet.
        </P>
        <P>
          Deshalb sind <strong>Datumsangaben wichtiger, als viele denken</strong>. Eine datierte Zeile
          ist der Anker, der dem Parser sagt: „Hier beginnt eine neue Station.“ Undatierte Stationen
          fallen in das zusammen, was davor stand, und Ihre drei Jahre irgendwo landen im Eintrag des
          vorherigen Arbeitgebers.
        </P>
        <P><strong>Scheitert, wenn:</strong> Daten fehlen, nur als „2 J.“ geschrieben sind oder als grafischer Zeitstrahl gezeichnet wurden.</P>

        <H2>Stufe 4 – Indexierung und Suche</H2>
        <P>
          Die extrahierten Felder wandern in eine Datenbank. Ein Recruiter durchsucht sie dann – nach
          Position, nach Kenntnis, nach Ort. Ihr Lebenslauf wird an dieser Stelle nicht beurteilt, er
          wird <em>abgefragt</em>.
        </P>
        <P>
          Das rückt die Keyword-Frage zurecht. Das Ziel ist nicht, Begriffe einzustreuen, um einem
          Algorithmus zu gefallen. Es geht darum, dass die Wörter, die ein Recruiter plausibel
          eintippen würde, irgendwo vorkommen, wo Sie sie ehrlich verdient haben. Haben Sie
          Kubernetes-Migrationen geleitet und das Wort „Kubernetes“ nie geschrieben, tauchen Sie in
          dieser Trefferliste nicht auf.
        </P>
        <P><strong>Scheitert, wenn:</strong> der Wortschatz Ihres Lebenslaufs und der Wortschatz der Stellenanzeige sich nicht überschneiden.</P>

        <H2>Was daraus folgt</H2>
        <UL>
          <LI>Formatierungsrat ist kein Aberglaube – jede Regel lässt sich einer der Stufen oben zuordnen.</LI>
          <LI>Beim Thema Keywords geht es um gemeinsamen Wortschatz, nicht um Dichte. Behaupten Sie nie eine Kenntnis, die Sie nicht haben.</LI>
          <LI>Nichts in dieser Kette bewertet Sie. Sie bringt Sie in eine durchsuchbare Form – oder eben nicht.</LI>
        </UL>

        <Note>
          <strong>Sehen Sie es aus Sicht des Parsers.</strong> Der{' '}
          <A href="/de/">kostenlose Lebenslauf ATS Check</A> hat einen Reiter <em>{de.analyzer.tabs.data}</em>,
          der genau zeigt, was aus Ihrer Datei herauskam – Name, Kontaktdaten, Links und jede Station,
          die erkannt wurde. Fehlt dort etwas, fehlt es auch beim Arbeitgeber.
        </Note>

        <H2>Weiterlesen</H2>
        <UL>
          <LI><A href={to('what-is-an-ats-score')}>Was ein ATS-Score wirklich misst</A></LI>
          <LI><A href={to('ats-checker-without-upload')}>ATS-Lebenslauf-Check ohne Upload</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Kann ein ATS einen zweispaltigen Lebenslauf lesen?',
        a: 'Oft nicht in der richtigen Reihenfolge. Die Textextraktion baut Zeilen aus Positionen auf der Seite wieder auf, sodass zwei Spalten zeilenweise zusammengesetzt werden können und eine Position mit einer Kenntnisliste vermischt wird. Ein einspaltiges Layout vermeidet das Problem ganz.',
      },
      {
        q: 'Lesen Bewerbermanagementsysteme Kopf- und Fußzeilen?',
        a: 'Manche Parser überspringen diese Bereiche oder behandeln sie unzuverlässig. Setzen Sie Namen, E-Mail-Adresse und Telefonnummer in den Haupttext der Seite, damit sie unabhängig vom Parser extrahiert werden.',
      },
      {
        q: 'Hilft es, Keywords in weißer Schrift zu verstecken?',
        a: 'Nein. Weißer Text ist trotzdem Text: Er wird in das Profil übernommen, das der Recruiter liest, und wirkt dort wie ein Versuch, die Suche zu manipulieren. Verwenden Sie den Wortschatz der Stellenanzeige nur dort, wo Sie ihn sich verdient haben.',
      },
    ],
  },

  {
    ...guide('ats-resume-checklist'),
    published: '2026-08-31',
    updated: '2026-10-10',
    summary:
      'Beheben Sie zuerst fünf Dinge: auswählbaren Text, Ihre E-Mail-Adresse im Haupttext, eine einzige Spalte, Standardüberschriften und ein Datum bei jeder Station. Sie entscheiden, ob die Bewerbung unversehrt ankommt. Alles Weitere entscheidet, ob sie in einer Suche gefunden wird und ob ein Mensch sie gern liest.',
    body: (
      <>
        <P>
          Geordnet nach Folgen, nicht nach Konvention. Die erste Gruppe entscheidet, ob Ihre
          Bewerbung überhaupt ankommt; die letzte ist Feinschliff. Haben Sie nur zehn Minuten, nehmen
          Sie sich die erste Gruppe vor.
        </P>

        <H2>Kritisch – ohne diese Punkte kommt die Bewerbung womöglich nicht an</H2>
        <UL>
          <LI><strong>Der Text ist auswählbar.</strong> Öffnen Sie die Datei und versuchen Sie, eine Zeile zu markieren. Geht das nicht, sieht der Parser eine leere Seite.</LI>
          <LI><strong>Ihre E-Mail-Adresse steht als normaler Text im Haupttext.</strong> Nicht in der Kopfzeile, nicht nur hinter einem Mail-Symbol, nicht nur als Hyperlink.</LI>
          <LI><strong>Eine Spalte.</strong> Seitenleisten sind die häufigste Ursache für durcheinandergeratene Extraktion.</LI>
          <LI><strong>Standardüberschriften.</strong> Berufserfahrung, Ausbildung, Kenntnisse, Profil. Langweilig gewinnt hier.</LI>
          <LI><strong>Jede Station hat Datumsangaben.</strong> Monat und Jahr, einheitlich formatiert, in derselben Zeile wie die Station.</LI>
        </UL>

        <H2>Wichtig – sie entscheiden, ob Sie in einer Suche auftauchen</H2>
        <UL>
          <LI><strong>Positionsbezeichnungen sind erkennbar.</strong> Lautet Ihr interner Titel „Delivery Ninja“, nennen Sie daneben die branchenübliche Bezeichnung.</LI>
          <LI><strong>Der Wortschatz der Stellenanzeige kommt vor</strong> – aber nur dort, wo Sie ihn sich ehrlich verdient haben.</LI>
          <LI><strong>Es gibt einen Kenntnisse-Abschnitt</strong> als schlichter, kommagetrennter Text statt einer Grafik mit Skill-Balken.</LI>
          <LI><strong>Ihre Links sind ausgeschrieben</strong> als sichtbarer Text: <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">linkedin.com/in/ihrname</code>. Ein Parser liest Text, keine Linkziele.</LI>
          <LI><strong>Kein Text steckt in einem Bild oder Textfeld.</strong></LI>
        </UL>

        <H2>Lohnend – das liest der Mensch</H2>
        <UL>
          <LI><strong>Aufzählungspunkte beginnen mit einem Verb.</strong> Leitete, lieferte, senkte, baute um, verantwortete.</LI>
          <LI><strong>Wirkung trägt eine Zahl.</strong> „Zuverlässigkeit verbessert“ ist eine Behauptung; „absturzfreie Sitzungen von 96% auf 99,5% gesteigert“ ist ein Beleg.</LI>
          <LI><strong>Keine Floskeln.</strong> „Ergebnisorientierter Profi mit nachweislichem Erfolg“ sagt einem Leser nichts.</LI>
          <LI><strong>Die Länge passt zur Laufbahn.</strong> Eine Seite am Anfang, zwei sind nach einem Jahrzehnt normal. Drei brauchen einen Grund.</LI>
          <LI><strong>Der Dateiname ist ein Name</strong> – <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">Vorname_Nachname_Lebenslauf.pdf</code>, nicht <code className="rounded bg-stone-100 px-1 py-0.5 text-[13px]">lebenslauf_final_v3_NEU.pdf</code>.</LI>
        </UL>

        <H2>Was ein Checker davon für Sie prüfen kann</H2>
        <P>
          Das meiste auf der Liste ist mechanisch, also kann Software es prüfen. Einiges ist Urteil,
          das kann sie nicht. So ist die Aufteilung beim Checker dieser Seite:
        </P>
        <H3>Automatisch geprüft</H3>
        <UL>
          <LI>Auswählbarer Text und saubere Zeichenkodierung</LI>
          <LI>E-Mail, Telefon und ein Profil-Link als sichtbarer Text – er meldet auch einen Link, der nur als verborgener Hyperlink existiert</LI>
          <LI>Standardüberschriften für Berufserfahrung, Ausbildung, Kenntnisse und Profil sowie Erfolge, Projekte und Zertifikate</LI>
          <LI>Datumsangaben, Aufzählungsstruktur und Seitenzahl</LI>
          <LI>Zahlen in Ihren Aufzählungspunkten und Punkte, die mit einem Verb beginnen</LI>
          <LI>Floskeln und vage Behauptungen, im separaten Reiter {de.analyzer.tabs.style}</LI>
          <LI>Der Wortschatz der Stellenanzeige, wenn Sie die Anzeige in den {de.analyzer.tabs.jd} einfügen</LI>
        </UL>
        <H3>Bleibt Ihre Aufgabe</H3>
        <UL>
          <LI>Ob eine Seitenleiste oder zweite Spalte die Lesereihenfolge durcheinanderbringt – nutzen Sie den Kopieren-und-Einfügen-Test</LI>
          <LI>Ob Ihre Positionsbezeichnungen solche sind, nach denen ein Recruiter sucht</LI>
          <LI>Ob jedes ergänzte Keyword eines ist, das Sie sich verdient haben</LI>
          <LI>Der Dateiname</LI>
        </UL>

        <Note>
          <strong>Das meiste dieser Liste lässt sich automatisch prüfen.</strong> Der{' '}
          <A href="/de/">kostenlose Lebenslauf ATS Check</A> führt die Prüfungen zu Lesbarkeit,
          Kontakt, Abschnitten, Format und Inhalt in Ihrem Browser aus und ordnet die Fehler danach,
          wie viele Punkte jeder kostet – so beheben Sie zuerst die teuren Dinge. Der Reiter{' '}
          {de.analyzer.tabs.style} deckt die Punkte zu Floskeln und nicht belegten Behauptungen ab.
        </Note>

        <H2>Weiterlesen</H2>
        <UL>
          <LI><A href={to('how-ats-parsing-works')}>So funktioniert das Parsing von Lebensläufen im ATS</A></LI>
          <LI><A href={to('pdf-or-docx-for-ats')}>Lebenslauf als PDF oder DOCX: Was sollten Sie senden?</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Wie lang sollte ein ATS-tauglicher Lebenslauf sein?',
        a: 'Eine Seite am Anfang der Laufbahn, zwei Seiten sind nach etwa einem Jahrzehnt normal. Die Länge hindert einen Parser nicht am Lesen der Datei, aber Seiten ab der dritten werden vom Recruiter oft nicht mehr gelesen.',
      },
      {
        q: 'Sind Tabellen und Textfelder in einem ATS-tauglichen Lebenslauf sicher?',
        a: 'Vermeiden Sie sie für alles Wichtige. Text in Textfeldern kann übersprungen oder in falscher Reihenfolge extrahiert werden, und Tabellen für das Layout erzeugen dieselben Reihenfolgeprobleme wie Spalten. Einfache Absätze und Aufzählungslisten sind am sichersten.',
      },
      {
        q: 'Was sollte ich an meinem Lebenslauf für ein ATS zuerst beheben?',
        a: 'Sorgen Sie dafür, dass der Text auswählbar ist, Ihre E-Mail-Adresse im Haupttext steht, das Layout einspaltig ist, die Abschnittsüberschriften Standard sind und jede Station Datumsangaben hat. Diese fünf Punkte entscheiden, ob die Bewerbung überhaupt korrekt gelesen wird.',
      },
    ],
  },

  {
    ...guide('how-to-check-your-cv-score'),
    published: '2026-10-10',
    updated: '2026-10-10',
    summary:
      'Ziehen Sie Ihr PDF oder DOCX in einen CV-Score-Checker, lesen Sie Score und durchgefallene Prüfungen, beheben Sie die teuersten zuerst und prüfen Sie erneut. Hier läuft alles in Ihrem Browser: kein Upload, kein Konto, keine KI. Ein Score ab 85 bedeutet, dass nichts Wichtiges verloren geht.',
    body: (
      <>
        <P>
          Ein CV-Score ist eine Schätzung, wie sauber Software Ihr Dokument lesen kann. Arbeitgeber
          nutzen Bewerbermanagementsysteme (ATS), um Bewerbungen zu speichern und zu durchsuchen; ein
          Lebenslauf, den das System falsch liest, kann ohne Ihre E-Mail-Adresse oder Ihre Positionen
          ankommen. Den Score zu prüfen dauert unter einer Minute und kostet nichts.
        </P>

        <H2>CV-Score in vier Schritten prüfen</H2>
        <OL>
          <LI>
            Öffnen Sie den <A href="/de/">kostenlosen Lebenslauf ATS Check</A> und wählen Sie{' '}
            <em>{de.home.hero.check}</em>.
          </LI>
          <LI>
            Ziehen Sie Ihren Lebenslauf als PDF oder DOCX hinein. Die Datei wird in Ihrem Browser
            gelesen und nirgendwohin gesendet – Sie können das also auch mit dem Lebenslauf tun, den
            Sie an einen Wettbewerber Ihres aktuellen Arbeitgebers schicken.
          </LI>
          <LI>
            Lesen Sie den Score und die Liste der durchgefallenen Prüfungen. Die Fehler sind danach
            geordnet, wie viele Punkte jeder kostet, der erste Eintrag ist also die wertvollste Korrektur.
          </LI>
          <LI>
            Beheben Sie die obersten zwei oder drei Punkte, exportieren Sie erneut und ziehen Sie die
            neue Datei hinein. Wiederholen Sie das, bis nichts Teures mehr übrig ist.
          </LI>
        </OL>

        <H2>Was ein guter CV-Score ist</H2>
        <P>
          Bei diesem Checker bedeutet ein Wert ab 85, dass ein Parser das Dokument sauber liest. 70
          bis 84 ist gut, mit ein paar konkreten Korrekturen. 50 bis 69 braucht Nacharbeit, meist
          wegen einer fehlenden Abschnittsüberschrift oder Kontaktangabe. Unter 50 stimmt strukturell
          etwas nicht, meist weil sich der Text nicht extrahieren lässt. Jagen Sie nicht den letzten
          Punkten hinterher: Ab etwa 85 zählt der Inhalt mehr als der Score.
        </P>

        <H2>Was Sie zuerst beheben sollten</H2>
        <UL>
          <LI>Sorgen Sie dafür, dass der Text auswählbar ist. Ein gescanntes oder reines Bild-PDF erreicht fast null Punkte.</LI>
          <LI>Setzen Sie E-Mail und Telefon in den Haupttext der Seite, nicht in eine Kopfzeile oder ein Bild.</LI>
          <LI>Verwenden Sie Standardüberschriften: Berufserfahrung, Ausbildung, Kenntnisse, Profil.</LI>
          <LI>Versehen Sie jede Station mit Datumsangaben und nutzen Sie echte Aufzählungspunkte.</LI>
        </UL>

        <H2>Was der Score Ihnen nicht sagt</H2>
        <P>
          Er weiß nicht, ob Sie zur Stelle passen, und er ist nicht das, was ein Arbeitgeber sieht.
          Für die Passung fügen Sie die Stellenanzeige in den Keyword-Abgleich ein. Die vollständigen
          Regeln lesen Sie unter{' '}
          <A href={to('what-is-an-ats-score')}>Was ein ATS-Score wirklich misst</A>.
        </P>

        <Note>
          <strong>Probieren Sie es mit Ihrer eigenen Datei.</strong> Der{' '}
          <A href="/de/">kostenlose Lebenslauf ATS Check</A> ist Open Source, läuft in Ihrem Browser
          und verlangt keine E-Mail-Adresse.
        </Note>

        <H2>Weiterlesen</H2>
        <UL>
          <LI><A href={to('what-is-an-ats-score')}>Was ein ATS-Score wirklich misst</A></LI>
          <LI><A href={to('ats-resume-checklist')}>Die ATS-Checkliste für Ihren Lebenslauf</A></LI>
          <LI><A href={to('ats-checker-without-upload')}>ATS-Lebenslauf-Check ohne Upload</A></LI>
        </UL>
      </>
    ),
    faq: [
      {
        q: 'Wie prüfe ich meinen CV-Score kostenlos?',
        a: 'Öffnen Sie einen CV-Score-Checker ohne Anmeldung, ziehen Sie Ihr PDF oder DOCX hinein und lesen Sie Score und durchgefallene Prüfungen. Auf dieser Seite wird die Datei in Ihrem Browser verarbeitet und nie hochgeladen.',
      },
      {
        q: 'Was ist ein guter CV-Score?',
        a: 'Bei diesem Checker bedeutet ein Wert ab 85, dass das Dokument sauber gelesen wird. 70 bis 84 ist gut, mit ein paar Korrekturen. Unter 50 lässt sich der Text meist nicht extrahieren.',
      },
      {
        q: 'Ist ein CV-Score dasselbe wie ein ATS-Score?',
        a: 'In der Praxis ja: Beide schätzen, wie sauber Bewerbermanagement-Software Ihr Dokument lesen kann. Es gibt keinen Standard-Score, deshalb liefern verschiedene Checker unterschiedliche Zahlen.',
      },
    ],
  },
]
