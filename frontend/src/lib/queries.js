// Insurance queries
export {
  getAllInsurance,
  getInsuranceById,
  createInsurance
} from './insurance'

// Doctor queries
export {
  getAllDoctors,
  getDoctorById,
  getDoctorsWithInsurance,
  getDoctorsByInsurance
} from './doctor'

// Client queries
export {
  getAllClients,
  getClientById,
  getClientsWithInsurance,
  createClient,
  updateClient,
  searchClientsByName
} from './client'

// Triage queries
export {
  getAllTriages,
  getTriageById,
  getTriagesWithDetails,
  getPendingTriages,
  getTriagesByDateRange,
  getTriagesByConfidence,
  createTriage,
  markTriageSentToEpic,
  getClientTriageHistory
} from './triage'

// Triage question queries
export {
  getQuestionsByTriageId,
  createTriageQuestions
} from './triagequestion'