// Modo claro / oscuro de la página del campamento. Corre antes de que se pinte la página (está en el
// <head> sin defer) para que no se vea un parpadeo del otro modo al cargar.
// Si la persona eligió un modo con el botón sol/luna, se usa ese; si no, el de su celular o compu.
// Es un archivo aparte (no un <script> dentro del HTML) para no depender de 'unsafe-inline' en la CSP.
(function () {
  var elegido = null;
  try {
    elegido = localStorage.getItem('campamento-tema');
  } catch (e) {
    // Sin acceso a localStorage (modo privado estricto): se sigue la preferencia del sistema.
  }
  var oscuro = elegido ? elegido === 'oscuro' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('dark', oscuro);
})();
