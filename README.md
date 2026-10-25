# Next app

A small Next.js (App Router) todo list, started by Showwork. The list's rules are plain functions in `lib/todos.js` with tests in `test/`; the page is in `app/`.

```
npm ci          # install exactly what package-lock.json says
npm test        # the rules
npm run build   # production build
npm start       # http://localhost:3000
npm run dev     # development server
```

`showwork.json` tells the Showwork pipeline which npm scripts build, test and start the app. The pipeline installs with scripts switched off, builds and tests in a sandbox with no network, and shows the running app in a browser at three screen sizes before a pull request is opened.
