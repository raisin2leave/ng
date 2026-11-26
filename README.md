# Foodapp

## Konto testowe administratora (Lab 5)

Aplikacja startuje z jednym kontem administratora (dane testowe, tylko do zajęć):

- e-mail: `admin@foodapp.pl`
- hasło: `Admin123!`

W `src/app/data/users.json` zapisany jest wyłącznie skrót (hash bcrypt) hasła, nie samo hasło.
Hasło można zmienić w aplikacji (Panel admina → Użytkownicy → reset hasła).

## Kody rabatowe (Lab 6 — zadanie dodatkowe)

Kod wpisuje się w koszyku. Wielkość liter nie ma znaczenia.

| Kod | Rabat |
|---|---|
| `WITAJ10` | 10% zniżki na produkty |
| `DARMOWADOSTAWA` | darmowa dostawa |
| `MINUS20` | 20 zł zniżki przy zamówieniu od 80 zł |

## Backend API (Lab 7)

Dane restauracji, menu i zamówień pochodzą z lokalnego REST API ([json-server](https://github.com/typicode/json-server) 0.17).
Podczas pracy uruchom **dwa** programy, każdy w osobnym terminalu:

```bash
npm run api
```

```bash
npm start
```

API działa pod adresem `http://localhost:3000`:

```text
GET   /restaurants                (wyszukiwanie: ?name_like=tekst)
GET   /restaurants/:id
GET   /restaurants/:id/menus
GET   /menus/:id/categories
GET   /categories/:id/products
GET   /orders                     (zamówienia klienta: ?userId=...)
POST  /orders
PATCH /orders/:id
```

Panel admina zapisuje zmiany przez API: restauracje (`POST`/`PATCH /restaurants`),
menu wybranej restauracji (przycisk „Menu” w tabeli: `/menus`, `/categories`, `/products`)
i statusy zamówień (`PATCH /orders/:id`). Konta użytkowników zostają w localStorage.

- `api/db.seed.json` — dane startowe (w repozytorium),
- `api/db.json` — kopia robocza, którą zmienia API (np. nowe zamówienia); nie jest w repozytorium,
- `npm run api:reset` — przywraca dane startowe.

To serwer tylko do nauki: nie ma logowania ani zabezpieczeń.

Zadania dodatkowe z Lab 7:

- **retry** — zapytania GET, które nie powiodły się z powodu błędu serwera lub braku połączenia, są automatycznie powtarzane 2 razy (po 1 s i 2 s); dopiero potem pojawia się „Unable to load data.” z przyciskiem Retry,
- **anulowanie nieaktualnych requestów** — nowe wyszukiwanie lub zmiana restauracji przerywa poprzednie, niepotrzebne już zapytanie,
- **debounced search** — wyszukiwarka restauracji pyta API dopiero 300 ms po ostatnim wpisanym znaku,
- **cache danych** — odpowiedzi dla restauracji i menu są pamiętane przez 60 s; każda zmiana (POST/PATCH/DELETE) czyści cache, a zamówienia nie są cache'owane,
- **interceptor HTTP** — retry i cache działają jako interceptory (`src/app/interceptors`), więc obejmują wszystkie zapytania aplikacji.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.24.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
