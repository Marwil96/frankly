import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Img,
  Hr,
} from "@react-email/components";

interface ReviewRequestEmailProps {
  appUrl: string;
  token: string;
  customerName: string;
  productName: string;
  productImage: string | null;
  strings: {
    greeting: string;
    body: string;
    cta: string;
    unsubscribe: string;
  };
}

export function ReviewRequestEmail({
  appUrl,
  token,
  customerName,
  productName,
  productImage,
  strings,
}: ReviewRequestEmailProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <Html lang="en">
      <Head />
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {productImage && (
            <Section style={imageSection}>
              <Img
                src={productImage}
                alt={productName}
                width="200"
                height="200"
                style={productImageStyle}
              />
            </Section>
          )}

          <Section style={contentSection}>
            <Text style={greetingStyle}>{strings.greeting}</Text>
            <Text style={bodyTextStyle}>{strings.body}</Text>
          </Section>

          <Section style={ctaSection}>
            <Text style={ctaTextStyle}>{strings.cta}</Text>
            <table
              cellPadding="0"
              cellSpacing="0"
              style={{ margin: "0 auto" }}
            >
              <tbody>
                <tr>
                  {stars.map((n) => (
                    <td key={n} style={{ padding: "0 6px" }}>
                      <Link
                        href={`${appUrl}/review?token=${token}&rating=${n}`}
                        style={starLinkStyle}
                      >
                        {"\u2605"}
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={hrStyle} />

          <Section style={footerSection}>
            <Link
              href={`${appUrl}/api/unsubscribe?token=${token}`}
              style={unsubscribeLinkStyle}
            >
              {strings.unsubscribe}
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const bodyStyle: React.CSSProperties = {
  backgroundColor: "#f6f6f6",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  margin: 0,
  padding: "40px 0",
};

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  maxWidth: "480px",
  margin: "0 auto",
  padding: "40px 32px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
};

const imageSection: React.CSSProperties = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const productImageStyle: React.CSSProperties = {
  borderRadius: "8px",
  objectFit: "cover" as const,
};

const contentSection: React.CSSProperties = {
  marginBottom: "24px",
};

const greetingStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: 600,
  color: "#1a1a1a",
  margin: "0 0 12px 0",
};

const bodyTextStyle: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#4a4a4a",
  margin: 0,
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
  marginBottom: "32px",
};

const ctaTextStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#6b6b6b",
  marginBottom: "16px",
};

const starLinkStyle: React.CSSProperties = {
  display: "inline-block",
  width: "48px",
  height: "48px",
  lineHeight: "48px",
  fontSize: "28px",
  textAlign: "center" as const,
  textDecoration: "none",
  color: "#f5a623",
  backgroundColor: "#fef9ee",
  borderRadius: "8px",
  border: "1px solid #f5d89a",
};

const hrStyle: React.CSSProperties = {
  borderColor: "#e8e8e8",
  margin: "0 0 16px 0",
};

const footerSection: React.CSSProperties = {
  textAlign: "center" as const,
};

const unsubscribeLinkStyle: React.CSSProperties = {
  fontSize: "12px",
  color: "#999999",
  textDecoration: "underline",
};
