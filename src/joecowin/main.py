from fasthtml.common import *

app, rt = fast_app(
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
                height: 100vh;
                overflow: hidden;
            }
            
            .nav {
                display: flex;
                background: var(--tab-bg);
                gap: 0;
                border-bottom: 1px solid var(--tab-border);
                height: 41px;
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
            
            .window-controls {
                display: flex;
                align-items: stretch;
            }
            
            .window-btn {
                color: var(--text-color);
                text-decoration: none;
                padding: 8px 16px;
                background: var(--tab-bg);
                border: none;
                border-left: 1px solid var(--tab-border);
                cursor: pointer;
                display: flex;
                align-items: center;
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
            
            .terminal-content {
                background: var(--tab-active);
                height: calc(100vh - 41px);
                padding: 2rem;
                overflow-y: auto;
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
            
            #cycling-text::after {
                content: "█";
                animation: blink 1s step-end infinite;
                margin-left: 2px;
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
            
            .terminal-effect p {
                text-shadow: 0 0 5px rgba(0, 255, 0, 0.3);
            }
            
            #cycling-text {
                display: inline-block;
                position: relative;
            }
            
            .typing {
                border-right: 2px solid var(--text-color);
                animation: blink 1s step-end infinite;
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
        """),
        Script("""
            const interests = ['CI/CD', 'PYTHON', 'DEVOPS', 'AUTOMATION'];
            let currentIndex = 0;
            
            async function typeText(element, text) {
                element.textContent = '';
                for (let i = 0; i < text.length; i++) {
                    element.textContent += text[i];
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            async function deleteText(element) {
                const text = element.textContent;
                for (let i = text.length; i > 0; i--) {
                    element.textContent = text.substring(0, i - 1);
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
            
            async function cycleInterests() {
                const cyclingText = document.getElementById('cycling-text');
                if (!cyclingText) return;
                
                while (true) {
                    const nextText = interests[currentIndex];
                    
                    // Type the text
                    await typeText(cyclingText, nextText);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Delete the text
                    await deleteText(cyclingText);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Move to next interest
                    currentIndex = (currentIndex + 1) % interests.length;
                }
            }
            
            // Start the animation when the page loads
            document.addEventListener('DOMContentLoaded', () => {
                cycleInterests();
            });
            
            function toggleMaximize() {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
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
            P("HI!"),
            P("MY NAME IS JOSEPH COWIN"),
            P("I ", Span("❤", cls="heart"), " ", Span("", id="cycling-text"),),
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
            P("joecow.in@localhost:~/projects$ ", cls="title"),
            P("PERSONAL PROJECTS:"),
            P("1. ", A("This Website :)", href="https://github.com/ChiefSphinx/joecow.in"), 
              " - This is my first look at using FastHTML for a project and a house for my personal portfolio!"),
            P("joecow.in@localhost:~/projects$ ", cls="prompt"),
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
            P("joecow.in@localhost:~/about$ ", cls="title"),
            P("ABOUT ME:"),
            P("I AM A SOFTWARE ENGINEER WITH EXPERIENCE IN:"),
            P("- PYTHON DEVELOPMENT"),
            P("- DEVOPS & CI/CD"),
            P("- AUTOMATION"),
            P("- CLOUD INFRASTRUCTURE"),
            P("joecow.in@localhost:~/about$ ", cls="prompt"),
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
            P("joecow.in@localhost:~/contact$ ", cls="title"),
            P("CONTACT INFO:"),
            P("EMAIL: ", A("JOSEPHCOWIN@proton.me", href="mailto:josephcowin@proton.me")),
            P("GITHUB: ", A("GITHUB.COM/ChiefSphinx", href="https://github.com/ChiefSphinx")),
            P("LINKEDIN: ", A("LINKEDIN.COM/IN/JOSEPH-COWIN", href="https://www.linkedin.com/in/joseph-cowin-80531a164/")),
            P("joecow.in@localhost:~/contact$ ", cls="prompt"),
            cls="terminal-content terminal-effect"
        )
    )

serve()
