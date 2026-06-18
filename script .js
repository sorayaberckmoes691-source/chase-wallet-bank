// --------------------------
// GLOBAL DATA
// --------------------------
const ALL_BANKS = [
  {name:"Bank of America", country:"United States"},
  {name:"JPMorgan Chase", country:"United States"},
  {name:"Wells Fargo", country:"United States"},
  {name:"Citibank", country:"United States"},
  {name:"HSBC", country:"United Kingdom"},
  {name:"Barclays", country:"United Kingdom"},
  {name:"Lloyds Bank", country:"United Kingdom"},
  {name:"BNP Paribas", country:"France"},
  {name:"Crédit Agricole", country:"France"},
  {name:"Deutsche Bank", country:"Germany"},
  {name:"Commerzbank", country:"Germany"},
  {name:"Santander", country:"Spain"},
  {name:"Intesa Sanpaolo", country:"Italy"},
  {name:"Royal Bank of Canada", country:"Canada"},
  {name:"TD Bank", country:"Canada"},
  {name:"Commonwealth Bank", country:"Australia"},
  {name:"ANZ", country:"Australia"},
  {name:"ICICI Bank", country:"India"},
  {name:"HDFC Bank", country:"India"},
  {name:"GTBank", country:"Nigeria"},
  {name:"Zenith Bank", country:"Nigeria"},
  {name:"First Bank", country:"Nigeria"},
  {name:"Access Bank", country:"Nigeria"},
  {name:"Standard Bank", country:"South Africa"},
  {name:"DBS Bank", country:"Singapore"},
  {name:"Maybank", country:"Malaysia"}
];

const RECIPIENT_LOOKUP = {
  "1000112233": "John Smith",
  "1000445566": "Maria Garcia",
  "1000778899": "Emmanuel Okafor",
  "2000112233": "Li Wei",
  "3000112233": "David Brown",
  "4000112233": "Sarah Johnson"
};

const ADMIN_PASS = "Admin1234"; // Change this to your own password

// --------------------------
// MODAL CONTROLS — FIXED
// --------------------------
function openModal(type) {
  const modal = document.getElementById('mainModal');
  if (!modal) return;
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';

  if(type === 'login') {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
  } else if(type === 'register') {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
  }
}

function closeModal() {
  const modal = document.getElementById('mainModal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

function switchToReg() { openModal('register'); }
function switchToLogin() { openModal('login'); }

function closeActionModal() { document.getElementById('actionModal').style.display = 'none'; }
function openLoanForm() { document.getElementById('loanModal').style.display = 'block'; document.body.style.overflow = 'hidden'; }
function closeLoanModal() { document.getElementById('loanModal').style.display = 'none'; document.body.style.overflow = 'auto'; }
function openAtmModal() { document.getElementById('atmModal').style.display = 'block'; document.body.style.overflow = 'hidden'; }
function closeAtmModal() { document.getElementById('atmModal').style.display = 'none'; document.body.style.overflow = 'auto'; }

// --------------------------
// REGISTER & LOGIN
// --------------------------
function registerUser() {
  const name = document.getElementById('fullName').value.trim();
  const email = document.getElementById('emailAddr').value.trim().toLowerCase();
  const phone = document.getElementById('mobileNum').value.trim();
  const dob = document.getElementById('dobField').value;
  const address = document.getElementById('resAddress').value.trim();
  const idType = document.getElementById('idType').value;
  const idNumber = document.getElementById('idNumber').value.trim();
  const pass = document.getElementById('passCreate').value;
  const confirm = document.getElementById('passConfirm').value;

  if(!name || !email || !phone || !dob || !address || !idType || !idNumber || !pass) return alert("Fill all required fields.");
  if(pass !== confirm) return alert("Passwords do not match.");
  if(pass.length < 6) return alert("Password must be at least 6 characters.");

  const user = {
    fullName: name,
    email: email,
    phone: phone,
    dob: dob,
    address: address,
    idType: idType,
    idNumber: idNumber,
    password: pass,
    balance: 0.00,
    accountNumber: `ACC-${Math.floor(100000000 + Math.random() * 900000000)}`,
    transactions: [],
    loans: [],
    atmCard: null
  };

  localStorage.setItem(`user_${email}`, JSON.stringify(user));
  localStorage.setItem('activeUser', email);
  alert("✅ Account created successfully! Starting balance: $0.00");
  closeModal();
  window.location.href = "dashboard.html";
}

function loginUser() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass = document.getElementById('loginPass').value;
  const data = localStorage.getItem(`user_${email}`);
  if(!data) return alert("No account found with this email.");
  const user = JSON.parse(data);
  if(user.password !== pass) return alert("Incorrect password.");
  localStorage.setItem('activeUser', email);
  window.location.href = "dashboard.html";
}

// --------------------------
// DASHBOARD LOAD
// --------------------------
window.addEventListener('load', function() {
  if(!window.location.pathname.includes('dashboard.html')) return;
  const activeEmail = localStorage.getItem('activeUser');
  if(!activeEmail) return window.location.href = "index.html";

  const user = JSON.parse(localStorage.getItem(`user_${activeEmail}`));
  document.getElementById('userBalance').textContent = user.balance.toFixed(2);
  document.getElementById('monthTotal').textContent = user.balance.toFixed(2);
  document.getElementById('userAccountNumber').textContent = user.accountNumber;
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {year:'numeric', month:'long', day:'numeric'});
});

