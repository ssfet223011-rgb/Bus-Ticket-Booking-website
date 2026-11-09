-- ========================================================================
-- PRODUCTION MULTI-OPERATOR BUS TICKETING & COUNTER POS SCHEMA
-- Target Database: PostgreSQL 15+ / Supabase
-- ========================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================================
-- ENUMS (Safely Created with IF NOT EXISTS)
-- ========================================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
        CREATE TYPE user_role_enum AS ENUM (
            'super_admin',
            'admin',
            'finance_manager',
            'operator_owner',
            'operator_manager',
            'counter_manager',
            'counter_operator',
            'support_agent',
            'passenger'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'seat_status_enum') THEN
        CREATE TYPE seat_status_enum AS ENUM (
            'available',
            'selected',
            'held',
            'booked',
            'reserved',
            'disabled'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status_enum') THEN
        CREATE TYPE booking_status_enum AS ENUM (
            'initiated',
            'held',
            'pending_payment',
            'confirmed',
            'cancelled',
            'expired',
            'refund_pending',
            'refunded',
            'partially_refunded'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        CREATE TYPE payment_status_enum AS ENUM (
            'pending',
            'processing',
            'successful',
            'failed',
            'cancelled',
            'refunded',
            'partially_refunded'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_channel_enum') THEN
        CREATE TYPE booking_channel_enum AS ENUM (
            'website',
            'counter',
            'admin',
            'operator',
            'mobile_app'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_enum') THEN
        CREATE TYPE payment_method_enum AS ENUM (
            'bkash',
            'nagad',
            'rocket',
            'card',
            'cash',
            'bank_transfer',
            'pos'
        );
    END IF;
END $$;


-- ========================================================================
-- 1. IDENTITY & ACCESS CONTROL
-- ========================================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    nid_number TEXT,
    role user_role_enum NOT NULL DEFAULT 'passenger',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name user_role_enum UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    module TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ========================================================================
-- 2. ORGANIZATIONS (OPERATORS & COUNTERS)
-- ========================================================================

CREATE TABLE IF NOT EXISTS operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    trade_license TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    logo_url TEXT,
    commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'inactive')),
    is_own_fleet BOOLEAN NOT NULL DEFAULT false,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 4.5,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operator_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL CHECK (role IN ('operator_owner', 'operator_manager')),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (operator_id, user_id)
);

CREATE TABLE IF NOT EXISTS counters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    phone TEXT NOT NULL,
    contact_person TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS counter_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counter_id UUID NOT NULL REFERENCES counters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role_enum NOT NULL CHECK (role IN ('counter_manager', 'counter_operator')),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (counter_id, user_id)
);

-- ========================================================================
-- 3. FLEET & SEAT CONFIGURATION
-- ========================================================================

CREATE TABLE IF NOT EXISTS bus_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    is_ac BOOLEAN NOT NULL DEFAULT true,
    amenities TEXT[] DEFAULT ARRAY['Wifi', 'Water', 'Charging Port', 'Reading Light'],
    description TEXT
);

CREATE TABLE IF NOT EXISTS seat_layouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    total_seats INT NOT NULL,
    rows INT NOT NULL,
    columns INT NOT NULL,
    layout_type TEXT NOT NULL DEFAULT '2+2' CHECK (layout_type IN ('2+2', '2+1', 'sleeper_single', 'sleeper_double', 'double_decker')),
    deck_type TEXT NOT NULL DEFAULT 'single' CHECK (deck_type IN ('single', 'double')),
    configuration_json JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES bus_categories(id),
    seat_layout_id UUID NOT NULL REFERENCES seat_layouts(id),
    registration_number TEXT UNIQUE NOT NULL,
    coach_number TEXT NOT NULL,
    model TEXT NOT NULL,
    has_gps BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bus_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layout_id UUID NOT NULL REFERENCES seat_layouts(id) ON DELETE CASCADE,
    seat_number TEXT NOT NULL,
    deck TEXT NOT NULL DEFAULT 'lower',
    row_idx INT NOT NULL,
    col_idx INT NOT NULL,
    seat_type TEXT NOT NULL DEFAULT 'standard' CHECK (seat_type IN ('standard', 'vip', 'sleeper', 'wheelchair')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (layout_id, seat_number, deck)
);

CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    nid TEXT,
    status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS helpers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    nid TEXT,
    status TEXT NOT NULL DEFAULT 'active'
);

-- ========================================================================
-- 4. GEOGRAPHY & ROUTES
-- ========================================================================

