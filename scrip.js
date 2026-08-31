/* ==========================================================================
   Homecoming Night Party Invitation JavaScript Engine
   Event: Manoj & Bhagya – Homecoming Night Party
   Venue: Kings Ballroom | Date: November 14, 2026 | Time: 5:30 PM
   RSVP: https://forms.gle/v9hv6yD79fJcLnSB6
   Features: Direct Music Playback, Royal Envelope Opening, Star Burst,
   Wall of Love Guestbook, Google Calendar / iCal Generators, & Particle Physics.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const envelopeWrapper = document.getElementById('envelopeWrapper');
  const waxSealBtn = document.getElementById('waxSealBtn');
  const invitationMain = document.getElementById('invitationMain');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const replayEnvelopeBtn = document.getElementById('replayEnvelopeBtn');
  const toastMsg = document.getElementById('toastMsg');
  const wishesBoard = document.getElementById('wishesBoard');
  const wishForm = document.getElementById('wishForm');
  const downloadIcalBtn = document.getElementById('downloadIcalBtn');

  // State Variables
  let isAudioPlaying = false;
  let bgAudio = null;

  // Initialize Background Audio Player
  try {
    bgAudio = new Audio('assets/Ordinary%20(Violin%20Version).mp3?v=3');
    bgAudio.loop = true;
    bgAudio.volume = 0.85;
  } catch (e) {
    console.log('Audio init notice:', e);
  }

  // Attempt direct audio playback on page load
  function attemptDirectAudioPlay() {
    if (!bgAudio || isAudioPlaying) return;
    bgAudio.play().then(() => {
      isAudioPlaying = true;
      if (musicToggleBtn) {
        musicToggleBtn.classList.add('playing');
        musicToggleBtn.setAttribute('title', 'Pause Music');
      }
    }).catch(err => {
      console.log('Direct autoplay waiting for interaction:', err);
    });
  }

  attemptDirectAudioPlay();

  // Play audio on first user interaction
  const enableAudioOnInteraction = () => {
    attemptDirectAudioPlay();
    document.removeEventListener('click', enableAudioOnInteraction);
    document.removeEventListener('touchstart', enableAudioOnInteraction);
  };
  document.addEventListener('click', enableAudioOnInteraction, { once: true });
  document.addEventListener('touchstart', enableAudioOnInteraction, { once: true });

  // Target Date: Nov 14, 2026 17:30:00 (5:30 PM Homecoming Night Party)
  const eventDate = new Date('November 14, 2026 17:30:00').getTime();

  /* ==========================================================================
     1. Star Burst Effect on Wax Seal Click
     ========================================================================== */
  function triggerSealSparkleBurst() {
    const canvas = document.getElementById('seal-burst-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = envelopeWrapper.clientWidth;
    canvas.height = envelopeWrapper.clientHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const particles = [];
    // Homecoming party colors: Gold, Crimson, White, Champagne
    const colors = ['#D4AF37', '#9B111E', '#F7E49A', '#FFFFFF', '#C0392B', '#4A2040', '#FFD700'];

    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 10 + 4;
      particles.push({
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 0,
        shape: Math.random() > 0.5 ? 'star' : 'circle'
      });
    }

    function drawStar(ctx, x, y, r, color, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.translate(x, y);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        ctx.lineTo(
          Math.cos((18 + i * 72) * Math.PI / 180) * r,
          -Math.sin((18 + i * 72) * Math.PI / 180) * r
        );
        ctx.lineTo(
          Math.cos((54 + i * 72) * Math.PI / 180) * (r / 2.5),
          -Math.sin((54 + i * 72) * Math.PI / 180) * (r / 2.5)
        );
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function animateBurst() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        if (p.alpha > 0.01) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.18; // gravity
          p.alpha *= 0.93;
          p.life++;

          if (p.shape === 'star') {
            drawStar(ctx, p.x, p.y, p.size, p.color, p.alpha);
          } else {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      });

      if (alive) {
        requestAnimationFrame(animateBurst);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animateBurst();
  }

  /* ==========================================================================
     2. Royal Envelope Opening & Music Trigger
     ========================================================================== */
  function openEnvelope() {
    if (envelopeWrapper.classList.contains('animating') || envelopeWrapper.classList.contains('opened')) return;

    triggerSealSparkleBurst();
    envelopeWrapper.classList.add('animating');
    playMusic();

    setTimeout(() => {
      envelopeWrapper.classList.add('opened');
      invitationMain.classList.add('visible');
      startFallingStarsCanvas();
      showToast('🎉 Welcome to Manoj & Bhagya\'s Homecoming Night Party!');
    }, 1100);
  }

  if (waxSealBtn) {
    waxSealBtn.addEventListener('click', openEnvelope);
    waxSealBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      openEnvelope();
    }, { passive: false });
  }

  if (replayEnvelopeBtn) {
    replayEnvelopeBtn.addEventListener('click', () => {
      invitationMain.classList.remove('visible');
      envelopeWrapper.classList.remove('opened', 'animating');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     3. Background Music Player Control
     ========================================================================== */
  function playMusic() {
    if (!bgAudio) return;
    
    bgAudio.play().then(() => {
      isAudioPlaying = true;
      if (musicToggleBtn) {
        musicToggleBtn.classList.add('playing');
        musicToggleBtn.setAttribute('title', 'Pause Music');
      }
    }).catch(err => {
      console.log('Autoplay restriction, user interaction required:', err);
    });
  }

  function toggleMusic() {
    if (!bgAudio) return;

    if (isAudioPlaying) {
      bgAudio.pause();
      isAudioPlaying = false;
      if (musicToggleBtn) {
        musicToggleBtn.classList.remove('playing');
        musicToggleBtn.setAttribute('title', 'Play Music');
      }
      showToast('🎵 Music paused');
    } else {
      bgAudio.play().then(() => {
        isAudioPlaying = true;
        if (musicToggleBtn) {
          musicToggleBtn.classList.add('playing');
          musicToggleBtn.setAttribute('title', 'Pause Music');
        }
        showToast('🎵 Playing Party Music');
      }).catch(err => {
        showToast('🎵 Tap screen to play music');
      });
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', toggleMusic);
  }

  /* ==========================================================================
     4. Real-Time Countdown Timer (to Homecoming Night Party)
     ========================================================================== */
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = eventDate - now;

    if (distance < 0) {
      document.getElementById('days').innerText = '00';
      document.getElementById('hours').innerText = '00';
      document.getElementById('minutes').innerText = '00';
      document.getElementById('seconds').innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById('days').innerText = String(days).padStart(2, '0');
    document.getElementById('hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('minutes').innerText = String(minutes).padStart(2, '0');
    document.getElementById('seconds').innerText = String(seconds).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  /* ==========================================================================
     5. Wall of Love (Guestbook)
     ========================================================================== */
  const defaultWishes = [];

  function loadWishes() {
    if (!wishesBoard) return;
    let saved = localStorage.getItem('homecoming_wishes_mb');
    let wishes = saved ? JSON.parse(saved) : defaultWishes;

    wishesBoard.innerHTML = '';

    if (wishes.length === 0) {
      wishesBoard.innerHTML = `
        <p style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 14px 10px; font-style: italic;">
          Be the first to leave your warm wishes for Manoj & Bhagya's Homecoming! 🎉
        </p>
      `;
      return;
    }

    wishes.forEach((w, index) => {
      const card = document.createElement('div');
      card.className = 'wish-card';
      card.innerHTML = `
        <div class="wish-card-header">
          <span class="wish-author">${escapeHtml(w.name)}</span>
          <div class="wish-card-actions">
            <span class="wish-time"><i class="fas fa-heart" style="color: #9B111E;"></i> Wish</span>
            <button type="button" class="btn-delete-wish" data-index="${index}" title="Delete wish" aria-label="Delete wish">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div class="wish-text">${escapeHtml(w.message)}</div>
      `;
      wishesBoard.appendChild(card);
    });
  }

  if (wishesBoard) {
    wishesBoard.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.btn-delete-wish');
      if (deleteBtn) {
        const index = parseInt(deleteBtn.getAttribute('data-index'), 10);
        let saved = localStorage.getItem('homecoming_wishes_mb');
        let wishes = saved ? JSON.parse(saved) : [];
        if (!isNaN(index) && index >= 0 && index < wishes.length) {
          wishes.splice(index, 1);
          localStorage.setItem('homecoming_wishes_mb', JSON.stringify(wishes));
          loadWishes();
          showToast('🗑️ Wish deleted successfully');
        }
      }
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
  }

  if (wishForm) {
    wishForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('wishName').value.trim();
      const message = document.getElementById('wishMessage').value.trim();

      if (!name || !message) return;

      let saved = localStorage.getItem('homecoming_wishes_mb');
      let wishes = saved ? JSON.parse(saved) : [];

      wishes.unshift({ name, message });
      localStorage.setItem('homecoming_wishes_mb', JSON.stringify(wishes));

      loadWishes();
      wishForm.reset();
      showToast('💌 Thank you for your warm wishes on our Wall of Love!');
    });
  }

  loadWishes();

  /* ==========================================================================
     6. Calendar & Share Actions
     ========================================================================== */
  const addToCalendarBtn = document.getElementById('addToCalendarBtn');
  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener('click', () => {
      const gCalUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
        "&text=" + encodeURIComponent("Manoj & Bhagya's Homecoming Night Party") +
        "&dates=20261114T120000Z/20261114T180000Z" +
        "&details=" + encodeURIComponent("You are warmly invited to Manoj & Bhagya's Homecoming Night Party! Let's Reunite, Celebrate & Make Beautiful Memories Together!\n\n⏰ Time: 5:30 PM Onwards\n📍 Venue: Kings Ballroom\n📝 RSVP: https://forms.gle/v9hv6yD79fJcLnSB6\n📞 Manoj: 0717900456 | Bhagya: 0706666456") +
        "&location=" + encodeURIComponent("Kings Ballroom");
      window.open(gCalUrl, '_blank');
    });
  }

  if (downloadIcalBtn) {
    downloadIcalBtn.addEventListener('click', () => {
      const icsContent =
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Manoj & Bhagya Homecoming Night Party//EN
BEGIN:VEVENT
SUMMARY:Manoj & Bhagya Homecoming Night Party
DESCRIPTION:You are warmly invited to celebrate Manoj & Bhagya's Homecoming Night Party! Let's Reunite\\, Celebrate & Make Beautiful Memories Together! RSVP: https://forms.gle/v9hv6yD79fJcLnSB6
LOCATION:Kings Ballroom
DTSTART:20261114T120000Z
DTEND:20261114T180000Z
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Manoj_Bhagya_Homecoming_Night_Party.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('📅 Apple Calendar (.ics) downloaded!');
    });
  }

  const shareWhatsappBtn = document.getElementById('shareWhatsappBtn');
  if (shareWhatsappBtn) {
    shareWhatsappBtn.addEventListener('click', () => {
      const shareText = encodeURIComponent("🎉 You are warmly invited to Manoj & Bhagya's Homecoming Night Party!\n\n✨ Let's Reunite, Celebrate & Make Beautiful Memories Together! ❤️\n⏰ 5:30 PM Onwards\n📅 Saturday, November 14, 2026\n🏛️ Kings Ballroom\n📝 RSVP: https://forms.gle/v9hv6yD79fJcLnSB6\n🌐 Invitation Link: https://cdrnext.lk/Manoj-Bhagya-Homecomming\n📞 Manoj: 0717900456 | Bhagya: 0706666456");
      window.open("https://api.whatsapp.com/send?text=" + shareText, '_blank');
    });
  }

  /* ==========================================================================
     7. Falling Stars & Confetti Canvas Particle Engine ✨🎉
     ========================================================================== */
  function startFallingStarsCanvas() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    const particleCount = 55;
    // Homecoming night party colors
    const colors = [
      '#D4AF37', // Champagne Gold
      '#9B111E', // Crimson
      '#F7E49A', // Pale Gold
      '#FFD700', // Bright Gold
      '#C0392B', // Red
      '#4A2040', // Velvet Purple
      '#FFFFFF'  // White Sparkle
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (canvas.width + 200) - 100,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 7 + 4,
        speedY: Math.random() * 1.0 + 0.6,
        speedX: Math.random() * 1.2 + 0.4,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() * 0.06 - 0.03),
        windPhase: Math.random() * Math.PI * 2,
        windFrequency: Math.random() * 0.03 + 0.015,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.55 + 0.35,
        type: Math.random() < 0.4 ? 'star' : (Math.random() < 0.6 ? 'circle' : 'diamond'),
        paperRatio: Math.random() * 0.5 + 0.5
      });
    }

    function drawParticle(ctx, p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);

      const flipScale = Math.sin(p.windPhase) * p.paperRatio;
      ctx.scale(1, flipScale === 0 ? 0.05 : Math.abs(flipScale));
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'star') {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(
            Math.cos((18 + i * 72) * Math.PI / 180) * p.size,
            -Math.sin((18 + i * 72) * Math.PI / 180) * p.size
          );
          ctx.lineTo(
            Math.cos((54 + i * 72) * Math.PI / 180) * (p.size / 2.5),
            -Math.sin((54 + i * 72) * Math.PI / 180) * (p.size / 2.5)
          );
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.5, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.5, 0);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.windPhase += p.windFrequency;
        p.angle += p.spin;

        const windDrift = Math.sin(p.windPhase) * 1.0 + p.speedX;
        p.y += p.speedY + Math.cos(p.windPhase) * 0.25;
        p.x += windDrift;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * (canvas.width + 200) - 100;
        }

        if (p.x > canvas.width + 100) {
          p.x = -50;
        }

        drawParticle(ctx, p);
      });

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  /* ==========================================================================
     8. Lightbox Image Gallery Modal Preview
     ========================================================================== */
  const imageModalOverlay = document.getElementById('imageModalOverlay');
  const imageModalImg = document.getElementById('imageModalImg');
  const imageModalClose = document.getElementById('imageModalClose');

  function openImagePreview(src, alt) {
    if (!imageModalOverlay || !imageModalImg) return;
    imageModalImg.src = src;
    imageModalImg.alt = alt || 'Photo Preview';
    imageModalOverlay.classList.add('active');
  }

  function closeImagePreview() {
    if (imageModalOverlay) {
      imageModalOverlay.classList.remove('active');
    }
  }

  document.addEventListener('click', (e) => {
    const galleryImg = e.target.closest('.gallery-item img, .story-photo-box img');
    if (galleryImg) {
      openImagePreview(galleryImg.src, galleryImg.alt);
    }
  });

  if (imageModalClose) {
    imageModalClose.addEventListener('click', closeImagePreview);
  }

  if (imageModalOverlay) {
    imageModalOverlay.addEventListener('click', (e) => {
      if (e.target === imageModalOverlay) {
        closeImagePreview();
      }
    });
  }

  /* ==========================================================================
     9. Toast Notification Utility
     ========================================================================== */
  function showToast(message) {
    if (!toastMsg) return;
    toastMsg.innerText = message;
    toastMsg.classList.add('show');

    setTimeout(() => {
      toastMsg.classList.remove('show');
    }, 3200);
  }
});
