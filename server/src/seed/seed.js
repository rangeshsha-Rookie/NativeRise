// server/src/seed/seed.js
import bcrypt from 'bcryptjs';
import config from '../config/env.js';
import { connectDB } from '../config/db.js';

import User from '../models/User.js';
import SellerProfile from '../models/SellerProfile.js';
import PartnerProfile from '../models/PartnerProfile.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import SupportTicket from '../models/SupportTicket.js';
import LedgerEntry from '../models/LedgerEntry.js';
import SearchMiss from '../models/SearchMiss.js';

import { categoriesData } from './categories.data.js';
import { demoCustomers, demoPartners, demoSellers } from './accounts.data.js';
import { productsData } from './products.data.js';
import { reviewTemplates } from './reviews.data.js';
import { generateSeedImages } from './generateImages.js';
import {
  calculatePartnerPayout,
  calculatePlatformFee,
  calculateCustomerDeliveryCharge,
  calculateSellerNet
} from '../services/pricing.service.js';
import { haversineKm } from '../services/geo.service.js';
import { generateOrderNo, generateTicketNo, generateDeliveryCode } from '../utils/ids.js';

export async function runSeed({ wipeDemoOnly = true } = {}) {
  await connectDB();
  console.log('--- Starting NativeRise Seed ---');

  // 1. Generate SVGs in client/public/seed-images
  try {
    generateSeedImages();
  } catch (err) {
    console.warn('Image generation warning:', err.message);
  }

  // Clear existing demo data
  if (wipeDemoOnly) {
    console.log('Clearing existing demo data...');
    await Promise.all([
      User.deleteMany({ isDemo: true }),
      SellerProfile.deleteMany({ isDemo: true }),
      PartnerProfile.deleteMany({ isDemo: true }),
      Category.deleteMany({ isDemo: true }),
      Product.deleteMany({ isDemo: true }),
      Order.deleteMany({ isDemo: true }),
      Review.deleteMany({ isDemo: true }),
      SupportTicket.deleteMany({ isDemo: true }),
      LedgerEntry.deleteMany({ isDemo: true }),
      SearchMiss.deleteMany({ isDemo: true })
    ]);
  }

  const passwordHash = await bcrypt.hash(config.SEED_DEMO_PASSWORD, 10);

  // 2. Seed Categories
  console.log('Seeding categories...');
  const categoryDocs = await Category.insertMany(categoriesData);
  console.log(`Seeded ${categoryDocs.length} categories.`);

  // 3. Seed Customers
  console.log('Seeding customers...');
  const customerUsers = [];
  for (const c of demoCustomers) {
    const user = await User.create({
      role: 'customer',
      name: c.name,
      email: c.email,
      phone: c.phone,
      passwordHash,
      preferredLang: c.preferredLang || 'en',
      addresses: c.addresses,
      isDemo: true
    });
    customerUsers.push(user);
  }
  console.log(`Seeded ${customerUsers.length} customers.`);

  // 4. Seed Partners
  console.log('Seeding partners...');
  const partnerUsers = [];
  const partnerProfiles = [];
  for (const p of demoPartners) {
    const user = await User.create({
      role: 'partner',
      name: p.name,
      email: p.email,
      phone: p.phone,
      passwordHash,
      preferredLang: 'en',
      addresses: [],
      isDemo: true
    });
    const profile = await PartnerProfile.create({
      user: user._id,
      vehicleType: p.vehicleType,
      vehicleNumber: p.vehicleNumber,
      baseLocation: p.baseLocation,
      serviceRadiusKm: p.serviceRadiusKm,
      isOnline: false,
      isDemo: true
    });
    partnerUsers.push(user);
    partnerProfiles.push(profile);
  }
  console.log(`Seeded ${partnerProfiles.length} delivery partners.`);

  // 5. Seed Sellers
  console.log('Seeding sellers...');
  const sellerUsers = [];
  const sellerProfiles = [];
  for (const s of demoSellers) {
    const user = await User.create({
      role: 'seller',
      name: s.name,
      email: s.email,
      phone: s.phone,
      passwordHash,
      preferredLang: 'mr',
      addresses: [],
      isDemo: true
    });
    const profile = await SellerProfile.create({
      user: user._id,
      shopName: s.shopName,
      story: s.story,
      village: s.village,
      district: s.district,
      state: s.state,
      pincode: s.pincode,
      location: s.location,
      deliveryMode: s.deliveryMode,
      maxDeliveryKm: s.maxDeliveryKm,
      minOrderPaise: s.minOrderPaise,
      prepTimeMins: s.prepTimeMins,
      isAcceptingOrders: true,
      photoUrl: `/seed-images/seller-${s.sellerIndex}-avatar.svg`,
      coverUrl: `/seed-images/seller-${s.sellerIndex}-cover.svg`,
      isDemo: true
    });
    sellerUsers.push(user);
    sellerProfiles.push(profile);
  }
  console.log(`Seeded ${sellerProfiles.length} sellers.`);

  // 6. Seed Products (40)
  console.log('Seeding products...');
  const productDocs = [];
  for (const p of productsData) {
    const seller = sellerProfiles[p.sellerIndex - 1];
    const doc = await Product.create({
      seller: seller._id,
      category: p.category,
      name: p.name,
      description: p.description,
      pricePaise: p.pricePaise,
      quantityValue: p.quantityValue,
      quantityUnit: p.quantityUnit,
      stock: p.stock,
      images: p.images,
      searchKeywords: p.searchKeywords || [],
      status: 'ACTIVE',
      soldCount: 0,
      ratingSum: 0,
      ratingCount: 0,
      ratingAvg: 0,
      isDemo: true
    });
    productDocs.push(doc);
  }
  console.log(`Seeded ${productDocs.length} products.`);

  // 7. Seed 8-week Order History & Reviews
  console.log('Seeding 8-week delivered order history and reviews...');
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const weekMs = 7 * dayMs;

  // Weekly volumes per seller across 8 weeks (weeks ago: 7 to 0)
  const weeklyTarget = {
    1: [3, 4, 4, 5, 6, 7, 8, 9], // rising 3 -> 9
    2: [5, 5, 5, 5, 5, 5, 5, 5], // flat 5
    3: [2, 3, 4, 5, 5, 6, 7, 8], // rising 2 -> 8
    4: [8, 7, 6, 6, 5, 4, 4, 3], // declining 8 -> 3
    5: [4, 4, 4, 4, 4, 4, 4, 4], // flat 4
    6: [1, 2, 1, 2, 1, 2, 1, 2], // slow 1-2
    7: [3, 3, 4, 5, 5, 6, 6, 7], // rising 3 -> 7
    8: [3, 4, 3, 4, 3, 4, 3, 4]  // flat 3-4
  };

  const deliveredOrders = [];
  const createdReviews = [];
  let orderSeq = 100;

  for (let sIdx = 1; sIdx <= 8; sIdx++) {
    const seller = sellerProfiles[sIdx - 1];
    const sellerProducts = productDocs.filter((p) => p.seller.toString() === seller._id.toString());
    const volumes = weeklyTarget[sIdx];

    for (let w = 7; w >= 0; w--) {
      const orderCountInWeek = volumes[7 - w];
      const weekStart = now - (w + 1) * weekMs;

      for (let i = 0; i < orderCountInWeek; i++) {
        orderSeq++;
        const customer = customerUsers[(orderSeq + sIdx) % customerUsers.length];
        const customerAddress = customer.addresses[0];

        // Choose 1-3 items
        const numItems = (orderSeq % 3) + 1;
        const chosenProducts = [];
        for (let it = 0; it < numItems; it++) {
          const p = sellerProducts[(orderSeq + it) % sellerProducts.length];
          if (!chosenProducts.some((cp) => cp._id.toString() === p._id.toString())) {
            chosenProducts.push(p);
          }
        }

        const items = chosenProducts.map((p) => {
          const qty = (orderSeq % 2) + 1;
          return {
            product: p._id,
            name: { en: p.name.en, mr: p.name.mr },
            image: p.images[0] || `/seed-images/${p.code || 'P01'}.svg`,
            unitPricePaise: p.pricePaise,
            qty,
            quantityValue: p.quantityValue,
            quantityUnit: p.quantityUnit,
            lineTotalPaise: p.pricePaise * qty
          };
        });

        let itemsTotalPaise = items.reduce((sum, item) => sum + item.lineTotalPaise, 0);

        // Ensure minimum order
        if (itemsTotalPaise < seller.minOrderPaise) {
          items[0].qty += 2;
          items[0].lineTotalPaise = items[0].unitPricePaise * items[0].qty;
          itemsTotalPaise = items.reduce((sum, item) => sum + item.lineTotalPaise, 0);
        }

        const distanceKm = haversineKm(
          customerAddress.lat,
          customerAddress.lng,
          seller.location.lat,
          seller.location.lng
        );

        const partnerPayoutPaise = calculatePartnerPayout(distanceKm);
        const platformFeePaise = calculatePlatformFee(itemsTotalPaise);
        const customerDeliveryChargePaise = calculateCustomerDeliveryCharge(
          seller.deliveryMode,
          partnerPayoutPaise
        );
        const totalPayablePaise = itemsTotalPaise + customerDeliveryChargePaise;
        const sellerNetPaise = calculateSellerNet({
          itemsTotalPaise,
          deliveryMode: seller.deliveryMode,
          partnerPayoutPaise,
          platformFeePaise
        });

        // Partner assignment (nearest)
        const partnerIndex = orderSeq % partnerUsers.length;
        const partnerUser = partnerUsers[partnerIndex];

        const placedTime = new Date(weekStart + Math.floor(Math.random() * (6 * dayMs)));
        const acceptedTime = new Date(placedTime.getTime() + 15 * 60 * 1000);
        const packedTime = new Date(acceptedTime.getTime() + seller.prepTimeMins * 60 * 1000);
        const pickedUpTime = new Date(packedTime.getTime() + 20 * 60 * 1000);
        const deliveredTime = new Date(pickedUpTime.getTime() + 35 * 60 * 1000);

        const isCod = orderSeq % 10 >= 6; // 40% COD, 60% Razorpay
        const orderNo = await generateOrderNo();
        const deliveryCode = generateDeliveryCode();

        const order = await Order.create({
          orderNo,
          customer: customer._id,
          seller: seller._id,
          partner: partnerUser._id,
          deliveryCode,
          items,
          itemsTotalPaise,
          customerDeliveryChargePaise,
          totalPayablePaise,
          platformFeePaise,
          partnerPayoutPaise,
          sellerNetPaise,
          deliveryMode: seller.deliveryMode,
          address: {
            name: customer.name.en,
            phone: customer.phone,
            line: customerAddress.line,
            landmark: customerAddress.landmark || '',
            lat: customerAddress.lat,
            lng: customerAddress.lng
          },
          pickup: {
            lat: seller.location.lat,
            lng: seller.location.lng,
            line: seller.location.line
          },
          roadDistanceKm: distanceKm,
          etaMins: seller.prepTimeMins + Math.round((distanceKm / 25) * 60),
          paymentMethod: isCod ? 'COD' : 'RAZORPAY',
          payment: {
            status: isCod ? 'COD_COLLECTED' : 'PAID',
            razorpayOrderId: isCod ? undefined : `demo_order_${orderSeq}`,
            razorpayPaymentId: isCod ? undefined : `demo_pay_${orderSeq}`,
            paymentInstrument: isCod ? undefined : (orderSeq % 3 === 0 ? 'netbanking' : orderSeq % 3 === 1 ? 'card' : 'upi'),
            paidAt: isCod ? undefined : placedTime
          },
          status: 'DELIVERED',
          statusHistory: [
            { status: 'PLACED', at: placedTime },
            { status: 'ACCEPTED', at: acceptedTime },
            { status: 'PACKED', at: packedTime },
            { status: 'PICKED_UP', at: pickedUpTime },
            { status: 'DELIVERED', at: deliveredTime }
          ],
          ledgerPosted: true,
          isDemo: true,
          createdAt: placedTime,
          updatedAt: deliveredTime
        });

        deliveredOrders.push(order);

        // Update soldCount on products
        for (const itm of items) {
          await Product.findByIdAndUpdate(itm.product, { $inc: { soldCount: itm.qty } });
        }

        // Post ledger entries
        const sellerUser = sellerUsers[sIdx - 1];
        await LedgerEntry.create([
          {
            user: sellerUser._id,
            role: 'seller',
            order: order._id,
            type: 'SELLER_EARNING',
            amountPaise: sellerNetPaise,
            breakdown: {
              itemsTotalPaise,
              platformFeePaise,
              deliveryCostPaise: seller.deliveryMode === 'INCLUDED' ? partnerPayoutPaise : 0,
              netPaise: sellerNetPaise
            },
            note: `Delivered order ${order.orderNo}`,
            isDemo: true,
            createdAt: deliveredTime
          },
          {
            user: partnerUser._id,
            role: 'partner',
            order: order._id,
            type: 'PARTNER_EARNING',
            amountPaise: partnerPayoutPaise,
            note: `Delivery payout ${order.orderNo}`,
            isDemo: true,
            createdAt: deliveredTime
          }
        ]);

        if (isCod) {
          await LedgerEntry.create({
            user: partnerUser._id,
            role: 'partner',
            order: order._id,
            type: 'COD_CASH_COLLECTED',
            amountPaise: totalPayablePaise,
            note: `COD cash collected ${order.orderNo}`,
            isDemo: true,
            createdAt: deliveredTime
          });

          // Deposit 70% of COD
          if (orderSeq % 10 < 7) {
            await LedgerEntry.create({
              user: partnerUser._id,
              role: 'partner',
              order: null,
              type: 'COD_CASH_DEPOSITED',
              amountPaise: totalPayablePaise,
              note: `COD deposit ${order.orderNo}`,
              isDemo: true,
              createdAt: new Date(deliveredTime.getTime() + 2 * dayMs)
            });
          }
        }
      }
    }
  }
  console.log(`Seeded ${deliveredOrders.length} delivered orders.`);

  // 8. Seed Reviews (~160 reviews)
  console.log('Seeding reviews and rating aggregates...');
  let reviewCount = 0;

  for (const product of productDocs) {
    const sellerIdx = demoSellers.find((s) => s.category === product.category)?.sellerIndex || 1;

    // Find delivered orders containing this product
    const ordersWithProduct = deliveredOrders.filter((ord) =>
      ord.items.some((it) => it.product.toString() === product._id.toString())
    );

    // Pick 3-5 orders from distinct customers
    const reviewedCustomerIds = new Set();
    const candidateOrders = [];
    for (const ord of ordersWithProduct) {
      const cId = ord.customer.toString();
      if (!reviewedCustomerIds.has(cId) && candidateOrders.length < 4) {
        reviewedCustomerIds.add(cId);
        candidateOrders.push(ord);
      }
    }

    for (let rIdx = 0; rIdx < candidateOrders.length; rIdx++) {
      const order = candidateOrders[rIdx];
      reviewCount++;

      // Patterned reviews for Growth Coach
      let rating = 5;
      let template = null;
      const isBlank = reviewCount % 4 === 0; // 25% no text

      if (sellerIdx === 2 && rIdx === 0) {
        // S2 packaging issue
        rating = 2;
        template = reviewTemplates.negative.find((t) => t.code === 'X-pack-1');
      } else if (sellerIdx === 2 && rIdx === 1) {
        rating = 3;
        template = reviewTemplates.neutral.find((t) => t.code === 'N-pack-1');
      } else if (sellerIdx === 4 && rIdx === 0) {
        // S4 delivery issue
        rating = 2;
        template = reviewTemplates.negative.find((t) => t.code === 'X-deliv-1');
      } else if (sellerIdx === 4 && rIdx === 1) {
        rating = 3;
        template = reviewTemplates.neutral.find((t) => t.code === 'N-deliv-1');
      } else if (sellerIdx === 6 && rIdx === 0) {
        // S6 fragile packaging issue
        rating = 2;
        template = reviewTemplates.negative.find((t) => t.code === 'X-pack-1');
      } else if (sellerIdx === 7 && rIdx === 0) {
        // S7 quantity issue
        rating = 3;
        template = reviewTemplates.neutral.find((t) => t.code === 'N-qty-1');
      } else {
        // Normal distribution: 5 stars (50%), 4 stars (40%), 3 stars (10%)
        if (reviewCount % 5 === 0) {
          rating = 3;
          template = reviewTemplates.neutral[reviewCount % reviewTemplates.neutral.length];
        } else if (reviewCount % 2 === 0) {
          rating = 4;
          template = reviewTemplates.positive[reviewCount % reviewTemplates.positive.length];
        } else {
          rating = 5;
          template = reviewTemplates.positive[(reviewCount + 1) % reviewTemplates.positive.length];
        }
      }

      const reviewDate = new Date(order.updatedAt.getTime() + (reviewCount % 3 + 1) * dayMs);

      const reviewDoc = await Review.create({
        order: order._id,
        product: product._id,
        customer: order.customer,
        seller: order.seller,
        rating,
        text: isBlank ? { en: '', mr: '' } : { en: template?.en || 'Great quality!', mr: template?.mr || 'उत्कृष्ट दर्जा!' },
        originalLang: 'en',
        themes: template?.themes || ['quality'],
        sentiment: template?.sentiment || 'positive',
        isDemo: true,
        createdAt: reviewDate
      });
      createdReviews.push(reviewDoc);
    }
  }
  console.log(`Seeded ${createdReviews.length} verified reviews.`);

  // Recompute rating aggregates for all products and sellers
  console.log('Recomputing ratings across catalog...');
  for (const product of productDocs) {
    const agg = await Review.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, sum: { $sum: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (agg.length > 0) {
      const ratingSum = agg[0].sum;
      const ratingCount = agg[0].count;
      const ratingAvg = Math.round((ratingSum / ratingCount) * 10) / 10;
      await Product.findByIdAndUpdate(product._id, { ratingSum, ratingCount, ratingAvg });
    }
  }

  for (const seller of sellerProfiles) {
    const agg = await Review.aggregate([
      { $match: { seller: seller._id } },
      { $group: { _id: null, sum: { $sum: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (agg.length > 0) {
      const ratingSum = agg[0].sum;
      const ratingCount = agg[0].count;
      const ratingAvg = Math.round((ratingSum / ratingCount) * 10) / 10;
      await SellerProfile.findByIdAndUpdate(seller._id, { ratingSum, ratingCount, ratingAvg });
    }
  }

  // 9. Seed Open Demo Orders (Section 17.9)
  console.log('Seeding open demo orders...');
  const rohan = customerUsers[0]; // Rohan Patil (Mira Road East)
  const priya = customerUsers[1]; // Priya (Vasai)
  const amit = customerUsers[2];  // Amit (Nalasopara)

  const s1 = sellerProfiles[0];
  const s2 = sellerProfiles[1];
  const s3 = sellerProfiles[2];
  const s5 = sellerProfiles[4];

  const pS1 = productDocs.find((p) => p.seller.toString() === s1._id.toString());
  const pS2 = productDocs.find((p) => p.seller.toString() === s2._id.toString());
  const pS3 = productDocs.find((p) => p.seller.toString() === s3._id.toString());
  const pS5 = productDocs.find((p) => p.seller.toString() === s5._id.toString());

  // Rohan 1: PLACED from S1
  await Order.create({
    orderNo: await generateOrderNo(),
    customer: rohan._id,
    seller: s1._id,
    partner: null,
    deliveryCode: generateDeliveryCode(),
    items: [
      {
        product: pS1._id,
        name: { en: pS1.name.en, mr: pS1.name.mr },
        image: pS1.images[0] || '/seed-images/P01.svg',
        unitPricePaise: pS1.pricePaise,
        qty: 1,
        quantityValue: pS1.quantityValue,
        quantityUnit: pS1.quantityUnit
      }
    ],
    itemsTotalPaise: pS1.pricePaise,
    customerDeliveryChargePaise: 0,
    totalPayablePaise: pS1.pricePaise,
    platformFeePaise: calculatePlatformFee(pS1.pricePaise),
    partnerPayoutPaise: calculatePartnerPayout(10),
    sellerNetPaise: calculateSellerNet({ itemsTotalPaise: pS1.pricePaise, deliveryMode: 'INCLUDED', partnerPayoutPaise: calculatePartnerPayout(10) }),
    deliveryMode: 'INCLUDED',
    address: {
      name: rohan.name.en,
      phone: rohan.phone,
      line: rohan.addresses[0].line,
      landmark: rohan.addresses[0].landmark || '',
      lat: rohan.addresses[0].lat,
      lng: rohan.addresses[0].lng
    },
    pickup: {
      lat: s1.location.lat,
      lng: s1.location.lng,
      line: s1.location.line
    },
    roadDistanceKm: 10,
    etaMins: s1.prepTimeMins + 25,
    paymentMethod: 'RAZORPAY',
    payment: {
      status: 'PAID',
      razorpayOrderId: 'demo_order_open_1',
      razorpayPaymentId: 'demo_pay_open_1',
      paymentInstrument: 'upi',
      paidAt: new Date(now - 20 * 60 * 1000)
    },
    status: 'PLACED',
    statusHistory: [{ status: 'PLACED', at: new Date(now - 20 * 60 * 1000) }],
    isDemo: true
  });

  // Rohan 2: ACCEPTED from S2
  await Order.create({
    orderNo: await generateOrderNo(),
    customer: rohan._id,
    seller: s2._id,
    partner: null,
    deliveryCode: generateDeliveryCode(),
    items: [
      {
        product: pS2._id,
        name: { en: pS2.name.en, mr: pS2.name.mr },
        image: pS2.images[0] || '/seed-images/P06.svg',
        unitPricePaise: pS2.pricePaise,
        qty: 2,
        quantityValue: pS2.quantityValue,
        quantityUnit: pS2.quantityUnit
      }
    ],
    itemsTotalPaise: pS2.pricePaise * 2,
    customerDeliveryChargePaise: 0,
    totalPayablePaise: pS2.pricePaise * 2,
    platformFeePaise: calculatePlatformFee(pS2.pricePaise * 2),
    partnerPayoutPaise: calculatePartnerPayout(12),
    sellerNetPaise: calculateSellerNet({ itemsTotalPaise: pS2.pricePaise * 2, deliveryMode: 'INCLUDED', partnerPayoutPaise: calculatePartnerPayout(12) }),
    deliveryMode: 'INCLUDED',
    address: {
      name: rohan.name.en,
      phone: rohan.phone,
      line: rohan.addresses[0].line,
      landmark: rohan.addresses[0].landmark || '',
      lat: rohan.addresses[0].lat,
      lng: rohan.addresses[0].lng
    },
    pickup: {
      lat: s2.location.lat,
      lng: s2.location.lng,
      line: s2.location.line
    },
    roadDistanceKm: 12,
    etaMins: s2.prepTimeMins + 30,
    paymentMethod: 'COD',
    payment: {
      status: 'COD_PENDING'
    },
    status: 'ACCEPTED',
    statusHistory: [
      { status: 'PLACED', at: new Date(now - 50 * 60 * 1000) },
      { status: 'ACCEPTED', at: new Date(now - 30 * 60 * 1000) }
    ],
    isDemo: true
  });

  // Rohan 3: PACKED from S5
  await Order.create({
    orderNo: await generateOrderNo(),
    customer: rohan._id,
    seller: s5._id,
    partner: null,
    deliveryCode: generateDeliveryCode(),
    items: [
      {
        product: pS5._id,
        name: { en: pS5.name.en, mr: pS5.name.mr },
        image: pS5.images[0] || '/seed-images/P21.svg',
        unitPricePaise: pS5.pricePaise,
        qty: 1,
        quantityValue: pS5.quantityValue,
        quantityUnit: pS5.quantityUnit
      }
    ],
    itemsTotalPaise: pS5.pricePaise,
    customerDeliveryChargePaise: 0,
    totalPayablePaise: pS5.pricePaise,
    platformFeePaise: calculatePlatformFee(pS5.pricePaise),
    partnerPayoutPaise: calculatePartnerPayout(24),
    sellerNetPaise: calculateSellerNet({ itemsTotalPaise: pS5.pricePaise, deliveryMode: 'INCLUDED', partnerPayoutPaise: calculatePartnerPayout(24) }),
    deliveryMode: 'INCLUDED',
    address: {
      name: rohan.name.en,
      phone: rohan.phone,
      line: rohan.addresses[0].line,
      landmark: rohan.addresses[0].landmark || '',
      lat: rohan.addresses[0].lat,
      lng: rohan.addresses[0].lng
    },
    pickup: {
      lat: s5.location.lat,
      lng: s5.location.lng,
      line: s5.location.line
    },
    roadDistanceKm: 24,
    etaMins: s5.prepTimeMins + 45,
    paymentMethod: 'RAZORPAY',
    payment: {
      status: 'PAID',
      razorpayOrderId: 'demo_order_open_3',
      razorpayPaymentId: 'demo_pay_open_3',
      paymentInstrument: 'upi',
      paidAt: new Date(now - 3 * 3600 * 1000)
    },
    status: 'PACKED',
    statusHistory: [
      { status: 'PLACED', at: new Date(now - 3 * 3600 * 1000) },
      { status: 'ACCEPTED', at: new Date(now - 2.5 * 3600 * 1000) },
      { status: 'PACKED', at: new Date(now - 30 * 60 * 1000) }
    ],
    isDemo: true
  });

  // Rohan 4: PACKED from S1
  await Order.create({
    orderNo: await generateOrderNo(),
    customer: rohan._id,
    seller: s1._id,
    partner: null,
    deliveryCode: generateDeliveryCode(),
    items: [
      {
        product: pS1._id,
        name: { en: pS1.name.en, mr: pS1.name.mr },
        image: pS1.images[0] || '/seed-images/P01.svg',
        unitPricePaise: pS1.pricePaise,
        qty: 1,
        quantityValue: pS1.quantityValue,
        quantityUnit: pS1.quantityUnit
      }
    ],
    itemsTotalPaise: pS1.pricePaise,
    customerDeliveryChargePaise: 0,
    totalPayablePaise: pS1.pricePaise,
    platformFeePaise: calculatePlatformFee(pS1.pricePaise),
    partnerPayoutPaise: calculatePartnerPayout(10),
    sellerNetPaise: calculateSellerNet({ itemsTotalPaise: pS1.pricePaise, deliveryMode: 'INCLUDED', partnerPayoutPaise: calculatePartnerPayout(10) }),
    deliveryMode: 'INCLUDED',
    address: {
      name: rohan.name.en,
      phone: rohan.phone,
      line: rohan.addresses[0].line,
      landmark: rohan.addresses[0].landmark || '',
      lat: rohan.addresses[0].lat,
      lng: rohan.addresses[0].lng
    },
    pickup: {
      lat: s1.location.lat,
      lng: s1.location.lng,
      line: s1.location.line
    },
    roadDistanceKm: 10,
    etaMins: s1.prepTimeMins + 25,
    paymentMethod: 'COD',
    payment: {
      status: 'COD_PENDING'
    },
    status: 'PACKED',
    statusHistory: [
      { status: 'PLACED', at: new Date(now - 4 * 3600 * 1000) },
      { status: 'ACCEPTED', at: new Date(now - 3.5 * 3600 * 1000) },
      { status: 'PACKED', at: new Date(now - 45 * 60 * 1000) }
    ],
    isDemo: true
  });

  // Rohan 5: DELIVERED yesterday from S3 with NO review yet (so he can review live)
  await Order.create({
    orderNo: await generateOrderNo(),
    customer: rohan._id,
    seller: s3._id,
    partner: partnerUsers[0]._id,
    deliveryCode: generateDeliveryCode(),
    items: [
      {
        product: pS3._id,
        name: { en: pS3.name.en, mr: pS3.name.mr },
        image: pS3.images[0] || '/seed-images/P11.svg',
        unitPricePaise: pS3.pricePaise,
        qty: 3,
        quantityValue: pS3.quantityValue,
        quantityUnit: pS3.quantityUnit
      }
    ],
    itemsTotalPaise: pS3.pricePaise * 3,
    customerDeliveryChargePaise: 0,
    totalPayablePaise: pS3.pricePaise * 3,
    platformFeePaise: calculatePlatformFee(pS3.pricePaise * 3),
    partnerPayoutPaise: calculatePartnerPayout(30),
    sellerNetPaise: calculateSellerNet({ itemsTotalPaise: pS3.pricePaise * 3, deliveryMode: 'INCLUDED', partnerPayoutPaise: calculatePartnerPayout(30) }),
    deliveryMode: 'INCLUDED',
    address: {
      name: rohan.name.en,
      phone: rohan.phone,
      line: rohan.addresses[0].line,
      landmark: rohan.addresses[0].landmark || '',
      lat: rohan.addresses[0].lat,
      lng: rohan.addresses[0].lng
    },
    pickup: {
      lat: s3.location.lat,
      lng: s3.location.lng,
      line: s3.location.line
    },
    roadDistanceKm: 30,
    etaMins: s3.prepTimeMins + 55,
    paymentMethod: 'RAZORPAY',
    payment: {
      status: 'PAID',
      razorpayOrderId: 'demo_order_open_5',
      razorpayPaymentId: 'demo_pay_open_5',
      paymentInstrument: 'upi',
      paidAt: new Date(now - 28 * 3600 * 1000)
    },
    status: 'DELIVERED',
    statusHistory: [
      { status: 'PLACED', at: new Date(now - 28 * 3600 * 1000) },
      { status: 'ACCEPTED', at: new Date(now - 27 * 3600 * 1000) },
      { status: 'PACKED', at: new Date(now - 25 * 3600 * 1000) },
      { status: 'PICKED_UP', at: new Date(now - 24.5 * 3600 * 1000) },
      { status: 'DELIVERED', at: new Date(now - 24 * 3600 * 1000) }
    ],
    ledgerPosted: true,
    isDemo: true
  });

  // Priya: 1 PACKED from S2
  await Order.create({
    orderNo: await generateOrderNo(),
    customer: priya._id,
    seller: s2._id,
    partner: null,
    deliveryCode: generateDeliveryCode(),
    items: [
      {
        product: pS2._id,
        name: { en: pS2.name.en, mr: pS2.name.mr },
        image: pS2.images[0] || '/seed-images/P06.svg',
        unitPricePaise: pS2.pricePaise,
        qty: 1,
        quantityValue: pS2.quantityValue,
        quantityUnit: pS2.quantityUnit
      }
    ],
    itemsTotalPaise: pS2.pricePaise,
    customerDeliveryChargePaise: 0,
    totalPayablePaise: pS2.pricePaise,
    platformFeePaise: calculatePlatformFee(pS2.pricePaise),
    partnerPayoutPaise: calculatePartnerPayout(14),
    sellerNetPaise: calculateSellerNet({ itemsTotalPaise: pS2.pricePaise, deliveryMode: 'INCLUDED', partnerPayoutPaise: calculatePartnerPayout(14) }),
    deliveryMode: 'INCLUDED',
    address: {
      name: priya.name.en,
      phone: priya.phone,
      line: priya.addresses[0].line,
      landmark: priya.addresses[0].landmark || '',
      lat: priya.addresses[0].lat,
      lng: priya.addresses[0].lng
    },
    pickup: {
      lat: s2.location.lat,
      lng: s2.location.lng,
      line: s2.location.line
    },
    roadDistanceKm: 14,
    etaMins: s2.prepTimeMins + 35,
    paymentMethod: 'RAZORPAY',
    payment: {
      status: 'PAID',
      razorpayOrderId: 'demo_order_priya_1',
      razorpayPaymentId: 'demo_pay_priya_1',
      paymentInstrument: 'card',
      paidAt: new Date(now - 2 * 3600 * 1000)
    },
    status: 'PACKED',
    statusHistory: [
      { status: 'PLACED', at: new Date(now - 2 * 3600 * 1000) },
      { status: 'ACCEPTED', at: new Date(now - 1.5 * 3600 * 1000) },
      { status: 'PACKED', at: new Date(now - 20 * 60 * 1000) }
    ],
    isDemo: true
  });

  // Amit: 1 PLACED from S3
  await Order.create({
    orderNo: await generateOrderNo(),
    customer: amit._id,
    seller: s3._id,
    partner: null,
    deliveryCode: generateDeliveryCode(),
    items: [
      {
        product: pS3._id,
        name: { en: pS3.name.en, mr: pS3.name.mr },
        image: pS3.images[0] || '/seed-images/P11.svg',
        unitPricePaise: pS3.pricePaise,
        qty: 3,
        quantityValue: pS3.quantityValue,
        quantityUnit: pS3.quantityUnit
      }
    ],
    itemsTotalPaise: pS3.pricePaise * 3,
    customerDeliveryChargePaise: 0,
    totalPayablePaise: pS3.pricePaise * 3,
    platformFeePaise: calculatePlatformFee(pS3.pricePaise * 3),
    partnerPayoutPaise: calculatePartnerPayout(28),
    sellerNetPaise: calculateSellerNet({ itemsTotalPaise: pS3.pricePaise * 3, deliveryMode: 'INCLUDED', partnerPayoutPaise: calculatePartnerPayout(28) }),
    deliveryMode: 'INCLUDED',
    address: {
      name: amit.name.en,
      phone: amit.phone,
      line: amit.addresses[0].line,
      landmark: amit.addresses[0].landmark || '',
      lat: amit.addresses[0].lat,
      lng: amit.addresses[0].lng
    },
    pickup: {
      lat: s3.location.lat,
      lng: s3.location.lng,
      line: s3.location.line
    },
    roadDistanceKm: 28,
    etaMins: s3.prepTimeMins + 50,
    paymentMethod: 'COD',
    payment: {
      status: 'COD_PENDING'
    },
    status: 'PLACED',
    statusHistory: [{ status: 'PLACED', at: new Date(now - 15 * 60 * 1000) }],
    isDemo: true
  });
  console.log('Seeded 7 open demo orders across Rohan, Priya, and Amit.');

  // 10. Seed Support Tickets (Section 17.10)
  console.log('Seeding support tickets...');
  const s1Order = deliveredOrders.find((ord) => ord.seller.toString() === s1._id.toString());
  if (s1Order) {
    // Ticket 1: OPEN
    await SupportTicket.create({
      ticketNo: await generateTicketNo(),
      customer: s1Order.customer,
      seller: s1._id,
      order: s1Order._id,
      subject: 'Delayed pickle jar delivery inquiry',
      status: 'OPEN',
      messages: [
        {
          sender: 'customer',
          text: {
            en: 'Hello, the mango pickle jar seems to have delayed delivery. Can you check?',
            mr: 'नमस्कार, कैरीच्या लोणच्याची बाटली मिळण्यास उशीर झाला आहे. कृपया तपासू शकाल का?'
          },
          originalLang: 'en',
          at: new Date(now - 2 * 3600 * 1000)
        }
      ],
      unreadForSeller: true,
      unreadForCustomer: false,
      isDemo: true
    });

    // Ticket 2: IN_PROGRESS
    await SupportTicket.create({
      ticketNo: await generateTicketNo(),
      customer: s1Order.customer,
      seller: s1._id,
      order: s1Order._id,
      subject: 'Question about pickle ingredients',
      status: 'IN_PROGRESS',
      messages: [
        {
          sender: 'customer',
          text: {
            en: 'Does your pickle use organic sesame oil or regular?',
            mr: 'तुमच्या लोणच्यामध्ये सेंद्रिय तिळाचे तेल वापरले आहे की नेहमीचे?'
          },
          originalLang: 'en',
          at: new Date(now - 5 * 3600 * 1000)
        },
        {
          sender: 'seller',
          text: {
            en: 'We use 100% cold-pressed organic sesame oil without any preservatives.',
            mr: 'आम्ही कोणत्याही प्रिझर्व्हेटिव्हशिवाय १००% लाकडी घाण्याचे सेंद्रिय तीळ तेल वापरतो.'
          },
          originalLang: 'en',
          at: new Date(now - 4 * 3600 * 1000)
        }
      ],
      unreadForSeller: false,
      unreadForCustomer: true,
      isDemo: true
    });

    // Ticket 3: RESOLVED
    await SupportTicket.create({
      ticketNo: await generateTicketNo(),
      customer: s1Order.customer,
      seller: s1._id,
      order: s1Order._id,
      subject: 'Can I reuse the jar?',
      status: 'RESOLVED',
      messages: [
        {
          sender: 'customer',
          text: {
            en: 'Can I reuse the ceramic glass jar for kitchen storage?',
            mr: 'मी ही काचेची बरणी स्वयंपाकघरात साठवणीसाठी पुन्हा वापरू शकतो का?'
          },
          originalLang: 'en',
          at: new Date(now - 48 * 3600 * 1000)
        },
        {
          sender: 'seller',
          text: {
            en: 'Yes absolutely! It is food-grade glass and fully reusable after washing.',
            mr: 'हो नक्कीच! ही फूड-ग्रेड काच आहे आणि धुतल्यानंतर पुन्हा वापरता येते.'
          },
          originalLang: 'en',
          at: new Date(now - 46 * 3600 * 1000)
        }
      ],
      unreadForSeller: false,
      unreadForCustomer: false,
      isDemo: true
    });
  }
  console.log('Seeded 3 support tickets for Seller 1.');

  // 11. Seed Search Signals (Section 17.11)
  console.log('Seeding search misses...');
  const searchMisses = [
    { queryNormalized: 'papad', lang: 'en', count: 14 },
    { queryNormalized: 'पापड', lang: 'mr', count: 9 },
    { queryNormalized: 'bhakri', lang: 'en', count: 11 },
    { queryNormalized: 'sattu', lang: 'en', count: 6 },
    { queryNormalized: 'banana chips', lang: 'en', count: 12 },
    { queryNormalized: 'केळी वेफर्स', lang: 'mr', count: 7 },
    { queryNormalized: 'kolhapuri chappal', lang: 'en', count: 5 },
    { queryNormalized: 'amba poli', lang: 'en', count: 8 },
    { queryNormalized: 'sol kadhi', lang: 'en', count: 6 }
  ];
  for (const sm of searchMisses) {
    await SearchMiss.create({
      queryNormalized: sm.queryNormalized,
      lang: sm.lang,
      count: sm.count,
      lastAt: new Date(),
      isDemo: true
    });
  }
  console.log(`Seeded ${searchMisses.length} search miss signals.`);

  // 12. Final Report Print (Section 17.12)
  const [
    finalCategories,
    finalSellers,
    finalProducts,
    finalCustomers,
    finalPartners,
    finalOrders,
    finalReviews,
    finalTickets
  ] = await Promise.all([
    Category.countDocuments({ isDemo: true }),
    SellerProfile.countDocuments({ isDemo: true }),
    Product.countDocuments({ isDemo: true }),
    User.countDocuments({ role: 'customer', isDemo: true }),
    PartnerProfile.countDocuments({ isDemo: true }),
    Order.countDocuments({ isDemo: true }),
    Review.countDocuments({ isDemo: true }),
    SupportTicket.countDocuments({ isDemo: true })
  ]);

  console.log('\n=============================================================');
  console.log('                 NATIVERISE SEED SUMMARY                     ');
  console.log('=============================================================');
  console.log(` Categories:        ${finalCategories} (expected 8)`);
  console.log(` Sellers:           ${finalSellers} (expected 8)`);
  console.log(` Products:          ${finalProducts} (expected 40)`);
  console.log(` Customers:         ${finalCustomers} (expected 5)`);
  console.log(` Partners:          ${finalPartners} (expected 3)`);
  console.log(` Total Orders:      ${finalOrders} (8 weeks delivered + 7 open)`);
  console.log(` Reviews:           ${finalReviews} (expected ~160)`);
  console.log(` Support Tickets:   ${finalTickets} (expected 3)`);
  console.log('-------------------------------------------------------------');
  console.log('DEMO ACCOUNTS TABLE (Password: ' + config.SEED_DEMO_PASSWORD + ')');
  console.log('-------------------------------------------------------------');
  console.log('| Role     | Name                  | Email                                  |');
  console.log('|----------|-----------------------|----------------------------------------|');
  for (const c of demoCustomers) {
    console.log(`| CUSTOMER | ${c.name.en.padEnd(21)} | ${c.email.padEnd(38)} |`);
  }
  for (const p of demoPartners) {
    console.log(`| PARTNER  | ${p.name.en.padEnd(21)} | ${p.email.padEnd(38)} |`);
  }
  for (const s of demoSellers) {
    console.log(`| SELLER   | ${s.name.en.padEnd(21)} | ${s.email.padEnd(38)} |`);
  }
  console.log('-------------------------------------------------------------');
  console.log('10 DEMO QUESTIONS (Section 16.4):');
  console.log(' 1. Customer: "Products under Rs 300"');
  console.log(' 2. Customer: "Pickles near me"');
  console.log(' 3. Customer: "Where is my order"');
  console.log(' 4. Customer: "Can you deliver to my location and how long"');
  console.log(' 5. Customer: "Cancellation policy"');
  console.log(' 6. Customer: "Tell me about the seller of this product"');
  console.log(' 7. Customer: "Report a problem with my order"');
  console.log(' 8. Seller:   "How many orders this week"');
  console.log(' 9. Seller:   "Write a description for my mango pickle"');
  console.log(' 10. Seller:  "What do customers complain about most"');
  console.log('=============================================================\n');
}

// If invoked directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed({ wipeDemoOnly: true })
    .then(() => {
      console.log('Seed completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
