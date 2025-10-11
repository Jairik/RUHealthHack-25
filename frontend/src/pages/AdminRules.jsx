import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';

// Assume symptoms.csv is in the 'public' folder for client-side loading
const CSV_FILE_PATH = '/symptoms.csv'; 

// --- Helper Functions (Unchanged) ---
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'CRITICAL':
      return { color: 'white', backgroundColor: '#dc3545', fontWeight: 'bold' };
    case 'URGENT':
      return { color: 'white', backgroundColor: '#ffc107', fontWeight: 'bold' };
    case 'ELEVATED':
      return { color: '#212529', backgroundColor: '#007bff20' };
    case 'STANDARD':
      return { color: '#212529', backgroundColor: '#f8f9fa' };
    default:
      return {};
  }
};

const getSubspecialtyColor = (subspecialty) => {
  switch (subspecialty) {
    case 'OB/GYN':
      return '#e6f7ff';
    case 'GYNONC':
      return '#fff0f6';
    case 'UROGYN':
      return '#eafff7';
    case 'MIS':
      return '#fffbe6';
    case 'MFM':
      return '#f6e5ff';
    case 'REI':
      return '#e8f7e8';
    default:
      return '#f8f9fa';
  }
};

// --- Component to Configure a Single Rule (RuleCard - Unchanged Logic) ---
const RuleCard = ({ rule, index, onRuleChange }) => {
  const PRIORITY_OPTIONS = ['CRITICAL', 'URGENT', 'ELEVATED', 'STANDARD'];
  const SUBSPECIALTY_OPTIONS = ['OB/GYN', 'GYNONC', 'UROGYN', 'MIS', 'MFM', 'REI'];
  
  const currentSubspecialty =  rule.division;

  const handleSubspecialtyChange = (value) => {
      onRuleChange(index, 'subspecialty', value);
  };

  const cardStyleWithColor = {
      ...ruleCardStyle,
      backgroundColor: getSubspecialtyColor(currentSubspecialty) 
  };
  
  const selectStyleWithColor = {
      ...selectStyle,
      border: `2px solid ${getSubspecialtyColor(currentSubspecialty)}`,
      backgroundColor: 'white' 
  };

  return (
    <div style={cardStyleWithColor}>
      <div style={ruleHeaderStyle}>
        <strong>{rule.condition}</strong>
        <span style={{...priorityBadgeStyle, ...getPriorityColor(rule.scheduling_priority)}}>
          {rule.scheduling_priority}
        </span>
      </div>

      <div style={inputGroupStyle}>
        <label style={labelStyle}>Subspecialty Routing:</label>
        <select
          value={currentSubspecialty}
          onChange={(e) => handleSubspecialtyChange(e.target.value)}
          style={selectStyleWithColor}
        >
          {SUBSPECIALTY_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      
      <div style={inputGroupStyle}>
        <label style={labelStyle}>Scheduling Priority:</label>
        <select
          value={rule.scheduling_priority}
          onChange={(e) => onRuleChange(index, 'scheduling_priority', e.target.value)}
          style={selectStyle}
        >
          {PRIORITY_OPTIONS.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div style={inputGroupStyle}>
        <label style={labelStyle}>Scheduling Timeframe:</label>
        <input
          type="text"
          value={rule.scheduling_timeframe}
          onChange={(e) => onRuleChange(index, 'scheduling_timeframe', e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={inputGroupStyle}>
        <label style={labelStyle}>Keywords (Editable):</label>
        <textarea
          value={rule.keywords}
          onChange={(e) => onRuleChange(index, 'keywords', e.target.value)}
          style={textareaStyle}
        />
      </div>
    </div>
  );
};

// --- Filter/Search Bar Component (NEW) ---
const FilterBar = ({ subspecialtyFilter, searchText, onSubspecialtyChange, onSearchTextChange }) => {
    const SUBSPECIALTY_OPTIONS = ['All', 'OB/GYN', 'GYNONC', 'UROGYN', 'MIS', 'MFM', 'REI'];

    return (
        <div style={filterBarStyle}>
            {/* Subspecialty Filter Dropdown */}
            <div style={{ flex: 1, minWidth: '200px', marginRight: '20px' }}>
                <label style={labelStyle}>Filter by Subspecialty:</label>
                <select
                    value={subspecialtyFilter}
                    onChange={(e) => onSubspecialtyChange(e.target.value)}
                    style={selectStyle}
                >
                    {SUBSPECIALTY_OPTIONS.map(s => (
                        <option key={s} value={s}>{s === 'All' ? 'View All Subspecialties' : s}</option>
                    ))}
                </select>
            </div>
            
            {/* Free Text Search */}
            <div style={{ flex: 2, minWidth: '300px' }}>
                <label style={labelStyle}>Search Condition or Keywords:</label>
                <input
                    type="text"
                    placeholder="e.g., Pap Smear, Fibroid, Infertility"
                    value={searchText}
                    onChange={(e) => onSearchTextChange(e.target.value)}
                    style={inputStyle}
                />
            </div>
        </div>
    );
};

// --- Main Rule Configurator Component (UPDATED with Filtering Logic) ---
const RuleConfigurator = ({ rules, onSave }) => {
  const [localRules, setLocalRules] = useState(rules);
  const [statusMessage, setStatusMessage] = useState('');
  
  // State for Filtering
  const [subspecialtyFilter, setSubspecialtyFilter] = useState('All');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setLocalRules(rules);
  }, [rules]);

  // Logic to filter the rules based on state (Memoized for performance)
  const filteredRules = useMemo(() => {
    let currentRules = localRules;
    const searchLower = searchText.toLowerCase().trim();

    // 1. Filter by Subspecialty
    if (subspecialtyFilter !== 'All') {
      currentRules = currentRules.filter(rule => 
        (rule.division) === subspecialtyFilter
      );
    }

    // 2. Filter by Free Text Search (Condition or Keywords)
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

  return (
    <div style={configContainerStyle}>

      <FilterBar 
        subspecialtyFilter={subspecialtyFilter}
        searchText={searchText}
        onSubspecialtyChange={setSubspecialtyFilter}
        onSearchTextChange={setSearchText}
      />
      <p style={{ margin: '15px 0 20px', color: '#6c757d', fontWeight: 'bold' }}>
          {filteredRules.length} rules displayed.
      </p>

      {statusMessage && <div style={{ margin: '10px 0', padding: '10px', borderRadius: '4px', fontWeight: 'bold', color: statusMessage.includes('failed') ? 'red' : 'green', backgroundColor: statusMessage.includes('failed') ? '#f8d7da' : '#d4edda' }}>{statusMessage}</div>}

      <div style={rulesGridStyle}>
        {filteredRules.length > 0 ? (
            filteredRules.map((rule, index) => (
              <RuleCard 
                key={index} 
                // Pass the original index for accurate state update in handleRuleChange
                rule={rule} 
                index={localRules.findIndex(r => r === rule)} 
                onRuleChange={handleRuleChange} 
              />
            ))
        ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#6c757d', fontSize: '18px' }}>
                No rules match the current filters or search term.
            </div>
        )}
      </div>
      
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={handleSave} style={saveButtonStyle}>
          💾 Save All Triage Rules Configuration
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component (AdminRules - Unchanged logic) ---
const AdminRules = () => {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
                // Ensure the dynamic subspecialty field is available for updates
                subspecialty: rule.subspecialty || rule.division 
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

  if (isLoading) return <div style={pageStyle}>Loading Triage Rules...</div>;
  if (error) return <div style={{ ...pageStyle, color: '#721c24', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb' }}>Error: {error}</div>;

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h3>Subspecialist Triage Rules System</h3>
      </header>

      <hr style={separatorStyle} />

      {/* --- Rule Configurability with new Filter Bar --- */}
      <RuleConfigurator rules={rules} onSave={handleRulesSave} />
    </div>
  );
};


// --- STYLES (Added filter bar styles) ---

const pageStyle = {
  fontFamily: 'Roboto, sans-serif',
  maxWidth: '1400px',
  margin: '20px auto',
  padding: '20px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
};

const headerStyle = {
  paddingBottom: '10px',
  borderBottom: '4px solid #007bff',
  marginBottom: '30px',
};

const separatorStyle = {
  border: '0',
  borderTop: '1px solid #ddd',
  margin: '40px 0',
};

const configContainerStyle = {
  padding: '20px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
};

const filterBarStyle = {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    border: '1px solid #ddd',
};

const rulesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  gap: '20px',
};

const ruleCardStyle = {
  border: '1px solid #e0e0e0',
  borderRadius: '6px',
  padding: '15px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  transition: 'background-color 0.3s ease',
};

const ruleHeaderStyle = {
  fontSize: '18px',
  marginBottom: '15px',
  paddingBottom: '10px',
  borderBottom: '1px solid #eee',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const priorityBadgeStyle = {
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '12px',
};

const inputGroupStyle = {
  marginBottom: '10px',
};

const labelStyle = {
  display: 'block',
  marginBottom: '5px',
  fontWeight: 'bold',
  fontSize: '14px',
  color: '#343a40',
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  boxSizing: 'border-box',
  border: '1px solid #ced4da',
  borderRadius: '4px',
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  cursor: 'pointer',
};

const textareaStyle = {
  ...inputStyle,
  minHeight: '60px',
  resize: 'vertical',
};

const saveButtonStyle = {
  padding: '12px 30px',
  fontSize: '18px',
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
};

export default AdminRules;