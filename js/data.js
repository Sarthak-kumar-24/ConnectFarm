// ============================================================
//  ConnectFarm — data.js
//  All mock data: users, products, orders, delivery agents
// ============================================================

const CF_DATA = {

  // ─── Demo Users ───
  users: [
    {
      id: 'u_customer1', role: 'customer', name: 'Anita Verma',
      email: 'customer@demo.com', password: 'demo123',
      phone: '+91 98765 43210', city: 'Mumbai', avatar: '👩',
      address: '14, Shivaji Nagar, Andheri West, Mumbai - 400058',
      joined: '2024-01-15', loyaltyPoints: 340, totalOrders: 18,
      wishlist: ['prod_1', 'prod_7', 'prod_14']
    },
    {
      id: 'u_farmer1', role: 'farmer', name: 'Rajesh Kumar',
      email: 'farmer@demo.com', password: 'demo123',
      phone: '+91 94567 12345', city: 'Nashik, Maharashtra', avatar: '👨‍🌾',
      farmName: 'Kumar Organic Farm', farmArea: '12 Acres',
      specialization: 'Vegetables & Fruits',
      joined: '2023-06-10', verified: true, rating: 4.7,
      totalEarnings: 284600, thisMonthEarnings: 34800
    },
    {
      id: 'u_admin1', role: 'admin', name: 'ConnectFarm Admin',
      email: 'admin@demo.com', password: 'demo123',
      phone: '+91 80000 00001', city: 'Bengaluru', avatar: '🛡️',
      joined: '2023-01-01'
    },
    {
      id: 'u_delivery1', role: 'delivery', name: 'Rahul Sharma',
      email: 'delivery@demo.com', password: 'demo123',
      phone: '+91 76543 21098', city: 'Mumbai', avatar: '🚚',
      vehicleType: 'Electric 3-Wheeler', vehicleNo: 'MH-02-EV-4521',
      vehicleModel: 'Mahindra Treo', joined: '2023-09-01',
      totalDeliveries: 847, rating: 4.8,
      totalEarnings: 128400, thisMonthEarnings: 12600
    },
    // Extra farmers for auto-assignment
    {
      id: 'u_farmer2', role: 'farmer', name: 'Priya Devi',
      email: 'priya@farm.com', password: 'demo123',
      phone: '+91 99887 65432', city: 'Amritsar, Punjab',
      farmName: 'Devi Dairy Farm', farmArea: '8 Acres',
      specialization: 'Dairy & Grains', verified: true, rating: 4.9
    },
    {
      id: 'u_farmer3', role: 'farmer', name: 'Suresh Patel',
      email: 'suresh@farm.com', password: 'demo123',
      phone: '+91 93456 78901', city: 'Anand, Gujarat',
      farmName: 'Patel Fruit Garden', farmArea: '20 Acres',
      specialization: 'Fruits & Herbs', verified: true, rating: 4.6
    }
  ],

  // ─── Products ───
  products: [
    // VEGETABLES
    {
      id: 'prod_1', name: 'Farm Fresh Tomatoes', category: 'vegetables',
      subcategory: 'Everyday Veggies', farmerId: 'u_farmer1',
      price: 40, mrp: 55, unit: 'kg', minQty: 0.5,
      stock: 150, rating: 4.5, reviews: 234,
      emoji: '🍅', color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626, #ef4444)',
      description: 'Naturally ripened, vine-fresh tomatoes straight from our Nashik farm. Rich in lycopene, perfect for curries and salads.',
      tags: ['organic', 'fresh', 'bestseller'],
      deliveryTime: '2-4 hours', farmName: 'Kumar Organic Farm'
    },
    {
      id: 'prod_2', name: 'Baby Spinach (Palak)', category: 'vegetables',
      subcategory: 'Leafy Greens', farmerId: 'u_farmer1',
      price: 35, mrp: 50, unit: 'bunch', minQty: 1,
      stock: 80, rating: 4.7, reviews: 189,
      emoji: '🌿', color: '#16a34a',
      gradient: 'linear-gradient(135deg, #16a34a, #22c55e)',
      description: 'Tender baby spinach leaves, rich in iron and vitamins. Freshly harvested every morning.',
      tags: ['organic', 'fresh', 'iron-rich'],
      deliveryTime: '2-4 hours', farmName: 'Kumar Organic Farm'
    },
    {
      id: 'prod_3', name: 'Nashik Onions', category: 'vegetables',
      subcategory: 'Everyday Veggies', farmerId: 'u_farmer1',
      price: 28, mrp: 40, unit: 'kg', minQty: 1,
      stock: 500, rating: 4.4, reviews: 567,
      emoji: '🧅', color: '#a16207',
      gradient: 'linear-gradient(135deg, #a16207, #ca8a04)',
      description: 'Famous Nashik onions, pungent and flavorful. Perfect for all Indian cooking.',
      tags: ['popular', 'value-pack'],
      deliveryTime: '2-4 hours', farmName: 'Kumar Organic Farm'
    },
    {
      id: 'prod_4', name: 'Organic Potatoes', category: 'vegetables',
      subcategory: 'Everyday Veggies', farmerId: 'u_farmer1',
      price: 22, mrp: 35, unit: 'kg', minQty: 1,
      stock: 400, rating: 4.3, reviews: 892,
      emoji: '🥔', color: '#92400e',
      gradient: 'linear-gradient(135deg, #92400e, #b45309)',
      description: 'Earthy, starchy potatoes grown in mineral-rich soil. Versatile for curries, fries, and more.',
      tags: ['bestseller', 'value'],
      deliveryTime: '2-4 hours', farmName: 'Kumar Organic Farm'
    },
    {
      id: 'prod_5', name: 'Rainbow Carrots', category: 'vegetables',
      subcategory: 'Root Veggies', farmerId: 'u_farmer1',
      price: 50, mrp: 70, unit: 'kg', minQty: 0.5,
      stock: 120, rating: 4.6, reviews: 145,
      emoji: '🥕', color: '#ea580c',
      gradient: 'linear-gradient(135deg, #ea580c, #f97316)',
      description: 'Sweet, crunchy carrots packed with beta-carotene. Ideal for halwa, salads, and juicing.',
      tags: ['organic', 'vitamin-a'],
      deliveryTime: '2-4 hours', farmName: 'Kumar Organic Farm'
    },
    {
      id: 'prod_6', name: 'Green Capsicum', category: 'vegetables',
      subcategory: 'Exotic Veggies', farmerId: 'u_farmer1',
      price: 65, mrp: 90, unit: 'kg', minQty: 0.5,
      stock: 90, rating: 4.5, reviews: 198,
      emoji: '🫑', color: '#15803d',
      gradient: 'linear-gradient(135deg, #15803d, #16a34a)',
      description: 'Crisp, fresh capsicum with a mild sweet flavor. Great for pizzas, stir-fries, and salads.',
      tags: ['fresh', 'vitamin-c'],
      deliveryTime: '2-4 hours', farmName: 'Kumar Organic Farm'
    },
    {
      id: 'prod_7', name: 'Purple Brinjal (Baingan)', category: 'vegetables',
      subcategory: 'Everyday Veggies', farmerId: 'u_farmer1',
      price: 32, mrp: 45, unit: 'kg', minQty: 0.5,
      stock: 100, rating: 4.2, reviews: 89,
      emoji: '🍆', color: '#7e22ce',
      gradient: 'linear-gradient(135deg, #7e22ce, #9333ea)',
      description: 'Glossy, tender brinjal perfect for bhartha, sabzi, and curries.',
      tags: ['fresh', 'local-produce'],
      deliveryTime: '2-4 hours', farmName: 'Kumar Organic Farm'
    },
    {
      id: 'prod_8', name: 'Okra (Bhindi)', category: 'vegetables',
      subcategory: 'Everyday Veggies', farmerId: 'u_farmer1',
      price: 45, mrp: 60, unit: 'kg', minQty: 0.5,
      stock: 80, rating: 4.6, reviews: 312,
      emoji: '🥬', color: '#166534',
      gradient: 'linear-gradient(135deg, #166534, #15803d)',
      description: 'Tender young okra, hand-picked at the perfect stage. Great for bhindi masala.',
      tags: ['fresh', 'bestseller'],
      deliveryTime: '2-4 hours', farmName: 'Kumar Organic Farm'
    },

    // FRUITS
    {
      id: 'prod_9', name: 'Alphonso Mangoes', category: 'fruits',
      subcategory: 'Premium Fruits', farmerId: 'u_farmer3',
      price: 180, mrp: 250, unit: 'dozen', minQty: 1,
      stock: 200, rating: 4.9, reviews: 1247,
      emoji: '🥭', color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
      description: 'The king of mangoes! GI-tagged Alphonso from Ratnagiri. Sweet, pulpy, and aromatic.',
      tags: ['premium', 'seasonal', 'bestseller'],
      deliveryTime: '2-4 hours', farmName: 'Patel Fruit Garden'
    },
    {
      id: 'prod_10', name: 'Robusta Bananas', category: 'fruits',
      subcategory: 'Everyday Fruits', farmerId: 'u_farmer3',
      price: 45, mrp: 60, unit: 'dozen', minQty: 1,
      stock: 500, rating: 4.4, reviews: 678,
      emoji: '🍌', color: '#ca8a04',
      gradient: 'linear-gradient(135deg, #ca8a04, #eab308)',
      description: 'Ripe, sweet Robusta bananas. Natural energy boosters, perfect for breakfast.',
      tags: ['fresh', 'value'],
      deliveryTime: '2-4 hours', farmName: 'Patel Fruit Garden'
    },
    {
      id: 'prod_11', name: 'Kashmir Apples', category: 'fruits',
      subcategory: 'Premium Fruits', farmerId: 'u_farmer3',
      price: 200, mrp: 280, unit: 'kg', minQty: 0.5,
      stock: 150, rating: 4.7, reviews: 423,
      emoji: '🍎', color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      description: 'Crisp, juicy apples from the valleys of Kashmir. Rich in antioxidants and fiber.',
      tags: ['premium', 'organic'],
      deliveryTime: '2-4 hours', farmName: 'Patel Fruit Garden'
    },
    {
      id: 'prod_12', name: 'Fresh Papaya', category: 'fruits',
      subcategory: 'Everyday Fruits', farmerId: 'u_farmer3',
      price: 40, mrp: 60, unit: 'piece', minQty: 1,
      stock: 100, rating: 4.3, reviews: 234,
      emoji: '🍈', color: '#f97316',
      gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
      description: 'Medium-sized, fully ripe papaya with bright orange flesh. Rich in vitamin C and papain.',
      tags: ['fresh', 'digestive'],
      deliveryTime: '2-4 hours', farmName: 'Patel Fruit Garden'
    },
    {
      id: 'prod_13', name: 'Pomegranate (Anar)', category: 'fruits',
      subcategory: 'Premium Fruits', farmerId: 'u_farmer3',
      price: 160, mrp: 220, unit: 'kg', minQty: 0.5,
      stock: 80, rating: 4.8, reviews: 356,
      emoji: '💎', color: '#9f1239',
      gradient: 'linear-gradient(135deg, #9f1239, #be123c)',
      description: 'Ruby-red Solapur pomegranates packed with antioxidants. Sweet, tangy, and refreshing.',
      tags: ['premium', 'antioxidant-rich'],
      deliveryTime: '2-4 hours', farmName: 'Patel Fruit Garden'
    },
    {
      id: 'prod_14', name: 'Watermelon', category: 'fruits',
      subcategory: 'Seasonal', farmerId: 'u_farmer3',
      price: 25, mrp: 40, unit: 'kg', minQty: 1,
      stock: 300, rating: 4.5, reviews: 789,
      emoji: '🍉', color: '#16a34a',
      gradient: 'linear-gradient(135deg, #16a34a, #dc2626)',
      description: 'Sweet, juicy watermelons. Perfect summer refreshment. Whole fruit delivered.',
      tags: ['seasonal', 'popular'],
      deliveryTime: '2-4 hours', farmName: 'Patel Fruit Garden'
    },
    {
      id: 'prod_15', name: 'Fresh Guava (Amrood)', category: 'fruits',
      subcategory: 'Everyday Fruits', farmerId: 'u_farmer3',
      price: 55, mrp: 75, unit: 'kg', minQty: 0.5,
      stock: 120, rating: 4.4, reviews: 267,
      emoji: '🍏', color: '#65a30d',
      gradient: 'linear-gradient(135deg, #65a30d, #84cc16)',
      description: 'Crunchy, sweet-tangy guavas loaded with vitamin C. Great for raw eating and juices.',
      tags: ['vitamin-c', 'local'],
      deliveryTime: '2-4 hours', farmName: 'Patel Fruit Garden'
    },

    // DAIRY
    {
      id: 'prod_16', name: 'A2 Farm Milk', category: 'dairy',
      subcategory: 'Fresh Milk', farmerId: 'u_farmer2',
      price: 75, mrp: 90, unit: 'litre', minQty: 0.5,
      stock: 500, rating: 4.8, reviews: 1024,
      emoji: '🥛', color: '#e2e8f0',
      gradient: 'linear-gradient(135deg, #64748b, #94a3b8)',
      description: 'Pure A2 cow milk from desi Gir cows. Unprocessed, straight from the farm. Boil before use.',
      tags: ['pure', 'a2-milk', 'bestseller'],
      deliveryTime: '2-4 hours', farmName: 'Devi Dairy Farm'
    },
    {
      id: 'prod_17', name: 'Fresh Paneer', category: 'dairy',
      subcategory: 'Dairy Products', farmerId: 'u_farmer2',
      price: 300, mrp: 380, unit: '500g', minQty: 1,
      stock: 150, rating: 4.9, reviews: 567,
      emoji: '🧀', color: '#fef3c7',
      gradient: 'linear-gradient(135deg, #d97706, #fbbf24)',
      description: 'Soft, creamy paneer made fresh daily from full-fat A2 milk. Firm texture, rich flavor.',
      tags: ['fresh', 'protein-rich', 'bestseller'],
      deliveryTime: '2-4 hours', farmName: 'Devi Dairy Farm'
    },
    {
      id: 'prod_18', name: 'Dahi (Curd)', category: 'dairy',
      subcategory: 'Dairy Products', farmerId: 'u_farmer2',
      price: 50, mrp: 70, unit: '500g', minQty: 1,
      stock: 300, rating: 4.7, reviews: 445,
      emoji: '🫙', color: '#f8fafc',
      gradient: 'linear-gradient(135deg, #475569, #64748b)',
      description: 'Thick, creamy set curd with natural probiotic cultures. Great for raita and lassi.',
      tags: ['probiotic', 'fresh'],
      deliveryTime: '2-4 hours', farmName: 'Devi Dairy Farm'
    },
    {
      id: 'prod_19', name: 'Pure Desi Ghee', category: 'dairy',
      subcategory: 'Premium Dairy', farmerId: 'u_farmer2',
      price: 650, mrp: 800, unit: '500ml', minQty: 1,
      stock: 100, rating: 4.9, reviews: 892,
      emoji: '✨', color: '#fbbf24',
      gradient: 'linear-gradient(135deg, #b45309, #f59e0b)',
      description: 'Hand-churned Bilona method ghee from A2 desi cows. Golden, aromatic, and pure.',
      tags: ['premium', 'bilona-method', 'bestseller'],
      deliveryTime: '2-4 hours', farmName: 'Devi Dairy Farm'
    },

    // GRAINS
    {
      id: 'prod_20', name: 'Whole Wheat Flour (Atta)', category: 'grains',
      subcategory: 'Flours', farmerId: 'u_farmer2',
      price: 52, mrp: 70, unit: 'kg', minQty: 1,
      stock: 600, rating: 4.5, reviews: 1456,
      emoji: '🌾', color: '#92400e',
      gradient: 'linear-gradient(135deg, #92400e, #d97706)',
      description: 'Stone-ground whole wheat atta from Punjab farms. High fiber, great for soft rotis.',
      tags: ['organic', 'stone-ground', 'popular'],
      deliveryTime: '4-6 hours', farmName: 'Devi Dairy Farm'
    },
    {
      id: 'prod_21', name: 'Basmati Rice', category: 'grains',
      subcategory: 'Rice', farmerId: 'u_farmer2',
      price: 85, mrp: 110, unit: 'kg', minQty: 1,
      stock: 400, rating: 4.7, reviews: 823,
      emoji: '🍚', color: '#e7e5e4',
      gradient: 'linear-gradient(135deg, #78716c, #a8a29e)',
      description: 'Aged Pusa Basmati rice with long slender grains. Perfect for biryani and pulao.',
      tags: ['aged', 'premium', 'bestseller'],
      deliveryTime: '4-6 hours', farmName: 'Devi Dairy Farm'
    },
    {
      id: 'prod_22', name: 'Moong Dal (Split)', category: 'grains',
      subcategory: 'Pulses', farmerId: 'u_farmer2',
      price: 120, mrp: 160, unit: 'kg', minQty: 0.5,
      stock: 250, rating: 4.6, reviews: 445,
      emoji: '🫘', color: '#fbbf24',
      gradient: 'linear-gradient(135deg, #a16207, #ca8a04)',
      description: 'Fresh season moong dal, light and easy to digest. Great for khichdi and soups.',
      tags: ['protein-rich', 'organic'],
      deliveryTime: '4-6 hours', farmName: 'Devi Dairy Farm'
    },

    // HERBS & SPICES
    {
      id: 'prod_23', name: 'Fresh Coriander (Dhaniya)', category: 'herbs',
      subcategory: 'Fresh Herbs', farmerId: 'u_farmer1',
      price: 15, mrp: 25, unit: 'bunch', minQty: 1,
      stock: 200, rating: 4.6, reviews: 678,
      emoji: '🌱', color: '#16a34a',
      gradient: 'linear-gradient(135deg, #16a34a, #4ade80)',
      description: 'Fresh, aromatic coriander bunches harvested daily. Essential for Indian cooking.',
      tags: ['fresh', 'aromatic', 'daily-harvest'],
      deliveryTime: '2-4 hours', farmName: 'Kumar Organic Farm'
    },
    {
      id: 'prod_24', name: 'Curry Leaves (Kadi Patta)', category: 'herbs',
      subcategory: 'Fresh Herbs', farmerId: 'u_farmer1',
      price: 12, mrp: 20, unit: 'bunch', minQty: 1,
      stock: 300, rating: 4.7, reviews: 456,
      emoji: '🍃', color: '#15803d',
      gradient: 'linear-gradient(135deg, #15803d, #22c55e)',
      description: 'Fragrant fresh curry leaves, packed with antioxidants. Freshly plucked from the tree.',
      tags: ['fresh', 'aromatic'],
      deliveryTime: '2-4 hours', farmName: 'Kumar Organic Farm'
    },
    {
      id: 'prod_25', name: 'Green Chilies (Hari Mirch)', category: 'herbs',
      subcategory: 'Spices', farmerId: 'u_farmer1',
      price: 35, mrp: 50, unit: '250g', minQty: 1,
      stock: 400, rating: 4.4, reviews: 789,
      emoji: '🌶️', color: '#15803d',
      gradient: 'linear-gradient(135deg, #15803d, #dc2626)',
      description: 'Fresh, fiery green chilies. Thin-skinned Jwala variety from Maharashtra.',
      tags: ['fresh', 'spicy', 'local'],
      deliveryTime: '2-4 hours', farmName: 'Kumar Organic Farm'
    }
  ],

  // ─── Pre-populated Orders ───
  orders: [
    {
      id: 'ORD-2025-001', customerId: 'u_customer1',
      farmerId: 'u_farmer1', deliveryAgentId: 'u_delivery1',
      items: [
        { productId: 'prod_1', name: 'Farm Fresh Tomatoes', qty: 2, price: 40, unit: 'kg' },
        { productId: 'prod_2', name: 'Baby Spinach', qty: 1, price: 35, unit: 'bunch' },
        { productId: 'prod_5', name: 'Rainbow Carrots', qty: 1, price: 50, unit: 'kg' }
      ],
      subtotal: 165, deliveryFee: 20, discount: 15, total: 170,
      status: 'delivered', paymentMethod: 'UPI',
      address: '14, Shivaji Nagar, Andheri West, Mumbai',
      placedAt: '2025-07-15T09:30:00', deliveredAt: '2025-07-15T13:00:00',
      tracking: [
        { status: 'placed', time: '09:30 AM', msg: 'Order placed successfully' },
        { status: 'confirmed', time: '09:45 AM', msg: 'Farmer confirmed your order' },
        { status: 'packed', time: '10:30 AM', msg: 'Order packed and ready' },
        { status: 'picked', time: '11:00 AM', msg: 'Delivery agent picked up' },
        { status: 'delivered', time: '01:00 PM', msg: 'Order delivered!' }
      ]
    },
    {
      id: 'ORD-2025-002', customerId: 'u_customer1',
      farmerId: 'u_farmer2', deliveryAgentId: 'u_delivery1',
      items: [
        { productId: 'prod_16', name: 'A2 Farm Milk', qty: 2, price: 75, unit: 'litre' },
        { productId: 'prod_17', name: 'Fresh Paneer', qty: 1, price: 300, unit: '500g' }
      ],
      subtotal: 450, deliveryFee: 20, discount: 30, total: 440,
      status: 'out_for_delivery', paymentMethod: 'COD',
      address: '14, Shivaji Nagar, Andheri West, Mumbai',
      placedAt: '2025-07-17T07:00:00',
      tracking: [
        { status: 'placed', time: '07:00 AM', msg: 'Order placed successfully' },
        { status: 'confirmed', time: '07:10 AM', msg: 'Farmer confirmed your order' },
        { status: 'packed', time: '07:45 AM', msg: 'Order packed and ready' },
        { status: 'picked', time: '08:15 AM', msg: 'Out for delivery' }
      ]
    },
    {
      id: 'ORD-2025-003', customerId: 'u_customer1',
      farmerId: 'u_farmer3', deliveryAgentId: null,
      items: [
        { productId: 'prod_9', name: 'Alphonso Mangoes', qty: 2, price: 180, unit: 'dozen' },
        { productId: 'prod_13', name: 'Pomegranate', qty: 1, price: 160, unit: 'kg' }
      ],
      subtotal: 520, deliveryFee: 20, discount: 0, total: 540,
      status: 'confirmed', paymentMethod: 'Card',
      address: '14, Shivaji Nagar, Andheri West, Mumbai',
      placedAt: '2025-07-17T10:00:00',
      tracking: [
        { status: 'placed', time: '10:00 AM', msg: 'Order placed successfully' },
        { status: 'confirmed', time: '10:15 AM', msg: 'Farmer confirmed your order' }
      ]
    }
  ],

  // ─── Revenue Data for Charts ───
  monthlyRevenue: [28000, 35000, 41000, 38000, 52000, 47000, 61000, 58000, 72000, 68000, 84000, 92000],
  weeklyOrders: [42, 58, 61, 49, 73, 85, 91],
  categoryRevenue: { vegetables: 35, fruits: 28, dairy: 22, grains: 10, herbs: 5 },

  // ─── Delivery Orders ───
  deliveryOrders: [
    { id: 'DEL-001', orderId: 'ORD-2025-002', customerName: 'Customer (Andheri West)', status: 'active', pickupAddr: 'Kumar Farm, Nashik', dropAddr: 'Andheri West, Mumbai', distance: '18.2 km', earnings: 45, estimatedTime: '25 mins' },
    { id: 'DEL-002', orderId: 'ORD-2025-004', customerName: 'Customer (Bandra)', status: 'pending', pickupAddr: 'Devi Dairy, Nashik', dropAddr: 'Bandra, Mumbai', distance: '20.5 km', earnings: 50, estimatedTime: '35 mins' },
    { id: 'DEL-003', orderId: 'ORD-2025-005', customerName: 'Customer (Powai)', status: 'completed', pickupAddr: 'Patel Farm, Nashik', dropAddr: 'Powai, Mumbai', distance: '15.8 km', earnings: 40, estimatedTime: 'Delivered' }
  ],

  // ─── Admin Stats ───
  adminStats: {
    totalRevenue: 28_45_000, thisMonthRevenue: 3_48_000,
    totalOrders: 12847, pendingOrders: 47,
    totalFarmers: 124, activeFarmers: 98,
    totalCustomers: 8924, activeCustomers: 4231,
    totalDeliveryAgents: 87, availableAgents: 34,
    avgDeliveryTime: '3.2 hrs', customerSatisfaction: 94,
    platformFee: 0.08
  },

  // ─── Farmer Stats ───
  farmerStats: {
    totalProducts: 12, activeProducts: 10,
    pendingOrders: 5, thisMonthOrders: 142,
    thisMonthEarnings: 34800, allTimeEarnings: 284600,
    avgRating: 4.7, totalReviews: 1847
  },

  // ─── Categories ───
  categories: [
    { id: 'all', label: 'All Items', emoji: '🌟' },
    { id: 'vegetables', label: 'Vegetables', emoji: '🥦' },
    { id: 'fruits', label: 'Fruits', emoji: '🍎' },
    { id: 'dairy', label: 'Dairy', emoji: '🥛' },
    { id: 'grains', label: 'Grains & Pulses', emoji: '🌾' },
    { id: 'herbs', label: 'Herbs & Spices', emoji: '🌿' }
  ]
};

// ─── Helper: get farmer by product ───
CF_DATA.getFarmerForProduct = function(productId) {
  const product = this.products.find(p => p.id === productId);
  if (!product) return null;
  return this.users.find(u => u.id === product.farmerId);
};

// ─── Helper: auto-assign farmer (hides from customer) ───
CF_DATA.autoAssignFarmer = function(productIds) {
  // System picks farmer silently — customers never know
  const farmers = this.users.filter(u => u.role === 'farmer' && u.verified);
  // Find farmer who has the most products in the order
  const farmerCounts = {};
  productIds.forEach(pid => {
    const prod = this.products.find(p => p.id === pid);
    if (prod) farmerCounts[prod.farmerId] = (farmerCounts[prod.farmerId] || 0) + 1;
  });
  const dominantFarmerId = Object.keys(farmerCounts).sort((a, b) => farmerCounts[b] - farmerCounts[a])[0];
  return dominantFarmerId || farmers[0].id;
};

// ─── Helper: generate order ID ───
CF_DATA.generateOrderId = function() {
  return 'ORD-' + Date.now().toString().slice(-8);
};

// Make data available globally
window.CF_DATA = CF_DATA;
