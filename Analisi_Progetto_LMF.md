# Documentazione Tecnica e Funzionale: Progetto LMF (Le Mie Storie)

## 1. Panoramica del Progetto
**LMF (Le Mie Storie)** è un'applicazione web innovativa dedicata alla creazione e alla fruizione di storie e fiabe personalizzate per bambini. Il sistema integra tecnologie di Intelligenza Artificiale per generare contenuti narrativi e visivi unici, offrendo al contempo strumenti di gestione sicura per i genitori e un pannello amministrativo completo.

---

## 2. Stack Tecnologico

### Frontend (`lemiestorie`)
- **Framework**: Next.js 15+ (App Router)
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS & Shadcn UI
- **Librerie Chiave**:
  - `react-pageflip`: Per l'effetto sfogliabile dei libri.
  - `framer-motion`: Per micro-animazioni premium.
  - `lucide-react`: Set di icone moderno.
  - `axios`: Per le chiamate API al backend Laravel.

### Backend (`lmf-be`)
- **Framework**: Laravel 11
- **Auth**: Laravel Sanctum (Autenticazione via token)
- **Database**: SQL (PostgreSQL/MySQL come da migrazioni)
- **Pacchetti Esterni**:
  - `spatie/laravel-activitylog`: Monitoraggio di tutte le azioni utenti e admin.
  - `spatie/laravel-permission`: Gestione dei ruoli (Admin, User).

---

## 3. Funzionalità Principali

### A. Area Utente & Navigazione
- **Dashboard Dinamica**: Accesso rapido alle storie create, alle novità e alla selezione del profilo bambino.
- **Multi-Profilo**: Possibilità di creare profili distinti per ogni bambino (Nome, Età, Preferenze).
- **Ricerca Intelligente**: Filtro e ricerca delle storie all'interno della libreria personale.

### B. Creazione Storie (Core Feature)
1. **Generazione AI**:
   - Integrazione con **Google Gemini** e **OpenAI** per la generazione dei testi.
   - Integrazione con **Replicate** per la generazione di immagini di alta qualità basate sulla narrazione.
2. **Creazione Manuale (Atelier)**:
   - "Laboratorio" dove l'utente può inserire testi, caricare immagini e aggiungere tracce audio.
   - Supporto per capitoli/slides con orientamento personalizzabile (Verticale/Orizzontale).
   - Gestione audio: Background musicale o narrazione vocale.

### C. Visualizzatore Storie (The Magic Book)
- **Flipbook Interactive**: Visualizzazione a libro sfogliabile con animazioni fluide.
- **Manual Story Viewer**: Player ottimizzato per storie create manualmente con supporto slide-by-slide.

### D. Sicurezza: Area Genitori
- **Protezione PIN**: L'accesso alle impostazioni sensibili e alla gestione account è protetto da un PIN a 4 cifre.
- **Reset PIN**: Procedura di sicurezza via email in caso di smarrimento del codice.

---

## 4. Architettura del Backend (Laravel)

### API & Endpoints
Il backend espone una serie di API protette per la comunicazione con il frontend:
- `/api/auth`: Login, registrazione, gestione user.
- `/api/auth/stories`: CRUD completo delle storie.
- `/api/auth/children`: Gestione profili bambini.
- `/api/auth/pin`: Gestione e verifica PIN.

### Database Schema (Entity)
- **Users**: Dati anagrafici, crediti disponibili, PIN, ruoli.
- **Stories**: Titolo, output (JSON con testi/immagini), link audio, crediti usati, modalità creazione (AI/Manual).
- **Children**: Nome, dettagli e relazione con le storie assegnate.
- **Activity Log**: Tracciamento di ogni evento (IP, User Agent, Azione, Dati pre/post).

---

## 5. Area Amministrativa (Admin Dashboard)
Gli amministratori dispongono di strumenti avanzati:
- **Gestione Menu**: Configurazione dinamica dei link del frontend in base ai ruoli.
- **Monitoraggio Storie**: Supervisione di tutte le storie generate nel sistema.
- **Audit Logs**: Visualizzazione dettagliata delle attività di sistema per debugging e sicurezza.
- **Gestione Crediti**: Controllo e assegnazione crediti agli utenti.

---

## 6. Integrazioni AI
Il sistema è predisposto per scalare su diversi provider AI:
- **Testo**: Prompt ingegnerizzati per generare fiabe educative e coinvolgenti.
- **Immagini**: Generazione di copertine e illustrazioni coerenti con il contenuto della storia.

---

*Documento generato il 16 Febbraio 2026*
