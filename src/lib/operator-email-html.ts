/**
 * Pure-HTML E-Mail-Templates für Operator-Benachrichtigungen.
 * Kein React Email – damit kompatibel mit Horde Webmail und allen anderen Clients.
 */

const PINK = "#e6007e";
const DARK = "#111111";
const BG = "#ede8eb";
const LOGO = "https://ladyfitness-bremgarten.ch/images/logo.png";

function emailShell(previewText: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>${escHtml(previewText)}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

<!-- Preview text (hidden) -->
<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escHtml(previewText)}</div>

<!-- Outer wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BG};padding:32px 0;">
  <tr>
    <td align="center" valign="top">

      <!-- Card wrapper 580px -->
      <table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">

        <!-- ── HEADER dunkel mit Logo ── -->
        <tr>
          <td align="center" valign="middle" style="background-color:${DARK};padding:32px 40px;">
            <img src="${LOGO}" alt="Lady Fitness Bremgarten" width="150" height="auto"
                 style="display:block;border:0;outline:none;text-decoration:none;max-width:150px;" />
          </td>
        </tr>

        <!-- ── Pink-Akzentlinie ── -->
        <tr>
          <td style="background-color:${PINK};height:4px;font-size:0;line-height:4px;">&nbsp;</td>
        </tr>

        <!-- ── CONTENT weiss ── -->
        <tr>
          <td style="background-color:#ffffff;padding:40px 40px 32px;">
            ${bodyContent}
          </td>
        </tr>

        <!-- ── FOOTER dunkel ── -->
        <tr>
          <td align="center" style="background-color:#1a1a1a;padding:28px 40px;">
            <p style="margin:0 0 4px;font-size:15px;font-weight:bold;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">Lady Fitness Bremgarten</p>
            <p style="margin:0 0 4px;font-size:13px;color:rgba(255,255,255,0.55);font-family:Arial,Helvetica,sans-serif;">Zürcherstrasse 7, 5620 Bremgarten</p>
            <p style="margin:0 0 16px;font-size:13px;color:${PINK};font-family:Arial,Helvetica,sans-serif;">Tel. 056 631 68 09 &nbsp;·&nbsp; buchung@ladyfitness-bremgarten.ch</p>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="border-top:1px solid rgba(255,255,255,0.12);padding-top:12px;">
                <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.30);line-height:1.6;text-align:center;font-family:Arial,Helvetica,sans-serif;">
                  Diese E-Mail wurde automatisch erstellt. Bei Fragen antworten Sie direkt auf diese Nachricht<br />
                  oder kontaktieren Sie uns über die oben genannten Kanäle.
                </p>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- ── Bottom Pink-Linie ── -->
        <tr>
          <td style="background-color:${PINK};height:4px;font-size:0;line-height:4px;">&nbsp;</td>
        </tr>

      </table>
      <!-- /Card -->

    </td>
  </tr>
</table>
</body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function darkCard(content: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color:${DARK};margin:0 0 20px;">
      <tr>
        <td style="padding:22px 24px;">
          ${content}
        </td>
      </tr>
    </table>`;
}

function pinkBox(content: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="border-left:4px solid ${PINK};background-color:#f8f4f6;margin:0 0 20px;">
      <tr>
        <td style="padding:18px 20px;">
          ${content}
        </td>
      </tr>
    </table>`;
}

