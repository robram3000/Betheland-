import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Typography, Space } from 'antd';

const { Title, Paragraph } = Typography;

// ========== CAROUSEL DATA & CONFIG ==========
const ITEMS = [
    { id: 0, title: "Buy a Home", subtitle: ["Search homes for sale", "in your neighborhood"], img: "https://cdn-icons-png.flaticon.com/256/5547/5547488.png" },
    { id: 1, title: "Rent a Home", subtitle: ["Find apartments and", "condos for rent"], img: "https://cdn-icons-png.flaticon.com/256/5547/5547552.png" },
    { id: 2, title: "Sell your Home", subtitle: ["Get a free estimate", "connect with agents"], img: "https://cdn-icons-png.flaticon.com/256/5547/5547499.png" },
    { id: 3, title: "New Listings", subtitle: ["Discover fresh properties", "added this week"], img: "https://cdn-icons-png.flaticon.com/256/5547/5547564.png" },
    { id: 4, title: "Open Houses", subtitle: ["Schedule visits and", "explore in person"], img: "https://cdn-icons-png.flaticon.com/256/8916/8916209.png" },
];

const N = ITEMS.length;
const W = 700;
const H = 340;
const ANIM_DUR = 500;
const AUTOPLAY_MS = 2800;
const SLOT_T = [0, 0.25, 0.5, 0.75, 1];
const STEP = 0.25;

// Reversed arc (U-shape): ends high, middle low
const P0 = { x: 40, y: 60 };
const P4 = { x: 660, y: 60 };
const CTRL = { x: 350, y: 300 };

// ========== HELPER FUNCTIONS ==========
function bezier(t) {
    const mt = 1 - t;
    return {
        x: mt * mt * P0.x + 2 * mt * t * CTRL.x + t * t * P4.x,
        y: mt * mt * P0.y + 2 * mt * t * CTRL.y + t * t * P4.y,
    };
}

function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function getCardProps(t) {
    const dist = Math.abs(t - 0.5);
    const scale = Math.max(0.28, 1 - dist * 1.44);
    const opacity = Math.max(0.4, 1 - dist * 0.85);
    const isCenter = dist < 0.08;
    const circleSize = 60 + scale * 160;
    const innerSize = circleSize * 0.78;
    const imgSize = circleSize * 0.38;
    const pos = bezier(Math.max(0, Math.min(1, t)));
    return { scale, opacity, isCenter, circleSize, innerSize, imgSize, pos };
}

function makeCards(centerIdx) {
    return SLOT_T.map((t, slot) => ({
        itemIdx: (centerIdx - 2 + slot + N * 10) % N,
        t,
    }));
}

// ========== SKELETON & CAROUSEL CARD COMPONENTS ==========
const SkeletonCard = ({ t }) => {
    const { scale, opacity, circleSize, pos } = getCardProps(t);
    const pctX = (pos.x / W) * 100;
    const pctY = (pos.y / H) * 100;
    const shimmer = {
        background: "linear-gradient(90deg,#dde1f5 25%,#c3c8ef 50%,#dde1f5 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
        borderRadius: 8,
    };
    return (
        <div style={{
            position: "absolute",
            left: `${pctX}%`,
            top: `${pctY}%`,
            transform: `translate(-50%,-50%) scale(${scale})`,
            opacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            width: 130,
            pointerEvents: "none"
        }}>
            <div style={{ ...shimmer, width: circleSize, height: circleSize, borderRadius: "50%" }} />
            <div style={{ ...shimmer, width: 70, height: 10 }} />
            <div style={{ ...shimmer, width: 90, height: 8 }} />
        </div>
    );
};

