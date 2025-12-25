// Bridge visible site forms (modal + footer) to hidden Tilda forms

function getFieldRefs(container) {
  return {
    name: container.querySelector('input[placeholder="Имя"]'),
    phone: container.querySelector('input[placeholder="Телефон"], input[placeholder="+7 999 999 99 99"]'),
    email: container.querySelector('input[placeholder="Электронная почта"]'),
    contact: container.querySelector('select[name="social"], select#contact-method, input[placeholder="Удобный способ связи"]'),
    submit: container.querySelector('button'),
  };
}

function isEmailValid(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(email.trim());
}

function normalizeDigits(s) {
  return (s || '').replace(/\D+/g, '');
}

function formatPhoneRU(rawDigits) {
  let d = normalizeDigits(rawDigits);
  if (!d) return '';
  // Normalize to Russian format starting with 7
  if (d[0] === '8') d = '7' + d.slice(1);
  if (d[0] !== '7') {
    // If user typed 10 digits (e.g., 9XXXXXXXXX), prepend 7
    if (d.length === 10) d = '7' + d;
  }
  d = d.slice(0, 11);
  // Build "+7 999 999 99 99"
  const parts = [];
  if (d.length >= 1) parts.push('+', d[0]);
  if (d.length >= 4) parts.push(' ', d.slice(1, 4)); else if (d.length > 1) parts.push(' ', d.slice(1));
  if (d.length >= 7) parts.push(' ', d.slice(4, 7)); else if (d.length > 4) parts.push(' ', d.slice(4));
  if (d.length >= 9) parts.push(' ', d.slice(7, 9)); else if (d.length > 7) parts.push(' ', d.slice(7));
  if (d.length >= 11) parts.push(' ', d.slice(9, 11)); else if (d.length > 9) parts.push(' ', d.slice(9));
  return parts.join('');
}

function attachPhoneMask(field) {
  if (!field) return;
  // Set helpful attributes
  try {
    field.setAttribute('inputmode', 'tel');
    field.setAttribute('autocomplete', 'tel');
    if (!field.placeholder || field.placeholder.toLowerCase() === 'телефон') {
      field.placeholder = '+7 999 999 99 99';
    }
  } catch (_) {}

  const applyMask = () => {
    const masked = formatPhoneRU(field.value);
    field.value = masked;
  };

  const onKeyDown = (e) => {
    // Allow control keys
    const ctrl = e.ctrlKey || e.metaKey || e.altKey;
    const code = e.key;
    const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Home','End','Tab'];
    if (ctrl || allowed.includes(code)) return;
    // Allow digits only
    if (!/\d/.test(code)) e.preventDefault();
  };

  field.addEventListener('keydown', onKeyDown);
  field.addEventListener('input', applyMask);
  field.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    field.value = formatPhoneRU(text);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
  // Initialize
  applyMask();
}