CREATE TABLE IF NOT EXISTS cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT UNIQUE NOT NULL,
    name_bn TEXT NOT NULL,
    division TEXT NOT NULL,
    is_popular BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS terminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES operators(id) ON DELETE CASCADE,
    origin_city_id UUID NOT NULL REFERENCES cities(id),
    destination_city_id UUID NOT NULL REFERENCES cities(id),
    distance_km INT NOT NULL,
    estimated_duration_minutes INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    terminal_id UUID NOT NULL REFERENCES terminals(id),
    stop_order INT NOT NULL,
    stop_type TEXT NOT NULL DEFAULT 'boarding' CHECK (stop_type IN ('boarding', 'dropping', 'both', 'break')),
    duration_from_origin_minutes INT NOT NULL DEFAULT 0,
    UNIQUE (route_id, stop_order)
);

CREATE TABLE IF NOT EXISTS boarding_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    counter_id UUID REFERENCES counters(id),
    name TEXT NOT NULL,
    time_offset_minutes INT NOT NULL DEFAULT 0,
    landmark TEXT
);

CREATE TABLE IF NOT EXISTS dropping_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    counter_id UUID REFERENCES counters(id),
    name TEXT NOT NULL,
    time_offset_minutes INT NOT NULL DEFAULT 0,
    landmark TEXT
);

-- ========================================================================
-- 5. SCHEDULING & LIVE INVENTORY
-- ========================================================================

CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
    bus_id UUID NOT NULL REFERENCES buses(id),
    route_id UUID NOT NULL REFERENCES routes(id),
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    base_fare NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'boarding', 'departed', 'completed', 'cancelled', 'delayed')),
    driver_id UUID REFERENCES drivers(id),
    helper_id UUID REFERENCES helpers(id),
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trip Seats: Centralized seat inventory shared across online and counters
CREATE TABLE IF NOT EXISTS trip_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    seat_number TEXT NOT NULL,
    seat_type TEXT NOT NULL DEFAULT 'standard',
    fare NUMERIC(10, 2) NOT NULL,
    status seat_status_enum NOT NULL DEFAULT 'available',
    held_by_session TEXT,
    held_by_user_id UUID REFERENCES profiles(id),
    hold_expires_at TIMESTAMPTZ,
    gender_restriction TEXT DEFAULT 'any' CHECK (gender_restriction IN ('any', 'female_only', 'male_only')),
    booking_id UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (trip_id, seat_number)
);

CREATE INDEX idx_trip_seats_trip ON trip_seats(trip_id);
CREATE INDEX idx_trip_seats_status ON trip_seats(status);
CREATE INDEX idx_trip_seats_hold_expiry ON trip_seats(hold_expires_at) WHERE status = 'held';

-- ========================================================================
-- 6. BOOKING ENGINE & TICKETING
-- ========================================================================

CREATE TABLE IF NOT EXISTS passengers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    nid TEXT,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT UNIQUE NOT NULL,
    trip_id UUID NOT NULL REFERENCES trips(id),
    passenger_id UUID NOT NULL REFERENCES passengers(id),
    operator_id UUID NOT NULL REFERENCES operators(id),
    counter_id UUID REFERENCES counters(id),
    booked_by_user_id UUID REFERENCES profiles(id),
    booking_channel booking_channel_enum NOT NULL DEFAULT 'website',
    status booking_status_enum NOT NULL DEFAULT 'confirmed',
    total_amount NUMERIC(10, 2) NOT NULL,
    discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    service_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payable_amount NUMERIC(10, 2) NOT NULL,
    payment_status payment_status_enum NOT NULL DEFAULT 'successful',
    boarding_point TEXT NOT NULL,
    dropping_point TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    trip_seat_id UUID NOT NULL REFERENCES trip_seats(id),
    seat_number TEXT NOT NULL,
    fare NUMERIC(10, 2) NOT NULL,
    UNIQUE (booking_id, seat_number)
);

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_number TEXT NOT NULL,
    qr_code_payload TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'boarded', 'cancelled', 'refunded')),
    boarded_at TIMESTAMPTZ,
    verified_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    previous_status booking_status_enum,
    new_status booking_status_enum NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 7. FINANCIAL MANAGEMENT
