// Función para el menú hamburguesa
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
            
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Actualizar atributos ARIA
            hamburger.setAttribute('aria-expanded', !isExpanded);
            navMenu.setAttribute('aria-hidden', isExpanded);
            
            // Enfocar el primer enlace cuando se abre el menú
            if (!isExpanded) {
                const firstLink = navMenu.querySelector('a');
                if (firstLink) {
                    setTimeout(() => firstLink.focus(), 100);
                }
            }
        });

        // Cerrar menú al hacer click en un enlace
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
            });
        });

        // Cerrar menú con Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-hidden', 'true');
                hamburger.focus();
            }
        });
    }
});

// Función para el scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Función para cambiar el navbar al hacer scroll
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.backgroundColor = '#ffffff';
        header.style.backdropFilter = 'none';
    }
});

// Función para manejar los botones de seleccionar plan
document.addEventListener('DOMContentLoaded', function() {
    const planButtons = document.querySelectorAll('.paquete-card .btn');
    
    planButtons.forEach(button => {
        button.addEventListener('click', function() {
            const paqueteCard = this.closest('.paquete-card');
            const planName = paqueteCard.querySelector('h3').textContent;
            const planPrice = paqueteCard.querySelector('.precio').textContent;
            
            // Actualizar el select del formulario
            const selectElement = document.getElementById('paquete');
            const planValue = planName.toLowerCase().replace(/\s+/g, '-').replace(/\+/g, '');
            
            // Buscar la opción correspondiente
            for (let option of selectElement.options) {
                if (option.value.includes(planValue.split('-')[0])) {
                    option.selected = true;
                    break;
                }
            }
            
            // Scroll al formulario
            document.getElementById('reservar').scrollIntoView({
                behavior: 'smooth'
            });
            
            // Mostrar confirmación
            showNotification(`Has seleccionado el plan: ${planName}`, 'success');
        });
    });
});

// Función para validar el formulario
document.getElementById('reservaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // Validaciones básicas
    if (!validateForm(data)) {
        return;
    }
    
    // Enviar correo electrónico
    sendEmail(data);
    
    // Mostrar confirmación
    showNotification('Formulario enviado exitosamente. Nos pondremos en contacto contigo pronto.', 'success');
    
    // Limpiar formulario
    this.reset();
});

// Función para validar el formulario
function validateForm(data) {
    const requiredFields = ['nombre', 'edad', 'telefono', 'direccion', 'paquete', 'fecha'];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/;
    
    // Verificar campos requeridos
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showNotification(`El campo ${getFieldName(field)} es obligatorio.`, 'error');
            document.getElementById(field).focus();
            return false;
        }
    }
    
    // Validar email si se proporciona
    if (data.email && !emailRegex.test(data.email)) {
        showNotification('Por favor, ingresa un email válido.', 'error');
        document.getElementById('email').focus();
        return false;
    }
    
    // Validar teléfono
    if (!phoneRegex.test(data.telefono)) {
        showNotification('Por favor, ingresa un número de teléfono válido.', 'error');
        document.getElementById('telefono').focus();
        return false;
    }
    
    // Validar edad
    const edad = parseInt(data.edad);
    if (edad < 0 || edad > 120) {
        showNotification('Por favor, ingresa una edad válida.', 'error');
        document.getElementById('edad').focus();
        return false;
    }
    
    // Validar fecha
    const fechaSeleccionada = new Date(data.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < hoy) {
        showNotification('La fecha de inicio no puede ser anterior a hoy.', 'error');
        document.getElementById('fecha').focus();
        return false;
    }
    
    // Verificar términos y condiciones
    if (!data.terminos) {
        showNotification('Debes aceptar los términos y condiciones.', 'error');
        document.getElementById('terminos').focus();
        return false;
    }
    
    return true;
}

// Función auxiliar para obtener nombres de campos
function getFieldName(field) {
    const fieldNames = {
        'nombre': 'Nombre',
        'edad': 'Edad',
        'telefono': 'Teléfono',
        'direccion': 'Dirección',
        'paquete': 'Paquete de servicio',
        'fecha': 'Fecha de inicio'
    };
    return fieldNames[field] || field;
}

// Función para enviar correo electrónico
function sendEmail(data) {
    const emailDestino = 'sc.cubides6@gmail.com';
    const asunto = `Nueva solicitud de servicio médico - ${data.nombre}`;
    
    // Formatear los datos del formulario
    const cuerpoCorreo = `
NUEVA SOLICITUD DE SERVICIO MÉDICO

Información del Paciente:
- Nombre: ${data.nombre}
- Edad: ${data.edad} años
- Teléfono: ${data.telefono}
- Email: ${data.email || 'No proporcionado'}
- Dirección: ${data.direccion}

Detalles del Servicio:
- Paquete seleccionado: ${data.paquete}
- Fecha de inicio: ${data.fecha}

Condiciones médicas y necesidades especiales:
${data.condiciones || 'No especificadas'}

---
Este mensaje fue enviado desde el formulario de contacto de FiarSalud.
Fecha de envío: ${new Date().toLocaleString('es-ES')}
    `.trim();
    
    // Crear enlace mailto
    const mailtoLink = `mailto:${emailDestino}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpoCorreo)}`;
    
    // Abrir cliente de correo
    window.location.href = mailtoLink;
}

