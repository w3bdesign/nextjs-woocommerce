# 🛋️ Roadmapa POC – Wersja do analizy przez AI Agent

**Konfigurator 3D Mebli – Plan realizacji (Ready for AI Analysis)**

_Status: Konfigurator jest na ProductPage, WooCommerce nie postawiony_
_Do przeanalizowania i dostosowania przez AI agent_
_Data: Listopad 2025_

---

## KONTEKST WEJŚCIOWY DLA AI AGENTA

### Stan obecny – RZECZYWISTY

✅ **Wdrożone:**

- Boilerplate Next.js (Render.com, Apollo GraphQL zainstalowany)
- Konfigurator 3D (TypeScript) JUŻ na ProductPage (`pages/products/[slug].tsx`)
- Modele 3D: cabinet i shelf (działające)
- Konfiguracja per-model (wymiary zdefiniowane)
- Lokalne state management (JavaScript variables lub basic React state)
- Domain z Next.js aplikacją (Render.com)

❌ **Nie postawione:**

- WooCommerce na żadnej domenie (domain, hosting, instalacja)
- Integracja Next.js ↔ WooCommerce (brak API connection)
- Przechowywanie konfiguracji (nigdzie się nie zapisuje)
- Payment system
- Analytics
- Account system
- Mobile optimization

### Co nie wiemy dokładnie (Agent powinien zweryfikować)

- Jak dokładnie konfigurator przechowuje stan (localStorage? React context? nothing?)
- Czy Apollo GraphQL jest już połączony z WooCommerce czy tylko zainstalowany?
- Czy domain Next.js aplikacji jest publicznie dostępny?
- Jaki hosting dla WooCommerce (same server? managed WordPress?)

---

## ZADANIE DLA AI AGENTA

### Instrukcja

Przeanalizuj tę roadmapę POC i dostosuj ją do rzeczywistej sytuacji:

1. **Zidentyfikuj gdzie WooCommerce trzeba postawić w timeline'ie**
   - Kiedy to musi być done przed innymi rzeczami?
   - Czy to dependency dla praktycznie wszystkiego?
   - Czy może być robione równolegle z czymś?

2. **Zidentyfikuj które taski mogą być robione TERAZ** (bez WooCommerce)
   - Co można zrobić na lokalnym Next.js?
   - Jakie rzeczy można mockować do póki WooCommerce nie będzie?

3. **Zidentyfikuj które taski czekają na WooCommerce**
   - Co MUSI czekać na gotowy WooCommerce?
   - W jakiej kolejności robić po postawieniu WooCommerce?

4. **Dostosuj Epic/User Story/Task breakdown**
   - Dodaj Epic dla "Setup WooCommerce" jeśli go brakuje
   - Odrearranguj taski aby odzwierciedlały rzeczywistą kolejność
   - Usuń assumptions o technicznych detalach implementacji

5. **Przygotuj zalecenia:**
   - Jaki jest pierwszy krok?
   - Co robić dzisiaj?
   - Co mogą robić równolegle?

---

## AKTUALNA ROADMAPA (DO ANALIZY)

### FAZA 0: PRZYGOTOWANIE (Dni -3 do 0) – STATUS: ?

**Co trzeba:**

- Postawić WooCommerce na domenie
- Skonfigurować WP GraphQL plugin
- Połączyć Apollo Client z WooCommerce API
- Testować GraphQL queries

**Pytania dla agenta:**

- Czy to powinno być PRZED czy RAZEM z fazą 1?
- Czy można robić to równolegle z integracją konfiguratora?
- Ile to zajmie czasu?

---

### FAZA 1: RDZENNA PĘTLA (Tygodnie 1–3)

**Cel deklarowany:** Konfigurator działa, klient widzi cenę live, dodaje do koszyka.

**Rzeczywisty problem:**

- Konfigurator jest JUŻ na stronie
- Ale nie ma gdzie go przechowywać
- Nie wiadomo jaki jest bieżący mechanizm przechowywania stanu

#### EPIC 1.1: Integracja konfiguratora z ProductPage

**Status:** Konfigurator JUŻ tam jest
**Rzeczywiste zadania:**

- Sprawdzić jak teraz przechowuje się stan konfiguracji
- Jeśli nie ma – dodać jakiś mechanizm (localStorage? React state? global store?)
- Przygotować do wysyłania do WooCommerce (gdy WooCommerce będzie ready)

**Dla agenta:** Co konkretnie trzeba zrobić z konfiguratorem TERAZ? Jakie jest bieżące przechowywanie stanu?

#### EPIC 1.2: Dynamiczna kalkulacja ceny

**Status:** Nieznany
**Pytania:**

- Czy konfigurator już kalkuluje cenę?
- Czy cena zmienia się na stronie gdy zmienia się wymiary?
- Czy mamy pricing table gdzieś zdefiniowaną?

