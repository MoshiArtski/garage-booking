-- Profiles table for storing user roles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    role TEXT NOT NULL DEFAULT 'customer', -- 'garage' or 'customer'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories for services
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- Items (services) under categories
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id),
    garage_id UUID REFERENCES profiles(id),  -- Garage offering the service
    name TEXT NOT NULL,
    duration INT NOT NULL,                    -- Duration in minutes
    price NUMERIC(10, 2) NOT NULL
);

-- Staff members for a garage
CREATE TABLE staff (
    id SERIAL PRIMARY KEY,
    garage_id UUID REFERENCES profiles(id),   -- Garage owning the staff
    name TEXT NOT NULL
);

-- Staff availability with broken time slots
CREATE TABLE staff_availability (
    id SERIAL PRIMARY KEY,
    staff_id INT REFERENCES staff(id),
    day_of_week INT NOT NULL,                 -- 0 = Sunday, 1 = Monday, etc.
    available_start TIME NOT NULL,
    available_end TIME NOT NULL
);

-- Bookings for services
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),   -- Customer who booked
    item_id INT REFERENCES items(id),         -- Service being booked
    staff_id INT REFERENCES staff(id),        -- Staff assigned to the booking
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    duration INT NOT NULL,                    -- Based on item duration
    status TEXT DEFAULT 'confirmed'
);
