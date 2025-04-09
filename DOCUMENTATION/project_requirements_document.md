# Helm Web: Focus-Enhancing Chrome Extension

*Project Requirements Document (PRD)*

## 1. Project Overview

Helm Web is a Chrome extension built to help users stay focused by blocking distracting websites, setting daily intentions, and tracking focus time without any special hardware. It brings together the clean, calm aesthetic of apps like Momentum and HELM, offering customizable focus profiles, a dedicated focus session timer, and a custom new tab dashboard. The tool is designed with a simple and intuitive user interface that makes it easy for users to create and manage focus sessions, ensuring that their digital environment supports productivity and a distraction-free mindset.

The extension is being built to empower users to take control of their browsing habits and boost their productivity. By offering features such as site blocking, session tracking, and habit analytics, Helm Web addresses the common problem of digital distraction. Success will be measured by how quickly users can set up a focus profile, enjoy uninterrupted focus sessions, and see clear visual feedback on their progress. The key objectives for Helm Web include a seamless user experience, reliable focus tracking even across browser restarts, and a consistent, minimalist interface across all components (popup, new tab page, and block page).

## 2. In-Scope vs. Out-of-Scope

### In-Scope:

*   **Focus Profiles:**\
    • Users can create up to four profiles with a name, choose between block or allow modes, and add a list of websites to manage.\
    • Profiles can be toggled on/off easily from a popup interface.
*   **Focus Session Timer and Tracking:**\
    • Automatically tracks focus time when a profile is activated.\
    • Persists session data (start time, active profile) so that the session can resume automatically if the user closes and reopens Chrome.
*   **New Tab Dashboard:**\
    • Provides a custom new tab view displaying the active focus session, daily focus statistics, and session timers in a clear and minimalist layout.
*   **Block Page:**\
    • Displays a gentle, motivational message when a user attempts to visit a blocked website, reinforcing their intention to focus.
*   **User Settings and Onboarding:**\
    • Simple onboarding flow with interactive guided walkthroughs, default example profiles, and tooltips to help new users set up their first focus profile. • Persistent storage for site preferences and daily intentions using Chrome’s local storage.

### Out-of-Scope:

*   Advanced AI-driven personalized coaching or in-depth analytics beyond simple daily/weekly focus stats.
*   Multi-device syncing (Chrome Sync API) beyond MVP; this may be considered in future versions.
*   Overly complex analytics (e.g., minute-by-minute logs) or extensive customization options that could clutter the UI.
*   Integration with non-Chrome browsers or other platforms in the initial release.

## 3. User Flow

When a new user installs Helm Web, a brief and friendly onboarding sequence appears in the popup. The onboarding includes a welcome message, a guided walkthrough on creating the first focus profile, and options to use default profiles or set a custom configuration. The user is led through entering a profile name, choosing a block or allow mode, and selecting the websites to block or permit. Once the profile is created, the user is shown how to start their focus session with just one click, set optional daily intentions, and see a quick demo of how their session will be tracked.

After setup, returning users simply open the extension from the browser toolbar to access the central popup interface where they can see all their focus profiles with clear “Start Focus” toggles. Upon starting a focus session, the new tab page replaces Chrome’s default with a minimalist dashboard that shows the active profile, a live focus timer, and daily focus statistics. If the user navigates to a blocked website during a session, they are redirected to a dedicated block page that gently reminds them of their focus intention. At any time during the session, users can pause or end their session via controls in the popup or new tab dashboard, and session data is automatically saved for later review.

## 4. Core Features

*   **Focus Profiles:**\
    • Create and manage up to four focus profiles.\
    • Choose between block mode (blocking distracting sites) or allow mode (only allowing certain sites).\
    • Easily toggle profiles from the popup interface.
*   **Focus Session Timer & Tracking:**\
    • Automatically start the focus timer when a profile is activated.\
    • Persist session start time so that sessions can resume after the browser is closed.\
    • Log focus duration and count blocked attempts for later review.
*   **New Tab Dashboard:**\
    • Custom new tab view displaying the active focus profile, timer, and daily focus statistics.\
    • Clean layout with ample whitespace and subtle progress indicators.