**Dla agenta:** Co dokładnie trzeba zrobić z ceną? Czy to już działa czy nie?

#### EPIC 1.3: Dodaj do koszyka z konfiguracją

**Status:** NIEMOŻLIWE bez WooCommerce
**Problem:** Nie ma gdzie dodać do koszyka
**Zależy od:** WooCommerce postawiony + API connection
**Dla agenta:** Kiedy w timeline'ie to możliwe?

#### EPIC 1.4: Performance & Quality

**Status:** Można robić teraz
**Rzeczywiste zadania:**

- Lighthouse audit konfiguratora (który JUŻ jest)
- Error handling w konfiguratorem
- Mobile gesty (jeśli jeszcze nie są)

**Dla agenta:** Które z tych rzeczy mogą być robione TERAZ bez WooCommerce?

---

### FAZA 2: CHECKOUT & ANALYTICS (Tygodnie 4–7)

**Status:** 100% czekają na WooCommerce

- EPIC 2.1: Checkout flow → CZEKA NA WooCommerce
- EPIC 2.1: Przelewy24 integration → CZEKA NA WooCommerce + checkout

**Dla agenta:** Czy są rzeczy w fazę 2 które można zrobić PRZED WooCommerce?

---

### FAZA 3: OPTYMALIZACJA (Tygodnie 6–7)

**Status:** Połowa czeka, połowa nie

- EPIC 3.1: Mobile gesty → Może być TERAZ (konfigurator JUŻ jest)
- EPIC 3.2: Analytics setup → Częściowo może być teraz (GA4 tracking konfiguratora), ale pełny funnel czeka na WooCommerce

**Dla agenta:** Które zadania w fazie 3 można parallelizować z fazą 1?

---

### FAZA 4: ZACHWYT KLIENTA (Tygodnie 8–9)

**Status:** 100% czeka na WooCommerce + payment system

- EPIC 4.1: Account page → CZEKA NA zamówienia
- EPIC 4.1: Reload configuration → CZEKA NA zamówienia

**Dla agenta:** To jest na koniec albo może być pominięte w POC?

---

### FAZA 5: DECISION (Tydzień 10)

**Status:** Czeka na wszystko

---

## PYTANIA DLA AI AGENTA

### 1. WooCommerce Setup – Kiedy?

- [ ] Czy WooCommerce powinno być Epic 0 (pre-phase 1)?
- [ ] Czy może być Epic 1.0 (na początku fazy 1, równolegle z innymi)?
- [ ] Ile czasu zajmuje postawienie WooCommerce (2 dni? 1 tydzień?)?
- [ ] Jakie są kroki: domain setup → hosting → WordPress install → WP GraphQL plugin → testowanie?

### 2. Co może być robione TERAZ (bez WooCommerce)?

- [ ] Lighthouse audit konfiguratora?
- [ ] Mobile gesty optimization?
- [ ] Error handling w konfiguratorem?
- [ ] Pricing logic (jeśli jeszcze nie ma)?
- [ ] Serialization format dla konfiguracji (przygotowanie)?
- [ ] GA4 setup i tracking konfiguratora?

### 3. Co MUSI czekać na WooCommerce?

- [ ] Add to cart
- [ ] Checkout
- [ ] Payment
- [ ] Order creation
- [ ] Account page
- [ ] All of above?

### 4. Jakie zmiany w roadmapie?

- [ ] Czy Epic 1.1 powinien być DONE (konfigurator JUŻ jest)?
- [ ] Czy Epic 1.2 powinien być przeanalizowany (czy cena działa)?
- [ ] Czy Epic 1.3 powinien być moved do fazy 2 (po WooCommerce)?
- [ ] Czy nowe Epic powinno być: "Setup WooCommerce + API connection"?

### 5. Harmonogram – Co jest realnym timeline'em?

```
Dzisiaj (Day 0): Gdzie jesteśmy DOKŁADNIE?
  - Konfigurator na stronie? ✅ JAK?
  - Stan przechowywania? ❓
  - WooCommerce? ❌ Ile czasu?
  - Pricing logic? ❓

Week 1: Co realnie można zrobić?
  - Setup WooCommerce? (parallel track?)
  - Optimize konfigurator? (teraz?)
  - Mobile gesty? (teraz?)

Week 2-3: Co po WooCommerce?
  - Add to cart?
  - Pricing integration?
  - Checkout flow?
```

---

## ZAŁOŻENIA KTÓRE AGENT POWINIEN ZWERYFIKOWAĆ

❌ **Nie zakładaj:**

- Jak dokładnie stan konfiguratora się przechowuje
- Czy WooCommerce można postawić w 1 dzień
- Jakie są dokładne kroki instalacji WordPress/WP GraphQL
- Jakie są dokładne technical details integracji

