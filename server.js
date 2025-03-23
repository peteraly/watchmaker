const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Product routes
app.get('/api/products', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf8');
        const products = JSON.parse(data);
        res.json(products);
    } catch (error) {
        console.error('Error reading products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf8');
        const products = JSON.parse(data);
        
        const newProduct = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        products.products.push(newProduct);
        
        await fs.writeFile(
            path.join(__dirname, 'data', 'products.json'),
            JSON.stringify(products, null, 2)
        );
        
        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf8');
        const products = JSON.parse(data);
        
        const index = products.products.findIndex(p => p.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        products.products[index] = {
            ...products.products[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await fs.writeFile(
            path.join(__dirname, 'data', 'products.json'),
            JSON.stringify(products, null, 2)
        );
        
        res.json(products.products[index]);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'data', 'products.json'), 'utf8');
        const products = JSON.parse(data);
        
        const index = products.products.findIndex(p => p.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        products.products.splice(index, 1);
        
        await fs.writeFile(
            path.join(__dirname, 'data', 'products.json'),
            JSON.stringify(products, null, 2)
        );
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 