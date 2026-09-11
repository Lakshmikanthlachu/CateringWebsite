(function () {
  'use strict';

  // Static ultra-HD portrait (see gen_mascot_v4.py) — no blinking, no frames.
  // Only the iris/pupil are drawn dynamically on top, tracking the cursor.
  var IMG_SRC = 'assets/mascot/face.webp';
  var IMG_SIZE = 1440;

  // Geometry baked into face.webp — keep in sync with gen_mascot_v4.py.
  var CX = 720, CY = 804;
  var EYE_DX = 168, EYE_CY = 906;
  var EYE_W = 192, EYE_H = 210;

  var IRIS_R = 46;
  var IRIS_OUTER = '#3a1e1b';
  var IRIS_INNER = '#70452e';
  var PUPIL_COLOR = '#1c0f0d';
  var MAX_SHIFT_X = EYE_W / 2 - IRIS_R - 10;
  var MAX_SHIFT_Y = EYE_H / 2 - IRIS_R - 16;
  var EASE = 0.16;

  function init() {
    var canvas = document.getElementById('mascotCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var wrap = canvas.closest('.hero-mascot');
    var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    var ready = false;
    var visible = true;
    var running = false;
    var target = { x: 0, y: 0 };
    var current = { x: 0, y: 0 };

    var img = new Image();
    img.onload = function () {
      ready = true;
      draw();
    };
    img.src = IMG_SRC;

    function updateTarget(clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var faceX = rect.left + rect.width * (CX / IMG_SIZE);
      var faceY = rect.top + rect.height * (CY / IMG_SIZE);
      var dx = clientX - faceX;
      var dy = clientY - faceY;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = dx / dist;
      var ny = dy / dist;
      var falloff = Math.min(1, dist / (rect.width * 1.1));
      target.x = nx * MAX_SHIFT_X * falloff;
      target.y = ny * MAX_SHIFT_Y * falloff;

      if (reduceMotion) {
        current.x = target.x;
        current.y = target.y;
        draw();
      } else {
        startLoop();
      }
    }

    function onPointerMove(e) {
      var p = (e.touches && e.touches[0]) || e;
      updateTarget(p.clientX, p.clientY);
    }
    document.addEventListener('mousemove', onPointerMove, { passive: true });
    document.addEventListener('touchmove', onPointerMove, { passive: true });

    function drawEye(ex) {
      var ix = ex + current.x;
      var iy = EYE_CY + current.y;

      ctx.beginPath();
      ctx.fillStyle = IRIS_OUTER;
      ctx.arc(ix, iy, IRIS_R, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = IRIS_INNER;
      ctx.arc(ix, iy, IRIS_R * 0.62, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = PUPIL_COLOR;
      ctx.arc(ix, iy, IRIS_R * 0.34, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.arc(ix - IRIS_R * 0.4, iy - IRIS_R * 0.5, IRIS_R * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.arc(ix + IRIS_R * 0.38, iy + IRIS_R * 0.35, IRIS_R * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    function draw() {
      if (!ready) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(CX - EYE_DX, EYE_CY, EYE_W / 2 - 8, EYE_H / 2 - 6, 0, 0, Math.PI * 2);
      ctx.ellipse(CX + EYE_DX, EYE_CY, EYE_W / 2 - 8, EYE_H / 2 - 6, 0, 0, Math.PI * 2);
      ctx.clip();
      drawEye(CX - EYE_DX);
      drawEye(CX + EYE_DX);
      ctx.restore();
    }

    function loop() {
      current.x += (target.x - current.x) * EASE;
      current.y += (target.y - current.y) * EASE;
      draw();
      var settled = Math.abs(target.x - current.x) < 0.15 && Math.abs(target.y - current.y) < 0.15;
      if (!settled && visible) {
        requestAnimationFrame(loop);
      } else {
        running = false;
      }
    }

    function startLoop() {
      if (running || !visible) return;
      running = true;
      requestAnimationFrame(loop);
    }

    if ('IntersectionObserver' in window && wrap) {
      var io = new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting && !document.hidden;
      });
      io.observe(wrap);
    }
    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
