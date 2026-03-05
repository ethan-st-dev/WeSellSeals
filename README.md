_Live deployment currently paused to optimize cloud costs while developing SealTank. Please see the High-Definition Video Demo below for a full walkthrough._
# WeSellSeals
 Text Based Interactive RPG Web App showcasing the capabilities of the OPENAI API.
 
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white&labelColor=gray)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white&labelColor=gray)
![ASP.NET](https://img.shields.io/badge/ASP.NET-512BD4?logo=dotnet&logoColor=white&labelColor=gray)
![.NET Core](https://img.shields.io/badge/.NET%20Core-512BD4?logo=dotnet&logoColor=white&labelColor=gray)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&labelColor=gray)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white&labelColor=gray)
 
<p align="center">
  <a href="https://www.youtube.com/embed/KHvLWjJLlnU">
    <img src="https://img.youtube.com/vi/KHvLWjJLlnU/0.jpg" alt="Alt Text" width="100%">
  </a>
</p>

## About The Project
Questhub was created as an exploration into virtualizing the narrative role of a Dungeon Master from the tabletop role-playing game Dungeons & Dragons. By leveraging the OpenAI API as a foundation, the project became an opportunity to push the boundaries of large language models while layering in custom backend logic to guide structure, continuity, and player agency. Beyond being a storytelling platform, Questhub served as a hands-on engineering exercise in prompt design, state management, and building controlled AI-driven systems.

### Tech Stack
#### Front-end
Built with React.js and JavaScript (ES6+), utilizing functional components to manage the application's UI and logic.
#### Back-end
Developed with Node.js and Express to handle user authentication and API communication. Utilizes MongoDB Atlas (Cloud) for persistent storage of user profiles and quest history.
#### Libraries, API's & Tools
Integrated the OpenAI API via Axios to transform user tasks into narrative quests through custom prompt engineering. Authentication and sessions managed via JWT/Local Storage for session persistence,
## Technical Deep Dive
### Prompting Logic
During prompting, the OpenAI API is given three things:
#### Role
A system-level role definition that frames the AI as a controlled narrative engine with strict formatting and immersion constraints.
#### Context
Injected session context pulled from persisted quest state to maintain continuity across the play session.
#### Action
the player’s most recent action clearly delimited to prevent instruction bleed. By externalizing memory to the database and selectively reinjecting only relevant story context, the system minimizes token overhead while preserving long-form coherence. This design treats the AI as a stateless text generator, while the backend enforces narrative structure, consistency, and progression logic.
### Technical Challenges
When I originally built QuestHub, I hadn't yet mastered React Context or Redux. As a result, the application relies heavily on passing props down through multiple layers of components to manage the quest data and user state.
#### Lessons
**Maintainability:** I quickly learned how fragile a codebase becomes when a single change in a top-level component requires updating five child components.

**Component Scaling:** Large narrative blocks (the Quest descriptions) created "information density" issues on mobile, leading to cramped layouts.

**Why I kept it this way:** I chose to leave the architecture as-is for this portfolio piece to serve as a benchmark of my progress. It represents a "moment in time" before I adopted modern state management patterns.

#### What I Would Do Differently Today
**Global Store:** Implement Redux Toolkit or Zustand to decouple the quest logic from the UI components.

**Centralized Logic:** Use React Context specifically for theme and user authentication to keep the component tree clean.

**Mobile-First Workflow:** Instead of scaling down from a 27-inch monitor, I would start with a 390px viewport. Designing for the smallest screen first forces you to prioritize the most important information.
