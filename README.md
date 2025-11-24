# Binth & Jubílio - Site de Casamento

Este é o site oficial do casamento de Binth & Jubílio, desenvolvido com React, Vite e Tailwind CSS. O projeto apresenta um design elegante e minimalista, com funcionalidades como RSVP, galeria de fotos e informações sobre o evento.

## 🎨 Identidade Visual

- **Tema:** Elegante Minimalista
- **Cores:** Branco, Dourado Suave (#C8A86A), Preto e Cinza Neutro
- **Fontes:** Playfair Display (Títulos) e Inter (Corpo)

## 🚀 Tecnologias Utilizadas

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Firebase](https://firebase.google.com/) (Opcional para RSVP)

## 🛠️ Instalação e Configuração

1.  **Clone o repositório:**

    ```bash
    git clone <seu-repositorio>
    cd convite
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

## ⚙️ Configuração do Firebase (Opcional)

Para habilitar o salvamento real de RSVPs no banco de dados:

1.  Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2.  Crie um banco de dados **Firestore**.
3.  Crie um arquivo `.env` na raiz do projeto com suas credenciais:
    ```env
    VITE_FIREBASE_API_KEY=sua_api_key
    VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=seu_projeto
    VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=seu_id
    VITE_FIREBASE_APP_ID=seu_app_id
    ```
4.  Descomente as linhas de importação e configuração no arquivo `src/components/RSVPForm.jsx`.

## 📦 Deploy no Netlify

1.  Crie uma conta no [Netlify](https://www.netlify.com/).
2.  Arraste a pasta `dist` (gerada após rodar `npm run build`) para o painel do Netlify OU conecte seu repositório GitHub para deploy contínuo.
3.  Nas configurações de build do Netlify:
    - **Build command:** `npm run build`
    - **Publish directory:** `dist`

## 🖼️ Personalização

- **Imagens:** Substitua as URLs de imagem nos componentes (`Home.jsx`, `Gallery.jsx`) por suas próprias fotos ou coloque arquivos na pasta `public/` e referencie-os.
- **Música:** Substitua a URL da música em `src/components/MusicPlayer.jsx`.
- **Textos:** Edite os textos diretamente nos arquivos das páginas em `src/pages/`.

## 🌐 Domínio Personalizado

Para usar um domínio como `binthandjubilio.com`:

1.  Compre o domínio em um registrador (Namecheap, GoDaddy, etc.).
2.  No painel do Netlify, vá em **Domain Management** > **Add custom domain**.
3.  Siga as instruções de configuração de DNS fornecidas pelo Netlify.

---

Feito com ❤️ para Binth & Jubílio.
