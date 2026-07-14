# Amara Studio

A single-page e-commerce site (storefront + password-protected admin panel) built with React, Vite, Tailwind CSS, Lucide icons, and **Firebase** for a real shared database — products and orders now persist permanently and are visible to every visitor, not just your own browser.

## 1. Set up your free Firebase backend (do this first)

1. Go to **[console.firebase.google.com](https://console.firebase.google.com)** and sign in with a Google account.
2. Click **Add project**, give it a name (e.g. `amaradio-stu`), and finish the setup wizard (you can skip Google Analytics).
3. Once inside the project, click the **`</>`** (Web) icon to register a web app. Give it a nickname and click **Register app**. Firebase shows you a `firebaseConfig` object — keep this tab open, you'll copy values from it in a minute.
4. In the left sidebar, go to **Build > Firestore Database > Create database**. Choose a location close to you, and start in **production mode**.
5. In the left sidebar, go to **Build > Storage > Get started**. Accept the defaults.
6. Go to the **Rules** tab inside both Firestore and Storage, and replace the rules with the ones below, then click **Publish** in each:

   **Firestore rules:**
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read: if true;
         allow write: if true;
       }
     }
   }
   ```

   **Storage rules:**
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read: if true;
         allow write: if true;
       }
     }
   }
   ```

   > ⚠️ These rules make the database and photo storage open to anyone who calls the API directly — fine for a small personal store getting started, but it means someone technical could theoretically write or delete data without going through your site. The admin password screen keeps normal visitors out. When you're ready to lock this down properly, the next step is adding Firebase Authentication and restricting writes to signed-in admins — ask me and I'll wire that up.

7. Open `src/firebase.js` in this project and replace the placeholder values with the real ones from your `firebaseConfig` (step 3):
   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "...",
   };
   ```

That's it — your app now reads and writes to this database.

## 2. Run it on your laptop (VS Code)

**Requirements:** [Node.js](https://nodejs.org) installed (LTS version).

1. Open this folder in VS Code and open a terminal (`` Ctrl+` ``).
2. Install dependencies:
   ```
   npm install
   ```
3. Start the local dev server:
   ```
   npm run dev
   ```
4. Open the printed link (usually `http://localhost:5173`).

The store will start empty. Tap **Admin** (password `amara2026`, change it in `src/App.jsx`), go to **Add Product**, and either add your own items or click **Load demo products** to try it out with sample items.

## 3. Upload it to GitHub

1. Create a free account at [github.com](https://github.com) if needed.
2. Click **+ > New repository**, name it (e.g. `amara-studio`), keep it public, don't add a README, click **Create repository**.
3. In VS Code's terminal:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/amara-studio.git
   git push -u origin main
   ```

## 4. Deploy it for free

### Vercel (recommended)
1. Go to [vercel.com](https://vercel.com), sign up with GitHub.
2. **Add New... > Project**, select your repo.
3. Leave settings as default, click **Deploy**.
4. You'll get a free live link like `amara-studio.vercel.app` — it redeploys automatically every time you push to GitHub.

### Netlify
1. [netlify.com](https://netlify.com), sign up with GitHub.
2. **Add new site > Import an existing project**, choose your repo.
3. Build command: `npm run build` — Publish directory: `dist`.
4. Deploy — you get a free link like `amara-studio.netlify.app`.

Either way, because the data now lives in Firebase (not the browser), your live site and everyone who visits it will share the same real products and orders.

## What's real now vs. what's next

- ✅ Products and orders are saved permanently and shared across every visitor and device.
- ✅ Photos upload from your phone/laptop straight into Firebase Storage.
- ✅ The admin panel updates live — no refresh needed to see a new order come in.
- ⚠️ The admin password is a simple front-end check, not real authentication. Good enough to keep casual visitors out; not bank-grade security.
- ⚠️ There's no payment processing — checkout just records the order details (name, phone, address, items) for you to fulfill manually, same as a "cash on delivery" or "order via WhatsApp" flow.

Free tier limits (Firebase "Spark" plan) are generous for a small local brand — roughly 1GB storage, 10GB/month bandwidth, and 50k database reads/day, all free. You'll get an email from Google well before you'd ever need to pay.
