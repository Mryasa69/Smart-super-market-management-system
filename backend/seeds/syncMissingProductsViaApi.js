const missingProducts = [
  {
    name: 'Fresh Salmon',
    category: 'Meat',
    sku: 'MEAT002',
    quantity: 35,
    price: 1750,
    minStock: 15,
    supplier: 'ABC Poultry',
    barcode: 'MEAT002',
    specialOffers: true,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?w=400&h=400&fit=crop',
  },
  {
    name: 'Imported Cheese',
    category: 'Dairy',
    sku: 'DAIRY003',
    quantity: 60,
    price: 665,
    minStock: 20,
    supplier: 'Dairy Farm Ltd',
    barcode: 'DAIRY003',
    specialOffers: true,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=400&fit=crop',
  },
  {
    name: 'Breakfast Cereal',
    category: 'Snacks',
    sku: 'SNACK002',
    quantity: 90,
    price: 476,
    minStock: 30,
    supplier: 'Sweet Treats',
    barcode: 'SNACK002',
    specialOffers: true,
    weeklyDeals: true,
    image: 'https://media.istockphoto.com/id/2248185261/photo/breakfast-cereals-on-the-kitchen-table-three-bowls-filled-with-healthy-wholegrain-cereals.jpg?s=1024x1024&w=is&k=20&c=zFnfLpfJvfPFs3aYIBoEt4W6VxlCDWmEtKNglWMSCdo=',
  },
  {
    name: 'Olive Oil 1L',
    category: 'Other',
    sku: 'OTHER001',
    quantity: 45,
    price: 1260,
    minStock: 15,
    supplier: 'Golden Bakery',
    barcode: 'OTHER001',
    specialOffers: true,
    weeklyDeals: true,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
  },
  {
    name: 'Fresh Strawberries',
    category: 'Fruits',
    sku: 'FRUIT002',
    quantity: 50,
    price: 595,
    minStock: 25,
    supplier: 'Fresh Farms',
    barcode: 'FRUIT002',
    specialOffers: true,
    weeklyDeals: true,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop',
  },
  {
    name: 'Greek Yogurt',
    category: 'Dairy',
    sku: 'DAIRY004',
    quantity: 70,
    price: 350,
    minStock: 25,
    supplier: 'Dairy Farm Ltd',
    barcode: 'DAIRY004',
    specialOffers: false,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop',
  },
  {
    name: 'Croissants',
    category: 'Bakery',
    sku: 'BREAD002',
    quantity: 0,
    price: 450,
    minStock: 20,
    supplier: 'Golden Bakery',
    barcode: 'BREAD002',
    specialOffers: false,
    weeklyDeals: false,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=300&fit=crop',
  },
];

async function syncViaApi() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@smartsuper.lk', password: 'AdminUser@123' }),
  });
  const loginData = await loginRes.json();
  if (!loginData.success || !loginData.data?.token) {
    throw new Error('Admin login failed');
  }

  const token = loginData.data.token;
  const existingRes = await fetch('http://localhost:5000/api/products');
  const existingData = await existingRes.json();
  const existingSkus = new Set((existingData.data || []).map((p) => p.sku));

  for (const product of missingProducts) {
    if (existingSkus.has(product.sku)) {
      console.log(`Skipped (already exists): ${product.name} (${product.sku})`);
      continue;
    }

    const res = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (data.success) {
      console.log(`Added: ${product.name} (${product.sku})`);
    } else {
      console.error(`Failed: ${product.name} - ${data.message || JSON.stringify(data)}`);
    }
  }

  const finalRes = await fetch('http://localhost:5000/api/products');
  const finalData = await finalRes.json();
  console.log(`\nTotal products in database: ${finalData.total}`);
}

syncViaApi().catch((err) => {
  console.error(err);
  process.exit(1);
});
