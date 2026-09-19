/* ---------- 0. Shared: send any enquiry or request to the register ---------- */
var AM = (function () {
  var cfg = { sheet: '', wa: '' };
  var el = document.getElementById('site-data');
  if (el) { try { cfg = JSON.parse(el.textContent) || cfg; } catch (e) {} }
  return {
    cfg: cfg,
    thanks: 'JazakAllah khair, we have received it. We will contact you soon.',
    send: function (rec, done, fail) {
      if (!cfg.sheet) { (fail || done)(); return; }
      fetch(cfg.sheet, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(rec)
      }).then(function () { done && done(); })
        .catch(function () { fail && fail(); });
    }
  };
})();

/* AL MA'ARIFA, site interactions
   1. mobile nav   2. sticky header shadow   3. scroll reveal
   4. course filtering (courses.html)        5. WhatsApp enquiry composer */
(function () {
  'use strict';

  /* ---------- 1. Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- 2. Sticky header shadow ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- 3. Scroll reveal ---------- */
  var items = document.querySelectorAll('.reveal');
  if (items.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 4. Course filtering ---------- */
  var chips = document.querySelectorAll('.chip[data-filter]');
  var cards = document.querySelectorAll('[data-mode]');
  var empty = document.querySelector('.empty-note');
  var countEl = document.querySelector('#result-count');

  function applyFilter(mode) {
    var shown = 0;
    cards.forEach(function (c) {
      var match;
      if (mode === 'all') match = true;
      else if (mode === 'cohort') match = c.getAttribute('data-cohort') === '1';
      else if (mode === 'selfpaced') match = c.getAttribute('data-selfpaced') === '1';
      else match = c.getAttribute('data-mode') === mode;
      c.style.display = match ? '' : 'none';
      if (match) shown++;
    });
    if (countEl) countEl.textContent = shown;
    if (empty) empty.style.display = shown ? 'none' : 'block';
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('is-on'); });
      chip.classList.add('is-on');
      applyFilter(chip.getAttribute('data-filter'));
    });
  });

  /* ---------- 5. Contact enquiry ---------- */
  var form = document.querySelector('#enquiry-form');
  if (form) {
    var eNote = document.querySelector('#enquiry-form .form-note');
    var eBtn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var get = function (id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };
      var name = get('f-name');
      if (!name) { eNote.textContent = 'Please add your name so we can reply to you.'; return; }
      var rec = {
        name: name,
        whatsapp: get('f-contact'),
        email: '',
        city: '',
        option: 'Contact enquiry: ' + get('f-topic'),
        fee: 0,
        notes: get('f-msg'),
        at: new Date().toISOString(),
        type: 'enquiry'
      };
      eBtn.disabled = true;
      eBtn.textContent = 'Sending…';
      AM.send(rec, function () {
        eBtn.disabled = false;
        eBtn.textContent = 'Send message';
        eNote.textContent = AM.thanks;
        form.reset();
      }, function () {
        eBtn.disabled = false;
        eBtn.textContent = 'Send message';
        eNote.textContent = 'That did not send. Please email us at almaarifa.hub@gmail.com.';
      });
    });
  }

  /* ---------- 6. Current year ---------- */
  var yr = document.querySelector('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- 7. Enrollment page ---------- */
  var dataEl = document.getElementById('course-data');
  if (dataEl) {
    var payload = JSON.parse(dataEl.textContent);
    var CATALOG = payload.courses;
    var METHODS = payload.methods || [];
    var WNUM = payload.wa || '923210911127';
    var bySlug = {};
    CATALOG.forEach(function (c) { bySlug[c.slug] = c; });

    var sel = document.getElementById('e-course');
    var modeNote = document.getElementById('e-mode');
    var txnField = document.getElementById('txn-field');
    var submit = document.querySelector('#enroll-form button[type="submit"]');
    var panels = document.querySelectorAll('.pay-panel');
    var payField = document.getElementById('pay-field');
    var methodInputs = document.querySelectorAll('input[name="pmethod"]');

    function current() { return bySlug[sel.value]; }

    function paintMethod(value) {
      panels.forEach(function (p) {
        p.style.display = (p.getAttribute('data-method') === value) ? '' : 'none';
      });
      methodInputs.forEach(function (r) {
        var box = r.closest('.pay-method');
        if (box) box.classList.toggle('is-on', r.checked);
      });
    }

    function paint() {
      var c = current();
      document.getElementById('sum-name').textContent = c.name;
      document.getElementById('sum-desc').textContent = c.desc;
      document.getElementById('sum-fee').textContent = c.feeLabel || c.fee;
      document.getElementById('sum-meta').textContent = c.meta;

      var sb = document.getElementById('stripe-btn');
      if (sb && c.stripe) sb.href = c.stripe;

      var conc = document.getElementById('sum-concession');
      if (conc) conc.style.display = (c.mode === 'paid') ? '' : 'none';

      if (c.mode === 'free' && !c.zoom) {
        modeNote.textContent = 'Free of charge, so no payment is needed. We will add you to the session.';
        panels.forEach(function (p) { p.style.display = 'none'; });
        if (payField) payField.style.display = 'none';
        txnField.style.display = 'none';
        submit.textContent = 'Send my registration';
      } else if (c.mode === 'soon') {
        modeNote.textContent = 'Not open for enrollment yet. Send this and we will notify you first.';
        panels.forEach(function (p) { p.style.display = 'none'; });
        if (payField) payField.style.display = 'none';
        txnField.style.display = 'none';
        submit.textContent = 'Notify me';
      } else {
        // paid courses, and free courses that carry the monthly Zoom contribution
        modeNote.textContent = c.zoom ? (payload.zoomNote || '') : '';
        if (payField) payField.style.display = '';
        txnField.style.display = '';
        submit.textContent = 'Send my enrollment';
        paintMethod(document.querySelector('input[name="pmethod"]:checked').value);
      }
    }

    var q = window.location.search.match(/course=([^&]+)/);
    if (q && bySlug[q[1]]) sel.value = q[1];
    paint();
    sel.addEventListener('change', paint);
    methodInputs.forEach(function (r) {
      r.addEventListener('change', function () { paintMethod(r.value); });
    });

    var eForm = document.getElementById('enroll-form');
    var eFormNote = eForm.querySelector('.form-note');
    var eSubmit = eForm.querySelector('button[type="submit"]');
    eForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var c = current();
      var nameEl = document.getElementById('e-name');
      var phoneEl = document.getElementById('e-phone');
      var emailEl = document.getElementById('e-email');
      if (!nameEl.value.trim() || !phoneEl.value.trim() ||
          (emailEl && !emailEl.value.trim())) {
        eFormNote.textContent =
          'Please add your name, WhatsApp number and email address so we can reach you.';
        if (emailEl && !emailEl.value.trim()) emailEl.focus();
        return;
      }
      var needsPay = (c.mode === 'paid' || c.zoom);
      var methodName = '';
      if (needsPay) {
        var picked = document.querySelector('input[name="pmethod"]:checked');
        var method = picked ? picked.value : '';
        methodName = method;
        for (var mi = 0; mi < METHODS.length; mi++) {
          if (METHODS[mi].id === method) methodName = METHODS[mi].name;
        }
      }
      var rec = {
        name: nameEl.value.trim(),
        whatsapp: phoneEl.value.trim(),
        email: emailEl ? emailEl.value.trim() : '',
        city: '',
        option: c.name,
        fee: c.fee,
        notes: (document.getElementById('e-note').value.trim() || '') +
               (needsPay ? '  [Payment: ' + methodName +
                 (document.getElementById('e-txn').value.trim()
                   ? ', Txn ID ' + document.getElementById('e-txn').value.trim()
                   : ', screenshot to follow') + ']' : ''),
        at: new Date().toISOString(),
        type: c.mode === 'soon' ? 'notify' : 'enrollment'
      };
      eSubmit.disabled = true;
      eSubmit.textContent = 'Sending…';
      AM.send(rec, function () {
        eSubmit.disabled = false;
        eSubmit.textContent = c.mode === 'soon' ? 'Notify me' : 'Send my enrollment';
        eFormNote.textContent = c.mode === 'soon'
          ? AM.thanks + ' We will tell you the moment it opens.'
          : AM.thanks;
        eForm.reset();
        paint();
      }, function () {
        eSubmit.disabled = false;
        eSubmit.textContent = 'Send my enrollment';
        eFormNote.textContent = 'That did not send. Please email us at almaarifa.hub@gmail.com.';
      });
    });
  }

})();

