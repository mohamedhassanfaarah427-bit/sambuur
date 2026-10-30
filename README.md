# NIDAAMKA MAAMULKA BAKHAARKA JUMLADA EE QALABKA ELEKTAROONIGA
### (Electronics Wholesale ERP & Inventory Management System)

Nidaamkan waxaa loogu talagalay ganacsiyada waaweyn iyo bakhaarada **Jumlada (Wholesale)** ee iibiya qalabka elektarooniga ah ee kala duwan sida:
* **Telefoonnada Gacanta & Taablaydhada** (*Smartphones, Tablets, Chargers*)
* **Qasaaladaha Dharka** (*Front Load, Top Load, Semi-Automatic*)
* **Firinjiyeerada & Qaboojiyeyaasha** (*Refrigerators, Chest Freezers, Inverters*)
* **Qaboobiyeyaasha Hawada** (*Air Conditioners - Split AC, Standing AC*)
* **Telefishannada & Qalabka Codka** (*Smart TVs 4K, Home Theaters, Soundbars*)
* **Qalabka Qorraxda & Inverter-yada** (*Hybrid Solar Inverters, Accessories*)

Nidaamkan waxaa lagu dhisay **Pure HTML5, CSS3, iyo Modern Vanilla JavaScript**, mana u baahna server ama database adag; waxa uu si toos ah ugu shaqeynayaa browser-kaaga isaga oo xogta ku keydinaya **LocalStorage** isla markaana leh nidaam **Backup & Restore** buuxa.

---

## 🔐 XOGTA GELITAANKA (Login Credentials & Roles)

Nidaamku wuxuu leeyahay nidaam adag oo xakameynaya awoodaha (**Role-Based Access Control**):

| Doorka (Role) | Username | Password | Awoodaha (Permissions) |
|---|---|---|---|
| 👑 **Admin (Maamulaha Guud)** | `admin` | **`9090`** | **Awood Buuxda (Full Control):** Kaliya Admin-ka ayaa ku dari kara, wax ka beddeli kara ama tirtiri kara alaabta, qiimaha, kunteenarrada, daymaha, users-ka cusub iyo settings-ka. Wuxuu kaloo arki karaa faa'iidada saafiga ah iyo raasumaalka. |
| 👤 **Shaqaale (Cashier)** | `cashier` | **`1234`** | **Iibka Kaliya (Sales/POS Only):** Wuxuu goyn karaa rasiidhada jumlada, arki karaa alaabta taal, qaban karaa lacagaha. **WAA KA MAMNUUC** inuu wax ka beddelo qiimaha, tirada alaabta, tirtiro wax xog ah, arko raasumaalka/faa'iidada, ama galo settings-ka! |

---