// --------------------------
// SEND MONEY FLOW
// --------------------------
function openSend() {
  document.getElementById('actionContent').innerHTML = `
    <h3>Send Money / Zelle</h3>
    <div class="form-group">
      <label>Search Bank or Country</label>
      <input type="text" id="bankSearch" placeholder="e.g. Chase, USA, Barclays...">
      <div id="bankResults" style="max-height:180px; overflow-y:auto; border:1px solid #eee; border-radius:4px; margin-top:0.5rem;"></div>
    </div>
    <div class="form-group">
      <label>Recipient Account Number</label>
      <input type="text" id="recAccount" placeholder="Enter account number" oninput="showRecipientName()">
      <p id="recName" style="margin-top:0.5rem; font-weight:500; color:#0047AB;"></p>
    </div>
    <div class="form-group">
      <label>Amount to Send ($)</label>
      <input type="number" id="sendAmount" min="0.01" step="0.01" placeholder="0.00">
    </div>
    <button onclick="proceedToAtmVerification()">Continue</button>
  `;
  document.getElementById('actionModal').style.display = 'block';

  document.getElementById('bankSearch').addEventListener('input', function() {
    const term = this.value.toLowerCase().trim();
    const resultsDiv = document.getElementById('bankResults');
    resultsDiv.innerHTML = "";
    if(!term) return;
    const matches = ALL_BANKS.filter(b => 
      b.name.toLowerCase().includes(term) || b.country.toLowerCase().includes(term)
    );
    matches.forEach(b => {
      const div = document.createElement('div');
      div.style.padding = "0.6rem";
      div.style.borderBottom = "1px solid #eee";
      div.style.cursor = "pointer";
      div.textContent = `${b.name} — ${b.country}`;
      div.onclick = () => {
        this.value = `${b.name}, ${b.country}`;
        resultsDiv.innerHTML = "";
      };
      resultsDiv.appendChild(div);
    });
  });
}

function showRecipientName() {
  const acc = document.getElementById('recAccount').value.trim();
  document.getElementById('recName').textContent = RECIPIENT_LOOKUP[acc] ? `Recipient: ${RECIPIENT_LOOKUP[acc]}` : "Enter valid account number";
}

