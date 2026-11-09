-- ========================================================================
-- PRODUCTION MULTI-OPERATOR SEED DATA (BANGLADESH MARKET)
-- Valid Hexadecimal UUIDs for PostgreSQL 15+
-- ========================================================================

-- 1. CITIES OF BANGLADESH
INSERT INTO cities (id, name_en, name_bn, division, is_popular) VALUES
('c1000000-0000-0000-0000-000000000001', 'Dhaka', 'ঢাকা', 'Dhaka', true),
('c1000000-0000-0000-0000-000000000002', 'Chattogram', 'চট্টগ্রাম', 'Chattogram', true),
('c1000000-0000-0000-0000-000000000003', 'Cox''s Bazar', 'কক্সবাজার', 'Chattogram', true),
('c1000000-0000-0000-0000-000000000004', 'Sylhet', 'সিলেট', 'Sylhet', true),
('c1000000-0000-0000-0000-000000000005', 'Rajshahi', 'রাজশাহী', 'Rajshahi', true),
('c1000000-0000-0000-0000-000000000006', 'Khulna', 'খুলনা', 'Khulna', true),
('c1000000-0000-0000-0000-000000000007', 'Barishal', 'বরিশাল', 'Barishal', false),
('c1000000-0000-0000-0000-000000000008', 'Bogura', 'বগুড়া', 'Rajshahi', false)
ON CONFLICT (id) DO NOTHING;

