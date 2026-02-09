import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function FaceSecureLogo() {
    const [scanComplete, setScanComplete] = useState(false);
    const [showDataStream, setShowDataStream] = useState(false);

    useEffect(() => {
        const scanTimer = setTimeout(() => setScanComplete(true), 3000);
        const dataTimer = setTimeout(() => setShowDataStream(true), 2000);
        return () => {
            clearTimeout(scanTimer);
            clearTimeout(dataTimer);
        };
    }, []);

    // Face outline points
    const facePoints = [
        { x: 50, y: 20 }, // top
        { x: 70, y: 30 }, // top right
        { x: 80, y: 50 }, // right
        { x: 75, y: 70 }, // bottom right
        { x: 50, y: 80 }, // bottom
        { x: 25, y: 70 }, // bottom left
        { x: 20, y: 50 }, // left
        { x: 30, y: 30 }, // top left
    ];

    // Neural network connection lines
    const connections = [
        { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 },
        { from: 3, to: 4 }, { from: 4, to: 5 }, { from: 5, to: 6 },
        { from: 6, to: 7 }, { from: 7, to: 0 }, { from: 0, to: 4 },
        { from: 1, to: 5 }, { from: 2, to: 6 }, { from: 3, to: 7 },
    ];

    return (
        <div className="flex flex-wrap items-center gap-8 lg:gap-12">
            {/* Animated Face Logo - starts big, scales down */}
            <motion.div
                className="relative flex-shrink-0"
                initial={{ width: 200, height: 200 }}
                animate={{ width: 96, height: 96 }}
                transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
            >
                {/* Multiple rotating rings */}
                {[0, 1, 2].map((ring) => (
                    <motion.div
                        key={ring}
                        className="absolute inset-0 rounded-full border border-[#1FB6C9]/20"
                        style={{
                            width: `${100 + ring * 15}%`,
                            height: `${100 + ring * 15}%`,
                            left: `${-ring * 7.5}%`,
                            top: `${-ring * 7.5}%`,
                        }}
                        initial={{ opacity: 0, rotate: 0 }}
                        animate={{
                            opacity: [0, 0.5, 0.2],
                            rotate: 360,
                        }}
                        transition={{
                            opacity: { duration: 1, delay: 0.5 + ring * 0.2 },
                            rotate: {
                                duration: 20 + ring * 5,
                                repeat: Infinity,
                                ease: 'linear',
                                delay: ring * 0.3,
                            },
                        }}
                    />
                ))}

                {/* Pulsing outer glow - multiple layers */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(111,234,255,0.2) 0%, rgba(31,182,201,0.1) 50%, transparent 70%)',
                    }}
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />

                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: 'radial-gradient(circle, rgba(61,213,231,0.15) 0%, transparent 60%)',
                    }}
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.5,
                    }}
                />

                {/* Face mesh */}
                <motion.svg
                    viewBox="0 0 100 100"
                    className="absolute inset-0 w-full h-full"
                    initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                >
                    {/* Neural network connections */}
                    {connections.map((conn, index) => (
                        <motion.line
                            key={`conn-${index}`}
                            x1={facePoints[conn.from].x}
                            y1={facePoints[conn.from].y}
                            x2={facePoints[conn.to].x}
                            y2={facePoints[conn.to].y}
                            stroke="#1FB6C9"
                            strokeWidth="0.5"
                            opacity="0.3"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.3 }}
                            transition={{
                                duration: 0.5,
                                delay: 1 + index * 0.05,
                                ease: 'easeOut',
                            }}
                        />
                    ))}

                    {/* Geometric face outline with gradient */}
                    <defs>
                        <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3DD5E7" />
                            <stop offset="50%" stopColor="#1FB6C9" />
                            <stop offset="100%" stopColor="#6FEAFF" />
                        </linearGradient>
                    </defs>

                    <motion.path
                        d={`M ${facePoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} Z`}
                        fill="none"
                        stroke="url(#faceGradient)"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: 'easeInOut', delay: 0.8 }}
                    />

                    {/* Face recognition points with pulse */}
                    {facePoints.map((point, index) => (
                        <g key={index}>
                            {/* Outer ring */}
                            <motion.circle
                                cx={point.x}
                                cy={point.y}
                                r="4"
                                fill="none"
                                stroke="#6FEAFF"
                                strokeWidth="0.5"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1.5, 1],
                                    opacity: [0, 0.5, 0],
                                }}
                                transition={{
                                    delay: 1 + index * 0.1,
                                    duration: 1.5,
                                    repeat: Infinity,
                                    repeatDelay: 2,
                                }}
                            />
                            {/* Center point */}
                            <motion.circle
                                cx={point.x}
                                cy={point.y}
                                r="2"
                                fill="#6FEAFF"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                            >
                                <animate
                                    attributeName="fill"
                                    values="#6FEAFF;#3DD5E7;#6FEAFF"
                                    dur="2s"
                                    repeatCount="indefinite"
                                />
                            </motion.circle>
                        </g>
                    ))}

                    {/* Eyes with blink animation */}
                    <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.3 }}
                    >
                        <motion.circle
                            cx="38"
                            cy="45"
                            r="3"
                            fill="#1FB6C9"
                            animate={{ scaleY: [1, 0.1, 1] }}
                            transition={{ delay: 3, duration: 0.3, repeat: Infinity, repeatDelay: 4 }}
                        />
                        <motion.circle
                            cx="62"
                            cy="45"
                            r="3"
                            fill="#1FB6C9"
                            animate={{ scaleY: [1, 0.1, 1] }}
                            transition={{ delay: 3, duration: 0.3, repeat: Infinity, repeatDelay: 4 }}
                        />
                    </motion.g>

                    {/* Horizontal scanning lines - multiple */}
                    {[0, 1, 2].map((lineIndex) => (
                        <motion.line
                            key={`scan-${lineIndex}`}
                            x1="20"
                            y1="50"
                            x2="80"
                            y2="50"
                            stroke="#6FEAFF"
                            strokeWidth="0.5"
                            initial={{ y1: 20, y2: 20, opacity: 0 }}
                            animate={{
                                y1: [20, 80, 20],
                                y2: [20, 80, 20],
                                opacity: [0, 0.8, 0],
                            }}
                            transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: 'linear',
                                delay: lineIndex * 0.8,
                            }}
                        />
                    ))}

                    {/* Lock icon with entrance animation */}
                    {scanComplete && (
                        <motion.g
                            initial={{ opacity: 0, scale: 0, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
                        >
                            {/* Lock glow */}
                            <circle cx="50" cy="63" r="8" fill="#6FEAFF" opacity="0.2" />
                            {/* Lock body */}
                            <rect
                                x="44"
                                y="58"
                                width="12"
                                height="10"
                                fill="#1FB6C9"
                                rx="1"
                            />
                            {/* Lock shackle */}
                            <path
                                d="M 46 58 L 46 53 Q 46 50, 50 50 Q 54 50, 54 53 L 54 58"
                                fill="none"
                                stroke="#1FB6C9"
                                strokeWidth="2"
                            />
                            {/* Checkmark inside lock */}
                            <motion.path
                                d="M 47 62 L 49 64 L 53 60"
                                fill="none"
                                stroke="#071C2F"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                            />
                        </motion.g>
                    )}
                </motion.svg>

                {/* Corner brackets - animated */}
                {[
                    { x: 0, y: 0, rotate: 0 },
                    { x: 100, y: 0, rotate: 90 },
                    { x: 100, y: 100, rotate: 180 },
                    { x: 0, y: 100, rotate: 270 },
                ].map((corner, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-6 h-6"
                        style={{
                            left: corner.x === 100 ? 'auto' : '-8px',
                            right: corner.x === 100 ? '-8px' : 'auto',
                            top: corner.y === 100 ? 'auto' : '-8px',
                            bottom: corner.y === 100 ? '-8px' : 'auto',
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0.7], scale: 1 }}
                        transition={{ delay: 1.5 + i * 0.1, duration: 0.5 }}
                    >
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                            <motion.path
                                d="M 2 8 L 2 2 L 8 2"
                                fill="none"
                                stroke="#6FEAFF"
                                strokeWidth="2"
                                strokeLinecap="round"
                                transform={`rotate(${corner.rotate} 12 12)`}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ delay: 1.5 + i * 0.1, duration: 0.4 }}
                            />
                        </svg>
                    </motion.div>
                ))}

                {/* Orbiting particles */}
                {[0, 1, 2, 3, 4, 5].map((particle) => (
                    <motion.div
                        key={`particle-${particle}`}
                        className="absolute w-1 h-1 bg-[#6FEAFF] rounded-full"
                        style={{
                            left: '50%',
                            top: '50%',
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            x: [0, Math.cos((particle * Math.PI * 2) / 6) * 60],
                            y: [0, Math.sin((particle * Math.PI * 2) / 6) * 60],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 2 + particle * 0.1,
                            ease: 'easeOut',
                        }}
                    />
                ))}
            </motion.div>

            {/* Text logo with staggered animation */}
            <motion.div
                className="relative flex-shrink-0 min-w-[250px]"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.8, duration: 0.8, ease: 'easeOut' }}
            >
                <div className="flex items-baseline gap-2">
                    <h1 className="text-4xl font-bold">
                        {'Face'.split('').map((letter, i) => (
                            <motion.span
                                key={`face-${i}`}
                                className="inline-block text-white"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.8 + i * 0.1, duration: 0.3 }}
                            >
                                {letter}
                            </motion.span>
                        ))}
                        <span className="ml-2">
                            {'Secure'.split('').map((letter, i) => (
                                <motion.span
                                    key={`secure-${i}`}
                                    className="inline-block text-[#6FEAFF]"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 2.2 + i * 0.1, duration: 0.3 }}
                                >
                                    {letter}
                                </motion.span>
                            ))}
                        </span>
                    </h1>
                </div>

                <motion.p
                    className="text-[#3DD5E7] text-sm mt-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 2.8, duration: 0.6 }}
                >
                    Advanced Biometric Verification
                </motion.p>

                {/* Animated underline with shimmer */}
                <motion.div
                    className="relative h-0.5 mt-3 overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 3, duration: 0.8 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1FB6C9] via-[#6FEAFF] to-transparent" />
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                        style={{ width: '30%' }}
                        animate={{ x: ['-100%', '400%'] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 3.5, ease: 'linear' }}
                    />
                </motion.div>

                {/* Data stream visualization */}
                {showDataStream && (
                    <div className="absolute -right-24 top-2 flex gap-1">
                        {[0, 1, 2, 3].map((bar) => (
                            <motion.div
                                key={`bar-${bar}`}
                                className="w-1 bg-[#3DD5E7] rounded-full"
                                initial={{ height: 0 }}
                                animate={{
                                    height: [0, Math.random() * 30 + 10, 0],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    delay: bar * 0.2,
                                    ease: 'easeInOut',
                                }}
                            />
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Verification status indicators */}
            <motion.div
                className="flex flex-col gap-3 flex-shrink-0 ml-auto"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 3.2, duration: 0.6 }}
            >
                {[
                    { label: 'Liveness', delay: 3.2 },
                    { label: 'Match', delay: 3.4 },
                    { label: 'Verified', delay: 3.6 },
                ].map((item) => (
                    <motion.div
                        key={item.label}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: item.delay, duration: 0.4 }}
                    >
                        <motion.div
                            className="w-2 h-2 rounded-full bg-[#6FEAFF] flex-shrink-0"
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.5, 1] }}
                            transition={{ delay: item.delay + 0.2, duration: 0.5 }}
                        />
                        <span className="text-xs text-[#3DD5E7] whitespace-nowrap min-w-[60px]">{item.label}</span>
                        <motion.div
                            className="w-12 h-0.5 bg-[#1FB6C9] rounded-full overflow-hidden flex-shrink-0"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: item.delay + 0.3, duration: 0.6 }}
                        >
                            <motion.div
                                className="w-full h-full bg-[#6FEAFF]"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear', delay: item.delay + 0.9 }}
                            />
                        </motion.div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
