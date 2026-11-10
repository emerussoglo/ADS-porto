# ADS Website - Complete Update Implementation Plan

## 1. SITE-WIDE LAYOUT CHANGES
- [x] **SiteChrome.tsx**: Show Header/Footer on ALL pages including `/espace-prive`, `/login`, `/admin`
- [x] Add "Retour à l'accueil" link in header for private space and login pages
- [x] Update motto display consistency across all pages

## 2. PAGE "À PROPOS" (AboutPage.tsx)
- [x] Add motto "Service, Union, Vie et Emploi" with colored badges (Red/Yellow/Green) after hero title
- [x] Fix video section to properly play video (add play button + video element)
- [x] Update "Notre Mission" section with correct motto cards
- [x] Add "Niveaux des ADS" section (Minime, Cadet, Junior with details)
- [x] Add FAQ section with questions/answers
- [x] Add "Documents Officiels" section with downloadable documents
- [x] Add "Nous écrire / Nous contacter" footer matching homepage

## 3. INSCRIPTION PAGE (RegistrationPage.tsx)
- [x] Fix "Première Inscription" button bug - ensure clicking advances from step 2
- [x] Verify admin approval workflow (status "pending" → admin validates via /admin/membership)

## 4. ESPACE PRIVÉ LAYOUT (PrivateSpaceLayout.tsx)
- [x] Update motto to "Service, Union, Vie et Emploi" with correct colors

## 5. LOGIN PAGE (LoginPage.tsx)
- [x] Add "Retour à l'accueil" button/link
- [x] Fix motto display to match site colors

## 6. AGENDA PAGE (AgendaPage.tsx)
- [x] Add category filter tabs: Tout, Formation, Réunion, Célébration, Camp, Social
- [x] Events should have category field and appear in both specific category and "Tout"
- [x] Filter by category

## 7. FORMATION PAGE (LearningPage.tsx + MemberTrainingsPage.tsx)
- [x] Add statistics header: total formations, participants, documents, avis
- [x] Add filter navigation: Junior, Cadet, Minime, Spirituel, Général, Documents, Avis & Témoignages

## 8. CSS UPDATES
- [x] Add new CSS classes for motto badges, FAQ accordion, document downloads, category filters, statistics cards
- [x] Ensure consistent color scheme: Service=Red, Union=Yellow/Gold, Vie et Emploi=Green

## 9. API/DATABASE UPDATES
- [x] Add category field to events schema if needed
- [x] Add category/training type field to trainings schema if needed
- [x] Ensure admin can manage categories

---

**All major features implemented!** 🎉