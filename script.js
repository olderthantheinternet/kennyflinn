(() => {
  "use strict";

  const config = window.KENNY_FLYNN_SITE || {};
  const header = document.getElementById("site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.getElementById("primary-nav");
  const navLinks = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];

  const setText = (selector, value) => {
    if (!value) return;
    document.querySelectorAll(selector).forEach((element) => {
      element.textContent = value;
    });
  };

  const setHref = (selector, value) => {
    if (!value) return;
    document.querySelectorAll(selector).forEach((element) => {
      element.setAttribute("href", value);
    });
  };

  const event = config.event || {};
  setText("[data-event-label]", event.label);
  setText("[data-event-date]", event.date);
  setText("[data-event-date-short]", event.dateShort);
  setText("[data-event-time]", event.time);
  setText("[data-event-venue]", event.venue);
  setText("[data-event-address]", event.address);
  setHref("[data-event-link]", event.facebookUrl);
  setHref("[data-map-link]", event.mapUrl);
  setHref("[data-calendar-link]", event.calendarUrl);

  if (event.dateShort) {
    const [month, day] = event.dateShort.trim().split(/\s+/);
    setText("[data-event-month]", month);
    setText("[data-event-day]", day);
  }

  const galleryEmail = typeof config.galleryEmail === "string" ? config.galleryEmail.trim() : "";
  if (galleryEmail) {
    const mailto = `mailto:${galleryEmail}?subject=${encodeURIComponent("Kenny Flynn memorial photo")}`;
    document.querySelectorAll("[data-gallery-email]").forEach((element) => {
      element.setAttribute("href", mailto);
      if (element.tagName === "A" && !element.classList.contains("button") && element.textContent.trim() === "the memorial organizer") {
        element.textContent = galleryEmail;
      } else if (element.classList.contains("button")) {
        element.textContent = "Email a Photo";
      }
    });
  }


  const closeMenu = () => {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    nav.classList.remove("is-open");
  };

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      menuButton.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
      nav.classList.toggle("is-open", !expanded);
    });

    navLinks.forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (eventKey) => {
      if (eventKey.key === "Escape") closeMenu();
    });
  }

  const updateHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  let revealObserver = null;
  const observeReveal = (elements) => {
    const list = [...elements];
    if (!list.length) return;
    if ("IntersectionObserver" in window) {
      if (!revealObserver) {
        revealObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
              }
            });
          },
          { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
        );
      }
      list.forEach((element) => revealObserver.observe(element));
    } else {
      list.forEach((element) => element.classList.add("is-visible"));
    }
  };

  observeReveal(document.querySelectorAll(".reveal"));

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visibleEntries.length) return;
        const activeId = `#${visibleEntries[0].target.id}`;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === activeId);
        });
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0.05, 0.2, 0.5] }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  document.querySelectorAll("[data-focus-memory]").forEach((link) => {
    link.addEventListener("click", () => {
      window.setTimeout(() => {
        const nameInput = document.getElementById("memory-name");
        if (nameInput) nameInput.focus({ preventScroll: true });
      }, 650);
    });
  });

  const formEndpoint = config.formEndpoint || "https://api.web3forms.com/submit";
  const formAccessKey = config.formAccessKey || "";
  const formKeyReady =
    typeof formAccessKey === "string" &&
    formAccessKey.length > 0 &&
    formAccessKey !== "YOUR_WEB3FORMS_ACCESS_KEY";

  const submitWithWeb3Forms = async (form, options = {}) => {
    const {
      statusElement,
      draftKey = null,
      successRedirect = "thank-you.html",
      failureMessage = "We couldn’t send your message just now. Please try again in a moment."
    } = options;

    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    const formValues = Object.fromEntries(formData.entries());
    const originalButtonText = submitButton ? submitButton.textContent : "Send";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending…";
    }
    if (statusElement) statusElement.textContent = "";

    if (!formKeyReady) {
      if (draftKey) {
        try {
          localStorage.setItem(draftKey, JSON.stringify(formValues));
        } catch (storageError) {
          console.warn("Could not save the form draft locally.", storageError);
        }
      }
      if (statusElement) {
        statusElement.textContent =
          "Form delivery is not connected yet. Your draft has been saved on this device.";
      }
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
      return;
    }

    formData.set("access_key", formAccessKey);
    formData.set("from_name", "KennyFlynn.com");

    try {
      const response = await fetch(formEndpoint, {
        method: "POST",
        body: formData
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success === false) {
        throw new Error(result.message || `Form submission failed with status ${response.status}`);
      }

      form.reset();
      if (draftKey) localStorage.removeItem(draftKey);
      window.location.href = successRedirect;
    } catch (error) {
      if (draftKey) {
        try {
          localStorage.setItem(draftKey, JSON.stringify(formValues));
        } catch (storageError) {
          console.warn("Could not save the form draft locally.", storageError);
        }
      }

      if (statusElement) statusElement.textContent = failureMessage;
      console.warn(error);
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  };

  const restoreDraft = (form, statusElement, draftKey) => {
    try {
      const savedDraft = localStorage.getItem(draftKey);
      if (!savedDraft) return;
      const draft = JSON.parse(savedDraft);
      Object.entries(draft).forEach(([name, value]) => {
        const field = form.elements.namedItem(name);
        if (!field || typeof value !== "string") return;
        if (field instanceof RadioNodeList) return;
        if (field.type === "checkbox") {
          field.checked = value === field.value || value === "on";
        } else {
          field.value = value;
        }
      });
      if (statusElement) statusElement.textContent = "A draft from this device has been restored.";
    } catch (error) {
      console.warn("Could not restore the form draft.", error);
    }
  };

  const form = document.getElementById("memory-form");
  const formStatus = document.getElementById("form-status");

  if (form) {
    form.addEventListener("submit", (submitEvent) => {
      submitEvent.preventDefault();
      submitWithWeb3Forms(form, {
        statusElement: formStatus,
        draftKey: "kennyFlynnMemoryDraft",
        failureMessage:
          "We couldn’t send your memory just now. Your draft is safely saved on this device. Please try again after the form connection is restored."
      });
    });

    if (formStatus) restoreDraft(form, formStatus, "kennyFlynnMemoryDraft");
  }

  const privacyForm = document.getElementById("privacy-form");
  const privacyFormStatus = document.getElementById("privacy-form-status");

  if (privacyForm) {
    privacyForm.addEventListener("submit", (submitEvent) => {
      submitEvent.preventDefault();
      submitWithWeb3Forms(privacyForm, {
        statusElement: privacyFormStatus,
        draftKey: "kennyFlynnPrivacyDraft",
        failureMessage:
          "We couldn’t send your request just now. Your draft is saved on this device. Please try again shortly."
      });
    });

    if (privacyFormStatus) restoreDraft(privacyForm, privacyFormStatus, "kennyFlynnPrivacyDraft");
  }

  const candleButton = document.getElementById("candle-button");
  const candleCard = candleButton ? candleButton.closest(".candle-card") : null;
  const candleStatus = document.getElementById("candle-status");
  const candleKey = "kennyFlynnCandleLit";

  const setCandleLit = (lit) => {
    if (!candleButton || !candleCard || !candleStatus) return;
    candleCard.classList.toggle("is-lit", lit);
    candleButton.disabled = lit;
    candleButton.textContent = lit ? "Candle Lit" : "Light a Candle";
    candleStatus.textContent = lit ? "A candle is glowing for Kenny on this device." : "";
  };

  if (candleButton) {
    let candleIsLit = false;
    try {
      candleIsLit = localStorage.getItem(candleKey) === "true";
    } catch (error) {
      console.warn("Could not read candle status.", error);
    }
    setCandleLit(candleIsLit);

    candleButton.addEventListener("click", () => {
      try {
        localStorage.setItem(candleKey, "true");
      } catch (error) {
        console.warn("Could not save candle status.", error);
      }
      setCandleLit(true);
    });
  }

  const shareButton = document.getElementById("share-site");
  if (shareButton) {
    shareButton.addEventListener("click", async () => {
      const shareData = {
        title: "Kenny Flynn | A Celebration of Life",
        text: "Celebrating the life and Atlanta nightlife legacy of Kenny Flynn.",
        url: window.location.href.split("#")[0]
      };

      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareData.url);
          const originalText = shareButton.innerHTML;
          shareButton.textContent = "Link copied";
          window.setTimeout(() => {
            shareButton.innerHTML = originalText;
          }, 1800);
        }
      } catch (error) {
        if (error && error.name !== "AbortError") console.warn("Share failed.", error);
      }
    });
  }

  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());

  const galleryGrid = document.getElementById("gallery-grid");
  const galleryEmpty = document.getElementById("gallery-empty");
  const galleryLightbox = document.getElementById("gallery-lightbox");
  const galleryLightboxImage = document.getElementById("gallery-lightbox-image");
  const galleryLightboxCaption = document.getElementById("gallery-lightbox-caption");
  const galleryLightboxCredit = document.getElementById("gallery-lightbox-credit");
  const galleryManifestUrl = config.galleryManifestUrl || "assets/gallery/manifest.json";

  const initGallery = async () => {
    if (!galleryGrid) return;

    let items = [];
    try {
      const response = await fetch(galleryManifestUrl, { cache: "no-cache" });
      if (!response.ok) throw new Error(`Gallery manifest failed with status ${response.status}`);
      const manifest = await response.json();
      items = Array.isArray(manifest) ? manifest : Array.isArray(manifest.items) ? manifest.items : [];
    } catch (error) {
      console.warn("Could not load the gallery manifest.", error);
      items = [];
    }

    items = items.filter((item) => item && typeof item.src === "string" && item.src.trim());

    if (!items.length) {
      galleryGrid.replaceChildren();
      if (galleryEmpty) galleryEmpty.hidden = false;
      return;
    }

    if (galleryEmpty) galleryEmpty.hidden = true;

    let activeIndex = 0;

    const showLightboxItem = (index) => {
      if (!items.length || !galleryLightboxImage) return;
      activeIndex = (index + items.length) % items.length;
      const item = items[activeIndex];
      galleryLightboxImage.src = item.src;
      galleryLightboxImage.alt = item.alt || item.caption || "Memorial photograph";
      if (galleryLightboxCaption) galleryLightboxCaption.textContent = item.caption || "";
      if (galleryLightboxCredit) {
        galleryLightboxCredit.textContent = item.credit ? `Credit: ${item.credit}` : "";
      }
    };

    const openLightbox = (index) => {
      if (!galleryLightbox || typeof galleryLightbox.showModal !== "function") return;
      showLightboxItem(index);
      if (!galleryLightbox.open) galleryLightbox.showModal();
    };

    const closeLightbox = () => {
      if (galleryLightbox && galleryLightbox.open) galleryLightbox.close();
    };

    const fragment = document.createDocumentFragment();
    items.forEach((item, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery-item reveal";
      button.setAttribute("aria-label", item.alt || item.caption || `View photograph ${index + 1}`);

      const image = document.createElement("img");
      image.src = item.src;
      image.alt = item.alt || item.caption || "";
      image.loading = "lazy";
      image.decoding = "async";

      const meta = document.createElement("div");
      meta.className = "gallery-item-meta";
      if (item.caption) {
        const caption = document.createElement("p");
        caption.textContent = item.caption;
        meta.appendChild(caption);
      }
      if (item.credit) {
        const credit = document.createElement("small");
        credit.textContent = item.credit;
        meta.appendChild(credit);
      }

      button.append(image, meta);
      button.addEventListener("click", () => openLightbox(index));
      fragment.appendChild(button);
    });

    galleryGrid.replaceChildren(fragment);
    observeReveal(galleryGrid.querySelectorAll(".reveal"));

    if (!galleryLightbox) return;

    const closeButton = galleryLightbox.querySelector(".gallery-lightbox-close");
    const prevButton = galleryLightbox.querySelector(".gallery-lightbox-prev");
    const nextButton = galleryLightbox.querySelector(".gallery-lightbox-next");

    if (closeButton) closeButton.addEventListener("click", closeLightbox);
    if (prevButton) prevButton.addEventListener("click", () => showLightboxItem(activeIndex - 1));
    if (nextButton) nextButton.addEventListener("click", () => showLightboxItem(activeIndex + 1));

    galleryLightbox.addEventListener("click", (event) => {
      if (event.target === galleryLightbox) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (!galleryLightbox.open) return;
      if (event.key === "ArrowLeft") showLightboxItem(activeIndex - 1);
      if (event.key === "ArrowRight") showLightboxItem(activeIndex + 1);
    });
  };

  initGallery();
})();