function validateValues(values) {
  const errors = {};
  // name
  if (!values.name || values.name.trim().length < 2) {
    errors.name = 'Укажите имя (не короче 2 символов)';
  }
  // email
  if (!isEmailValid(values.email)) {
    errors.email = 'Email указан некорректно';
  }
  // phone: at least 10 digits
  const digits = normalizeDigits(values.phone);
  if (digits.length < 10) {
    errors.phone = 'Телефон указан некорректно';
  }
  // contact: required
  if (!values.contact || values.contact.trim().length === 0) {
    errors.contact = 'Укажите удобный способ связи';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

function findOrCreateErrorEl(field) {
  if (!field) return null;
  // Prefer an existing <p> right after field (as on index.html)
  const next = field.nextElementSibling;
  if (next && next.tagName === 'P') return next;
  // Otherwise create ephemeral error element
  const p = document.createElement('p');
  p.className = 'text-red-500 text-sm mt-[-15px] js-error';
  p.style.display = 'none';
  field.parentNode && field.parentNode.insertBefore(p, field.nextSibling);
  return p;
}

function renderValidation(container, values, opts) {
  const options = opts || {};
  const refs = getFieldRefs(container);
  const { valid, errors } = validateValues(values);

  // Name
  if (refs.name) {
    const el = findOrCreateErrorEl(refs.name);
    if (el) {
      const show = options.forceShow || refs.name.dataset.touched === '1';
      if (errors.name && show) {
        el.textContent = errors.name;
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    }
  }
  // Phone
  if (refs.phone) {
    const el = findOrCreateErrorEl(refs.phone);
    if (el) {
      const show = options.forceShow || refs.phone.dataset.touched === '1';
      if (errors.phone && show) {
        el.textContent = errors.phone;
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    }
  }
  // Email
  if (refs.email) {
    const el = findOrCreateErrorEl(refs.email);
    if (el) {
      const show = options.forceShow || refs.email.dataset.touched === '1';
      if (errors.email && show) {
        el.textContent = errors.email;
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    }
  }
  // Contact
  if (refs.contact) {
    const el = findOrCreateErrorEl(refs.contact);
    if (el) {
      const show = options.forceShow || refs.contact.dataset.touched === '1';
      if (errors.contact && show) {
        el.textContent = errors.contact;
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    }
  }

  // Button state
  if (refs.submit) {
    refs.submit.disabled = !valid;
    if (refs.submit.disabled) {
      refs.submit.classList.add('U_Disabled');
      refs.submit.style.backgroundColor = '#AFAFAF';
    } else {
      refs.submit.classList.remove('U_Disabled');
      refs.submit.style.backgroundColor = '';
    }
  }

  return valid;
}

function getVisibleValues(container) {
  console.log('[tildaBridge] getVisibleValues: container=', container);
  const getVal = (sel) => {
    const el = container.querySelector(sel);
    if (!el) console.log('[tildaBridge] field not found:', sel);
    return el ? (el.value || '').trim() : '';
  };

  const name = getVal('input[placeholder="Имя"]');
  // phone can be in various placeholders
  const phone = getVal('input[placeholder="Телефон"], input[placeholder="+7 999 999 99 99"]');
  const email = getVal('input[placeholder="Электронная почта"]');

  // contact method may be a select or an input
  let contact = '';
  const select = container.querySelector('select[name="social"], select#contact-method');
  if (select) {
    contact = (select.value || '').trim();
  } else {
    contact = getVal('input[placeholder="Удобный способ связи"]');
  }

  const message = getVal('textarea');
  console.log('[tildaBridge] collected values:', { name, phone, email, contact, message });
  return { name, phone, email, contact, message };
}

function populateHiddenTildaForm(hiddenFormEl, values) {
  if (!hiddenFormEl) return false;
  console.log('[tildaBridge] populateHiddenTildaForm: form=', hiddenFormEl);

  const nameInput = hiddenFormEl.querySelector('input[name="Name"]');
  if (nameInput) nameInput.value = values.name;
  console.log('[tildaBridge] set Name:', !!nameInput, values.name);

  const emailInput = hiddenFormEl.querySelector('input[name="Email"]');
  if (emailInput) emailInput.value = values.email;
  console.log('[tildaBridge] set Email:', !!emailInput, values.email);

  // Tilda phone may use a phonemask wrapper with a hidden js-phonemask-result input
  const phoneHidden = hiddenFormEl.querySelector('input.js-phonemask-result[name="Phone"], input[name="Phone"], input[type="tel"][name="Phone"]');
  if (phoneHidden) phoneHidden.value = values.phone;
  const phoneVisibleMask = hiddenFormEl.querySelector('input.t-input-phonemask');
  if (phoneVisibleMask) phoneVisibleMask.value = values.phone;
  console.log('[tildaBridge] set Phone hidden:', !!phoneHidden, 'visibleMask:', !!phoneVisibleMask, values.phone);

  const comments = hiddenFormEl.querySelector('textarea[name="Comments"]');
  if (comments) {
    const contactLine = values.contact ? `Предпочтительный способ связи: ${values.contact}` : '';
    comments.value = [contactLine, values.message].filter(Boolean).join('\n');
  }
  console.log('[tildaBridge] set Comments:', !!comments);

  return true;
}

function findHiddenTildaForm() {
  // Prefer an explicit t-form; assume only one per page
  const form = document.querySelector('form.t-form.js-form-proccess');
  console.log('[tildaBridge] findHiddenTildaForm:', !!form, form);
  return form;
}

function submitHiddenTildaForm() {
  const hiddenForm = findHiddenTildaForm();
  if (!hiddenForm) return;
  const submitBtn = hiddenForm.querySelector('.t-submit');
  console.log('[tildaBridge] submitHiddenTildaForm: submitBtn=', !!submitBtn);
  if (submitBtn) submitBtn.click();
  else hiddenForm.submit();
}

function handleSubmit(container) {
  console.log('[tildaBridge] handleSubmit start');
  // Validate first
  const current = getVisibleValues(container);
  const isValid = renderValidation(container, current, { forceShow: true });
  if (!isValid) {
    console.warn('[tildaBridge] form invalid, abort submit');
    return;
  }
  const hiddenForm = findHiddenTildaForm();
  if (!hiddenForm) return;
  const ok = populateHiddenTildaForm(hiddenForm, current);
  if (!ok) return;
  console.log('[tildaBridge] handleSubmit populated, submitting...');
  submitHiddenTildaForm();
}

function bindBridge() {
  console.log('[tildaBridge] bindBridge on', window.location.pathname);
  // Modal
  const modalForm = document.getElementById('modalForm');
  if (modalForm) {
    const modalButton = modalForm.querySelector('button');
    console.log('[tildaBridge] modalForm found. button=', !!modalButton);
    // Bind validation on input changes
    const modalRefs = getFieldRefs(modalForm);
    // Phone mask
    attachPhoneMask(modalRefs.phone);
    const validateModal = () => {
      const values = getVisibleValues(modalForm);
      renderValidation(modalForm, values);
    };
    [modalRefs.name, modalRefs.phone, modalRefs.email, modalRefs.contact]
      .filter(Boolean)
      .forEach((el) => {
        el.addEventListener('focus', () => { el.dataset.touched = '1'; const v = getVisibleValues(modalForm); renderValidation(modalForm, v); });
        el.addEventListener('input', validateModal);
        el.addEventListener('change', validateModal);
      });
    // Initial state
    // hide errors initially, but update button state
    renderValidation(modalForm, getVisibleValues(modalForm), { forceShow: false });
    if (modalButton) {
      modalButton.addEventListener('click', (e) => {
        console.log('[tildaBridge] modal submit click');
        e.preventDefault();
        const btn = e.currentTarget;
        if (btn.disabled || btn.classList.contains('U_Disabled')) return;
        handleSubmit(modalForm);
      });
    }
  }

  // Footer: use page footer element
  const footer = document.querySelector('footer');
  if (footer) {
    const footerButton = footer.querySelector('button');
    console.log('[tildaBridge] footer found. button=', !!footerButton);
    // Bind validation on input changes
    const footerRefs = getFieldRefs(footer);
    // Phone mask
    attachPhoneMask(footerRefs.phone);
    const validateFooter = () => {
      const values = getVisibleValues(footer);
      renderValidation(footer, values);
    };
    [footerRefs.name, footerRefs.phone, footerRefs.email, footerRefs.contact]
      .filter(Boolean)
      .forEach((el) => {
        el.addEventListener('focus', () => { el.dataset.touched = '1'; const v = getVisibleValues(footer); renderValidation(footer, v); });
        el.addEventListener('input', validateFooter);
        el.addEventListener('change', validateFooter);
      });
    // Initial state
    renderValidation(footer, getVisibleValues(footer), { forceShow: false });
    if (footerButton) {
      footerButton.addEventListener('click', (e) => {
        console.log('[tildaBridge] footer submit click');
        e.preventDefault();
        const btn = e.currentTarget;
        if (btn.disabled || btn.classList.contains('U_Disabled')) return;
        handleSubmit(footer);
      });
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', bindBridge);
}


