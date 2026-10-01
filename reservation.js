(function(){
  "use strict";

  const rupiah = (n) => "Rp" + n.toLocaleString("id-ID");
  const formatIDDate = (isoStr) => {
    if (!isoStr) return "-";
    const d = new Date(isoStr + "T00:00:00");
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  let PRODUCTS = [];
  let STORE_WHATSAPP = "";

  function renderReservationProducts(){
    const container = document.getElementById("reservationProducts");
    container.innerHTML = PRODUCTS.map(p => `
      <label class="reservation-item">
        <input type="checkbox" data-res-id="${p.id}">
        <span>${p.name}${p.isPreOrder ? " (Pre-Order)" : ""}</span>
        <span class="res-price">${rupiah(p.price)}</span>
      </label>
    `).join("");
    container.querySelectorAll("input[type=checkbox]").forEach(cb => {
      cb.addEventListener("change", updateReservationLink);
    });
  }

  function buildReservationMessage(){
    const name = document.getElementById("resName").value.trim();
    const phone = document.getElementById("resPhone").value.trim();
    const date = document.getElementById("resDate").value;
    const note = document.getElementById("resNote").value.trim();

    const chosenIds = Array.from(document.querySelectorAll("#reservationProducts input:checked")).map(cb => cb.dataset.resId);
    const chosenProducts = PRODUCTS.filter(p => chosenIds.includes(p.id));

    let msg = "Halo Dapur Emmak, saya mau reservasi kue (belum bayar, ini baru catatan minat):\n\n";
    if (chosenProducts.length){
      chosenProducts.forEach(p => { msg += `- ${p.name}\n`; });
    } else {
      msg += "- (belum pilih kue tertentu)\n";
    }
    msg += `\nPerkiraan tanggal ambil: ${date ? formatIDDate(date) : "-"}\n`;
    msg += `Nama: ${name || "-"}\n`;
    msg += `No. HP: ${phone || "-"}\n`;
    if (note) msg += `Catatan: ${note}\n`;
    msg += "\nMohon info kalau kuenya tersedia untuk tanggal itu ya, terima kasih!";
    return msg;
  }

  function updateReservationLink(){
    const link = document.getElementById("waReservationLink");
    link.href = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(buildReservationMessage())}`;
  }

  ["resName","resPhone","resDate","resNote"].forEach(id => {
    document.getElementById(id).addEventListener("input", updateReservationLink);
  });

  document.getElementById("waReservationLink").addEventListener("click", (e) => {
    const chosen = document.querySelectorAll("#reservationProducts input:checked").length;
    const date = document.getElementById("resDate").value;
    if (chosen === 0 || !date){
      e.preventDefault();
      alert("Mohon pilih minimal satu kue dan isi perkiraan tanggal pengambilan dulu ya.");
    }
  });

  function applyLogo(c){
    if (!c.logo) return;
    const img = document.getElementById("logoImgHeader");
    const svg = document.getElementById("logoSvgHeader");
    if (img && svg) {
      img.src = c.logo;
      img.style.display = "block";
      svg.style.display = "none";
    }
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  Promise.all([
    fetch("products.json").then(res => res.json()).catch(() => null),
    fetch("content.json").then(res => res.json()).catch(() => null)
  ]).then(([productsData, contentData]) => {
    PRODUCTS = (productsData && productsData.items) || [];
    STORE_WHATSAPP = (productsData && productsData.whatsapp) || "";

    const isOpen = !!(contentData && contentData.reservationEnabled);
    document.getElementById("reservationOpen").style.display = isOpen ? "block" : "none";
    document.getElementById("reservationClosed").style.display = isOpen ? "none" : "block";

    if (contentData) {
      applyLogo(contentData);
      const titleEl = document.getElementById("reservationTitle");
      if (titleEl && contentData.reservationTitle) titleEl.textContent = contentData.reservationTitle;
      const descEl = document.getElementById("reservationDesc");
      if (descEl && contentData.reservationDesc) descEl.textContent = contentData.reservationDesc;
      const noteEl = document.getElementById("reservationNote");
      if (noteEl) noteEl.textContent = contentData.reservationNote || "";
    }

    if (isOpen) {
      renderReservationProducts();
      updateReservationLink();
    }
  });

})();
