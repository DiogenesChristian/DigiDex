# DigiDex PWA

Projeto acadêmico adaptado para Progressive Web App (PWA).

## Recursos
- Instalável como PWA.
- Interface responsiva para celular e desktop.
- Geolocalização pelo navegador (`navigator.geolocation`).
- Service Worker para cache do App Shell.
- Manifesto PWA com ícones 192x192 e 512x512.
- Consulta à Digi-API para listar e detalhar Digimon.

## Como executar
Para a geolocalização e o Service Worker funcionarem, use HTTPS ou um servidor local.

Exemplo com Python:

```bash
python -m http.server 8000
```

Depois abra:

`http://localhost:8000`

## Publicação no GitHub Pages
1. Crie um repositório público no GitHub, por exemplo `digidex-pwa`.
2. Envie todos os arquivos desta pasta para a branch `main`.
3. No GitHub, abra **Settings > Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Selecione `main` e a pasta `/ (root)`.
6. Salve e aguarde a publicação.

A aplicação ficará disponível no endereço do GitHub Pages do repositório.
