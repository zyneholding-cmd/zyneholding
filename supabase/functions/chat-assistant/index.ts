import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client to fetch data
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all products and sales data
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      console.error('Error fetching products:', productsError);
      throw productsError;
    }

    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*');

    if (salesError) {
      console.error('Error fetching sales:', salesError);
      throw salesError;
    }

    // Prepare context data for AI
    const contextData = {
      products: products || [],
      sales: sales || [],
      totalProducts: products?.length || 0,
      totalSales: sales?.length || 0,
      totalRevenue: sales?.reduce((sum, s) => sum + Number(s.total), 0) || 0,
      totalProfit: sales?.reduce((sum, s) => sum + Number(s.profit), 0) || 0,
      pendingPayments: sales?.reduce((sum, s) => sum + Number(s.remaining), 0) || 0,
    };

    const systemPrompt = `You are a helpful sales dashboard assistant. You have access to real-time data from a sales management system.

Current Data Summary:
- Total Products: ${contextData.totalProducts}
- Total Sales: ${contextData.totalSales}
- Total Revenue: PKR ${contextData.totalRevenue.toLocaleString()}
- Total Profit: PKR ${contextData.totalProfit.toLocaleString()}
- Pending Payments: PKR ${contextData.pendingPayments.toLocaleString()}

Products Data:
${JSON.stringify(contextData.products, null, 2)}

Sales Data:
${JSON.stringify(contextData.sales, null, 2)}

Your job is to:
1. Answer questions about customers, products, and sales
2. Provide insights and analytics
3. Help with customer management
4. Suggest actions based on the data
5. Always use the EXACT data provided above
6. Format numbers with PKR currency
7. Be concise and helpful

When users ask about specific customers, products, or sales, reference the actual data provided.`;

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const aiResponse = await response.json();
    const reply = aiResponse.choices[0].message.content;

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in chat-assistant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