*   **Block Page:**\
    • A custom page that replaces blocked websites with motivational messages and the user’s set intention reminder.\
    • Option for a gentle override if absolutely needed.
*   **User Settings & Onboarding:**\
    • An interactive, guided onboarding process featuring tooltips, default example profiles, and a quick tutorial.\
    • Persistent storage for user preferences using Chrome’s local storage.

## 5. Tech Stack & Tools

*   **Frontend Framework:**\
    • React with TypeScript to build a strongly-typed and modular User Interface.
*   **Bundling Tools:**\
    • Webpack or Vite for asset bundling and optimization, ensuring quick load times.
*   **Chrome Extension Framework:**\
    • Utilizing Chrome Manifest V3 to manage permissions and background tasks securely.
*   **Data Storage:**\
    • Chrome’s local storage for persisting user settings and session data, with potential for Chrome’s Sync API in future updates.
*   **Potential Future Enhancements:**\
    • Integration of AI models (such as GPT-4 or similar) for personalized coaching, although this is not part of the MVP.
*   **IDE/Plugin Integration:**\
    • Cursor (an advanced IDE with AI-powered coding support) for faster development iterations and real-time suggestions.

## 6. Non-Functional Requirements

*   **Performance:**\
    • The extension should load quickly (ideally under 200ms for the popup and new tab dashboard).\
    • Smooth and responsive UI interactions without noticeable lag during operations.
*   **Security:**\
    • Adhere to Chrome Manifest V3 security guidelines to ensure safe handling of permissions and user data.\
    • Data stored in Chrome’s local storage should be handled securely with minimal exposure.
*   **Usability:**\
    • The interface must be intuitive and minimalist, ensuring that even less tech-savvy users can navigate easily through profile creation and session tracking.\
    • Consistent styling across the popup, new tab, and block page for a unified experience.
*   **Scalability:**\
    • While the initial release focuses on local storage and core functionalities, the design should allow for future enhancements like multi-device syncing and deeper analytics.

## 7. Constraints & Assumptions

*   **Constraints:**\
    • The MVP version will use Chrome’s local storage, meaning user data is not synced across devices until later versions.\
    • A maximum of four focus profiles can be created to maintain simplicity and avoid UI clutter.
*   **Assumptions:**\
    • Users have a basic understanding of browser extensions and will quickly adapt to a guided onboarding experience.\
    • The session data is stored locally, and auto-resuming is based on reading a stored session start time unless the user explicitly ends the session.\
    • The design inspiration from HELM and Momentum is well-received by users looking for a minimalistic, premium feel.

## 8. Known Issues & Potential Pitfalls

*   **Session Accuracy:**\
    • There is a potential risk of inaccurate session tracking if a user closes the browser unexpectedly. To mitigate this, the session's start time is stored persistently so that it can resume accurately after reopening.
*   **Browser Compatibility:**\
    • Ensure that Chrome Manifest V3 and local storage APIs are used correctly to avoid compatibility issues with future versions of Chrome or other Chromium-based browsers.
*   **User Onboarding Clarity:**\
    • The onboarding process must be concise and clear. Overcomplicating the guided walkthrough could overwhelm users. To address this, ensure that tooltips and modals are minimal and offer an option to skip.
*   **UI Consistency:**\
    • Maintaining a consistent look and feel across the popup, new tab dashboard, and block page might be challenging. Regular design reviews and the use of shared component libraries can help maintain a unified style.
*   **Performance Issues During Extensions Update:**\
    • As the extension grows (especially if future AI integrations are added), performance could degrade. Plan to iteratively optimize the UI and background scripts to keep load times under the specified targets.

This PRD serves as the main reference document to ensure that the subsequent technical documents, such as the Tech Stack Document, Frontend Guidelines, Backend Structure, and App Flow Structure, are generated with full clarity and minimal ambiguity. Every section has been carefully outlined to provide a comprehensive understanding of Helm Web's vision, ensuring that the focus remains on enhancing user productivity through a clean, streamlined, and distraction-free experience.
