import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// HOME ROUTE
app.get("/", (req, res) => {
  res.send("🚀 OTP Server is running...");
});

// -------------------------
// SEND OTP
// -------------------------
app.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: "Phone is required" });
    }

    console.log("📩 Sending OTP to:", phone);

    const url = `https://2factor.in/API/V1/${process.env.FACTOR_KEY}/SMS/${phone}/AUTOGEN`;

    const r = await axios.get(url);

    console.log("📨 2Factor Response:", r.data);

    if (r.data.Status !== "Success") {
      return res.status(400).json({
        success: false,
        message: "2Factor error",
        details: r.data
      });
    }

    return res.json({
      success: true,
      session: r.data.Details,
      message: "OTP sent successfully"
    });

  } catch (err) {
    console.error("❌ SEND OTP ERROR:", err?.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: err?.response?.data || err.message
    });
  }
});

// -------------------------
// VERIFY OTP
// -------------------------
app.post("/verify-otp", async (req, res) => {
  try {
    const { session, otp } = req.body;

    if (!session || !otp) {
      return res.status(400).json({ success: false, message: "Session & OTP required" });
    }

    console.log("🔍 Verifying OTP:", otp, "Session:", session);

    const url = `https://2factor.in/API/V1/${process.env.FACTOR_KEY}/SMS/VERIFY/${session}/${otp}`;

    const r = await axios.get(url);

    console.log("✔ VERIFY RESPONSE:", r.data);

    return res.json({
      success: r.data.Details === "OTP Matched",
      message: r.data.Details
    });

  } catch (err) {
    console.error("❌ VERIFY OTP ERROR:", err?.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: err?.response?.data || err.message
    });
  }
});

// -------------------------
// RENDER PORT FIX
// -------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n✅ Server running on PORT ${PORT}`);
  console.log(`➡ API URL: https://two4-server-3nuc.onrender.com/send-otp\n`);
});
