import { supabase } from './supabase'

export async function getAllTriages() {
  const { data, error } = await supabase
    .from('triage')
    .select('*')
    .order('date_time', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getTriageById(triageId) {
  const { data, error } = await supabase
    .from('triage')
    .select(`
      *,
      client:client_id (
        client_id,
        client_fn,
        client_ln,
        client_dob,
        insurance:ins_pol_id (
          ins_pol
        )
      ),
      doctor1:doc_id1 (
        doc_fn,
        doc_ln
      ),
      doctor2:doc_id2 (
        doc_fn,
        doc_ln
      ),
      doctor3:doc_id3 (
        doc_fn,
        doc_ln
      ),
      triage_question (
        triage_question_id,
        triage_question,
        triage_answer
      )
    `)
    .eq('triage_id', triageId)
    .single()
  
  if (error) throw error
  return data
}

export async function getTriagesWithDetails() {
  const { data, error } = await supabase
    .from('triage')
    .select(`
      *,
      client:client_id (
        client_fn,
        client_ln
      ),
      doctor1:doc_id1 (
        doc_fn,
        doc_ln
      )
    `)
    .order('date_time', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getPendingTriages() {
  const { data, error } = await supabase
    .from('triage')
    .select(`
      *,
      client:client_id (
        client_fn,
        client_ln
      )
    `)
    .eq('sent_to_epic', false)
    .order('date_time', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getTriagesByDateRange(startDate, endDate) {
  const { data, error } = await supabase
    .from('triage')
    .select('*')
    .gte('date_time', startDate)
    .lte('date_time', endDate)
    .order('date_time', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getTriagesByConfidence(confidenceType) {
  const { data, error } = await supabase
    .from('triage')
    .select(`
      *,
      client:client_id (
        client_fn,
        client_ln
      )
    `)
    .eq(confidenceType, 1)
  
  if (error) throw error
  return data
}

export async function createTriage(triageData) {
  const { data, error } = await supabase
    .from('triage')
    .insert([{
      agent_id: triageData.agentId,
      client_id: triageData.clientId,
      re_conf: triageData.reConf || 0,
      mfm_conf: triageData.mfmConf || 0,
      uro_conf: triageData.uroConf || 0,
      gob_conf: triageData.gobConf || 0,
      mis_conf: triageData.misConf || 0,
      go_conf: triageData.goConf || 0,
      doc_id1: triageData.docId1,
      doc_id2: triageData.docId2,
      doc_id3: triageData.docId3,
      agent_notes: triageData.notes
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export async function markTriageSentToEpic(triageId) {
  const { data, error } = await supabase
    .from('triage')
    .update({
      sent_to_epic: true,
      epic_sent_date: new Date().toISOString()
    })
    .eq('triage_id', triageId)
    .select()
  
  if (error) throw error
  return data[0]
}

export async function getClientTriageHistory(clientId) {
  const { data, error } = await supabase
    .from('triage')
    .select(`
      *,
      client:client_id (
        client_fn,
        client_ln,
        client_dob,
        insurance:ins_pol_id (
          ins_pol
        )
      ),
      doctor1:doc_id1 (
        doc_fn,
        doc_ln
      ),
      doctor2:doc_id2 (
        doc_fn,
        doc_ln
      ),
      doctor3:doc_id3 (
        doc_fn,
        doc_ln
      ),
      triage_question (
        triage_question,
        triage_answer
      )
    `)
    .eq('client_id', clientId)
    .order('date_time', { ascending: false })
  
  if (error) throw error
  return data
}