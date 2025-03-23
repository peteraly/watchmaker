#!/bin/bash

echo "Setting up Korean Skincare Advisor Project..."

# Create placeholder images for skin types
mkdir -p img/icons/skin-types
mkdir -p img/icons/concerns
mkdir -p img/icons/philosophy
mkdir -p img/products

# Download open-source icons for skin types
curl -o img/icons/skin-types/dry.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/wind.svg"
curl -o img/icons/skin-types/oily.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/droplet.svg"
curl -o img/icons/skin-types/combination.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/divide-circle.svg"
curl -o img/icons/skin-types/normal.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/circle.svg"
curl -o img/icons/skin-types/sensitive.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/alert-circle.svg"

# Download icons for concerns
curl -o img/icons/concerns/acne.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/alert-octagon.svg"
curl -o img/icons/concerns/aging.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/clock.svg"
curl -o img/icons/concerns/dullness.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/sun.svg"
curl -o img/icons/concerns/pigmentation.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/target.svg"
curl -o img/icons/concerns/dryness.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/cloud-drizzle.svg"
curl -o img/icons/concerns/texture.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/grid.svg"
curl -o img/icons/concerns/redness.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/thermometer.svg"
curl -o img/icons/concerns/pores.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/maximize.svg"
curl -o img/icons/concerns/none.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/check-circle.svg"

# Download icons for philosophy
curl -o img/icons/philosophy/hydration.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/droplet.svg"
curl -o img/icons/philosophy/prevention.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/shield.svg"
curl -o img/icons/philosophy/layering.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/layers.svg"

# Download a placeholder product image
curl -o img/products/product-placeholder.svg "https://raw.githubusercontent.com/feathericons/feather/master/icons/package.svg"

# Create symlinks for all products to use the placeholder initially
for i in {1..25}; do
  ln -sf product-placeholder.svg img/products/product-$i.jpg
done

# Create necessary links for specific products from the database
ln -sf product-placeholder.svg img/products/face-shop-cleansing-oil.jpg
ln -sf product-placeholder.svg img/products/banila-co-clean-it-zero.jpg
ln -sf product-placeholder.svg img/products/innisfree-blueberry-cleansing.jpg
ln -sf product-placeholder.svg img/products/cosrx-enzyme-powder.jpg
ln -sf product-placeholder.svg img/products/laneige-hydrating-cleanser.jpg
ln -sf product-placeholder.svg img/products/innisfree-green-tea-mask.jpg
ln -sf product-placeholder.svg img/products/cosrx-aha-bha-toner.jpg
ln -sf product-placeholder.svg img/products/cosrx-propolis-toner.jpg
ln -sf product-placeholder.svg img/products/cosrx-galactomyces-essence.jpg
ln -sf product-placeholder.svg img/products/cosrx-snail-essence.jpg
ln -sf product-placeholder.svg img/products/glow-recipe-dew-drops.jpg
ln -sf product-placeholder.svg img/products/peach-lily-glass-skin.jpg
ln -sf product-placeholder.svg img/products/iunik-tea-tree-serum.jpg
ln -sf product-placeholder.svg img/products/cosrx-acne-patches.jpg
ln -sf product-placeholder.svg img/products/mediheal-hyaluronic-mask.jpg
ln -sf product-placeholder.svg img/products/dr-jart-cicapair-mask.jpg
ln -sf product-placeholder.svg img/products/laneige-eye-sleeping-mask.jpg
ln -sf product-placeholder.svg img/products/sulwhasoo-ginseng-eye-cream.jpg
ln -sf product-placeholder.svg img/products/tatcha-water-cream.jpg
ln -sf product-placeholder.svg img/products/laneige-water-sleeping-mask.jpg
ln -sf product-placeholder.svg img/products/mizon-snail-cream.jpg
ln -sf product-placeholder.svg img/products/innisfree-daily-sunscreen.jpg
ln -sf product-placeholder.svg img/products/beauty-of-joseon-sunscreen.jpg

echo "Image resources successfully downloaded."

# Create a simple local server script
cat > serve.sh << 'EOL'
#!/bin/bash
echo "Starting local server on http://localhost:8000"
echo "Press Ctrl+C to stop the server"
python3 -m http.server 8000
EOL

chmod +x serve.sh

echo "Setup complete! You can now start your local server with './serve.sh'"
