/* global alert, prompt, document, localStorage */
"use strict";

const users = JSON.parse(localStorage.getItem("users") || "[]");
const accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
const cards = JSON.parse(localStorage.getItem("cards") || "[]");
const payments = JSON.parse(localStorage.getItem("payments") || "[]");
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

// ==================== Рендер карток ====================
function renderCards() {
  const list = document.getElementById("cardList");
  if (!list) return;
  list.innerHTML = "";

  if (cards.length === 0) {
    list.innerHTML = "<p>Немає активних карток</p>";
    return;
  }

  cards.forEach(function (card, i) {
    const div = document.createElement("div");
    div.className = "card-display";
    div.innerHTML = `
      <h3>${card.type}</h3>
      <p>Номер: ${card.number}</p>
      <p>Дійсна до: ${card.expiry}</p>
      <p>CVV: ${card.cvv}</p>
      <p>Баланс: ${card.balance.toFixed(2)} грн</p>
      <button onclick="deleteCard(${i})">🗑 Видалити</button>
    `;
    list.appendChild(div);
  });
}

function deleteCard(index) {
  cards.splice(index, 1);
  localStorage.setItem("cards", JSON.stringify(cards));
  renderCards();
}

// ==================== Рендер платежів ====================
function showPayments() {
  const container = document.getElementById("paymentList");
  if (!container) return;
  container.innerHTML = "";

  if (payments.length === 0) {
    container.innerHTML = "<p>Немає платежів</p>";
    return;
  }

  payments.forEach(function (p) {
    const div = document.createElement("div");
    div.className = "payment";
    div.innerHTML = `
      <strong>${p.receiver}</strong> — ${p.amount} грн<br>
      <span>${p.purpose}</span> • ${p.date}
    `;
    container.appendChild(div);
  });
}

// ==================== Обробка форми платежу ====================
function handlePaymentForm(e) {
  e.preventDefault();
  const form = e.target;

  const cardIndex = form.card.selectedIndex;
  const receiver = form.receiver.value.trim();
  const amount = parseFloat(form.amount.value.trim());
  const purpose = form.purpose.value.trim();

  if (!receiver || isNaN(amount) || !purpose || cardIndex < 0) {
    alert("Будь ласка, заповніть усі поля");
    return;
  }

  const card = cards[cardIndex];
  if (card.balance < amount) {
    alert("Недостатньо коштів на картці.");
    return;
  }

  card.balance -= amount;

  payments.push({
    receiver: receiver,
    amount: amount.toFixed(2),
    purpose: purpose,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("cards", JSON.stringify(cards));
  localStorage.setItem("payments", JSON.stringify(payments));

  alert("✅ Платіж здійснено.");
  form.reset();
  showPayments();
  renderCards();
}

// ==================== Поповнення карти ====================
function handleTopUp(e) {
  e.preventDefault();
  const form = e.target;

  const cardIndex = form.topUpCard.selectedIndex;
  const amount = parseFloat(form.topUpAmount.value.trim());

  if (isNaN(amount) || cardIndex < 0) {
    alert("Некоректна сума або картка");
    return;
  }

  cards[cardIndex].balance += amount;
  localStorage.setItem("cards", JSON.stringify(cards));

  alert("💳 Картку поповнено.");
  form.reset();
  renderCards();
}

// ==================== Ініціалізація ====================
document.addEventListener("DOMContentLoaded", function () {
  renderCards();
  showPayments();

  const paymentForm = document.getElementById("paymentForm");
  if (paymentForm) {
    paymentForm.addEventListener("submit", handlePaymentForm);

    const select = paymentForm.querySelector("select[name='card']");
    cards.forEach(function (c, i) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `${c.type} — ${c.number}`;
      select.appendChild(opt);
    });
  }

  const topUpForm = document.getElementById("topUpForm");
  if (topUpForm) {
    topUpForm.addEventListener("submit", handleTopUp);

    const select = topUpForm.querySelector("select[name='topUpCard']");
    cards.forEach(function (c, i) {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `${c.type} — ${c.number}`;
      select.appendChild(opt);
    });
  }
});
