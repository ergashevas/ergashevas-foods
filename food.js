/* =========================================
   ERGASHEVAS FOODS - MAIN SCRIPT
========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // --- Sticky Header Effect ---
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navbar = document.getElementById('navbar');
    
    hamburgerBtn.addEventListener('click', () => {
        navbar.classList.toggle('active');
        hamburgerBtn.querySelector('i').classList.toggle('fa-bars');
        hamburgerBtn.querySelector('i').classList.toggle('fa-xmark');
    });

    // Close mobile menu when clicking nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('active');
            hamburgerBtn.querySelector('i').classList.add('fa-bars');
            hamburgerBtn.querySelector('i').classList.remove('fa-xmark');
        });
    });

    // --- Automatic Food Carousel ---
    const track = document.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextButton = document.getElementById('nextSlide');
    const prevButton = document.getElementById('prevSlide');
    const dotsNav = document.getElementById('carouselNav');
    const dots = Array.from(dotsNav.children);

    let slideWidth = slides[0].getBoundingClientRect().width;

    // Arrange slides side-by-side
    const setSlidePosition = (slide, index) => {
        slide.style.left = slideWidth * index + 'px';
    };
    slides.forEach(setSlidePosition);

    const moveToSlide = (track, currentSlide, targetSlide) => {
        track.style.transform = 'translateX(-' + targetSlide.style.left + ')';
        currentSlide.classList.remove('current-slide');
        targetSlide.classList.add('current-slide');
    };

    const updateDots = (currentDot, targetDot) => {
        currentDot.classList.remove('current-slide');
        targetDot.classList.add('current-slide');
    };

    let currentIndex = 0;
    
    const goToNextSlide = () => {
        currentIndex = (currentIndex + 1) % slides.length;
        const currentSlide = track.querySelector('.current-slide');
        const targetSlide = slides[currentIndex];
        const currentDot = dotsNav.querySelector('.current-slide');
        const targetDot = dots[currentIndex];

        moveToSlide(track, currentSlide, targetSlide);
        updateDots(currentDot, targetDot);
    };

    // Next button click
    nextButton.addEventListener('click', () => {
        goToNextSlide();
        resetTimer();
    });

    // Previous button click
    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        const currentSlide = track.querySelector('.current-slide');
        const targetSlide = slides[currentIndex];
        const currentDot = dotsNav.querySelector('.current-slide');
        const targetDot = dots[currentIndex];

        moveToSlide(track, currentSlide, targetSlide);
        updateDots(currentDot, targetDot);
        resetTimer();
    });

    // Dot indicators click
    dotsNav.addEventListener('click', e => {
        const targetDot = e.target.closest('button');
        if (!targetDot) return;

        const currentSlide = track.querySelector('.current-slide');
        const currentDot = dotsNav.querySelector('.current-slide');
        const targetIndex = dots.findIndex(dot => dot === targetDot);
        const targetSlide = slides[targetIndex];

        currentIndex = targetIndex;
        moveToSlide(track, currentSlide, targetSlide);
        updateDots(currentDot, targetDot);
        resetTimer();
    });

    // Auto slide timer (every 4.5 seconds)
    let slideTimer = setInterval(goToNextSlide, 4500);

    function resetTimer() {
        clearInterval(slideTimer);
        slideTimer = setInterval(goToNextSlide, 4500);
    }

    // --- Category Filtering System ---
    const categoryCards = document.querySelectorAll('.cat-card');
    const allFoodCards = document.querySelectorAll('.menu-section .food-card');

    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active from all
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const selectedCategory = card.getAttribute('data-category');

            allFoodCards.forEach(foodCard => {
                const foodCategory = foodCard.getAttribute('data-category');
                if (selectedCategory === 'all' || foodCategory === selectedCategory) {
                    foodCard.style.display = 'flex';
                } else {
                    foodCard.style.display = 'none';
                }
            });
        });
    });

    // --- Search Functionality ---
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    const performSearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        
        // Scroll to menu section
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });

        allFoodCards.forEach(foodCard => {
            const title = foodCard.querySelector('h3').textContent.toLowerCase();
            const desc = foodCard.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(query) || desc.includes(query)) {
                foodCard.style.display = 'flex';
            } else {
                foodCard.style.display = 'none';
            }
        });
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // --- Shopping Cart Functionality & LocalStorage ---
    let cart = JSON.parse(localStorage.getItem('ergashevas_cart')) || [];

    const cartToggleBtn = document.getElementById('cartToggleBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartBody = document.getElementById('cartBody');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Open/Close Cart Drawer
    const toggleCart = () => {
        cartDrawer.classList.toggle('active');
        cartOverlay.classList.toggle('active');
        renderCart();
    };

    cartToggleBtn.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    
    // Also bind start shopping button in empty cart
    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'startShoppingBtn') {
            toggleCart();
        }
    });

    // Save Cart to LocalStorage
    const saveCart = () => {
        localStorage.setItem('ergashevas_cart', JSON.stringify(cart));
        updateCartBadge();
    };

    // Update Cart Badge Count
    const updateCartBadge = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
    };

    // Add item to cart (delegated event listener for all Add to Cart buttons)
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn, .add-to-cart-carousel');
        if (!btn) return;

        const name = btn.getAttribute('data-name');
        const price = parseInt(btn.getAttribute('data-price'));
        const img = btn.getAttribute('data-img');

        // Check if item already exists in cart
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                name,
                price,
                img,
                quantity: 1
            });
        }

        saveCart();
        
        // Visual feedback on button
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
        btn.style.backgroundColor = '#28a745';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.backgroundColor = '';
        }, 1200);

        // Open cart drawer automatically for luxury UX feedback
        if (!cartDrawer.classList.contains('active')) {
            toggleCart();
        } else {
            renderCart();
        }
    });

    // Render Cart Items
    const renderCart = () => {
        if (cart.length === 0) {
            cartBody.innerHTML = `
                <div class="empty-cart" id="emptyCartMsg">
                    <i class="fa-solid fa-cart-shopping"></i>
                    <p>Your cart is currently empty.</p>
                    <button class="btn btn-primary" id="startShoppingBtn" onclick="document.getElementById('cartDrawer').classList.remove('active'); document.getElementById('cartOverlay').classList.remove('active'); document.getElementById('menu').scrollIntoView({behavior: 'smooth'});">Start Shopping</button>
                </div>
            `;
            cartTotalPrice.textContent = '0 UZS';
            return;
        }

        let html = '';
        let totalSum = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            totalSum += itemTotal;

            html += `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <span class="cart-item-price">${item.price.toLocaleString()} UZS</span>
                        <div class="quantity-controls">
                            <button onclick="window.decreaseQuantity(${index})"><i class="fa-solid fa-minus"></i></button>
                            <span>${item.quantity}</span>
                            <button onclick="window.increaseQuantity(${index})"><i class="fa-solid fa-plus"></i></button>
                        </div>
                    </div>
                    <button class="remove-item-btn" onclick="window.removeFromCart(${index})" aria-label="Remove item"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
        });

        cartBody.innerHTML = html;
        cartTotalPrice.textContent = totalSum.toLocaleString() + ' UZS';
    };

    // Global cart quantity / remove functions for inline onclick binding
    window.increaseQuantity = (index) => {
        cart[index].quantity += 1;
        saveCart();
        renderCart();
    };

    window.decreaseQuantity = (index) => {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        saveCart();
        renderCart();
    };

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        saveCart();
        renderCart();
    };

    // Checkout Button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        alert('Thank you for ordering with ERGASHEVAS FOODS! Your order has been successfully placed and is being prepared in Andijan.');
        cart = [];
        saveCart();
        toggleCart();
    });

    // Initialize cart badge on page load
    updateCartBadge();

    // --- Contact Form Validation ---
    const contactForm = document.getElementById('contactForm');
    const formSuccessMsg = document.getElementById('formSuccessMsg');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const message = document.getElementById('contactMessage').value.trim();

        if (name && phone && message) {
            formSuccessMsg.classList.remove('hidden');
            contactForm.reset();
            setTimeout(() => {
                formSuccessMsg.classList.add('hidden');
            }, 5000);
        }
    });

    // --- Newsletter Form Submission ---
    const newsletterForm = document.getElementById('newsletterForm');
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Thank you for subscribing to ERGASHEVAS FOODS newsletter! Exclusive vouchers are on their way.');
        newsletterForm.reset();
    });
});