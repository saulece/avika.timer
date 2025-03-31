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
        'frio': [
            'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón', 'Maguro Peruano',
            'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
            'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano',
            'Sashimi de Robalo', 'Sashimi de Atún', 'Sashimi Mixto', 'Sashimi de Salmón',
            'Kanikama Roll', 'Curry Roll', 'Philadelphia Roll', 'Spicy Roll', 'Aguacate Roll'
        ],
        'entrada-fria': [
            'Baby Squid', 'Tiradito de Atún Togarashi', 'Tiradito de Camarón', 'Maguro Peruano',
            'Tostadita Nikkei', 'Tostada de ceviche verde', 'Tostadita Tataki', 'Tostadita Crunchy',
            'Cocktail Avika', 'Ceviche Limeño', 'Ceviche Peruano'
        ],
        'caliente': [
            'Arroz Yakimeshi', 'Arroz Peruano', 'Arroz Wok', 'Arroz Thai con Mariscos',
            'Teriyaki', 'Yakisoba', 'Nuggets', 'Pechuga Teriyaki', 'Lomo Saltado', 'Rib Eye Grill'
        ],
        'entrada-caliente': [
            'Kushiage', 'Rollitos Kani', 'Toritos Tempura', 'Taquitos Crujientes', 
            'Miso Shiro', 'Sopa Udon', 'Sopa Ramen de Cerdo', 'Sopa Mariscos Thai'
        ],
        'combos': [
            'Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'
        ]
    },

    // Lista de combos especiales (doble cocina)
    specialCombos: ['Combo Tokio', 'Combo Osaka', 'Combo Bagua', 'Combo Pisco', 'Combo Lima'],

    categoryNames: {
        'frio': 'Platillos Fríos',
        'entrada-fria': 'Entradas Frías',
        'caliente': 'Platillos Calientes',
        'entrada-caliente': 'Entradas Calientes',
        'combos': 'Combos'
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