-- ========================================================================

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    transaction_reference TEXT UNIQUE NOT NULL,
    payment_method payment_method_enum NOT NULL,
    provider_transaction_id TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BDT',
    status payment_status_enum NOT NULL DEFAULT 'successful',
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id),
    requested_amount NUMERIC(10, 2) NOT NULL,
    refund_amount NUMERIC(10, 2) NOT NULL,
    penalty_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'approved', 'completed', 'rejected')),
    approved_by UUID REFERENCES profiles(id),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES operators(id),
    total_fare NUMERIC(10, 2) NOT NULL,
    commission_rate NUMERIC(5, 2) NOT NULL,
    commission_amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'accrued' CHECK (status IN ('accrued', 'settled', 'disputed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES operators(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_sales NUMERIC(12, 2) NOT NULL,
    commission_deducted NUMERIC(12, 2) NOT NULL,
    net_payable NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'on_hold')),
    payout_reference TEXT,
    processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counter_id UUID REFERENCES counters(id),
    operator_id UUID REFERENCES operators(id),
    category TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    logged_by UUID REFERENCES profiles(id),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cash_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    counter_id UUID NOT NULL REFERENCES counters(id),
    staff_id UUID NOT NULL REFERENCES profiles(id),
    closing_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_cash_collected NUMERIC(12, 2) NOT NULL,
    total_expenses NUMERIC(12, 2) NOT NULL,
    net_cash_in_drawer NUMERIC(12, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'closed' CHECK (status IN ('open', 'closed', 'verified')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 8. MARKETING, PROMOTIONS & REVIEWS
-- ========================================================================

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL,
    min_spend NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_discount NUMERIC(10, 2),
    valid_from TIMESTAMPTZ NOT NULL,
    valid_to TIMESTAMPTZ NOT NULL,
    usage_limit INT,
    usage_count INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_en TEXT NOT NULL,
    title_bn TEXT NOT NULL,
    banner_url TEXT NOT NULL,
    link_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    order_idx INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    operator_id UUID NOT NULL REFERENCES operators(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    passenger_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 9. INFORMATION HUB & CMS
-- ========================================================================

CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_marquee BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_en TEXT NOT NULL,
    question_bn TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    answer_bn TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    order_idx INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS travel_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    cover_image TEXT,
    destination_city_id UUID REFERENCES cities(id),
    is_published BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id),
    booking_ref TEXT,
    subject TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'agent', 'system')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    type TEXT NOT NULL DEFAULT 'info',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================================================
-- 10. ATOMIC PROCEDURES FOR CRITICAL CONCURRENCY LOCKING
-- ========================================================================

-- Stored Procedure: Atomic Seat Hold with 10-Minute Timeout
CREATE OR REPLACE FUNCTION hold_seats(
    p_trip_id UUID,
    p_seat_numbers TEXT[],
    p_session_id TEXT,
    p_user_id UUID DEFAULT NULL,
    p_hold_minutes INT DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_seat TEXT;
    v_current_status seat_status_enum;
    v_expires_at TIMESTAMPTZ;
    v_held_by TEXT;
BEGIN
    -- First, release any expired holds on this trip
    PERFORM release_expired_holds();

    -- Lock the specific trip_seats rows for update
    FOR v_seat IN SELECT UNNEST(p_seat_numbers)
    LOOP
        SELECT status, hold_expires_at, held_by_session
        INTO v_current_status, v_expires_at, v_held_by
        FROM trip_seats
        WHERE trip_id = p_trip_id AND seat_number = v_seat
        FOR UPDATE;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'message', 'Seat ' || v_seat || ' does not exist on this trip.');
        END IF;

        -- Check if already booked
        IF v_current_status = 'booked' THEN
            RETURN jsonb_build_object('success', false, 'message', 'Seat ' || v_seat || ' is already booked by another passenger.');
        END IF;

        -- Check if held by another active session
        IF v_current_status = 'held' AND v_expires_at > NOW() AND (v_held_by IS DISTINCT FROM p_session_id) THEN
            RETURN jsonb_build_object('success', false, 'message', 'Seat ' || v_seat || ' is temporarily held by another customer.');
        END IF;
    END LOOP;

    -- All requested seats are free to hold: Apply lock
    UPDATE trip_seats
    SET status = 'held',
        held_by_session = p_session_id,
        held_by_user_id = p_user_id,
        hold_expires_at = NOW() + (p_hold_minutes || ' minutes')::INTERVAL,
        updated_at = NOW()
    WHERE trip_id = p_trip_id AND seat_number = ANY(p_seat_numbers);

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Seats successfully held.',
        'expires_at', (NOW() + (p_hold_minutes || ' minutes')::INTERVAL)
    );
END;
$$;

