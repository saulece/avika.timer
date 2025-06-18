// menu-config.js
// Contiene la configuración de menús para todos los restaurantes disponibles.

window.AppMenus = {
    avika: {
        restaurantName: 'Avika',
        customizationOptions: {
            'sin-alga': 'Sin Alga',
            'extra-picante': 'Extra Picante',
            'cambio-proteina': 'Cambiar Proteína'
        },
        dishes: {
            'entrada-fria': [
                'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón en salsa de mango', 'Maguro Peruano',
                'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
                'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano',
                'Sashimi de Robalo', 'Sashimi de Atún', 'Sashimi Mixto', 'Sashimi de Salmón'
            ],
            'frio': [
                'Kanikama Roll', 'Curry Roll', 'Philadelphia Roll', 'Spicy Roll', 'Aguacate Roll',
                'Avi Roll', 'Mango Roll', 'Mikuso Roll', 'Acevichado Roll', 'Dragon Roll', 'Avika Roll',
                'Red Fire Roll', 'Ebi Crunch Roll', 'Teriyaki Crunch Roll', 'Ika Ebi Roll', 'Furai Roll', 'Coco Roll',
                'TNT Roll', 'Tuna Roll', 'Rocotto Roll', 'Parrillero Roll', 'Rib Eye Roll',
                'California', 'Onigiri', 'Capricho', 'Mar y Tierra', 'Tres quesos'
            ],
            'entrada-caliente': [
                'Kushiage', 'Rollitos Kani', 'Toritos Tempura', 'Taquitos Crujientes',
                'Tacos Nikkei', 'Tacos de Costra de Queso', 'Brocheta Yakitori', 'Ika Ebi Togarashi'
            ],
            'caliente': [
                'Miso Shiro', 'Sopa Udon', 'Sopa Ramen de Cerdo', 'Sopa Mariscos Thai',
                'Arroz Yakimeshi', 'Arroz Peruano', 'Arroz Wok', 'Arroz Thai con Mariscos',
                'Teriyaki', 'Yakisoba', 'Nuggets', 'Pechuga Teriyaki', 'Lomo Saltado', 'Rib Eye Grill',
                'Camarón Nutty', 'Camarón Iwa', 'Pasta de Mar', 'Ebi Chips', 'Pulpo Marine',
                'Pollo al Wok', 'Camarón al Wok', 'Atún al Wok', 'Salmón al Wok',
                'Tuna Thai', 'Atún salsa Rocotto', 'Filete Thai Asia', 'Filete Ninjago',
                'Filete Zakana Thai', 'Salmón Kion', 'Sake New Style', 'Pargo al Ika Ebi'
            ],
            'combos': [
                'Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima',
                'Combo Kids', 'Combo Thai', 'Combo Nikkei', 'Combo Wok'
            ]
        },
        specialCombos: ['Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'],
        categoryNames: {
            'entrada-fria': 'Entradas Cocina Fría',
            'frio': 'Platillos Cocina Fría (Rollos)',
            'entrada-caliente': 'Entradas Cocina Caliente',
            'caliente': 'Platillos Cocina Caliente',
            'combos': 'Combos'
        },
        subCategories: {
            'entrada-fria': [
                { name: 'Entradas Frías', items: ['Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón en salsa de mango', 'Maguro Peruano'] },
                { name: 'Tostaditas', items: ['Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy'] },
                { name: 'Ceviches', items: ['Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano'] },
                { name: 'Sashimis', items: ['Sashimi de Robalo', 'Sashimi de Atún', 'Sashimi Mixto', 'Sashimi de Salmón'] }
            ],
            'frio': [
                { name: 'Rollos Naturales', items: ['Kanikama Roll', 'Curry Roll', 'Philadelphia Roll', 'Spicy Roll', 'Aguacate Roll', 'Avi Roll', 'Mango Roll', 'Mikuso Roll', 'Acevichado Roll', 'Dragon Roll', 'Avika Roll', 'California', 'Onigiri', 'Capricho'] },
                { name: 'Rollos Empanizados', items: ['Red Fire Roll', 'Ebi Crunch Roll', 'Teriyaki Crunch Roll', 'Ika Ebi Roll', 'Furai Roll', 'Coco Roll', 'Mar y Tierra', 'Tres quesos'] },
                { name: 'Rollos Horneados', items: ['TNT Roll', 'Tuna Roll', 'Rocotto Roll', 'Parrillero Roll', 'Rib Eye Roll'] }
            ],
            'entrada-caliente': [],
            'caliente': [
                { name: 'Sopas', items: ['Miso Shiro', 'Sopa Udon', 'Sopa Ramen de Cerdo', 'Sopa Mariscos Thai'] },
                { name: 'Arroz y Pasta', items: ['Arroz Yakimeshi', 'Arroz Peruano', 'Arroz Wok', 'Arroz Thai con Mariscos', 'Teriyaki', 'Yakisoba'] },
                { name: 'Carne y Pollo', items: ['Nuggets', 'Pechuga Teriyaki', 'Lomo Saltado', 'Rib Eye Grill'] },
                { name: 'Mariscos', items: ['Camarón Nutty', 'Camarón Iwa', 'Pasta de Mar', 'Ebi Chips', 'Pulpo Marine'] },
                { name: 'Al Wok', items: ['Pollo al Wok', 'Camarón al Wok', 'Atún al Wok', 'Salmón al Wok'] },
                { name: 'Pescados', items: ['Tuna Thai', 'Atún salsa Rocotto', 'Filete Thai Asia', 'Filete Ninjago', 'Filete Zakana Thai', 'Salmón Kion', 'Sake New Style', 'Pargo al Ika Ebi'] }
            ],
            'combos': []
        },
        serviceNames: {
            'comedor': 'Comedor',
            'domicilio': 'Domicilio',
            'para-llevar': 'Ordena y Espera'
        },
        timerInterval: 1000,
        autoSaveInterval: 30000
    },
    ishinoka: {
        restaurantName: 'Ishinoka',
        customizationOptions: {
            'sin-cebollin': 'Sin Cebollín',
            'extra-wasabi': 'Extra Wasabi',
            'ponzu-aparte': 'Ponzu Aparte',
            'sin-picante': 'Sin Picante'
        },
        dishes: {
            'arroz': ['Gohan', 'Midori', 'Wok', 'Thai', 'Yakimeshi'],
            'donburi': ['Poket de Atún', 'Poket de Salmón', 'Teka Don', 'Unagui Don'],
            'ensaladas': ['Ensalada Dry Miso', 'Chuka Sarada', 'Sunomono Especial', 'Tuna Salad'],
            'entremeses-calientes': ['Harumaki Unagui', 'Tempura Mix', 'Tempura de Camarón', 'Soft Shell Crab', 'Gyozas', 'Karikari', 'Edamames Spicy', 'Edamames', 'Dumpling de Camarón'],
            'entremeses-frios': ['Tuna Tataki', 'Tako Kiri', 'Salmón Tataki', 'Hamachi Serranito', 'White Fish Dry Miso', 'Gyu Tataki', 'Sommer', 'Hotate Kiri', 'Ostiones'],
            'makis': ['Ishinoka', 'California', 'Tempura', 'Kiury', 'Ebi', 'Tanuki', 'Spicy Hamachi', 'Spicy Tuna', 'Shrimp', 'Shake', 'Blue Fin', 'Fumi', 'Spider', 'Crab', 'Doble Tuna', 'Kawa Shake', 'Hamachi Maki', 'Kani'],
            'nigiri': ['Camarón', 'Anguila', 'Hamachi', 'Robalo', 'Salmón', 'Akami', 'Pulpo', 'Ikura', 'Masago', 'Tamago', 'Selección del chef (Nigiri Dinner)'],
            'pesca-del-dia': ['Callo de Hacha', 'Ika', 'Toro', 'Chutoro', 'Shimesaba', 'Uni (Erizo)', 'Amaebi', 'Kampachi', 'Lobina'],
            'plato-fuerte': ['Camarón Midori', 'Camarón Roca', 'Camarón Macha', 'Posta Dry Miso', 'Black Cod en Salsa Miso', 'Yakisoba Ebi', 'Yakisoba Rib Eye', 'Sakana Karague', 'Esparrayaki', 'Tonkatsu (pollo o cerdo)', 'Oishi Shake', 'Akami Tataki'],
            'teppanyaki': ['Rib Eye', 'Filete de Res', 'Camarón', 'Salmón', 'Mixto', 'Pollo'],
            'sopas': ['Miso Shiru', 'Miso Ramen', 'Tonkotsu Ramen', 'Spicy Ramen'],
            'postres': ['Helado de Temporada', 'Crème Brûlée de Frutos Rojos', 'Manjar de Chocolate y Miso', 'Suspiro de Matcha', 'Panna Cotta de Maracuyá', 'Kamelado', 'Carlota Yuzu', 'Pastel de Nube', 'Red Velvet']
        },
        categoryNames: {
            'arroz': '🍚 Arroz',
            'donburi': '🥣 Donburi',
            'ensaladas': '🥗 Ensaladas',
            'entremeses-calientes': '🔥 Entremeses Calientes',
            'entremeses-frios': '❄️ Entremeses Fríos',
            'makis': '🍣 Makis',
            'nigiri': '🍥 Nigiri',
            'pesca-del-dia': '🐟 Pesca del Día',
            'plato-fuerte': '🍱 Plato Fuerte',
            'teppanyaki': '🔥 Teppanyaki',
            'sopas': '🍜 Sopas',
            'postres': '🍰 Postres'
        },
        subCategories: {},
        specialCombos: [],
        serviceNames: {
            'comedor': 'Comedor',
            'domicilio': 'Domicilio',
            'para-llevar': 'Para Llevar'
        },
        timerInterval: 1000,
        autoSaveInterval: 30000
    }
};
