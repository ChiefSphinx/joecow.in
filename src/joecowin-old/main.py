from fasthtml.common import *

app, rt = fast_app(
    # Add some custom CSS variables
    hdrs=(
        Style("""
            :root {
                --text-color: #00ff00;
                --background-color: #000000;
                --cursor-color: #00ff00;
                --tab-bg: #1a1a1a;
                --tab-active: #000000;
                --tab-border: #333333;
            }
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            html, body {
                background: var(--tab-bg);
                color: var(--text-color);
                font-family: 'Courier New', monospace;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                min-height: 100vh;
            }
            
            .nav {
                display: flex;
                background: var(--tab-bg);
                gap: 0;
                border-bottom: 1px solid var(--tab-border);
            }
            
            .nav-links {
                display: flex;
                flex: 1;
                gap: 2px;
            }
            
            .nav-links a {
                flex: 1;
                color: var(--text-color);
                text-decoration: none;
                padding: 8px 16px;
                background: var(--tab-bg);
                border-radius: 4px 4px 0 0;
                border: 1px solid var(--tab-border);
                border-bottom: none;
                text-align: center;
                white-space: nowrap;
            }
            
            .nav-links a:hover,
            .nav-links a.active {
                background: var(--tab-active);
            }
            
            .close-btn {
                color: var(--text-color);
                text-decoration: none;
                padding: 8px 16px;
                background: var(--tab-bg);
                border: none;
                border-left: 1px solid var(--tab-border);
                cursor: pointer;
            }
            
            .close-btn:hover {
                background: #ff0000;
                color: white;
            }
            
            .terminal-content {
                background: var(--tab-active);
                margin: 0;
                padding: 2rem;
                min-height: calc(100vh - 41px);
                border-left: 1px solid var(--tab-border);
                border-right: 1px solid var(--tab-border);
                border-bottom: 1px solid var(--tab-border);
            }
            
            .title {
                font-weight: bold;
                margin-bottom: 1rem;
            }
            
            .prompt {
                font-weight: bold;
                margin-bottom: 1rem;
            }
            
            .prompt::after {
                content: "█";
                animation: blink 1s step-end infinite;
                margin-left: 2px;
            }
            
            .prompt-fake {
                font-weight: bold;
                margin-bottom: 1rem;
            }              
            
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
            
            .heart {
                color: #ff69b4;
            }
            
            p {
                margin: 0.5rem 0;
                font-size: 1.1rem;
            }
            
            /* Add subtle CRT screen effect */
            .terminal-effect::before {
                content: "";
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: repeating-linear-gradient(
                    0deg,
                    rgba(0, 0, 0, 0.15),
                    rgba(0, 0, 0, 0.15) 1px,
                    transparent 1px,
                    transparent 2px
                );
                pointer-events: none;
            }
            
            /* Add subtle glow effect */
            .terminal-effect p {
                text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
            }
            
            .terminal-effect .prompt::after {
                content: "█";
                animation: blink 1s step-end infinite;
                margin-left: 2px;
            }
            
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
            
            #cycling-text::after {
                content: "█";
                animation: blink 1s step-end infinite;
                margin-left: 2px;
            }
            
            .window-controls {
                display: flex;
                gap: 0;
                align-items: center;
            }
            
            .window-btn {
                color: var(--text-color);
                text-decoration: none;
                padding: 8px 16px;
                background: var(--tab-bg);
                border: none;
                border-left: 1px solid var(--tab-border);
                cursor: pointer;
            }
            
            .minimize-btn:hover {
                background: #ffd700;
                color: black;
            }
            
            .maximize-btn:hover {
                background: #32cd32;
                color: black;
            }
            
            .close-btn:hover {
                background: #ff0000;
                color: white;
            }
            
            .bsod {
                background: #0000aa;
                color: #ffffff;
                font-family: 'Courier New', monospace;
                padding: 2rem;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
            }
            
            .bsod h1 {
                margin-bottom: 2rem;
            }
            
            .bsod p {
                margin: 1rem 0;
            }
            
            .prompt.finished::after {
                content: none;
            }
            
            .typing-cursor::after {
                content: "█";
                animation: blink 1s step-end infinite;
                margin-left: 2px;
            }
            
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
            }
            
        """),
        Script("""
            // Configuration
            const TYPING_SPEED = 5;
            const CYCLE_TYPING_SPEED = 50;
            const CYCLE_INTERVAL = 3000;
            
            const interests = ['CI/CD', 'DEVOPS', 'PYTHON', 'AUTOMATION'];
            let currentIndex = 0;
            let isTyping = false;
            let typingComplete = false;
            let skipTyping = localStorage.getItem('skipTyping') === 'true';

            // Add window control functions
            function toggleMinimize() {
                skipTyping = !skipTyping;
                localStorage.setItem('skipTyping', skipTyping);
                const content = document.querySelector('.terminal-content');
                if (skipTyping) {
                    // Show all content immediately
                    const children = Array.from(content.children);
                    children.forEach(child => {
                        child.style.display = 'block';
                        child.textContent = child.getAttribute('data-content');
                        child.classList.remove('typing-cursor');
                    });
                    typingComplete = true;
                    cycleInterests();
                } else {
                    // Restart typing animation
                    location.reload();
                }
            }

            function toggleMaximize() {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }

            async function typeText(element, text, speed = TYPING_SPEED) {  
                if (skipTyping) {
                    element.innerHTML = element.getAttribute('data-content');
                    return;
                }
                
                // Create a temporary container
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = element.getAttribute('data-content');
                
                // Get all text nodes
                const textNodes = [];
                const walk = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT);
                let node;
                while (node = walk.nextNode()) {
                    textNodes.push({
                        node: node,
                        text: node.textContent
                    });
                }
                
                // Start with the full HTML structure but empty text nodes
                element.innerHTML = tempDiv.innerHTML;
                const elementTextNodes = [];
                const elementWalk = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
                while (node = elementWalk.nextNode()) {
                    elementTextNodes.push(node);
                }
                
                // Type each character while maintaining HTML structure
                for (let i = 0; i < textNodes.length; i++) {
                    const originalText = textNodes[i].text;
                    for (let j = 0; j < originalText.length; j++) {
                        elementTextNodes[i].textContent = originalText.substring(0, j + 1);
                        await new Promise(resolve => setTimeout(resolve, speed));
                    }
                }
            }

            async function cycleInterests() {
                const cyclingText = document.getElementById('cycling-text');
                if (!cyclingText) return;
                
                // Initialize with first interest
                cyclingText.innerHTML = interests[0];
                
                setInterval(async () => {
                    cyclingText.style.opacity = '0';
                    await new Promise(resolve => setTimeout(resolve, 500));
                    currentIndex = (currentIndex + 1) % interests.length;
                    cyclingText.innerHTML = interests[currentIndex];
                    cyclingText.style.opacity = '1';
                }, CYCLE_INTERVAL);
            }

            async function animateTerminal() {
                const content = document.querySelector('.terminal-content');
                const children = Array.from(content.children);
                
                if (skipTyping) {
                    children.forEach(child => {
                        child.style.display = 'block';
                        child.innerHTML = child.getAttribute('data-content');
                        child.classList.remove('typing-cursor');
                    });
                    const finalPrompt = children[children.length - 1];
                    if (finalPrompt.classList.contains('prompt')) {
                        finalPrompt.classList.add('typing-cursor');
                    }
                    cycleInterests();
                    return;
                }
                
                // Hide all content initially except first element
                children.slice(1).forEach(child => child.style.display = 'none');
                
                // Remove any existing cursors
                children.forEach(child => child.classList.remove('typing-cursor'));
                
                // Type each line of content
                for (let i = 0; i < children.length; i++) {
                    const child = children[i];
                    child.style.display = 'block';
                    child.innerHTML = '';
                    
                    if (!child.classList.contains('prompt')) {
                        children.forEach(c => c.classList.remove('typing-cursor'));
                        child.classList.add('typing-cursor');
                    }
                    
                    await typeText(child, child.getAttribute('data-content'));
                    child.classList.remove('typing-cursor');
                }
                
                // Add cursor to final prompt after all typing is complete
                const finalPrompt = children[children.length - 1];
                if (finalPrompt.classList.contains('prompt')) {
                    finalPrompt.classList.add('typing-cursor');
                }
                
                cycleInterests();
            }

            // Add CSS for smooth transitions
            const style = document.createElement('style');
            style.textContent = `
                #cycling-text {
                    transition: opacity 0.5s ease-in-out;
                }
            `;
            document.head.appendChild(style);

            // Initialize animation when page loads
            document.addEventListener('DOMContentLoaded', () => {
                animateTerminal();
            });
        """)
    )
)

