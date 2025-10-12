import React, { createContext, useState } from 'react';

export const TriageContext = createContext();

// Initial state for the triage context
const initialTriageData = {
    /* Dictionary of patient info*/
    patientInfo: {
        firstName: '',
        lastName: '',
        dob: '',
        healthHistory: '',
    },
    /* List of questions and answers */
    prevQA: [{}],
    /* List of recommended subspecialists and their confidence levels */
    subspecialists: [{}],
    /* List of suggested conditions and their confidence levels */
    conditions: [{}],
    /* List of recommended doctors and their confidence levels */
    doctorMatches: [{}],
    /* Boolean for risk-risk */
    highRisk: false,  // Instantiate with false
};

// Exporting the actual provider context
export const TriageProvider = ({ children }) => {
    const [triageData, setTriageData] = useState(null);

    // Return provider above everything else
    return (
        <TriageContext.Provider value={{ triageData, setTriageData }}>
            {children}
        </TriageContext.Provider>
    );
};

// Simple hook to use the context
export const useTriageContext = () => React.useContext(TriageContext);