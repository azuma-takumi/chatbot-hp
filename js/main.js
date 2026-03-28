/* ==========================================
   main.js
   ナビゲーション、スクロールアニメーション、
   カウントアップ、フォームバリデーションを管理
   ========================================== */

// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollAnimation();
  initCountUp();
  initContactForm();
});

/* ------------------------------------------
   ナビゲーション：スクロール時の背景変化
   ＆ハンバーガーメニュー制御
   ------------------------------------------ */
function initNav() {
  const header    = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');
  const navLinks  = document.querySelectorAll('.nav__link');

  // スクロール量に応じてヘッダーにクラスを付与
  const handleScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // 初期チェック

  // ハンバーガーボタンでモバイルメニュー開閉
  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
  });

  // ナビリンクをクリックしたらメニューを閉じる
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.classList.remove('active');
    });
  });

  // メニュー外クリックで閉じる
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      navMenu.classList.remove('open');
      hamburger.classList.remove('active');
    }
  });
}

/* ------------------------------------------
   スクロールアニメーション（フェードイン）
   IntersectionObserver で要素が見えたら
   .visible クラスを付与
   ------------------------------------------ */
function initScrollAnimation() {
  const targets = document.querySelectorAll('.fade-in');

  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 少し遅延を入れてアニメーションを自然に見せる
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, 80);
          observer.unobserve(entry.target); // 一度表示したら監視解除
        }
      });
    },
    {
      threshold: 0.12,   // 12%見えたら発火
      rootMargin: '0px 0px -40px 0px',
    }
  );

  targets.forEach(el => observer.observe(el));
}

/* ------------------------------------------
   カウントアップアニメーション
   data-target 属性に目標値を設定
   実績セクションが見えたら発火
   ------------------------------------------ */
function initCountUp() {
  const countEls = document.querySelectorAll('.count');

  if (!countEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  countEls.forEach(el => observer.observe(el));
}

/**
 * 数字をアニメーションでカウントアップする
 * @param {HTMLElement} el - カウント対象の要素
 */
function animateCount(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 2000; // アニメーション時間（ms）
  const startTime = performance.now();

  const update = (currentTime) => {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // イーズアウト（最後はゆっくり）
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);

    el.textContent = current.toLocaleString('ja-JP');

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString('ja-JP');
    }
  };

  requestAnimationFrame(update);
}

/* ------------------------------------------
   お問い合わせフォーム バリデーション
   ------------------------------------------ */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  if (!form) return;

  const success = document.getElementById('formSuccess');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // バリデーション実行
    const isValid = validateForm(form);

    if (isValid) {
      // 送信完了メッセージを表示（実際の送信処理はここに追加）
      success.classList.add('visible');

      // フォームをリセット
      setTimeout(() => {
        form.reset();
        success.classList.remove('visible');
      }, 5000);
    }
  });

  // 入力中にエラーをリアルタイムで解除
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => {
      clearError(input);
    });
  });
}

/**
 * フォームバリデーション
 * @param {HTMLFormElement} form - 対象フォーム
 * @returns {boolean} バリデーション結果
 */
function validateForm(form) {
  let isValid = true;

  // お名前チェック
  const name = form.querySelector('#name');
  if (!name.value.trim()) {
    showError(name, 'nameError', 'お名前を入力してください。');
    isValid = false;
  } else {
    clearError(name);
  }

  // メールアドレスチェック
  const email = form.querySelector('#email');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    showError(email, 'emailError', 'メールアドレスを入力してください。');
    isValid = false;
  } else if (!emailPattern.test(email.value)) {
    showError(email, 'emailError', '正しいメールアドレスを入力してください。');
    isValid = false;
  } else {
    clearError(email);
  }

  // お問い合わせ内容チェック
  const message = form.querySelector('#message');
  if (!message.value.trim()) {
    showError(message, 'messageError', 'お問い合わせ内容を入力してください。');
    isValid = false;
  } else {
    clearError(message);
  }

  return isValid;
}

/**
 * エラーメッセージを表示する
 * @param {HTMLElement} input - 対象入力要素
 * @param {string} errorId - エラー表示要素のID
 * @param {string} message - エラーメッセージ
 */
function showError(input, errorId, message) {
  input.style.borderColor = '#ef4444';
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = message;
}

/**
 * エラーを解除する
 * @param {HTMLElement} input - 対象入力要素
 */
function clearError(input) {
  input.style.borderColor = '';
  // 対応するエラー要素を特定してクリア
  const errorMap = {
    name: 'nameError',
    email: 'emailError',
    message: 'messageError',
  };
  const errorId = errorMap[input.id];
  if (errorId) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) errorEl.textContent = '';
  }
}