// Función para abrir WhatsApp
function openWhatsApp(message = '') {
    const phoneNumber = '573506629687'; // Cambia este número por el tuyo (formato: código país + número sin +)
    const defaultMessage = message || '¡Hola! Me interesa conocer más sobre sus servicios médicos domiciliarios.';
    const encodedMessage = encodeURIComponent(defaultMessage);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Eliminar notificación existente si la hay
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Agregar estilos
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        min-width: 300px;
        max-width: 500px;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Manejar cierre
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
        if (document.body.contains(notification)) {
            closeNotification(notification);
        }
    }, 5000);
}

// Función para cerrar notificación
function closeNotification(notification) {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.remove();
        }
    }, 300);
}

// Función para animar elementos al hacer scroll
function animateOnScroll() {
    const elements = document.querySelectorAll('.servicio-card, .paquete-card, .doctor-card, .contacto-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Función para manejar los enlaces de contacto
document.addEventListener('DOMContentLoaded', function() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    phoneLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // En dispositivos móviles, esto abrirá la aplicación de teléfono
            // En desktop, podríamos mostrar el número o copiarlo al portapapeles
            if (!navigator.userAgent.match(/Mobi|Android/i)) {
                e.preventDefault();
                const phoneNumber = this.getAttribute('href').replace('tel:', '');
                copyToClipboard(phoneNumber);
                showNotification(`Número copiado al portapapeles: ${phoneNumber}`, 'success');
            }
        });
    });
    
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const email = this.getAttribute('href').replace('mailto:', '');
            showNotification(`Abriendo cliente de email para: ${email}`, 'info');
        });
    });
    
    // Manejar botones de WhatsApp
    const whatsappButtons = document.querySelectorAll('.whatsapp-btn, .btn-whatsapp');
    whatsappButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const customMessage = this.getAttribute('data-message');
            openWhatsApp(customMessage);
        });
    });
});

// Función para copiar al portapapeles
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
    }
}

// Función para establecer la fecha mínima en el formulario
document.addEventListener('DOMContentLoaded', function() {
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date();
    const fechaMinima = hoy.toISOString().split('T')[0];
    fechaInput.setAttribute('min', fechaMinima);
});

// Función para manejar el resize de la ventana
window.addEventListener('resize', function() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    if (window.innerWidth > 768) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

// Inicializar animaciones al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    animateOnScroll();
    
    // Agregar efecto de hover a las cards
    const cards = document.querySelectorAll('.servicio-card, .paquete-card, .doctor-card, .contacto-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Función para lazy loading de iconos (opcional)
function loadIcons() {
    const icons = document.querySelectorAll('i[class*="fa-"]');
    icons.forEach(icon => {
        icon.style.transition = 'all 0.3s ease';
    });
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadIcons);

// Función para manejar errores de JavaScript
window.addEventListener('error', function(e) {
    console.error('Error en la página:', e.error);
    // En producción, aquí podrías enviar el error a un servicio de logging
});

// Función para mejorar la accesibilidad
document.addEventListener('DOMContentLoaded', function() {
    // Agregar atributos ARIA donde sea necesario
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.setAttribute('aria-label', 'Abrir menú de navegación');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-controls', 'nav-menu');
        
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.setAttribute('id', 'nav-menu');
            navMenu.setAttribute('aria-hidden', 'true');
        }
    }
    
    // Agregar etiquetas alt a iconos importantes
    const importantIcons = document.querySelectorAll('.card-icon i, .contacto-icon i');
    importantIcons.forEach(icon => {
        if (!icon.getAttribute('alt')) {
            icon.setAttribute('role', 'img');
            icon.setAttribute('aria-hidden', 'true');
        }
    });

    // Mejorar accesibilidad de formularios
    const form = document.getElementById('reservaForm');
    if (form) {
        // Agregar live region para anuncios
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'form-announcements';
        form.appendChild(liveRegion);
    }

    // Mejorar navegación por teclado
    document.addEventListener('keydown', function(e) {
        // Skip links para navegación por teclado
        if (e.key === 'Tab' && e.target === document.body) {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.textContent = 'Saltar al contenido principal';
            skipLink.className = 'skip-link sr-only';
            skipLink.style.cssText = `
                position: absolute;
                top: 10px;
                left: 10px;
                background: var(--primary-color);
                color: white;
                padding: 8px 12px;
                text-decoration: none;
                z-index: 9999;
                border-radius: 4px;
            `;
            document.body.insertBefore(skipLink, document.body.firstChild);
            
            skipLink.addEventListener('focus', function() {
                this.classList.remove('sr-only');
            });
            
            skipLink.addEventListener('blur', function() {
                this.classList.add('sr-only');
            });
        }
    });
});

// Optimización de performance - Lazy loading para elementos no críticos
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const src = element.getAttribute('data-lazy');
                    if (src) {
                        element.src = src;
                        element.removeAttribute('data-lazy');
                    }
                    observer.unobserve(element);
                }
            });
        });

        lazyElements.forEach(element => imageObserver.observe(element));
    }
}

// SEO y Analytics (placeholder para Google Analytics)
function initAnalytics() {
    // Placeholder para Google Analytics o similar
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            page_title: document.title,
            page_location: window.location.href
        });
    }
}

// Inicializar funciones de optimización
document.addEventListener('DOMContentLoaded', function() {
    initLazyLoading();
    initAnalytics();
    
    // Preload crítico
    const criticalResources = [
        'styles.css',
        'script.js'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'script';
        document.head.appendChild(link);
    });
});
