export default function CaseStudy() {
  return (
    <section
      style={{
        backgroundColor: "var(--color-primary)",
        color: "var(--color-primary-foreground)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "64px 16px",
        gap: 32,
      }}
    >
      <div style={{ flex: "0 0 300px" }}>
        <div
          style={{
            width: 320,
            height: 320,
            // note the color transform with from() - create a bright hue based on the primary color
            background: "oklch(from var(--color-primary) calc(l + 0.11) c h)",
            borderRadius: "16px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <img
            src="https://images.ctfassets.net/s6w71u4wlhmg/3TBjD1F6uQZDUQFPWlDdH2/1b2ada70860f8a6267e9eb9c56a5457e/equinox-v-bike-retail-2.webp?w=800&q=80&fm=webp"
            alt="Case Study"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
      <div style={{ maxWidth: 480 }}>
        
        <p
          style={{
            fontFamily: "var(--font-family-subheader)",
            color: "var(--color-primary-foreground)",
            fontSize: 14,
            fontWeight: 800,
            opacity: 0.8,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          Soulcycle by Equinox
        </p>
        <h2
          style={{
            fontFamily: "var(--font-family-header-h2)",
            fontSize: 28,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          Unlock your sanctuary with the SoulCycle at-home bike.
        </h2>
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <button
            style={{
              backgroundColor: "white",
              fontFamily: "var(--font-family-subheader)",
              color: "#1F4C43",
              border: "none",
              borderRadius: 4,
              padding: "8px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Read case study
          </button>
        </div>
        <div style={{ display: "flex", gap: 32, color: "oklch(from var(--color-primary) calc(l + 0.4) c h)" }}>
          <div>
            <span
              style={{
                fontFamily: "var(--font-family-header-h3)",
                fontSize: 48,
                fontWeight: 700,
                margin: 0,
                lineHeight: 1,
              }}
            >
              30%
            </span>
            <p style={{ fontFamily: "var(--font-family-subheader)", margin: 0 }}>
              Cardio Fitness
            </p>
          </div>
          <div>
            <span
              style={{
                fontFamily: "var(--font-family-header-h3)",
                fontSize: 48,
                fontWeight: 700,
                margin: 0,
                lineHeight: 1,
              }}
            >
              78%
            </span>
            <p style={{ fontFamily: "var(--font-family-subheader)", margin: 0 }}>
              Increased Energy Levels Reported
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
