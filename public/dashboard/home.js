/* -- React Preloader -- */

const { useEffect, useRef } = React;

function Preloader() {
    const ref = useRef(null);

    useEffect(() => {
        function showPage() {
            ref.current.classList.add('hidden');

            setTimeout(() => {
                document.getElementById('page').classList.remove('page-hidden');
                startAnimations();
            }, 500);
        }

        function trigger() {
            setTimeout(showPage, 1300);
        }

        if (document.readyState === 'complete') {
            trigger();
        } else {
            window.addEventListener('load', trigger, { once: true });
        }
    }, []);

    return (
        <div id="preloader" ref={ref}>
            <div className="preloader-logo">Nexory.Org</div>
            <div className="preloader-bar">
                <div className="preloader-bar-inner"></div>
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('preloader-root')).render(<Preloader />);

/* -- start animation for home page after page loaded -- */

function startAnimations() {
    const canvas = document.getElementById('code-canvas');
    const ctx = canvas.getContext('2d');
    const PARTICLE_COUNT = 100;
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
`class NexoryOrg:
    def __init__(self, org_name):
        self.org = org_name
        self.people = []

    def join(self, new_user):
        self.people.append(new_user)
        print(f"Success, {new_user} joined")

    def run(self):
        print(f"Welcome to {self.org}!")

if __name__ == "__main__":
    org = NexoryOrg("Nexory.Org")
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

/* -- Hero Section with Canvas and Typewriter -- */
function Hero() {
    const canvasRef = useRef(null);
    const outputRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const FONT_SIZE = 14;
        const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789<>=+-*/[]{}();:#'.split('');
        let drops = [];

        function resize() {
            canvas.width  = window.innerWidth;
            canvas.height = window.innerHeight;
            const cols = Math.floor(canvas.width / FONT_SIZE);
            drops = Array.from({ length: cols }, () =>
                Math.floor(Math.random() * -(canvas.height / FONT_SIZE))
            );
        }
        resize();
        window.addEventListener('resize', resize);

        const interval = setInterval(() => {
            ctx.fillStyle = 'rgba(13, 17, 23, 0.07)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `${FONT_SIZE}px "Fira Code", monospace`;

            drops.forEach((y, i) => {
                const char  = CHARS[Math.floor(Math.random() * CHARS.length)];
                const alpha = Math.random() * 0.5 + 0.05;
                ctx.fillStyle = `rgba(88, 166, 255, ${alpha})`;
                ctx.fillText(char, i * FONT_SIZE, y * FONT_SIZE);
                if (y * FONT_SIZE > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            });
        }, 40);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', resize);
        };
    }, []);

    useEffect(() => {
        const CODE =
`class NexoryOrg:
    def __init__(self, org_name):
        self.org = org_name
        self.people = []

    def join(self, new_user):
        self.people.append(new_user)
        print(f"Success, {new_user} joined")

    def run(self):
        print(f"Welcome to {self.org}!")

if __name__ == "__main__":
    org = NexoryOrg("Nexory.Org")
    org.join("Your Name")
    org.run()`;

        const TYPE_SPEED = 58;
        const WAIT_MS    = 20000;
        let timeout;

        function startTyping() {
            outputRef.current.textContent = '';
            let i = 0;
            function type() {
                if (i < CODE.length) {
                    outputRef.current.textContent = CODE.slice(0, i + 1);
                    i++;
                    timeout = setTimeout(type, TYPE_SPEED);
                } else {
                    timeout = setTimeout(startTyping, WAIT_MS);
                }
            }
            type();
        }
        startTyping();

        return () => clearTimeout(timeout);
    }, []);

    return (
        <section className="hero">
            <canvas ref={canvasRef} id="code-canvas"></canvas>

            <div className="hero-content">
                <div className="info">
                    <h1>Nexory.Org</h1>
                    <p>Open source projects · Python, JavaScript, PHP and more</p>
                </div>

                <div className="terminal">
                    <div className="terminal-header">
                        <span className="dot red"></span>
                        <span className="dot yellow"></span>
                        <span className="dot green"></span>
                        <span className="terminal-title">nexory.py</span>
                    </div>
                    <div className="terminal-body">
                        <pre ref={outputRef} id="code-output"></pre>
                        <span className="cursor"></span>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* -- App -- */
function App() {
    const [loaded, setLoaded] = useState(false);

    return (
        <>
            {!loaded && <Preloader onDone={() => setLoaded(true)} />}
            <Hero />
        </>
    );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
