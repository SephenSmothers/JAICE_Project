# JAICE — Job Application Intelligence & Career Enhancement
A clean, focused web application that helps job seekers track applications, stay organized, and get AI-powered insights to move faster and smarter.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technologies](#technologies)  
- [Installation](#installation)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [License](#license)
- [Contributors](#contributors)
- [Project Status](#project-status)
- [Support](#support)
- [Paths](#paths)
- [Known Issues](#known-issues)
- [Roadmap](#roadmap)

## Introduction
JAICE (Job Application Intelligence & Career Enhancement) centralizes your job hunt. Track every application in one place, see what's next at a glance, and (soon) get AI-backed suggestions to improve your odds. 

## Features
- **Smart Application Sorting** — Stage your apps (Applied → Interview → Offer, etc.) and keep momentum.
- **SI-Powered Matching (planned)** — Compare resume vs job post; highlight gaps & suggestions.
- **Personalized Insights (planned)** — Recommendations using skills, experience, and market data.
- **Grit Score(planned)** — A momentum metric to visualize consistency and progress.
- **Notifications** — Fine-grained alerts for interviews, follow-ups, and deadlines.
- **Accessibility First** — Toggles and sensible defaults; designed for clarity and speed. 

## Technologies
### Frontend
- [React + Typescript](https://create-react-app.dev/docs/getting-started)
- [Vite](https://vite.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs/installation/using-vite)

### Backend
- [FastAPI(Python)](https://fastapi.tiangolo.com/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- **Natural Language Processing (NLP)**: [spaCy](https://spacy.io/api/doc) / [scikit-learn](https://scikit-learn.org/stable/) / [Hugging Face Transformers](https://huggingface.co/docs/transformers/en/index)

Tooling: [ESLint](https://eslint.org/docs/latest/), GitHub + [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

## Installation
Open the terminal and run:   

```
# 1. Clone
git clone https://github.com/SephenSmothers/JAICE_Project.git jaice
cd jaice
```
```
# 2. Install dependencies
npm install
```
```
# 3. Run the local dev server
npm run dev
# Local: http://localhost:5173/
```
```
# 4. Run the production ready builds
npm run build
```
```
# Deployment testing
npm run preview
```

The project has been set up with tailwindcss added.
## Development Setup
- **Branching**: Gitflow
>- `main` = release, `development` = integration
- **Commits/Peer Reviews**: small, descriptive commits; Peer Reviews (PRs) require review before merge.
- **Code style**: ESLint
- **Env**: Frontend currently runs without secrets. When API is added, create `.env` with:
```
VITE_API_BASE_URL=http://localhost:8000
```

## Project Structure
*Reflects current repo layout (frontend in progress)*

<details>
    <summary>Click to expand the full project tree</summary>

```text
JAICE_PROJECT/
├─ public/
│  ├─ impact.png
│  ├─ JAICE_logo_inverted.png
│  ├─ JAICE_logo.png
│  ├─ job-application.png
│  ├─ user1.png
│  ├─ user2.png
│  └─ vite.svg
├─ src/
│  └─ client/
│     ├─ app/
│     │  └─ layouts/
│     │     └─ main.tsx
│     ├─ assets/
│     │  ├─ fonts/
│     │  └─ icons/
│     │     └─ react.svg
│     ├─ global-components/
│     │  ├─ button.tsx
│     │  ├─ CheckBoxToggle.tsx
│     │  ├─ DropDownMenu.tsx
│     │  ├─ FloatingInputField.tsx
│     │  ├─ GlobalComponents.md
│     │  ├─ InfoModal.tsx
│     │  ├─ PlaceHolderText.tsx
│     │  ├─ SearchBar.tsx
│     │  └─ SlidingToggle.tsx
│     ├─ global-services/
│     │  └─ router.ts
│     ├─ global-style/
│     │  └─ Global.css
│     └─ pages/
│        ├─ about/
│        ├─ dashboard/
│        ├─ home/
│        ├─ landing/
│        └─ settings/
├─ .gitattributes
├─ .gitignore
├─ eslint.config.js
├─ index.html
├─ package-lock.json
├─ package.json
├─ README.md
├─ tsconfig.app.json
├─ tsconfig.json
├─ tsconfig.node.json
└─ vite.config.ts
```
</details>

## Screenshots
- Landing Page
![Landing - Sign Up](public/screenshots/landing-signup.png)
![Landing - Log In](public/screenshots/landing-login.png)
- About Page
![About - Header](public/screenshots/about-header.png)
![About - Meet the Team](public/screenshots/about-meet-the-team.png)
![About - Our Impact](public/screenshots/about-our-impact.png)

## License
*UPDATES TBD*

## Contributors
|**Name**       |**Role**   |**GitHub**                                       |  
|---------------|-----------|-------------------------------------------------|  
|Antonio Lee Jr | Developer | [Techdudetony](https://github.com/Techdudetony) |
|Maya Henderson | Developer | [Catkus12](https://github.com/catkus12)     |
|Dontai Wilson  | Developer | [djwilson7](https://github.com/djwilson7) |
|Sephen Smothers| Developer | [SephenSmothers](https://github.com/SephenSmothers) |

## Project Status
**Alpha development** on `development`. UI scaffolding is underway, with backend + AI features to follow in upcoming sprints.

## Support
- Open an issue in Github with reproduction steps and screenshots.

## Paths
- **UI work**: `src/pages`, `src/components/Global`, `src/styles/Global.css`
- **Assets**: `public/`, `src/assets`

## Known Issues
*UPDATES TBD*

## Roadmap
- ⬜ Application board (CRUD, stages)
- ⬜ Auth (Sign up / Login)
- ⬜ Notifications (email/in-app)
- ⬜ Resume & Job post parsing (NLP)
- ⬜ Grit Score metric v1
- ⬜ Aanlytics dashboard
- ⬜ Import/Export (CSV)
- ⬜ Calendar integration (interviews)
- ⬜ Recruiter information extraction

