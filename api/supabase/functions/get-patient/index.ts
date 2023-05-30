// deno-lint-ignore-file
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.22.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
}

function checkValue(value: string|null|undefined, isId = false) {
  if (value === null || value === "" || value === undefined) {
      return "Unknown";
  } else if (isId) {
      return value.toString();
  } else {
      return value;
  }
}

async function getPatient(supabaseClient: SupabaseClient<any,"public",any>, id: string) {
  const { data, error } = await supabaseClient
    .from('patient')
    .select(`*, patient_address(*), telecom(*)`)
    .eq('id', id);

  if (error) throw error;

  // Map the data to a FHIR-compliant format
  const patientData = data[0];
  const fhirData = {
    resourceType: "Patient",
    id: checkValue(patientData.id, true),
    name: [{ family: checkValue(patientData.last_name), given: [checkValue(patientData.first_name)] }],
    birthDate: checkValue(patientData.birthday),
    address: patientData.patient_address.map((address: { use: any; line: any; city: any; postal_code: any; country: any; }) => ({
      use: checkValue(address.use),
      line: [checkValue(address.line)],
      city: checkValue(address.city),
      postalCode: checkValue(address.postal_code, true),
      country: checkValue(address.country)
    })),
    telecom: patientData.telecom.map((telecom: { system: any; value: any; use: any; }) => ({
      system: checkValue(telecom.system),
      value: checkValue(telecom.value),
      use: checkValue(telecom.use)
    }))
};


  return new Response(JSON.stringify({ fhirData }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
}


async function getGlucoseData(supabaseClient: SupabaseClient, id: string) {
  const { data, error } = await supabaseClient
  .from('diabetes_sugar')
  .select('id, patient_id, created_at, sugar_level')
  .eq('patient_id', id);

  

      // Map the data to a FHIR-compliant format
      const fhirData = data?.map(item => ({
        resourceType: "Observation",
        id: checkValue(item.patient_id, true),  // adjust as per your data structure
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: checkValue("activity"),
                display: checkValue("Activity")
              }
            ]
          }
        ],
        subject: {
          reference: `Patient/${checkValue(item.patient_id, true)}`  
        },
        issued: checkValue(item.created_at),  
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: checkValue("82288-2"),
              display: checkValue("Absolute aerobic exercise intensity")
            }
          ]
        },
        valueQuantity: {
          value: checkValue(item.sugar_level, true),  
          unit: checkValue("min"),
          system: "http://unitsofmeasure.org",
          code: checkValue("min")
        }
      }));
      

  if(error) throw error

  return new Response(JSON.stringify({fhirData}), {
    headers: {...corsHeaders, 'Content-Type': 'application/json'}, 
    status: 200,
  })
}



serve(async (req: Request) => {

  const { url, method } = req

  if(method === 'OPTIONS') {
    return new Response('ok', {headers: corsHeaders})
  }
  try {

    const patientPattern = new URLPattern({ pathname: '/get-patient/:id' });
    const glucosePattern = new URLPattern({ pathname: '/get-patient/:id/glucose' });

    const matchingPathGlucose = glucosePattern.exec(url);
    const matchingPathPatient = patientPattern.exec(url);
    const id = matchingPathGlucose ? matchingPathGlucose.pathname.groups.id : matchingPathPatient ? matchingPathPatient.pathname.groups.id : null;

    if (method === 'POST' || method === 'PUT') {
      const body = await req.json()
    }



    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();


    if (id && method === 'GET' && matchingPathGlucose) {
      return await getGlucoseData(supabaseClient, id);
    } else if (id && method === 'GET' && matchingPathPatient) {
      return await getPatient(supabaseClient, id);
    }
     else {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }
  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
