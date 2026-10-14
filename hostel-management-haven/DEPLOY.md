# Haven ko live karna (Render, Vercel, Netlify)

Haven ko do hisso me chalana padta hai: **database** (MongoDB Atlas) aur **server** (Express). Vercel aur Netlify sirf frontend (React) host karte hain, isliye server hamesha **Render** par chalta hai.

## Sabse aasan tarika: sirf Render (ek hi link)
Express khud React app serve karta hai, isliye ek hi service kaafi hai.

### Step 1: MongoDB Atlas (free database)
1. https://www.mongodb.com/atlas par account banao, **free (M0) cluster** banao.
2. **Database Access** me ek user banao (username aur password yaad rakho).
3. **Network Access** me `0.0.0.0/0` (Allow access from anywhere) add karo.
4. **Connect > Drivers** se link copy karo aur `/haven` jodo, jaise:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/haven?retryWrites=true&w=majority`
   (password me `@` ya `#` ho to use URL-encode karo.)

### Step 2: Code GitHub par daalo
1. Naya GitHub repo banao aur is project ko push karo (`.env` aur `node_modules` push nahi hote, `.gitignore` me hain).

### Step 3: Render par deploy
1. https://render.com par GitHub se login karo.
2. **New > Blueprint** chuno, apna repo select karo. `render.yaml` apne aap settings bhar dega.
   (Ya **New > Web Service**: Build Command `npm install --include=dev && npm run build`, Start Command `npm start`.)
3. Environment variables:

| Key | Value |
| --- | --- |
| `MONGODB_URI` | Atlas ka link (Step 1) |
| `HOST` | `0.0.0.0` |
| `TRUST_PROXY` | `1` |
| `NODE_VERSION` | `22` |
| `SEED_DEMO` | `true` (demo data aur demo login) ya `false` (asli use) |
| `WARDEN_EMAIL`, `WARDEN_PASSWORD` | `SEED_DEMO=false` ho to apna warden account (password 8-128 characters) |

4. Deploy hone ke baad `https://<aapka-app>.onrender.com` kholo. Login: `warden@example.com` / `Haven@2026` (demo mode me).

Free plan par service kuch der use na ho to so jati hai; pehla load 30-60 second le sakta hai.

## Frontend Vercel ya Netlify par (optional)
Pehle upar Render deploy karo, uska link `https://<aapka-app>.onrender.com` yaad rakho.

1. `vercel.json` (ya Netlify ke liye `netlify.toml`) kholo aur `YOUR-RENDER-APP.onrender.com` ko apne Render ke naam se badlo.
2. Render me ek aur variable jodo: `APP_ORIGIN` = aapka Vercel/Netlify link (jaise `https://haven.vercel.app`, bina last `/` ke). Isse server us site se aane wale requests allow karta hai.
3. **Vercel:** vercel.com > Add New Project > repo import karo. Settings `vercel.json` se aa jati hain. Deploy dabao.
   **Netlify:** app.netlify.com > Add new site > Import from Git. Settings `netlify.toml` se aa jati hain.
4. Site kholo. `/api` ki requests proxy hokar Render par jati hain, isliye login cookie bina CORS ke chalti hai.

Agar sirf ek link chahiye to Render wala link hi use karo; Vercel/Netlify ki zaroorat nahi.

## Kuch gadbad ho to
- **Login nahi ho raha / 403 "Request origin is not allowed":** `APP_ORIGIN` Vercel/Netlify ke exact link par set karo. Sirf Render link use kar rahe ho to `APP_ORIGIN` khali rakho.
- **Server start nahi hota:** Render logs me "Cannot connect to MongoDB" dikhe to Atlas ka link, password aur Network Access (`0.0.0.0/0`) check karo.
- **Login ke baad turant logout:** `TRUST_PROXY=1` set hai ya nahi dekho.
- **Asli use:** `SEED_DEMO=false` karo, `WARDEN_EMAIL` aur `WARDEN_PASSWORD` set karo.