/* ---------- 8. Student registration ---------- */
(function () {
  var dataEl = document.getElementById('register-data');
  if (!dataEl) return;

  var cfg;
  try { cfg = JSON.parse(dataEl.textContent); } catch (e) { return; }
  if (!cfg.options || !cfg.options.length) return;

  var form = document.getElementById('register-form');
  var sel = document.getElementById('r-option');
  var note = document.getElementById('r-fee-note');
  var pay = document.getElementById('r-pay');
  var status = document.getElementById('r-status');
  var submit = form.querySelector('button[type="submit"]');

  function fee() { return Number(cfg.options[sel.value].fee) || 0; }

  /* Free choices never show payment, the same rule the enrollment form follows. */
  function paint() {
    var f = fee();
    pay.style.display = f ? '' : 'none';
    note.innerHTML = f
      ? 'Annual registration of <strong>PKR ' + f + '</strong> per year, renewed each year.'
      : 'Free of charge, with no registration fee.';
    status.textContent = f
      ? 'Send your registration, then transfer PKR ' + f + ' and share the screenshot on WhatsApp.'
      : 'Free programs carry no registration fee. Ruqyah and counseling are always free.';
    submit.textContent = 'Send my registration';
  }


  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = document.getElementById('r-name').value.trim();
    var phone = document.getElementById('r-phone').value.trim();
    if (!name || !phone) {
      status.textContent = 'Please add your name and WhatsApp number so we can reach you.';
      return;
    }
    var rec = {
      name: name,
      whatsapp: phone,
      email: document.getElementById('r-email').value.trim(),
      city: document.getElementById('r-city').value.trim(),
      option: cfg.options[sel.value].label,
      fee: fee(),
      notes: document.getElementById('r-notes').value.trim(),
      at: new Date().toISOString()
    };

    /* No spreadsheet wired up yet. Still confirm, and ask them to email instead. */
    if (!cfg.sheet) {
      status.textContent = 'Registration received. Please also email almaarifa.hub@gmail.com so we have your details.';
      form.reset();
      paint();
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Sending…';
    var paid = fee();

    fetch(cfg.sheet, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(rec)
    }).then(function () {
      submit.disabled = false;
      form.reset();
      paint();
      /* Set the message last, because paint() rewrites the status line. */
      status.textContent = paid
        ? 'Registration received. Please transfer PKR ' + paid + ' using the details above, and '
          + 'we will confirm once it lands.'
        : 'Registration received, welcome. We will be in touch.';
      /* They still need to send proof of payment, so WhatsApp is the right next step. */
      /* No WhatsApp hand-off: the request is recorded and we follow up ourselves. */
    }).catch(function () {
      submit.disabled = false;
      submit.textContent = 'Send my registration';
      status.textContent = 'That did not send. Please email us at almaarifa.hub@gmail.com.';
    });
  });

  sel.addEventListener('change', paint);
  paint();
})();

