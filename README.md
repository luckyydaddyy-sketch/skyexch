# Sky UI - Full Stack Project Setup & Deployment Guide

This document contains instructions on how to run the three projects (`Node Backend`, `AdminPenal`, and `skyexchange`) locally as well as how to deploy them on a production server using PM2 and Nginx.

## 🚀 1. Running the Projects Locally

Before starting, ensure you have **Node.js** and **npm** installed on your system.
Also, make sure you run `npm install` inside each of the three directories before starting them for the first time.

### A. Node Backend
Open a terminal, navigate to the `Node Backend` folder, and start the development server.
```bash
cd "Node Backend"
npm install
npm run dev
```
*The backend server will run on port `3001` (as per the `.env` file).*

### B. AdminPenal (React App)
Open a new terminal, navigate to the `AdminPenal` folder, and start the app.
```bash
cd AdminPenal
npm install --legacy-peer-deps
npm start
```
*The Admin Panel will typically run on port `3000`.*

### C. Skyexchange (React App)
Open a third terminal, navigate to the `skyexchange` folder, and start it.
```bash
cd skyexchange
npm install --legacy-peer-deps
npm run start:port
```
*The Skyexchange frontend will run on port `3006`.*

---

## 🌍 2. Deploying on a Production Server (Ubuntu/Debian)

### Prerequisites on the Server:
1. Node.js & npm
2. PM2 (Process Manager for Node.js) -> `npm install -g pm2`
3. Nginx -> `sudo apt install nginx`
4. MongoDB (if the database is hosted locally on the same server)

### Step 1: Deploying the Node Backend (API)
We will use PM2 to keep the Node backend running in the background.

```bash
cd /path/to/your/project/"Node Backend"
npm install
pm2 start index.js --name "sky-node-backend"
pm2 save
pm2 startup
```

### Step 2: Building the React Apps
For production, we need to create optimized production builds of the React frontends.

**For AdminPenal:**
```bash
cd /path/to/your/project/AdminPenal
npm install --legacy-peer-deps
npm run build
```
*(This generates a `build` folder inside `AdminPenal`)*

**For Skyexchange:**
```bash
cd /path/to/your/project/skyexchange
npm install --legacy-peer-deps
npm run build
```
*(This generates a `build` folder inside `skyexchange`)*

---

### Step 3: Nginx Configuration

You need to configure Nginx to serve the React static files and proxy API requests to the Node backend.

Create a new Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/skyproject
```

Paste the following configuration (replace `your_domain.com`, `admin.your_domain.com`, and the `/path/to/your/project/` with your actual server paths and domains):

```nginx
# ----------------------------------------
# 1. Skyexchange Frontend (Main Domain)
# ----------------------------------------
server {
    listen 80;
    server_name your_domain.com www.your_domain.com; # Add your actual domain here

    root /path/to/your/project/skyexchange/build; # Update this path!
    index index.html index.htm;

    # Serve React App
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API Requests to Node Backend
    location /api/ {
        proxy_pass http://127.0.0.1:3001/; # Node.js backend port
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# ----------------------------------------
# 2. AdminPenal Frontend (Subdomain)
# ----------------------------------------
server {
    listen 80;
    server_name admin.your_domain.com; # Add your Admin domain/subdomain here

    root /path/to/your/project/AdminPenal/build; # Update this path!
    index index.html index.htm;

    # Serve React App
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Step 4: Enable Nginx Site and Restart

Enable the site configuration by creating a symlink:
```bash
sudo ln -s /etc/nginx/sites-available/skyproject /etc/nginx/sites-enabled/
```

Test Nginx configuration for syntax errors:
```bash
sudo nginx -t
```

Restart Nginx to apply changes:
```bash
sudo systemctl restart nginx
```

Now, your application is successfully deployed!
