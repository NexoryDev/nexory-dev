// ── Canvas Rain ──────────────────────────────────────────────────────────────
const canvas = document.getElementById('code-canvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();

const FONT_SIZE = 14;
const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789<>=+-*/[]{}();:#'.split('');
let drops = [];

function initDrops() {
    const cols = Math.floor(canvas.width / FONT_SIZE);
    drops = Array.from({ length: cols }, () => Math.floor(Math.random() * -(canvas.height / FONT_SIZE)));
}
initDrops();

window.addEventListener('resize', () => { resizeCanvas(); initDrops(); });

function drawRain() {
    ctx.fillStyle = 'rgba(13, 17, 23, 0.07)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${FONT_SIZE}px "Fira Code", monospace`;

    drops.forEach((y, i) => {
        const char  = CHARS[Math.floor(Math.random() * CHARS.length)];
        const alpha = Math.random() * 0.5 + 0.05;
        ctx.fillStyle = `rgba(88, 166, 255, ${alpha})`;
        ctx.fillText(char, i * FONT_SIZE, y * FONT_SIZE);

        if (y * FONT_SIZE > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    });
}

setInterval(drawRain, 40);

const CODE = `class NexoryOrg:
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