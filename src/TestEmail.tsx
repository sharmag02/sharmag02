import { supabase } from "./shared/lib/supabase"; 
// adjust path if your supabase.ts is elsewhere

export default function TestEmail() {
  const testEmail = async () => {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: {
        to: "gaurav2002ku@gmail.com", // 🔴 PUT YOUR EMAIL HERE
        subject: "Test Email 🚀",
        content: `
          <p>This email is sent using Supabase + Gmail + Nodemailer.</p>
        `,
      },
    });

    if (error) {
      console.error(error);
      alert("Email failed ❌");
    } else {
      console.log(data);
      alert("Email sent successfully ✅");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Test Supabase Email</h2>
      <button
        onClick={testEmail}
        style={{
          padding: "10px 16px",
          background: "green",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Send Test Email
      </button>
    </div>
  );
}
