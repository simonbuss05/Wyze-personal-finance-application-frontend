# Wyze — Personal Finance Tracker (Frontend)

A React frontend for the Wyze personal finance dashboard. Connects to the Wyze Spring Boot API and integrates Plaid Link to let users connect multiple bank accounts and view aggregated account balances, transaction history, and spending analytics in one place.

**Live App:** `https://placeholder.vercel.app`  
**Backend Repo:** [wyze-personal-finance-application-backend](https://github.com/simonbuss05/wyze-personal-finance-application-backend)

---

## Tech Stack

- **React 18** — UI framework
- **React Router v6** — client-side routing and protected routes
- **Axios** — HTTP client with JWT interceptor
- **react-plaid-link** — Plaid Link bank connection widget
- **Recharts** — analytics charts and data visualization
- **Context API** — global authentication state

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ConnectBankButton.js   # Plaid Link integration
│   └── ProtectedRoute.js      # Auth-gated route wrapper
├── pages/               # Full page components
│   ├── Login.js
│   ├── Register.js
│   └── Dashboard.js
├── context/             # Global state
│   └── AuthContext.js         # Auth state, login/logout, JWT storage
├── services/            # API layer
│   └── api.js                 # Axios instance with JWT interceptor
└── App.js               # Router and provider setup
```

---

## Authentication Flow

```
1. User registers or logs in
2. Backend returns a JWT
3. JWT stored in localStorage via AuthContext
4. Axios interceptor attaches JWT to every subsequent request
5. ProtectedRoute checks for token — redirects to /login if absent
6. Logout clears token from state and localStorage
```

---

## Plaid Link Flow

```
1. User clicks "Connect a Bank Account"
2. React calls backend /api/plaid/create-link-token
3. link_token stored in state → usePlaidLink hook initializes
4. useEffect detects ready=true → opens Plaid Link widget automatically
5. User authenticates with their bank inside Plaid's secure widget
6. onSuccess fires with public_token
7. React sends public_token to backend /api/plaid/exchange-token
8. Backend syncs accounts and transactions → navigates to dashboard
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- npm
- Wyze backend running on `http://localhost:8080`

### Setup

**1. Clone the repository**
```bash
git clone https://github.com/simonbuss05/wyze-frontend.git
cd wyze-frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment**

Create a `.env` file in the root:
```
REACT_APP_API_URL=http://localhost:8080
```

Update `src/services/api.js` if your backend runs on a different port.

**4. Start the development server**
```bash
npm start
```

App runs on `http://localhost:3000`.

---

## Key Components

### `AuthContext`
Global authentication state using React Context. Stores the JWT token in localStorage so the user stays logged in across page refreshes. Exposes `login(token)`, `logout()`, and `token` to any component via the `useAuth()` hook.

### `ConnectBankButton`
Handles the full Plaid Link flow. Fetches a link token from the backend, passes it to the `usePlaidLink` hook, and opens the widget automatically once initialized. On success sends the public token to the backend and triggers a dashboard refresh.

### `ProtectedRoute`
Wraps any route that requires authentication. Checks for a JWT token in the auth context — if absent redirects to `/login`, otherwise renders the child component.

### `api.js`
Configured Axios instance with base URL and a request interceptor that automatically attaches the JWT from localStorage to the `Authorization` header on every outgoing request.

---

## Deployment

Deployed on [Vercel](https://vercel.com). Connect the GitHub repository in the Vercel dashboard and set the `REACT_APP_API_URL` environment variable to your Railway backend URL. Vercel auto-deploys on every push to main.

---

## Author

Simon Buss — [github.com/simonbuss05](https://github.com/simonbuss05)
