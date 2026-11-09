"""
Supabase Automated Database Seed & Sync Script for JatraSheba
Author: Antigravity Senior Full-Stack Transportation Architect
"""

import urllib.request
import json
from datetime import datetime, date, timedelta, timezone

import os
import sys

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ftrfdvqrpymhrmtpwzof.supabase.co/rest/v1")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", sys.argv[1] if len(sys.argv) > 1 else "")

HEADERS = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
}

def upsert(table: str, data: list):
    url = f"{SUPABASE_URL}/{table}"
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=HEADERS, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"[OK] Upserted {len(data)} rows into '{table}'")
            return True
    except Exception as e:
        print(f"[ERR] Failed on '{table}': {e}")
        if hasattr(e, "read"):
            print("     Details:", e.read().decode())
        return False

def main():
    print("==================================================")
    print("  Populating JatraSheba Supabase Production Data  ")
    print("==================================================")

    # 1. CITIES
    cities = [
        {"id": "c1000000-0000-0000-0000-000000000001", "name_en": "Dhaka", "name_bn": "ঢাকা", "division": "Dhaka", "is_popular": True},
        {"id": "c1000000-0000-0000-0000-000000000002", "name_en": "Chattogram", "name_bn": "চট্টগ্রাম", "division": "Chattogram", "is_popular": True},
        {"id": "c1000000-0000-0000-0000-000000000003", "name_en": "Cox's Bazar", "name_bn": "কক্সবাজার", "division": "Chattogram", "is_popular": True},
        {"id": "c1000000-0000-0000-0000-000000000004", "name_en": "Sylhet", "name_bn": "সিলেট", "division": "Sylhet", "is_popular": True},
        {"id": "c1000000-0000-0000-0000-000000000005", "name_en": "Rajshahi", "name_bn": "রাজশাহী", "division": "Rajshahi", "is_popular": True},
        {"id": "c1000000-0000-0000-0000-000000000006", "name_en": "Khulna", "name_bn": "খুলনা", "division": "Khulna", "is_popular": True},
        {"id": "c1000000-0000-0000-0000-000000000007", "name_en": "Barishal", "name_bn": "বরিশাল", "division": "Barishal", "is_popular": False},
        {"id": "c1000000-0000-0000-0000-000000000008", "name_en": "Bogura", "name_bn": "বগুড়া", "division": "Rajshahi", "is_popular": False}
    ]
    upsert("cities", cities)

    # 2. OPERATORS
    operators = [
        {"id": "a0000000-0000-0000-0000-000000000001", "name": "Green Line Paribahan", "code": "GLP", "contact_email": "info@greenline.com.bd", "contact_phone": "+8801711000001", "logo_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=100&fit=crop", "commission_rate": 5.0, "status": "active", "is_own_fleet": False, "rating": 4.85, "address": "9/2 Outer Circular Road, Rajarbagh, Dhaka"},
        {"id": "a0000000-0000-0000-0000-000000000002", "name": "Shohagh Paribahan", "code": "SHP", "contact_email": "support@shohagh.com", "contact_phone": "+8801711000002", "logo_url": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=100&h=100&fit=crop", "commission_rate": 5.0, "status": "active", "is_own_fleet": False, "rating": 4.70, "address": "63 DIT Road, Malibagh, Dhaka"},
        {"id": "a0000000-0000-0000-0000-000000000003", "name": "Hanif Enterprise", "code": "HNF", "contact_email": "contact@hanifenterprise.com", "contact_phone": "+8801711000003", "logo_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=100&fit=crop", "commission_rate": 4.5, "status": "active", "is_own_fleet": False, "rating": 4.60, "address": "Gabtoli Interdistrict Bus Terminal, Dhaka"},
        {"id": "a0000000-0000-0000-0000-000000000004", "name": "Ena Travels", "code": "ENA", "contact_email": "info@enatravels.com", "contact_phone": "+8801711000004", "logo_url": "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=100&h=100&fit=crop", "commission_rate": 4.0, "status": "active", "is_own_fleet": False, "rating": 4.50, "address": "Mohakhali Bus Terminal, Dhaka"},
        {"id": "a0000000-0000-0000-0000-000000000005", "name": "Desh Travels", "code": "DSH", "contact_email": "help@deshtravels.com.bd", "contact_phone": "+8801711000005", "logo_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=100&fit=crop", "commission_rate": 5.5, "status": "active", "is_own_fleet": False, "rating": 4.90, "address": "Sayedabad Bus Terminal, Dhaka"},
        {"id": "a0000000-0000-0000-0000-000000000006", "name": "JatraSheba Express (Own Fleet)", "code": "JSB", "contact_email": "fleet@jatrasheba.com", "contact_phone": "+8801711000000", "logo_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=100&h=100&fit=crop", "commission_rate": 0.0, "status": "active", "is_own_fleet": True, "rating": 4.95, "address": "Head Office, Tejgaon Commercial Area, Dhaka"}
    ]
    upsert("operators", operators)

    # 3. BUS CATEGORIES
    bus_categories = [
        {"id": "b0000000-0000-0000-0000-000000000001", "name": "Multi-Axle Scania Luxury AC", "code": "SCANIA-LUX", "is_ac": True, "amenities": ["High-speed Wi-Fi", "Mineral Water", "Blanket", "Type-C USB Charger", "Live Tracking", "Entertainment TV"], "description": "Ultra-premium Scania comfort with ergonomic recline and air suspension"},
        {"id": "b0000000-0000-0000-0000-000000000002", "name": "Hyundai VIP Business Class (2+1)", "code": "HYU-VIP", "is_ac": True, "amenities": ["Extra Legroom", "Reclining Footrest", "Wi-Fi", "Water & Snacks", "Reading Light"], "description": "Spacious 2+1 individual seating designed for business executives and tourists"},
        {"id": "b0000000-0000-0000-0000-000000000003", "name": "Royal Sleeper Coach (Double Berth)", "code": "SLP-BERTH", "is_ac": True, "amenities": ["Flat Sleeping Berth", "Fresh Blanket & Pillow", "Curtain Privacy", "AC", "Personal Light"], "description": "Luxurious flat sleeping berths ideal for overnight journeys to Cox's Bazar and Sylhet"},
        {"id": "b0000000-0000-0000-0000-000000000004", "name": "Deluxe Non-AC (Hino 1J)", "code": "HINO-DELUXE", "is_ac": False, "amenities": ["Comfortable Seats", "Wide Windows", "First Aid"], "description": "Affordable, reliable transportation connecting all regional hubs"}
    ]
    upsert("bus_categories", bus_categories)

    # 4. COUNTERS
    counters = [
        {"id": "c0000000-0000-0000-0000-000000000001", "operator_id": "a0000000-0000-0000-0000-000000000001", "name": "Sayedabad Counter 1", "code": "SBD-01", "city": "Dhaka", "address": "Sayedabad Interdistrict Bus Terminal, Dhaka", "latitude": 23.7164, "longitude": 90.4287, "phone": "+8801811223344", "contact_person": "Md. Rafiqul Islam"},
        {"id": "c0000000-0000-0000-0000-000000000002", "operator_id": "a0000000-0000-0000-0000-000000000001", "name": "Dampara Central Counter", "code": "DMP-01", "city": "Chattogram", "address": "Dampara Police Line Mor, Chattogram", "latitude": 22.3569, "longitude": 91.8215, "phone": "+8801811223345", "contact_person": "Abdur Rahman"},
        {"id": "c0000000-0000-0000-0000-000000000003", "operator_id": "a0000000-0000-0000-0000-000000000001", "name": "Kolatoli Beach Counter", "code": "KLT-01", "city": "Cox's Bazar", "address": "Main Beach Road, Kolatoli Point, Cox's Bazar", "latitude": 21.4272, "longitude": 91.9806, "phone": "+8801811223346", "contact_person": "Kazi Mahbub"},
        {"id": "c0000000-0000-0000-0000-000000000004", "operator_id": "a0000000-0000-0000-0000-000000000002", "name": "Gabtoli VIP Counter", "code": "GBT-01", "city": "Dhaka", "address": "Gabtoli Bus Terminal Gate 2, Dhaka", "latitude": 23.7845, "longitude": 90.3478, "phone": "+8801811223347", "contact_person": "Shamsul Alam"},
        {"id": "c0000000-0000-0000-0000-000000000005", "operator_id": "a0000000-0000-0000-0000-000000000004", "name": "Mohakhali Counter A", "code": "MHK-01", "city": "Dhaka", "address": "Mohakhali Terminal Entrance, Dhaka", "latitude": 23.7781, "longitude": 90.4043, "phone": "+8801811223348", "contact_person": "Kamrul Hasan"},
        {"id": "c0000000-0000-0000-0000-000000000006", "operator_id": "a0000000-0000-0000-0000-000000000004", "name": "Kadamtali Main Counter", "code": "KDM-01", "city": "Sylhet", "address": "Kadamtali Bus Terminal, Sylhet", "latitude": 24.8864, "longitude": 91.8807, "phone": "+8801811223349", "contact_person": "Nurul Huda"}
    ]
    upsert("counters", counters)

    # 5. SEAT LAYOUTS
    seat_layouts = [
        {"id": "d0000000-0000-0000-0000-000000000001", "name": "Standard 2+2 (40 Seats)", "total_seats": 40, "rows": 10, "columns": 4, "layout_type": "2+2", "deck_type": "single"},
        {"id": "d0000000-0000-0000-0000-000000000002", "name": "Business Executive 2+1 (28 Seats)", "total_seats": 28, "rows": 9, "columns": 3, "layout_type": "2+1", "deck_type": "single"},
        {"id": "d0000000-0000-0000-0000-000000000003", "name": "Royal Sleeper (30 Berths)", "total_seats": 30, "rows": 10, "columns": 3, "layout_type": "sleeper_single", "deck_type": "double"}
    ]
    upsert("seat_layouts", seat_layouts)

    # 6. BUSES
    buses = [
        {"id": "e0000000-0000-0000-0000-000000000001", "operator_id": "a0000000-0000-0000-0000-000000000001", "category_id": "b0000000-0000-0000-0000-000000000001", "seat_layout_id": "d0000000-0000-0000-0000-000000000001", "registration_number": "DHAKA-METRO-BA-14-8899", "coach_number": "GL-501 (Scania Multi-Axle)", "model": "Scania K410IB 6x2"},
        {"id": "e0000000-0000-0000-0000-000000000002", "operator_id": "a0000000-0000-0000-0000-000000000001", "category_id": "b0000000-0000-0000-0000-000000000002", "seat_layout_id": "d0000000-0000-0000-0000-000000000002", "registration_number": "DHAKA-METRO-BA-15-2233", "coach_number": "GL-702 (Business VIP)", "model": "Volvo B11R 2+1"},
        {"id": "e0000000-0000-0000-0000-000000000003", "operator_id": "a0000000-0000-0000-0000-000000000002", "category_id": "b0000000-0000-0000-0000-000000000001", "seat_layout_id": "d0000000-0000-0000-0000-000000000001", "registration_number": "DHAKA-METRO-BA-11-4455", "coach_number": "SH-305 (Scania Deluxe)", "model": "Scania Touring HD"},
        {"id": "e0000000-0000-0000-0000-000000000004", "operator_id": "a0000000-0000-0000-0000-000000000005", "category_id": "b0000000-0000-0000-0000-000000000003", "seat_layout_id": "d0000000-0000-0000-0000-000000000003", "registration_number": "DHAKA-METRO-BA-16-9900", "coach_number": "DSH-888 (Royal Sleeper)", "model": "Hyundai Universe Sleeper"}
    ]
    upsert("buses", buses)

    # 7. ROUTES
    routes = [
        {"id": "f0000000-0000-0000-0000-000000000001", "operator_id": "a0000000-0000-0000-0000-000000000001", "origin_city_id": "c1000000-0000-0000-0000-000000000001", "destination_city_id": "c1000000-0000-0000-0000-000000000003", "distance_km": 390, "estimated_duration_minutes": 480},
        {"id": "f0000000-0000-0000-0000-000000000002", "operator_id": "a0000000-0000-0000-0000-000000000001", "origin_city_id": "c1000000-0000-0000-0000-000000000001", "destination_city_id": "c1000000-0000-0000-0000-000000000002", "distance_km": 245, "estimated_duration_minutes": 330},
        {"id": "f0000000-0000-0000-0000-000000000003", "operator_id": "a0000000-0000-0000-0000-000000000004", "origin_city_id": "c1000000-0000-0000-0000-000000000001", "destination_city_id": "c1000000-0000-0000-0000-000000000004", "distance_km": 240, "estimated_duration_minutes": 360},
        {"id": "f0000000-0000-0000-0000-000000000004", "operator_id": "a0000000-0000-0000-0000-000000000003", "origin_city_id": "c1000000-0000-0000-0000-000000000001", "destination_city_id": "c1000000-0000-0000-0000-000000000005", "distance_km": 250, "estimated_duration_minutes": 330}
    ]
    upsert("routes", routes)

    # 8. COUPONS
    now = datetime.now(timezone.utc)
    coupons = [
        {"id": "a1000000-0000-0000-0000-000000000001", "code": "SHUVOJATRA", "discount_type": "fixed", "discount_value": 150.00, "min_spend": 1000.00, "max_discount": 150.00, "valid_from": (now - timedelta(days=10)).isoformat(), "valid_to": (now + timedelta(days=60)).isoformat(), "usage_limit": 5000, "usage_count": 124, "is_active": True},
        {"id": "a1000000-0000-0000-0000-000000000002", "code": "EID2026", "discount_type": "percentage", "discount_value": 10.00, "min_spend": 1200.00, "max_discount": 300.00, "valid_from": (now - timedelta(days=5)).isoformat(), "valid_to": (now + timedelta(days=90)).isoformat(), "usage_limit": 10000, "usage_count": 480, "is_active": True},
        {"id": "a1000000-0000-0000-0000-000000000003", "code": "BKASH50", "discount_type": "fixed", "discount_value": 50.00, "min_spend": 500.00, "max_discount": 50.00, "valid_from": (now - timedelta(days=2)).isoformat(), "valid_to": (now + timedelta(days=30)).isoformat(), "usage_limit": 3000, "usage_count": 89, "is_active": True}
    ]
    upsert("coupons", coupons)

    # 9. NOTICES & FAQS
    notices = [
        {"id": "b1000000-0000-0000-0000-000000000001", "title": "Special Eid Advance Ticket Booking Live!", "content": "Advance holiday booking is now open across all AC and Non-AC operators. Check your desired route and secure your seat early.", "is_marquee": True, "is_active": True},
        {"id": "b1000000-0000-0000-0000-000000000002", "title": "Padma Bridge Route Update", "content": "All Southern district routes via Padma Bridge now take 2.5 hours less travel time.", "is_marquee": False, "is_active": True}
    ]
    upsert("notices", notices)

    faqs = [
        {"id": "c1000000-0000-0000-0000-000000000001", "question_en": "How do I receive my bus ticket after payment?", "question_bn": "পেমেন্টের পর আমি কীভাবে টিকিট পাব?", "answer_en": "Immediately upon payment confirmation, your E-Ticket with QR code will appear on screen, and an SMS confirmation will be sent to your mobile phone. You can also print or download the PDF ticket anytime.", "answer_bn": "পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই কিউআর কোডসহ আপনার ই-টিকিট প্রদর্শিত হবে এবং এসএমএস চলে যাবে। আপনি চাইলে যেকোনো সময় পিডিএফ ডাউনলোড বা প্রিন্ট করতে পারবেন।", "category": "Booking", "order_idx": 1},
        {"id": "c1000000-0000-0000-0000-000000000002", "question_en": "Can I cancel my ticket and get a refund?", "question_bn": "টিকিট বাতিল করে রিফান্ড পাওয়া যাবে কি?", "answer_en": "Yes, tickets can be cancelled up to 12 hours prior to trip departure according to the operator cancellation policy. Eligible refund amounts are credited back within 2-4 business days.", "answer_bn": "হ্যাঁ, যাত্রার নির্দিষ্ট সময় পূর্বে টিকিট বাতিল করলে অপারেটরের পলিসি অনুযায়ী নির্ধারিত চার্জ বাদে বাকি টাকা রিফান্ড পেয়ে যাবেন।", "category": "Cancellation & Refund", "order_idx": 2},
        {"id": "c1000000-0000-0000-0000-000000000003", "question_en": "Can I book tickets directly from physical counters?", "question_bn": "কাউন্টার থেকে সরাসরি টিকিট কাটা যাবে কি?", "answer_en": "Yes! Our platform synchronizes live seat inventories across both our online web portal and all physical authorized counters across Bangladesh in real-time.", "answer_bn": "অবশ্যই! আমাদের কেন্দ্রীয় রিয়েল-টাইম ডাটাবেসের কারণে অনলাইন ও দেশের সকল অনুমোদিত বাস কাউন্টারে একই সাথে সরাসরি টিকিট কাটা যায়।", "category": "Counter POS", "order_idx": 3}
    ]
    upsert("faqs", faqs)

    print("\n[SUCCESS] Supabase database sync completed successfully!")

if __name__ == "__main__":
    main()
