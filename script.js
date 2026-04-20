/* ============================================
   $PIVOT — MAIN SCRIPT
   Solana Destruction → Portal → Ethereum
   ============================================ */

// ============ CONFIG ============
const MEME_COINS = [
    { img: 'bonk.png', name: '$BONK', color: '#f7931a' },
    { img: 'wif.png', name: '$WIF', color: '#e8a838' },
    { img: 'pepe.png', name: '$PEPE', color: '#3d9b3d' },
    { img: 'boden.png', name: '$BODEN', color: '#1e90ff' },
    { img: 'mew.png', name: '$MEW', color: '#ff69b4' },
    { img: 'mew-mew-logo.svg', name: '$MEW', color: '#2196f3' },
    { img: 'samo.png', name: '$SAMO', color: '#14f195' },
    { img: 'foxy1712909906899.png', name: '$FOXY', color: '#ff8c00' },
    { img: '11165.png', name: '$WEN', color: '#9945ff' },
    { img: '28382.png', name: '$MYRO', color: '#ff6347' },
];

const TIMELINE = {
    COINS_ALIVE: 5000,       // Meme coins bounce for 5 seconds
    METEOR_DURATION: 4000,   // Meteors fall for 4 seconds
    DARKNESS_START: 5000,    // Darkness begins at 5s
    BG_TRANSITION: 5500,     // Background swap starts at 5.5s
    PORTAL_APPEAR: 12000,    // Portal appears at 12s (after meteors)
};

// ============ STATE ============
let coins = [];
let animationFrame;
let meteorInterval;
let isDestroying = false;

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
    createMemeCoins();
    startBouncingAnimation();
    startTimeline();
});

// ============ MEME COINS ============
function createMemeCoins() {
    const container = document.getElementById('meme-coins-container');
    
    MEME_COINS.forEach((coin, i) => {
        const el = document.createElement('div');
        el.className = 'meme-coin';
        el.innerHTML = `
            <div class="meme-coin-inner">
                <img src="${coin.img}" alt="${coin.name}">
            </div>
            <div class="meme-coin-label">${coin.name}</div>
        `;

        // Random starting position
        const x = Math.random() * (window.innerWidth - 100);
        const y = Math.random() * (window.innerHeight - 100);
        el.style.left = x + 'px';
        el.style.top = y + 'px';

        container.appendChild(el);

        coins.push({
            el: el,
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: 80,
            alive: true,
        });
    });
}

function startBouncingAnimation() {
    function animate() {
        const w = window.innerWidth;
        const h = window.innerHeight;

        coins.forEach(coin => {
            if (!coin.alive) return;

            coin.x += coin.vx;
            coin.y += coin.vy;

            // Bounce off walls
            if (coin.x <= 0 || coin.x >= w - coin.size) {
                coin.vx *= -1;
                coin.x = Math.max(0, Math.min(coin.x, w - coin.size));
            }
            if (coin.y <= 0 || coin.y >= h - coin.size) {
                coin.vy *= -1;
                coin.y = Math.max(0, Math.min(coin.y, h - coin.size));
            }

            // If in meteor phase, add gravity
            if (isDestroying) {
                coin.vy += 0.1;
                coin.vx *= 0.999;
            }

            coin.el.style.left = coin.x + 'px';
            coin.el.style.top = coin.y + 'px';
        });

        animationFrame = requestAnimationFrame(animate);
    }
    animate();
}

// ============ TIMELINE ============
function startTimeline() {
    // Phase 1: Coins bounce happily (0-5s)
    // Already running

    // Phase 2: Meteors start, darkness begins (5s)
    setTimeout(() => {
        isDestroying = true;
        startMeteorShower();
        startDarkness();
        
        // Hide title
        document.getElementById('solana-title').classList.add('hidden');
    }, TIMELINE.COINS_ALIVE);

    // Phase 3: Background transition (5.5s)
    setTimeout(() => {
        transitionBackground();
    }, TIMELINE.BG_TRANSITION);

    // Phase 4: Portal appears (12s)
    setTimeout(() => {
        stopMeteorShower();
        showPortal();
    }, TIMELINE.PORTAL_APPEAR);
}

// ============ METEORS ============
function startMeteorShower() {
    let meteorCount = 0;

    meteorInterval = setInterval(() => {
        createMeteor();
        meteorCount++;

        // Intensify over time
        if (meteorCount > 5) {
            createMeteor();
        }
        if (meteorCount > 10) {
            createMeteor();
            createMeteor();
        }
    }, 300);
}

