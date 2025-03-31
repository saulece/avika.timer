// config.js - Configuración y datos estáticos
window.Avika = window.Avika || {};

Avika.config = {
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
            'TNT Roll', 'Tuna Roll', 'Rocotto Roll', 'Parrillero Roll', 'Rib Eye Roll'
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
            'Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'
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
                        'Avi Roll', 'Mango Roll', 'Mikuso Roll', 'Acevichado Roll', 'Dragon Roll', 'Avika Roll']
            },
            {
                name: 'Rollos Empanizados',
                items: ['Red Fire Roll', 'Ebi Crunch Roll', 'Teriyaki Crunch Roll', 'Ika Ebi Roll', 'Furai Roll', 'Coco Roll']
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
};