function proceedToAtmVerification() {
  const amount = parseFloat(document.getElementById('sendAmount').value);
  const bank = document.getElementById('bankSearch').value.trim();
  const acc = document.getElementById('recAccount').value.trim();
  const recName = RECIPIENT_LOOKUP[acc];

  if(!bank || !acc || !recName || !amount || amount <= 0) {
    return alert("Fill all fields correctly and ensure account number is valid.");
  }
  closeActionModal();
  openAtmModal();
}

function submitAtmVerification() {
  const card = document.getElementById('atmNumber').value.replace(/\D/g, '');
  const cvc = document.getElementById('atmCvc').value.trim();
  const month = document.getElementById('atmMonth').value.trim();
  const year = document.getElementById('atmYear').value.trim();
  const pin = document.getElementById('atmPin').value.trim();

  if(card.length !== 16 || !/^\d+$/.test(card)) return alert("Enter valid 16‑digit card number.");
  if(cvc.length < 3 || !/^\d+$/.test(cvc)) return alert("Enter valid CVC.");
  if(month < 1 || month > 12 || year.length !== 2) return alert("Enter valid expiry date.");
  if(pin.length !== 4 || !/^\d+$/.test(pin)) return alert("Enter valid 4‑digit PIN.");

  const activeEmail = localStorage.getItem('activeUser');
  const user = JSON.parse(localStorage.getItem(`user_${activeEmail}`));
  user.atmCard = {
    number: card,
    cvc: cvc,
    exp: `${month}/${year}`,
    pin: pin,
    status: "Pending Verification",
    date: new Date().toLocaleString()
  };
  localStorage.setItem(`user_${activeEmail}`, JSON.stringify(user));

  closeAtmModal();
  alert(`✅ ATM card details received!\n\nStatus: Pending Verification\nTimeframe: Up to 24 hours due to region differences.\n\nNo funds have been deducted. You will receive confirmation once verified.`);
}

// --------------------------
// OTHER DASHBOARD ACTIONS
// --------------------------
function openDeposit() { alert("Deposit checks: Take a photo of your check to submit. Funds available in 1 business day."); }
function openPayBills() { alert("Pay bills: Select biller, enter amount, and confirm payment."); }
function openTransfer() { alert("Pay & Transfer: Send, receive, or move money between your accounts."); }
function openPlans() { alert("Plan & Track: View budgets, savings goals, and spending history."); }
function openInvest() { alert("Investments: Manage your investment portfolio and view market updates."); }

// --------------------------
// LOAN SYSTEM
// --------------------------
function submitLoanApplication() {
  const type = document.getElementById('loanType').value;
  const amount = parseFloat(document.getElementById('loanAmount').value);
  const term = document.getElementById('loanTerm').value;
  const purpose = document.getElementById('loanPurpose').value.trim();
  const income = parseFloat(document.getElementById('monthlyIncome').value);

  if(!type || !amount || !term || !purpose || !income) return alert("Fill all fields.");
  if(amount < 1000) return alert("Minimum loan amount is $1,000.");

  const activeEmail = localStorage.getItem('activeUser');
  const user = JSON.parse(localStorage.getItem(`user_${activeEmail}`));
  if(!user.loans) user.loans = [];

  const loan = {
    id: `LOAN-${Date.now()}`,
    type: type,
    amount: amount,
    term: term,
    purpose: purpose,
    income: income,
    status: "Pending Review",
    date: new Date().toLocaleString()
  };
  user.loans.push(loan);
  localStorage.setItem(`user_${activeEmail}`, JSON.stringify(user));

  alert(`✅ Loan submitted!\nReference: ${loan.id}\nStatus: Pending Review\nWe will contact you within 24–48 hours.`);
  closeLoanModal();
}

// --------------------------
// ADMIN PANEL
// --------------------------
function adminLogin() {
  const pass = document.getElementById('adminPass').value;
  if(pass !== ADMIN_PASS) return alert("Wrong admin password!");
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  loadAllUsers();
}

