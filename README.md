# DigiDex PWA

Aplicação web progressiva que exibe uma enciclopédia de Digimon consumindo a Digi-API.

**Principais recursos**
- Instalável como PWA (manifest + `serviceWorker`).
- Interface responsiva para celular e desktop.
- Geolocalização via `navigator.geolocation` (opcional, pede permissão ao usuário).
- Service Worker para cache do App Shell (`sw.js`).
- Consulta à Digi-API para listar e ver detalhes de Digimon (`script.js`).

**Arquivos principais**
- `index.html` — estrutura da aplicação e referência ao `manifest.json`.
- `manifest.json` — manifesto PWA (agora usado pela aplicação).
- `manifest.webmanifest` — duplicata antiga do manifesto; não é referenciada pelo código e pode ser removida se desejar.
- `script.js` — lógica do cliente (busca, diálogo de detalhes, geolocalização, instalação PWA, registro do Service Worker).
- `sw.js` — service worker que faz cache do App Shell.
- `styles.css` — estilos da aplicação.
- `icons/` — ícones usados pelo manifesto e favicon.

**Executando localmente (recomendado para testes)**
Use um servidor estático para que o Service Worker e as features de PWA funcionem corretamente.

Exemplo com Node (serve):

```bash
npx serve . -l 5000
```

Ou com Python 3:

```bash
python -m http.server 5000
```

Então abra:

http://localhost:5000

Para testar instalação e Service Worker, prefira HTTPS (Vercel, Netlify, ou outro host que ofereça TLS).

**Deploy**
- Vercel: basta apontar para o repositório e ele fará deploy automático (recomendado).
- GitHub Pages: funciona para sites estáticos, mas o Service Worker pode ter limitações dependendo da configuração.

**Observações sobre arquivos não utilizados**
- `manifest.webmanifest` não é referenciado por `index.html` nem pelo `sw.js` e, portanto, é redundante após a adição de `manifest.json`.
- A pasta `.github/` pode conter workflows; mantenha se houver CI/CD ativo.

Se quiser que eu remova `manifest.webmanifest` ou limpe outros arquivos não utilizados, digo e eu removo e commito as mudanças.