-- Stored Procedure: Release Expired Seat Holds
CREATE OR REPLACE FUNCTION release_expired_holds()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_released_count INT;
BEGIN
    UPDATE trip_seats
    SET status = 'available',
        held_by_session = NULL,
        held_by_user_id = NULL,
        hold_expires_at = NULL,
        updated_at = NOW()
    WHERE status = 'held' AND hold_expires_at <= NOW();

    GET DIAGNOSTICS v_released_count = ROW_COUNT;
    RETURN v_released_count;
END;
$$;

-- Stored Procedure: Confirm Booking & Seat Assignment Atomically
CREATE OR REPLACE FUNCTION confirm_booking(
    p_trip_id UUID,
    p_seat_numbers TEXT[],
    p_passenger_name TEXT,
    p_passenger_phone TEXT,
    p_passenger_email TEXT,
    p_passenger_gender TEXT,
    p_booking_channel booking_channel_enum,
    p_counter_id UUID,
    p_booked_by_user_id UUID,
    p_payment_method payment_method_enum,
    p_transaction_ref TEXT,
    p_payable_amount NUMERIC,
    p_service_fee NUMERIC,
    p_discount NUMERIC,
    p_boarding_point TEXT,
    p_dropping_point TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_operator_id UUID;
    v_passenger_id UUID;
    v_booking_id UUID;
    v_booking_ref TEXT;
    v_seat TEXT;
    v_seat_id UUID;
    v_seat_fare NUMERIC;
    v_ticket_id UUID;
    v_ticket_num TEXT;
    v_total_fare NUMERIC := 0;
    v_comm_rate NUMERIC;
    v_comm_amount NUMERIC;
BEGIN
    -- Retrieve operator for this trip
    SELECT operator_id INTO v_operator_id FROM trips WHERE id = p_trip_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid trip ID.');
    END IF;

    SELECT commission_rate INTO v_comm_rate FROM operators WHERE id = v_operator_id;

    -- Check and lock seats
    FOR v_seat IN SELECT UNNEST(p_seat_numbers)
    LOOP
        SELECT id, fare, status
        INTO v_seat_id, v_seat_fare
        FROM trip_seats
        WHERE trip_id = p_trip_id AND seat_number = v_seat
        FOR UPDATE;

        IF NOT FOUND OR status = 'booked' THEN
            RETURN jsonb_build_object('success', false, 'message', 'Seat ' || v_seat || ' is no longer available.');
        END IF;

        v_total_fare := v_total_fare + v_seat_fare;
    END LOOP;

    -- Upsert passenger record
    INSERT INTO passengers (full_name, phone, email, gender, user_id)
    VALUES (p_passenger_name, p_passenger_phone, p_passenger_email, p_passenger_gender, p_booked_by_user_id)
    RETURNING id INTO v_passenger_id;

    -- Generate Unique Booking Reference: e.g. BD-2026-XXXXXX
    v_booking_ref := 'BD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));

    -- Insert Booking
    INSERT INTO bookings (
        booking_reference, trip_id, passenger_id, operator_id, counter_id,
        booked_by_user_id, booking_channel, status, total_amount,
        discount_amount, service_fee, payable_amount, payment_status,
        boarding_point, dropping_point
    ) VALUES (
        v_booking_ref, p_trip_id, v_passenger_id, v_operator_id, p_counter_id,
        p_booked_by_user_id, p_booking_channel, 'confirmed', v_total_fare,
        p_discount, p_service_fee, p_payable_amount, 'successful',
        p_boarding_point, p_dropping_point
    ) RETURNING id INTO v_booking_id;

    -- Record Payment
    INSERT INTO payments (
        booking_id, transaction_reference, payment_method,
        provider_transaction_id, amount, status
    ) VALUES (
        v_booking_id, p_transaction_ref, p_payment_method,
        p_transaction_ref, p_payable_amount, 'successful'
    );

    -- Calculate Platform Commission
    v_comm_amount := (v_total_fare * COALESCE(v_comm_rate, 5.00)) / 100.00;
    INSERT INTO commissions (
        booking_id, operator_id, total_fare, commission_rate, commission_amount
    ) VALUES (
        v_booking_id, v_operator_id, v_total_fare, COALESCE(v_comm_rate, 5.00), v_comm_amount
    );

    -- Assign Seats & Generate Tickets
    FOR v_seat IN SELECT UNNEST(p_seat_numbers)
    LOOP
        SELECT id, fare INTO v_seat_id, v_seat_fare
        FROM trip_seats
        WHERE trip_id = p_trip_id AND seat_number = v_seat;

        -- Update Trip Seat to Booked
        UPDATE trip_seats
        SET status = 'booked',
            booking_id = v_booking_id,
            held_by_session = NULL,
            held_by_user_id = NULL,
            hold_expires_at = NULL,
            updated_at = NOW()
        WHERE id = v_seat_id;

        -- Insert Booking Seat mapping
        INSERT INTO booking_seats (booking_id, trip_seat_id, seat_number, fare)
        VALUES (v_booking_id, v_seat_id, v_seat, v_seat_fare);

        -- Generate Ticket
        v_ticket_num := 'TKT-' || UPPER(SUBSTRING(MD5(v_booking_id::TEXT || v_seat) FROM 1 FOR 8));
        INSERT INTO tickets (
            ticket_number, booking_id, seat_number, qr_code_payload, status
        ) VALUES (
            v_ticket_num, v_booking_id, v_seat,
            'JATRA:' || v_ticket_num || ':' || v_booking_ref || ':' || v_seat,
            'valid'
        );
    END LOOP;

    -- Log Booking Status
    INSERT INTO booking_status_history (booking_id, previous_status, new_status, changed_by, reason)
    VALUES (v_booking_id, 'initiated', 'confirmed', p_booked_by_user_id, 'Booking confirmed via ' || p_booking_channel::TEXT);

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'booking_reference', v_booking_ref,
        'total_amount', v_payable_amount
    );
