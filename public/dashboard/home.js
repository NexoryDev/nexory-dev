/* -- React Preloader -- */
const { useEffect, useRef, useState } = React;

function Preloader() {
    const ref = useRef(null);
    const progressRef = useRef(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        function advance(value) {
            if (value > progressRef.current) {
                progressRef.current = value;
                setProgress(value);
            }
        }

        advance(5);

        const resources = document.querySelectorAll(
            'link[rel="stylesheet"], script[src], img[src]'
        );
        const expectedCount = resources.length;
        let loadedCount = 0;

        let observer;
        try {
            observer = new PerformanceObserver((list) => {
                loadedCount += list.getEntries().length;
                if (expectedCount > 0) {
                    const pct = Math.min(85, Math.round((loadedCount / expectedCount) * 85));
                    advance(pct);
                }
            });
            observer.observe({ type: 'resource', buffered: true });
        } catch (_) {}

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => advance(25), { once: true });
        } else {
            advance(25);
        }

        function finishLoading() {
            if (observer) observer.disconnect();
            advance(100);
            setTimeout(() => {
                if (ref.current) ref.current.classList.add('hidden');
                setTimeout(() => {
                    document.getElementById('page').classList.remove('page-hidden');
                    startAnimations();
                }, 500);
            }, 450);
        }

        if (document.readyState === 'complete') {
            setTimeout(finishLoading, 200);
        } else {
            window.addEventListener('load', () => setTimeout(finishLoading, 200), { once: true });
        }

        return () => {
            if (observer) observer.disconnect();
        };
    }, []);

    return (
        <div id="preloader" ref={ref}>
            <div className="preloader-logo">nexory-dev.de</div>
            <div className="preloader-bar">
                <div className="preloader-bar-inner" style={{ width: progress + '%' }}></div>
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('preloader-root')).render(<Preloader />);

/* -- start animation for home page after page loaded -- */
function startAnimations() {
    const canvas = document.getElementById('code-canvas');
    const ctx = canvas.getContext('2d');
    const PARTICLE_COUNT = 150;
    const CONNECTION_DIST = 200;
    const SPEED = 0.4;
    let particles = [];


    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x:  Math.random() * canvas.width,
            y:  Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * SPEED,
            vy: (Math.random() - 0.5) * SPEED,
            r:  Math.random() * 1.8 + 1.2,
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        });

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DIST) {
                    const alpha = 1 - dist / CONNECTION_DIST;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(88, 166, 255, ${alpha * 0.6})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(167, 139, 250, 0.95)';
            ctx.shadowColor = 'rgba(167, 139, 250, 0.6)';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        requestAnimationFrame(draw);
    }
    draw();

    const CODE =
`class nexory:
    def __init__(self, org_name):
        self.org = org_name
        self.people = []

    def join(self, new_user):
        self.people.append(new_user)
        print(f"Welcome to {self.org}, {new_user}!")

if __name__ == "__main__":
    org = NexoryOrg("nexory-dev.de")
    org.join("Your Name")
    org.run()`;

    const output     = document.getElementById('code-output');
    const TYPE_SPEED = 58;
    const WAIT_MS    = 20000;

    function startTyping() {
        output.textContent = '';
        let i = 0;
        function type() {
            if (i < CODE.length) {
                output.textContent = CODE.slice(0, i + 1);
                i++;
                setTimeout(type, TYPE_SPEED);
            } else {
                setTimeout(startTyping, WAIT_MS);
            }
        }
        type();
    }
    startTyping();
}