-- 2. OPERATORS
INSERT INTO operators (id, name, code, contact_email, contact_phone, logo_url, commission_rate, status, is_own_fleet, rating, address) VALUES
('a0000000-0000-0000-0000-000000000001', 'Green Line Paribahan', 'GLP', 'info@greenline.com.bd', '+8801711000001', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=100&fit=crop', 5.00, 'active', false, 4.85, '9/2 Outer Circular Road, Rajarbagh, Dhaka'),
('a0000000-0000-0000-0000-000000000002', 'Shohagh Paribahan', 'SHP', 'support@shohagh.com', '+8801711000002', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=100&h=100&fit=crop', 5.00, 'active', false, 4.70, '63 DIT Road, Malibagh, Dhaka'),
('a0000000-0000-0000-0000-000000000003', 'Hanif Enterprise', 'HNF', 'contact@hanifenterprise.com', '+8801711000003', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=100&fit=crop', 4.50, 'active', false, 4.60, 'Gabtoli Interdistrict Bus Terminal, Dhaka'),
('a0000000-0000-0000-0000-000000000004', 'Ena Travels', 'ENA', 'info@enatravels.com', '+8801711000004', 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=100&h=100&fit=crop', 4.00, 'active', false, 4.50, 'Mohakhali Bus Terminal, Dhaka'),
('a0000000-0000-0000-0000-000000000005', 'Desh Travels', 'DSH', 'help@deshtravels.com.bd', '+8801711000005', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=100&fit=crop', 5.50, 'active', false, 4.90, 'Sayedabad Bus Terminal, Dhaka'),
('a0000000-0000-0000-0000-000000000006', 'JatraSheba Express (Own Fleet)', 'JSB', 'fleet@jatrasheba.com', '+8801711000000', 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=100&fit=crop', 0.00, 'active', true, 4.95, 'Head Office, Tejgaon Commercial Area, Dhaka')
ON CONFLICT (id) DO NOTHING;

-- 3. BUS CATEGORIES
INSERT INTO bus_categories (id, name, code, is_ac, amenities, description) VALUES
('b0000000-0000-0000-0000-000000000001', 'Multi-Axle Scania Luxury AC', 'SCANIA-LUX', true, ARRAY['High-speed Wi-Fi', 'Mineral Water', 'Blanket', 'Type-C USB Charger', 'Live Tracking', 'Entertainment TV'], 'Ultra-premium Scania comfort with ergonomic recline and air suspension'),
('b0000000-0000-0000-0000-000000000002', 'Hyundai VIP Business Class (2+1)', 'HYU-VIP', true, ARRAY['Extra Legroom', 'Reclining Footrest', 'Wi-Fi', 'Water & Snacks', 'Reading Light'], 'Spacious 2+1 individual seating designed for business executives and tourists'),
('b0000000-0000-0000-0000-000000000003', 'Royal Sleeper Coach (Double Berth)', 'SLP-BERTH', true, ARRAY['Flat Sleeping Berth', 'Fresh Blanket & Pillow', 'Curtain Privacy', 'AC', 'Personal Light'], 'Luxurious flat sleeping berths ideal for overnight journeys to Cox''s Bazar and Sylhet'),
('b0000000-0000-0000-0000-000000000004', 'Deluxe Non-AC (Hino 1J)', 'HINO-DELUXE', false, ARRAY['Comfortable Seats', 'Wide Windows', 'First Aid'], 'Affordable, reliable transportation connecting all regional hubs')
ON CONFLICT (id) DO NOTHING;

-- 4. PHYSICAL COUNTERS (POS LOCATIONS)
INSERT INTO counters (id, operator_id, name, code, city, address, latitude, longitude, phone, contact_person) VALUES
('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Sayedabad Counter 1', 'SBD-01', 'Dhaka', 'Sayedabad Interdistrict Bus Terminal, Dhaka', 23.7164, 90.4287, '+8801811223344', 'Md. Rafiqul Islam'),
('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Dampara Central Counter', 'DMP-01', 'Chattogram', 'Dampara Police Line Mor, Chattogram', 22.3569, 91.8215, '+8801811223345', 'Abdur Rahman'),
('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Kolatoli Beach Counter', 'KLT-01', 'Cox''s Bazar', 'Main Beach Road, Kolatoli Point, Cox''s Bazar', 21.4272, 91.9806, '+8801811223346', 'Kazi Mahbub'),
('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'Gabtoli VIP Counter', 'GBT-01', 'Dhaka', 'Gabtoli Bus Terminal Gate 2, Dhaka', 23.7845, 90.3478, '+8801811223347', 'Shamsul Alam'),
('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'Mohakhali Counter A', 'MHK-01', 'Dhaka', 'Mohakhali Terminal Entrance, Dhaka', 23.7781, 90.4043, '+8801811223348', 'Kamrul Hasan'),
('c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000004', 'Kadamtali Main Counter', 'KDM-01', 'Sylhet', 'Kadamtali Bus Terminal, Sylhet', 24.8864, 91.8807, '+8801811223349', 'Nurul Huda')
ON CONFLICT (id) DO NOTHING;

-- 5. SEAT LAYOUTS
INSERT INTO seat_layouts (id, name, total_seats, rows, columns, layout_type, deck_type) VALUES
('d0000000-0000-0000-0000-000000000001', 'Standard 2+2 (40 Seats)', 40, 10, 4, '2+2', 'single'),
('d0000000-0000-0000-0000-000000000002', 'Business Executive 2+1 (28 Seats)', 28, 9, 3, '2+1', 'single'),
('d0000000-0000-0000-0000-000000000003', 'Royal Sleeper (30 Berths)', 30, 10, 3, 'sleeper_single', 'double')
ON CONFLICT (id) DO NOTHING;

-- 6. BUS FLEET
INSERT INTO buses (id, operator_id, category_id, seat_layout_id, registration_number, coach_number, model) VALUES
('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'DHAKA-METRO-BA-14-8899', 'GL-501 (Scania Multi-Axle)', 'Scania K410IB 6x2'),
('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'DHAKA-METRO-BA-15-2233', 'GL-702 (Business VIP)', 'Volvo B11R 2+1'),
('e0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'DHAKA-METRO-BA-11-4455', 'SH-305 (Scania Deluxe)', 'Scania Touring HD'),
('e0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'DHAKA-METRO-BA-16-9900', 'DSH-888 (Royal Sleeper)', 'Hyundai Universe Sleeper')
ON CONFLICT (id) DO NOTHING;

-- 7. ROUTES
INSERT INTO routes (id, operator_id, origin_city_id, destination_city_id, distance_km, estimated_duration_minutes) VALUES
('f0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000003', 390, 480), -- Dhaka to Cox's Bazar
('f0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000002', 245, 330), -- Dhaka to Chattogram
('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000004', 240, 360), -- Dhaka to Sylhet
('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000005', 250, 330)  -- Dhaka to Rajshahi
ON CONFLICT (id) DO NOTHING;

-- 8. PROMOTIONAL COUPONS
INSERT INTO coupons (id, code, discount_type, discount_value, min_spend, max_discount, valid_from, valid_to, usage_limit, usage_count, is_active) VALUES
('a1000000-0000-0000-0000-000000000001', 'SHUVOJATRA', 'fixed', 150.00, 1000.00, 150.00, NOW() - INTERVAL '10 days', NOW() + INTERVAL '60 days', 5000, 124, true),
('a1000000-0000-0000-0000-000000000002', 'EID2026', 'percentage', 10.00, 1200.00, 300.00, NOW() - INTERVAL '5 days', NOW() + INTERVAL '90 days', 10000, 480, true),
('a1000000-0000-0000-0000-000000000003', 'BKASH50', 'fixed', 50.00, 500.00, 50.00, NOW() - INTERVAL '2 days', NOW() + INTERVAL '30 days', 3000, 89, true)
ON CONFLICT (id) DO NOTHING;

-- 9. NOTICES & CMS
INSERT INTO notices (id, title, content, is_marquee, is_active) VALUES
('b1000000-0000-0000-0000-000000000001', 'Special Eid Advance Ticket Booking Live!', 'Advance holiday booking is now open across all AC and Non-AC operators. Check your desired route and secure your seat early.', true, true),
('b1000000-0000-0000-0000-000000000002', 'Padma Bridge Route Update', 'All Southern district routes via Padma Bridge now take 2.5 hours less travel time.', false, true)
ON CONFLICT (id) DO NOTHING;

-- 10. FAQS
INSERT INTO faqs (id, question_en, question_bn, answer_en, answer_bn, category, order_idx) VALUES
('c1000000-0000-0000-0000-000000000001', 'How do I receive my bus ticket after payment?', 'পেমেন্টের পর আমি কীভাবে টিকিট পাব?', 'Immediately upon payment confirmation, your E-Ticket with QR code will appear on screen, and an SMS confirmation will be sent to your mobile phone. You can also print or download the PDF ticket anytime.', 'পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই কিউআর কোডসহ আপনার ই-টিকিট প্রদর্শিত হবে এবং এসএমএস চলে যাবে। আপনি চাইলে যেকোনো সময় পিডিএফ ডাউনলোড বা প্রিন্ট করতে পারবেন।', 'Booking', 1),
('c1000000-0000-0000-0000-000000000002', 'Can I cancel my ticket and get a refund?', 'টিকিট বাতিল করে রিফান্ড পাওয়া যাবে কি?', 'Yes, tickets can be cancelled up to 12 hours prior to trip departure according to the operator cancellation policy. Eligible refund amounts are credited back within 2-4 business days.', 'হ্যাঁ, যাত্রার নির্দিষ্ট সময় পূর্বে টিকিট বাতিল করলে অপারেটরের পলিসি অনুযায়ী নির্ধারিত চার্জ বাদে বাকি টাকা রিফান্ড পেয়ে যাবেন।', 'Cancellation & Refund', 2),
('c1000000-0000-0000-0000-000000000003', 'Can I book tickets directly from physical counters?', 'কাউন্টার থেকে সরাসরি টিকিট কাটা যাবে কি?', 'Yes! Our platform synchronizes live seat inventories across both our online web portal and all physical authorized counters across Bangladesh in real-time.', 'অবশ্যই! আমাদের কেন্দ্রীয় রিয়েল-টাইম ডাটাবেসের কারণে অনলাইন ও দেশের সকল অনুমোদিত বাস কাউন্টারে একই সাথে সরাসরি টিকিট কাটা যায়।', 'Counter POS', 3)
ON CONFLICT (id) DO NOTHING;
