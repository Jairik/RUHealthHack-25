import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';

// Assume symptoms.csv is in the 'public' folder for client-side loading
const CSV_FILE_PATH = '/symptoms.csv'; 

// --- 1. DARK MODE DETECTION HOOK ---
// This hook checks for the presence of the 'dark' class on the document root,
// assuming Tailwind is managing the theme globally.
const useThemeDetector = () => {
    // Check if the HTML element currently has the 'dark' class
    const isDark = window.document.documentElement.classList.contains('dark');
    const [isDarkTheme, setIsDarkTheme] = useState(isDark);

    useEffect(() => {
        // Observer to listen for changes to the 'class' attribute on the HTML element
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.attributeName === 'class') {
                    setIsDarkTheme(document.documentElement.classList.contains('dark'));
                    return;
                }
            }
        });

        // Start observing the HTML element for attribute changes
        observer.observe(document.documentElement, { attributes: true });

        // Initial check and cleanup
        setIsDarkTheme(document.documentElement.classList.contains('dark'));
        return () => observer.disconnect();
    }, []);

    return isDarkTheme;
};

// --- Helper Functions (Dynamic) ---

const getPriorityColor = (priority, isDark) => {
    switch (priority) {
        case 'CRITICAL':
            return { color: 'white', backgroundColor: '#dc3545', fontWeight: 'bold' };
        case 'URGENT':
            // Adjust yellow for better contrast in dark mode
            return { color: isDark ? '#111' : '#212529', backgroundColor: isDark ? '#ffcd56' : '#ffc107', fontWeight: 'bold' };
        case 'ELEVATED':
            return { color: isDark ? '#ccc' : '#212529', backgroundColor: isDark ? '#007bff40' : '#007bff20' };
        case 'STANDARD':
            return { color: isDark ? '#ccc' : '#212529', backgroundColor: isDark ? '#3a3a3a' : '#f8f9fa' };
        default:
            return {};
    }
};

const getSubspecialtyColor = (subspecialty, isDark) => {
    if (isDark) {
        // Darker, subdued colors for card backgrounds
        switch (subspecialty) {
            case 'OB/GYN': return '#1a2b33';
            case 'GYNONC': return '#331a20';
            case 'UROGYN': return '#1a332d';
            case 'MIS': return '#33301a';
            case 'MFM': return '#2c1a33';
            case 'REI': return '#1a331a';
            default: return '#212121';
        }
    }
    // Light Mode (Original Colors)
    switch (subspecialty) {
        case 'OB/GYN': return '#e6f7ff';
        case 'GYNONC': return '#fff0f6';
        case 'UROGYN': return '#eafff7';
        case 'MIS': return '#fffbe6';
        case 'MFM': return '#f6e5ff';
        case 'REI': return '#e8f7e8';
        default: return '#f8f9fa';
    }
};