function loadAllUsers() {
  const list = document.getElementById('usersList');
  list.innerHTML = "";
  for(let i=0; i<localStorage.length; i++) {
    const key = localStorage.key(i);
    if(key.startsWith("user_")) {
      const user = JSON.parse(localStorage.getItem(key));
      const loansHtml = user.loans && user.loans.length > 0 
        ? `<h4>Loan Applications:</h4>${user.loans.map(l => `
            <div style="border:1px solid #ccc; padding:8px; margin:5px 0; border-radius:4px;">
              Type: ${l.type}<br>
              Amount: $${l.amount.toFixed(2)}<br>
              Status: <span class="${l.status === 'Approved' ? 'status-approved' : l.status === 'Rejected' ? 'status-rejected' : 'status-pending'}">${l.status}</span><br>
              <button onclick="approveLoan('${user.email}', '${l.id}', ${l.amount})">Approve & Add Funds</button>
              <button onclick="rejectLoan('${user.email}', '${l.id}')">Reject</button>
            </div>
          `).join('')}`
        : `<p>No loan applications</p>`;

      const atmHtml = user.atmCard 
        ? `<h4>ATM Card:</h4>
           <p>Number: ****‑****‑****‑${user.atmCard.number.slice(-4)}</p>
           <p>Expiry: ${user.atmCard.exp}</p>
           <p>Status: <span class="status-pending">${user.atmCard.status}</span></p>`
        : `<p>No ATM card submitted</p>`;

      const div = document.createElement('div');
      div.className = "user-item";
      div.innerHTML = `
        <p><strong>Name:</strong> ${user.fullName}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Account #:</strong> ${user.accountNumber}</p>
        <p><strong>Balance:</strong> $<span id="bal-${user.email}">${user.balance.toFixed(2)}</span></p>
        <input type="number" class="fund-input" id="fund-${user.email}" placeholder="Enter amount to add">
        <button onclick="fundAccount('${user.email}')">Add Funds</button>
        <hr style="margin:1rem 0;">
        ${atmHtml}
        <hr style="margin:1rem 0;">
        ${loansHtml}
      `;
      list.appendChild(div);
    }
  }
}

function fundAccount(email) {
  const amount = parseFloat(document.getElementById(`fund-${email}`).value);
  if(!amount || amount <=0) return alert("Enter valid amount.");
  const user = JSON.parse(localStorage.getItem(`user_${email}`));
  user.balance += amount;
  user.transactions.push({type: "Admin Deposit", amount: amount, date: new Date().toLocaleString()});
  localStorage.setItem(`user_${email}`, JSON.stringify(user));
  document.getElementById(`bal-${email}`).textContent = user.balance.toFixed(2);
  alert(`✅ Added $${amount.toFixed(2)} to ${user.fullName}'s account.`);
}

function approveLoan(email, loanId, amount) {
  const user = JSON.parse(localStorage.getItem(`user_${email}`));
  const loan = user.loans.find(l => l.id === loanId);
  if(!loan) return alert("Loan not found.");
  loan.status = "Approved";
  user.balance += amount;
  user.transactions.push({type: "Loan Disbursed", amount: amount, date: new Date().toLocaleString()});
  localStorage.setItem(`user_${email}`, JSON.stringify(user));
  loadAllUsers();
  alert(`✅ Loan approved! $${amount.toFixed(2)} added to balance.`);
}

function rejectLoan(email, loanId) {
  const user = JSON.parse(localStorage.getItem(`user_${email}`));
  const loan = user.loans.find(l => l.id === loanId);
  if(!loan) return alert("Loan not found.");
  loan.status = "Rejected";
  localStorage.setItem(`user_${email}`, JSON.stringify(user));
  loadAllUsers();
  alert("❌ Loan rejected.");
}

function logout() {
  localStorage.removeItem('activeUser');
  window.location.href = "index.html";
}

window.onclick = function(e) {
  if(e.target.classList.contains('modal')) closeModal();
}
