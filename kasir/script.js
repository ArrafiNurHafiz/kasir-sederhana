const transactionForm = document.getElementById('transactionForm');
const productsContainer = document.getElementById('productsContainer');
const addProductBtn = document.getElementById('addProductBtn');
const transactionList = document.getElementById('transactionList');
const totalSalesDisplay = document.getElementById('totalSales');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function renderTransactions() {
  transactionList.innerHTML = '';
  let totalToday = 0;

  transactions.forEach(transaction => {
    const item = document.createElement('li');

    const details = document.createElement('div');
    details.className = 'transaction-details';

    let transactionTotal = 0;

    const productLines = transaction.products.map(p => {
      const subtotal = parseInt(p.qty) * parseInt(p.price);
      transactionTotal += subtotal;
      return `${p.name} • ${p.qty} x Rp${parseInt(p.price).toLocaleString()} = Rp${subtotal.toLocaleString()}`;
    }).join('<br/>');

    details.innerHTML = `
      <strong>${transaction.customer}</strong><br/>
      ${productLines}
      <span class="transaction-total">Total: Rp${transactionTotal.toLocaleString()}</span><br/>
      <span style="font-size:0.8em; color:gray;">${transaction.date}</span>
    `;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Hapus';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = () => {
      transactions = transactions.filter(t => t.id !== transaction.id);
      saveTransactions();
      renderTransactions();
    };

    item.appendChild(details);
    item.appendChild(deleteBtn);
    transactionList.appendChild(item);

    if (transaction.date === getCurrentDate()) {
      totalToday += transactionTotal;
    }
  });

  totalSalesDisplay.textContent = `Total Penjualan Hari Ini: Rp${totalToday.toLocaleString()}`;
}

function getCurrentDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Tambah produk baru
addProductBtn.addEventListener('click', () => {
  const productRow = document.createElement('div');
  productRow.className = 'product-row';
  productRow.innerHTML = `
    <input type="text" class="product-name" placeholder="Produk" required />
    <input type="number" class="product-qty" placeholder="Jumlah" min="1" required />
    <input type="number" class="product-price" placeholder="Harga Satuan" min="0" required />
  `;
  productsContainer.appendChild(productRow);
});

// Submit form
transactionForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const customer = document.getElementById('customer').value.trim();
  const date = document.getElementById('date').value;

  const productRows = productsContainer.querySelectorAll('.product-row');
  const products = [];

  let valid = true;
  productRows.forEach(row => {
    const name = row.querySelector('.product-name').value.trim();
    const qty = row.querySelector('.product-qty').value.trim();
    const price = row.querySelector('.product-price').value.trim();

    if (!name || !qty || !price) {
      valid = false;
    }

    products.push({ name, qty, price });
  });

  if (!customer || !date || !valid) {
    alert("Harap lengkapi semua data.");
    return;
  }

  const newTransaction = {
    id: Date.now(),
    customer,
    products,
    date
  };

  transactions.unshift(newTransaction);
  saveTransactions();
  renderTransactions();

  // Reset form
  productsContainer.innerHTML = `
    <div class="product-row">
      <input type="text" class="product-name" placeholder="Produk" required />
      <input type="number" class="product-qty" placeholder="Jumlah" min="1" required />
      <input type="number" class="product-price" placeholder="Harga Satuan" min="0" required />
    </div>
  `;
  transactionForm.reset();
});

// Inisialisasi
renderTransactions();

// ... bagian lain tetap sama ...

// Fungsi untuk mengunduh riwayat sebagai file .txt
function downloadHistory() {
  let text = "=== Riwayat Transaksi Toko ===\n\n";

  transactions.forEach(transaction => {
    let transactionTotal = 0;

    text += `Nama Pembeli: ${transaction.customer}\n`;
    text += `Tanggal: ${transaction.date}\n`;
    text += `Produk:\n`;

    transaction.products.forEach(p => {
      const subtotal = parseInt(p.qty) * parseInt(p.price);
      transactionTotal += subtotal;
      text += ` - ${p.name} | ${p.qty} x Rp${parseInt(p.price).toLocaleString()} = Rp${subtotal.toLocaleString()}\n`;
    });

    text += `Total Pembelian: Rp${transactionTotal.toLocaleString()}\n`;
    text += `----------------------------------------\n`;
  });

  text += `\n=== Total Penjualan Hari Ini: ${getCurrentDate()} ===\nRp${calculateTodaySales().toLocaleString()}`;

  // Buat blob dan unduh
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'riwayat.txt';
  a.click();
  URL.revokeObjectURL(url);
}

// Hitung total hari ini
function calculateTodaySales() {
  const today = getCurrentDate();
  let total = 0;

  transactions.forEach(transaction => {
    if (transaction.date === today) {
      transaction.products.forEach(p => {
        total += parseInt(p.qty) * parseInt(p.price);
      });
    }
  });

  return total;
}

// Event listener untuk tombol unduh
document.getElementById('downloadBtn').addEventListener('click', downloadHistory);