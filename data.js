/**
 * DATA.JS - Xogta Bilowga ah ee Nidaamka Jumlada Elektarooniga
 * v2.1 - Realistic product images, 6 AC products, Customer Portal role.
 */

const DEFAULT_DATA = {
    settings: {
        storeName: "HORN ELECTRONICS & APPLIANCES WHOLESALE",
        subTitle: "Bakhaarka Guud ee Qalabka Korontada, Telefoonnada & Qasaaladaha",
        phone: "+252 61 5000000 / +252 63 4000000",
        email: "sales@hornelectronics.so",
        address: "Wadada Suuqa Bakaaraha / Suuqa Hoose, Somalia",
        currency: "$",
        taxRate: 0,
        invoiceFooter: "Mahadsanid! Alaabta korontada waxay leedahay damaanad rasmi ah (Warranty) sida ku xusan rasiidka. Alaabta la iibiyey dib looma celiyo hadii aysan cillad lahayn."
    },
    categories: [
        { id: "mobiles",     name: "Telefoonno & Taablaydh",          icon: "\uD83D\uDCF1", desc: "Mobiles, Tablets, Smart Watches" },
        { id: "qasaalado",   name: "Qasaalado (Washing Machines)",    icon: "\uD83E\uDDFA", desc: "Front Load, Top Load, Semi-Auto" },
        { id: "firinjiyeer", name: "Firinjiyeero & Qaboojiyeyaal",    icon: "\u2744\uFE0F", desc: "Refrigerators, Chest Freezers, Showcases" },
        { id: "qaboobiye",   name: "Qaboobiyeyaal (Air Conditioners)",icon: "\uD83D\uDCA8", desc: "Split AC, Standing AC, Inverter AC" },
        { id: "tv_audio",    name: "Telefishanno & Soundbars",         icon: "\uD83D\uDCFA", desc: "Smart TVs 32-75 inch, Sound systems" },
        { id: "accessories", name: "Qalabka Korontada & Accessories",  icon: "\uD83D\uDD0C", desc: "Solar Inverters, Chargers, Cables, Batteries" }
    ],
    products: [

        // ===================== MOBILES =====================
        {
            id: "PROD-101",
            name: "iPhone 15 Pro Max 256GB",
            category: "mobiles",
            brand: "Apple",
            model: "A3106 Natural Titanium",
            barcode: "195949038241",
            image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=85",
            unitType: "Kartoon", itemsPerCarton: 10,
            costPrice: 990, wholesalePrice: 1080, retailPrice: 1150,
            stock: 24, minStockAlert: 5,
            warranty: "1 Sano (Apple Official)",
            spec: "256GB, Dual SIM/eSIM, A17 Pro Chip, 48MP Camera, USB-C, ProMotion 120Hz",
            createdAt: "2026-09-01"
        },
        {
            id: "PROD-102",
            name: "Samsung Galaxy S24 Ultra 512GB",
            category: "mobiles",
            brand: "Samsung",
            model: "SM-S928B Titanium Black",
            barcode: "8806095312345",
            image: "https://images.unsplash.com/photo-1706439154822-73cf7f16eaab?w=600&auto=format&fit=crop&q=85",
            unitType: "Kartoon", itemsPerCarton: 10,
            costPrice: 940, wholesalePrice: 1020, retailPrice: 1100,
            stock: 18, minStockAlert: 5,
            warranty: "1 Sano (Samsung Official)",
            spec: "512GB, 12GB RAM, S-Pen, AI Features, 200MP Camera, Snapdragon 8 Gen 3",
            createdAt: "2026-09-05"
        },
        {
            id: "PROD-103",
            name: "Xiaomi Redmi Note 13 Pro 256GB",
            category: "mobiles",
            brand: "Xiaomi",
            model: "23117RA68G Forest Green",
            barcode: "6941812756891",
            image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=85",
            unitType: "Kartoon", itemsPerCarton: 20,
            costPrice: 175, wholesalePrice: 195, retailPrice: 220,
            stock: 85, minStockAlert: 20,
            warranty: "1 Sano",
            spec: "256GB, 8GB RAM, 200MP OIS Camera, 67W Turbo Charge, AMOLED 120Hz",
            createdAt: "2026-09-10"
        },
        {
            id: "PROD-104",
            name: "Tecno Spark 20 Pro+ 256GB",
            category: "mobiles",
            brand: "Tecno",
            model: "KJ7 Temporal Orbits",
            barcode: "4895180795412",
            image: "https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=600&auto=format&fit=crop&q=85",
            unitType: "Kartoon", itemsPerCarton: 20,
            costPrice: 135, wholesalePrice: 152, retailPrice: 175,
            stock: 60, minStockAlert: 15,
            warranty: "13 Bilood (Carlcare)",
            spec: "256GB, 8GB+8GB RAM, 108MP Camera, Curved AMOLED 120Hz, 45W Charging",
            createdAt: "2026-09-12"
        },

        // ===================== QASAALADO (WASHING MACHINES) =====================
        {
            id: "PROD-201",
            name: "LG 9KG Front Load Inverter AI DD",
            category: "qasaalado",
            brand: "LG",
            model: "F4V5VYP0W White",
            barcode: "8806091238910",
            image: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=85",
            unitType: "Xabbo", itemsPerCarton: 1,
            costPrice: 420, wholesalePrice: 485, retailPrice: 540,
            stock: 14, minStockAlert: 4,
            warranty: "2 Sano Guud / 10 Sano Motor",
            spec: "9KG Capacity, Direct Drive Inverter, Steam Allergy Care, 1400 RPM",
            createdAt: "2026-09-02"
        },
        {
            id: "PROD-202",
            name: "Samsung 11KG EcoBubble Top Load",
            category: "qasaalado",
            brand: "Samsung",
            model: "WA11T5260BV Black Caviar",
            barcode: "8806098765432",
            image: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=600&auto=format&fit=crop&q=85",
            unitType: "Xabbo", itemsPerCarton: 1,
            costPrice: 330, wholesalePrice: 380, retailPrice: 420,
            stock: 12, minStockAlert: 3,
            warranty: "2 Sano (Digital Inverter)",
            spec: "11KG Top Loader, EcoBubble Tech, Wobble Pulsator, Soft Close Lid",
            createdAt: "2026-09-04"
        },
        {
            id: "PROD-203",
            name: "Super General 8KG Twin Tub Semi-Auto",
            category: "qasaalado",
            brand: "Super General",
            model: "SGW820N Two Tubs",
            barcode: "6291071018201",
            image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&auto=format&fit=crop&q=85",
            unitType: "Xabbo", itemsPerCarton: 1,
            costPrice: 140, wholesalePrice: 165, retailPrice: 190,
            stock: 25, minStockAlert: 6,
            warranty: "1 Sano",
            spec: "8KG Dhaqid & Qallajin gooni ah (Twin Tub), Plastic Rust-proof Body",
            createdAt: "2026-09-08"
        },
        {
            id: "PROD-204",
            name: "Hisense 7KG Front Loader Quick Wash",
            category: "qasaalado",
            brand: "Hisense",
            model: "WFQA7014EVJM Silver",
            barcode: "6901101897213",
            image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&auto=format&fit=crop&q=85",
            unitType: "Xabbo", itemsPerCarton: 1,
            costPrice: 280, wholesalePrice: 325, retailPrice: 360,
            stock: 8, minStockAlert: 3,
            warranty: "1 Sano",
            spec: "7KG Front Load, 1400 RPM, 15 min Quick Wash, LED Display",
            createdAt: "2026-09-15"
        },

        // ===================== FIRINJIYEER & QABOOJIYE =====================
        {
            id: "PROD-301",
            name: "Samsung 385L Double Door No-Frost Inverter",
            category: "firinjiyeer",
            brand: "Samsung",
            model: "RT38K5030S8 Inox Silver",
            barcode: "8806088321012",
            image: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=85",
            unitType: "Xabbo", itemsPerCarton: 1,
            costPrice: 460, wholesalePrice: 530, retailPrice: 590,
            stock: 16, minStockAlert: 4,
            warranty: "2 Sano Guud / 10 Sano Compressor",
            spec: "385 Litres, Twin Cooling Plus, Digital Inverter, No Frost, Multi-Flow",
            createdAt: "2026-09-03"
        },
        {
            id: "PROD-302",
            name: "LG 420L DoorCooling+ Smart Inverter",
            category: "firinjiyeer",
            brand: "LG",
            model: "GN-B422SQCL Shiny Steel",
            barcode: "8806091993412",
            image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop&q=85",
            unitType: "Xabbo", itemsPerCarton: 1,
            costPrice: 510, wholesalePrice: 585, retailPrice: 650,
            stock: 10, minStockAlert: 3,
            warranty: "2 Sano Guud / 10 Sano Inverter",
            spec: "420 Litres, DoorCooling+, LinearCooling, Moist Balance Crisper",
            createdAt: "2026-09-06"
        },
        {
            id: "PROD-303",
            name: "Westpoint 300L Deep Freezer (Jiifa)",
            category: "firinjiyeer",
            brand: "Westpoint",
            model: "WKN-3019 Chest Freezer",
            barcode: "3700129845120",
            image: "https://images.unsplash.com/photo-1590764258299-0f913616b600?w=600&auto=format&fit=crop&q=85",
            unitType: "Xabbo", itemsPerCarton: 1,
            costPrice: 250, wholesalePrice: 295, retailPrice: 330,
            stock: 15, minStockAlert: 5,
            warranty: "1 Sano",
            spec: "300 Litres Chest Freezer, Fast Freeze Switch, Lock & Key, Basket",
            createdAt: "2026-09-11"
        },
        {
            id: "PROD-304",
            name: "Super General 150L Single Door Refrigerator",
            category: "firinjiyeer",
            brand: "Super General",
            model: "SGR-150 Defrost Silver",
            barcode: "6291071011509",
            image: "https://images.unsplash.com/photo-1584285418504-0052ec77a6be?w=600&auto=format&fit=crop&q=85",
            unitType: "Xabbo", itemsPerCarton: 1,
            costPrice: 145, wholesalePrice: 170, retailPrice: 195,
            stock: 22, minStockAlert: 5,
            warranty: "1 Sano",
            spec: "150 Litre Compact Single Door, Chiller Compartment, Low Noise",
            createdAt: "2026-09-14"
        },

        // ===================== QABOOBIYE (AIR CONDITIONERS) - 6 Products =====================
        {
            id: "PROD-401",
            name: "Gree 1.5 HP Split AC Inverter Pular",
            category: "qaboobiye",
            brand: "Gree",
            model: "GWH12AGC T3 Tropical",
            barcode: "6932456781290",
            image: "https://images.unsplash.com/photo-1631693660946-3bbe77bddaa7?w=600&auto=format&fit=crop&q=85",
            unitType: "Set", itemsPerCarton: 1,
            costPrice: 310, wholesalePrice: 360, retailPrice: 400,
            stock: 20, minStockAlert: 5,
            warranty: "2 Sano Guud / 5 Sano Compressor",
            spec: "1.5 HP / 12,000 BTU, T3 Tropical (u adkeysanaya ilaa 55deg C), R410A, Auto Restart",
            createdAt: "2026-09-05"
        },
        {
            id: "PROD-402",
            name: "LG Dual Inverter 2.0 Ton Split AC",
            category: "qaboobiye",
            brand: "LG",
            model: "I24CGH DualCool Plus",
            barcode: "8806091448821",
            image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=85",
            unitType: "Set", itemsPerCarton: 1,
            costPrice: 530, wholesalePrice: 610, retailPrice: 680,
            stock: 11, minStockAlert: 3,
            warranty: "2 Sano / 10 Sano Compressor",
            spec: "2.0 Ton / 24,000 BTU, Dual Inverter Compressor, 60% Energy Saving, Fast Cooling",
            createdAt: "2026-09-07"
        },
        {
            id: "PROD-403",
            name: "Midea 1.5 HP Split AC Fast Cool",
            category: "qaboobiye",
            brand: "Midea",
            model: "MSAF-12CRN1 Mission",
            barcode: "6934567123908",
            image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=85",
            unitType: "Set", itemsPerCarton: 1,
            costPrice: 260, wholesalePrice: 305, retailPrice: 345,
            stock: 18, minStockAlert: 4,
            warranty: "1 Sano",
            spec: "1.5 HP, High Ambient T3 Cooling, Anti-Rust Golden Fin, R410A Eco Gas",
            createdAt: "2026-09-12"
        },
        {
            id: "PROD-404",
            name: "Carrier 2.5 HP Floor Standing AC (Taagan)",
            category: "qaboobiye",
            brand: "Carrier",
            model: "QHA-24CR Elegance Column",
            barcode: "3541298456123",
            image: "https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?w=600&auto=format&fit=crop&q=85",
            unitType: "Set", itemsPerCarton: 1,
            costPrice: 690, wholesalePrice: 790, retailPrice: 870,
            stock: 6, minStockAlert: 2,
            warranty: "2 Sano",
            spec: "2.5 Ton / 30,000 BTU Floor Standing, 3D Airflow, Large Hall / Masjid Cooling",
            createdAt: "2026-09-16"
        },
        {
            id: "PROD-405",
            name: "Haier 1.0 HP Window AC Classic",
            category: "qaboobiye",
            brand: "Haier",
            model: "HW-09CR03 Window Unit",
            barcode: "6901011012345",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=85",
            unitType: "Set", itemsPerCarton: 1,
            costPrice: 180, wholesalePrice: 215, retailPrice: 245,
            stock: 14, minStockAlert: 4,
            warranty: "1 Sano",
            spec: "1.0 HP / 9,000 BTU Window AC, Auto Restart, Dehumidifier Mode, Easy Install",
            createdAt: "2026-09-18"
        },
        {
            id: "PROD-406",
            name: "Samsung WindFree 2.5 HP Elite Split AC",
            category: "qaboobiye",
            brand: "Samsung",
            model: "AR24TSEAAWK WindFree Elite",
            barcode: "8806092876544",
            image: "https://images.unsplash.com/photo-1615239585163-e04a4a30b85c?w=600&auto=format&fit=crop&q=85",
            unitType: "Set", itemsPerCarton: 1,
            costPrice: 750, wholesalePrice: 870, retailPrice: 960,
            stock: 8, minStockAlert: 2,
            warranty: "3 Sano Guud / 10 Sano Compressor",
            spec: "2.5 Ton / 30,000 BTU, WindFree Cooling, AI Auto, Wi-Fi SmartThings Control",
            createdAt: "2026-09-20"
        },

        // ===================== TELEFISHANNO & SOUNDBARS =====================
        {
            id: "PROD-501",
            name: "Samsung 65inch Crystal UHD 4K Smart TV",
            category: "tv_audio",
            brand: "Samsung",
            model: "CU7000 DU7000 Frameless",
            barcode: "8806094981122",
            image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=85",
            unitType: "Xabbo", itemsPerCarton: 1,
            costPrice: 420, wholesalePrice: 485, retailPrice: 530,
            stock: 15, minStockAlert: 4,
            warranty: "1 Sano",
            spec: "65 Inch 4K UHD, Crystal Processor 4K, Tizen OS, HDR10+, Smart Hub",
            createdAt: "2026-09-04"
        },
        {
            id: "PROD-502",
            name: "Hisense 43inch Smart Android FHD TV",
            category: "tv_audio",
            brand: "Hisense",
            model: "43A4G Frameless",
            barcode: "6901101452319",
            image: "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600&auto=format&fit=crop&q=85",
            unitType: "Xabbo", itemsPerCarton: 1,
            costPrice: 165, wholesalePrice: 190, retailPrice: 215,
            stock: 28, minStockAlert: 6,
            warranty: "1 Sano",
            spec: "43 Inch FHD, Android TV / VIDAA, YouTube, Netflix, HDMI x2, USB",
            createdAt: "2026-09-09"
        },
        {
            id: "PROD-503",
            name: "Sony 5.1ch Surround Soundbar HT-S20R",
            category: "tv_audio",
            brand: "Sony",
            model: "HT-S20R 400W",
            barcode: "4548736109827",
            image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=85",
            unitType: "Xabbo", itemsPerCarton: 1,
            costPrice: 145, wholesalePrice: 175, retailPrice: 200,
            stock: 14, minStockAlert: 3,
            warranty: "1 Sano",
            spec: "400W Output, 5.1 Dolby Digital, Subwoofer + 2 Rear Speakers, Bluetooth/USB",
            createdAt: "2026-09-13"
        },

        // ===================== ACCESSORIES & SOLAR INVERTERS =====================
        {
            id: "PROD-601",
            name: "Growatt 3.5KW Hybrid Solar Inverter",
            category: "accessories",
            brand: "Growatt",
            model: "SPF 3500 ES Pure Sine Wave",
            barcode: "6943187291045",
            image: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=85",
            unitType: "Xabbo", itemsPerCarton: 1,
            costPrice: 380, wholesalePrice: 440, retailPrice: 490,
            stock: 9, minStockAlert: 3,
            warranty: "2 Sano",
            spec: "3.5KW 24V Pure Sine Wave, MPPT Solar Controller, Works with or without battery",
            createdAt: "2026-09-10"
        },
        {
            id: "PROD-602",
            name: "Anker 20W Fast USB-C Charger (Kartoon 50pcs)",
            category: "accessories",
            brand: "Anker",
            model: "PowerPort III 20W Cube",
            barcode: "194644028456",
            image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=85",
            unitType: "Kartoon", itemsPerCarton: 50,
            costPrice: 175, wholesalePrice: 225, retailPrice: 300,
            stock: 12, minStockAlert: 3,
            warranty: "18 Bilood",
            spec: "Original Anker 20W PD, Fast Charge for iPhone & Samsung, Box of 50 units",
            createdAt: "2026-09-14"
        }
    ],

    customers: [
        {
            id: "CUST-001",
            name: "Ganacsade Axmed Nuur (Dukaanka Iftin)",
            phone: "+252 61 5112233",
            city: "Muqdisho - Suuqa Bakaaraha",
            tier: "Wholesale VIP",
            totalPurchases: 0, currentDebt: 0,
            notes: "Macmiil joogto ah oo jumlada qaata"
        },
        {
            id: "CUST-002",
            name: "Shirkadda Al-Towfiiq Electronics",
            phone: "+252 63 4223344",
            city: "Hargeysa - Suuqa Gobanimo",
            tier: "Wholesale VIP",
            totalPurchases: 0, currentDebt: 0,
            notes: "Qasaalado iyo firinjiyeero ayey jumlada ku rartaan"
        },
        {
            id: "CUST-003",
            name: "Bakhaarka Xasan Daahir (Garoowe)",
            phone: "+252 90 7334455",
            city: "Garoowe - Laamiga Sare",
            tier: "Wholesale Regular",
            totalPurchases: 0, currentDebt: 0,
            notes: "Qaboobiyeyaal iyo Firinjiyeero"
        },
        {
            id: "CUST-004",
            name: "Dukaanka Smart Tech (Kismaayo)",
            phone: "+252 61 8445566",
            city: "Kismaayo - Suuqa Farjano",
            tier: "Wholesale Regular",
            totalPurchases: 0, currentDebt: 0,
            notes: "Telefoonno iyo accessories joogto ah"
        },
        {
            id: "CUST-005",
            name: "Macmiil Guud / Kaash Bilaa Magac",
            phone: "-",
            city: "Suuqa Maxalliga ah",
            tier: "Walk-in Cash",
            totalPurchases: 0, currentDebt: 0,
            notes: "Macaamiisha kaashka tooska ah wax ku gata"
        }
    ],

    suppliers: [
        {
            id: "SUPP-001",
            name: "Dubai Prime Trading LLC",
            contact: "+971 50 1234567 / info@dubaiprime.ae",
            location: "Deira, Dubai, UAE",
            itemsSupplied: "Smartphones, Apple & Samsung direct wholesale containers",
            balance: 0
        },
        {
            id: "SUPP-002",
            name: "Guangzhou Electronics Co., Ltd",
            contact: "+86 20 87654321 / sales@gzelec.cn",
            location: "Guangzhou, China",
            itemsSupplied: "TVs, Solar Inverters, Accessories & Chargers",
            balance: 0
        },
        {
            id: "SUPP-003",
            name: "Gulf Appliances Agency (LG & Gree Agent)",
            contact: "+971 4 2987654 / agency@gulfappliances.com",
            location: "Jebel Ali Free Zone, Dubai",
            itemsSupplied: "Air Conditioners (AC), Washing Machines, Refrigerators",
            balance: 0
        }
    ],

    // Sales start at zero — will populate as orders are placed
    sales: [],

    users: [
        {
            id: "USR-001",
            username: "admin",
            password: "9090",
            name: "Maamulaha Guud (Admin)",
            role: "admin",
            createdAt: "2026-10-01"
        },
        {
            id: "USR-002",
            username: "cashier",
            password: "1234",
            name: "Kaashiyaha Bakhaarka",
            role: "cashier",
            createdAt: "2026-10-01"
        },
        {
            id: "USR-003",
            username: "customer",
            password: "shop2026",
            name: "Macmiilka (Customer Portal)",
            role: "customer",
            createdAt: "2026-10-01"
        }
    ],

    // QUICKBOOKS ACCOUNTING - Kharashaadka Howlgalka & Qaybaha (Operating Expenses)
    expenseCategories: [
        { id: "rent", name: "Kirada Bakhaarka (Warehouse Rent)", icon: "🏬" },
        { id: "salaries", name: "Mushaaraadka Shaqaalaha (Salaries & Wages)", icon: "👥" },
        { id: "utilities", name: "Korontada, Biyaha & Shidaalka (Utilities & Fuel)", icon: "⚡" },
        { id: "transport", name: "Gaadiidka & Rarka (Logistics & Freight)", icon: "🚚" },
        { id: "maintenance", name: "Dayactirka & Qalabka Xafiiska (Office & Maintenance)", icon: "🛠️" },
        { id: "marketing", name: "Suuqgeynta & Xayeysiiska (Marketing & Ads)", icon: "📢" },
        { id: "other", name: "Kharashyo Kale (Miscellaneous & Taxes)", icon: "📑" }
    ],

    expenses: [
        // May 2026
        { id: "EXP-2026-001", date: "2026-05-05", category: "rent", categoryName: "Kirada Bakhaarka", amount: 650, notes: "Kirada bisha May 2026" },
        { id: "EXP-2026-002", date: "2026-05-25", category: "salaries", categoryName: "Mushaaraadka Shaqaalaha", amount: 900, notes: "Mushaarka 3 shaqaale bisha May" },
        { id: "EXP-2026-003", date: "2026-05-28", category: "utilities", categoryName: "Korontada & Shidaalka", amount: 140, notes: "Biilka korontada & shidaalka generator-ka" },

        // June 2026
        { id: "EXP-2026-004", date: "2026-06-05", category: "rent", categoryName: "Kirada Bakhaarka", amount: 650, notes: "Kirada bisha June 2026" },
        { id: "EXP-2026-005", date: "2026-06-25", category: "salaries", categoryName: "Mushaaraadka Shaqaalaha", amount: 900, notes: "Mushaarka bisha June" },
        { id: "EXP-2026-006", date: "2026-06-28", category: "utilities", categoryName: "Korontada & Shidaalka", amount: 155, notes: "Biilka korontada" },
        { id: "EXP-2026-007", date: "2026-06-18", category: "transport", categoryName: "Gaadiidka & Rarka", amount: 120, notes: "Dajinta container qasaalado iyo AC" },

        // July 2026
        { id: "EXP-2026-008", date: "2026-07-05", category: "rent", categoryName: "Kirada Bakhaarka", amount: 650, notes: "Kirada bisha July 2026" },
        { id: "EXP-2026-009", date: "2026-07-25", category: "salaries", categoryName: "Mushaaraadka Shaqaalaha", amount: 900, notes: "Mushaarka bisha July" },
        { id: "EXP-2026-010", date: "2026-07-29", category: "utilities", categoryName: "Korontada & Shidaalka", amount: 160, notes: "Biilka korontada" },

        // August 2026
        { id: "EXP-2026-011", date: "2026-08-05", category: "rent", categoryName: "Kirada Bakhaarka", amount: 650, notes: "Kirada bisha August 2026" },
        { id: "EXP-2026-012", date: "2026-08-25", category: "salaries", categoryName: "Mushaaraadka Shaqaalaha", amount: 900, notes: "Mushaarka bisha August" },
        { id: "EXP-2026-013", date: "2026-08-27", category: "utilities", categoryName: "Korontada & Shidaalka", amount: 145, notes: "Biilka korontada & internet-ka" },

        // September 2026
        { id: "EXP-2026-014", date: "2026-09-05", category: "rent", categoryName: "Kirada Bakhaarka", amount: 650, notes: "Kirada bisha September 2026" },
        { id: "EXP-2026-015", date: "2026-09-25", category: "salaries", categoryName: "Mushaaraadka Shaqaalaha", amount: 900, notes: "Mushaarka bisha September" },
        { id: "EXP-2026-016", date: "2026-09-28", category: "utilities", categoryName: "Korontada & Shidaalka", amount: 150, notes: "Biilka korontada" },
        { id: "EXP-2026-017", date: "2026-09-12", category: "marketing", categoryName: "Suuqgeynta & Xayeysiiska", amount: 100, notes: "Xayeysiinta qaboobiyeyaasha AC xilliga kuleylka" },

        // October 2026 (Current Month)
        { id: "EXP-2026-018", date: "2026-10-05", category: "rent", categoryName: "Kirada Bakhaarka", amount: 650, notes: "Kirada bisha October 2026" },
        { id: "EXP-2026-019", date: "2026-10-15", category: "utilities", categoryName: "Korontada & Shidaalka", amount: 130, notes: "Biilka korontada & biyaha" }
    ]
};
