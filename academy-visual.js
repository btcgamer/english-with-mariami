(() => {
  'use strict';

  /*
   * English with Mariami — Academy
   *
   * This file intentionally does NOT add any visual overlays,
   * 3D letters, cables, backgrounds or animations.
   *
   * The Academy page already contains its own complete visual
   * design inside academy.html.
   *
   * This cleanup only removes the old academy-3d-overlay if
   * an older cached version of the script created it.
   */

  function cleanupOldAcademyOverlay() {
    const overlay = document.getElementById('academy-3d-overlay');

    if (overlay) {
      overlay.remove();
    }

    /*
     * Remove only the style element that belonged to the old
     * Academy 3D overlay, if it was marked/created by the
     * previous script.
     *
     * We intentionally do NOT remove general site styles.
     */
    document.querySelectorAll('style').forEach((style) => {
      const css = style.textContent || '';

      if (
        css.includes('#academy-3d-overlay') &&
        css.includes('.abc3d') &&
        css.includes('@keyframes acfloat')
      ) {
        style.remove();
      }
    });
  }

  /*
   * Run only on Academy.
   */
  if (/\/academy\.html$/i.test(window.location.pathname)) {
    if (document.readyState === 'loading') {
      document.addEventListener(
        'DOMContentLoaded',
        cleanupOldAcademyOverlay,
        { once: true }
      );
    } else {
      cleanupOldAcademyOverlay();
    }
  }
})();