// --- Component to Configure a Single Rule (RuleCard) ---
const RuleCard = ({ rule, index, onRuleChange, isReadOnly, isDark }) => {
    const PRIORITY_OPTIONS = ['CRITICAL', 'URGENT', 'ELEVATED', 'STANDARD'];
    const SUBSPECIALTY_OPTIONS = ['OB/GYN', 'GYNONC', 'UROGYN', 'MIS', 'MFM', 'REI'];
    
    const currentSubspecialty = rule.subspecialty || rule.division; 

    const handleSubspecialtyChange = (value) => {
        onRuleChange(index, 'subspecialty', value);
    };

    const cardStyleWithColor = {
        ...getDynamicStyle('ruleCardStyle', isDark),
        backgroundColor: getSubspecialtyColor(currentSubspecialty, isDark),
        color: isDark ? '#eee' : getDynamicStyle('ruleCardStyle', isDark).color,
    };
    
    const inputDisabledStyle = { 
        ...getDynamicStyle('inputStyle', isDark), 
        // Disabled background color logic
        backgroundColor: isReadOnly ? (isDark ? '#333' : '#e9ecef') : (isDark ? '#2a2a2a' : 'white'),
        color: isDark ? '#eee' : getDynamicStyle('inputStyle', isDark).color,
    };

    const selectStyleWithColor = {
        ...getDynamicStyle('selectStyle', isDark),
        border: isReadOnly ? getDynamicStyle('selectStyle', isDark).border : `2px solid ${getSubspecialtyColor(currentSubspecialty, isDark)}`,
        backgroundColor: isReadOnly ? (isDark ? '#333' : '#e9ecef') : (isDark ? '#2a2a2a' : 'white'),
        color: isDark ? '#eee' : getDynamicStyle('selectStyle', isDark).color,
    };

    return (
        <div style={cardStyleWithColor}>
            <div style={getDynamicStyle('ruleHeaderStyle', isDark)}>
                <strong>{rule.condition}</strong>
                <span style={{...getDynamicStyle('priorityBadgeStyle', isDark), ...getPriorityColor(rule.scheduling_priority, isDark)}}>
                    {rule.scheduling_priority}
                </span>
            </div>

            <div style={getDynamicStyle('inputGroupStyle', isDark)}>
                <label style={getDynamicStyle('labelStyle', isDark)}>Subspecialty Routing:</label>
                <select
                    value={currentSubspecialty}
                    onChange={(e) => handleSubspecialtyChange(e.target.value)}
                    style={selectStyleWithColor}
                    disabled={isReadOnly}
                >
                    {SUBSPECIALTY_OPTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>
            
            <div style={getDynamicStyle('inputGroupStyle', isDark)}>
                <label style={getDynamicStyle('labelStyle', isDark)}>Scheduling Priority:</label>
                <select
                    value={rule.scheduling_priority}
                    onChange={(e) => onRuleChange(index, 'scheduling_priority', e.target.value)}
                    style={selectStyleWithColor}
                    disabled={isReadOnly}
                >
                    {PRIORITY_OPTIONS.map(p => (
                        <option key={p} value={p}>{p}</option>
                    ))}
                </select>
            </div>

            <div style={getDynamicStyle('inputGroupStyle', isDark)}>
                <label style={getDynamicStyle('labelStyle', isDark)}>Scheduling Timeframe:</label>
                <input
                    type="text"
                    value={rule.scheduling_timeframe}
                    onChange={(e) => onRuleChange(index, 'scheduling_timeframe', e.target.value)}
                    style={inputDisabledStyle}
                    readOnly={isReadOnly}
                />
            </div>

            <div style={getDynamicStyle('inputGroupStyle', isDark)}>
                <label style={getDynamicStyle('labelStyle', isDark)}>Keywords (Editable):</label>
                <textarea
                    value={rule.keywords}
                    onChange={(e) => onRuleChange(index, 'keywords', e.target.value)}
                    style={{ ...inputDisabledStyle, ...getDynamicStyle('textareaStyle', isDark) }}
                    readOnly={isReadOnly}
                />
            </div>
        </div>
    );
};

// --- Filter/Search Bar Component ---
const FilterBar = ({ subspecialtyFilter, searchText, onSubspecialtyChange, onSearchTextChange, isDark }) => {
    const SUBSPECIALTY_OPTIONS = ['All', 'OB/GYN', 'GYNONC', 'UROGYN', 'MIS', 'MFM', 'REI'];

    return (
        <div style={getDynamicStyle('filterBarStyle', isDark)}>
            {/* Subspecialty Filter Dropdown */}
            <div style={{ flex: 1, minWidth: '200px', marginRight: '20px' }}>
                <label style={getDynamicStyle('labelStyle', isDark)}>Filter by Subspecialty:</label>
                <select
                    value={subspecialtyFilter}
                    onChange={(e) => onSubspecialtyChange(e.target.value)}
                    style={getDynamicStyle('selectStyle', isDark)}
                >
                    {SUBSPECIALTY_OPTIONS.map(s => (
                        <option key={s} value={s}>{s === 'All' ? 'View All Subspecialties' : s}</option>
                    ))}
                </select>
            </div>
            
            {/* Free Text Search */}
            <div style={{ flex: 2, minWidth: '300px' }}>
                <label style={getDynamicStyle('labelStyle', isDark)}>Search Condition or Keywords:</label>
                <input
                    type="text"
                    placeholder="e.g., Pap Smear, Fibroid, Infertility"
                    value={searchText}
                    onChange={(e) => onSearchTextChange(e.target.value)}
                    style={getDynamicStyle('inputStyle', isDark)}
                />
            </div>
        </div>
    );
};

// --- Main Rule Configurator Component ---
const RuleConfigurator = ({ rules, onSave, isReadOnly, isDark }) => {
    const [localRules, setLocalRules] = useState(rules);
    const [statusMessage, setStatusMessage] = useState('');
    
    // State for Filtering
    const [subspecialtyFilter, setSubspecialtyFilter] = useState('All');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        setLocalRules(rules);
    }, [rules]);

    const filteredRules = useMemo(() => {
        let currentRules = localRules;
        const searchLower = searchText.toLowerCase().trim();

        if (subspecialtyFilter !== 'All') {
            currentRules = currentRules.filter(rule => 
                (rule.subspecialty || rule.division) === subspecialtyFilter
            );
        }

        if (searchLower) {
            currentRules = currentRules.filter(rule => 
                rule.condition.toLowerCase().includes(searchLower) ||
                (rule.keywords && rule.keywords.toLowerCase().includes(searchLower))
            );
        }
        
        return currentRules;
    }, [localRules, subspecialtyFilter, searchText]);

    const handleRuleChange = useCallback((index, field, value) => {
        setLocalRules(prevRules => 
            prevRules.map((rule, i) => 
                i === index ? { ...rule, [field]: value } : rule
            )
        );
    }, []);

    const handleSave = async () => {
        setStatusMessage('Saving configuration (mock operation)...');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            
            onSave(localRules); 
            setStatusMessage('Configuration saved to UI state! (Persistence requires backend) ✅');
            setTimeout(() => setStatusMessage(''), 5000);

        } catch (error) {
            console.error('Save error:', error);
            setStatusMessage(`Simulated save failed: ${error.message} ❌`);
        }
    };

    const statusStyle = { 
        margin: '10px 0', 
        padding: '10px', 
        borderRadius: '4px', 
        fontWeight: 'bold', 
        // Dynamic status colors
        color: statusMessage.includes('failed') ? (isDark ? '#ff6666' : 'red') : (isDark ? '#66ff66' : 'green'), 
        backgroundColor: statusMessage.includes('failed') ? (isDark ? '#5c1b1b' : '#f8d7da') : (isDark ? '#1c5c1c' : '#d4edda'),
    };

    return (
        <div style={getDynamicStyle('configContainerStyle', isDark)}>

            <FilterBar 
                subspecialtyFilter={subspecialtyFilter}
                searchText={searchText}
                onSubspecialtyChange={setSubspecialtyFilter}
                onSearchTextChange={setSearchText}
                isDark={isDark} // Pass theme prop
            />
            <p style={{ margin: '15px 0 20px', color: isDark ? '#999' : '#6c757d', fontWeight: 'bold' }}>
                {filteredRules.length} rules displayed.
            </p>

            {!isReadOnly && statusMessage && <div style={statusStyle}>{statusMessage}</div>}

            <div style={getDynamicStyle('rulesGridStyle', isDark)}>
                {filteredRules.length > 0 ? (
                    filteredRules.map((rule, index) => (
                        <RuleCard 
                            key={index} 
                            rule={rule} 
                            index={localRules.findIndex(r => r === rule)} 
                            onRuleChange={handleRuleChange} 
                            isReadOnly={isReadOnly} 
                            isDark={isDark} // Pass theme prop
                        />
                    ))
                ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: isDark ? '#888' : '#6c757d', fontSize: '18px' }}>
                        No rules match the current filters or search term.
                    </div>
                )}
            </div>
            
            {!isReadOnly && (
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <button onClick={handleSave} style={getDynamicStyle('saveButtonStyle', isDark)}>
                        💾 Save All Triage Rules Configuration
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Main Page Component (AdminRules) ---
const AdminRules = () => {
    const [rules, setRules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Detect dark mode from the environment
    const isDark = useThemeDetector();
    const [isReadOnly, setIsReadOnly] = useState(false); 
    
    const toggleReadOnly = () => {
        setIsReadOnly(prev => !prev);
    };

    useEffect(() => {
        const fetchRules = async () => {
             try {
                const response = await fetch(CSV_FILE_PATH);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}. Check console and ensure 'symptoms.csv' is in the public directory.`);
                }
                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const cleanData = results.data.filter(
                            row => row.condition && row.division
                        ).map(rule => ({
                            ...rule,
                            subspecialty: rule.division 
                        })); 
                        setRules(cleanData);
                        setIsLoading(false);
                    },
                    error: (err) => {
                        setError(`CSV Parsing Error: ${err.message}`);
                        setIsLoading(false);
                    }
                });
            } catch (e) {
                setError(`Failed to fetch data: ${e.message}. Ensure CSV is in the public folder and path is correct.`);
                setIsLoading(false);
            }
        };

        fetchRules();
    }, []);

    const handleRulesSave = (newRules) => {
        setRules(newRules);
    };

    if (isLoading) return <div style={getDynamicStyle('pageStyle', isDark)}>Loading Triage Rules...</div>;
    
    if (error) return <div style={{ ...getDynamicStyle('pageStyle', isDark), color: '#721c24', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb' }}>Error: {error}</div>;

    return (
        <div style={getDynamicStyle('pageStyle', isDark)}>
            <header style={getDynamicStyle('headerStyle', isDark)}>
                <div style={getDynamicStyle('headerContentStyle', isDark)}>
                    <h1 style={{ color: isDark ? '#eee' : '#343a40' }}>Subspecialist Triage System </h1>
                    <button onClick={toggleReadOnly} style={getDynamicStyle('toggleButtonStyle', isReadOnly, isDark)}>
                        {isReadOnly ? '🔑 Enable Editing' : '🔒 Disable Editing'}
                    </button>
                </div>
            </header>

            <hr style={getDynamicStyle('separatorStyle', isDark)} />

            <RuleConfigurator rules={rules} onSave={handleRulesSave} isReadOnly={isReadOnly} isDark={isDark} />
        </div>
    );
};


// --- 2. DYNAMIC STYLES MAPPING ---

const lightStyles = {
    // Page/Layout
    pageStyle: { backgroundColor: '#fff', color: '#212529', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
    headerStyle: { borderBottom: '4px solid #007bff' },
    separatorStyle: { borderTop: '1px solid #ddd' },

    // Buttons
    toggleButtonStyle: (isReadOnly) => ({ 
        backgroundColor: isReadOnly ? '#ffc107' : '#dc3545', color: 'white' 
    }),
    saveButtonStyle: { backgroundColor: '#28a745', color: 'white' },
    
    // Config/Filter
    configContainerStyle: { backgroundColor: '#f8f9fa' },
    filterBarStyle: { backgroundColor: '#fff', border: '1px solid #ddd' },
    
    // Rule Grid/Card
    ruleCardStyle: { border: '1px solid #e0e0e0', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)', color: '#212529'},
    ruleHeaderStyle: { borderBottom: '1px solid #eee', color: '#343a40' },
    
    // Form Elements
    labelStyle: { color: '#343a40' },
    inputStyle: { border: '1px solid #ced4da', backgroundColor: 'white', color: '#495057' },
    selectStyle: { border: '1px solid #ced4da', backgroundColor: 'white', color: '#495057' },
};

const darkStyles = {
    // Page/Layout
    pageStyle: { backgroundColor: '#121212', color: '#eee', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)' },
    headerStyle: { borderBottom: '4px solid #4a90e2' },
    separatorStyle: { borderTop: '1px solid #333' },

    // Buttons
    toggleButtonStyle: (isReadOnly) => ({ 
        backgroundColor: isReadOnly ? '#ffc107' : '#dc3545', color: 'white' 
    }),
    saveButtonStyle: { backgroundColor: '#4caf50', color: 'white' },
    
    // Config/Filter
    configContainerStyle: { backgroundColor: '#1f1f1f' },
    filterBarStyle: { backgroundColor: '#2a2a2a', border: '1px solid #333' },

    // Rule Grid/Card
    ruleCardStyle: { border: '1px solid #333', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', color: '#eee'},
    ruleHeaderStyle: { borderBottom: '1px solid #333', color: '#eee' },
    
    // Form Elements
    labelStyle: { color: '#bbb' },
    inputStyle: { border: '1px solid #444', backgroundColor: '#2a2a2a', color: '#eee' },
    selectStyle: { border: '1px solid #444', backgroundColor: '#2a2a2a', color: '#eee' },
};

// Base styles that are theme-agnostic (or mostly presentation)
const baseStyles = {
    pageStyle: { fontFamily: 'Roboto, sans-serif', maxWidth: '1400px', margin: '20px auto', padding: '20px', borderRadius: '8px' },
    headerContentStyle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    toggleButtonStyle: (isReadOnly) => ({
        padding: '10px 15px', fontSize: '14px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', transition: 'background-color 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        // Color is handled by theme map
    }),
    saveButtonStyle: { padding: '12px 30px', fontSize: '18px', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background-color 0.2s' },
    rulesGridStyle: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
    ruleCardStyle: { borderRadius: '6px', padding: '15px', transition: 'background-color 0.3s ease' },
    ruleHeaderStyle: { fontSize: '18px', marginBottom: '15px', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    priorityBadgeStyle: { padding: '4px 10px', borderRadius: '4px', fontSize: '12px' },
    inputGroupStyle: { marginBottom: '10px' },
    labelStyle: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' },
    inputStyle: { width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px' },
    selectStyle: { width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', appearance: 'none', cursor: 'pointer' },
    textareaStyle: { minHeight: '60px', resize: 'vertical' },
    configContainerStyle: { padding: '20px', borderRadius: '8px' },
    filterBarStyle: { display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', borderRadius: '6px' },
};

// Function to get the correct merged style based on theme
const getDynamicStyle = (styleName, isDark, isReadOnly = false) => {
    const themeStyles = isDark ? darkStyles : lightStyles;
    
    // Special handling for functional styles like toggleButtonStyle
    if (styleName === 'toggleButtonStyle') {
        const baseFunc = baseStyles[styleName];
        const themeFunc = themeStyles[styleName];
        
        // Merge the result of the function calls
        return {
            ...baseFunc(isReadOnly),
            ...themeFunc(isReadOnly),
        };
    }

    return {
        ...baseStyles[styleName],
        ...themeStyles[styleName],
    };
};

export default AdminRules;