@rt("/")
def get():
    return Article(
        Nav(
            Div(
                A("~", href="/", cls="active"),
                A("/projects", href="/projects"),
                A("/about", href="/about"),
                A("/contact", href="/contact"),
                cls="nav-links"
            ),
            Div(
                A("-", href="#", cls="window-btn minimize-btn", onclick="toggleMinimize()"),
                A("□", href="#", cls="window-btn maximize-btn", onclick="toggleMaximize()"),
                A("X", href="/bsod", cls="window-btn close-btn"),
                cls="window-controls"
            ),
            cls="nav"
        ),
        Div(
            P("joecow.in@localhost:~$ ", **{"data-content": "joecow.in@localhost:~$ "}, cls="title"),
            P("HI!", **{"data-content": "HI!"}),
            P("MY NAME IS JOSEPH COWIN", **{"data-content": "MY NAME IS JOSEPH COWIN"}),
            P("I ", 
              Span("❤", cls="heart"), 
              " ", 
              Span("CI/CD", id="cycling-text", **{"data-content": "CI/CD"}),
              **{"data-content": "I ❤ CI/CD"}
            ),
            P("", cls="prompt", **{"data-content": "joecow.in@localhost:~$ "}),
            cls="terminal-content terminal-effect"
        )
    )

@rt("/bsod")
def bsod():
    return Div(
        H1("A fatal error has occurred"),
        P("Your PC ran into a problem and needs to restart."),
        P("Error code: 0x000000EF"),
        P("* Press any key to return to the previous page"),
        P("* Press CTRL+ALT+DEL to restart your computer"),
        cls="bsod",
        onclick="window.history.back()"
    )