/* ---------- 9. Ruqyah session request & call-back request ---------- */
(function () {
  var THANKS = 'JazakAllah khair, we have received your request. We will contact you soon.';

  function wire(formId, noteId, button, buildRec) {
    var form = document.getElementById(formId);
    if (!form) return;
    var note = document.getElementById(noteId);
    var btn = form.querySelector('button[type="submit"]');
    var original = btn ? btn.textContent : '';
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var rec = buildRec();
      if (!rec) return;
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      AM.send(rec, function () {
        if (btn) { btn.disabled = false; btn.textContent = original; }
        note.textContent = THANKS;
        form.reset();
      }, function () {
        if (btn) { btn.disabled = false; btn.textContent = original; }
        note.textContent = 'That did not send. Please email us at almaarifa.hub@gmail.com.';
      });
    });
  }

  wire('ruqyah-form', 'q-status', null, function () {
    var name = document.getElementById('q-name').value.trim();
    var phone = document.getElementById('q-phone').value.trim();
    var note = document.getElementById('q-status');
    if (!name || !phone) {
      note.textContent = 'Please add your name and WhatsApp number so we can reach you.';
      return null;
    }
    return {
      name: name, whatsapp: phone, email: '', city: '',
      option: 'Ruqyah session request', fee: 0,
      notes: document.getElementById('q-notes').value.trim(),
      at: new Date().toISOString(), type: 'ruqyah'
    };
  });

  wire('talk-form', 't-status', null, function () {
    var name = document.getElementById('t-name').value.trim();
    var phone = document.getElementById('t-phone').value.trim();
    var note = document.getElementById('t-status');
    if (!name || !phone) {
      note.textContent = 'Please add your name and number.';
      return null;
    }
    var course = document.getElementById('sum-name');
    return {
      name: name, whatsapp: phone, email: '', city: '',
      option: 'Prefer to talk first' + (course && course.textContent ? ': ' + course.textContent : ''),
      fee: 0, notes: '', at: new Date().toISOString(), type: 'callback'
    };
  });
})();
