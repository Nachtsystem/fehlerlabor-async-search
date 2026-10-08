# JavaScript Race Conditions: alte Suchantworten stoppen

Ein kostenloser deutscher Lernfall von **Fehlerlabor · Maik Raths** für Entwicklerinnen und Entwickler mit Grundkenntnissen in Promises und `async`/`await`.

Eine Suche startet für `bo`, danach für `ber`. Die Antwort für `ber` kommt zuerst. Kurz darauf trifft die ältere Antwort ein und überschreibt das neue Ergebnis. Der Fehler hängt von der Reihenfolge der Antworten ab, auch wenn JavaScript die einzelnen Anweisungen nacheinander ausführt.

Dieses kleine Lehrmodell macht beide Antwortreihenfolgen kontrollierbar: ohne Netzwerk, Timer oder zusätzliche Pakete. Eine Generation entscheidet, welche Suchabsicht noch sichtbar werden darf. Erfolg, Fehler und Ladezustand folgen derselben Regel.

## Ausprobieren

Du brauchst Node.js mit `node:test` und `structuredClone`. Im Ordner der heruntergeladenen Dateien:

```sh
node --test search-lab.test.cjs
```

Die sieben Tests prüfen:

- Der fehlerhafte Ablauf überschreibt tatsächlich das neuere Ergebnis.
- Die korrigierte Suche hält beide Antwortreihenfolgen aus.
- Ein überholter Fehler verändert weder Fehlermeldung noch aktuelle Ladeanzeige.
- Das Leeren der Eingabe entwertet eine laufende Anfrage.
- Nach `dispose()` gibt es keine verspätete Veröffentlichung oder neue Anfrage.
- Ein aktueller Fehler wird angezeigt; die nächste Suche kann sich erholen.
- Eine ungültige Antwort wird zum aktuellen Fehler.

## Die Reihenfolge selbst steuern

Speichere diesen Block als `demo.cjs` neben den beiden Dateien und starte ihn mit `node demo.cjs`:

```js
const { deferred, createSearch } = require('./search-lab.cjs');

async function main() {
  const old = deferred();
  const recent = deferred();
  const lab = createSearch(query => query === 'bo' ? old.promise : recent.promise);
  const first = lab.search('bo');
  const second = lab.search('ber');

  recent.resolve(['Berlin']);
  await second;
  old.resolve(['Bonn']);
  await first;

  console.log(lab.state.results); // ['Berlin']
}

main();
```

`createSearch(load)` gibt `search`, `dispose`, `state` und die Zustandsfolge `history` zurück. `load(query)` liefert ein Promise für ein Array von Ergebnissen. Das Modell schützt den lokalen Suchzustand; es bricht keine Netzwerkanfragen ab und führt kein serverseitiges Rollback aus.

## Erklärung und Übungen

Der [vollständige kostenlose Lernfall](https://fehlerlabor-lernen.maikkathleen.chatgpt.site/?utm_source=github&utm_medium=organic&utm_campaign=fehlerlabor_free_lab) erklärt die Ursache, die Folge `ka → katze → ka` sowie Übungen mit Lösungen. Der Lehrtext und das ausführbare Modell verwenden dieselbe Aktualitätsregel, aber unterschiedliche kleine Schnittstellen.

## Weiterführender Workshop

Wer weitere Fälle mit Text, Code und Tests bearbeiten möchte, findet den eigenen [Fehlerlabor-Selbstlern-Workshop](https://hehlster.gumroad.com/l/fehlerlabor-async-workshop?utm_source=github&utm_medium=organic&utm_campaign=fehlerlabor_free_lab): einmalig **39 € Basispreis**, gegebenenfalls zuzüglich Steuern im Checkout. Sechs JavaScript-Dateien und 26 Prüfungen. Kein Abo; ein Text-/Code-Angebot, kein Videokurs.

Die Dateien in diesem Repository sind der kostenlose Lernfall. Der Workshop ist ein separates Kaufangebot. Werbung für das eigene Produkt.

Code und Lehrmaterial wurden mit generativer KI erstellt und intern technisch geprüft.
