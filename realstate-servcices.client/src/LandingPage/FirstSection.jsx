// FirstSection.jsx - REFACTORED: Merged with DiscoverPlace design (Filter & Grid Removed)
import React, { useState, useEffect, useRef } from 'react';
import { Button, Row, Col, Typography, Space, Spin, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';


const { Title, Paragraph } = Typography;

// Filter options for the dropdown
const FILTER_OPTIONS = ["City", "Zip Code", "Neighborhood", "Province"];

const FirstSection = () => {
    const navigate = useNavigate();

    // Search state
    const [query, setQuery] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('City');
    const [focused, setFocused] = useState(false);
    const dropdownRef = useRef(null);


    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

 



    const handleSearch = () => {
        if (!query.trim()) {
            message.info('Please enter a search term');
            return;
        }

        navigate('/properties', {
            state: {
                filters: {
                    searchText: query,
                    searchBy: selectedFilter
                }
            }
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Source+Code+Pro:wght@400;500&display=swap');

                .firstsection-root {
                    min-height: 30vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
                    padding: 3rem 2rem;
                    position: relative;
                    overflow: hidden;
                }

                .firstsection-title {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-weight: 800;
                    font-size: clamp(2rem, 5.5vw, 3.6rem);
                    color: #1b3d9e;
                    text-align: center;
                    letter-spacing: -0.5px;
                    line-height: 1.2;
                    margin-bottom: 1rem;
                    animation: fadeDown 0.6s ease both;
                }

                .firstsection-subtitle {
                    font-family: 'Source Code Pro', 'Courier New', monospace;
                    font-size: 0.9rem;
                    font-weight: 400;
                    color: #a89cc8;
                    letter-spacing: 0.06em;
                    text-align: center;
                    animation: fadeDown 0.6s 0.1s ease both;
                    opacity: 0;
                    animation-fill-mode: forwards;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .firstsection-divider {
                    width: 260px;
                    height: 1px;
                    background: linear-gradient(to right, transparent, #d4d0e8, transparent);
                    margin: 1.4rem 0 2.2rem;
                    animation: fadeIn 0.6s 0.2s ease both;
                    opacity: 0;
                    animation-fill-mode: forwards;
                }

                /* Search Bar */
                .searchbar-container {
                    display: flex;
                    align-items: stretch;
                    height: 56px;
                    animation: fadeUp 0.6s 0.3s ease both;
                    opacity: 0;
                    animation-fill-mode: forwards;
                    position: relative;
                    margin-bottom: 2rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    border-radius: 12px;
                }

                .searchbar-container.focused .search-input,
                .searchbar-container.focused .dropdown-btn,
                .searchbar-container.focused .search-btn {
                    border-color: #1b3d9e;
                }

                /* Dropdown */
                .dropdown-wrap {
                    position: relative;
                }

                .dropdown-btn {
                    width: 60px;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1.5px solid #c5cad8;
                    border-right: none;
                    border-radius: 12px 0 0 12px;
                    background: #fff;
                    cursor: pointer;
                    color: #6b7a9b;
                    font-size: 0.75rem;
                    transition: all 0.2s;
                    user-select: none;
                }

                .dropdown-btn:hover {
                    background: #f4f6fb;
                }

                .dropdown-arrow {
                    display: inline-block;
                    transition: transform 0.2s;
                }

                .dropdown-btn.open .dropdown-arrow {
                    transform: rotate(180deg);
                }

                .dropdown-menu {
                    position: absolute;
                    top: calc(100% + 8px);
                    left: 0;
                    min-width: 150px;
                    background: #fff;
                    border: 1.5px solid #c5cad8;
                    border-radius: 12px;
                    list-style: none;
                    padding: 8px 0;
                    z-index: 20;
                    box-shadow: 0 8px 24px rgba(27, 61, 158, 0.12);
                    animation: menuFade 0.15s ease;
                }

                @keyframes menuFade {
                    from { opacity: 0; transform: translateY(-6px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .dropdown-menu li {
                    padding: 10px 18px;
                    font-family: 'Source Code Pro', monospace;
                    font-size: 0.85rem;
                    color: #3a4566;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .dropdown-menu li:hover {
                    background: #eef2fb;
                    color: #1b3d9e;
                }

                .dropdown-menu li.active {
                    color: #1b3d9e;
                    font-weight: 600;
                    background: #eef2fb;
                }

                /* Input */
                .search-input {
                    width: clamp(260px, 40vw, 400px);
                    height: 100%;
                    border: 1.5px solid #c5cad8;
                    border-right: none;
                    outline: none;
                    padding: 0 20px;
                    font-family: 'Source Code Pro', monospace;
                    font-size: 0.95rem;
                    color: #2a3455;
                    background: #fff;
                    transition: border-color 0.2s;
                    letter-spacing: 0.02em;
                }

                .search-input::placeholder {
                    color: #b0b8cc;
                    letter-spacing: 0.04em;
                }

                /* Search Button */
                .search-btn {
                    width: 60px;
                    height: 100%;
                    border: 1.5px solid #1b3d9e;
                    border-radius: 0 12px 12px 0;
                    background: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .search-btn:hover {
                    background: #1b3d9e;
                }

                .search-btn:hover svg {
                    stroke: white;
                }

                .search-btn svg {
                    width: 20px;
                    height: 20px;
                    stroke: #1b3d9e;
                    fill: none;
                    stroke-width: 2;
                    transition: stroke 0.2s;
                }

                /* Stats */
                .stat-number {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 2rem;
                    font-weight: 800;
                    color: #1b3d9e;
                    margin: 0;
                    line-height: 1.2;
                }

                .stat-label {
                    font-family: 'Source Code Pro', monospace;
                    font-size: 0.8rem;
                    color: #a89cc8;
                    letter-spacing: 0.04em;
                    margin: 0;
                }

                @keyframes fadeDown {
                    from { opacity: 0; transform: translateY(-16px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .firstsection-root {
                        padding: 2rem 1rem;
                    }
                    .searchbar-container {
                        flex-wrap: wrap;
                        height: auto;
                        gap: 10px;
                        background: transparent;
                        box-shadow: none;
                    }
                    .dropdown-wrap {
                        flex: 1;
                    }
                    .dropdown-btn {
                        width: 50px;
                        border-radius: 12px;
                        border-right: 1.5px solid #c5cad8;
                    }
                    .search-input {
                        flex: 2;
                        border-radius: 12px;
                        border-right: 1.5px solid #c5cad8;
                    }
                    .search-btn {
                        border-radius: 12px;
                        flex-shrink: 0;
                    }
                }
            `}</style>

            <div className="firstsection-root">
                <h1 className="firstsection-title">Discover Your Perfect Place</h1>
                <p className="firstsection-subtitle">
                    Discover the perfect property across the beautiful islands — search by city, zip code, or neighborhood.
                </p>
                <div className="firstsection-divider" />

                {/* Search Bar */}
                <div className={`searchbar-container ${focused ? 'focused' : ''}`}>
                    {/* Dropdown */}
                    <div className="dropdown-wrap" ref={dropdownRef}>
                        <button
                            className={`dropdown-btn ${dropdownOpen ? 'open' : ''}`}
                            onClick={() => setDropdownOpen(prev => !prev)}
                            aria-label="Select filter type"
                        >
                            <span className="dropdown-arrow">▾</span>
                        </button>

                        {dropdownOpen && (
                            <ul className="dropdown-menu" role="listbox">
                                {FILTER_OPTIONS.map(opt => (
                                    <li
                                        key={opt}
                                        className={opt === selectedFilter ? 'active' : ''}
                                        role="option"
                                        aria-selected={opt === selectedFilter}
                                        onClick={() => {
                                            setSelectedFilter(opt);
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        {opt}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Input */}
                    <input
                        className="search-input"
                        type="text"
                        placeholder={`Search by ${selectedFilter.toLowerCase()}...`}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        onKeyDown={handleKeyPress}
                        aria-label="Search properties"
                    />

                    {/* Search button */}
                    <button className="search-btn" onClick={handleSearch} aria-label="Submit search">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="7" />
                            <line x1="16.5" y1="16.5" x2="22" y2="22" />
                        </svg>
                    </button>
                </div>

           
            </div>
        </>
    );
};

export default FirstSection;