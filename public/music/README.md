# 🎵 Música do Site

## Arquivo Necessário

**Nome:** `someday.mp3`  
**Artista:** Jonny Easton  
**Fonte:** Uppbeat - Classical Wedding Collection  
**Localização:** `public/music/someday.mp3`

## 📥 Como Adicionar a Música

1. **Faça download da música do Uppbeat:**
   - Acesse: https://uppbeat.io/browse/collection/classical-wedding
   - Procure por "Someday - Jonny Easton"
   - Faça o download do arquivo MP3

2. **Copie o arquivo para o projeto:**
   - Coloque o arquivo `someday.mp3` nesta pasta: `public/music/`
   - Renomeie o arquivo para `someday.mp3` (tudo minúsculo, sem espaços)

3. **Pronto!** 
   - O site irá carregar a música automaticamente
   - A música tocará em loop no fundo do site

## ⚠️ Importante

- O arquivo deve estar em formato **MP3**
- O nome deve ser exatamente **`someday.mp3`** (minúsculas)
- Tamanho recomendado: menos de 5MB para performance
- Certifique-se de ter os direitos de uso da música

## 🔄 Como Trocar a Música no Futuro

Se quiser trocar por outra música:

1. Coloque o novo arquivo MP3 na pasta `public/music/`
2. Atualize o arquivo `src/components/MusicPlayer.jsx` na linha:
   ```javascript
   const audioRef = useRef(new Audio('/music/NOME-DO-ARQUIVO.mp3'));
   ```

---

**Criado em:** 24/11/2025  
**Projeto:** Convite de Casamento Binth & Jubílio
