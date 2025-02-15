import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient' // adjust the path as needed

export function usePlanTiers() {
  const [planTiers, setPlanTiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPlanTiers() {
      setLoading(true)
      const { data, error } = await supabase.from('plan_tiers').select('*')
      
      if (error) {
        setError(error)
      } else if (data) {
        // Transform the fetched data into the desired format
        const formattedData = data.map((tier) => ({
          key: tier.key, // assumes your table has a column named "key"
          label: tier.label, // assumes your table has a "label" column
          description: tier.description, // assumes your table has a "description" column
          price: tier.price, // assumes your table has a "price" column
        }))
        setPlanTiers(formattedData)
      }
      
      setLoading(false)
    }

    fetchPlanTiers()
  }, [])

  return { planTiers, loading, error }
}

export default usePlanTiers;