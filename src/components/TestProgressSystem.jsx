import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function DiagonalCanvasFileUploadProgressionSystem() {
  const { currentUser, logout, tokens } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [currentTestIndex, setCurrentTestIndex] = useState(-1);
  const [completedTests, setCompletedTests] = useState([]);
  const [allCompleted, setAllCompleted] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [hoveredCircle, setHoveredCircle] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const animationRef = useRef(null);

  // Mock test data
  const tests = [
    { id: 1, name: "Тест 1" },
    { id: 2, name: "Тест 2" },
    { id: 3, name: "Тест 3" },
    { id: 4, name: "Тест 4" },
    { id: 5, name: "Тест 5" },
    { id: 6, name: "Тест 6" },
    { id: 7, name: "Тест 7" },
  ];

  // Calculate positions: 3 вправо вниз, 3 влево вниз, 3 вправо вниз (всего 9)
  const getCirclePositions = () => {
    const { width, height } = canvasSize;
    const baseRadius = Math.min(width, height) * 0.04;
    const horizontalSpacing = width * 0.13;
    const verticalSpacing = height * 0.13;
    const startX = width * 0.2;
    const startY = height * 0.15;
    const positions = [];
    // 3 вправо вниз
    for (let i = 0; i < 3; i++) {
      positions.push({
        x: startX + horizontalSpacing * i,
        y: startY + verticalSpacing * i,
        radius: baseRadius
      });
    }
    // 3 влево вниз
    let pivot = positions[2];
    for (let i = 1; i <= 3; i++) {
      positions.push({
        x: pivot.x - horizontalSpacing * i,
        y: pivot.y + verticalSpacing * i,
        radius: baseRadius
      });
    }
    // 3 вправо вниз
    pivot = positions[5];
    for (let i = 1; i <= 3; i++) {
      positions.push({
        x: pivot.x + horizontalSpacing * i,
        y: pivot.y + verticalSpacing * i,
        radius: baseRadius
      });
    }
    return positions;
  };

  // Auto-scroll to active content
  const scrollToActiveContent = useCallback(() => {
    if (!containerRef.current) return;

    // Calculate scroll position based on current test
    if (currentTestIndex >= 0) {
      const positions = getCirclePositions();
      if (positions[currentTestIndex]) {
        const { y } = positions[currentTestIndex];

        // Add some offset to ensure the element is in view
        const scrollY = Math.max(0, y - containerRef.current.clientHeight / 3);

        // Smooth scroll to the position
        containerRef.current.scrollTo({
          top: scrollY,
          behavior: 'smooth'
        });
      }
    }
  }, [currentTestIndex, canvasSize]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);

      if (currentTestIndex === -1) {
        setCurrentTestIndex(0);
      } else {
        completeCurrentTest();
      }
    }
  };

  // Complete current test and prepare for next
  const completeCurrentTest = () => {
    if (currentTestIndex >= 0) {
      setCompletedTests(prev => [...prev, tests[currentTestIndex].id]);
    }

    if (currentTestIndex < tests.length - 1) {
      setCurrentTestIndex(prev => prev + 1);
      setUploadedFile(null);
    } else {
      setAllCompleted(true);
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight / 2 - containerRef.current.clientHeight / 2,
            behavior: 'smooth'
          });
        }
      }, 300);
    }
  };

  // Trigger file upload dialog
  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  // Check if mouse is over a circle
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const positions = getCirclePositions();
    const currentVisible = currentTestIndex + 1;

    for (let i = 0; i < currentVisible; i++) {
      const circle = positions[i];
      const dx = x - circle.x;
      const dy = y - circle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < circle.radius) {
        setHoveredCircle(i);
        canvas.style.cursor = 'pointer';
        return;
      }
    }

    setHoveredCircle(null);
    canvas.style.cursor = 'default';
  };

  // Handle canvas click
  const handleCanvasClick = (e) => {
    if (hoveredCircle !== null) {
      // Handle circle click if needed
      triggerFileUpload();
    }
  };

  // Resize observer to keep canvas responsive
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!containerRef.current) return;

      const { width, height } = containerRef.current.getBoundingClientRect();
      setCanvasSize({ width, height });

      // Ensure active content is in view after resize
      setTimeout(scrollToActiveContent, 100);
    };

    // Initialize canvas size
    updateCanvasSize();

    // Create resize observer
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Clean up
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [canvasSize, scrollToActiveContent]);

  // Draw canvas when size changes or state updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update canvas dimensions to match state
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    const drawCanvas = () => {
      const ctx = canvas.getContext('2d');
      const positions = getCirclePositions();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Adjust font size based on canvas dimensions
      const fontSize = Math.max(12, Math.min(canvasSize.width, canvasSize.height) * 0.025);
      const lineWidth = Math.max(3, Math.min(canvasSize.width, canvasSize.height) * 0.008);

      if (currentTestIndex < 0) {
        animationRef.current = requestAnimationFrame(drawCanvas);
        return;
      }

      // Draw path between circles
      ctx.beginPath();
      ctx.moveTo(positions[0].x, positions[0].y);

      for (let i = 1; i <= currentTestIndex; i++) {
        if (i === 3) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = lineWidth;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(positions[2].x, positions[2].y);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        }

        ctx.lineTo(positions[i].x, positions[i].y);
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = lineWidth;
      ctx.stroke();

      // Draw circles
      for (let i = 0; i <= currentTestIndex; i++) {
        const pos = positions[i];
        const isCompleted = completedTests.includes(tests[i].id);
        const isCurrent = i === currentTestIndex;
        const isHovered = i === hoveredCircle;

        if (isHovered || isCurrent) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pos.radius + pos.radius * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(79, 70, 229, 0.3)';
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, pos.radius, 0, Math.PI * 2);
        ctx.fillStyle = isCurrent ? '#4F46E5' : '#374151';
        ctx.fill();

        drawDirectionArrow(ctx, pos.x, pos.y, i, pos.radius);

        ctx.font = `${fontSize}px sans-serif`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText(tests[i].name, pos.x, pos.y + pos.radius + fontSize);
      }

      if (!allCompleted && currentTestIndex >= 0 && currentTestIndex < tests.length) {
        const currentPos = positions[currentTestIndex];
        setButtonPosition({
          x: currentPos.x,
          y: currentPos.y + currentPos.radius + fontSize + 20
        });
      }

      if (allCompleted) {
        ctx.font = `bold ${fontSize * 1.5}px sans-serif`;
        ctx.fillStyle = '#10B981';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const passedText = 'PASSED';
        const textWidth = ctx.measureText(passedText).width;
        const padding = fontSize;

        ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
        ctx.beginPath();

        // Use rounded rect approach compatible with all browsers
        const rectX = canvas.width / 2 - textWidth / 2 - padding;
        const rectY = canvas.height / 2 - fontSize - padding / 2;
        const rectWidth = textWidth + padding * 2;
        const rectHeight = fontSize * 2 + padding;
        const radius = fontSize / 2;

        ctx.beginPath();
        ctx.moveTo(rectX + radius, rectY);
        ctx.lineTo(rectX + rectWidth - radius, rectY);
        ctx.arcTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + radius, radius);
        ctx.lineTo(rectX + rectWidth, rectY + rectHeight - radius);
        ctx.arcTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - radius, rectY + rectHeight, radius);
        ctx.lineTo(rectX + radius, rectY + rectHeight);
        ctx.arcTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - radius, radius);
        ctx.lineTo(rectX, rectY + radius);
        ctx.arcTo(rectX, rectY, rectX + radius, rectY, radius);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.fillText(passedText, canvas.width / 2, canvas.height / 2);
      }

      animationRef.current = requestAnimationFrame(drawCanvas);
    };

    const drawDirectionArrow = (ctx, cx, cy, index, radius) => {
      ctx.save();
      ctx.fillStyle = 'white';

      // Scale arrow size based on circle radius
      const arrowSize = radius * 0.6;

      if (index < 3) {
        drawArrow(ctx, cx - arrowSize, cy - arrowSize, cx + arrowSize, cy + arrowSize, arrowSize * 0.8);
      } else if (index < 6) {
        drawArrow(ctx, cx + arrowSize, cy - arrowSize, cx - arrowSize, cy + arrowSize, arrowSize * 0.8);
      } else {
        drawArrow(ctx, cx - arrowSize, cy - arrowSize, cx + arrowSize, cy + arrowSize, arrowSize * 0.8);
      }

      ctx.restore();
    };

    const drawArrow = (ctx, fromX, fromY, toX, toY, headLength) => {
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const lineWidth = Math.max(1, headLength * 0.2);

      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = 'white';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(
        toX - headLength * Math.cos(angle - Math.PI / 6),
        toY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        toX - headLength * Math.cos(angle + Math.PI / 6),
        toY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fillStyle = 'white';
      ctx.fill();
    };

    drawCanvas();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [canvasSize, currentTestIndex, completedTests, allCompleted, hoveredCircle]);

  // Calculate button size based on canvas dimensions
  const getButtonStyles = () => {
    const fontSize = Math.max(14, Math.min(canvasSize.width, canvasSize.height) * 0.02);
    const paddingX = fontSize * 1.5;
    const paddingY = fontSize * 0.8;

    return {
      fontSize: `${fontSize}px`,
      padding: `${paddingY}px ${paddingX}px`,
    };
  };

  // Scroll when active test changes or when file is uploaded
  useEffect(() => {
    scrollToActiveContent();
  }, [currentTestIndex, uploadedFile, scrollToActiveContent]);

  // Handle logout
  const handleLogout = async () => {
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 sm:p-10">
      <div className="flex justify-between items-center mb-14 w-full max-w-5xl px-4">
        <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent p-2">
          Qasqyr AI
        </div>
        <h1 className="text-2xl font-medium text-center">
          <div className="text-lg text-blue-200 opacity-80 tracking-wide px-4 py-2">модуль 1</div>
        </h1>
        <div className="flex items-center gap-4">
          {currentUser && (
            <>
              <div className="text-sm text-gray-300">
                <span className="opacity-70">Signed in as: </span>
                <span className="font-medium text-blue-300">{currentUser.username || currentUser.email}</span>
              </div>
              <Link
                to="/modules"
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors duration-200"
              >
                Мои Модули
              </Link>
              <Link
                to="/profile"
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
      <div ref={containerRef} className="relative w-full max-w-5xl rounded-xl shadow-2xl overflow-auto mx-4" style={{ minHeight: '75vh', maxHeight: '85vh', width: 'calc(100% - 2rem)' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full min-h-[600px]"
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
        />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
          accept=".pdf,.mp4,.mp3,.wav,.avi"
        />
        {currentTestIndex === -1 && (
          <button
            onClick={triggerFileUpload}
            className="absolute px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg text-white font-medium transition-all duration-300 shadow-xl ring-2 ring-blue-500/20"
            style={{
              top: canvasSize.height / 2,
              left: canvasSize.width / 2,
              transform: 'translate(-50%, -50%)',
              ...getButtonStyles()
            }}
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Загрузить файл для начала
            </span>
          </button>
        )}
        {!allCompleted && currentTestIndex >= 0 && currentTestIndex < tests.length && (
          <button
            onClick={triggerFileUpload}
            className="absolute px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg text-white font-medium transition-all duration-300 shadow-xl ring-2 ring-blue-500/20"
            style={{
              top: buttonPosition.y,
              left: buttonPosition.x,
              transform: 'translate(-50%, 0)',
              ...getButtonStyles()
            }}
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Загрузить файл для "${tests[currentTestIndex].name}"
            </span>
          </button>
        )}
        {uploadedFile && (
          <div
            className="absolute px-8 py-5 bg-gray-800/95 backdrop-blur-md rounded-xl text-white shadow-xl border border-indigo-900/30 z-10 my-6 mx-auto"
            style={{
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: `${Math.max(12, Math.min(canvasSize.width, canvasSize.height) * 0.018)}px`,
            }}
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Загружен:</span>
              <span className="text-blue-300 ml-2">{uploadedFile.name}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}