## 🚀 SIDA LOO FURAYO NIDAAMKA (Quick Start)
1. Tag galka mashruuca: `c:\Users\hp\Desktop\sank_pro\`
2. Guji laba jeer faylka **`index.html`** si uu kuugu furmo browser-kaaga (Google Chrome ama Microsoft Edge).
3. Shaashadda Login-ka waxaad ku geli kartaa:
   - Username: **`admin`**
   - Password: **`9090`**
   *(Ama guji badhanka degdegga ah ee `👑 Admin` ama `👤 Shaqaale` si toos ah)*.

## 🌟 QEYBAHA & AWOODDA NIDAAMKA (Key Features)

### 1. 📊 Dulmar Guud (Dashboard)
- **Qiimaha Raasumaalka Yaal (Stock Cost Value):** Lacagta guud ee raasumaalka ah ee alaabta bakhaarka taal ku fadhido.
- **Qiimaha Jumlada (Wholesale Stock Value):** Qiimaha aad ka heli doonto haddii dhammaan alaabta la wada iibiyo.
- **Dakhliga & Faa'iidada Dhabta ah (Gross Profit):** Xisaabinta faa'iidada saafiga ah ee iib kasta.
- **Deymaha Macaamiisha (Outstanding Debt):** Wadarta daymaha dibadda ku maqan ee ganacsatada lagu leeyahay.
- **Digniinta Alaabta Yar (Low Stock Alert):** Alaabta go'day ama qarka u saaran inay go'do.
- **Shaxda Qeybaha (Interactive Canvas Chart):** Muujinaya lacagta kaga jirta qeyb kasta (Mobiles, Qasaalado, Firinjiyeero, AC, TV).

### 2. 📦 Bakhaarka Alaabta (Inventory Management)
- **Diiwaangelin Dhameystiran:** Magaca alaabta, Shirkadda (Samsung, LG, Gree, Apple, Hisense...), Model, Barcode, Damaanadda (Warranty), iyo Faahfaahinta farsamo (Specifications).
- **Qeybinta Jumlada:** Kala soocida **Kartoon** (oo wata inta xabbo ee ku jirta) iyo **Xabbo**.
- **Xisaabinta Margin-ka:** Qiyaasta faa'iidada boqolkiiba (+% Margin) inta u dhexeysa qiimaha soo iibsiga iyo jumlada.
- **Hagaajinta Stock-ga (Stock In / Stock Out):** Ku darista kunteenarrada cusub ee soo dega ama jarista alaabta cilladowda.
- **Filter & Search:** Baaritaan degdeg ah oo ku saleysan Magac, Barcode, Brand, Qeyb (Categories) iyo xaaladda stock-ga.
- **Dhoofinta CSV:** Soo dejiso xogta alaabta oo Excel/CSV ah hal gujin kaliya.

### 3. 🧾 Iibka Jumlada & Soo Saarista Rasiidka (Wholesale POS & Invoicing)
- **Iib Degdeg ah:** Ka dooro alaabta liiska ama isticmaal Barcode Scanner (gali barcode-ka kadibna riix Enter).
- **Macaamiisha Jumlada:** Doorashada macmiilka, muujinta deyntii hore ee lagu lahaa, iyo darajadiisa (VIP / Regular).
- **Qiimo Dhimis (Wholesale Discount):** Ku dar qiimo dhimis wadarta guud ee iibka.
- **Hababka Lacag Bixinta:** Kaash (Cash), EVC Plus, Zaad, Sahal, IBS/Salaam Bank, ama Deyn Buuxda/Qeyb.
- **Jarista Tooska ah:** Marka iibka la dhammaystiro, nidaamku si toos ah ayuu stock-ga uga goynayaa alaabta, deyntana ugu darayaa macmiilka.
- **Rasiid Daabacan (Printable Wholesale Invoice):** Rasiid rasmi ah oo leh magaca bakhaarka, faahfaahinta damaanadda, shaabadda, iyo saxiixyada oo loogu talagalay daabacaadda A4 ama Thermal printer (`Ctrl + P`).

### 4. 👥 Macaamiisha & Xisaabinta Daymaha (Customer Debt Ledger)
- Diiwaanka dukaanleeyda iyo ganacsatada gobollada iyo magaalooyinka wax ka qaadata.
- **Bixi Deyn:** Qabashada lacagaha daymaha ah (qeyb ama wada dhan) iyo cusboonaysiinta xisaabta macmiilka.
- **Taariikhda Rasiidhada:** Dib u eeg dhammaan rasiidhadii hore ee macmiil gaar ah qaatay.

### 5. 🏢 Shirkadaha & Alaab-keenayaasha (Suppliers)
- Maamulka shirkadaha Dubai, Shiinaha, iyo wakiilada maxalliga ah ee aad kunteenarrada ka soo iibsataan.

### 6. 📈 Warbixino & Xisaabaad (Reports & Analytics)
- Diiwaanka dhammaan iibka taariikhi ah.
- Dib u daabacidda rasiid kasta oo hore loo jaray.
- Soo dejisashada warbixinta iibka oo ku jirta fayl Excel/CSV ah.

### 7. ⚙️ Habaynta & Badbaadada Xogta (Settings & Backup)
- Beddel magaca bakhaarka, taleefannada, cinwaanka, iyo shuruudaha damaanadda ee ku qoran rasiidka.
- **Download Backup JSON:** Soo dajiso nuqul keyd ah oo dhammaan xogtaada ah si aysan u lumin.
- **Restore Backup JSON:** Dib ugu shub faylkaagii keydka ahaa browser kasta ama kombuyuutar kale.

---

## ⌨️ SHORCUTS-KA DEGDEGGA AH (Keyboard Shortcuts)
- **`F1`** : U gudub Dulmar Guud (Dashboard)
- **`F2`** : U gudub Iibka Jumlada (POS Terminal)
- **`F3`** : U gudub Bakhaarka Alaabta (Inventory)
- **`Escape`** : Xir daaqad kasta oo modal ah oo furan

---

## 📂 Dhismaha Faylashada (Project Structure)
```
sank_pro/
├── index.html           # Bogga guud ee nidaamka
├── css/
│   └── style.css        # Naqshadda, midabada, qaabeynta rasiidka & responsive
├── js/
│   ├── data.js          # Xogta tusaalaha ah ee qalabka elektarooniga
│   ├── storage.js       # Maamulka LocalStorage, Backup & CSV
│   ├── inventory.js     # Maamulka alaabta, stock in/out & filters
│   ├── pos.js           # Iibka jumlada, gaadhiga & rasiidhada
│   ├── customers.js     # Macaamiisha & maamulka daymaha
│   ├── suppliers.js     # Shirkadaha alaabta keena
│   ├── reports.js       # Xisaabaadka, warbixinada & canvas chart
│   └── app.js           # Xiriiriyaha guud, tabs-ka, saacadda & toasta
└── README.md            # Hagaha buuxa ee nidaamka
```
