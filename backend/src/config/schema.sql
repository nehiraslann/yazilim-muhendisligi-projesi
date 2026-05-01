CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    full_name VARCHAR(150),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS colors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    hex_code VARCHAR(10),
    season_group VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS seasons (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_tr TEXT,
    name_en TEXT,
    description TEXT,
    description_tr TEXT,
    description_en TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    color_id INTEGER REFERENCES colors(id) ON DELETE SET NULL,
    brand VARCHAR(100),
    image_url VARCHAR(500),
    season_group VARCHAR(50),
    style_tag VARCHAR(50),
    seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_seasons (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    season_id INTEGER REFERENCES seasons(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, season_id)
);

CREATE TABLE IF NOT EXISTS outfits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    name_tr TEXT,
    name_en TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    source_type VARCHAR(50) CHECK (source_type IN ('manual', 'ai')),
    reason_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS outfit_products (
    outfit_id INTEGER REFERENCES outfits(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (outfit_id, product_id)
);
