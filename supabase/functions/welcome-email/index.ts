const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, name, referralCode, referralLink } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Welcome to PartShift</title></head>
<body style="margin:0;padding:0;background:#f7f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:#1a1d24;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
          <h1 style="margin:0;color:#e89400;font-size:28px;font-weight:900;letter-spacing:2px;">PARTSHIFT</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:13px;letter-spacing:1px;">THE AUTOMOTIVE MARKETPLACE</p>
        </td></tr>
        <tr><td style="background:#ffffff;padding:40px;">
          <h2 style="margin:0 0 8px;color:#1a1d24;font-size:22px;font-weight:800;">Welcome aboard, ${name}!</h2>
          <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">You are now part of the fastest-growing marketplace for car parts, tools, and vehicles. Buy, sell, and bid with verified enthusiasts across the country.</p>
          <a href="https://partshift.com" style="display:inline-block;background:#e89400;color:#000;font-weight:800;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;margin-bottom:32px;">Browse Listings</a>
          <hr style="border:none;border-top:1px solid #e4e7ec;margin:0 0 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1d24;border-radius:14px;overflow:hidden;">
            <tr><td style="padding:28px 32px;">
              <p style="margin:0 0 4px;color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:2px;text-transform:uppercase;">Your Referral Code</p>
              <h3 style="margin:0 0 8px;color:#e89400;font-size:26px;font-weight:900;letter-spacing:4px;font-family:monospace;">${referralCode}</h3>
              <p style="margin:0 0 20px;color:rgba(255,255,255,0.65);font-size:14px;line-height:1.5;">Invite friends and <strong style="color:#4ade80;">earn $5 in PartShift credits</strong> for every friend who joins and makes their first purchase.</p>
              <a href="${referralLink}" style="display:inline-block;background:#e89400;color:#000;font-weight:800;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">Share My Referral Link</a>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
            <tr>
              <td style="padding:16px;background:#f7f8fa;border-radius:10px;text-align:center;width:30%;">
                <div style="font-size:24px;margin-bottom:6px;">&#128295;</div>
                <div style="font-size:13px;font-weight:700;color:#1a1d24;">Parts and Tools</div>
                <div style="font-size:12px;color:#6b7280;margin-top:2px;">Fixed-price listings</div>
              </td>
              <td width="12"></td>
              <td style="padding:16px;background:#f7f8fa;border-radius:10px;text-align:center;width:30%;">
                <div style="font-size:24px;margin-bottom:6px;">&#128663;</div>
                <div style="font-size:13px;font-weight:700;color:#1a1d24;">Used Vehicles</div>
                <div style="font-size:12px;color:#6b7280;margin-top:2px;">Verified sellers</div>
              </td>
              <td width="12"></td>
              <td style="padding:16px;background:#f7f8fa;border-radius:10px;text-align:center;width:30%;">
                <div style="font-size:24px;margin-bottom:6px;">&#128296;</div>
                <div style="font-size:13px;font-weight:700;color:#1a1d24;">Live Auctions</div>
                <div style="font-size:12px;color:#6b7280;margin-top:2px;">Bid in real time</div>
              </td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="background:#f7f8fa;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
          <p style="margin:0;color:#9ca3af;font-size:12px;">You received this because you signed up for PartShift. &copy; 2026 PartShift. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PartShift <onboarding@resend.dev>",
        to: email,
        subject: `Welcome to PartShift, ${name}! Here is your referral link`,
        html,
      }),
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.ok ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
