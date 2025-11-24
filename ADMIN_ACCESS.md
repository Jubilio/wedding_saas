# 🔐 Acesso ao Dashboard Administrativo

## URL Secreta

```text
http://localhost:5173/gestao-casamento-2026
```

## Credenciais (Firebase Authentication)

- **Sistema**: Firebase Authentication
- **Email/Senha**: Configure no [Firebase Console](https://console.firebase.google.com/)

## Segurança Implementada

1. ✅ URL não óbvia (`/gestao-casamento-2026`)
2. ✅ Autenticação Firebase (email + senha)
3. ✅ Sessão gerenciada pelo Firebase Auth
4. ✅ Tela de login dedicada
5. ✅ Firestore Rules protegendo dados sensíveis

## Como Criar Usuário Admin

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto `maussetech`
3. Vá em **Authentication** > **Users**
4. Clique em **Add user**
5. Insira email e senha para o administrador

## Logout

O botão de logout está disponível no próprio dashboard (canto superior direito).

## Notas

- ⚠️ **A senha antiga (`BinthJubilio2026`) NÃO funciona mais**
- ✅ Agora usa Firebase Authentication para segurança real
- 🔒 Apenas usuários autenticados podem acessar/modificar RSVPs
- 📝 Qualquer pessoa pode enviar RSVP (público), mas apenas admin pode ver/deletar
