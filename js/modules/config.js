// config.js - Configuración y datos estáticos
window.Avika = window.Avika || {};

Avika.config = {
    // Opciones de personalización predeterminadas
    customizationOptions: {
        'sin-alga': 'Sin Alga',
        'extra-picante': 'Extra Picante',
        'cambio-proteina': 'Cambiar Proteína'
    },

    // Datos de platillos
    dishes: {
        'entrada-fria': [
            'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón en salsa de mango', 'Maguro Peruano',
            'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
            'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano',
            'Sashimi de Robalo', 'Sashimi de Atún', 'Sashimi Mixto', 'Sashimi de Salmón'
        ],
        'rollos-naturales': [
            'Kanikama Roll', 'Curry Roll', 'Philadelphia Roll', 'Spicy Roll', 'Aguacate Roll',
            'Avi Roll', 'Mango Roll', 'Mikuso Roll', 'Acevichado Roll', 'Dragon Roll', 'Avika Roll'
        ],
        'rollos-empanizados': [
            'Red Fire Roll', 'Ebi Crunch Roll', 'Teriyaki Crunch Roll', 'Ika Ebi Roll', 'Furai Roll', 'Coco Roll'
        ],
        'rollos-horneados': [
            'TNT Roll', 'Tuna Roll', 'Rocotto Roll', 'Parrillero Roll', 'Rib Eye Roll'
        ],
        'entrada-caliente': [
            'Kushiage', 'Rollitos Kani', 'Toritos Tempura', 'Taquitos Crujientes', 
            'Tacos Nikkei', 'Tacos de Costra de Queso', 'Brocheta Yakitori', 'Ika Ebi Togarashi'
        ],
        'sopas': [
            'Miso Shiro', 'Sopa Udon', 'Sopa Ramen de Cerdo', 'Sopa Mariscos Thai'
        ],
        'arroz-pasta': [
            'Arroz Yakimeshi', 'Arroz Peruano', 'Arroz Wok', 'Arroz Thai con Mariscos',
            'Teriyaki', 'Yakisoba'
        ],
        'carne-pollo': [
            'Nuggets', 'Pechuga Teriyaki', 'Lomo Saltado', 'Rib Eye Grill'
        ],
        'mariscos': [
            'Camarón Nutty', 'Camarón Iwa', 'Pasta de Mar', 'Ebi Chips', 'Pulpo Marine'
        ],
        'wok': [
            'Pollo al Wok', 'Camarón al Wok', 'Atún al Wok', 'Salmón al Wok'
        ],
        'pescados': [
            'Tuna Thai', 'Atún salsa Rocotto', 'Filete Thai Asia', 'Filete Ninjago',
            'Filete Zakana Thai', 'Salmón Kion', 'Sake New Style', 'Pargo al Ika Ebi'
        ],
        'combos': [
            'Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'
        ]
    },

    // Lista de combos especiales (doble cocina)
    specialCombos: ['Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'],

    // Mantener la estructura original de categoryNames pero con las nuevas categorías
    categoryNames: {
        'entrada-fria': 'Entradas Cocina Fría',
        'rollos-naturales': 'Rollos Naturales',
        'rollos-empanizados': 'Rollos Empanizados',
        'rollos-horneados': 'Rollos Horneados',
        'entrada-caliente': 'Entradas Cocina Caliente',
        'sopas': 'Sopas',
        'arroz-pasta': 'Arroz y Pasta',
        'carne-pollo': 'Carne y Pollo',
        'mariscos': 'Mariscos',
        'wok': 'Al Wok',
        'pescados': 'Pescados',
        'combos': 'Combos'
    },
    
    // Agrupación de categorías para el menú
    categoryGroups: {
        'frio': ['entrada-fria', 'rollos-naturales', 'rollos-empanizados', 'rollos-horneados'],
        'caliente': ['entrada-caliente', 'sopas', 'arroz-pasta', 'carne-pollo', 'mariscos', 'wok', 'pescados'],
        'combos': ['combos']
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