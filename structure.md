my-teaching-app/
├── ... (existing config files, public folder)
└── src/
    ├── modules/
    │   ├── auth/                     # Authentication features (signin, signup)
    │   │   ├── components/
    │   │   ├── contexts/
    │   │   ├── hooks/
    │   │   ├── pages/                # Actual page components (e.g., SignInPage.tsx)
    │   │   ├── styles/
    │   │   ├── utils/                # e.g., userAccounts.ts
    │   │   └── __tests__/
    │   ├── core/                     # Shared/common functionalities
    │   │   ├── components/           # e.g., Layout, Header, Toast
    │   │   ├── contexts/             # e.g., ToastContext.tsx
    │   │   ├── hooks/
    │   │   ├── styles/               # e.g., globals.css, themes
    │   │   ├── utils/                # e.g., coursesUtils.ts
    │   │   └── __tests__/
    │   ├── home/                     # For the main landing page
    │   │   ├── pages/                # e.g., HomePage.tsx
    │   │   └── __tests__/
    │   ├── lecturer/                 # Lecturer-specific features
    │   │   ├── components/
    │   │   ├── ... (other feature-specific folders)
    │   │   └── __tests__/
    │   └── tutor/                    # Tutor-specific features
    │       ├── components/
    │       ├── ... (other feature-specific folders)
    │       └── __tests__/
    │
    ├── pages/                        # Next.js pages directory (mainly for routing)
    │   ├── _app.tsx                  # Will import global styles from modules/core/styles
    │   ├── _document.tsx
    │   ├── index.tsx                 # Re-exports from modules/home/pages/HomePage.tsx
    │   ├── signin.tsx                # Re-exports from modules/auth/pages/SignInPage.tsx
    │   ├── signup.tsx                # Re-exports from modules/auth/pages/SignUpPage.tsx
    │   ├── lecturer/
    │   │   └── index.tsx             # Re-exports from modules/lecturer/pages/...
    │   └── tutor/
    │       └── index.tsx             # Re-exports from modules/tutor/pages/...
    │
    ├── styles/                       # Could be largely integrated into modules/core/styles
    │                                 # or module-specific styles.
    │
    └── __tests__/                    # Top-level test configurations.
                                      # Most tests will be co-located within modules.