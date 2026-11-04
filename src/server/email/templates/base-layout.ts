import { APP_URL } from "@/commons/constants/env"

export interface BaseEmailLayoutOptions {
  title: string
  previewText: string
  bannerSvgPath?: string
  bannerSvgAlt?: string
  name?: string
  contentHtml: string
  highlightCardHtml?: string
  buttonText?: string
  buttonUrl?: string
  footerNote?: string
}

export function renderBaseEmailLayout(options: BaseEmailLayoutOptions): string {
  const {
    title,
    previewText,
    bannerSvgPath,
    bannerSvgAlt = "Ilustração Caloteiro",
    name = "Tubarão",
    contentHtml,
    highlightCardHtml,
    buttonText,
    buttonUrl = `${APP_URL}/painel`,
    footerNote,
  } = options

  const fullBannerUrl = bannerSvgPath
    ? bannerSvgPath.startsWith("http")
      ? bannerSvgPath
      : `${APP_URL}${bannerSvgPath.startsWith("/") ? "" : "/"}${bannerSvgPath}`
    : null

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    a:hover { opacity: 0.92; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; color: #f4f4f5;">
  <!-- Preview Text Oculto -->
  <div style="display: none; font-size: 1px; color: #09090b; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText}
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #09090b; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Container Principal do Email -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #18181b; border-radius: 20px; overflow: hidden; border: 1px solid #27272a; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);">
          
          <!-- Sessão 1: Banner / Ilustração se houver -->
          ${fullBannerUrl ? `
            <tr>
              <td align="center" style="background-color: #121214; padding: 28px 24px 16px 24px; border-bottom: 1px solid #27272a;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  <tr>
                    <td align="center">
                      <img 
                        src="${fullBannerUrl}" 
                        alt="${bannerSvgAlt}" 
                        width="100%" 
                        style="display: block; width: 100%; max-width: 300px; height: auto; max-height: 180px; object-fit: contain; margin: 0 auto;" 
                      />
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          ` : ""}

          <!-- Sessão 2: Header com Identidade Caloteiro e Título -->
          <tr>
            <td align="center" style="background: linear-gradient(180deg, #18181b 0%, #121214 100%); padding: 28px 28px 20px 28px; border-bottom: 1px solid #27272a;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; display: inline-block; margin-bottom: 8px;">
                      caloteiro<span style="color: #10b981;">.</span>
                    </span>
                    <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; line-height: 1.3;">
                      ${title}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sessão 3: Corpo Principal do Texto -->
          <tr>
            <td style="padding: 32px 30px 24px 30px; background-color: #18181b;">
              <h2 style="margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 700; line-height: 1.3;">
                Fala, ${name}!
              </h2>

              <div style="color: #d4d4d8; font-size: 14px; line-height: 1.65; margin-bottom: 24px;">
                ${contentHtml}
              </div>

              <!-- Card de Destaque / Resumo -->
              ${highlightCardHtml ? `
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #121214; border: 1px solid #27272a; border-radius: 14px; margin-bottom: 26px; padding: 18px;">
                  <tr>
                    <td>
                      ${highlightCardHtml}
                    </td>
                  </tr>
                </table>
              ` : ""}

              <!-- Botão Principal de Ação (CTA) -->
              ${buttonText ? `
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 16px 0;">
                  <tr>
                    <td align="center">
                      <a href="${buttonUrl}" style="display: inline-block; background-color: #10b981; color: #09090b; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3); text-align: center; letter-spacing: 0.2px;">
                        ${buttonText}
                      </a>
                    </td>
                  </tr>
                </table>
              ` : ""}

              ${footerNote ? `
                <p style="margin: 20px 0 0 0; font-size: 12px; color: #71717a; line-height: 1.5; text-align: center; font-family: monospace;">
                  ${footerNote}
                </p>
              ` : ""}
            </td>
          </tr>

          <!-- Sessão 4: Rodapé Oficial Caloteiro -->
          <tr>
            <td style="background-color: #121214; border-top: 1px solid #27272a; padding: 24px 28px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #34d399; font-weight: 700;">
                Caloteiro • Cada centavo na pista tem seu dono
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #71717a; line-height: 1.5;">
                Cobrança sem constrangimento, controle absoluto e precisão cirúrgica.<br/>
                Dúvidas ou suporte? Conte com a gente no painel do sistema.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
