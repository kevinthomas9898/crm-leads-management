import { useEffect, useRef, useState } from "react";
import Dialog from "./Dialog";

function FooterBrickBreaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");

  // Game configuration constants
  const ballRadius = 5;
  const paddleHeight = 8;
  const paddleWidth = 65;
  const brickRowCount = 3;
  const brickColumnCount = 7;
  const brickWidth = 55;
  const brickHeight = 12;
  const brickPadding = 6;
  const brickOffsetTop = 15;
  const brickOffsetLeft = 30;

  // Mutable game state held in refs to prevent unnecessary React re-renders during animation
  const stateRef = useRef({
    x: 240,
    y: 120,
    dx: 2.5,
    dy: -2.5,
    paddleX: 207.5,
    bricks: [] as any[],
    animationId: null as number | null,
    isEngineRunning: false,
  });

  const initGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const state = stateRef.current;

    // Reset core variables
    state.x = canvas.width / 2;
    state.y = canvas.height - 30;
    state.dx = 2.5 * (Math.random() > 0.5 ? 1 : -1);
    state.dy = -2.5;
    state.paddleX = (canvas.width - paddleWidth) / 2;
    state.isEngineRunning = true;

    // Reset bricks layout
    const colors = ["#f43f5e", "#f59e0b", "#10b981"]; // Rose, Amber, Emerald
    state.bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      state.bricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        state.bricks[c][r] = { x: 0, y: 0, status: 1, color: colors[r] };
      }
    }

    setGameState("playing");

    // Restart game loop safely
    if (state.animationId) cancelAnimationFrame(state.animationId);
    state.animationId = requestAnimationFrame(renderFrame);
  };

  const renderFrame = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const state = stateRef.current;

    if (!canvas || !ctx || !state.isEngineRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Bricks
    let activeBricks = 0;
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const b = state.bricks[c][r];
        if (b.status === 1) {
          activeBricks++;
          const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
          const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
          b.x = brickX;
          b.y = brickY;

          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = b.color;
          ctx.fill();
          ctx.closePath();

          // Ball/Brick Collision detection
          if (state.x > brickX && state.x < brickX + brickWidth && state.y > brickY && state.y < brickY + brickHeight) {
            state.dy = -state.dy;
            b.status = 0;
          }
        }
      }
    }

    // Win condition check
    if (activeBricks === 0) {
      state.isEngineRunning = false;
      setGameState("won");
      return;
    }

    // 2. Draw Ball
    ctx.beginPath();
    ctx.arc(state.x, state.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();

    // 3. Draw Paddle
    ctx.beginPath();
    ctx.rect(state.paddleX, canvas.height - paddleHeight - 5, paddleWidth, paddleHeight);
    ctx.fillStyle = "#3b82f6"; // Tailwind Blue 500
    ctx.fill();
    ctx.closePath();

    // 4. Boundary physics calculations
    if (state.x + state.dx > canvas.width - ballRadius || state.x + state.dx < ballRadius) {
      state.dx = -state.dx;
    }
    if (state.y + state.dy < ballRadius) {
      state.dy = -state.dy;
    } else if (state.y + state.dy > canvas.height - ballRadius - paddleHeight - 5) {
      if (state.x > state.paddleX && state.x < state.paddleX + paddleWidth) {
        let hitPoint = state.x - (state.paddleX + paddleWidth / 2);
        state.dx = hitPoint * 0.12;
        state.dy = -state.dy;
      } else if (state.y + state.dy > canvas.height - ballRadius) {
        state.isEngineRunning = false;
        setGameState("lost");
        return;
      }
    }

    state.x += state.dx;
    state.y += state.dy;
    state.animationId = requestAnimationFrame(renderFrame);
  };

  useEffect(() => {
    // Initialise the game loop on component mount
    initGame();

    // Mouse movement tracker bounded to container rect
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      if (relativeX > 0 && relativeX < canvas.width) {
        stateRef.current.paddleX = relativeX - paddleWidth / 2;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Prevent memory leaks on component unmount
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (stateRef.current.animationId) cancelAnimationFrame(stateRef.current.animationId);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-[480px] mx-auto my-5 bg-zinc-900 border-2 border-zinc-800 rounded-lg overflow-hidden font-mono select-none">
      {/* Top Banner */}
      <div className="text-zinc-400 text-[11px] text-center py-1.5 bg-zinc-950 border-b border-zinc-800">
        🎮 Move your cursor inside to control the paddle!
      </div>

      {/* Target Canvas */}
      <canvas
        ref={canvasRef}
        width={480}
        height={150}
        className="block bg-black cursor-none mx-auto"
      />

      {/* React Dynamic Overlay Screens */}
      {gameState !== "playing" && (
        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-2.5">
          {gameState === "won" ? (
            <span className="text-lg font-bold tracking-widest text-emerald-500">🏆 YOU WIN!</span>
          ) : (
            <span className="text-lg font-bold tracking-widest text-red-500">💥 GAME OVER</span>
          )}
          <button
            onClick={initGame}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-1.5 px-3 rounded transition-colors cursor-pointer"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const savedCount = localStorage.getItem("footerClickCount");
    if (savedCount) {
      setClickCount(parseInt(savedCount, 10));
    }
  }, []);

  const handleFooterClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    localStorage.setItem("footerClickCount", newCount.toString());
  };

  return (
    <footer
      onClick={handleFooterClick}
      className="bg-white text-gray-800 cursor-pointer select-none dark:bg-gray-900 dark:text-gray-300"
    >
      <div className="w-full">
        {/* Main Footer Content */}
        <div className="px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Column 1 - About */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-white">About</h3>
                <p className="text-gray-600 leading-relaxed dark:text-gray-400">
                  A simple and efficient CRM for managing leads. Built with modern technologies to help you track, manage, and convert your leads effectively.
                </p>
                <p className="text-gray-500 mt-4 text-sm dark:text-gray-500">
                  Handcrafted with ☕️ and zero stack overflow
                </p>
              </div>

              {/* Column 2 - Tech Stack */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-white">Tech Stack</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    React
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Node.js
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    MongoDB
                  </li>
                  <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full"></span>
                    Tailwind CSS
                  </li>
                </ul>
              </div>

              {/* Column 3 - Quick Links */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 dark:text-white">Quick Links</h3>
                <div className="space-y-3">
                  <a
                    href="https://github.com/kevinthomas9898/crm-leads-management"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    GitHub Repository
                  </a>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Kevin Thomas
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Contact
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 px-8 py-6 dark:border-gray-800">
          <div className="mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm dark:text-gray-500">
              © {currentYear} Kevin Thomas. All Rights Reserved.
            </p>
            <div className="flex items-center gap-4">
              {/* Game Section */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGameDialogOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all"
              >
                🎮 Play Brick Breaker
              </button>
              <p className="text-gray-600 text-sm dark:text-gray-400">
                Footer clicks: {clickCount} 🖱️
              </p>
            </div>
          </div>
        </div>

        {/* Game Dialog */}
        <Dialog
          isOpen={isGameDialogOpen}
          onClose={() => setIsGameDialogOpen(false)}
          title="🎮 Brick Breaker"
        >
          <FooterBrickBreaker />
        </Dialog>
      </div>
    </footer>
  );
}

export default Footer;