function ctaBox(content: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color:#1a1a1a;">
      <tr>
        <td style="padding:16px 20px;">
          ${content}
        </td>
      </tr>
    </table>`;
}

function fieldRow(label: string, value: string, valueColor = "#ffffff"): string {
  return `
    <p style="margin:10px 0 2px;font-size:10px;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.45);font-family:Arial,Helvetica,sans-serif;">${escHtml(label)}</p>
    <p style="margin:0;font-size:15px;color:${valueColor};line-height:1.4;font-family:Arial,Helvetica,sans-serif;">${escHtml(value)}</p>`;
}

/* ──────────────────────────────────────────────────── */
/*  KONTAKT – Operator                                  */
/* ──────────────────────────────────────────────────── */

export function generateOperatorContactHtml(p: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}): string {
  const preview = `Neue Anfrage: ${p.subject} — ${p.firstName} ${p.lastName}`;

  const body = `
    <!-- Eyebrow -->
    <p style="margin:0 0 10px;font-size:11px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;color:${PINK};font-family:Arial,Helvetica,sans-serif;">NEUE KONTAKTANFRAGE</p>

    <!-- Titel -->
    <p style="margin:0 0 8px;font-size:26px;font-weight:bold;color:${DARK};line-height:1.25;font-family:Arial,Helvetica,sans-serif;">&laquo;${escHtml(p.subject)}&raquo;</p>

    <p style="margin:0 0 24px;font-size:14px;color:#6b6b6b;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">
      Eingegangen über das Kontaktformular auf <span style="color:${PINK};">ladyfitness-bremgarten.ch</span>
    </p>

    ${darkCard(`
      <p style="margin:0 0 14px;font-size:10px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:${PINK};font-family:Arial,Helvetica,sans-serif;">Kontaktdaten</p>
      ${fieldRow("Name", `${p.firstName} ${p.lastName}`)}
      ${fieldRow("E-Mail", p.email, PINK)}
      ${fieldRow("Telefon", p.phone)}
      ${fieldRow("Betreff", p.subject)}
    `)}

    ${pinkBox(`
      <p style="margin:0 0 10px;font-size:10px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;color:${PINK};font-family:Arial,Helvetica,sans-serif;">Nachricht</p>
      <p style="margin:0;font-size:15px;color:#333333;line-height:1.7;white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;">${escHtml(p.message)}</p>
    `)}

    ${ctaBox(`
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
        Direkt auf diese E-Mail antworten oder im Admin-Bereich unter <strong style="color:#ffffff;">&laquo;Kontakte&raquo;</strong> weiterbearbeiten.
      </p>
    `)}
  `;

  return emailShell(preview, body);
}

/* ──────────────────────────────────────────────────── */
/*  BUCHUNG – Operator                                  */
/* ──────────────────────────────────────────────────── */

export function generateOperatorBookingHtml(p: {
  type: "PROBETRAINING" | "PERSONAL_TRAINING";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whenLabel: string;
  notes?: string | null;
}): string {
  const kind = p.type === "PROBETRAINING" ? "Probetraining" : "Personal Training";
  const badge = p.type === "PROBETRAINING" ? "NEUE BUCHUNG · PROBETRAINING" : "NEUE BUCHUNG · PERSONAL TRAINING";
  const preview = `Neue Buchung — ${kind}: ${p.firstName} ${p.lastName}`;

  const body = `
    <!-- Eyebrow -->
    <p style="margin:0 0 10px;font-size:11px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;color:${PINK};font-family:Arial,Helvetica,sans-serif;">${badge}</p>

    <!-- Titel -->
    <p style="margin:0 0 8px;font-size:26px;font-weight:bold;color:${DARK};line-height:1.25;font-family:Arial,Helvetica,sans-serif;">Neue Buchung eingegangen</p>

    <p style="margin:0 0 24px;font-size:14px;color:#6b6b6b;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">
      Ein Termin für <strong style="color:${DARK};">${escHtml(kind)}</strong> wurde über das Online-Buchungsformular reserviert.
    </p>

    <!-- Termin-Box -->
    <table width="100%" cellpadding="0" cellspacing="0" border="0"
           style="background-color:${DARK};margin:0 0 20px;">
      <tr>
        <td style="padding:22px 24px;">
          <p style="margin:0 0 8px;font-size:10px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:${PINK};font-family:Arial,Helvetica,sans-serif;">GEBUCHTER TERMIN</p>
          <p style="margin:0 0 4px;font-size:22px;font-weight:bold;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">${escHtml(p.whenLabel)}</p>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.55);font-family:Arial,Helvetica,sans-serif;">${escHtml(kind)}</p>
        </td>
      </tr>
    </table>

    ${darkCard(`
      <p style="margin:0 0 14px;font-size:10px;font-weight:bold;letter-spacing:0.18em;text-transform:uppercase;color:${PINK};font-family:Arial,Helvetica,sans-serif;">Kundendaten</p>
      ${fieldRow("Name", `${p.firstName} ${p.lastName}`)}
      ${fieldRow("E-Mail", p.email, PINK)}
      ${fieldRow("Telefon", p.phone)}
    `)}

    ${p.notes ? pinkBox(`
      <p style="margin:0 0 10px;font-size:10px;font-weight:bold;letter-spacing:0.14em;text-transform:uppercase;color:${PINK};font-family:Arial,Helvetica,sans-serif;">Mitteilung des Kunden</p>
      <p style="margin:0;font-size:15px;color:#333333;line-height:1.7;white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;">${escHtml(p.notes)}</p>
    `) : ""}

    ${ctaBox(`
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
        Buchung im Admin-Bereich unter <strong style="color:#ffffff;">&laquo;Buchungen&raquo;</strong> einsehen und verwalten.
        Dem Kunden wurde automatisch eine Bestätigungsmail zugestellt.
      </p>
    `)}
  `;

  return emailShell(preview, body);
}
