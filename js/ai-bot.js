// ============================================================
//  ConnectFarm — ai-bot.js
//  Dummy AI assistant chatbot
// ============================================================

const CF_BOT = {
  responses: {
    greeting: ["Hello! 👋 I'm FarmBot, your ConnectFarm assistant! How can I help you today?", "Hi there! I'm here to help you with orders, products, and more! 🌿"],
    order: ["Your order is being processed! Fresh produce will be picked and delivered soon. 🚚", "I can see your order is on the way! Our delivery partner will reach you within the estimated time. 📦", "Your order has been assigned to a farmer and is being prepared with care. 🌾"],
    delivery: ["Your delivery is being tracked in real-time. Expected arrival as per the status shown. 🗺️", "Our delivery agent is on the way! You'll get an update when they're close. 🚚"],
    price: ["All prices on ConnectFarm are farm-gate prices — no middlemen! You get the best rates directly from farmers. 💚", "Our prices are updated daily based on farm availability. We guarantee freshness at fair prices. 🌿"],
    fresh: ["All products are harvested within 24 hours of delivery! We work directly with verified farmers. 🌾", "ConnectFarm guarantees farm-fresh produce. Products are never stored for more than 24 hours. ✅"],
    refund: ["For any quality issues, please contact support. We offer full refunds within 24 hours of delivery. 💰", "We have a 100% satisfaction guarantee! If you're unhappy with any product, we'll replace or refund it. 🙏"],
    farmer: ["ConnectFarm works with 124+ verified farmers across India. Every farmer is background-checked and quality-audited. 🌾", "Our farmers are certified and follow sustainable farming practices. Your purchase directly supports Indian agriculture. 💚"],
    payment: ["We accept UPI, Credit/Debit cards, Net Banking, and Cash on Delivery. All payments are 100% secure. 💳", "You can pay via any UPI app (GPay, PhonePe, Paytm) or use COD for maximum convenience! 📱"],
    delivery_time: ["Standard delivery is 2-6 hours depending on your location. We deliver 7 days a week, including holidays! ⏰", "Our express slots: Morning (6-10 AM) and Evening (4-8 PM). Premium slots available for same-day delivery. 🕐"],
    default: ["That's a great question! Our team is looking into it. For urgent queries, please call +91-80000-12345. 😊", "I'm still learning! For detailed queries, please use the Help section or email support@connectfarm.in 📧", "Thanks for reaching out! I'll note this for our team to improve the service. Is there anything else I can help with? 🌟"]
  },

  getResponse(input) {
    const msg = input.toLowerCase();
    if (msg.match(/hi|hello|hey|namaste/)) return this._random(this.responses.greeting);
    if (msg.match(/order|order.*status|track/)) return this._random(this.responses.order);
    if (msg.match(/deliver|delivery|when.*arrive/)) return this._random(this.responses.delivery_time);
    if (msg.match(/fresh|quality|organic/)) return this._random(this.responses.fresh);
    if (msg.match(/price|cost|rate|cheap/)) return this._random(this.responses.price);
    if (msg.match(/refund|return|complaint|issue|problem/)) return this._random(this.responses.refund);
    if (msg.match(/farmer|farm|source/)) return this._random(this.responses.farmer);
    if (msg.match(/pay|payment|upi|card|cod/)) return this._random(this.responses.payment);
    return this._random(this.responses.default);
  },

  _random(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

  init() {
    const widget = document.getElementById('chatbot-widget');
    if (!widget) return;

    const btn = widget.querySelector('.chatbot-btn');
    const sendBtn = widget.querySelector('.chatbot-send');
    const input = widget.querySelector('.chatbot-input');
    const messages = widget.querySelector('.chatbot-messages');

    if (!btn) return;

    // Welcome message
    this._addMessage(messages, this._random(this.responses.greeting), 'bot');

    btn.addEventListener('click', () => widget.classList.toggle('open'));

    const send = () => {
      const text = input.value.trim();
      if (!text) return;
      this._addMessage(messages, text, 'user');
      input.value = '';
      // Simulate typing delay
      setTimeout(() => {
        this._addMessage(messages, this.getResponse(text), 'bot');
      }, 700);
    };

    if (sendBtn) sendBtn.addEventListener('click', send);
    if (input) {
      input.addEventListener('keypress', e => { if (e.key === 'Enter') send(); });
    }
  },

  _addMessage(container, text, type) {
    if (!container) return;
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }
};

window.CF_BOT = CF_BOT;
