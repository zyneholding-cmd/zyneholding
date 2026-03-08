import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ALLOWED_SALE_FIELDS = ['customer', 'contact', 'address', 'quantity', 'sale_price', 'total', 'paid', 'remaining', 'profit', 'payment_type', 'method', 'status', 'date', 'due_date', 'notes'];
const ALLOWED_PRODUCT_FIELDS = ['name', 'cost_price', 'color', 'image', 'category', 'stock', 'min_stock', 'barcode'];

function whitelist(obj: Record<string, any>, allowed: string[]): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key of allowed) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // User-scoped client that respects RLS
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;

    const { message, action, conversationHistory = [] } = await req.json();
    
    if (!message && !action) {
      throw new Error('Message or action is required');
    }

    // Handle update actions with whitelisted fields and ownership check
    if (action) {
      if (action.type === 'update_sale') {
        const { saleId, updates } = action;
        const safeUpdates = whitelist(updates, ALLOWED_SALE_FIELDS);
        const { error } = await supabase
          .from('sales')
          .update(safeUpdates)
          .eq('id', saleId)
          .eq('user_id', userId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ reply: 'Sale updated successfully!' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (action.type === 'update_product') {
        const { productId, updates } = action;
        const safeUpdates = whitelist(updates, ALLOWED_PRODUCT_FIELDS);
        const { error } = await supabase
          .from('products')
          .update(safeUpdates)
          .eq('id', productId)
          .eq('user_id', userId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ reply: 'Product updated successfully!' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Fetch user's own products and sales (RLS enforced via user-scoped client)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) throw productsError;

    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*');

    if (salesError) throw salesError;

    const contextData = {
      products: products || [],
      sales: sales || [],
      totalProducts: products?.length || 0,
      totalSales: sales?.length || 0,
      totalRevenue: sales?.reduce((sum, s) => sum + Number(s.total), 0) || 0,
      totalProfit: sales?.reduce((sum, s) => sum + Number(s.profit), 0) || 0,
      pendingPayments: sales?.reduce((sum, s) => sum + Number(s.remaining), 0) || 0,
    };

    const systemPrompt = `You are an advanced AI sales assistant with persistent memory for a comprehensive business management system.
    
CAPABILITIES:
- You remember ALL previous conversations and context from this chat session
- Access to real-time data about products (including stock, categories, barcodes), sales, and customers
- Ability to update customer information, sales records, and product details
- Advanced analytics and business insights
- Multi-currency support awareness

Current Data Summary:
- Total Products: ${contextData.totalProducts}
- Total Sales: ${contextData.totalSales}
- Total Revenue: PKR ${contextData.totalRevenue.toLocaleString()}
- Total Profit: PKR ${contextData.totalProfit.toLocaleString()}
- Pending Payments: PKR ${contextData.pendingPayments.toLocaleString()}

Products Data (with stock, category, barcode):
${JSON.stringify(contextData.products, null, 2)}

Sales Data:
${JSON.stringify(contextData.sales, null, 2)}

RESPONSIBILITIES:
1. Customer Management: Track customers, their payment status, contact info, and purchase history
2. Inventory Tracking: Monitor stock levels, alert on low inventory, track product categories
3. Sales Analytics: Analyze revenue, profit margins, payment trends, and performance metrics
4. Business Intelligence: Provide actionable insights and recommendations for scaling
5. Data Updates: When asked, update sales status, customer info, or product details using available actions

CONVERSATION MEMORY:
- You maintain context across all messages in this session
- Reference previous questions and answers naturally
- Build on earlier topics without requiring repetition
- Remember customer names, product details, and specific requests mentioned earlier

Always use EXACT data provided. Format numbers with appropriate currency. Be professional, insightful, and remember: you have full memory of this conversation.`;

    const conversationMessages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: conversationMessages,
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
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in chat-assistant:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
