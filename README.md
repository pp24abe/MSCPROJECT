
# 🧩 FormCraft Pro — VS Code Extension

**FormCraft Pro** is a powerful VS Code extension that lets you build, preview, and deploy HTML forms visually — right from your editor. Designed for developers who want to prototype and publish forms instantly using GitHub Pages.

---

## 🚀 Features

- 🔧 **Drag-and-Drop Form Builder** with Bootstrap-styled components
- 🧠 **Auto-Code Generation** – insert the generated HTML into your editor
- 🌐 **GitHub Pages Deployment** – deploy your form with one click
- 🔐 **GitHub OAuth Integration** – secure authentication flow
- 💡 **IntelliSense Snippet Support** – type `fcpro` to auto-insert the last form
- ☁️ **Live Webview Preview** in a sandboxed VS Code panel

---

## 📦 Installation

1. Clone this repo:

```bash
git clone https://github.com/rayanpunnoose002/MSC_PROJECT.git
cd formcraft-pro
````

2. Install dependencies:

```bash
npm install
```

3. Build the Webview frontend:

```bash
cd webview-uii
npm install
npm run build
```

4. Go back and run the extension:

```bash
cd ..
npm run watch
code .
```

5. Press `F5` in VS Code to **launch the extension development host**.

---

## ⚙️ GitHub OAuth Setup

This extension uses GitHub OAuth to allow deploying your forms to repositories via API.

### Prerequisites

1. Register a GitHub OAuth App at: [https://github.com/settings/developers](https://github.com/settings/developers)

2. Use the following settings:

   * **Homepage URL**: `http://localhost:4000`
   * **Authorization callback URL**: `http://localhost:4000/auth/github/callback`

3. Create a `.env` file in your root directory with:

```env
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

4. Start the backend:

```bash
node server.js
```

---

## 🛠 How to Use

1. Open VS Code
2. Run the command: `FormCraft Pro: Open Builder`
3. Drag and drop to build your form
4. Click "Insert to Editor" to add it to your current file
5. Authenticate with GitHub
6. Click **"Deploy to GitHub Pages"** to publish it live

---

## 📄 Deployment URL Example

After deployment, your form will be available at:

```
https://your-github-username.github.io/your-repo-name/
```

The link is shown in the extension and can be copied to clipboard.

---

## 🧪 Technologies Used

* 🔥 React + Bootstrap (Webview UI)
* ⚙️ Node.js + Express (OAuth backend)
* 🧩 VS Code Extension API
* ☁️ GitHub REST API (for deploy)
* 🔐 OAuth 2.0 Authorization Code Flow

---

## 📷 Screenshots

<table>
  <tr>
    <td><strong>Login Page</strong></td>
    <td><strong>Form Builder UI</strong></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/123a631e-85a2-4be7-a2ad-eaa75d2c2fe3" width="400"></td>
    <td><img src="https://github.com/user-attachments/assets/041b55eb-994e-4fb7-80ff-ece2dc1c25c0" width="400"></td>
  </tr>
</table>



---

## 💡 Future Enhancements

* 🔄 Git branch versioning for forms
* 🌍 Firebase or Git-based storage
* 🧩 Plugin/Template support
* 📁 Export as JSON schema

---

## 🤝 Contributors

* 💻 [@pp24abe](https://github.com/pp24abe) – Creator & Maintainer

---

## 📄 License

This project is licensed under the **MIT License**. See `LICENSE` for details.

---

```

---

Would you like:
- A version of this with badges (e.g. GitHub stars, license)?
- An animated `.gif` demo of your extension from a recording?
- To generate it in markdown and save to a file?
```