@rt("/projects")
def projects():
    return Article(
        Nav(
            Div(
                A("~", href="/"),
                A("/projects", href="/projects", cls="active"),
                A("/about", href="/about"),
                A("/contact", href="/contact"),
                cls="nav-links"
            ),
            Div(
                A("-", href="#", cls="window-btn minimize-btn", onclick="toggleMinimize()"),
                A("□", href="#", cls="window-btn maximize-btn", onclick="toggleMaximize()"),
                A("X", href="/bsod", cls="window-btn close-btn"),
                cls="window-controls"
            ),
            cls="nav"
        ),
        Div(
            P("joecow.in@localhost:~/projects$ ", **{"data-content": "joecow.in@localhost:~/projects$ "}, cls="title"),
            P("PERSONAL PROJECTS:", **{"data-content": "PERSONAL PROJECTS:"}),
            P("1. ", A("This Website :)", href="https://github.com/ChiefSphinx/joecow.in"), 
              " - This is my first look at using FastHTML for a project and a house for my personal portfolio!", 
              **{"data-content": "1. This Website :) - This is my first look at using FastHTML for a project and a house for my personal portfolio!"}),
            P("", cls="prompt", **{"data-content": "joecow.in@localhost:~/projects$ "}),
            cls="terminal-content terminal-effect"
        )
    )

@rt("/about")
def about():
    return Article(
        Nav(
            Div(
                A("~", href="/"),
                A("/projects", href="/projects"),
                A("/about", href="/about", cls="active"),
                A("/contact", href="/contact"),
                cls="nav-links"
            ),
            Div(
                A("-", href="#", cls="window-btn minimize-btn", onclick="toggleMinimize()"),
                A("□", href="#", cls="window-btn maximize-btn", onclick="toggleMaximize()"),
                A("X", href="/bsod", cls="window-btn close-btn"),
                cls="window-controls"
            ),
            cls="nav"
        ),
        Div(
            P("joecow.in@localhost:~/about$ ", **{"data-content": "joecow.in@localhost:~/about$ "}, cls="title"),
            P("ABOUT ME:", **{"data-content": "ABOUT ME:"}),
            P("I AM A SOFTWARE ENGINEER WITH EXPERIENCE IN:", **{"data-content": "I AM A SOFTWARE ENGINEER WITH EXPERIENCE IN:"}),
            P("- PYTHON DEVELOPMENT", **{"data-content": "- PYTHON DEVELOPMENT"}),
            P("- DEVOPS & CI/CD", **{"data-content": "- DEVOPS & CI/CD"}),
            P("- AUTOMATION", **{"data-content": "- AUTOMATION"}),
            P("- CLOUD INFRASTRUCTURE", **{"data-content": "- CLOUD INFRASTRUCTURE"}),
            P("", cls="prompt", **{"data-content": "joecow.in@localhost:~/about$ "}),
            cls="terminal-content terminal-effect"
        )
    )

@rt("/contact")
def contact():
    return Article(
        Nav(
            Div(
                A("~", href="/"),
                A("/projects", href="/projects"),
                A("/about", href="/about"),
                A("/contact", href="/contact", cls="active"),
                cls="nav-links"
            ),
            Div(
                A("-", href="#", cls="window-btn minimize-btn", onclick="toggleMinimize()"),
                A("□", href="#", cls="window-btn maximize-btn", onclick="toggleMaximize()"),
                A("X", href="/bsod", cls="window-btn close-btn"),
                cls="window-controls"
            ),
            cls="nav"
        ),
        Div(
            P("joecow.in@localhost:~/contact$ ", **{"data-content": "joecow.in@localhost:~/contact$ "}, cls="title"),
            P("CONTACT INFO:", **{"data-content": "CONTACT INFO:"}),
            P("EMAIL: ", A("JOSEPHCOWIN@proton.me", href="mailto:josephcowin@proton.me"), 
              **{"data-content": "EMAIL: JOSEPHCOWIN@proton.me"}),
            P("GITHUB: ", A("GITHUB.COM/ChiefSphinx", href="https://github.com/ChiefSphinx"), 
              **{"data-content": "GITHUB: GITHUB.COM/ChiefSphinx"}),
            P("LINKEDIN: ", A("LINKEDIN.COM/IN/JOSEPH-COWIN", href="https://www.linkedin.com/in/joseph-cowin-80531a164/"), 
              **{"data-content": "LINKEDIN: LINKEDIN.COM/IN/JOSEPH-COWIN"}),
            P("", cls="prompt", **{"data-content": "joecow.in@localhost:~/contact$ "}),
            cls="terminal-content terminal-effect"
        )
    )

serve()
