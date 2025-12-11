export default function Testimonial() {
  return (
    <section
      style={{
        backgroundColor: "--var(--color-background, #ffffff)",
        padding: "80px 16px",
        textAlign: "center",
      }}
    >
      <blockquote
        style={{
          fontFamily: "var(--font-family-subheader)",
          fontSize: 24,
          fontWeight: 500,
          lineHeight: 1.2,
          maxWidth: "50ch",
          margin: "0 auto 1em",
        }}
      >
        “Being able to keep moving all winter has been amazing. Our coach has leveled up my whole team.”
      </blockquote>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <img
          src="https://images.ctfassets.net/s6w71u4wlhmg/5RlaPfOeZ1hsza69OVYmJW/d7c84a68e5a78ece70f2bc56500796ad/avatar-with-alpha-sm.webp?fit=thumb&w=128&h=128&f=face&fm=webp"
          alt="Todd Bonzalez"
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            marginBottom: 8,
            backgroundColor: "var(--color-primary)"
          }}
        />
        <p
          style={{
            backgroundColor: "--var(--color-foreground, #ffffff)",
            fontFamily: "var(--font-family-body)",
            margin: 0,
            fontWeight: 600,
            fontStyle: "italic",
            fontSize: "1.3rem",
          }}
        >
          Todd Bonzalez
        </p>
        <p
          style={{
            backgroundColor: "--var(--color-foreground, #ffffff)",
            fontFamily: "var(--font-family-subheader)",
            margin: 0,
          }}
        >
          Digital Experience Lead
        </p>
      </div>
    </section>
  );
}