const CarouselCard = ({ itemIdx, t, loaded }) => {
    const item = ITEMS[itemIdx];
    const { scale, opacity, isCenter, circleSize, innerSize, imgSize, pos } = getCardProps(t);
    const pctX = (pos.x / W) * 100;
    const pctY = (pos.y / H) * 100;

    if (!loaded || !item) return <SkeletonCard t={t} />;

    return (
        <div style={{
            position: "absolute",
            left: `${pctX}%`,
            top: `${pctY}%`,
            transform: `translate(-50%,-50%) scale(${scale})`,
            opacity,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            width: 180,
            pointerEvents: "auto",
            transition: "opacity 0.15s",
            willChange: "transform, opacity"
        }}>
            {isCenter && (
                <div style={{
                    fontWeight: 700,
                    fontSize: 18,
                    color: "#4F5BD5",
                    whiteSpace: "nowrap",
                    marginBottom: 4,
                    textShadow: "0 1px 2px rgba(0,0,0,0.02)"
                }}>
                    {item.title}
                </div>
            )}
            <div style={{
                width: circleSize,
                height: circleSize,
                borderRadius: "50%",
                background: "#b0b8d3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: isCenter ? "0 8px 20px rgba(79,91,213,0.3)" : "0 2px 8px rgba(0,0,0,0.05)",
                transition: "box-shadow 0.2s"
            }}>
                <div style={{
                    width: innerSize,
                    height: innerSize,
                    borderRadius: "50%",
                    background: "#4F5BD5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}>
                    <img src={item.img} width={imgSize} height={imgSize} alt={item.title} style={{ display: "block" }} />
                </div>
            </div>
            {!isCenter && (
                <div style={{
                    fontWeight: 700,
                    fontSize: Math.max(10, 12 * scale),
                    color: "#4F5BD5",
                    whiteSpace: "nowrap",
                    marginTop: 3
                }}>
                    {item.title}
                </div>
            )}
            <div style={{
                fontSize: Math.max(11, 13 * scale),
                color: "#444",
                textAlign: "center",
                lineHeight: 1.45,
                marginTop: 4,
                fontWeight: 500
            }}>
                {item.subtitle.map((line, i) => <div key={i}>{line}</div>)}
            </div>
        </div>
    );
};

// ========== MAIN CAROUSEL COMPONENT ==========
const RealEstateCarousel = () => {
    const [current, setCurrent] = useState(2);
    const [cards, setCards] = useState(() => makeCards(2));
    const [loaded, setLoaded] = useState({});
    const animating = useRef(false);
    const currentRef = useRef(2);
    const cardsRef = useRef(cards);
    const autoPlayRef = useRef(null);

    useEffect(() => { currentRef.current = current; }, [current]);
    useEffect(() => { cardsRef.current = cards; }, [cards]);

    // Preload images
    useEffect(() => {
        ITEMS.forEach((item) => {
            if (!loaded[item.id]) {
                const img = new Image();
                img.onload = () => setLoaded(prev => ({ ...prev, [item.id]: true }));
                img.src = item.img;
            }
        });
    }, []);

    const goTo = useCallback((dir) => {
        if (animating.current) return;
        animating.current = true;

        const prevCards = cardsRef.current;
        const prevCurrent = currentRef.current;
        const newCurrent = (prevCurrent + dir + N) % N;
        const targetCards = makeCards(newCurrent);

        let animCards;

        if (dir === 1) {
            animCards = [
                { itemIdx: prevCards[0].itemIdx, fromT: SLOT_T[0], toT: -STEP },
                { itemIdx: prevCards[1].itemIdx, fromT: SLOT_T[1], toT: SLOT_T[0] },
                { itemIdx: prevCards[2].itemIdx, fromT: SLOT_T[2], toT: SLOT_T[1] },
                { itemIdx: prevCards[3].itemIdx, fromT: SLOT_T[3], toT: SLOT_T[2] },
                { itemIdx: prevCards[4].itemIdx, fromT: SLOT_T[4], toT: SLOT_T[3] },
                { itemIdx: targetCards[4].itemIdx, fromT: 1 + STEP, toT: SLOT_T[4] },
            ];
        } else {
            animCards = [
                { itemIdx: targetCards[0].itemIdx, fromT: -STEP, toT: SLOT_T[0] },
                { itemIdx: prevCards[0].itemIdx, fromT: SLOT_T[0], toT: SLOT_T[1] },
                { itemIdx: prevCards[1].itemIdx, fromT: SLOT_T[1], toT: SLOT_T[2] },
                { itemIdx: prevCards[2].itemIdx, fromT: SLOT_T[2], toT: SLOT_T[3] },
                { itemIdx: prevCards[3].itemIdx, fromT: SLOT_T[3], toT: SLOT_T[4] },
                { itemIdx: prevCards[4].itemIdx, fromT: SLOT_T[4], toT: 1 + STEP },
            ];
        }

        let animStart = null;
        let frameId;

        function animateFrame(ts) {
            if (!animStart) animStart = ts;
            const elapsed = ts - animStart;
            const ep = easeInOut(Math.min(elapsed / ANIM_DUR, 1));
            const animated = animCards.map(c => ({
                itemIdx: c.itemIdx,
                t: c.fromT + (c.toT - c.fromT) * ep,
            }));
            setCards(animated);
            if (ep < 1) {
                frameId = requestAnimationFrame(animateFrame);
            } else {
                setCards(targetCards);
                setCurrent(newCurrent);
                animating.current = false;
                cancelAnimationFrame(frameId);
            }
        }

        frameId = requestAnimationFrame(animateFrame);
    }, []);

    // Autoplay with cleanup
    useEffect(() => {
        autoPlayRef.current = setInterval(() => goTo(1), AUTOPLAY_MS);
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [goTo]);

    // Pause autoplay on hover (optional, elegant)
    const handleMouseEnter = () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
    const handleMouseLeave = () => {
        autoPlayRef.current = setInterval(() => goTo(1), AUTOPLAY_MS);
    };

    const sortedCards = [...cards].sort((a, b) => Math.abs(a.t - 0.5) - Math.abs(b.t - 0.5)).reverse();

    return (
        <div
            style={{ fontFamily: "'Inter', sans-serif", userSelect: "none", width: "100%" }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <style>{`
                @keyframes shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
            <div style={{ position: "relative", width: "100%", maxWidth: 900, margin: "0 auto" }}>
                {/* SVG arc line */}
                <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
                    <path d={`M${P0.x} ${P0.y} Q${CTRL.x} ${CTRL.y} ${P4.x} ${P4.y}`} fill="none" stroke="#d8c4c2" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" opacity="0.7" />
                </svg>

                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
                    {sortedCards.map((card) => (
                        <CarouselCard
                            key={`${card.itemIdx}-${card.t.toFixed(3)}`}
                            itemIdx={card.itemIdx}
                            t={card.t}
                            loaded={!!loaded[ITEMS[card.itemIdx]?.id]}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation dots + arrows */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 30, marginBottom: 8 }}>
                <button
                    onClick={() => goTo(-1)}
                    style={{
                        background: "rgba(79,91,213,0.1)",
                        border: "none",
                        cursor: "pointer",
                        color: "#4F5BD5",
                        fontSize: 20,
                        padding: "8px 12px",
                        borderRadius: 40,
                        transition: "all 0.2s",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    aria-label="Previous"
                >◀</button>

                {ITEMS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            const diff = i - current;
                            if (diff !== 0) goTo(diff > 0 ? 1 : -1);
                        }}
                        style={{
                            width: i === current ? 28 : 10,
                            height: 10,
                            borderRadius: 6,
                            background: i === current ? "#4F5BD5" : "#c7cbf0",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            transition: "all 0.25s ease",
                            boxShadow: i === current ? "0 1px 4px rgba(79,91,213,0.3)" : "none"
                        }}
                        aria-label={`Go to ${ITEMS[i].title}`}
                    />
                ))}

                <button
                    onClick={() => goTo(1)}
                    style={{
                        background: "rgba(79,91,213,0.1)",
                        border: "none",
                        cursor: "pointer",
                        color: "#4F5BD5",
                        fontSize: 20,
                        padding: "8px 12px",
                        borderRadius: 40,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                    aria-label="Next"
                >▶</button>
            </div>
        </div>
    );
};

// ========== SECOND SECTION (Carousel Only) ==========
const SecondSection = () => {
    return (
        <section
            style={{
                padding: '60px 24px 80px',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #fefefe 0%, #f4f7fc 100%)'
            }}
        >
            {/* Background subtle pattern */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `radial-gradient(circle at 20% 30%, rgba(0, 21, 41, 0.02) 0%, transparent 50%),
                                    radial-gradient(circle at 80% 70%, rgba(0, 21, 41, 0.02) 0%, transparent 50%)`,
                    zIndex: 0
                }}
            />

            <div style={{
                maxWidth: '1280px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 2
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <Title level={2} style={{ color: '#001529', fontSize: '2.8rem', marginBottom: 0, fontWeight: 700 }}>
                        Explore Property Journeys
                    </Title>
                    <Paragraph style={{
                        fontSize: '1rem',
                        color: '#555',
                        maxWidth: '650px',
                        margin: '12px auto 0',
                        lineHeight: 1.5
                    }}>
                        Swipe through our interactive catalog — buy, rent, or sell with confidence
                    </Paragraph>
                </div>

                {/* Carousel Component */}
                <RealEstateCarousel />

            </div>
        </section>
    );
};

export default SecondSection;