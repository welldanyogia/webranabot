// const axios = require('./lib/axios.js');
// const md5 = require("./lib/md5.js");
// const venom = require("./lib/venom-bot.js");
const axios = require("axios");
const md5 = require("md5");
const venom = require("venom-bot");
// const fetch = require('node-fetch');

// Konfigurasi API Digiflazz
const username = "mohoveg4ML6o";
const apiKey = "dev-086c4fd0-0429-11ee-b41f-35c825c57159";

//Konfigurasi API Apigames.id
const merchantId = "M230205PCUY8759RP";
const secretKey =
  "65c37d60b2a8ca3e5d9bdbe5b0c7f9fe10aa7d0149a92bd618cacaf03daa3933";

const ownerNumber = "+6281252878597";

// Membuat signature dengan formula md5(username + apiKey + action)
function createSignature(username, apiKey, action) {
  return md5(username + apiKey + action);
}

// Fungsi untuk melakukan deposit
async function doDeposit(username, amount, bank, ownerName) {
  const endpoint = "https://api.digiflazz.com/v1/deposit";
  const signature = createSignature(username, apiKey, "deposit");

  const data = {
    username,
    amount,
    Bank: bank,
    owner_name: ownerName,
    sign: signature,
  };

  try {
    const response = await axios.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error("Error:", error.response.data);
    throw new Error("Failed to process deposit");
  }
}

// Fungsi untuk melakukan pengecekan deposit
async function checkDeposit(username) {
  const endpoint = "https://api.digiflazz.com/v1/cek-saldo";
  const signature = createSignature(username, apiKey, "depo");

  const data = {
    cmd: "deposit",
    username,
    sign: signature,
  };

  try {
    const response = await axios.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error("Error:", error.response.data);
    throw new Error("Failed to check deposit");
  }
}
// Fungsi untuk mendapatkan daftar harga
async function getPriceList(username, cmd) {
  const endpoint = "https://api.digiflazz.com/v1/price-list";
  const signature = createSignature(username, apiKey, "pricelist");

  const data = {
    cmd,
    username,
    sign: signature,
  };

  try {
    const response = await axios.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error("Error:", error.response.data);
    throw new Error("Failed to get price list");
  }
}

// Fungsi untuk mencari harga berdasarkan kode produk
function searchPriceByCode(priceList, code) {
  return priceList.data.find(
    (item) => item.buyer_sku_code === code.toUpperCase()
  );
}

// Fungsi untuk melakukan top-up
async function doTopup(username, buyer_sku_code, customer_no, ref_id) {
  const endpoint = "https://api.digiflazz.com/v1/transaction";
  const signature = createSignature(username, apiKey, ref_id);

  const data = {
    username,
    buyer_sku_code,
    customer_no,
    ref_id,
    sign: signature,
  };

  try {
    const response = await axios.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error("Error:", error.response.data);
    throw new Error("Failed to process top-up");
  }
}

