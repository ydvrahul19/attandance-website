// ================= SETTINGS – edit these =================

// Gym location and allowed distance (metres)
export const GYM = {
  lat: 26.91570989906567,
  lng: 75.75107099140486,
  radius: 100,
};

// WhatsApp group where attendance reports are posted
export const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/Ir3EYqdZzTJAEV4CMjWTEF";

// ----------------------------------------------------------------------
// TEMPORARY – FOR TESTING ONLY
// true  = shows the extra "Skip location check" button on Attendance start
// false = the button is gone completely; only the real location button remains
// Set this to false when testing is finished (then redeploy if the site is online).
// ----------------------------------------------------------------------
export const SHOW_TEST_BUTTON = true;
