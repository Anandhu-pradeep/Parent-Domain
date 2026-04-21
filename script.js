document.addEventListener('DOMContentLoaded', () => {
    const nodesData = [
        {
            id: 'portfolio',
            title: 'Portfolio',
            icon: 'fas fa-briefcase',
            desc: 'View my full project showcase, technical skills, and detailed professional experience.',
            link: 'https://portfolio.anandhupradeep.com/',
            color: '#00F0B5',
            image: 'portfolio.png'
        },
        {
            id: 'certificates',
            title: 'Certificates',
            icon: 'fas fa-certificate',
            desc: 'A verified collection of my academic achievements, technical courses, and hackathon participations.',
            link: 'https://certificate.anandhupradeep.com/',
            color: '#FF5E7E',
            image: 'certificate.png'
        },
        {
            id: 'github',
            title: 'GitHub',
            icon: 'fab fa-github',
            desc: 'Explore my source code, open-source contributions, and experimental developer repositories.',
            link: 'https://github.com/Anandhu-pradeep',
            color: '#ffffff',
            image: 'githubimg.jfif'
        },
        {
            id: 'linkedin',
            title: 'LinkedIn',
            icon: 'fab fa-linkedin-in',
            desc: 'Connect with me professionally, view my career path, and stay updated with my industry insights.',
            link: 'https://www.linkedin.com/in/anandhu-pradeep1/',
            color: '#0077b5',
            image: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=800&q=80'
        },
        {
            id: 'contact',
            title: 'Contact',
            icon: 'fas fa-envelope',
            desc: 'Ready to collaborate or hire? Get in touch via email, phone, or LinkedIn.',
            link: 'mailto:anandhupradeep177@gmail.com',
            color: '#00F0B5',
            image: 'mail.png'
        }
    ];

    const mindMap = document.getElementById('mind-map');
    const satelliteContainer = document.getElementById('satellite-nodes');
    const centerNode = document.getElementById('center-node');
    const canvas = document.getElementById('connections-canvas');
    const ctx = canvas.getContext('2d');
    const popupOverlay = document.getElementById('popup-overlay');
    const popupCard = document.getElementById('popup-card');
    const closePopup = document.getElementById('close-popup');

    let nodes = [];
    let animationId;
    let isExpanded = false;
    let expansionProgress = 0;

    // Initialize Canvas
    function resizeCanvas() {
        if (window.innerWidth <= 768) {
            canvas.style.display = 'none';
            return;
        }
        canvas.style.display = 'block';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Audio logic removed

    // Node placement logic (Circle/Ellipse around center)
    function initializeNodes() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const radiusX = Math.min(width * 0.35, 450);
        const radiusY = Math.min(height * 0.3, 300);

        satelliteContainer.innerHTML = '';
        nodes = [];

        nodesData.forEach((data, index) => {
            const angle = (index / nodesData.length) * Math.PI * 2;
            const x = Math.cos(angle) * radiusX;
            const y = Math.sin(angle) * radiusY;

            const nodeEl = document.createElement('div');
            nodeEl.className = 'node satellite-node';
            nodeEl.id = `node-${data.id}`;
            nodeEl.innerHTML = `
                <i class="${data.icon}"></i>
                <span>${data.title}</span>
            `;

            // Initialize at center, we will update left/top dynamically
            nodeEl.style.left = `calc(50% - 80px)`;
            nodeEl.style.top = `calc(50% - 80px)`;

            satelliteContainer.appendChild(nodeEl);
            
            // Apply Tilt
            VanillaTilt.init(nodeEl, {
                max: 15,
                speed: 400,
                glare: true,
                "max-glare": 0.3,
            });

            const nodeObj = {
                id: data.id,
                el: nodeEl,
                x: x,
                y: y,
                angle: angle,
                baseAngle: angle,
                levitateOffset: Math.random() * Math.PI * 2,
                color: data.color
            };

            nodeEl.addEventListener('click', () => {
                showPopup(data);
            });
            nodes.push(nodeObj);
        });
    }

    // Center Node Click Event (Expand Map)
    centerNode.addEventListener('click', () => {
        if (!isExpanded) {
            isExpanded = true;
            centerNode.classList.add('shrunk');
            
            nodes.forEach((node, index) => {
                // Stagger the fade-in of satellite nodes
                setTimeout(() => {
                    node.el.classList.add('visible');
                }, index * 100); // 100ms delay per node
            });
        } else {
            // Toggle back to initial state
            isExpanded = false;
            centerNode.classList.remove('shrunk');
            
            // Stagger the fade-out (reverse order)
            nodes.slice().reverse().forEach((node, index) => {
                setTimeout(() => {
                    node.el.classList.remove('visible');
                }, index * 50);
            });
        }
    });

    // Animation Loop for Floating and Connections
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Interpolate expansion progress smoothly
        const targetProgress = isExpanded ? 1 : 0;
        expansionProgress += (targetProgress - expansionProgress) * 0.08;

        if (expansionProgress > 0.01) { // Only calculate/draw if active
            const time = Date.now() * 0.001;
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            nodes.forEach(node => {
                // Floating movement
                const levitateY = Math.sin(time + node.levitateOffset) * 15;
                const levitateX = Math.cos(time * 0.8 + node.levitateOffset) * 10;
                
                // Multiply target offset by expansion progress
                const currentX = centerX + (node.x * expansionProgress) + levitateX;
                const currentY = centerY + (node.y * expansionProgress) + levitateY;

                // Update DOM element position using left/top to avoid interfering with Vanilla Tilt's transform
                node.el.style.left = `calc(50% - 80px + ${(node.x * expansionProgress) + levitateX}px)`;
                node.el.style.top = `calc(50% - 80px + ${(node.y * expansionProgress) + levitateY}px)`;

                // Draw Connection line (only if expanded enough)
                drawConnection(centerX, centerY, currentX, currentY, node.color, time, expansionProgress);
            });
        }

        animationId = requestAnimationFrame(animate);
    }

    function drawConnection(x1, y1, x2, y2, color, time, opacityMult = 1) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        
        // Curved line
        const midX = (x1 + x2) / 2;
        ctx.quadraticCurveTo(midX, y1, x2, y2);

        
        const globalAlpha = Math.min(1, opacityMult * 1.5); // Fade in faster than movement
        
        ctx.globalAlpha = globalAlpha;

        // Styling
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, 'rgba(0, 240, 181, 0.2)');
        gradient.addColorStop(1, color + '66'); // 66 for transparency

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        
        // Dash effect for "pulse"
        ctx.setLineDash([20, 100]);
        ctx.lineDashOffset = -time * 50;
        
        ctx.stroke();
        
        // Static faint line
        ctx.beginPath();
        ctx.setLineDash([]);
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(midX, y1, x2, y2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.stroke();
        
        ctx.globalAlpha = 1.0; // Reset
    }

    // Popup logic
    function showPopup(data) {
        const title = document.getElementById('popup-title');
        const desc = document.getElementById('popup-desc');
        const icon = document.getElementById('popup-icon');
        const preview = document.getElementById('popup-preview');
        const visitBtn = document.getElementById('visit-btn');

        title.innerText = data.title;
        desc.innerText = data.desc;
        icon.className = data.icon;
        preview.src = data.image;
        visitBtn.href = data.link;

        const btnText = visitBtn.querySelector('span');
        const btnIcon = visitBtn.querySelector('i');

        if (data.isDownload) {
            btnText.innerText = "Download Now";
            btnIcon.className = "fas fa-download";
            visitBtn.setAttribute('download', '');
        } else {
            btnText.innerText = "Visit";
            btnIcon.className = "fas fa-external-link-alt";
            visitBtn.removeAttribute('download');
        }
        
        // Update button color theme
        visitBtn.style.background = data.color;
        if (data.color === '#ffffff') {
            visitBtn.style.color = '#000';
        } else {
            visitBtn.style.color = '#fff';
        }

        popupOverlay.classList.add('active');
    }

    closePopup.addEventListener('click', () => {
        popupOverlay.classList.remove('active');
    });

    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            popupOverlay.classList.remove('active');
        }
    });

    // Nav Bar Download Card logic (Opens Identity Card)
    const navDownloadBtn = document.getElementById('nav-download-btn');
    const identityOverlay = document.getElementById('identity-popup-overlay');
    const closeIdentity = document.getElementById('close-identity-popup');

    if (navDownloadBtn && identityOverlay) {
        navDownloadBtn.addEventListener('click', () => {
            identityOverlay.classList.add('active');
        });

        if (closeIdentity) {
            closeIdentity.addEventListener('click', () => {
                identityOverlay.classList.remove('active');
            });
        }

        identityOverlay.addEventListener('click', (e) => {
            if (e.target === identityOverlay) {
                identityOverlay.classList.remove('active');
            }
        });

        // Download Card Logic using html2canvas
        const downloadCardBtn = document.getElementById('identity-download-btn');
        const bCardElement = document.getElementById('identity-card');

        if (downloadCardBtn && bCardElement) {
            downloadCardBtn.addEventListener('click', () => {
                const closeBtn = document.getElementById('close-identity-popup');
                const footer = document.querySelector('.b-card-footer');
                const btnText = downloadCardBtn.querySelector('span');
                const originalText = btnText.innerText;
                
                // Processing UI
                btnText.innerText = "Generating...";
                closeBtn.style.display = 'none';
                footer.style.opacity = '0'; // hide elements from capture but keep height

                // Briefly format card for image capture (remove interactive transforms)
                const oldTransform = bCardElement.style.transform;
                bCardElement.style.transform = 'scale(1)';

                // Delay execution slightly so the UI can paint "Generating..." text smoothly before JS freezes
                setTimeout(() => {
                    html2canvas(bCardElement, {
                        backgroundColor: '#0a0a15', // Provide a solid background otherwise it captures transparent since the overlay provides the dark bg
                        scale: 2,
                        useCORS: true
                    }).then(canvas => {
                        // Restore UI
                        closeBtn.style.display = 'block';
                        footer.style.opacity = '1';
                        btnText.innerText = originalText;
                        bCardElement.style.transform = oldTransform;
                        
                        // Direct Download
                        const link = document.createElement('a');
                        link.download = 'Anandhu_Pradeep_Card.png';
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                    }).catch(err => {
                        console.error("Error capturing card:", err);
                        closeBtn.style.display = 'block';
                        footer.style.opacity = '1';
                        btnText.innerText = "Error!";
                        setTimeout(() => { btnText.innerText = originalText; }, 2000);
                    });
                }, 100);
            });
        }
    }

    // Parallax logic (Mouse move)
    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 768) return;

        const mouseX = (e.clientX - window.innerWidth / 2) * 0.01;
        const mouseY = (e.clientY - window.innerHeight / 2) * 0.01;

        mindMap.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && popupOverlay.classList.contains('active')) {
            popupOverlay.classList.remove('active');
        }
    });

    // Start
    initializeNodes();
    animate();

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            initializeNodes();
            resizeCanvas();
        }, 250);
    });
});