END;
$$;

-- Stored Procedure: Cancel Booking & Release Seats
CREATE OR REPLACE FUNCTION cancel_booking(
    p_booking_id UUID,
    p_reason TEXT,
    p_cancelled_by UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_booking RECORD;
BEGIN
    SELECT * INTO v_booking FROM bookings WHERE id = p_booking_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Booking not found.');
    END IF;

    IF v_booking.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Booking is already cancelled.');
    END IF;

    -- Release seats on trip_seats
    UPDATE trip_seats
    SET status = 'available',
        booking_id = NULL,
        held_by_session = NULL,
        held_by_user_id = NULL,
        hold_expires_at = NULL,
        updated_at = NOW()
    WHERE booking_id = p_booking_id;

    -- Mark tickets as cancelled
    UPDATE tickets SET status = 'cancelled' WHERE booking_id = p_booking_id;

    -- Update booking status
    UPDATE bookings
    SET status = 'cancelled', updated_at = NOW()
    WHERE id = p_booking_id;

    -- Record status history
    INSERT INTO booking_status_history (booking_id, previous_status, new_status, changed_by, reason)
    VALUES (p_booking_id, v_booking.status, 'cancelled', p_cancelled_by, p_reason);

    RETURN jsonb_build_object('success', true, 'message', 'Booking successfully cancelled.');
END;
$$;

-- ========================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_closings ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS checks
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

-- Public can read operators, buses, trips, and trip_seats
DROP POLICY IF EXISTS "Public read operators" ON operators;
CREATE POLICY "Public read operators" ON operators FOR SELECT USING (status = 'active' OR is_super_admin());

DROP POLICY IF EXISTS "Public read counters" ON counters;
CREATE POLICY "Public read counters" ON counters FOR SELECT USING (is_active = true OR is_super_admin());

DROP POLICY IF EXISTS "Public read buses" ON buses;
CREATE POLICY "Public read buses" ON buses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read seat_layouts" ON seat_layouts;
CREATE POLICY "Public read seat_layouts" ON seat_layouts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read bus_categories" ON bus_categories;
CREATE POLICY "Public read bus_categories" ON bus_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read trips" ON trips;
CREATE POLICY "Public read trips" ON trips FOR SELECT USING (status != 'cancelled' OR is_super_admin());

DROP POLICY IF EXISTS "Public read trip_seats" ON trip_seats;
CREATE POLICY "Public read trip_seats" ON trip_seats FOR SELECT USING (true);

-- Bookings access control
DROP POLICY IF EXISTS "Passenger views own bookings" ON bookings;
CREATE POLICY "Passenger views own bookings" ON bookings
    FOR SELECT USING (booked_by_user_id = auth.uid() OR is_super_admin());

DROP POLICY IF EXISTS "Operator staff views own operator bookings" ON bookings;
CREATE POLICY "Operator staff views own operator bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM operator_staff
            WHERE operator_staff.operator_id = bookings.operator_id
            AND operator_staff.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Counter staff views own counter bookings" ON bookings;
CREATE POLICY "Counter staff views own counter bookings" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM counter_staff
            WHERE counter_staff.counter_id = bookings.counter_id
            AND counter_staff.user_id = auth.uid()
        )
    );

