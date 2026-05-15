import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';
import { colors } from '@/constants/theme';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, shrink-to-fit=no, viewport-fit=cover"
        />
        <style dangerouslySetInnerHTML={{ __html: appShellCss }} />

        <title>App do Perito</title>
        <meta name="description" content="Aplicativo de gestão de perícias" />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content={colors.primary} />
        <meta name="application-name" content="App do Perito" />

        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="App do Perito" />
        <meta name="mobile-web-app-capable" content="yes" />

        <ScrollViewStyleReset />
        <script dangerouslySetInnerHTML={{ __html: zoomGuard }} />
        <script dangerouslySetInnerHTML={{ __html: swRegister }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

// =====================================================================
// CSS anti-zoom — três redes de segurança contra zoom não desejado:
//
// 1) Viewport meta (no <head> acima) com user-scalable=no — pega Chrome
//    Android. Ignorado pelo iOS Safari desde a 10 por acessibilidade.
//
// 2) input/textarea/select com font-size: 16px !important — bloqueia o
//    "focus zoom" do iOS Safari, que ocorre sempre que o usuário toca em
//    um <input> com font-size < 16px. O !important é CRÍTICO porque o
//    React Native Web injeta `font-size` inline em cada TextInput (vem do
//    style.fontSize do componente), e inline styles vencem CSS normal.
//    Sem !important, qualquer input com `fontSize: 14` ou `15` no RN traz
//    o bug de volta.
//
// 3) touch-action: pan-x pan-y em html/body — bloqueia pinch-zoom e
//    double-tap-zoom no nível do browser (Android principalmente).
//
// Camada extra em JS (zoomGuard) trata os gestos do iOS que escapam de 1
// a 3.
// =====================================================================
const appShellCss = `
html, body {
  height: 100%;
  margin: 0;
  overscroll-behavior: none;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  touch-action: pan-x pan-y;
}
* {
  -webkit-tap-highlight-color: transparent;
}
input, textarea, select, [contenteditable] {
  font-size: 16px !important;
  -webkit-text-size-adjust: 100% !important;
}
`;

// 4) Quarta rede: bloqueia explicitamente os eventos de gesto multi-touch
//    do iOS (gesturestart/gesturechange/gestureend) — essa é a UNICA
//    forma confiável de impedir pinch-zoom no iOS Safari moderno. Também
//    bloqueia o pinch-zoom de desktop via Ctrl+scroll, que aparece quando
//    se testa no DevTools com viewport mobile.
const zoomGuard = `
(function () {
  if (typeof document === 'undefined') return;
  var prevent = function (e) { e.preventDefault(); };
  document.addEventListener('gesturestart', prevent, { passive: false });
  document.addEventListener('gesturechange', prevent, { passive: false });
  document.addEventListener('gestureend', prevent, { passive: false });
  window.addEventListener('wheel', function (e) {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });
})();
`;

const swRegister = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function (err) {
      console.warn('SW registration failed:', err);
    });
  });
}
`;