✅ **Sprawdź/Zweryfikuj:**

- Jaki jest BIEŻĄCY stan konfiguratora (co dokładnie jest na stronie)?
- Czy Apollo GraphQL jest rzeczywiście podłączony do czegokolwiek czy tylko zainstalowany w zależnościach?
- Jaki jest plan na WooCommerce (domain? hosting? kiedy?)?
- Ile czasu REALNIE zajmie każdy krok?

---

## OUTPUT OCZEKIWANY OD AI AGENTA

1. **Zaktualizowana roadmapa** z uwzględnieniem:
   - WooCommerce setup w odpowiednim miejscu
   - Taski które można robić teraz
   - Taski które czekają
   - Parallelizacja gdzie możliwa

2. **Sprint breakdown** na kolejne 2-3 tygodnie:
   - Day 1-3: Zrób X
   - Week 1: Rób Y równolegle
   - Week 2: Czekaj na Z to będzie ready, zatem zacznij A

3. **Raport o riskach:**
   - Jakie są bottlenecks?
   - Co mogłoby opóźnić plan?
   - Co jest ciąż path to MVP?

4. **Konkretne rekomendacje:**
   - Zamiast "implementuj store" → "sprawdź jak teraz przechowuje się stan"
   - Zamiast "setup Zustand" → "ustaw mechanizm aby konfiguracja nie znikła po refresh"
   - Zamiast "axios call" → "przygotuj strukturę danych do wysłania do WooCommerce"

---

## INFORMACJE O AKTUALNYM SETUP

**Co AI Agent powinien wiedzieć:**

- Repository: https://github.com/w3bdesign/nextjs-woocommerce (customized)
- Deployment: Render.com
- Frontend framework: Next.js 15 + React 18 + TypeScript
- Styling: Tailwind CSS
- State management: Zustand (setup, ale nie czy używany?)
- GraphQL client: Apollo Client (zainstalowany, ale połączony?)
- Konfigurator 3D: Three.js (TypeScript, cabinet + shelf models)
- Models: Już definiują max wymiary per model
- Payment: Nie zainstalowany
- Backend: WooCommerce (NIE POSTAWIONY)

**Czego Agent NIE powinien znać (bo my nie wiemy):**

- Dokładne implementacyjne detale Zustand store
- Dokładne detale Three.js integracji
- Dokładne pliki które trzeba zmienić
- Dokładne SQL queries do WooCommerce

---

## INSTRUKCJA DLA AGENTA W COPILOT

```
Przeanalizuj tę roadmapę POC dla konfiguratora 3D mebli.

Kontekst:
- Konfigurator 3D (Three.js) JUŻ jest na ProductPage
- Next.js 15 + React 18 + TypeScript
- WooCommerce JESZCZE NIE POSTAWIONY na żadnej domenie
- Render.com hosting dla Next.js
- Brak integracji Next.js ↔ WooCommerce

Zadania:
1. Zidentyfikuj gdzie postawienie WooCommerce powinno być w roadmapie
2. Zidentyfikuj które taski mogą być robione teraz (bez WooCommerce)
3. Zidentyfikuj które taski czekają na WooCommerce
4. Dostosuj roadmapę aby była realistyczna dla tej sytuacji
5. Przygotuj zalecenia: co robić dzisiaj? Co równolegle? Co czeka?

Ograniczenia:
- Nie zakładaj techicznych detalów implementacji
- Nie wymyślaj nazwisk funkcji/metod
- Nie zakładaj że WooCommerce można postawić w 1 dzień
- Zweryfikuj wszystkie assumptions

Output:
- Zaktualizowana roadmapa (fazy + epics z uwzględnieniem WooCommerce)
- Sprint plan na tygodnie 1-3
- Lista ryzyk i bottlenecks
- Konkretne rekomendacje: zrób X, potem Y, czekaj na Z
```

---

## PODSUMOWANIE DLA AGENTA

**Rzeczywista sytuacja:**

- Konfigurator jest (Next.js, ProductPage)
- WooCommerce nie ma (trzeba postawić)
- Integracja nie ma (trzeba zrobić)
- Czas czeka na WooCommerce setup

**Zadanie dla agenta:**
Przearrangować roadmapę tak aby była realistyczna i aby nie czekali na WooCommerce z rękami złożonymi przez pierwsze 2-3 tygodnie.

**Sukces agenta:**
Roadmapa która mówi: "Week 1-2 rób X równolegle z WooCommerce setup, Week 3 gdy WooCommerce będzie ready rób Y".

---

**Dokument przygotował:** Senior Product Owner  
**Dla:** AI Agent (Copilot) do analizy i dostosowania  
**Wersja:** 6.0 – Ready for AI Analysis  
**Last updated:** 2025-11-23