// Fungsi untuk menghasilkan REF-ID acak
function generateRefId(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let refId = "";
  for (let i = 0; i < length; i++) {
    refId += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return refId;
}

// Fungsi untuk menampilkan menu
async function displayMenu(chatId) {
  const menu = `*Fitur WEBRANA BOT :*
1. Deposit: !deposit <jumlah> <bank> <nama_pemilik_rekening>
2. Cek Deposit: !cekdeposit
3. Cek Harga Produk: !digi <kode_produk>
4. Order Produk: !order <kode_produk> <nomor_tujuan>
5. Informasi Akun: !infoakun
6. Cek Akun Game: !cek <kode_game> <ID+Server>`;

  await client.sendText(chatId, menu);
}

// Inisialisasi bot WhatsApp menggunakan Venom
venom.create().then((client) => start(client));

// Menjalankan bot WhatsApp
async function start(client) {
  try {
    // Menangani pesan masuk
    client.onMessage(async (message) => {
      try {
        // Memeriksa jika pesan dari pengirim dan bukan dari bot itu sendiri
        if (
          !message.fromMe &&
          message.body &&
          message.body.toLowerCase() === "!fitur"
        ) {
          const chatId = message.from;
          const menu = `*Fitur WEBRANA BOT :*\n\n1. Deposit: !deposit <jumlah> <bank> <nama_pemilik_rekening>\n2. Cek Deposit: !cekdeposit\n3. Cek Harga Produk: !digi <kode_produk>\n4. Order Produk: !order <kode_produk> <nomor_tujuan>\n5. Informasi Akun: !infoakun\n6. Cek Akun Game: !cek <kode_game> <ID+Server>`;

          await client.sendText(chatId, menu);
        } else if (
          !message.fromMe &&
          message.body &&
          message.body.startsWith("!deposit")
        ) {
          const chatId = message.from;
          //   const isOwner = message.from===ownerNumber;
          // if (!message.fromMe && !isOwner) {
          //   await client.sendText(message.from, 'Maaf, Anda tidak memiliki akses untuk menggunakan fitur ini.');
          //   return;
          // }

          // Mengambil argumen dari pesan
          const args = message.body.split(" ");

          // Memeriksa apakah pesan memiliki argumen yang cukup
          if (args.length != 4) {
            const responseMessage = `*Format pesan tidak sesuai. Gunakan format berikut untuk melakukan deposit:*\n!deposit <jumlah> <bank> <nama_pemilik_rekening>`;
            await client.sendText(chatId, responseMessage);
            return; // Menghentikan eksekusi selanjutnya
          }

          const amount = parseInt(args[1]);
          const bank = args[2];
          const ownerName = args.slice(3).join(" ");

          // Melakukan deposit
          const depositResponse = await doDeposit(
            username,
            amount,
            bank,
            ownerName
          );

          // Mengirimkan balasan ke WhatsApp
          const depositData = depositResponse.data;
          const formattedPrice = `Rp. ${depositData.amount.toLocaleString(
            "id-ID",
            { minimumFractionDigits: 2 }
          )}`;
          const responseMessage = `Deposit berhasil!\nJumlah: ${formattedPrice}\nBerita: ${depositData.notes}`;
          await client.sendText(chatId, responseMessage);
        } else if (
          !message.fromMe &&
          message.body &&
          message.body.toLowerCase() === "!cekdeposit"
        ) {
          const chatId = message.from;
          //   const isOwner = message.from===ownerNumber;
          // if (!message.fromMe && !isOwner) {
          //   await client.sendText(message.from, 'Maaf, Anda tidak memiliki akses untuk menggunakan fitur ini.');
          //   return;
          // }

          // Melakukan pengecekan deposit
          const depositResponse = await checkDeposit(username);

          // Mengirimkan balasan ke WhatsApp
          const depositData = depositResponse.data;
          const responseMessage = `Sisa deposit Anda: ${depositData.deposit}`;
          await client.sendText(chatId, responseMessage);
        } else if (
          !message.fromMe &&
          message.body &&
          message.body.toLowerCase().startsWith("!digi")
        ) {
          const chatId = message.from;
          // const isOwner = message.from===ownerNumber;
          // if (!message.fromMe && !isOwner) {
          //   await client.sendText(message.from, 'Maaf, Anda tidak memiliki akses untuk menggunakan fitur ini.');
          //   return;
          // }
          const args = message.body.split(" ");
          if (args.length != 2) {
            const responseMessage = `*Format pesan tidak sesuai. Gunakan format berikut untuk melakukan pengecekan harga :*\n!digi <kode produk>`;
            await client.sendText(chatId, responseMessage);
            return; // Menghentikan eksekusi selanjutnya
          }

          // Mendapatkan daftar harga prepaid
          const priceListResponse = await getPriceList(username, "prepaid");

          // Mengambil argumen kode produk dari pesan

          const code = args[1];

          // Mencari harga berdasarkan kode produk
          const price = searchPriceByCode(priceListResponse, code);

          // Mengirimkan harga ke WhatsApp
          if (price) {
            const formattedPrice = `Rp. ${price.price.toLocaleString("id-ID", {
              minimumFractionDigits: 2,
            })}`;
            const responseMessage = `*DETAIL PRODUK DIGIFLAZZ*\n\nNama\t\t\t: ${price.product_name}\nKode Produk\t\t: ${price.buyer_sku_code}\nKategori\t\t: ${price.category}\nBrand\t\t\t: ${price.brand}\nHarga\t\t\t: ${formattedPrice}\nSeller\t\t\t: ${price.seller_name}\nStatus Produk Seller\t: ${price.seller_product_status}\nCut Off\t\t: ${price.start_cut_off} - ${price.end_cut_off}\nDeskribsi\t\t: ${price.desc}`;
            await client.sendText(chatId, responseMessage);
          } else {
            await client.sendText(chatId, "Produk tidak ditemukan");
          }
        } else if (
          !message.fromMe &&
          message.body &&
          message.body.toLowerCase().startsWith("!order")
        ) {
          // const chatId = message.from;
          // const isOwner = message.from===ownerNumber;
          //   if (!message.fromMe && !isOwner) {
          //     await client.sendText(message.from, 'Maaf, Anda tidak memiliki akses untuk menggunakan fitur ini.');
          //     return;
          //   }
          const args = message.body.split(" ");
          if (args.length != 3) {
            const responseMessage = `*Format pesan tidak sesuai. Gunakan format berikut untuk melakukan order :*\n!order <kode produk> <nomor tujuan>`;
            await client.sendText(chatId, responseMessage);
            return; // Menghentikan eksekusi selanjutnya
          }
          const refId = generateRefId(9);

          // Mengambil argumen dari pesan

          const buyer_sku_code = args[1];
          const customer_no = args[2];
          const ref_id = refId;

          // Melakukan top-up
          const topupResponse = await doTopup(
            username,
            buyer_sku_code,
            customer_no,
            ref_id
          );

          // Mengirimkan balasan ke WhatsApp
          const topupData = topupResponse.data;
          const DateTime = new Date();
          const date = DateTime.toLocaleDateString("id-ID");
          const time = DateTime.toLocaleTimeString("id-ID");
          const formattedPrice = `Rp. ${topupData.price.toLocaleString(
            "id-ID",
            { minimumFractionDigits: 2 }
          )}`;
          let responseMessage = `Top up berhasil!\nKode: ${topupData.buyer_sku_code}\nNama: ${topupData.product_name}\nNomor Pelanggan: ${topupData.customer_no}\nHarga: Rp. ${formattedPrice}\nStatus: ${topupData.status}\nRef ID: ${topupData.ref_id}\nSerial Number: ${topupData.sn}\nWaktu: ${date} ${time}`;
          await client.sendText(chatId, responseMessage);

          if (topupData.status === "Pending") {
            // Menambahkan callback saat transaksi sukses
            doTopup(username, buyer_sku_code, customer_no, ref_id);

            // responseMessage += `\n\nDetail Top up:\nKode: ${topupData.buyer_sku_code}\nNama: ${topupData.product_name}\nNomor Pelanggan: ${topupData.customer_no}\nHarga: Rp. ${formattedPrice}\nStatus: ${topupData.status}\nRef ID: ${topupData.ref_id}\nSerial Number: ${topupData.sn}\nWaktu: ${date} ${time}`;
            responseMessage += "\n\nTerima kasih atas top up Anda!";
            await client.sendText(chatId, responseMessage);
          }
        } else if (
          !message.fromMe &&
          message.body &&
          message.body.toLowerCase() === "!infoakun"
        ) {
          const signature = md5(`${merchantId}:${secretKey}`);
          const apiUrl = `https://v1.apigames.id/merchant/${merchantId}?signature=${signature}`;

          try {
            const axios = require("axios");
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status === 1 && data.rc === 200) {
              const email = data.data.email;
              const hp = data.data.hp;
              const nama = data.data.nama;
              const saldo = data.data.saldo;

              const infoAkun = `*DETAIL AKUN APIGAMES*\nEmail: ${email}\nNo. HP: ${hp}\nNama: ${nama}\nSaldo: ${saldo}`;
              client.sendText(message.from, infoAkun);
            } else {
              client.sendText(
                message.from,
                "Gagal mendapatkan informasi akun."
              );
            }
          } catch (error) {
            console.error(error);
            client.sendText(
              message.from,
              "Terjadi kesalahan saat mendapatkan informasi akun."
            );
          }
        } else if (
          !message.fromMe &&
          message.body &&
          message.body.toLowerCase().startsWith("!cek")
        ) {
          const chatId = message.from;
          const args = message.body.split(" ");
          if (args.length != 3) {
            const responseMessage = `*Format pesan tidak sesuai. Gunakan format berikut untuk melakukan pengecekan akun game:*\n!cek <kode game> <ID+Server>\nKode Game :\n›ml\n›ff`;
            await client.sendText(chatId, responseMessage);
            return; // Menghentikan eksekusi selanjutnya
          }
          let gameCode = args[1];
          const userId = args[2];
          const signature = md5(`${merchantId}${secretKey}`);

          if (gameCode == "ml") {
            gameCode = "mobilelegend";
          }
          if (gameCode == "ff") {
            gameCode = "freefire";
          }

          const apiUrl = `https://v1.apigames.id/merchant/${merchantId}/cek-username/${gameCode}?user_id=${userId}&signature=${signature}`;

          try {
            const axios = require("axios");
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status === 1 && data.rc === 0) {
              const isValid = data.data.is_valid;
              const username = data.data.username;

              let responseText = "";
              if (isValid) {
                responseText = `*≽  DETAIL AKUN  ≼*\n\n*› Nicknmae* : ${username}\n*› Id Akun* : ${userId}\n\n*Webrana⚡*`;
              } else {
                responseText = "Akun tidak ditemukan.";
              }
              client.sendText(message.from, responseText);
            } else {
              client.sendText(message.from, "Gagal melakukan pengecekan akun.");
            }
          } catch (error) {
            console.error(error);
            client.sendText(
              message.from,
              "Terjadi kesalahan saat melakukan pengecekan akun."
            );
          }
        } else if (
          !message.fromMe &&
          message.body &&
          message.body.toLowerCase().startsWith("!depoapi")
        ) {
          const chatId = message.from;
          const args = message.body.split(" ");
          if (args.length != 2) {
            const responseMessage = `*Format pesan tidak sesuai. Gunakan format berikut untuk melakukan deposit *APIGAMES*:\n!depoapi <nominal>`;
            await client.sendText(chatId, responseMessage);
            return; // Menghentikan eksekusi selanjutnya
          }
          const nominal = args[1];

          const apiUrl = `https://v1.apigames.id/v2/deposit-get?merchant=${merchantId}&nominal=${nominal}&secret=${secretKey}`;

          try {
            const axios = require("axios");
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status === 1 && data.rc === 200) {
              const adminFee = data.data.admin;
              const expiredDate = data.data.expired;
              const depositId = data.data.id;
              const uniqueCode = data.data.kode_unik;
              const transferAmount = data.data.nominal;
              const bankAccount = data.data.rekening;
              const totalTransfer = data.data.total_transfer;

              const responseText = `Deposit berhasil dibuat.\n\nDetail Deposit\nID: ${depositId}\nJumlah Transfer: ${transferAmount}\nBiaya Admin: ${adminFee}\nKode Unik: ${uniqueCode}\nTotal Transfer: ${totalTransfer}\n\nTransfer ke Rekening: ${bankAccount}\n\n*Penting*\nHarap lakukan transfer sebelum tanggal ${expiredDate}. Jangan lupa untuk mencantumkan Kode Unik saat melakukan transfer agar deposit dapat diproses dengan tepat waktu.`;
              client.sendText(message.from, responseText);
            } else {
              client.sendText(message.from, "Gagal membuat deposit.");
            }
          } catch (error) {
            console.error(error);
            client.sendText(
              message.from,
              "Terjadi kesalahan saat membuat deposit."
            );
          }
        } else if (
          !message.fromMe &&
          message.body &&
          message.body.toLowerCase().startsWith("!smileone")
        ) {
          const chatId = message.from;
          const args = message.body.split(" ");
          if (args.length != 1) {
            const responseMessage = `*Format pesan tidak sesuai. Gunakan format berikut untuk melakukan pengecekan koneksi smile one :\n!smileone`;
            await client.sendText(chatId, responseMessage);
            return; // Menghentikan eksekusi selanjutnya
          }
          const signature = md5(`${merchantId}${secretKey}`);

          const apiUrl = `https://v1.apigames.id/merchant/${merchantId}/cek-koneksi?engine=smileone&signature=${signature}`;

          try {
            const axios = require("axios");
            const response = await axios.get(apiUrl);
            const data = response.data;

            if (data.status === 1 && data.rc === 50) {
              const loginStatus = data.data.data.loginStatus;
              const favorite = data.data.data.favorite;
              const favoriteProductCount =
                data.data.data.favorite_product_count;
              const customerName = data.data.data.customer_name;

              let responseText = `*≽  DETAIL KONEKSI AKUN SMILE ONE  ≼*\n\n`;
              responseText += `Login Status: ${
                loginStatus ? "Berhasil" : "Gagal"
              }\n`;
              responseText += `Favorite: ${favorite ? "Ya" : "Tidak"}\n`;
              responseText += `Jumlah Produk Favorit: ${favoriteProductCount}\n`;
              responseText += `Nama Pelanggan: ${customerName}\n`;
              responseText += `*Webrana⚡*`;

              client.sendText(message.from, responseText);
            } else {
              client.sendText(
                message.from,
                "Gagal melakukan pengecekan koneksi Smile One."
              );
            }
          } catch (error) {
            console.error(error);
            client.sendText(
              message.from,
              "Terjadi kesalahan saat melakukan pengecekan koneksi Smile One."
            );
          }
        } else if (
          !message.fromMe &&
          message.body &&
          message.body.toLowerCase().startsWith("!api")
        ) {
          const chatId = message.from;
          const args = message.body.split(" ");
          if (args.length != 1) {
            const responseMessage = `*Format pesan tidak sesuai. Gunakan format berikut untuk melakukan order ke *APIGAMES* :\n!api`;
            await client.sendText(chatId, responseMessage);
            return; // Menghentikan eksekusi selanjutnya
          }
          const produk = args[1];
          const tujuan = args[2];
          const serverId = args[3];
          const refId = generateRefId;

          const signature = md5(`${merchantId}:${secretKey}:${refId}`);

          const apiUrl = "https://v1.apigames.id/v2/transaksi";

          const requestBody = {
            ref_id: refId,
            merchant_id: merchantId,
            produk: produk,
            tujuan: tujuan,
            server_id: serverId,
            signature: signature,
          };

          try {
            const axios = require("axios");
            const response = await axios.post(apiUrl, requestBody, {
              headers: {
                "Content-Type": "application/json",
              },
            });

            const data = response.data;

            if (data.status === 1) {
              const trxId = data.data.trx_id;
              const status = data.data.status;
              const message = data.data.message;
              const sn = data.data.sn;
              const lastBalance = data.data.last_balance;
              const productDetail = data.data.product_detail;

              let responseText = `Order berhasil.\n\nDetail Order\nID Transaksi: ${trxId}\nStatus: ${status}\nMessage: ${message}\nSN: ${sn}\nSaldo Terakhir: ${lastBalance}\n\nDetail Produk\nNama: ${productDetail.name}\nKode: ${productDetail.code}\nHarga: ${productDetail.price} ${productDetail.price_unit}\nRate: ${productDetail.rate}\nHarga (RP): ${productDetail.price_rp}`;

              client.sendText(message.from, responseText);
            } else {
              client.sendText(message.from, "Gagal melakukan order.");
            }
          } catch (error) {
            console.error(error);
            client.sendText(
              message.from,
              "Terjadi kesalahan saat melakukan order."
            );
          }
        }
      } catch (error) {
        console.error("Error:", error);
        const chatId = message.chatId._serialized; // Mengambil chatId pengirim pesan
        const errorMessage = "Terjadi kesalahan dalam memproses permintaan.";
        await client.sendText(chatId, errorMessage);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
