// config.js - Configuración y datos estáticos
window.Avika = window.Avika || {};

// Objeto para almacenar las configuraciones de los diferentes menús
window.Avika.menuData = {
    'avika': {
        // Opciones de personalización predeterminadas
        customizationOptions: {
            'sin-alga': 'Sin Alga',
            'extra-picante': 'Extra Picante',
            'cambio-proteina': 'Cambiar Proteína'
        },

        // Datos de platillos - Estructura original para mantener compatibilidad
        dishes: {
            // ENTRADAS COCINA FRÍA
            'entrada-fria': [
                'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón en salsa de mango', 'Maguro Peruano',
                'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
                'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano',
                'Sashimi de Robalo', 'Sashimi de Atún', 'Sashimi Mixto', 'Sashimi de Salmón'
            ],
            
            // PLATILLOS COCINA FRÍA (ROLLOS)
            'frio': [
                'Kanikama Roll', 'Curry Roll', 'Philadelphia Roll', 'Spicy Roll', 'Aguacate Roll',
                'Avi Roll', 'Mango Roll', 'Mikuso Roll', 'Acevichado Roll', 'Dragon Roll', 'Avika Roll',
                'Red Fire Roll', 'Ebi Crunch Roll', 'Teriyaki Crunch Roll', 'Ika Ebi Roll', 'Furai Roll', 'Coco Roll',
                'TNT Roll', 'Tuna Roll', 'Rocotto Roll', 'Parrillero Roll', 'Rib Eye Roll',
                'California', 'Onigiri', 'Capricho', 'Mar y Tierra', 'Tres quesos'
            ],
            
            // ENTRADAS COCINA CALIENTE
            'entrada-caliente': [
                'Kushiage', 'Rollitos Kani', 'Toritos Tempura', 'Taquitos Crujientes',
                'Tacos Nikkei', 'Tacos de Costra de Queso', 'Brocheta Yakitori', 'Ika Ebi Togarashi'
            ],
            
            // PLATILLOS COCINA CALIENTE
            'caliente': [
                'Miso Shiro', 'Sopa Udon', 'Sopa Ramen de Cerdo', 'Sopa Mariscos Thai',
                'Arroz Yakimeshi', 'Arroz Peruano', 'Arroz Wok', 'Arroz Thai con Mariscos',
                'Teriyaki', 'Yakisoba', 'Nuggets', 'Pechuga Teriyaki', 'Lomo Saltado', 'Rib Eye Grill',
                'Camarón Nutty', 'Camarón Iwa', 'Pasta de Mar', 'Ebi Chips', 'Pulpo Marine',
                'Pollo al Wok', 'Camarón al Wok', 'Atún al Wok', 'Salmón al Wok',
                'Tuna Thai', 'Atún salsa Rocotto', 'Filete Thai Asia', 'Filete Ninjago',
                'Filete Zakana Thai', 'Salmón Kion', 'Sake New Style', 'Pargo al Ika Ebi'
            ],
            
            // COMBOS
            'combos': [
                'Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima',
                // Nuevos combos regulares (sólo con botón "Listo")
                'Combo Kids', 'Combo Thai', 'Combo Nikkei', 'Combo Wok'
            ]
        },

        // Lista de combos especiales (doble cocina)
        specialCombos: ['Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'],

        // Nombres de categorías principales
        categoryNames: {
            'entrada-fria': 'Entradas Cocina Fría',
            'frio': 'Platillos Cocina Fría (Rollos)',
            'entrada-caliente': 'Entradas Cocina Caliente',
            'caliente': 'Platillos Cocina Caliente',
            'combos': 'Combos'
        },
        
        // NUEVO: Información de subcategorías para mostrar en la interfaz
        subCategories: {
            // Subcategorías para entradas frías
            'entrada-fria': [
                {
                    name: 'Entradas Frías',
                    items: ['Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón en salsa de mango', 'Maguro Peruano']
                },
                {
                    name: 'Tostaditas',
                    items: ['Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy']
                },
                {
                    name: 'Ceviches',
                    items: ['Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano']
                },
                {
                    name: 'Sashimis',
                    items: ['Sashimi de Robalo', 'Sashimi de Atún', 'Sashimi Mixto', 'Sashimi de Salmón']
                }
            ],
            
            // Subcategorías para platillos fríos (rollos)
            'frio': [
                {
                    name: 'Rollos Naturales',
                    items: ['Kanikama Roll', 'Curry Roll', 'Philadelphia Roll', 'Spicy Roll', 'Aguacate Roll',
                            'Avi Roll', 'Mango Roll', 'Mikuso Roll', 'Acevichado Roll', 'Dragon Roll', 'Avika Roll',
                            'California', 'Onigiri', 'Capricho']
                },
                {
                    name: 'Rollos Empanizados',
                    items: ['Red Fire Roll', 'Ebi Crunch Roll', 'Teriyaki Crunch Roll', 'Ika Ebi Roll', 'Furai Roll', 'Coco Roll',
                            'Mar y Tierra', 'Tres quesos']
                },
                {
                    name: 'Rollos Horneados',
                    items: ['TNT Roll', 'Tuna Roll', 'Rocotto Roll', 'Parrillero Roll', 'Rib Eye Roll']
                }
            ],
            
            // Entradas calientes no tiene subcategorías
            'entrada-caliente': [],
            
            // Subcategorías para platillos calientes
            'caliente': [
                {
                    name: 'Sopas',
                    items: ['Miso Shiro', 'Sopa Udon', 'Sopa Ramen de Cerdo', 'Sopa Mariscos Thai']
                },
                {
                    name: 'Arroz y Pasta',
                    items: ['Arroz Yakimeshi', 'Arroz Peruano', 'Arroz Wok', 'Arroz Thai con Mariscos',
                            'Teriyaki', 'Yakisoba']
                },
                {
                    name: 'Carne y Pollo',
                    items: ['Nuggets', 'Pechuga Teriyaki', 'Lomo Saltado', 'Rib Eye Grill']
                },
                {
                    name: 'Mariscos',
                    items: ['Camarón Nutty', 'Camarón Iwa', 'Pasta de Mar', 'Ebi Chips', 'Pulpo Marine']
                },
                {
                    name: 'Al Wok',
                    items: ['Pollo al Wok', 'Camarón al Wok', 'Atún al Wok', 'Salmón al Wok']
                },
                {
                    name: 'Pescados',
                    items: ['Tuna Thai', 'Atún salsa Rocotto', 'Filete Thai Asia', 'Filete Ninjago',
                            'Filete Zakana Thai', 'Salmón Kion', 'Sake New Style', 'Pargo al Ika Ebi']
                }
            ],
            
            // Combos no tiene subcategorías
            'combos': []
        },
        
        serviceNames: {
            'comedor': 'Comedor',
            'domicilio': 'Domicilio',
            'para-llevar': 'Ordena y Espera'
        },
        
        // Intervalo de actualización de temporizadores (en milisegundos)
        timerInterval: 1000,
        
        // Intervalo de auto-guardado (en milisegundos)
        autoSaveInterval: 30000
    },
    'ishinoka': {
        customizationOptions: {},
        dishes: {
            'arroz': ['Gohan', 'Midori', 'Wok', 'Thai', 'Yakimeshi'],
            'donburi': ['Poket de Atún', 'Poket de Salmón', 'Teka Don', 'Unagui Don'],
            'ensaladas': ['Ensalada Dry Miso', 'Chuka Sarada', 'Sunomono Especial', 'Tuna Salad'],
            'entremeses-calientes': ['Harumaki Unagui', 'Tempura Mix', 'Tempura de Camarón', 'Soft Shell Crab', 'Gyozas', 'Karikari', 'Edamames Spicy', 'Edamames', 'Dumpling de Camarón'],
            'entremeses-frios': ['Tuna Tataki', 'Tako Kiri', 'Salmón Tataki', 'Hamachi Serranito', 'White Fish Dry Miso', 'Gyu Tataki', 'Sommer', 'Hotate Kiri', 'Ostiones'],
            'makis': ['Ishinoka', 'California', 'Tempura', 'Kiury', 'Ebi', 'Tanuki', 'Spicy Hamachi', 'Spicy Tuna', 'Shrimp', 'Shake', 'Blue Fin', 'Fumi', 'Spider', 'Crab', 'Doble Tuna', 'Kawa Shake', 'Hamachi Maki', 'Kani'],
            'nigiri': ['Camarón', 'Anguila', 'Hamachi', 'Robalo', 'Salmón', 'Akami', 'Pulpo', 'Ikura', 'Masago', 'Tamago', 'Selección del chef (Nigiri Dinner)'],
            'pesca-del-dia': ['Callo de Hacha', 'Ika', 'Toro', 'Chutoro', 'Shimesaba', 'Uni (Erizo)', 'Amaebi', 'Kampachi', 'Lobina'],
            'platos-fuertes': ['Camarón Midori', 'Camarón Roca', 'Camarón Macha', 'Posta Dry Miso', 'Black Cod en Salsa Miso', 'Yakisoba Ebi', 'Yakisoba Rib Eye', 'Sakana Karague', 'Esparrayaki', 'Tonkatsu (pollo o cerdo)', 'Oishi Shake', 'Akami Tataki'],
            'postres': ['Helado de Temporada', 'Crème Brûlée de Frutos Rojos', 'Manjar de Chocolate y Miso', 'Suspiro de Matcha', 'Panna Cotta de Maracuyá', 'Kamelado', 'Carlota Yuzu', 'Pastel de Nube', 'Red Velvet'],
            'sashimis': ['Atún', 'Salmón', 'Hamachi', 'Selección del Chef (Sashimi)'],
            'sopas': ['Miso Shiru', 'Miso Ramen', 'Tonkotsu Ramen', 'Spicy Ramen'],
            'teppanyaki': ['Rib Eye', 'Filete de Res', 'Camarón', 'Salmón', 'Mixto', 'Pollo']
        },
        specialCombos: [],
        categoryNames: {
            'arroz': 'Arroz',
            'donburi': 'Donburi',
            'ensaladas': 'Ensaladas',
            'entremeses-calientes': 'Entremeses calientes',
            'entremeses-frios': 'Entremeses fríos',
            'makis': 'Makis',
            'nigiri': 'Nigiri',
            'pesca-del-dia': 'Pesca del día',
            'platos-fuertes': 'Plato Fuerte',
            'postres': 'Postres',
            'sashimis': 'Sashimis',
            'sopas': 'Sopas',
            'teppanyaki': 'Teppanyaki'
        },
        subCategories: {
            'arroz': [], 'donburi': [], 'ensaladas': [], 'entremeses-calientes': [], 'entremeses-frios': [], 'makis': [], 'nigiri': [], 'pesca-del-dia': [], 'platos-fuertes': [], 'postres': [], 'sashimis': [], 'sopas': [], 'teppanyaki': []
        },
        serviceNames: {
            'comedor': 'Comedor',
            'domicilio': 'Domicilio',
            'para-llevar': 'Ordena y Espera'
        },
        timerInterval: 1000,
        autoSaveInterval: 30000
    }
};

// Configuración global de la aplicación
Avika.config = {
    // Clave del menú activo. Se podrá cambiar desde la UI.
    activeMenuKey: 'avika',

    // Función para obtener los datos del menú activo
    getActiveMenu: function() {
        // Primero, intentar cargar desde localStorage
        const savedMenuKey = localStorage.getItem('activeMenuKey');
        const keyToUse = savedMenuKey || this.activeMenuKey;
        return window.Avika.menuData[keyToUse];
    },

    // Función para establecer y guardar el menú activo
    setActiveMenu: function(menuKey) {
        if (window.Avika.menuData[menuKey]) {
            this.activeMenuKey = menuKey;
            localStorage.setItem('activeMenuKey', menuKey);
            console.log(`Menú activo cambiado a: ${menuKey}`);
            // Recargar la página para aplicar los cambios en toda la UI
            window.location.reload();
        } else {
            console.error(`Error: El menú con la clave "${menuKey}" no existe.`);
        }
    }
};