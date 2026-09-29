(function(){
  "use strict";

  let PRODUCTS = [];
  let STORE_WHATSAPP = "";
  let preOrderLeadDays = 0;
  let preOrderNote = "";
  const cart = {}; // { productId: qty }

  const rupiah = (n) => "Rp" + n.toLocaleString("id-ID");
  const toISODate = (d) => d.toISOString().slice(0, 10);
  const formatIDDate = (isoStr) => {
    if (!isoStr) return "-";
    const d = new Date(isoStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  function updateOrderDateConstraints(){
    const entries = cartEntries();
    const preOrderEntries = entries.filter(e => e.product.isPreOrder);
    const hasPreOrder = preOrderEntries.length > 0;

    let leadDays = 0;
    if (hasPreOrder) {
      leadDays = Math.max(...preOrderEntries.map(e =>
        Number(e.product.leadTimeDays) > 0 ? Number(e.product.leadTimeDays) : preOrderLeadDays
      ));
    }

    const min = new Date();
    min.setDate(min.getDate() + leadDays);
    const minStr = toISODate(min);

    const dateInput = document.getElementById("orderDate");
    const hintEl = document.getElementById("orderDateHint");
    const bannerEl = document.getElementById("preorderBanner");
    if (!dateInput) return;

    dateInput.min = minStr;
    if (dateInput.value && dateInput.value < minStr) dateInput.value = minStr;

    if (hintEl){
      hintEl.textContent = hasPreOrder
        ? `Ada produk pre-order di keranjang, tanggal paling cepat: ${formatIDDate(minStr)}.`
        : "Pilih tanggal pengambilan/pengiriman yang kamu inginkan.";
    }
    if (bannerEl){
      if (hasPreOrder && preOrderNote){
        bannerEl.textContent = preOrderNote;
        bannerEl.style.display = "block";
      } else {
        bannerEl.style.display = "none";
      }
    }
  }

  const productImage = (p) => {
    if (p.image) return `<img src="${p.image}" alt="${p.name}">`;
    return `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
  };

  function renderProducts(){
    const grid = document.getElementById("productGrid");
    grid.innerHTML = PRODUCTS.map(p => `
      <div class="product-card">
        <div class="product-image">
          ${p.isPreOrder ? '<span class="pre-badge">Pre-Order</span>' : ''}
          ${productImage(p)}
        </div>
        <div class="product-body">
          <p class="product-name">${p.name}</p>
          <p class="product-unit">${p.unit}</p>
          <p class="product-desc">${p.desc}</p>
          ${p.isPreOrder ? `<p class="preorder-hint">Butuh waktu produksi, min. ${Number(p.leadTimeDays) > 0 ? p.leadTimeDays : preOrderLeadDays} hari sebelum diambil.</p>` : ''}
          <div class="product-foot">
            <span class="product-price">${rupiah(p.price)}</span>
            <button class="add-btn" data-id="${p.id}" aria-label="Tambah ${p.name} ke keranjang">+</button>
          </div>
        </div>
      </div>
    `).join("");

    grid.querySelectorAll(".add-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        addToCart(btn.dataset.id);
        openCart();
      });
    });
  }

  function addToCart(id){
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
  }
  function changeQty(id, delta){
    if(!cart[id]) return;
    cart[id] += delta;
    if(cart[id] <= 0) delete cart[id];
    renderCart();
  }
  function removeFromCart(id){
    delete cart[id];
    renderCart();
  }

  function cartEntries(){
    return Object.keys(cart)
      .map(id => ({ product: PRODUCTS.find(p => p.id === id), qty: cart[id] }))
      .filter(e => e.product);
  }
  function cartTotal(){
    return cartEntries().reduce((sum, e) => sum + e.product.price * e.qty, 0);
  }
  function cartCount(){
    return Object.values(cart).reduce((a,b) => a+b, 0);
  }

  function renderCart(){
    const entries = cartEntries();
    const itemsEl = document.getElementById("cartItems");
    const emptyEl = document.getElementById("cartEmpty");
    const totalEl = document.getElementById("cartTotal");
    const countEl = document.getElementById("cartCount");

    countEl.textContent = cartCount();

    if(entries.length === 0){
      itemsEl.style.display = "none";
      emptyEl.style.display = "block";
    } else {
      itemsEl.style.display = "flex";
      emptyEl.style.display = "none";
      itemsEl.innerHTML = entries.map(e => `
        <div class="cart-line">
          <div style="flex:1">
            <p class="cart-line-name">${e.product.name}</p>
            <p class="cart-line-price">${rupiah(e.product.price)} &times; ${e.qty}</p>
            <div class="qty-control">
              <button data-id="${e.product.id}" data-delta="-1" aria-label="Kurangi">-</button>
              <span>${e.qty}</span>
              <button data-id="${e.product.id}" data-delta="1" aria-label="Tambah">+</button>
              <button class="cart-line-remove" data-remove="${e.product.id}">hapus</button>
            </div>
          </div>
        </div>
      `).join("");

      itemsEl.querySelectorAll("[data-delta]").forEach(btn => {
        btn.addEventListener("click", () => changeQty(btn.dataset.id, Number(btn.dataset.delta)));
      });
      itemsEl.querySelectorAll("[data-remove]").forEach(btn => {
        btn.addEventListener("click", () => removeFromCart(btn.dataset.remove));
      });
    }

    totalEl.textContent = rupiah(cartTotal());
    renderCheckoutSummary();
    updateOrderDateConstraints();
  }

  function renderCheckoutSummary(){
    const entries = cartEntries();
    const summaryEl = document.getElementById("checkoutSummary");
    const totalEl = document.getElementById("checkoutTotal");
    summaryEl.innerHTML = entries.map(e => `
      <div class="checkout-line">
        <span>${e.product.name} &times; ${e.qty}</span>
        <span>${rupiah(e.product.price * e.qty)}</span>
      </div>
    `).join("");
    totalEl.textContent = rupiah(cartTotal());
  }

  function buildWhatsAppMessage(){
    const entries = cartEntries();
    const name = document.getElementById("custName").value.trim();
    const phone = document.getElementById("custPhone").value.trim();
    const address = document.getElementById("custAddress").value.trim();
    const dateVal = document.getElementById("orderDate") ? document.getElementById("orderDate").value : "";

    let msg = "Halo Dapur Emmak, saya mau pesan:\n\n";
    entries.forEach(e => {
      msg += `- ${e.product.name} x${e.qty} (${rupiah(e.product.price * e.qty)})${e.product.isPreOrder ? " [Pre-Order]" : ""}\n`;
    });
    msg += `\nTotal: ${rupiah(cartTotal())}\n\n`;
    msg += `Nama: ${name || "-"}\n`;
    msg += `No. HP: ${phone || "-"}\n`;
    msg += `Alamat/catatan: ${address || "-"}\n`;
    msg += `Tanggal pengambilan/pengiriman: ${dateVal ? formatIDDate(dateVal) : "-"}\n\n`;
    msg += "Bukti pembayaran QRIS akan saya kirim menyusul. Terima kasih!";
    return msg;
  }

  function updateWaLinks(){
    const base = `https://wa.me/${STORE_WHATSAPP}`;
    document.getElementById("waContactLink").href = `${base}?text=${encodeURIComponent(waContactMessage)}`;
    document.getElementById("waCheckoutLink").href = `${base}?text=${encodeURIComponent(buildWhatsAppMessage())}`;
  }

  // ---------- Cart drawer open/close ----------
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  function openCart(){ cartDrawer.classList.add("open"); cartOverlay.classList.add("open"); }
  function closeCart(){ cartDrawer.classList.remove("open"); cartOverlay.classList.remove("open"); }
  document.getElementById("cartToggle").addEventListener("click", () => {
    cartDrawer.classList.contains("open") ? closeCart() : openCart();
  });
  document.getElementById("cartClose").addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  // ---------- Checkout modal open/close ----------
  const checkoutModal = document.getElementById("checkoutModal");
  const checkoutOverlay = document.getElementById("checkoutOverlay");
  function openCheckout(){
    if(cartEntries().length === 0) return;
    updateWaLinks();
    closeCart();
    checkoutModal.classList.add("open");
    checkoutOverlay.classList.add("open");
  }
  function closeCheckout(){
    checkoutModal.classList.remove("open");
    checkoutOverlay.classList.remove("open");
  }
  document.getElementById("checkoutBtn").addEventListener("click", openCheckout);
  document.getElementById("checkoutClose").addEventListener("click", closeCheckout);
  checkoutOverlay.addEventListener("click", closeCheckout);

  ["custName","custPhone","custAddress","orderDate"].forEach(id => {
    document.getElementById(id).addEventListener("input", updateWaLinks);
  });

  document.getElementById("waCheckoutLink").addEventListener("click", (e) => {
    const dateInput = document.getElementById("orderDate");
    if (!dateInput.value){
      e.preventDefault();
      dateInput.focus();
      dateInput.style.borderColor = "var(--coral-600)";
      alert("Mohon isi tanggal pengambilan/pengiriman dulu ya.");
    }
  });

  function renderContent(c){
    const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
    set("heroEyebrow", c.heroEyebrow);
    set("heroTitle", c.heroTitle);
    set("heroSub", c.heroSub);
    set("aboutTitle", c.aboutTitle);
    set("aboutText", c.aboutText);
    set("contactAddress", c.address);
    set("contactHours", c.hours);
    set("contactInstagram", c.instagram);
    if (c.instagram) {
      const igLink = document.getElementById("contactInstagram");
      if (igLink) igLink.href = `https://instagram.com/${c.instagram.replace(/^@/, "")}`;
    }

    if (c.qrisImage) {
      const qrisImg = document.getElementById("qrisImg");
      const qrisPlaceholder = document.getElementById("qrisPlaceholder");
      if (qrisImg && qrisPlaceholder) {
        qrisImg.src = c.qrisImage;
        qrisImg.style.display = "block";
        qrisPlaceholder.style.display = "none";
      }
    }

    if (c.logo) {
      const showLogo = (imgId, svgId) => {
        const img = document.getElementById(imgId);
        const svg = document.getElementById(svgId);
        if (img && svg) {
          img.src = c.logo;
          img.style.display = "block";
          svg.style.display = "none";
        }
      };
      showLogo("logoImgHeader", "logoSvgHeader");
      showLogo("logoImgAbout", "logoSvgAbout");
    }
  }

  // ---------- Init ----------
  document.getElementById("year").textContent = new Date().getFullYear();

  let waContactMessage = "Halo Dapur Emmak, saya mau tanya-tanya soal kue kering.";

  Promise.all([
    fetch("products.json").then(res => res.json()).catch(() => null),
    fetch("content.json").then(res => res.json()).catch(() => null)
  ]).then(([productsData, contentData]) => {
    if (productsData) {
      PRODUCTS = productsData.items || [];
      STORE_WHATSAPP = productsData.whatsapp || "";
    } else {
      document.getElementById("productGrid").innerHTML =
        "<p style='color:var(--ink-soft)'>Produk belum bisa dimuat. Coba refresh halaman.</p>";
    }
    if (contentData) {
      renderContent(contentData);
      if (contentData.waContactMessage) waContactMessage = contentData.waContactMessage;
      preOrderLeadDays = Number(contentData.preOrderLeadDays) || 2;
      preOrderNote = contentData.preOrderNote || "";
    } else {
      preOrderLeadDays = 2;
    }
    renderProducts();
    renderCart();
    updateWaLinks();
  });

})();