function createMeteor() {
    const container = document.getElementById('meteors-container');
    const meteor = document.createElement('div');
    meteor.className = 'meteor';

    // Spawn across screen — mostly right, but some on the left too
    const startX = Math.random() < 0.3
        ? Math.random() * (window.innerWidth * 0.4)                          // 30% left side
        : window.innerWidth * 0.5 + Math.random() * (window.innerWidth * 0.6); // 70% right side
    const startY = -100;

    // Randomly pick one of the 3 meteor images
    const meteorImages = ['meteor.png', 'meteor1.png', 'meteor2.png'];
    const chosenImage = meteorImages[Math.floor(Math.random() * meteorImages.length)];

    const img = document.createElement('img');
    img.src = chosenImage;
    img.className = 'meteor-img';

    meteor.appendChild(img);
    meteor.style.left = startX + 'px';
    meteor.style.top = startY + 'px';

    container.appendChild(meteor);

    // Animate meteor
    requestAnimationFrame(() => {
        meteor.classList.add('falling');
    });

    // Create impact
    const duration = 1000 + Math.random() * 1000;
    setTimeout(() => {
        createImpact(startX - 200, window.innerHeight * (0.4 + Math.random() * 0.5));
        
        // Shake screen
        const page = document.getElementById('page-solana');
        page.classList.add('shaking');
        setTimeout(() => page.classList.remove('shaking'), 500);

        // Flash
        const flash = document.getElementById('screen-flash');
        flash.classList.add('flash');
        setTimeout(() => flash.classList.remove('flash'), 300);

        // Kill nearby coins
        killNearbyCoins(startX - 200, window.innerHeight * 0.7);
    }, duration);

    // Remove meteor after animation
    setTimeout(() => {
        meteor.remove();
    }, 2500);
}

function createImpact(x, y) {
    const container = document.getElementById('meteors-container');
    
    // Use explosion GIF
    const explosionImages = ['explosion1.gif', 'explosion2.gif'];
    const chosenExplosion = explosionImages[Math.floor(Math.random() * explosionImages.length)];
    
    const img = document.createElement('img');
    img.src = chosenExplosion;
    img.className = 'explosion-gif';
    img.style.left = (x - 75) + 'px';
    img.style.top = (y - 75) + 'px';
    container.appendChild(img);

    setTimeout(() => img.remove(), 1200);
}

function killNearbyCoins(x, y) {
    coins.forEach(coin => {
        if (!coin.alive) return;
        const dx = coin.x - x;
        const dy = coin.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {
            coin.alive = false;
            coin.el.style.transition = 'all 0.5s ease';
            coin.el.style.transform = `scale(0) rotate(${Math.random() * 360}deg)`;
            coin.el.style.opacity = '0';
            setTimeout(() => coin.el.remove(), 600);
        } else if (dist < 400) {
            // Push away
            const force = (400 - dist) / 400 * 15;
            coin.vx += (dx / dist) * force;
            coin.vy += (dy / dist) * force;
        }
    });
}

function stopMeteorShower() {
    clearInterval(meteorInterval);
}

// ============ DARKNESS ============
function startDarkness() {
    const overlay = document.getElementById('darkness-overlay');
    overlay.classList.add('active');
}

function transitionBackground() {
    const bgSolana = document.getElementById('bg-solana');
    const bgDestruction = document.getElementById('bg-destruction');
    
    bgSolana.style.opacity = '0';
    bgDestruction.style.opacity = '1';
}

// ============ PORTAL ============
function showPortal() {
    // Kill remaining coins
    coins.forEach(coin => {
        if (coin.alive) {
            coin.alive = false;
            coin.el.style.transition = 'all 1s ease';
            coin.el.style.opacity = '0';
            coin.el.style.transform = 'scale(0)';
        }
    });

    const portal = document.getElementById('portal-container');
    
    // Small delay for dramatic effect
    setTimeout(() => {
        portal.classList.remove('hidden');
    }, 500);
}

// ============ PAGE TRANSITION ============
function goToEthereum() {
    // Create transition flash
    const flash = document.createElement('div');
    flash.className = 'transition-flash';
    document.body.appendChild(flash);

    requestAnimationFrame(() => {
        flash.classList.add('active');
    });

    // Switch pages
    setTimeout(() => {
        document.getElementById('page-solana').classList.remove('active');
        document.getElementById('page-ethereum').classList.add('active');
        
        // Clean up
        cancelAnimationFrame(animationFrame);
    }, 600);

    // Remove flash
    setTimeout(() => {
        flash.remove();
    }, 2000);
}

// ============ UTILITY ============
function copyCA() {
    const addr = document.getElementById('contract-addr').textContent;
    navigator.clipboard.writeText(addr).then(() => {
        const btn = document.querySelector('.eth-copy-btn');
        const copySvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#14f195" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(() => btn.innerHTML = copySvg, 1500);
    });
}

// Particles in background (subtle)
function createParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particles';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    document.getElementById('page-solana').appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 30; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speedY: -Math.random() * 0.5 - 0.2,
            opacity: Math.random() * 0.5 + 0.2,
        });
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();

            p.y += p.speedY;
            if (p.y < 0) {
                p.y = canvas.height;
                p.x = Math.random() * canvas.width;
            }
        });
        requestAnimationFrame(drawParticles);
    }
    drawParticles();

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Init particles
createParticles();
