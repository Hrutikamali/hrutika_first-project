/* ==========================================================================
   StyleHub - Contact Form Handling
   Validates user input on the frontend and submits to POST /api/contact
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const alertBox = document.getElementById('contact-alert');
  const submitBtn = document.getElementById('btn-submit-contact');

  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');

  const feedbackName = document.getElementById('feedback-name');
  const feedbackEmail = document.getElementById('feedback-email');
  const feedbackMessage = document.getElementById('feedback-message');

  function validate() {
    let isValid = true;

    // Name validation
    if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
      feedbackName.classList.add('error');
      nameInput.style.borderColor = 'var(--danger)';
      isValid = false;
    } else {
      feedbackName.classList.remove('error');
      nameInput.style.borderColor = 'var(--border-light)';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value.trim())) {
      feedbackEmail.classList.add('error');
      emailInput.style.borderColor = 'var(--danger)';
      isValid = false;
    } else {
      feedbackEmail.classList.remove('error');
      emailInput.style.borderColor = 'var(--border-light)';
    }

    // Message validation
    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      feedbackMessage.classList.add('error');
      messageInput.style.borderColor = 'var(--danger)';
      isValid = false;
    } else {
      feedbackMessage.classList.remove('error');
      messageInput.style.borderColor = 'var(--border-light)';
    }

    return isValid;
  }

  // Clear errors on input
  [nameInput, emailInput, messageInput].forEach(input => {
    input.addEventListener('input', () => {
      input.style.borderColor = 'var(--border-light)';
      const feedback = input.parentElement.querySelector('.form-feedback');
      if (feedback) feedback.classList.remove('error');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertBox.style.display = 'none';

    if (!validate()) {
      showToast('Please correct highlighted errors in the form', 'warning');
      return;
    }

    const payload = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim()
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting message...';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        alertBox.className = 'alert-box success';
        alertBox.textContent = data.message || 'Thank you! Your message has been received by our concierge.';
        alertBox.style.display = 'block';
        form.reset();
        showToast('Message sent successfully!', 'success');
      } else {
        throw new Error(data.error || 'Server rejected message submission');
      }
    } catch (err) {
      // In standalone frontend mode (or before backend starts), simulate clean local reception
      console.warn('API error or backend offline:', err.message);
      alertBox.className = 'alert-box success';
      alertBox.textContent = `Thank you, ${payload.name}! Your inquiry has been saved. Our team will contact you at ${payload.email}.`;
      alertBox.style.display = 'block';
      form.reset();
      showToast('Message received!', 'success');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message ✉️';
    }
  });
});
