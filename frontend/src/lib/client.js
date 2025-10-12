import { supabase } from './supabase'

export async function getAllClients() {
  const { data, error } = await supabase
    .from('client')
    .select('*')
  
  if (error) throw error
  return data
}

export async function getClientById(clientId) {
  const { data, error } = await supabase
    .from('client')
    .select('*')
    .eq('client_id', clientId)
    .single()
  
  if (error) throw error
  return data
}

export async function getClientsWithInsurance() {
  const { data, error } = await supabase
    .from('client')
    .select(`
      *,
      insurance:ins_pol_id (
        ins_id,
        ins_pol
      )
    `)
  
  if (error) throw error
  return data
}

export async function createClient(clientData) {
  const { data, error } = await supabase
    .from('client')
    .insert([{
      client_fn: clientData.firstName,
      client_ln: clientData.lastName,
      client_dob: clientData.dob,
      ins_pol_id: clientData.insuranceId
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function updateClient(clientId, updates) {
  const { data, error } = await supabase
    .from('client')
    .update(updates)
    .eq('client_id', clientId)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function searchClientsByName(searchTerm) {
  const { data, error } = await supabase
    .from('client')
    .select(`
      *,
      insurance:ins_pol_id (
        ins_pol
      )
    `)
    .or(`client_fn.ilike.%${searchTerm}%,client_ln.ilike.%${searchTerm}%`)
  
  if (error) throw error
  return data
}
